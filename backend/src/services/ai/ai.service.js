const { model, isAiEnabled } = require('../../config/ai');
const { buildPrompt } = require('./prompts');
const crypto = require('crypto');

// --- IN-MEMORY STORAGE (Simple Map for MVP) ---
// Note: In production, use Redis. For now per requirements, simple map is fine.
// LIMITATION: Resets on Server Restart.
const rateLimitMap = new Map(); // userId -> [timestamps]
const cacheMap = new Map(); // hashKey -> { response, timestamp }

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 Minute
const MAX_REQUESTS_PER_MINUTE = 10;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 Minutes (Eviction Rule)
const MIN_INPUT_LENGTH = 15;

// EXECUTION PRECEDENCE:
// 1. Safety Flag (503)
// 2. Input Guard (400)
// 3. Rate Limit (429)
// 4. Cache
// 5. Live Call

/**
 * Generate AI suggestion with strict safety guards.
 */
async function generateSuggestion(userId, context, promptId, input) {
  // 1. GLOBAL SAFETY SWITCH
  if (!isAiEnabled || !model) {
    throw { status: 503, message: "AI features are currently disabled." };
  }

  // 2. INPUT THRESHOLD GUARD
  if (!input || input.trim().length < MIN_INPUT_LENGTH) {
    throw { status: 400, message: `Input too short. Minimum ${MIN_INPUT_LENGTH} characters required.` };
  }

  // 3. RATE LIMITING (Per User)
  _checkRateLimit(userId);

  // 4. CACHE LOOKUP (Per User Scope)
  // Key = SHA256(userId + promptId + normalized_input)
  const cacheKey = _generateCacheKey(userId, promptId, input);
  if (cacheMap.has(cacheKey)) {
    const cachedEntry = cacheMap.get(cacheKey);
    if (Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
      console.log(`AI Service: Cache Hit for user ${userId}`);
      return { ...cachedEntry.response, _source: 'cache' };
    } else {
      cacheMap.delete(cacheKey); // Expired
    }
  }

  // 5. PROMPT CONSTRUCTION
  // This throws 400 if validation fails
  const promptText = buildPrompt(promptId, context, input);

  try {
    // 6. GEMINI CALL
    const result = await model.generateContent(promptText);
    const responseText = result.response.text();

    // 7. JSON PARSING & VALIDATION
    // We expect strict JSON from the model as per prompt instructions
    const jsonResponse = _parseStrictJSON(responseText);

    // 8. CACHE WRITE
    cacheMap.set(cacheKey, {
      response: jsonResponse,
      timestamp: Date.now()
    });

    return { ...jsonResponse, _source: 'live' };

  } catch (error) {
    console.error("AI Service Error:", error);
    // Map Gemini errors to our standard codes if needed, or rethrow
    throw { status: 500, message: "AI Processing Failed", details: error.message };
  }
}

// --- HELPERS ---

function _checkRateLimit(userId) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(userId) || [];
  
  // Filter out old timestamps
  const relevantTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  
  if (relevantTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    throw { status: 429, message: "Rate limit exceeded. Please try again later." };
  }

  relevantTimestamps.push(now);
  rateLimitMap.set(userId, relevantTimestamps);
}

function _generateCacheKey(userId, promptId, input) {
  const normInput = input.trim().toLowerCase();
  return crypto.createHash('sha256')
    .update(`${userId}:${promptId}:${normInput}`)
    .digest('hex');
}

function _parseStrictJSON(text) {
  try {
    // Clean potential markdown code blocks ```json ... ```
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    throw { status: 502, message: "AI returned invalid format.", details: text };
  }
}

module.exports = {
  generateSuggestion
};

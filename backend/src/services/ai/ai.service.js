const { model, ENABLE_AI } = require('../../config/ai');
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
  if (!ENABLE_AI || !model) {
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
    // ENFORCED DELAY (User Requirement: Minimum 2 seconds)
    await _delay(2000);

    // 6. GEMINI CALL
    const result = await model.generateContent(promptText);
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
        throw new Error("Empty response from Gemini.");
    }
    
    console.log("--- RAW AI RESPONSE START ---");
    console.log(responseText.substring(0, 1000)); // Log first 1000 chars
    console.log("--- RAW AI RESPONSE END ---");

    // 7. JSON PARSING & VALIDATION
    // We expect strict JSON from the model as per prompt instructions
    // 7. JSON PARSING & VALIDATION
    // We expect strict JSON from the model as per prompt instructions
    const rawJson = _parseStrictJSON(responseText);
    
    // 7.1 NORMALIZATION (Fix Model Inconsistencies)
    const normalizedResponse = _normalizeResponse(rawJson);

    // 8. CACHE WRITE
    cacheMap.set(cacheKey, {
      response: normalizedResponse,
      timestamp: Date.now()
    });

    return { ...normalizedResponse, _source: 'live' };

  } catch (error) {
    console.error("AI Service Error:", error);
    
    // Map Gemini/Network errors to standardized status codes
    if (error.message && (error.message.includes("429") || error.message.includes("Quota"))) {
         throw { status: 429, message: "Rate Limit Exceeded. Please wait 1 minute before retrying." };
    }
    
    if (error.status) throw error; // Re-throw known errors
    
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
  // v2.14: Logic Verified & Cleaned
  return crypto.createHash('sha256')
    .update(`${userId}:${promptId}:${normInput}:v2.14`)
    .digest('hex');
}

function _parseStrictJSON(text) {
  try {
    // 1. Regex to find the largest JSON object or array
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
       return JSON.parse(jsonMatch[0]);
    }
    throw new Error("No JSON found");
  } catch (e) {
    console.error("JSON Parse Failed on:", text);
    throw { status: 502, message: "AI returned invalid JSON format.", details: text.slice(0, 200) };
  }
}

function _normalizeResponse(json) {
    let rawList = [];

    // 1. Extract Array (Aggressive Search)
    if (Array.isArray(json)) {
        rawList = json;
    } else if (json.suggestions && Array.isArray(json.suggestions)) {
        rawList = json.suggestions;
    } else if (json.items && Array.isArray(json.items)) {
        rawList = json.items; 
    } else {
        // Fallback A: Look for *any* key holding an array
        const possibleArray = Object.values(json).find(v => Array.isArray(v));
        if (possibleArray) {
            rawList = possibleArray;
        } else {
            // Fallback B: Handle Map/Dictionary style { "1": {...}, "2": {...} }
            // Filter out primitives, keep objects that look like suggestions
            const vals = Object.values(json).filter(v => 
                v && typeof v === 'object' && !Array.isArray(v) && 
                (v.title || v.Title || v.description || v.goal || v.name)
            );
            if (vals.length > 0) rawList = vals;
        }
    }

    // Guard: If still empty, try wrapping the root object itself if it looks like a single suggestion
    if (rawList.length === 0 && (json.title || json.suggestion)) {
        rawList = [json];
    }
    
    // 2. Map & Clean
    let cleanedSuggestions = rawList.map((s, idx) => {
        let stakeholders = s.stakeholders || s.stakeholders_involved || s.Stakeholders || [];
        // Force Array
        if (typeof stakeholders === 'string') {
             stakeholders = stakeholders.split(',').map(str => str.trim());
        }
        if (!Array.isArray(stakeholders)) {
             stakeholders = [];
        }

        // Flexible Title/Description Mapping
        const title = s.title || s.Title || s.name || s.Name || s.project || s.Project || s.proposal || s.Proposal ||
                      s.goal || s.Goal || s.strategy || s.Strategy || 
                      s.activity || s.Activity || s.activities || s.Activities || 
                      s.risk || s.Risk || s.indicator || s.Indicator || s.kpi || s.KPI || 
                      s.metric || s.Metric || s.measure || s.Measure ||
                      s.suggestion || s.Suggestion ||
                      "Untitled Suggestion";
        
        const description = s.description || s.Description || s.details || s.Details || s.summary || s.Summary || s.explanation || s.Explanation || "No description provided.";

        // Normalize Values (Impact/Cost)
        let impact = s.impact || s.Impact || "Medium";
        if (typeof impact === 'string') {
            if (impact.toLowerCase().includes('high')) impact = "High";
            else if (impact.toLowerCase().includes('low')) impact = "Low";
            else impact = "Medium";
        } else { impact = "Medium"; }

        let cost = s.cost || s.Cost || "Medium";
        if (typeof cost === 'string') {
            if (cost.toLowerCase().includes('high')) cost = "High";
            else if (cost.toLowerCase().includes('low')) cost = "Low";
            else cost = "Medium";
        } else { cost = "Medium"; }

        return {
            id: s.id || `gen_${Date.now()}_${idx}`,
            title: title,
            description: description,
            primary_tag: s.primary_tag || s.tag || s.Tag || "General",
            stakeholders: stakeholders,
            impact: impact,
            cost: cost,
            confidence: s.confidence || 0.8
        };
    });

    // 3. Deduplicate (by Title)
    const seen = new Set();
    cleanedSuggestions = cleanedSuggestions.filter(s => {
        const key = s.title.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // 4. Limit (REMOVED - User wants 6)
    // cleanedSuggestions = cleanedSuggestions.slice(0, 3);

    // 5. Diversify
    const uniqueImpacts = new Set(cleanedSuggestions.map(s => s.impact));
    const uniqueCosts = new Set(cleanedSuggestions.map(s => s.cost));

    if (uniqueImpacts.size === 1 || uniqueCosts.size === 1) {
        cleanedSuggestions = _applyDiversificationHeuristics(cleanedSuggestions);
    }

    if (cleanedSuggestions.length === 0) {
        // Fallback: This usually happens if regex matched but structure was empty
        throw { status: 502, message: "AI returned no valid suggestions. Please try again." };
    }

    return { suggestions: cleanedSuggestions };
}

function _applyDiversificationHeuristics(suggestions) {
    return suggestions.map(s => {
        const text = (s.description + " " + s.title).toLowerCase();
        let newImpact = s.impact;
        let newCost = s.cost;

        // User-defined Heuristics
        if (text.match(/implement|establish|create|build|infrastructure/)) {
            newImpact = "High";
            newCost = "High";
        } else if (text.match(/analyze|assess|study|review|plan/)) {
            newImpact = "Medium";
            newCost = "Medium";
        } else if (text.match(/educate|train|workshop|awareness|campaign/)) {
            // "High Impact, Low Cost" is often desired, but per rule:
            newImpact = "Medium"; 
            newCost = "Low";
        } else if (text.match(/policy|regulate|compliance/)) {
            newImpact = "High";
            newCost = "Low"; 
        }

        return { ...s, impact: newImpact, cost: newCost };
    });
}


function _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  generateSuggestion
};

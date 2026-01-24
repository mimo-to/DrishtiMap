const { model, ENABLE_AI } = require('../../config/ai');
const { buildPrompt } = require('./prompts');
const crypto = require('crypto');

const rateLimitMap = new Map();
const cacheMap = new Map();


const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_MINUTE = 10;
const CACHE_TTL_MS = 10 * 60 * 1000;
const MIN_INPUT_LENGTH = 15;



async function generateSuggestion(userId, context, promptId, input) {

  if (!ENABLE_AI || !model) {
    throw { status: 503, message: "AI features are currently disabled." };
  }


  if (!input || input.trim().length < MIN_INPUT_LENGTH) {
    throw { status: 400, message: `Input too short. Minimum ${MIN_INPUT_LENGTH} characters required.` };
  }


  _checkRateLimit(userId);


  const cacheKey = _generateCacheKey(userId, promptId, input);
  if (cacheMap.has(cacheKey)) {
    const cachedEntry = cacheMap.get(cacheKey);
    if (Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
      console.log(`AI Service: Cache Hit for user ${userId}`);
      return { ...cachedEntry.response, _source: 'cache' };
    } else {
      cacheMap.delete(cacheKey);
    }
  }


  const promptText = buildPrompt(promptId, context, input);

  try {

    await _delay(2000);


    const result = await model.generateContent(promptText);
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
        throw new Error("Empty response from Gemini.");
    }
    
    console.log("--- RAW AI RESPONSE START ---");
    console.log(responseText.substring(0, 1000));
    console.log("--- RAW AI RESPONSE END ---");


    const rawJson = _parseStrictJSON(responseText);
    

    const normalizedResponse = _normalizeResponse(rawJson);


    cacheMap.set(cacheKey, {
      response: normalizedResponse,
      timestamp: Date.now()
    });

    return { ...normalizedResponse, _source: 'live' };

  } catch (error) {
    console.error("AI Service Error:", error);
    

    if (error.message && (error.message.includes("429") || error.message.includes("Quota"))) {
         throw { status: 429, message: "Rate Limit Exceeded. Please wait 1 minute before retrying." };
    }
    
    if (error.status) throw error;
    
    throw { status: 500, message: "AI Processing Failed", details: error.message };
  }
}



function _checkRateLimit(userId) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(userId) || [];
  

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
    .update(`${userId}:${promptId}:${normInput}:v2.14`)
    .digest('hex');
}

function _parseStrictJSON(text) {
  try {

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


    if (Array.isArray(json)) {
        rawList = json;
    } else if (json.suggestions && Array.isArray(json.suggestions)) {
        rawList = json.suggestions;
    } else if (json.items && Array.isArray(json.items)) {
        rawList = json.items; 
    } else {

        const possibleArray = Object.values(json).find(v => Array.isArray(v));
        if (possibleArray) {
            rawList = possibleArray;
        } else {
            const vals = Object.values(json).filter(v => 
                v && typeof v === 'object' && !Array.isArray(v) && 
                (v.title || v.Title || v.description || v.goal || v.name)
            );
            if (vals.length > 0) rawList = vals;
        }
    }


    if (rawList.length === 0 && (json.title || json.suggestion)) {
        rawList = [json];
    }
    

    let cleanedSuggestions = rawList.map((s, idx) => {
        let stakeholders = s.stakeholders || s.stakeholders_involved || s.Stakeholders || [];

        if (typeof stakeholders === 'string') {
             stakeholders = stakeholders.split(',').map(str => str.trim());
        }
        if (!Array.isArray(stakeholders)) {
             stakeholders = [];
        }


        const title = s.title || s.Title || s.name || s.Name || s.project || s.Project || s.proposal || s.Proposal ||
                      s.goal || s.Goal || s.strategy || s.Strategy || 
                      s.activity || s.Activity || s.activities || s.Activities || 
                      s.risk || s.Risk || s.indicator || s.Indicator || s.kpi || s.KPI || 
                      s.metric || s.Metric || s.measure || s.Measure ||
                      s.suggestion || s.Suggestion ||
                      "Untitled Suggestion";
        
        const description = s.description || s.Description || s.details || s.Details || s.summary || s.Summary || s.explanation || s.Explanation || "No description provided.";


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


    const seen = new Set();
    cleanedSuggestions = cleanedSuggestions.filter(s => {
        const key = s.title.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });




    const uniqueImpacts = new Set(cleanedSuggestions.map(s => s.impact));
    const uniqueCosts = new Set(cleanedSuggestions.map(s => s.cost));

    if (uniqueImpacts.size === 1 || uniqueCosts.size === 1) {
        cleanedSuggestions = _applyDiversificationHeuristics(cleanedSuggestions);
    }

    if (cleanedSuggestions.length === 0) {

        throw { status: 502, message: "AI returned no valid suggestions. Please try again." };
    }

    return { suggestions: cleanedSuggestions };
}

function _applyDiversificationHeuristics(suggestions) {
    return suggestions.map(s => {
        const text = (s.description + " " + s.title).toLowerCase();
        let newImpact = s.impact;
        let newCost = s.cost;


        if (text.match(/implement|establish|create|build|infrastructure/)) {
            newImpact = "High";
            newCost = "High";
        } else if (text.match(/analyze|assess|study|review|plan/)) {
            newImpact = "Medium";
            newCost = "Medium";
        } else if (text.match(/educate|train|workshop|awareness|campaign/)) {
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

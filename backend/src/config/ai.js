require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- CONFIGURATION ---
const ENABLE_AI = process.env.ENABLE_AI === 'true';

let model = null;

if (ENABLE_AI) {
  const API_KEY = process.env.GOOGLE_API_KEY;
  const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  if (!API_KEY) {
    console.error("[AI Config] CRITICAL: ENABLE_AI is true, but GOOGLE_API_KEY is missing. Model remains NULL.");
  } else {
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      model = genAI.getGenerativeModel({ model: MODEL_NAME });
      
      console.log(`[AI Config] Success: Model initialized: ${MODEL_NAME}`);
    } catch (error) {
      console.error("[AI Config] FATAL: Failed to create Gemini model instance:", error.message);
      model = null;
    }
  }
} else {
  console.log("[AI Config] SKIPPED: AI is disabled (ENABLE_AI != true).");
}

module.exports = { 
  model, 
  ENABLE_AI 
};

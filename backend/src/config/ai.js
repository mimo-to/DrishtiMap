require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- CONFIGURATION ---
// 1. CommonJS Lock: This backend uses CommonJS (require/module.exports).
// 2. Env Guard: Explicitly check API Key existence.

const ENABLE_AI = process.env.ENABLE_AI === 'true';
const API_KEY = process.env.GOOGLE_API_KEY;
const MODEL_NAME = process.env.GEMINI_MODEL; // Read ONLY from Env

let model = null;

if (ENABLE_AI) {
  if (!API_KEY) {
    // GUARD: Do NOT initialize if key is missing.
    console.error("[AI Config] CRITICAL: ENABLE_AI is true, but GOOGLE_API_KEY is missing. Model remains NULL.");
  } else {
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      model = genAI.getGenerativeModel({ model: MODEL_NAME });
      console.log(`[AI Config] Success: Model '${MODEL_NAME}' initialized.`);
    } catch (error) {
      console.error("[AI Config] FATAL: Failed to create Gemini model instance:", error.message);
      model = null;
    }
  }
} else {
  console.log("[AI Config] SKIPPED: AI is disabled (ENABLE_AI != true).");
}

// Export Singleton
module.exports = { 
  model, 
  ENABLE_AI // Consistent Naming
};

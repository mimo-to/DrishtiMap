require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

const ENABLE_AI = process.env.ENABLE_AI === 'true';

let model = null;
let groq = null;

if (ENABLE_AI) {
  const GEMINI_KEY = process.env.GOOGLE_API_KEY;
  const GEMINI_MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  if (!GEMINI_KEY) {
    console.error("[AI Config] CRITICAL: GOOGLE_API_KEY missing. Gemini disabled.");
  } else {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_KEY);
      model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });
      console.log(`[AI Config] Success: Gemini initialized (${GEMINI_MODEL_NAME})`);
    } catch (error) {
      console.error("[AI Config] FATAL: Gemini init failed:", error.message);
    }
  }

  const GROQ_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_KEY) {
     console.warn("[AI Config] WARNING: GROQ_API_KEY missing. Groq features disabled.");
  } else {
     try {
         groq = new Groq({ apiKey: GROQ_KEY });
         console.log("[AI Config] Success: Groq initialized");
     } catch (err) {
         console.error("[AI Config] FATAL: Groq init failed:", err.message);
     }
  }

} else {
  console.log("[AI Config] SKIPPED: AI is disabled (ENABLE_AI != true).");
}

module.exports = { 
  model, 
  groq, 
  ENABLE_AI 
};

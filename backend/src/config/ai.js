const { GoogleGenerativeAI } = require("@google/generative-ai");

const isAiEnabled = process.env.ENABLE_AI === 'true';

// SAFETY: If AI is disabled via env flag, we export null to strictly prevent usage.
// This supports the "Zero AI" verification requirement.
let model = null;

if (isAiEnabled) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("WARNING: ENABLE_AI is true but GEMINI_API_KEY is missing. AI features will fail.");
  } else {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("AI Config: Gemini Client Initialized (gemini-1.5-flash)");
  }
} else {
  console.log("AI Config: AI Disabled (ENABLE_AI != true)");
}

module.exports = {
  isAiEnabled,
  model
};

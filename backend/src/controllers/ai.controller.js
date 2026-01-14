const aiService = require('../services/ai/ai.service');

/**
 * POST /api/ai/suggest
 * Body: { context: {}, promptId: "level.action", input: "..." }
 */
async function suggest(req, res) {
  try {
    const { context, promptId, input } = req.body;
    
    // Auth User ID from middleware (Clerk)
    const { userId } = req.auth; 

    if (!promptId || !input) {
      return res.status(400).json({ error: "Missing promptId or input" });
    }

    const result = await aiService.generateSuggestion(userId, context, promptId, input);
    
    // Return explicit 200 JSON
    res.json(result);

  } catch (error) {
    // Graceful Error Handling (Phase 6.3)
    // 400 (Input), 429 (Rate), 503 (Disabled)
    const status = error.status || 500;
    const message = error.message || "Internal AI Error";
    
    // Log internal errors but show clean message to user
    if (status === 500) console.error("AI Controller Error:", error);

    res.status(status).json({ error: message, details: error.details });
  }
}

module.exports = {
  suggest
};

const aiService = require('../services/ai/ai.service');


async function suggest(req, res) {
  try {
    const { context, promptId, input } = req.body;
    const { userId } = req.auth;
    

    if (!promptId || !input) {
      return res.status(400).json({ error: "Missing promptId or input" });
    }

    const result = await aiService.generateSuggestion(userId, context, promptId, input);
    

    res.json(result);

  } catch (error) {

    const status = error.status || 500;
    const message = error.message || "Internal AI Error";
    

    if (status === 500) console.error("AI Controller Error:", error);

    res.status(status).json({ error: message, details: error.details });
  }
}

module.exports = {
  suggest
};

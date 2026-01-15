const API_URL = 'http://localhost:5000/api/ai';

async function suggest(levelId, input, token, contextData = {}) {
  if (!token) {
    throw new Error("AI Service requires a valid auth token.");
  }
  
  // Construct promptId from level (e.g. "problem_statement" -> "problem_statement.suggest")
  // In a real app we might map this more robustly.
  const promptAction = 'suggest'; // Locked for now
  const promptId = `${levelId}.${promptAction}`;
  
  const response = await fetch(`${API_URL}/suggest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      input,
      promptId, // "level.action"
      context: { 
        lfaLevel: levelId,
        ...contextData // Pass full context (e.g. answers)
      }
    })
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    // If JSON parse fails, throw generic or text
    throw new Error(response.statusText || 'AI Service Error (Non-JSON)');
  }

  if (!response.ok) {
    // Backend returns { error: "...", details: "..." }
    // We want to show the 'error' field or 'details' if helpful.
    const message = data.error || data.message || 'AI Service Error';
    const details = data.details ? ` (${data.details})` : '';
    throw new Error(message + details);
  }

  return data;
}

export const aiService = {
  suggest
};

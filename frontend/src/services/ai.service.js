const API_URL = `${import.meta.env.VITE_API_URL}/ai`;

async function suggest(levelId, input, token, contextData = {}) {
  if (!token) {
    throw new Error("AI Service requires a valid auth token.");
  }
  
  const promptAction = 'suggest';
  const promptId = `${levelId}.${promptAction}`;
  
  const response = await fetch(`${API_URL}/suggest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      input,
      promptId,
      context: { 
        lfaLevel: levelId,
        ...contextData
      }
    })
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {

    throw new Error(response.statusText || 'AI Service Error (Non-JSON)');
  }

  if (!response.ok) {

    const message = data.error || data.message || 'AI Service Error';
    const details = data.details ? ` (${data.details})` : '';
    throw new Error(message + details);
  }

  return data;
}

export const aiService = {
  suggest,

    async generateResearch(projectId, token) {
        try {
            const response = await fetch(`${API_URL}/research`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ projectId })
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Research generation failed');
            }
            return data.report;
        } catch (error) {
            console.error('Research API Error:', error);
            throw error;
        }
    }
};

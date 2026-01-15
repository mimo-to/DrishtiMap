const { researchModel, model, ENABLE_AI } = require('../../config/ai');
const Project = require('../../models/Project');

/**
 * Generate Research Report Service
 * Aggregates project data and uses AI to generate a comprehensive strategic report.
 */
const generateResearchReport = async (projectId, userId) => {
    if (!ENABLE_AI) {
        throw new Error("AI is disabled.");
    }
    
    // Ensure at least one model is available
    if (!researchModel && !model) {
         throw new Error("No AI Models configured.");
    }

    // ... (fetching and aggregation remains same)

    // 1. Fetch Full Project Data
    // We need the raw document to access the flexible 'data' field
    const project = await Project.findOne({ _id: projectId, clerkUserId: userId });
    
    if (!project) {
        throw new Error("Project not found or access denied.");
    }

    // 2. Aggregate Data
    // We want to flatten the structure for the AI context window
    const projectData = project.data || {};
    const answers = projectData.answers || {};
    const selections = projectData.selectedSuggestions || {};

    // Helper to format selections
    const formatSelections = (levelId) => {
        const items = selections[levelId] || [];
        if (items.length === 0) return "None selected.";
        return items.map(i => `- ${i.suggestion || i.title}: ${i.description}`).join('\n');
    };

    // Helper to sanitize text for Mermaid
    const sanitizeForMermaid = (text) => {
        if (!text) return 'Problem';
        // Remove quotes, brackets, and newlines to prevent syntax errors
        return text.replace(/["\[\]\n\r]/g, ' ').substring(0, 40).trim() + (text.length > 40 ? '...' : '');
    };

    // Construct the Context Prompt
    const contextPrompt = `
    ROLE: You are a Senior Strategic Partner at a top-tier consulting firm (McKinsey/Bain style).
    TASK: Generate a "Comprehensive Strategic Project Report" for a client.
    CONTEXT: User has completed a 5-step strategic framework (DrishtiMap).
    
    --- DATA INPUT ---
    
    [LEVEL 1: CONTEXT]
    Problem: ${answers['q1_problem'] || 'N/A'}
    Stakeholders: ${answers['q1_stakeholders'] || 'N/A'}
    Insights:
    ${formatSelections('context')}

    [LEVEL 2: STRATEGY]
    Goal: ${answers['q2_impact'] || 'N/A'}
    Outcome: ${answers['q2_outcome'] || 'N/A'}
    Insights:
    ${formatSelections('strategy')}

    [LEVEL 3: OPERATION]
    Activities: ${answers['q3_activities'] || 'N/A'}
    Insights:
    ${formatSelections('operation')}

    [LEVEL 4: MEASURE]
    KPIs: ${answers['q4_indicators'] || 'N/A'}
    Insights:
    ${formatSelections('measure')}

    [LEVEL 5: LOGIC]
    Risks: ${answers['q5_assumptions'] || 'N/A'}
    Insights:
    ${formatSelections('logic')}
    
    --- QUALITY CONSTRAINTS (STRICT) ---
    1. NO JARGON: Do NOT use buzzwords like "synergy", "paradigm shift", "leverage", "holistic", "ecosystem". Use plain, direct language.
    2. ACTIONABLE: Every insight must be tied to a specific action. Avoid generic advice.
    3. DATA-DRIVEN: Use the specific "Activities" and "KPIs" provided in the input. Do not invent generic ones if real ones exist.
    
    --- VISUALIZATION REQUIREMENTS (CRITICAL) ---
    You MUST generate Mermaid.js diagrams. Follow these EXACT patterns to ensure syntax validity.
    
    [PATTERN 1: LOGIC FLOW]
    Use 'graph LR'. Nodes must have alphanumeric IDs (A, B, C). Labels must NOT contain double quotes.
    GOOD: A[Problem: High churn] --> B[Activity: Better retention]
    BAD: A["Problem: "High" churn"] --> B
    
    [PATTERN 2: GANTT CHART]
    Use 'gantt'. Use the user's specific "Activities" for task names.
    
    --- OUTPUT FORMAT ---
    Generate a "Comprehensive Strategic Project Report" in Markdown.
    
    # 1. Executive Summary
    (FAST Framework: Focus, Action, Strategy, Tactic. 3-5 bullet points.)
    
    # 2. Strategic Logic Flow
    (Visual Description: "How we move from Problem to Impact")
    \`\`\`mermaid
    graph LR
      A[Problem: ${sanitizeForMermaid(answers['q1_problem'])}] -->|Solves| B[Activity]
      B -->|Creates| C[Outcome]
      C -->|Achieves| D[Impact Goal]
      style A fill:#ffcccc,stroke:#333
      style D fill:#ccffcc,stroke:#333
    \`\`\`
    (Brief explanation of the flow)

    # 3. External Market Intelligence
    (3 Actionable Insights. NOT just trends. "Because X is happening, you should do Y.")
    
    # 4. Implementation Roadmap
    (A high-level timeline)
    \`\`\`mermaid
    gantt
       title Phased Implementation
       dateFormat YYYY-MM-DD
       section Launch
       Setup :active, p1, 2024-01-01, 30d
       section Operations
       [Insert User Activity 1] :p2, after p1, 60d
       section Growth
       [Insert User Activity 2] :p3, after p2, 45d
    \`\`\`
    
    # 5. Risk Assessment
    (Table of specific Risks vs Mitigation)

    FINAL CHECK: Review your Mermaid code. Ensure NO double quotes (") are inside node labels.
    `;

    try {
        // 3. Call AI
        // Direct call to main model
        if (!model) {
             throw new Error("AI Model not initialized.");
        }
        
        console.log("Generating Strategic Report using Main Model...");
        const result = await model.generateContent(contextPrompt);
        const response = await result.response;
        
        let text = response.text();

        // 4. VALIDATION & REPAIR
        // Check if Mermaid blocks exist. If not, append a default one to save the UI.
        const mermaidRegex = /```mermaid([\s\S]*?)```/g;
        if (!mermaidRegex.test(text)) {
            console.warn("AI failed to generate Mermaid diagrams. Appending fallback.");
            text += `\n\n# Appendix: Visual Summary\n\`\`\`mermaid\ngraph LR\nA[Problem] --> B[Solution]\nB --> C[Impact]\n\`\`\``;
        }

        return {
            reportMarkdown: text,
            generatedAt: new Date()
        };

    } catch (error) {
        console.error("AI Research Generation Failed:", error);
        throw new Error("Failed to generate research report from AI.");
    }
};

module.exports = {
    generateResearchReport
};

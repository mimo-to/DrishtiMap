const { model, groq, ENABLE_AI } = require('../../config/ai');
const Project = require('../../models/Project');

/**
 * HYPER-VISUAL Research Report Service
 * Architecture: Groq Research → Gemini Synthesis → Multi-Diagram Output
 */
const generateResearchReport = async (projectId, userId) => {
    if (!ENABLE_AI) throw new Error("AI is disabled.");
    if (!model) throw new Error("Primary AI Model (Gemini) not configured.");

    // 1. DATA EXTRACTION
    const project = await Project.findOne({ _id: projectId, clerkUserId: userId });
    if (!project) throw new Error("Project not found");

    let answers = {};
    if (project.data && project.data.answers) {
        answers = project.data.answers;
    } else if (project.data) {
        answers = project.data;
    }
    
    // Fallback checking
    if (!answers['q1_problem'] && answers['problemStatement']) {
        answers['q1_problem'] = answers['problemStatement'];
    }

    // FIX: Read selectedSuggestions from project.data (where frontend saves it)
    const aiData = (project.data && project.data.selectedSuggestions) ? project.data.selectedSuggestions : {};

    const formatSelections = (level) => {
        // useQuestStore saves structure: { levelId: ["Suggestion 1", "Suggestion 2"] }
        const levelSuggestions = aiData[level];
        if (!levelSuggestions || !Array.isArray(levelSuggestions) || levelSuggestions.length === 0) {
             return "No insights selected.";
        }
        return levelSuggestions.map(s => `• ${s}`).join('\n');
    };
    
    // Mermaid-safe string converter
    const sanitize = (str) => {
        if (!str) return "Node";
        // Remove quotes, parens, brackets to be safe
        return str.replace(/["()\[\]]/g, '').replace(/\n/g, ' ').slice(0, 30);
    };

    // 2. PHASE 1: GROQ DEEP RESEARCH
    let researchIntel = "Research phase skipped.";
    
    if (groq) {
        console.log("🔍 Phase 1: Groq Deep Research...");
        const researchPrompt = `
ROLE: Field Intelligence Analyst for Social Impact Projects

MISSION: Extract **actionable, hyper-local intelligence** from this project data.

PROJECT DETAILS:
Problem: ${answers['q1_problem']}
Impact Goal: ${answers['q2_impact']}
Activities: ${answers['q3_activities']}
Stakeholders: ${answers['q1_stakeholders']}

ANTI-HALLUCINATION RULES (CRITICAL):
- DO NOT invent specific government scheme names, budgets, or deadlines
- DO NOT cite specific statistics unless directly provided in project data
- DO NOT name specific locations (villages/districts) unless mentioned in project data
- If information is unavailable, use PLACEHOLDERS like "[Government Scheme TBD]", "[Baseline Metric: To Be Surveyed]"
- Label ALL estimates clearly as "Estimated" or "Projected"
- Use generic categories instead of specific names (e.g., "State-level digital education initiatives" NOT "K-DEM Program")

ANALYSIS REQUIREMENTS:

1. **GEOGRAPHIC INTELLIGENCE**
   - ONLY use locations explicitly mentioned in project data
   - If no locations provided → use "[Target Region: To Be Determined based on needs assessment]"
   
2. **RISK MATRIX** (Identify 4 contextual risks):
   - Political/Regulatory (generic, sector-appropriate)
   - Environmental/Climate (based on stated geography if any)
   - Financial/Resource
   - Social/Cultural

3. **OPPORTUNITY SCAN** (Find 3 trends):
   - Government schemes alignment → use GENERIC categories ("Rural health initiatives", "Digital literacy programs")
   - Technology adoption patterns → based on stated activities
   - Market/funding opportunities → use PLACEHOLDERS for specific funds

4. **INNOVATION EDGE** (1 Blue Ocean idea):
   - Untapped solution space based on stated problem
   - Differentiation strategy

5. **METRICS INTELLIGENCE**
   - Use "Projected" or "Estimated" labels for ALL numbers
   - Provide RANGES instead of exact figures (e.g., "500-800 beneficiaries" NOT "673 beneficiaries")
   - If no baseline data provided → use "[Baseline: To Be Surveyed]"

OUTPUT: Dense bullet points. No fluff. Intelligence-grade data. CONSERVATIVE estimates only.
        `;

        try {
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: researchPrompt }],
                model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
                temperature: 0.3,
            });
            researchIntel = completion.choices[0]?.message?.content || researchIntel;
            console.log("✓ Groq Research Complete");
        } catch (err) {
            console.warn("⚠ Groq Research Failed:", err.message);
        }
    }

    // 3. PHASE 2: GEMINI HYPER-VISUAL SYNTHESIS
    console.log("🎨 Phase 2: Generating Visual Report...");
    
    const visualPrompt = `
ROLE: Elite Strategy Consultant + Data Visualization Architect

TASK: Create a **MAXIMUM VISUAL** Strategic Report with 10+ interactive diagrams.

--- INPUT DATA ---

[USER CORE DATA]
Problem: ${answers['q1_problem'] || 'N/A'}
Impact: ${answers['q2_impact'] || 'N/A'}
Stakeholders: ${answers['q1_stakeholders'] || 'N/A'}
Activities: ${answers['q3_activities'] || 'N/A'}
KPIs: ${answers['q4_indicators'] || 'N/A'}

[USER AI SELECTIONS - STRATEGIC CONTEXT]
Context Analysis:
${formatSelections('q1_context') || formatSelections('context')}

Strategic Approach:
${formatSelections('q2_strategy') || formatSelections('strategy')}

Logic Framework:
${formatSelections('q3_logic') || formatSelections('logic')}

[ANALYST RESEARCH INTEL]
${researchIntel}

--- CRITICAL RULES ---
1. **MANDATORY**: Generate 8+ Mermaid diagrams
2. **NODE NAMES - CRITICAL**: 
   - Graph/Flowchart nodes MUST use bracket syntax: A[Label Text]
   - Node IDs must be single words (A, B1, Node1, etc.)
   - Labels can have spaces but MUST be inside brackets []
   - WRONG: Budget -->|35%| Purification Systems
   - CORRECT: Budget -->|35%| B[Purification Systems]
   - WRONG: A --> Water Treatment
   - CORRECT: A --> B[Water Treatment]
3. **NO SPECIAL CHARS**: Do NOT use parentheses (), or quotes "" in node labels.
4. **PIE CHARTS**: Keys MUST be double-quoted (e.g., "Item": 50).
5. **NO BAR CHARTS**: Use 'pie' or 'gantt' only. Do NOT use xychart/bar.
6. **SUBGRAPHS**: IDs must be OneWord (e.g., subgraph HighPower).
7. **STATE DIAGRAMS**: Use simple 'state "Label" as ID' syntax.
8. **GANTT TIMELINES**: Use RELATIVE timelines (Month 1-2, Month 3-4, Week 1-4) NOT absolute dates. Start from 2025-01-01 and use 'after' dependencies.
9. **NO QUADRANT CHARTS**: Do NOT use quadrantChart - use graph TD with subgraphs instead for risk matrices.
10. **VARIED TYPES**: mindmap, graph, gantt, pie, journey, timeline, stateDiagram-v2.

--- DIAGRAM TOOLKIT ---

**Stakeholder Ecosystem (Mindmap)**
\`\`\`mermaid
mindmap
  root((Project Core))
    Primary Stakeholders
      Teachers
      Students
    System Actors
      Officials
    Beneficiaries
      Communities
\`\`\`

**Theory of Change (Flow)**
\`\`\`mermaid
%%{init: {'theme':'base'}}%%
graph LR
  A[Input Activities] -->|70%| B[Outputs]
  A -->|30%| C[Side Effects]
  B -->|Leads to| D[Outcomes]
  C -->|Mitigation| D
  D -->|Achieves| E[Impact]
  style A fill:#e1f5ff
  style E fill:#c8e6c9
\`\`\`

**Risk Assessment Matrix (Graph)**
\`\`\`mermaid
graph TD
  subgraph HighImpact [High Impact Risks]
    A1[Funding Delays]
    A2[Policy Changes]
  end
  subgraph MediumImpact [Medium Impact Risks]
    B1[Weather Events]
    B2[Staff Turnover]
  end
  subgraph LowImpact [Low Impact Risks]
    C1[Minor Delays]
  end
  
  A1 --> M1[Mitigation: Diversify funding]
  A2 --> M2[Mitigation: Stakeholder engagement]
  B1 --> M3[Mitigation: Contingency plans]
  
  style A1 fill:#ef4444
  style A2 fill:#ef4444
  style B1 fill:#f59e0b
  style B2 fill:#f59e0b
  style C1 fill:#10b981
\`\`\`

**User Journey (Timeline)**
\`\`\`mermaid
journey
  title Beneficiary Transformation Path
  section Awareness
    Hear about program: 3: Community
    Attend orientation: 4: Participant
  section Engagement
    Join activities: 5: Participant
    Skill building: 5: Participant, Trainer
  section Impact
    Behavior change: 4: Participant
    Measurable outcome: 5: System
\`\`\`

**Progress Roadmap (Gantt)**
\`\`\`mermaid
gantt
  title Implementation Timeline
  dateFormat YYYY-MM-DD
  section Month 1-2
  Stakeholder mapping    :p1, 2025-01-01, 30d
  Baseline survey        :p2, after p1, 20d
  section Month 3-4
  Pilot launch          :p3, after p2, 45d
  Mid-term review       :crit, after p3, 15d
  section Month 5-6
  Scale-up              :p4, after p3, 60d
  Impact assessment     :milestone, after p4, 0d
\`\`\`

**Impact Distribution (Pie)**
\`\`\`mermaid
%%{init: {'theme':'dark'}}%%
pie
  title Expected Impact Areas
  "Student Learning" : 40
  "Teacher Capacity" : 30
  "System Strengthening" : 20
  "Community Engagement" : 10
\`\`\`

**Logic Model (Graph LR with Styling)**
\`\`\`mermaid
graph LR
  A[Problem] -->|Analysis| B[Root Causes]
  B -->|Design| C[Intervention]
  C -->|Action| D[Activities]
  D -->|Result| E[Outputs]
  E -->|Effect| F[Outcomes]
  F -->|Goal| G[Impact]
  
  style A fill:#ffcdd2,stroke:#c62828
  style C fill:#fff9c4,stroke:#f57f17
  style G fill:#c8e6c9,stroke:#2e7d32
  
  classDef process fill:#e1bee7,stroke:#6a1b9a
  class B,D,E,F process
\`\`\`

**Organizational Capacity (State Diagram)**
\`\`\`mermaid
stateDiagram-v2
  [*] --> Planning
  Planning --> Piloting
  Piloting --> Refinement
  state "Refinement Phase" as Refinement
  Refinement --> Piloting
  Piloting --> Scaling
  Scaling --> Sustaining
  Sustaining --> [*]
\`\`\`

**Stakeholder Power-Interest Grid (Graph TD)**
\`\`\`mermaid
graph TD
  subgraph HighPowerHighInterest [High Power, High Interest]
    A1[District Officials]
    A2[Funders]
  end
  subgraph HighPowerLowInterest [High Power, Low Interest]
    B1[State Govt]
  end
  subgraph LowPowerHighInterest [Low Power, High Interest]
    C1[Teachers]
    C2[Parents]
  end
  subgraph LowPowerLowInterest [Low Power, Low Interest]
    D1[Peripheral Groups]
  end
  
  style A1 fill:#4caf50
  style A2 fill:#4caf50
  style B1 fill:#ff9800
  style C1 fill:#2196f3
  style C2 fill:#2196f3
\`\`\`

**Financial Flow (Flow)**
\`\`\`mermaid
graph LR
  Budget[Total Budget] -->|40%| Personnel
  Budget -->|30%| Materials
  Budget -->|20%| Training
  Budget -->|10%| Monitoring
  Personnel --> Teachers
\`\`\`

--- FINAL REPORT STRUCTURE ---

**PROFESSIONAL FORMATTING RULES**:
1. Add inline citations after paragraphs mentioning government schemes/data: Use blockquote format with italics - Example: > *Source: [Relevant Portal - verify at official website]*
2. Use clean, professional language
3. Break long paragraphs into 2-3 sentences max
4. Use **bold** for key metrics and findings
5. Add horizontal rules (---) between major sections for visual separation

**CRITICAL INSTRUCTIONS**:
- DO NOT include an "Executive Insights Dashboard" section
- DO NOT include metrics cards or statistics dashboard  
- DO NOT include generic takeaways about diagrams, frameworks, or report structure
- Key Insights should contain ONLY actual research findings from the analyst intelligence

# 📊 Strategic Impact Report

## 🎯 Executive Summary
[2-3 punchy paragraphs synthesizing core insights + blue ocean strategy]

> *For government scheme verification, refer to Sources & References section at the end of this report.*

---

## 💡 Key Research Findings

**CRITICAL**: This section must contain ONLY the most important findings from the Groq research analysis. Include:
- Government schemes/initiatives identified (with generic categories or placeholders)
- Market opportunities and trends discovered
- Geographic/demographic insights from research
- Risk factors identified in the analysis
- Partnership opportunities found
- Each finding should include source references where applicable

Example format:
- **Government Alignment**: [Specific scheme category or placeholder like "State-level digital education initiatives" with link if available]
- **Market Opportunity**: [Trend identified from research with data if available]
- **Risk Factor**: [Specific risk from analyst intelligence]
- **Partnership Potential**: [Identified collaboration opportunities]

DO NOT include:
- Generic statements about stakeholder mapping
- References to diagrams or frameworks in the report
- Meta-commentary about the report structure
- Vague statements without research backing

---

## 🗺️ Project Ecosystem Map
\`\`\`mermaid
[Insert Stakeholder Mindmap]
\`\`\`

**Key Players**: [Brief analysis]

---

## 🔄 Theory of Change Framework
\`\`\`mermaid
[Insert Flowchart or Logic Model]
\`\`\`

**Assumptions**: [Critical dependencies]

---

## 👥 User Journey & Touchpoints
\`\`\`mermaid
[Insert Journey Diagram]
\`\`\`

---

## 📈 Implementation Roadmap
\`\`\`mermaid
[Insert Gantt Chart]
\`\`\`

**Critical Milestones**: [List 3-4 key dates]

---

## ⚠️ Risk Intelligence Matrix
\`\`\`mermaid
[Insert Quadrant Chart]
\`\`\`

### Risk Mitigation Strategies
1. **[Risk Category]**: [Action plan]
2. **[Risk Category]**: [Action plan]

---

## 💰 Resource Allocation
\`\`\`mermaid
[Insert Pie/Flow]
\`\`\`

---

## 🌐 Market Intelligence & Trends
[Incorporate analyst research. If missing or vague, use CONSERVATIVE sector trends with clear labeling]

### Opportunity Windows
- **Government Schemes**: Use GENERIC categories (\"State-level [sector] initiatives\") OR placeholders \"[Scheme Name: To Be Researched]\" - DO NOT invent specific program names or budgets
- **Tech Adoption**: Platform/tool recommendations based ONLY on stated activities
- **Partnership Potential**: Generic alliance types (\"Local NGOs\", \"Tech companies\") - use \"[Partner TBD]\" for specifics

---

## 🎓 Impact Distribution Model
\`\`\`mermaid
[Insert Pie Chart]
\`\`\`

---

## 🔧 Organizational Readiness
\`\`\`mermaid
[Insert State Diagram]
\`\`\`

**Capacity Gaps**: [Areas needing strengthening]

---

## 💡 Blue Ocean Strategy
[1 paragraph on untapped differentiation]

---

## 📊 KPI Dashboard
\`\`\`mermaid
[Insert Pie or Gantt]
\`\`\`

| Indicator | Baseline | Target | Timeline |
|-----------|----------|--------|----------|
| [Metric 1] | [Value] | [Value] | [Period] |
| [Metric 2] | [Value] | [Value] | [Period] |

---

## 🚀 Next Steps (Action Items)
1. ✅ [Immediate action]
2. 📅 [Week 1-2 priority]
3. 🎯 [Month 1 milestone]

---

## 📚 Sources & References

**Government Portals** (for further research & scheme verification):
- **India.gov.in** - National Portal of India (https://india.gov.in)
- **MyGov** - Citizen Engagement Platform (https://mygov.in)
- **Digital India Portal** - Digital transformation initiatives (https://digitalindia.gov.in)
- **Ministry of Health & Family Welfare** - Health schemes (https://mohfw.gov.in)
- **Ministry of Education** - Education programs (https://education.gov.in)
- **NITI Aayog** - Policy research & development (https://niti.gov.in)
- **State Government Portal** - [State-specific schemes - verify at respective state portal]

**Funding & Partnership Resources**:
- **CSR Portal** - Corporate Social Responsibility (https://csr.gov.in)
- **Startup India** - Innovation funding (https://startupindia.gov.in)
- **National Health Mission** - Health funding (https://nhm.gov.in)

> **Note**: All scheme names, budgets, and eligibility criteria should be verified directly from official government portals before application.

---

**VALIDATION CHECKLIST**:
- ✓ 10+ diagrams present
- ✓ No quotes in Mermaid Nodes (but YES in Pie keys)
- ✓ No spaces in subgraph IDs
- ✓ No xychart (use Pie instead)
- ✓ Actionable recommendations
`;

    try {
        const result = await model.generateContent(visualPrompt);
        const response = await result.response;
        let markdown = response.text();

        // QUALITY ASSURANCE
        const diagramCount = (markdown.match(/```mermaid/g) || []).length;
        console.log(`📊 Generated ${diagramCount} diagrams`);

        if (diagramCount < 5) {
            console.warn("⚠ Insufficient diagrams. Appending fallbacks...");
            markdown += `\n\n## 📌 Quick Visual Summary\n\`\`\`mermaid\ngraph LR\nA[${sanitize(answers['q1_problem'])}] --> B[Solution Activities]\nB --> C[Measurable Outcomes]\nC --> D[Systemic Impact]\nstyle A fill:#ffebee\nstyle D fill:#e8f5e9\n\`\`\``;
        }

        // PERSISTENCE (Step 2: Save to DB)
        if (!project.data) project.data = {};
        
        project.data.research = {
            markdown: markdown,
            generatedAt: new Date(),
            diagramCount: diagramCount
        };
        
        project.markModified('data');
        await project.save();

        return {
            reportMarkdown: markdown,
            generatedAt: new Date(),
            diagramCount: diagramCount
        };

    } catch (error) {
        console.error("❌ AI Generation Failed:", error);
        throw new Error("Failed to generate research report from AI.");
    }
};

module.exports = {
    generateResearchReport
};

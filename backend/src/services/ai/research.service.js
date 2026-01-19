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
ROLE: Professional Research Analyst & Intelligence Officer

MISSION: Conduct REAL, PROFESSIONAL-GRADE research to provide actionable intelligence with ACTUAL data, government schemes, statistics, and official sources.

PROJECT DETAILS:
Problem: ${answers['q1_problem']}
Impact Goal: ${answers['q2_impact']}
Activities: ${answers['q3_activities']}
Stakeholders: ${answers['q1_stakeholders']}

CRITICAL RESEARCH MANDATE:
Your job is to provide REAL, VERIFIABLE intelligence. This report will be used for actual project planning and funding proposals.

RESEARCH REQUIREMENTS:

1. **GOVERNMENT SCHEMES & PROGRAMS**
   - Identify ACTUAL government schemes relevant to this sector
   - Provide REAL scheme names (e.g., "PM-POSHAN", "Samagra Shiksha Abhiyan", "NRHM")
   - Include official website links (e.g., pmposhan.education.gov.in)
   - Mention budget allocations if known
   - Cite eligibility criteria and application processes
   - Examples: For education → Samagra Shiksha, NIPUN Bharat, PM SHRI
             For health → Ayushman Bharat, NRHM, Mission Indradhanush
             For rural dev → MGNREGA, PMAY-G, SBM-G

2. **REAL STATISTICS & DATA**
   - Use ACTUAL statistics from government reports, census data, NFHS, etc.
   - Cite specific numbers with sources (e.g., "NFHS-5 reports 67.1% literacy in rural areas")
   - Include baseline data from official surveys
   - Reference specific years and data sources
   - Examples: Census 2011, NFHS-5, ASER reports, UDISE+ data

3. **GEOGRAPHIC INTELLIGENCE**
   - If location mentioned → provide REAL demographic data for that region
   - District-level statistics (population, literacy, infrastructure)
   - State-specific schemes and initiatives
   - Regional challenges based on actual data
   - Climate and environmental factors for the geography

4. **SECTOR-SPECIFIC INTELLIGENCE**
   - Current government priorities in this sector
   - Recent policy changes and initiatives
   - Successful case studies from similar projects
   - Technology platforms being promoted (e.g., DIKSHA, eVIN, UMANG)
   - Funding windows and grant opportunities

5. **RISK INTELLIGENCE**
   - REAL challenges based on sector reports
   - Implementation bottlenecks from government audits
   - Regulatory requirements and compliance needs
   - Common failure points from similar projects

6. **PARTNERSHIP OPPORTUNITIES**
   - Actual NGOs, CSOs working in this space
   - Government departments to engage
   - Corporate CSR programs in this sector
   - International agencies and donors

7. **OFFICIAL SOURCES & LINKS**
   - Provide URLs to official government portals
   - Link to scheme guidelines and application forms
   - Reference official reports and publications
   - Include contact information for relevant departments

INTELLIGENCE FORMAT:
Organize findings into clear sections with bullet points. Each claim should be backed by:
- Source name (e.g., "Source: Ministry of Education, 2023")
- Official links where applicable
- Specific data points with years
- Geographic specificity when relevant

EXAMPLE OUTPUT STRUCTURE:
**Government Schemes Alignment**
- Samagra Shiksha Abhiyan: Centrally sponsored scheme for school education
  Budget: ₹37,383 crore (2023-24)
  Link: samagra.education.gov.in
  Relevance: Covers teacher training, digital education, infrastructure

**Demographic Intelligence**
- Target region literacy: 72.3% (Census 2011)
- School enrollment: 94.2% (UDISE+ 2022-23)
- Digital infrastructure: 45% schools with internet (NITI Aayog 2023)

**Risk Factors**
- Teacher absenteeism: 23.6% average (ASER 2022)
- Infrastructure gaps: 38% schools lack basic facilities (UDISE+)
- Funding delays: Average 4-6 months (CAG Report 2022)

OUTPUT: Dense, intelligence-grade research with REAL data, ACTUAL schemes, and OFFICIAL links. Be specific, be professional, be verifiable.
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
3. **NO SPECIAL CHARS - CRITICAL**: 
   - NEVER use parentheses () in ANY diagram labels
   - NEVER use quotes "" in node labels (except pie chart keys)
   - MINDMAPS: Especially critical - NO parentheses allowed
   - WRONG: GramVikas[Gram Vikas (Construction)]
   - CORRECT: GramVikas[Gram Vikas Construction]
   - WRONG: Teachers[Teachers (Primary)]
   - CORRECT: Teachers[Primary Teachers]
4. **PIE CHARTS**: Keys MUST be double-quoted (e.g., "Item": 50).
5. **NO BAR CHARTS**: Use 'pie' or 'gantt' only. Do NOT use xychart/bar.
6. **SUBGRAPHS**: IDs must be OneWord (e.g., subgraph HighPower).
7. **STATE DIAGRAMS**: Use simple 'state "Label" as ID' syntax.
8. **GANTT TIMELINES - CRITICAL SYNTAX**:
   - MUST include: title, dateFormat YYYY-MM-DD
   - Section names: Use relative periods (Week 1-2, Month 1, Month 2-3, Month 4-6)
   - Task format: TaskName :id, start, duration
   - Use 'after taskId' for dependencies
   - Example sections: "Week 1-2", "Month 1", "Month 2-3", "Month 4-6"
   - Example task: Initial Planning :w1, 2025-01-01, 14d
   - NO specific dates in task names or section names
   - Start from 2025-01-01 for first task only
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
- **TIMELINE FORMAT**: Use ONLY relative periods (Week 1-2, Month 1, Month 2-3) - NEVER use specific dates like "Day 4", "2026-01-21", or "January 21"
- DO NOT create duplicate "Critical Milestones" sections with specific dates

# 📊 Strategic Impact Report

## 🎯 Executive Summary
[2-3 punchy paragraphs synthesizing core insights + blue ocean strategy]

> *For government scheme verification, refer to Sources & References section at the end of this report.*

---

## 💡 Key Research Findings

**⚠️ MANDATORY SECTION - DO NOT SKIP ⚠️**

**CRITICAL - THIS SECTION IS MANDATORY**: You MUST extract and present REAL data from the analyst research above. Generate AT LEAST 5-8 findings. This section CANNOT be empty or generic.

1. **Government Schemes** - List ACTUAL scheme names with:
   - Official scheme name (e.g., "Samagra Shiksha Abhiyan")
   - Budget allocation if mentioned
   - Official website link (e.g., samagra.education.gov.in)
   - Relevance to this project

2. **Real Statistics** - Include ACTUAL data points:
   - Specific numbers with sources (e.g., "72.3% literacy - Census 2011")
   - Demographic data for the geography
   - Baseline metrics from official surveys
   - Year and source for each statistic

3. **Geographic Intelligence** - If location mentioned:
   - District/state-level demographics
   - Regional challenges with data
   - Local infrastructure statistics
   - Climate/environmental factors

4. **Market Opportunities** - Real trends:
   - Technology adoption rates
   - Funding windows currently open
   - Successful case studies
   - Partnership opportunities with actual organizations

5. **Risk Factors** - Evidence-based risks:
   - Implementation challenges from audit reports
   - Regulatory requirements
   - Common failure points with data
   - Mitigation strategies

**FORMAT**: Each finding should be presented professionally:
- Start with the main finding in bold
- Add supporting data and context
- End with source in blockquote format for visual separation

**EXAMPLE**:
- **Samagra Shiksha Abhiyan**: Centrally sponsored scheme for school education covering teacher training, digital education, and infrastructure development. Budget allocation of ₹37,383 crore for 2023-24.
  > *Source: Ministry of Education, 2023 - samagra.education.gov.in*

- **Regional Literacy**: Target region demonstrates 72.3% literacy rate with 94.2% school enrollment, indicating strong educational foundation.
  > *Source: Census 2011, UDISE+ 2022-23 - censusindia.gov.in*

- **Digital Infrastructure Gap**: Only 45% of schools have internet connectivity, presenting significant opportunity for digital transformation initiatives.
  > *Source: NITI Aayog Digital Infrastructure Report 2023 - niti.gov.in*

DO NOT include generic statements. ONLY use verified data from the analyst research above.

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

## 🎯 Implementation Pathway
\`\`\`mermaid
graph LR
  A[Phase 1: Planning] --> B[Phase 2: Pilot]
  B --> C[Phase 3: Scale Up]
  C --> D[Phase 4: Sustainability]
  
  A1[Stakeholder Mapping] -.-> A
  A2[Baseline Assessment] -.-> A
  
  B1[Training Programs] -.-> B
  B2[Pilot Testing] -.-> B
  
  C1[Expansion] -.-> C
  C2[Quality Monitoring] -.-> C
  
  D1[Impact Evaluation] -.-> D
  D2[Knowledge Transfer] -.-> D
  
  style A fill:#e3f2fd
  style B fill:#fff3e0
  style C fill:#e8f5e9
  style D fill:#f3e5f5
\`\`\`

**Critical Milestones**: [List key decision points and deliverables for each phase]

---

## 📈 Implementation Roadmap
\`\`\`mermaid
gantt
  title Project Timeline
  dateFormat YYYY-MM-DD
  section Week 1-2
  Initial Planning       :w1, 2025-01-01, 14d
  section Month 1
  Stakeholder Mapping    :m1, after w1, 15d
  section Month 2-3
  Pilot Implementation   :m2, after m1, 60d
  section Month 4-6
  Scale Up Phase         :m3, after m2, 90d
\`\`\`

**Timeline Note**: 
- Use ONLY relative periods: Week 1-2, Month 1, Month 2-3, Month 4-6
- DO NOT use specific dates like "Day 4", "Day 6", "2026-01-21"
- DO NOT create a separate "Critical Milestones" section with dates
- Keep milestones integrated within the Gantt chart sections

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
- **Government Schemes**: Use GENERIC categories ("State-level [sector] initiatives") OR placeholders "[Scheme Name: To Be Researched]" - DO NOT invent specific program names or budgets
- **Tech Adoption**: Platform/tool recommendations based ONLY on stated activities
- **Partnership Potential**: Generic alliance types ("Local NGOs", "Tech companies") - use "[Partner TBD]" for specifics

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

**CRITICAL**: List ALL sources cited in this report. Include:

1. **Government Schemes Mentioned** - For each scheme cited:
   - Scheme name
   - Official website URL
   - Ministry/Department
   - Example: Samagra Shiksha Abhiyan - samagra.education.gov.in (Ministry of Education)

2. **Data Sources** - For each statistic cited:
   - Report name and year
   - Official link if available
   - Example: Census 2011 - censusindia.gov.in
   - Example: NFHS-5 (2019-21) - rchiips.org/nfhs

3. **Government Portals** (General reference):
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

## 📝 Report Information

**Prepared for**: ${answers['q1_problem'] ? answers['q1_problem'].substring(0, 100) : 'Strategic Project Planning'}

**Generated**: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

---

**VALIDATION CHECKLIST**:
- ✓ 10+ diagrams present
- ✓ No quotes in Mermaid Nodes (but YES in Pie keys)
- ✓ No spaces in subgraph IDs
- ✓ No xychart (use Pie instead)
- ✓ Actionable recommendations

**FORMATTING GUIDELINES FOR SOURCES**:
- Use clean, professional citation format
- Place sources in blockquotes for visual separation
- Example: > *Source: Ministry of Education, Annual Report 2023 - education.gov.in*
- Keep inline citations concise and unobtrusive
`;

    // MERMAID SANITIZER FUNCTION
    const fixMermaidSyntax = (markdown) => {
        if (!markdown) return markdown;
        
        console.log("🧹 Sanitizing Markdown...");

        // 1. Remove "VALIDATION CHECKLIST" and everything after it
        const checklistMarker = "**VALIDATION CHECKLIST**:";
        if (markdown.includes(checklistMarker)) {
            markdown = markdown.split(checklistMarker)[0];
        }
        
        // Regex to find mermaid blocks: ```mermaid ... ```
        const mermaidRegex = /```mermaid([\s\S]*?)```/g;
        
        return markdown.replace(mermaidRegex, (match, code) => {
            // Keep the wrapper, clean the content
            let cleanCode = code
                // 1. Remove parentheses from Node Definitions: A[Label (Text)] -> A[Label Text]
                .replace(/\(/g, ' ')
                .replace(/\)/g, ' ')
                // 2. Fix potential broken arrows if AI adds spaces inside -.->
                .replace(/- \. - >/g, '-.->')
                // 3. Remove quotes in [Label "Text"] which might break flowcharts
                .replace(/\["([^"]*)"\]/g, '[$1]')
                // 4. Remove any other bracket text quotes " " inside brackets
                .replace(/\[.*?"(.*?)"\]/g, '[$1]')
                // 5. Remove "milestone" from Gantt charts
                .replace(/:\s*milestone\s*,/gi, ':')
                // 6. Fix "Scale-up" -> "Scale_up" in State Diagrams (Hyphens in IDs break it)
                // Replace hyphens in "Word-Word" patterns
                .replace(/\b([a-zA-Z]+)-([a-zA-Z]+)\b/g, '$1_$2')
                // 7. RESTORE Specific Keywords/Formats broken by rule #6
                .replace(/stateDiagram_v2/g, 'stateDiagram-v2') 
                .replace(/flowchart_v2/g, 'flowchart-v2');


            return `\`\`\`mermaid${cleanCode}\`\`\``;
        });
    };

    try {
        const result = await model.generateContent(visualPrompt);
        const response = await result.response;
        let markdown = response.text();
        
        // SANITIZE SYNTAX BEFORE SAVING
        markdown = fixMermaidSyntax(markdown);

        // QUALITY ASSURANCE
        const diagramCount = (markdown.match(/```mermaid/g) || []).length;
        console.log(`📊 Generated ${diagramCount} diagrams`);

        if (diagramCount < 5) {
            console.warn("⚠ Insufficient diagrams. Appending fallbacks...");
            markdown += `\n\n## 📌 Quick Visual Summary\n\`\`\`mermaid\ngraph LR\nA[${sanitize(answers['q1_problem'])}] --> B[Solution Activities]\nB --> C[Measurable Outcomes]\nC --> D[Systemic Impact]\nstyle A fill:#ffebee\nstyle D fill:#e8f5e9\n\`\`\``;
        }

        // Validate Key Research Findings section exists
        if (!markdown.includes('## 💡 Key Research Findings') && !markdown.includes('Key Research Findings')) {
            console.warn("⚠ Key Research Findings missing. Adding placeholder...");
            const keyFindingsSection = `\n\n## 💡 Key Research Findings\n\n- **Government Alignment**: Relevant government schemes and initiatives identified for this sector\n  > *Source: Based on project sector analysis*\n\n- **Implementation Opportunity**: Strong potential for impact based on stated activities and stakeholder engagement\n  > *Source: Project design analysis*\n\n- **Risk Consideration**: Standard implementation risks apply - stakeholder coordination, resource mobilization, timeline management\n  > *Source: Sector best practices*\n\n`;
            // Insert after Executive Summary
            markdown = markdown.replace(/(## 🎯 Executive Summary[\s\S]*?)(\n## )/i, `$1${keyFindingsSection}$2`);
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
        
        // Handle Quota Errors Specifically
        if (error.message.includes('429') || error.message.includes('Quota') || error.message.includes('quota')) {
            throw new Error('VS_QUOTA_EXCEEDED');
        }
        
        throw new Error(`Failed to generate research report from AI: ${error.message}`);
    }
};

module.exports = {
    generateResearchReport
};

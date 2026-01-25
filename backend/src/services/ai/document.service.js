const { model, ENABLE_AI } = require('../../config/ai');

const quotaTracker = {
    date: new Date().toDateString(),
    count: 0,
    MAX_DAILY: 20
};

const checkQuota = () => {
    const today = new Date().toDateString();
    
    if (quotaTracker.date !== today) {
        quotaTracker.date = today;
        quotaTracker.count = 0;
    }
    
    if (quotaTracker.count >= quotaTracker.MAX_DAILY) {
        const error = new Error('Daily AI quota exceeded');
        error.code = 'QUOTA_EXCEEDED';
        throw error;
    }
    
    quotaTracker.count++;
    console.log(`Quota: ${quotaTracker.count}/${quotaTracker.MAX_DAILY} used today`);
};

const buildExtractionPrompt = () => {
    return `You are analyzing a document about a social/development issue for a Logical Framework Approach (LFA) project.

TASK: Extract the following information from the document. If a field is not clearly mentioned, return an empty string for that field.

EXTRACT:
1. PROBLEM STATEMENT: The core issue or challenge described (1-2 sentences)
2. STAKEHOLDERS: Who is affected or involved? List all groups mentioned (comma-separated)
3. IMPACT GOALS: Desired outcomes, changes, or improvements mentioned
4. ACTIVITIES: Suggested interventions, actions, or solutions
5. INDICATORS: Any metrics, success measures, or KPIs mentioned
6. GEOGRAPHIC CONTEXT: Location, region, or area if specified

CRITICAL: Return ONLY valid JSON with these exact keys. Do not include any markdown formatting or code blocks.

{
  "q1_problem": "extracted problem statement here",
  "q1_stakeholders": "group1, group2, group3",
  "q2_impact": "extracted impact goals here",
  "q3_activities": "extracted activities here",
  "q4_indicators": "extracted indicators here",
  "geographic_context": "location if mentioned"
}`;
};

const validateExtractedData = (data) => {
    if (!data || typeof data !== 'object') {
        return false;
    }
    
    const hasContent = Object.values(data).some(value => 
        value && typeof value === 'string' && value.trim().length > 0
    );
    
    return hasContent;
};

const analyzeDocument = async (fileBuffer, mimeType) => {
    if (!ENABLE_AI) {
        throw new Error('AI is disabled');
    }
    
    if (!model) {
        throw new Error('Gemini model not configured');
    }
    
    checkQuota();
    
    try {
        console.log('Analyzing document with Gemini Flash Vision...');
        
        const base64Data = fileBuffer.toString('base64');
        
        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        };
        
        const prompt = buildExtractionPrompt();
        
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        
        console.log('Raw AI response:', text.substring(0, 200) + '...');
        
        try {
            const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            extractedData = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError.message);
            throw new Error('Failed to parse AI response as JSON');
        }
        
        if (!validateExtractedData(extractedData)) {
            throw new Error('No relevant information could be extracted from the document');
        }
        
        console.log('Successfully extracted data from document');
        
        return {
            success: true,
            extractedData: {
                q1_problem: extractedData.q1_problem || '',
                q1_stakeholders: extractedData.q1_stakeholders || '',
                q2_impact: extractedData.q2_impact || '',
                q3_activities: extractedData.q3_activities || '',
                q4_indicators: extractedData.q4_indicators || '',
                geographic_context: extractedData.geographic_context || ''
            },
            confidence: 'medium',
            documentType: mimeType.includes('pdf') ? 'pdf' : 'image'
        };
        
    } catch (error) {
        console.error('Document analysis failed:', error);
        
        if (error.code === 'QUOTA_EXCEEDED') {
            throw error;
        }
        
        if (error.message && error.message.includes('quota')) {
            const quotaError = new Error('Daily AI quota exceeded');
            quotaError.code = 'QUOTA_EXCEEDED';
            throw quotaError;
        }
        
        throw new Error(`Document analysis failed: ${error.message}`);
    }
};

const analyzeUrl = async (url) => {
    if (!ENABLE_AI) {
        throw new Error('AI is disabled');
    }
    
    if (!model) {
        throw new Error('Gemini model not configured');
    }
    
    checkQuota();
    
    try {
        console.log('Fetching URL content...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; DrishtiMap/1.0)'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }
        
        const html = await response.text();
        
        const cleanHtml = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        const contentToAnalyze = cleanHtml.substring(0, 10000);
        
        console.log('📄 Extracted content length:', contentToAnalyze.length);
        
        const prompt = buildExtractionPrompt();
        const fullPrompt = `${prompt}\n\nCONTENT TO ANALYZE:\n${contentToAnalyze}`;
        
        const result = await model.generateContent(fullPrompt);
        const responseText = await result.response;
        const text = responseText.text();
        
        console.log('Raw AI response:', text.substring(0, 200) + '...');
        

        let extractedData;
        try {
            const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            extractedData = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError.message);
            throw new Error('Failed to parse AI response as JSON');
        }
        

        if (!validateExtractedData(extractedData)) {
            throw new Error('No relevant information could be extracted from the URL');
        }
        
        console.log('Successfully extracted data from URL');
        
        return {
            success: true,
            extractedData: {
                q1_problem: extractedData.q1_problem || '',
                q1_stakeholders: extractedData.q1_stakeholders || '',
                q2_impact: extractedData.q2_impact || '',
                q3_activities: extractedData.q3_activities || '',
                q4_indicators: extractedData.q4_indicators || '',
                geographic_context: extractedData.geographic_context || ''
            },
            confidence: 'medium',
            documentType: 'url'
        };
        
    } catch (error) {
        console.error('URL analysis failed:', error);
        
        if (error.code === 'QUOTA_EXCEEDED') {
            throw error;
        }
        
        if (error.message && error.message.includes('quota')) {
            const quotaError = new Error('Daily AI quota exceeded');
            quotaError.code = 'QUOTA_EXCEEDED';
            throw quotaError;
        }
        
        throw new Error(`URL analysis failed: ${error.message}`);
    }
};

module.exports = {
    analyzeDocument,
    analyzeUrl,
    checkQuota,
    quotaTracker
};

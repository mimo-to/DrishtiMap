const { model, ENABLE_AI } = require('../../config/ai');

/**
 * Document Analysis Service
 * Uses Gemini Flash Vision to extract LFA-relevant information from PDFs and images
 */

// Simple in-memory quota tracker (resets daily)
const quotaTracker = {
    date: new Date().toDateString(),
    count: 0,
    MAX_DAILY: 20
};

const checkQuota = () => {
    const today = new Date().toDateString();
    
    // Reset counter if it's a new day
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
    console.log(`📊 Quota: ${quotaTracker.count}/${quotaTracker.MAX_DAILY} used today`);
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
    // Ensure we have an object
    if (!data || typeof data !== 'object') {
        return false;
    }
    
    // Check if at least one field has content
    const hasContent = Object.values(data).some(value => 
        value && typeof value === 'string' && value.trim().length > 0
    );
    
    return hasContent;
};

/**
 * Analyze a document using Gemini Flash Vision
 * @param {Buffer} fileBuffer - The file content as a buffer
 * @param {string} mimeType - MIME type of the file (e.g., 'application/pdf', 'image/jpeg')
 * @returns {Promise<Object>} Extracted data object
 */
const analyzeDocument = async (fileBuffer, mimeType) => {
    if (!ENABLE_AI) {
        throw new Error('AI is disabled');
    }
    
    if (!model) {
        throw new Error('Gemini model not configured');
    }
    
    // Check quota before processing
    checkQuota();
    
    try {
        console.log('🔍 Analyzing document with Gemini Flash Vision...');
        
        // Convert buffer to base64 for Gemini
        const base64Data = fileBuffer.toString('base64');
        
        // Prepare the multimodal content
        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        };
        
        const prompt = buildExtractionPrompt();
        
        // Generate content with vision
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        
        console.log('📄 Raw AI response:', text.substring(0, 200) + '...');
        
        // Parse JSON response
        let extractedData;
        try {
            // Remove markdown code blocks if present
            const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            extractedData = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error('❌ JSON parse error:', parseError.message);
            throw new Error('Failed to parse AI response as JSON');
        }
        
        // Validate extracted data
        if (!validateExtractedData(extractedData)) {
            throw new Error('No relevant information could be extracted from the document');
        }
        
        console.log('✅ Successfully extracted data from document');
        
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
            confidence: 'medium', // Could be enhanced with AI confidence scoring
            documentType: mimeType.includes('pdf') ? 'pdf' : 'image'
        };
        
    } catch (error) {
        console.error('❌ Document analysis failed:', error);
        
        // Handle quota errors specifically
        if (error.code === 'QUOTA_EXCEEDED') {
            throw error;
        }
        
        // Handle Gemini API errors
        if (error.message && error.message.includes('quota')) {
            const quotaError = new Error('Daily AI quota exceeded');
            quotaError.code = 'QUOTA_EXCEEDED';
            throw quotaError;
        }
        
        throw new Error(`Document analysis failed: ${error.message}`);
    }
};

/**
 * Analyze a URL by fetching its content and extracting information
 * @param {string} url - The URL to fetch and analyze
 * @returns {Promise<Object>} Extracted data object
 */
const analyzeUrl = async (url) => {
    if (!ENABLE_AI) {
        throw new Error('AI is disabled');
    }
    
    if (!model) {
        throw new Error('Gemini model not configured');
    }
    
    // Check quota before processing
    checkQuota();
    
    try {
        console.log('🔍 Fetching URL content...');
        
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        // Fetch the URL content
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
        
        // Extract text content from HTML (simple approach)
        // Remove script and style tags
        const cleanHtml = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ') // Remove HTML tags
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
        
        // Limit content length (Gemini has token limits)
        const contentToAnalyze = cleanHtml.substring(0, 10000);
        
        console.log('📄 Extracted content length:', contentToAnalyze.length);
        
        // Analyze with Gemini
        const prompt = buildExtractionPrompt();
        const fullPrompt = `${prompt}\n\nCONTENT TO ANALYZE:\n${contentToAnalyze}`;
        
        const result = await model.generateContent(fullPrompt);
        const responseText = await result.response;
        const text = responseText.text();
        
        console.log('📄 Raw AI response:', text.substring(0, 200) + '...');
        
        // Parse JSON response
        let extractedData;
        try {
            const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            extractedData = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error('❌ JSON parse error:', parseError.message);
            throw new Error('Failed to parse AI response as JSON');
        }
        
        // Validate extracted data
        if (!validateExtractedData(extractedData)) {
            throw new Error('No relevant information could be extracted from the URL');
        }
        
        console.log('✅ Successfully extracted data from URL');
        
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
        console.error('❌ URL analysis failed:', error);
        
        // Handle quota errors specifically
        if (error.code === 'QUOTA_EXCEEDED') {
            throw error;
        }
        
        // Handle Gemini API errors
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

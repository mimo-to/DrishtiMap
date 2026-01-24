const API_URL = `${import.meta.env.VITE_API_URL}/ai`;


async function uploadAndAnalyze(file, projectId, token) {
    if (!token) {
        throw new Error('Authentication required');
    }


    const formData = new FormData();
    formData.append('document', file);
    formData.append('projectId', projectId);

    const response = await fetch(`${API_URL}/analyze-document`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    const data = await response.json();

    if (!response.ok) {

        if (data.error === 'QUOTA_EXCEEDED') {
            throw new Error('Daily AI limit reached. Please try again tomorrow.');
        }
        if (data.error === 'FILE_TOO_LARGE') {
            throw new Error('File size exceeds 10MB limit');
        }
        if (data.error === 'INVALID_FILE_TYPE') {
            throw new Error('Only PDF, JPG, and PNG files are supported');
        }
        throw new Error(data.message || 'Failed to analyze document');
    }

    return data;
}


async function analyzeUrl(url, projectId, token) {
    if (!token) {
        throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/analyze-url`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, projectId })
    });

    const data = await response.json();

    if (!response.ok) {

        if (data.error === 'QUOTA_EXCEEDED') {
            throw new Error('Daily AI limit reached. Please try again tomorrow.');
        }
        if (data.error === 'INVALID_URL') {
            throw new Error('Invalid URL provided');
        }
        if (data.error === 'FETCH_FAILED') {
            throw new Error('Could not fetch content from URL. Please check the link.');
        }
        throw new Error(data.message || 'Failed to analyze URL');
    }

    return data;
}

export const documentService = {
    uploadAndAnalyze,
    analyzeUrl
};

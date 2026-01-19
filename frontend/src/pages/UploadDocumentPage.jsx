import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Upload, FileText, Image, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { documentService } from '@/services/document.service';
import { useQuestStore } from '@/quest/engine/useQuestStore';
import { Button } from '@/components/ui/Button';

const UploadDocumentPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const { prefillFromDocument } = useQuestStore();

    const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
    const [url, setUrl] = useState('');
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);

    // File validation
    const validateFile = (file) => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

        if (!allowedTypes.includes(file.type)) {
            throw new Error('Only PDF, JPG, and PNG files are supported');
        }

        if (file.size > maxSize) {
            throw new Error('File size must be less than 10MB');
        }

        return true;
    };

    // Handle file selection
    const handleFileSelect = (selectedFile) => {
        try {
            setError(null);
            validateFile(selectedFile);
            setFile(selectedFile);
        } catch (err) {
            setError(err.message);
            setFile(null);
        }
    };

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    };

    // Handle file input change
    const handleFileInputChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            handleFileSelect(selectedFile);
        }
    };

    // Upload and analyze
    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const token = await getToken();
            const result = await documentService.uploadAndAnalyze(file, projectId, token);

            // Pre-fill the quest form with extracted data
            if (result.success && result.extractedData) {
                prefillFromDocument(result.extractedData);

                // Auto-save the pre-filled data immediately
                console.log('💾 Auto-saving pre-filled data...');
                const saveResult = await useQuestStore.getState().saveProject(token);
                if (saveResult && saveResult.success) {
                    console.log('✅ Pre-filled data saved successfully');
                }
            }

            // Navigate to the first quest level
            navigate(`/quest/${projectId}/context`);

        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message);
            setIsUploading(false);
        }
    };

    // Analyze URL
    const handleUrlAnalysis = async () => {
        if (!url.trim()) return;

        setIsUploading(true);
        setError(null);

        try {
            const token = await getToken();
            const result = await documentService.analyzeUrl(url, projectId, token);

            // Pre-fill the quest form with extracted data
            if (result.success && result.extractedData) {
                prefillFromDocument(result.extractedData);

                // Auto-save the pre-filled data immediately
                console.log('💾 Auto-saving pre-filled data...');
                const saveResult = await useQuestStore.getState().saveProject(token);
                if (saveResult && saveResult.success) {
                    console.log('✅ Pre-filled data saved successfully');
                }
            }

            // Navigate to the first quest level
            navigate(`/quest/${projectId}/context`);

        } catch (err) {
            console.error('URL analysis error:', err);
            setError(err.message);
            setIsUploading(false);
        }
    };

    // Skip and go to manual entry
    const handleSkip = () => {
        navigate(`/quest/${projectId}/context`);
    };

    // Get file icon based on type
    const getFileIcon = () => {
        if (!file) return <Upload className="w-12 h-12 text-stone-400" />;
        if (file.type === 'application/pdf') return <FileText className="w-12 h-12 text-red-500" />;
        return <Image className="w-12 h-12 text-blue-500" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-teal-50">
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                            <Sparkles className="w-8 h-8 text-teal-700" />
                        </div>
                        <h1 className="text-3xl font-display font-bold text-stone-900 mb-2">
                            Kickstart Your Project
                        </h1>
                        <p className="text-stone-600 font-body">
                            Upload a document about your issue and let AI extract the key details
                        </p>
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setUploadMode('file')}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${uploadMode === 'file'
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'bg-white text-stone-600 border border-stone-200 hover:border-teal-300'
                                }`}
                        >
                            📄 Upload File
                        </button>
                        <button
                            onClick={() => setUploadMode('url')}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${uploadMode === 'url'
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'bg-white text-stone-600 border border-stone-200 hover:border-teal-300'
                                }`}
                        >
                            🔗 Paste URL
                        </button>
                    </div>

                    {/* Upload Area */}
                    {uploadMode === 'file' ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 mb-6">
                            <div
                                className={`
                                relative border-2 border-dashed rounded-xl p-12 text-center transition-all
                                ${isDragging ? 'border-teal-500 bg-teal-50' : 'border-stone-300 bg-stone-50'}
                                ${file ? 'border-green-500 bg-green-50' : ''}
                            `}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileInputChange}
                                    disabled={isUploading}
                                />

                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    {getFileIcon()}

                                    {file ? (
                                        <div className="mt-4">
                                            <p className="text-lg font-semibold text-stone-900">{file.name}</p>
                                            <p className="text-sm text-stone-500 mt-1">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="mt-4">
                                            <p className="text-lg font-semibold text-stone-900 mb-2">
                                                Drop your document here
                                            </p>
                                            <p className="text-sm text-stone-500 mb-4">
                                                or click to browse
                                            </p>
                                            <p className="text-xs text-stone-400">
                                                Accepted: PDF, JPG, PNG • Max 10MB
                                            </p>
                                        </div>
                                    )}
                                </label>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-6 flex gap-3">
                                <Button
                                    variant="primary"
                                    onClick={handleUpload}
                                    disabled={!file || isUploading}
                                    className="flex-1"
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Analyze & Continue
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 mb-6">
                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-sm font-medium text-stone-700 mb-2 block">
                                        Article or Report URL
                                    </span>
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://example.com/article"
                                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        disabled={isUploading}
                                    />
                                </label>
                                <p className="text-xs text-stone-500">
                                    Paste a link to a news article, blog post, or online report about your issue
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="mt-6">
                                <Button
                                    variant="primary"
                                    onClick={handleUrlAnalysis}
                                    disabled={!url.trim() || isUploading}
                                    className="w-full"
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Analyze & Continue
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Skip Option */}
                    <div className="text-center">
                        <button
                            onClick={handleSkip}
                            disabled={isUploading}
                            className="text-stone-600 hover:text-teal-700 font-medium transition-colors inline-flex items-center gap-2"
                        >
                            Skip & Fill Manually
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                        <h3 className="font-semibold text-blue-900 mb-2">💡 How it works</h3>
                        <ul className="text-sm text-blue-800 space-y-2">
                            <li>• Upload a news article, report, or photo about your issue</li>
                            <li>• AI extracts key information automatically</li>
                            <li>• Review and edit the pre-filled form</li>
                            <li>• Continue with your project setup</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadDocumentPage;

import React, { useState } from 'react';
import { X, Download, FileText, Printer, Share2, Maximize2, Minimize2, ChevronRight, Zap, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import SimpleMarkdown from './research/SimpleMarkdown';
import { sampleReport } from './research/sampleReport';
import './research/ResearchResult.css';

const ResearchResult = ({ report, onClose, projectTitle }) => {
    const [viewMode, setViewMode] = useState('preview');
    const [activeTab, setActiveTab] = useState('report');
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [showStats, setShowStats] = useState(true);


    const displayReport = report || sampleReport;


    const stats = {
        diagrams: (displayReport.match(/```mermaid/g) || []).length,
        sections: (displayReport.match(/^## /gm) || []).length,
        words: displayReport.split(/\s+/).length,
        readTime: Math.ceil(displayReport.split(/\s+/).length / 200)
    };


    const calculateDepth = () => {
        const wordScore = Math.min(60, (stats.words / 1000) * 60);
        const diagramScore = Math.min(30, (stats.diagrams / 5) * 30);
        const structureScore = Math.min(10, (stats.sections / 8) * 10);
        return Math.floor(Math.min(99, wordScore + diagramScore + structureScore));
    };

    stats.depthScore = calculateDepth();

    const handleDownloadPDF = async () => {
        setDownloadProgress(20);

        try {

            if (activeTab !== 'report') {
                setActiveTab('report');

                await new Promise(resolve => setTimeout(resolve, 500));
            }

            const element = document.getElementById('report-content');


            if (!element) {
                throw new Error('Report content not found. Please ensure the report is fully loaded.');
            }

            setDownloadProgress(40);


            const sanitizeFilename = (title) => {
                if (!title || title === 'Untitled Project') {
                    return 'Strategic_Project_Report';
                }
                return title
                    .replace(/[^a-zA-Z0-9\s]/g, '')
                    .trim()
                    .split(/\s+/)
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join('_');
            };

            const filename = `${sanitizeFilename(projectTitle)}_Strategic_Impact_Report.pdf`;

            const opt = {
                margin: 0.5,
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 1.8,
                    logging: false,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                },
                jsPDF: {
                    unit: 'in',
                    format: 'a4',
                    orientation: 'portrait'
                }
            };


            const html2pdf = (await import('html2pdf.js')).default;

            setDownloadProgress(60);
            await html2pdf().set(opt).from(element).save();

            setDownloadProgress(100);
            setTimeout(() => setDownloadProgress(0), 1500);

        } catch (err) {
            console.error("PDF generation failed:", err);
            const errorMsg = err.message || 'Unknown error';
            alert(`Failed to generate PDF: ${errorMsg}\n\nPlease try again or check browser console for details.`);
            setDownloadProgress(0);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Strategic Project Report',
                text: 'AI-generated program design analysis',
            }).catch(() => { });
        } else {
            navigator.clipboard?.writeText(displayReport);
            alert('Report copied to clipboard!');
        }
    };

    return (
        <div className={`modal-overlay ${viewMode === 'fullscreen' ? 'fullscreen' : ''}`}>
            <div className={`modal-container animate-fade-in`}>


                <div className="modal-header">
                    <div className="header-top">
                        <div className="header-left">
                            <div className="header-icon">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3>Strategic Intelligence Report</h3>
                                <p>AI-Powered Program Design Analysis</p>
                            </div>
                        </div>

                        <div className="header-actions">
                            <button onClick={handleShare} title="Share">
                                <Share2 size={18} />
                            </button>
                            <button onClick={handlePrint} title="Print">
                                <Printer size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode(viewMode === 'fullscreen' ? 'preview' : 'fullscreen')}
                                title="Toggle Fullscreen"
                            >
                                {viewMode === 'fullscreen' ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </button>
                            <button onClick={onClose} className="close-btn">
                                <X size={20} />
                            </button>
                        </div>
                    </div>


                    {showStats && (
                        <div className="stats-bar">
                            <div className="stats-left">
                                <div className="stat-item">
                                    <TrendingUp size={16} />
                                    <span>{stats.diagrams} Diagrams</span>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="stat-item">
                                    <FileText size={16} />
                                    <span>{stats.sections} Sections</span>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="stat-item">
                                    <Clock size={16} />
                                    <span>{stats.readTime} min read</span>
                                </div>
                            </div>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={downloadProgress > 0 && downloadProgress < 100}
                                className="download-btn"
                            >
                                {downloadProgress > 0 && downloadProgress < 100 ? (
                                    <>
                                        <div className="progress-fill" style={{ width: `${downloadProgress}%` }}></div>
                                        <span className="btn-text">Generating {downloadProgress}%</span>
                                    </>
                                ) : (
                                    <>
                                        <Download size={16} />
                                        <span>Export PDF</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}


                    <div className="tab-nav">
                        {[
                            { id: 'report', label: 'Full Report', icon: FileText },
                            { id: 'insights', label: 'Key Insights', icon: Zap },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={activeTab === tab.id ? 'active' : ''}
                            >
                                <tab.icon size={16} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>


                <div className="modal-body">
                    {activeTab === 'report' && (
                        <div className="report-wrapper">
                            <div className="report-paper" id="report-content">

                                <div className="report-cover page-break-after-avoid">
                                    <div className="cover-icon">
                                        <FileText size={48} />
                                    </div>
                                    <h1>Strategic Project Report</h1>
                                    <p className="cover-subtitle">AI-Generated Program Design Intelligence</p>
                                    <div className="cover-meta">
                                        <div className="meta-item">
                                            <CheckCircle size={16} />
                                            <span>Generated: {new Date().toLocaleDateString()}</span>
                                        </div>
                                        <div className="meta-divider"></div>
                                        <div className="meta-item">
                                            <Zap size={16} />
                                            <span>{stats.diagrams} Visual Insights</span>
                                        </div>
                                    </div>
                                </div>


                                <SimpleMarkdown content={displayReport} />


                                <div className="report-footer">
                                    <p>Confidential & Proprietary</p>
                                    <p>Generated via DrishtiMap Strategic Intelligence Platform</p>
                                    <p className="footer-tech">Powered by Dual-AI Architecture (Groq + Gemini)</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        <div className="insights-wrapper animate-fade-in-up">
                            <h2>Key Research Findings</h2>
                            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                                Critical insights from AI research analysis including government schemes, market opportunities, and strategic recommendations.
                            </p>
                            <div className="research-findings">
                                <SimpleMarkdown content={

                                    (() => {
                                        // Strategy 1: Look for specific standard headers
                                        const specificHeaders = [
                                            'Key Research Findings', 'Key Insights', 'Research Findings',
                                            'Strategic Insights', 'Executive Summary', 'Summary',
                                            'Project Overview', 'Strategic Analysis', 'Program Design',
                                            'Conclusion', 'Recommendations', 'Analysis'
                                        ];

                                        for (const header of specificHeaders) {
                                            // Improved Regex:
                                            // 1. (?:^|\n)#{1,6}\s* -> Matches start of line or file, 1-6 hashes, and whitespace
                                            // 2. (?:[^\n]{0,50}) -> Matches up to 50 chars of "noise" (emojis, icons, formatting) before the key text
                                            // 3. ${header} -> The specific header text we want
                                            // 4. [^\n]*\n -> Matches the rest of the header line and the newline
                                            // 5. ([\s\S]*?) -> Captures the content (non-greedy)
                                            // 6. (?=(?:\n#{1,6}\s)|$) -> lookahead for next header or end of string
                                            const regex = new RegExp(`(?:^|\\n)#{1,6}\\s*(?:[^\\n]{0,50})${header}[^\\n]*\\n([\\s\\S]*?)(?=(?:\\n#{1,6}\\s)|$)`, 'i');

                                            const match = displayReport.match(regex);
                                            if (match && match[1] && match[1].trim()) {
                                                const content = match[1].trim();
                                                if (['Executive Summary', 'Summary', 'Project Overview'].includes(header)) {
                                                    return `**Note**: Showing ${header} as specific findings were not explicitly identified.\n\n${content}`;
                                                }
                                                return content;
                                            }
                                        }

                                        // Strategy 2: Look for ANY header containing relevant keywords
                                        const keywordRegex = /(?:^|\n)#{1,6}\s*.*(?:Finding|Insight|Analysis|Summary|Overview|Conclusion).*(\n[\s\S]*?)(?=(?:\n#{1,6}\s)|$)/i;
                                        const keywordMatch = displayReport.match(keywordRegex);
                                        if (keywordMatch && keywordMatch[1] && keywordMatch[1].trim()) {
                                            return `**Note**: Extracted from relevant section.\n\n${keywordMatch[1].trim()}`;
                                        }

                                        // Strategy 3: Just grab the first substantial section (that isn't the main title)
                                        // Matches the first header that has content following it
                                        const genericSectionRegex = /(?:^|\n)#{1,6}\s*([^#\n]+)(\n[\s\S]*?)(?=(?:\n#{1,6}\s)|$)/;
                                        const genericMatch = displayReport.match(genericSectionRegex);
                                        if (genericMatch && genericMatch[2] && genericMatch[2].trim()) {
                                            return `**Note**: Showing section "${genericMatch[1].trim()}" as no specific insights section was found.\n\n${genericMatch[2].trim()}`;
                                        }

                                        // Strategy 4: Fallback to showing the beginning of the report
                                        const firstChars = displayReport.slice(0, 1000);
                                        if (firstChars.trim()) {
                                            return `**Note**: Could not identify sections. Showing report preview.\n\n${firstChars}...`;
                                        }

                                        return "**No content available.** Please regenerate the research report.";
                                    })()
                                } />
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ResearchResult;

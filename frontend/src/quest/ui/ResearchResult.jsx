import React, { useState, useEffect, useRef } from 'react';
import { X, Download, FileText, Printer, Share2, Maximize2, Minimize2, ChevronRight, Zap, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
// Dynamic imports for heavy libraries (mermaid ~200KB, html2pdf ~150KB)
// These will only load when actually needed

/**
 * PRODUCTION-READY Mermaid Renderer
 * Handles errors gracefully, shows loading states
 */
const MermaidDiagram = ({ chart, index }) => {
    const [status, setStatus] = useState('loading');
    const [svg, setSvg] = useState('');
    const containerRef = useRef(null);
    const uniqueId = useRef(`mermaid-${index}-${Date.now()}`).current;

    useEffect(() => {
        let mounted = true;

        const renderDiagram = async () => {
            try {
                // Dynamically import mermaid only when needed (saves ~200KB on initial load)
                const mermaid = (await import('mermaid')).default;

                // Initialize mermaid if needed
                mermaid.initialize({
                    startOnLoad: false,
                    theme: 'default',
                    securityLevel: 'loose',
                    themeVariables: {
                        primaryColor: '#6366f1',
                        primaryTextColor: '#1e293b',
                        primaryBorderColor: '#4f46e5',
                        lineColor: '#94a3b8',
                        secondaryColor: '#e0e7ff',
                        tertiaryColor: '#f1f5f9'
                    },
                    suppressErrorRendering: true
                });

                // Render with error handling
                const { svg: renderedSvg } = await mermaid.render(uniqueId, chart);

                if (mounted) {
                    setSvg(renderedSvg);
                    setStatus('success');
                }
            } catch (error) {
                console.error('Mermaid render error:', error);
                if (mounted) {
                    setStatus('fallback');
                    generateFallback();
                }
            }
        };

        const generateFallback = () => {
            const type = chart.includes('mindmap') ? '🧠 Mindmap' :
                chart.includes('gantt') ? '📅 Gantt Chart' :
                    chart.includes('pie') ? '📊 Pie Chart' :
                        chart.includes('journey') ? '🚶 User Journey' :
                            chart.includes('quadrantChart') ? '◼️ Quadrant Matrix' :
                                chart.includes('sankey') ? '🌊 Flow Diagram' :
                                    chart.includes('stateDiagram') ? '🔄 State Machine' :
                                        chart.includes('graph') ? '📈 Flow Chart' : '📊 Diagram';

            const lines = chart.split('\n').filter(l => l.trim() && !l.includes('```')).slice(0, 5);

            setSvg(`
                <div class="diagram-fallback">
                    <div class="diagram-type">${type}</div>
                    <div class="diagram-preview">${lines.map(l => `<div>${l.trim()}</div>`).join('')}</div>
                    <div class="diagram-note">Visual diagram renders with Mermaid.js</div>
                </div>
            `);
        };

        // Small delay to ensure DOM is ready
        setTimeout(renderDiagram, 100);

        return () => { mounted = false; };
    }, [chart, uniqueId]);

    return (
        <div className="mermaid-container" ref={containerRef}>
            {status === 'loading' && (
                <div className="diagram-loading">
                    <div className="spinner"></div>
                    <span>Rendering diagram...</span>
                </div>
            )}
            {(status === 'success' || status === 'fallback') && (
                <div
                    className="diagram-render"
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            )}
            <style>{`
                .mermaid-container {
                    width: 100%;
                    margin: 2rem 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 200px;
                }
                .diagram-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    color: #6366f1;
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #e0e7ff;
                    border-top-color: #6366f1;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .diagram-fallback {
                    background: linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%);
                    border: 2px dashed #6366f1;
                    border-radius: 12px;
                    padding: 2rem;
                    text-align: center;
                    max-width: 600px;
                }
                .diagram-type {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #4f46e5;
                    margin-bottom: 1rem;
                }
                .diagram-preview {
                    background: white;
                    border-radius: 8px;
                    padding: 1rem;
                    margin: 1rem 0;
                    font-family: 'Courier New', monospace;
                    font-size: 0.75rem;
                    color: #475569;
                    text-align: left;
                    max-height: 150px;
                    overflow: hidden;
                }
                .diagram-preview div {
                    padding: 0.25rem 0;
                }
                .diagram-note {
                    font-size: 0.875rem;
                    color: #64748b;
                    margin-top: 1rem;
                }
                .diagram-render {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                }
            `}</style>
        </div>
    );
};

/**
 * Simple Markdown Parser (No external dependencies)
 */
const SimpleMarkdown = ({ content, diagramIndex }) => {
    const [html, setHtml] = useState('');
    const diagrams = useRef([]);

    useEffect(() => {
        let parsedContent = content;
        diagrams.current = [];

        // Extract mermaid blocks
        parsedContent = parsedContent.replace(/```mermaid\n([\s\S]*?)```/g, (match, code) => {
            const index = diagrams.current.length;
            diagrams.current.push(code.trim());
            return `<MERMAID_PLACEHOLDER_${index}>`;
        });

        // Basic markdown parsing
        parsedContent = parsedContent
            // Headers
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2><span class="header-icon">▸</span>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            // Bold and italic
            .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // Code blocks (non-mermaid)
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Lists
            .replace(/^\* (.+)$/gm, '<li>$1</li>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
            // Wrap consecutive <li> in <ul>
            .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            // Blockquotes
            .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
            // Horizontal rules
            .replace(/^---$/gm, '<hr>')
            // Tables
            .replace(/\|(.+)\|/g, (match) => {
                const cells = match.split('|').filter(c => c.trim());
                return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
            })
            .replace(/(<tr>.*<\/tr>\n?)+/g, '<table>$&</table>')
            // Paragraphs
            .replace(/^(?!<[hul]|<\/|<table|<pre|<blockquote)(.+)$/gm, '<p>$1</p>')
            // Clean up extra newlines
            .replace(/\n{3,}/g, '\n\n');

        setHtml(parsedContent);
    }, [content]);

    return (
        <div className="markdown-content">
            {html.split(/<MERMAID_PLACEHOLDER_(\d+)>/).map((segment, i) => {
                if (i % 2 === 0) {
                    // Text content
                    return <div key={i} dangerouslySetInnerHTML={{ __html: segment }} />;
                } else {
                    // Mermaid diagram
                    const diagramIdx = parseInt(segment);
                    return diagrams.current[diagramIdx] ? (
                        <MermaidDiagram
                            key={`diagram-${i}`}
                            chart={diagrams.current[diagramIdx]}
                            index={diagramIdx}
                        />
                    ) : null;
                }
            })}
        </div>
    );
};

const ResearchResult = ({ report, onClose, projectTitle }) => {
    const [viewMode, setViewMode] = useState('preview');
    const [activeTab, setActiveTab] = useState('report');
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [showStats, setShowStats] = useState(true);

    // Fallback report if none provided
    const displayReport = report || sampleReport;

    // Calculate stats
    const stats = {
        diagrams: (displayReport.match(/```mermaid/g) || []).length,
        sections: (displayReport.match(/^## /gm) || []).length,
        words: displayReport.split(/\s+/).length,
        readTime: Math.ceil(displayReport.split(/\s+/).length / 200)
    };

    // New Weighted Depth Score Algorithm
    const calculateDepth = () => {
        const wordScore = Math.min(60, (stats.words / 1000) * 60);
        const diagramScore = Math.min(30, (stats.diagrams / 5) * 30);
        const structureScore = Math.min(10, (stats.sections / 8) * 10);
        return Math.floor(Math.min(99, wordScore + diagramScore + structureScore));
    };

    stats.depthScore = calculateDepth();

    const handleDownloadPDF = async () => {
        setDownloadProgress(20);
        setTimeout(async () => {
            const element = document.getElementById('report-content');

            // Generate filename from project title
            const sanitizeFilename = (title) => {
                if (!title || title === 'Untitled Project') {
                    return 'Strategic_Project_Report';
                }
                // Remove special characters and convert to title case
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
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: { scale: 3, useCORS: true, spacingBottom: 20 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            try {
                // Dynamically import html2pdf only when downloading (saves ~150KB on initial load)
                const html2pdf = (await import('html2pdf.js')).default;

                await html2pdf().set(opt).from(element).save();
                setDownloadProgress(100);
                setTimeout(() => setDownloadProgress(0), 1000);
            } catch (err) {
                console.error("PDF Fail", err);
                setDownloadProgress(0);
            }
        }, 500);
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

                {/* Header */}
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

                    {/* Stats Bar */}
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

                    {/* Tabs */}
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

                {/* Content */}
                <div className="modal-body">
                    {activeTab === 'report' && (
                        <div className="report-wrapper">
                            <div className="report-paper" id="report-content">
                                {/* Cover */}
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

                                {/* Content */}
                                <SimpleMarkdown content={displayReport} />

                                {/* Footer */}
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
                            <h2>Executive Insights Dashboard</h2>

                            <div className="insight-cards">
                                <div className="card card-indigo">
                                    <div className="card-header">
                                        <h3>Visual Intelligence</h3>
                                        <TrendingUp size={24} />
                                    </div>
                                    <div className="card-value">{stats.diagrams}</div>
                                    <p>Interactive diagrams</p>
                                </div>

                                <div className="card card-green">
                                    <div className="card-header">
                                        <h3>Analysis Depth</h3>
                                        <FileText size={24} />
                                    </div>
                                    <div className="card-value">{stats.sections}</div>
                                    <p>Strategic sections</p>
                                </div>

                                <div className="card card-orange">
                                    <div className="card-header">
                                        <h3>Reading Time</h3>
                                        <Clock size={24} />
                                    </div>
                                    <div className="card-value">{stats.readTime} min</div>
                                    <p>Estimated duration</p>
                                </div>

                                <div className="card card-pink">
                                    <div className="card-header">
                                        <h3>Depth Score</h3>
                                        <Zap size={24} />
                                    </div>
                                    <div className="card-value">{stats.depthScore}</div>
                                    <p>Completeness rating</p>
                                </div>
                            </div>

                            <div className="takeaways">
                                <h3>
                                    <CheckCircle size={20} />
                                    Key Takeaways
                                </h3>
                                <ul>
                                    <li>Multi-dimensional stakeholder ecosystem mapped with power-interest analysis</li>
                                    <li>Theory of Change framework validated with visual flow diagrams</li>
                                    <li>Risk intelligence matrix with mitigation strategies across 4 quadrants</li>
                                    <li>Implementation roadmap with critical milestones and dependencies</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                }
                .modal-overlay.fullscreen {
                    padding: 0;
                }
                .modal-container {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
                    width: 100%;
                    max-width: 1400px;
                    max-height: 95vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .fullscreen .modal-container {
                    max-width: 100%;
                    max-height: 100vh;
                    border-radius: 0;
                }
                
                /* Header */
                .modal-header {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: white;
                }
                .header-top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.5rem;
                }
                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .header-icon {
                    padding: 0.625rem;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }
                .header-left h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin: 0;
                }
                .header-left p {
                    font-size: 0.75rem;
                    opacity: 0.9;
                    margin: 0.25rem 0 0 0;
                }
                .header-actions {
                    display: flex;
                    gap: 0.5rem;
                }
                .header-actions button {
                    padding: 0.625rem;
                    background: transparent;
                    border: none;
                    color: white;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: background 0.2s;
                }
                .header-actions button:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                .close-btn {
                    margin-left: 0.5rem;
                }
                
                /* Stats Bar */
                .stats-bar {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    padding: 0.75rem 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-top: 1px solid rgba(255, 255, 255, 0.2);
                }
                .stats-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-size: 0.875rem;
                }
                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .stat-divider {
                    width: 1px;
                    height: 1rem;
                    background: rgba(255, 255, 255, 0.3);
                }
                .download-btn {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1.25rem;
                    background: white;
                    color: #6366f1;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    overflow: hidden;
                    transition: transform 0.2s;
                }
                .download-btn:hover {
                    transform: translateY(-2px);
                }
                .download-btn:disabled {
                    cursor: not-allowed;
                }
                .progress-fill {
                    position: absolute;
                    left: 0;
                    top: 0;
                    height: 100%;
                    background: #e0e7ff;
                    transition: width 0.3s;
                    z-index: 0;
                }
                .btn-text {
                    position: relative;
                    z-index: 1;
                }
                .download-btn span {
                    position: relative;
                    z-index: 1;
                }
                
                /* Tabs */
                .tab-nav {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 0 1.5rem;
                    display: flex;
                    gap: 0.25rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.2);
                }
                .tab-nav button {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.8);
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                    border-radius: 8px 8px 0 0;
                    transition: all 0.2s;
                }
                .tab-nav button:hover {
                    color: white;
                    background: rgba(255, 255, 255, 0.1);
                }
                .tab-nav button.active {
                    background: white;
                    color: #6366f1;
                }
                
                /* Body */
                .modal-body {
                    flex: 1;
                    overflow-y: auto;
                    background: #f8fafc;
                }
                
                /* Report View */
                .report-wrapper {
                    display: flex;
                    justify-content: center;
                    padding: 2rem;
                }
                .report-paper {
                    background: white;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                    width: 100%;
                    max-width: 900px;
                    padding: 3rem;
                }
                
                .report-cover {
                    text-align: center;
                    padding-bottom: 2rem;
                    border-bottom: 4px solid #6366f1;
                    margin-bottom: 3rem;
                }
                .cover-icon {
                    display: inline-block;
                    padding: 1rem;
                    background: #e0e7ff;
                    border-radius: 50%;
                    margin-bottom: 1rem;
                    color: #6366f1;
                }
                .report-cover h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 1rem 0;
                }
                .cover-subtitle {
                    font-size: 1.125rem;
                    color: #64748b;
                    font-weight: 500;
                    margin-bottom: 1.5rem;
                }
                .cover-meta {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    font-size: 0.875rem;
                    color: #64748b;
                }
                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .meta-item svg {
                    color: #10b981;
                }
                .meta-divider {
                    width: 1px;
                    height: 1rem;
                    background: #cbd5e1;
                }
                
                /* Markdown Styles */
                .markdown-content {
                    color: #334155;
                    line-height: 1.75;
                }
                .markdown-content h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 2rem 0 1rem 0;
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 0.5rem;
                }
                .markdown-content h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 2.5rem 0 1rem 0;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .header-icon {
                    color: #6366f1;
                }
                .markdown-content h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #475569;
                    margin: 2rem 0 0.75rem 0;
                }
                .markdown-content p {
                    margin: 1rem 0;
                }
                .markdown-content ul {
                    margin: 1rem 0;
                    padding-left: 1.5rem;
                }
                .markdown-content li {
                    margin: 0.5rem 0;
                }
                .markdown-content strong {
                    color: #6366f1;
                    font-weight: 600;
                }
                .markdown-content code {
                    background: #f1f5f9;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.875rem;
                    color: #6366f1;
                    font-family: 'Courier New', monospace;
                }
                .markdown-content pre {
                    background: #1e293b;
                    color: #e2e8f0;
                    padding: 1rem;
                    border-radius: 8px;
                    overflow-x: auto;
                    margin: 1rem 0;
                }
                .markdown-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1.5rem 0;
                }
                .markdown-content table tr:first-child td {
                    background: #e0e7ff;
                    font-weight: 600;
                    color: #4f46e5;
                }
                .markdown-content td {
                    border: 1px solid #e2e8f0;
                    padding: 0.75rem;
                }
                .markdown-content blockquote {
                    border-left: 4px solid #6366f1;
                    background: #f8fafc;
                    padding: 1rem 1.5rem;
                    margin: 1rem 0;
                    font-style: italic;
                }
                
                .report-footer {
                    margin-top: 4rem;
                    padding-top: 2rem;
                    border-top: 2px solid #e2e8f0;
                    text-align: center;
                    font-size: 0.75rem;
                    color: #94a3b8;
                }
                .report-footer p {
                    margin: 0.25rem 0;
                }
                .footer-tech {
                    color: #6366f1;
                    font-weight: 500;
                }
                
                /* Insights View */
                .insights-wrapper {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .insights-wrapper h2 {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 1.5rem;
                }
                .insight-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                .card {
                    padding: 1.5rem;
                    border-radius: 12px;
                    color: white;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .card-indigo {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                }
                .card-green {
                    background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
                }
                .card-orange {
                    background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
                }
                .card-pink {
                    background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
                }
                .card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                }
                .card-header h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0;
                }
                .card-value {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }
                .card p {
                    opacity: 0.9;
                    margin: 0;
                    font-size: 0.875rem;
                }
                
                .takeaways {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e2e8f0;
                }
                .takeaways h3 {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0 0 1rem 0;
                }
                .takeaways h3 svg {
                    color: #10b981;
                }
                .takeaways ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .takeaways li {
                    padding-left: 1.5rem;
                    margin: 0.75rem 0;
                    position: relative;
                    color: #475569;
                    line-height: 1.6;
                }
                .takeaways li::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0.5rem;
                    width: 0.5rem;
                    height: 0.5rem;
                    background: #6366f1;
                    border-radius: 50%;
                }
                
                @media print {
                    .modal-header, .header-actions, .stats-bar, .tab-nav {
                        display: none !important;
                    }
                    .modal-overlay {
                        background: white;
                        padding: 0;
                    }
                    .modal-container {
                        max-width: 100%;
                        max-height: none;
                        box-shadow: none;
                    }
                    .modal-body {
                        overflow: visible;
                    }
                }
            `}</style>
        </div>
    );
};

// Sample report with all diagram types
const sampleReport = `
## 🎯 Executive Summary

This strategic analysis presents a comprehensive program design framework for educational transformation across multiple government schools. The intervention focuses on systemic capacity building through teacher training, curriculum innovation, and stakeholder engagement.

## 🗺️ Project Ecosystem Map

\`\`\`mermaid
mindmap
  root((Education Transformation))
    Primary Stakeholders
      Teachers
      Students
      School Leaders
    System Actors
      Block Officers
      District Officials
    Support Network
      NGO Partners
      Community Groups
\`\`\`

## 🔄 Theory of Change Framework

\`\`\`mermaid
graph LR
  A[Teacher Capacity] -->|Improves| B[Teaching Quality]
  B -->|Enhances| C[Student Engagement]
  C -->|Drives| D[Learning Outcomes]
  D -->|Achieves| E[Systemic Impact]
  style A fill:#e1f5ff
  style E fill:#c8e6c9
\`\`\`

## ⚠️ Risk Intelligence Matrix

\`\`\`mermaid
quadrantChart
  x-axis Low Impact --> High Impact
  y-axis Low Probability --> High Probability
  Funding Delay: [0.7, 0.6]
  Policy Change: [0.8, 0.3]
  Teacher Attrition: [0.5, 0.7]
\`\`\`

## 📈 Implementation Roadmap

\`\`\`mermaid
gantt
  title Project Timeline
  dateFormat YYYY-MM-DD
  section Phase 1
  Setup & Training    :p1, 2024-02-01, 30d
  section Phase 2
  Pilot Implementation :p2, after p1, 60d
  section Phase 3
  Scaling & Evaluation :p3, after p2, 90d
\`\`\`

## 💡 Key Success Metrics

| Metric | Baseline | Target | Timeline |
|--------|----------|--------|----------|
| Teacher Training | 0 | 500 | 6 months |
| Student Reach | 0 | 15,000 | 12 months |
| Learning Gain | Current | +30% | 18 months |

## 🚀 Next Steps

1. **Stakeholder Alignment** - Conduct orientation workshops
2. **Resource Mobilization** - Secure funding commitments
3. **Pilot Launch** - Begin implementation in 3 districts
4. **Monitoring Setup** - Establish baseline data collection

`;

export default ResearchResult;

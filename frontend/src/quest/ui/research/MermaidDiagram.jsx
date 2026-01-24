import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';

const MermaidDiagram = ({ chart, index }) => {
    const [status, setStatus] = useState('loading');
    const [svg, setSvg] = useState('');
    const containerRef = useRef(null);

    const uniqueId = useRef(`mermaid-${index}`).current;

    useEffect(() => {
        let mounted = true;

        const renderDiagram = async () => {
            try {

                mermaid.initialize({
                    startOnLoad: false,
                    theme: 'default',
                    securityLevel: 'loose',
                    fontFamily: 'Inter, sans-serif',
                    themeVariables: {
                        primaryColor: '#0d9488',
                        primaryTextColor: '#1e293b',
                        primaryBorderColor: '#0f766e',
                        lineColor: '#94a3b8',
                        secondaryColor: '#e0e7ff',
                        tertiaryColor: '#f1f5f9'
                    },
                    suppressErrorRendering: true
                });


                if (!chart || chart.trim().length === 0) {
                    throw new Error("Empty chart content");
                }


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
            const type = chart.includes('mindmap') ? 'Mindmap' :
                chart.includes('gantt') ? 'Gantt Chart' :
                    chart.includes('pie') ? 'Pie Chart' :
                        chart.includes('journey') ? 'User Journey' :
                            chart.includes('quadrantChart') ? 'Quadrant Matrix' :
                                chart.includes('sankey') ? 'Flow Diagram' :
                                    chart.includes('stateDiagram') ? 'State Machine' :
                                        chart.includes('graph') ? 'Flow Chart' : 'Diagram';

            const lines = chart.split('\n').filter(l => l.trim() && !l.includes('```')).slice(0, 5);

            setSvg(`
                <div class="diagram-fallback">
                    <div class="diagram-type">${type}</div>
                    <div class="diagram-preview">${lines.map(l => `<div>${l.trim()}</div>`).join('')}</div>
                    <div class="diagram-note">Visual diagram renders with Mermaid.js</div>
                </div>
            `);
        };


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
        </div>
    );
};

export default MermaidDiagram;

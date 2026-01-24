import React, { useState, useEffect, useRef } from 'react';
import MermaidDiagram from './MermaidDiagram';

const SimpleMarkdown = ({ content, diagramIndex }) => {
    const [html, setHtml] = useState('');
    const diagrams = useRef([]);

    useEffect(() => {
        let parsedContent = content;
        diagrams.current = [];

        parsedContent = parsedContent.replace(/```mermaid\n([\s\S]*?)```/g, (match, code) => {
            const index = diagrams.current.length;
            diagrams.current.push(code.trim());
            return `<MERMAID_PLACEHOLDER_${index}>`;
        });


        parsedContent = parsedContent

            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2><span class="header-icon">▸</span>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')

            .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')

            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')

            .replace(/`([^`]+)`/g, '<code>$1</code>')

            .replace(/^\* (.+)$/gm, '<li>$1</li>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')

            .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')

            .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

            .replace(/^---$/gm, '<hr>')

            .replace(/\|(.+)\|/g, (match) => {
                const cells = match.split('|').filter(c => c.trim());
                return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
            })
            .replace(/(<tr>.*<\/tr>\n?)+/g, '<table>$&</table>')

            .replace(/^(?!<[hul]|<\/|<table|<pre|<blockquote)(.+)$/gm, '<p>$1</p>')

            .replace(/\n{3,}/g, '\n\n');

        setHtml(parsedContent);
    }, [content]);

    return (
        <div className="markdown-content">
            {html.split(/<MERMAID_PLACEHOLDER_(\d+)>/).map((segment, i) => {
                if (i % 2 === 0) {

                    return <div key={i} dangerouslySetInnerHTML={{ __html: segment }} />;
                } else {

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

export default SimpleMarkdown;

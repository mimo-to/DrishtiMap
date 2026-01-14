import React, { useState } from 'react';

const TransparencyPanel = ({
    rawResponse,
    validationData,
    finalResult,
    isLoading,
    error,
    source = 'N/A' // 'Live', 'Cached', 'Disabled'
}) => {
    const [isOpen, setIsOpen] = useState(false);

    // VISIBILITY RULE: Hide entirely until first interaction (Loading, Error, or Data)
    const hasInteraction = !!rawResponse || !!validationData || isLoading || error;

    if (!hasInteraction) return null;

    return (
        <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Header / Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">AI Transparency Log</span>

                    {/* Source Badge */}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${source === 'Live' ? 'bg-green-100 text-green-700' :
                        source === 'Cached' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-200 text-gray-600'
                        }`}>
                        {source}
                    </span>

                    {isLoading && <span className="text-xs text-blue-600 animate-pulse">(Processing...)</span>}
                    {error && <span className="text-xs text-red-600">(Error)</span>}
                </div>
                <span className="text-xs text-gray-500">{isOpen ? 'Hide Details' : 'Show Details'}</span>
            </button>

            {/* Collapsible Content */}
            {isOpen && (
                <div className="p-4 space-y-6 text-sm">

                    {/* Inline Error Display */}
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded border border-red-100 mb-4">
                            <strong>AI Error:</strong> {typeof error === 'string' ? error : (error.message || "An unknown error occurred.")}
                        </div>
                    )}

                    {/* 1. Raw AI Output (Read-Only) */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase">1. Raw AI Output (Unedited)</label>
                        {/* MONOSPACE LOCK: strict font-mono with whitespace-pre-wrap */}
                        <div className="bg-slate-900 text-slate-50 p-3 rounded font-mono text-xs overflow-x-auto max-h-48 border border-slate-700">
                            {rawResponse ? (
                                <pre className="font-mono whitespace-pre-wrap">{JSON.stringify(rawResponse, null, 2)}</pre>
                            ) : (
                                <span className="text-slate-500 italic">Waiting for generation...</span>
                            )}
                        </div>
                    </div>

                    {/* 2. Validation / Scores (Read-Only) */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase">2. Evaluator Scores</label>
                        <div className="bg-blue-50 p-3 rounded border border-blue-100">
                            {validationData ? (
                                <div className="space-y-1">
                                    {/* Generic Key-Value dump for MVP */}
                                    {Object.entries(validationData).map(([key, value]) => (
                                        <div key={key} className="flex justify-between border-b border-blue-100 last:border-0 py-1">
                                            <span className="text-blue-800 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            <span className="font-mono text-blue-900">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-gray-400 italic">No validation details available.</span>
                            )}
                        </div>
                    </div>

                    {/* 3. Final Result (Source of Truth) */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase">3. Final Synthesized Result</label>
                        <div className="bg-green-50 p-3 rounded border border-green-100 text-green-900 font-mono text-xs">
                            {finalResult && Object.keys(finalResult).length > 0 ? (
                                <pre className="whitespace-pre-wrap">{JSON.stringify(finalResult, null, 2)}</pre>
                            ) : (
                                <span className="text-gray-400 italic font-sans">Form is empty.</span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">* Source of Truth: Form State (Modified by User)</p>
                    </div>

                </div>
            )}
        </div>
    );
};

export default TransparencyPanel;

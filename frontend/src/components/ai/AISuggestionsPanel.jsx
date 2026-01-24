import React from 'react';
import { Bot, Check, Sparkles, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const SuggestionCard = ({ suggestion, isSelected, onToggle }) => {
    const normalize = (val) => {
        if (!val) return 'N/A';
        const v = val.toLowerCase();
        if (v === 'med') return 'Medium';
        if (v === 'hi' || v === 'high') return 'High';
        if (v === 'lo' || v === 'low') return 'Low';
        return val.charAt(0).toUpperCase() + val.slice(1);
    };

    const impact = normalize(suggestion.impact || suggestion.Impact);
    const cost = normalize(suggestion.cost || suggestion.Cost);
    const tag = suggestion.primary_tag || "General";

    return (
        <div
            onClick={() => onToggle(suggestion)}
            className={`
                relative p-4 rounded-lg border transition-all cursor-pointer group flex flex-col h-full
                ${isSelected
                    ? 'bg-teal-50 border-teal-500 shadow-sm'
                    : 'bg-white border-stone-200 hover:border-teal-300 hover:shadow-sm'}
            `}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="pr-6">
                    <span className="inline-block text-[10px] font-bold font-display text-teal-700 bg-teal-50 px-2 py-0.5 rounded mb-1.5 border border-teal-100 tracking-wide">
                        {tag.toUpperCase()}
                    </span>
                    <h4 className={`text-sm font-bold font-display leading-tight ${isSelected ? 'text-teal-900' : 'text-stone-800'}`}>
                        {suggestion.title}
                    </h4>
                </div>

                <div className={`
                    w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors
                    ${isSelected ? 'bg-teal-600 border-teal-600' : 'border-stone-300 bg-white group-hover:border-teal-400'}
                `}>
                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                </div>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed flex-grow">
                {suggestion.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-3 mt-auto">
                <span className={`px-2 py-1 text-[10px] rounded font-medium border ${impact === 'High' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    Impact: <strong>{impact}</strong>
                </span>
                <span className={`px-2 py-1 text-[10px] rounded font-medium border ${cost === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    Cost: <strong>{cost}</strong>
                </span>
            </div>

            {Array.isArray(suggestion.stakeholders) && suggestion.stakeholders.length > 0 && (
                <div className="pt-3 border-t border-gray-100/50">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Affected Stakeholders</p>
                    <div className="flex flex-wrap gap-1">
                        {suggestion.stakeholders.map((s, idx) => (
                            <span key={idx} className="text-[10px] text-teal-700 bg-teal-50 px-1.5 rounded border border-teal-100">
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const AISuggestionsPanel = ({
    suggestions = [],
    selectedItems = [],
    onToggle,
    onClear,
    isLoading,
    error
}) => {
    return (
        <div className="mt-8 space-y-4 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Bot className="w-4 h-4 text-teal-600" />
                        AI Co-Pilot Suggestions
                        {isLoading && <span className="text-xs font-normal text-teal-600 animate-pulse font-display flex items-center gap-1"><Sparkles className="w-3 h-3" />(Generating...)</span>}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Select suggestions to add them to your project notes.
                    </p>
                </div>
                {selectedItems.length > 0 && (
                    <Button
                        variant="ghost"
                        onClick={onClear}
                        className="text-xs text-red-500 hover:text-red-700 h-auto py-1"
                    >
                        Clear Selections ({selectedItems.length})
                    </Button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded text-sm border border-red-100 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span><strong>AI Error:</strong> {error}</span>
                </div>
            )}

            {!isLoading && !error && (!suggestions || suggestions.length === 0) && (
                <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
                    No suggestions generated. Try refining your input or waiting a moment.
                </div>
            )}

            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-50 rounded border border-gray-100 animate-pulse" />
                    ))}
                </div>
            )}

            {!isLoading && suggestions && suggestions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {suggestions.map((s, idx) => {
                        const safeId = s.id || `sugg-${idx}`;
                        const isSelected = selectedItems.some(item => item.id === safeId);

                        return (
                            <SuggestionCard
                                key={safeId}
                                suggestion={{ ...s, id: safeId }}
                                isSelected={isSelected}
                                onToggle={onToggle}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AISuggestionsPanel;

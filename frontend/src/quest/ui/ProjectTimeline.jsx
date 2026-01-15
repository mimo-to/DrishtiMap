import React from 'react';
import { useQuestStore } from '../engine/useQuestStore';
import { LEVELS } from '../config/levels';
import { CheckCircle, Circle, ArrowDown } from 'lucide-react';

const ProjectTimeline = ({ currentLevelId, onJumpToLevel }) => {
    const { selectedSuggestions, answers } = useQuestStore();

    // Helper to check if a level has data
    const hasData = (levelId) => {
        return (selectedSuggestions[levelId] && selectedSuggestions[levelId].length > 0) ||
            (answers[levelId] && Object.keys(answers[levelId]).length > 0);
    };

    return (
        <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 overflow-y-auto sticky top-4 max-h-[calc(100vh-2rem)]">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                Project Journey
            </h3>

            <div className="relative">
                {/* Vertical Line Container */}
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" aria-hidden="true" />

                <div className="space-y-8 relative">
                    {LEVELS.map((level, index) => {
                        const isActive = level.id === currentLevelId;
                        const isCompleted = hasData(level.id);
                        const selections = selectedSuggestions[level.id] || [];

                        return (
                            <div key={level.id} className="relative pl-10">
                                {/* Node Indicator */}
                                <div
                                    className={`absolute left-0 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 bg-white transition-colors cursor-pointer
                                        ${isActive ? 'border-indigo-600 text-indigo-600' :
                                            isCompleted ? 'border-green-500 text-green-500' : 'border-gray-300 text-gray-400'}
                                    `}
                                    onClick={() => onJumpToLevel && onJumpToLevel(level.id)}
                                >
                                    {isCompleted ? <CheckCircle size={16} /> : <Circle size={16} />}
                                </div>

                                {/* Content */}
                                <div className="min-h-[3rem]">
                                    <div
                                        className={`text-sm font-semibold mb-2 cursor-pointer
                                            ${isActive ? 'text-indigo-700' : 'text-gray-700 hover:text-indigo-600'}
                                        `}
                                        onClick={() => onJumpToLevel && onJumpToLevel(level.id)}
                                    >
                                        {level.title}
                                    </div>

                                    {/* Selections Cards */}
                                    {selections.length > 0 ? (
                                        <div className="space-y-3">
                                            {selections.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-indigo-50 border border-indigo-100 rounded-md p-2 text-xs text-gray-700 shadow-sm relative group animate-fade-in-up"
                                                >
                                                    {/* Little Connector Arrow for cards */}
                                                    {idx > 0 && (
                                                        <div className="absolute -top-3 left-4 text-indigo-200">
                                                            <ArrowDown size={12} />
                                                        </div>
                                                    )}

                                                    <div className="font-medium text-indigo-900 mb-0.5">
                                                        {item.title || item.suggestion || "Selected Idea"}
                                                    </div>
                                                    <div className="line-clamp-2 opacity-80">
                                                        {item.description}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        isActive && (
                                            <div className="text-xs text-gray-400 italic border border-dashed border-gray-200 rounded p-2">
                                                Select AI suggestions to build your timeline...
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProjectTimeline;

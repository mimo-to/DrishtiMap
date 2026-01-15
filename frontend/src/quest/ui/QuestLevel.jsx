import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import QuestionRenderer from './QuestionRenderer';
import QuestControls from './QuestControls';
import Card from '../../components/ui/Card';
import { useQuestStore } from '../engine/useQuestStore';
import { engine } from '../engine/QuestEngine';
import AISuggestionsPanel from '../../components/ai/AISuggestionsPanel';
import { aiService } from '../../services/ai.service';
import ExportActions from './ExportActions';

const QuestLevel = ({ levelConfig, onNext, onBack, isFirst, isLast, onSave, saveStatus, isSaving }) => {
    const { getToken } = useAuth();
    const [globalError, setGlobalError] = useState(null);
    const { submitAnswer, answers, selectedSuggestions, toggleSuggestion, clearSelections } = useQuestStore();

    // EXTRACT DATA FOR CONTEXT
    const currentLevelData = levelConfig.questions.reduce((acc, q) => {
        if (answers[q.id]) acc[q.id] = answers[q.id];
        return acc;
    }, {});

    // AI STATE
    const [aiState, setAiState] = useState({
        suggestions: [],
        rawResponse: null,
        isLoading: false,
        error: null
    });

    const handleSuggest = async () => {
        setAiState({
            suggestions: [],
            rawResponse: null,
            isLoading: true,
            error: null
        });

        try {
            const firstQuestionId = levelConfig.questions[0].id;
            const input = answers[firstQuestionId] || "";

            if (!input.trim()) {
                throw new Error("Please enter some text first.");
            }

            const token = await getToken();

            // CONTEXT EXPANSION: Pass full project history for AI memory
            const fullContext = {
                currentLevelData, // Data from this specific level
                allAnswers: answers, // Global answers from previous levels
                allSelections: selectedSuggestions // Global AI selections from previous levels
            };

            const result = await aiService.suggest(levelConfig.id, input, token, fullContext);

            // DEBUG: Inspect Response
            console.log("AI Service Result:", result);
            if (result.suggestions) {
                console.log("Suggestions Array:", result.suggestions);
            } else {
                console.warn("Missing suggestions array in result");
            }

            if (result.suggestions && Array.isArray(result.suggestions)) {
                setAiState({
                    isLoading: false,
                    suggestions: result.suggestions,
                    rawResponse: result,
                    error: null
                });
            } else {
                throw new Error("AI returned an invalid format.");
            }

        } catch (err) {
            console.error("AI Error:", err);
            setAiState(prev => ({
                ...prev,
                isLoading: false,
                error: err.message || "AI Request Failed"
            }));
        }
    };

    const handleNext = () => {
        setGlobalError(null);
        let hasError = false;

        levelConfig.questions.forEach((q) => {
            const currentVal = answers[q.id];
            const result = submitAnswer(q, currentVal);
            if (!result.success) {
                hasError = true;
            }
        });

        if (hasError) {
            setGlobalError('Please fix the errors before proceeding.');
            return;
        }

        onNext();
    };

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{levelConfig.title}</h2>
                <p className="text-gray-600 mt-1">{levelConfig.description}</p>
            </div>

            <Card>
                <div className="space-y-6">
                    {globalError && (
                        <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
                            {globalError}
                        </div>
                    )}

                    {levelConfig.questions.map((q) => (
                        <QuestionRenderer key={q.id} question={q} />
                    ))}
                </div>

                <QuestControls
                    onNext={handleNext}
                    onBack={onNext ? onBack : undefined}
                    onSuggest={handleSuggest}
                    isFirst={isFirst}
                    isLast={isLast}
                />

                <ExportActions
                    onSave={onSave}
                    saveStatus={saveStatus}
                    isSaving={isSaving}
                />

                <AISuggestionsPanel
                    suggestions={aiState.error ? [] : aiState.suggestions}
                    selectedItems={selectedSuggestions[levelConfig.id] || []}
                    onToggle={(sugg) => toggleSuggestion(levelConfig.id, sugg)}
                    onClear={() => clearSelections(levelConfig.id)}
                    isLoading={aiState.isLoading}
                    error={aiState.error}
                />
            </Card>
        </div>
    );
};

export default QuestLevel;

import React, { useState } from 'react';
import QuestionRenderer from './QuestionRenderer';
import QuestControls from './QuestControls';
import Card from '../../components/ui/Card';
import { useQuestStore } from '../engine/useQuestStore';
import { engine } from '../engine/QuestEngine';
import TransparencyPanel from '../../components/ai/TransparencyPanel';
import { aiService } from '../../services/ai.service';

const QuestLevel = ({ levelConfig, onNext, onBack, isFirst, isLast }) => {
    const [globalError, setGlobalError] = useState(null);
    const submitAnswer = useQuestStore((state) => state.submitAnswer);
    const answers = useQuestStore((state) => state.answers);

    // EXTRACT DATA FOR TRANSPARENCY PANEL (Source of Truth: Form State)
    const currentLevelData = levelConfig.questions.reduce((acc, q) => {
        if (answers[q.id]) acc[q.id] = answers[q.id];
        return acc;
    }, {});

    // MOCK AI STATE (Phase 7.1 Requirement: Empty state)
    const [aiState, setAiState] = useState({
        rawResponse: null,
        validationData: null,
        isLoading: false,
        error: null
    });

    const handleSuggest = async () => {
        // Clear previous state
        setAiState(prev => ({ ...prev, isLoading: true, error: null, rawResponse: null }));

        try {
            // 1. Get current input from the first question of this level (Assumption for MVP)
            // Ideally, we'd pass the specific field being focused, but for now take the first answer.
            const firstQuestionId = levelConfig.questions[0].id;
            const input = answers[firstQuestionId] || "";

            if (!input.trim()) {
                throw new Error("Please enter some text first.");
            }

            // 2. Call AI Service
            const result = await aiService.suggest(levelConfig.id, input);

            // 3. Update State with Real Data
            setAiState({
                isLoading: false,
                rawResponse: result,
                validationData: null, // Backend doesn't return scores yet (Phase 6.4 scope)
                error: null
            });

        } catch (err) {
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

        // BULK VALIDATION
        levelConfig.questions.forEach((q) => {
            const currentVal = answers[q.id];
            // We must re-run submitAnswer to trigger validation state updates in the store
            const result = submitAnswer(q, currentVal);
            if (!result.success) {
                hasError = true;
            }
        });

        if (hasError) {
            setGlobalError('Please fix the errors before proceeding.');
            return;
        }

        // Proceed if valid
        onNext();
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
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

                {/* PHASE 7.1: TRANSPARENCY PANEL (Read-Only) */}
                <TransparencyPanel
                    rawResponse={aiState.rawResponse}
                    validationData={aiState.validationData}
                    finalResult={currentLevelData}
                    isLoading={aiState.isLoading}
                    error={aiState.error}
                    source={aiState.rawResponse?._source === 'cache' ? 'Cached' : aiState.rawResponse ? 'Live' : 'Disabled'}
                />
            </Card>
        </div>
    );
};

export default QuestLevel;

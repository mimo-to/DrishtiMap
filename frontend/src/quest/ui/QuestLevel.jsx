import React, { useState } from 'react';
import QuestionRenderer from './QuestionRenderer';
import QuestControls from './QuestControls';
import Card from '../../components/ui/Card';
import { useQuestStore } from '../engine/useQuestStore';
import { engine } from '../engine/QuestEngine';

const QuestLevel = ({ levelConfig, onNext, onBack, isFirst, isLast }) => {
    const [globalError, setGlobalError] = useState(null);
    const submitAnswer = useQuestStore((state) => state.submitAnswer);
    const answers = useQuestStore((state) => state.answers);

    const handleNext = () => {
        setGlobalError(null);
        let hasError = false;

        // BULK VALIDATION
        levelConfig.questions.forEach((q) => {
            const currentVal = answers[q.id];
            // We must re-run submitAnswer to trigger validation state updates in the store
            // This ensures errors are visible in the UI
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
                    onBack={onNext ? onBack : undefined} // Only pass back if not first effectively (handled by isFirst prop in controls but consistent data flow)
                    isFirst={isFirst}
                    isLast={isLast}
                />
            </Card>
        </div>
    );
};

export default QuestLevel;

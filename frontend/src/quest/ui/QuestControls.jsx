import React from 'react';
import Button from '../../components/ui/Button';

const QuestControls = ({ onNext, onBack, onSuggest, isFirst, isLast }) => {
    return (
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            {/* Back Button */}
            <div className="flex gap-2">
                {!isFirst && (
                    <Button variant="secondary" onClick={onBack}>
                        Back
                    </Button>
                )}
                <Button variant="outline" onClick={onSuggest} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                    ✨ Get Suggestion
                </Button>
            </div>

            {/* Next Button */}
            <div>
                <Button variant="primary" onClick={onNext}>
                    {isLast ? 'Finish Level' : 'Next Level'}
                </Button>
            </div>
        </div>
    );
};

export default QuestControls;

import React from 'react';
import Button from '../../components/ui/Button';
import { Sparkles } from 'lucide-react';

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
                <Button variant="outline" onClick={onSuggest} className="border-teal-200 text-teal-700 hover:bg-teal-50 font-display">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Suggestion
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

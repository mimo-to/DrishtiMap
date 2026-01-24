import React from 'react';
import Button from '../../components/ui/Button';
import { Sparkles } from 'lucide-react';

const QuestControls = ({ onNext, onBack, onSuggest, isFirst, isLast }) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {!isFirst && (
                    <Button variant="secondary" onClick={onBack} className="w-full sm:w-auto">
                        Back
                    </Button>
                )}
                <Button variant="outline" onClick={onSuggest} className="border-teal-200 text-teal-700 hover:bg-teal-50 font-display w-full sm:w-auto">
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Get Suggestion</span>
                    <span className="sm:hidden">Suggest</span>
                </Button>
            </div>


            <div className="w-full sm:w-auto">
                <Button variant="primary" onClick={onNext} className="w-full sm:w-auto">
                    {isLast ? 'Finish Level' : 'Next Level'}
                </Button>
            </div>
        </div>
    );
};

export default QuestControls;

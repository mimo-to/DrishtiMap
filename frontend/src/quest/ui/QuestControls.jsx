import React from 'react';
import Button from '../../components/ui/Button';

const QuestControls = ({ onNext, onBack, isFirst, isLast }) => {
    return (
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            {/* Back Button */}
            <div>
                {!isFirst && (
                    <Button variant="secondary" onClick={onBack}>
                        Back
                    </Button>
                )}
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

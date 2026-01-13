import React, { useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import QuestLevel from '../quest/ui/QuestLevel';
import { LEVELS, getLevelById, getNextLevelId, getPrevLevelId } from '../quest/config/levels';

const QuestPage = () => {
    const { levelId } = useParams();
    const navigate = useNavigate();

    // Redirect to first level if no ID
    if (!levelId) {
        return <Navigate to={`/quest/${LEVELS[0].id}`} replace />;
    }

    const levelConfig = getLevelById(levelId);

    // Handle Invalid Level ID
    if (!levelConfig) {
        return <Navigate to="/dashboard" replace />;
    }

    const isFirst = levelId === LEVELS[0].id;
    const isLast = levelId === LEVELS[LEVELS.length - 1].id;

    const handleNext = () => {
        const nextId = getNextLevelId(levelId);
        if (nextId) {
            navigate(`/quest/${nextId}`);
        } else {
            // Completed last level - go to dashboard or summary
            navigate('/dashboard');
        }
    };

    const handleBack = () => {
        const prevId = getPrevLevelId(levelId);
        if (prevId) {
            navigate(`/quest/${prevId}`);
        }
    };

    return (
        <QuestLevel
            levelConfig={levelConfig}
            onNext={handleNext}
            onBack={handleBack}
            isFirst={isFirst}
            isLast={isLast}
        />
    );
};

export default QuestPage;

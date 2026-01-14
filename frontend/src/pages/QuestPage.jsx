import React, { useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useQuestStore } from '../quest/engine/useQuestStore';
import QuestLevel from '../quest/ui/QuestLevel';
import { LEVELS, getLevelById, getNextLevelId, getPrevLevelId } from '../quest/config/levels';

import { useAutoSave } from '../hooks/useAutoSave';

const QuestPage = () => {
    const { levelId } = useParams();
    const navigate = useNavigate();
    const { getToken, userId } = useAuth();
    const { saveProject, isLoading, currentProjectId, answers, hasUnsavedChanges } = useQuestStore();
    const [saveStatus, setSaveStatus] = React.useState(null); // 'saving', 'saved', 'error'

    // 1. Calculations
    const levelConfig = getLevelById(levelId);
    const isFirst = levelId === LEVELS[0].id;
    const isLast = levelId === LEVELS[LEVELS.length - 1].id;

    // 2. Handlers
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

    const handleSave = async () => {
        if (!userId) return;
        setSaveStatus('saving');
        const token = await getToken();
        // Simple title derivation for now
        const title = answers['q_problem_core'] || "Untitled Project";
        const result = await saveProject(token, title);
        if (result.success) {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(null), 2000);
        } else {
            console.error(result.error);
            setSaveStatus('error');
        }
    };

    // 3. Auto-Save Integration (Must be before Validation/Early Returns)
    useAutoSave({
        triggerSave: handleSave,
        hasChanges: hasUnsavedChanges
    });

    // 4. Validations & Redirects
    if (!levelId) {
        return <Navigate to={`/quest/${LEVELS[0].id}`} replace />;
    }

    if (!levelConfig) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <QuestLevel
                levelConfig={levelConfig}
                onNext={handleNext}
                onBack={handleBack}
                isFirst={isFirst}
                isLast={isLast}
                onSave={handleSave}
                saveStatus={saveStatus}
                isSaving={isLoading || saveStatus === 'saving'}
            />
        </div>
    );
};

export default QuestPage;

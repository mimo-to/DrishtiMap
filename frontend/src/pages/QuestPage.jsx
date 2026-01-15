import React, { useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useQuestStore } from '../quest/engine/useQuestStore';
import QuestLevel from '../quest/ui/QuestLevel';
import { LEVELS, getLevelById, getNextLevelId, getPrevLevelId } from '../quest/config/levels';

import { useAutoSave } from '../hooks/useAutoSave';

const QuestPage = () => {
    const { projectId, levelId } = useParams();
    const navigate = useNavigate();
    const { getToken, userId } = useAuth();
    const {
        saveProject,
        loadProject,
        isLoading,
        currentProjectId,
        answers,
        hasUnsavedChanges
    } = useQuestStore();

    const [saveStatus, setSaveStatus] = React.useState(null); // 'saving', 'saved', 'error'
    const loadedProjectRef = React.useRef(null);

    // 0. Hydration (Restore State on Refresh)
    useEffect(() => {
        const hydrate = async () => {
            // Only load if:
            // 1. We have a projectId
            // 2. It's different from current
            // 3. We haven't already loaded this project
            // 4. User is authenticated
            if (projectId && projectId !== currentProjectId && projectId !== loadedProjectRef.current && userId) {
                console.log("Hydrating project from URL:", projectId);
                loadedProjectRef.current = projectId;
                const token = await getToken();
                await loadProject(projectId, token);
            }
        };
        hydrate();
    }, [projectId, userId, currentProjectId, getToken]);
    // Removed loadProject from dependencies to prevent re-renders

    // 1. Calculations
    // Default to first level if undefined
    const activeLevelId = levelId || LEVELS[0].id;
    const levelConfig = getLevelById(activeLevelId);

    const isFirst = activeLevelId === LEVELS[0].id;
    const isLast = activeLevelId === LEVELS[LEVELS.length - 1].id;

    // 2. Handlers
    const handleNext = () => {
        const nextId = getNextLevelId(activeLevelId);
        if (nextId) {
            navigate(`/quest/${projectId}/${nextId}`);
        } else {
            // Completed last level - go to dashboard or summary
            navigate('/dashboard');
        }
    };

    const handleBack = () => {
        const prevId = getPrevLevelId(activeLevelId);
        if (prevId) {
            navigate(`/quest/${projectId}/${prevId}`);
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

    // If loading a new project, show spinner
    if (isLoading && projectId !== currentProjectId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!levelId) {
        return <Navigate to={`/quest/${projectId}/${LEVELS[0].id}`} replace />;
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

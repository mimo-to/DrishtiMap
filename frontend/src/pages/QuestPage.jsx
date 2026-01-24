import React, { useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useQuestStore } from '../quest/engine/useQuestStore';
import QuestLevel from '../quest/ui/QuestLevel';
import { LEVELS, getLevelById, getNextLevelId, getPrevLevelId } from '../quest/config/levels';



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

    const [saveStatus, setSaveStatus] = React.useState(null);
    const loadedProjectRef = React.useRef(null);


    useEffect(() => {
        const hydrate = async () => {

            if (projectId && projectId !== currentProjectId && projectId !== loadedProjectRef.current && userId) {

                loadedProjectRef.current = projectId;
                const token = await getToken();
                await loadProject(projectId, token);
            }
        };
        hydrate();
    }, [projectId, userId, currentProjectId, getToken]);



    const activeLevelId = levelId || LEVELS[0].id;
    const levelConfig = getLevelById(activeLevelId);

    const isFirst = activeLevelId === LEVELS[0].id;
    const isLast = activeLevelId === LEVELS[LEVELS.length - 1].id;


    const handleNext = () => {
        const nextId = getNextLevelId(activeLevelId);
        if (nextId) {
            navigate(`/quest/${projectId}/${nextId}`);
        } else {

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
        if (!userId) return false;
        setSaveStatus('saving');
        const token = await getToken();

        const title = answers['q_problem_core'] || "Untitled Project";
        const result = await saveProject(token, title);
        if (result.success) {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(null), 2000);
            return true;
        } else {
            console.error(result.error);
            setSaveStatus('error');
            return false;
        }
    };




    if (isLoading && projectId !== currentProjectId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
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
        <div className="min-h-screen bg-stone-50">
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

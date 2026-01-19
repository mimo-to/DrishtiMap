// ... imports
import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate, useParams } from 'react-router-dom';
import QuestionRenderer from './QuestionRenderer';
import QuestControls from './QuestControls';
import Card from '../../components/ui/Card';
import { useQuestStore } from '../engine/useQuestStore';
import { engine } from '../engine/QuestEngine';
import AISuggestionsPanel from '../../components/ai/AISuggestionsPanel';
import { aiService } from '../../services/ai.service';
import ExportActions from './ExportActions';
import ProjectTimeline from './ProjectTimeline';
import ResearchResult from './ResearchResult';

const QuestLevel = ({ levelConfig, onNext, onBack, isFirst, isLast, onSave, saveStatus, isSaving }) => {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [globalError, setGlobalError] = useState(null);
    const { submitAnswer, answers, selectedSuggestions, toggleSuggestion, clearSelections, refreshProject } = useQuestStore();

    // Research State
    const [isResearching, setIsResearching] = useState(false);
    const [researchReport, setResearchReport] = useState(null);

    // LOAD SAVED RESEARCH
    const { projects, currentProjectId } = useQuestStore();
    const currentProject = projects.find(p => p._id === projectId || p._id === currentProjectId);
    const savedResearch = currentProject?.data?.research;

    const handleResearch = async () => {
        if (!projectId) return;

        // Auto-save first to ensure AI has latest data
        if (onSave) {
            const saved = await onSave();
            if (!saved) {
                setGlobalError("Could not save project data. Research generation aborted.");
                return;
            }
        }

        setIsResearching(true);
        try {
            const token = await getToken();
            const report = await aiService.generateResearch(projectId, token);
            // report is { reportMarkdown: string, generatedAt: date }

            // Backend now saves it, but we update local state to show it immediately
            setResearchReport(report.reportMarkdown || report);

            // Refresh project data to sync the saved research report
            await refreshProject(projectId, token);
        } catch (error) {
            console.error("Research Error:", error);

            if (error.message.includes('VS_QUOTA_EXCEEDED')) {
                setGlobalError("🚨 Daily AI Research Limit Reached. Please try again tomorrow! (Free Tier Limit)");
            } else {
                // Show the actual error message for debugging
                const errorMsg = error.message || "Unknown error occurred";
                setGlobalError(`Failed to generate research report: ${errorMsg}`);
                console.error("Full error details:", error);
            }
        } finally {
            setIsResearching(false);
        }
    };

    // View Saved Report Handler
    const handleViewSavedReport = () => {
        if (savedResearch && savedResearch.markdown) {
            setResearchReport(savedResearch.markdown);
        }
    };

    // EXTRACT DATA FOR CONTEXT
    const currentLevelData = levelConfig.questions.reduce((acc, q) => {
        if (answers[q.id]) acc[q.id] = answers[q.id];
        return acc;
    }, {});

    const handleJumpToLevel = (targetLevelId) => {
        // Only navigate if we have a project ID context
        if (targetLevelId && projectId) {
            navigate(`/quest/${projectId}/${targetLevelId}`);
        }
    };

    // AI STATE
    const [aiState, setAiState] = useState({
        suggestions: [],
        rawResponse: null,
        isLoading: false,
        error: null
    });

    const handleSuggest = async () => {
        setAiState({
            suggestions: [],
            rawResponse: null,
            isLoading: true,
            error: null
        });

        try {
            const firstQuestionId = levelConfig.questions[0].id;
            const input = answers[firstQuestionId] || "";

            if (!input.trim()) {
                throw new Error("Please enter some text first.");
            }

            const token = await getToken();

            // CONTEXT EXPANSION: Pass full project history for AI memory
            const fullContext = {
                currentLevelData, // Data from this specific level
                allAnswers: answers, // Global answers from previous levels
                allSelections: selectedSuggestions // Global AI selections from previous levels
            };

            const result = await aiService.suggest(levelConfig.id, input, token, fullContext);

            if (result.suggestions && Array.isArray(result.suggestions)) {
                setAiState({
                    isLoading: false,
                    suggestions: result.suggestions,
                    rawResponse: result,
                    error: null
                });
            } else {
                throw new Error("AI returned an invalid format.");
            }

        } catch (err) {
            console.error("AI Error:", err);
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

        levelConfig.questions.forEach((q) => {
            const currentVal = answers[q.id];
            const result = submitAnswer(q, currentVal);
            if (!result.success) {
                hasError = true;
            }
        });

        if (hasError) {
            setGlobalError('Please fix the errors before proceeding.');
            return;
        }

        onNext();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Project Name Header */}
            {currentProject && (
                <div className="mb-4 pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">Project:</span>
                        <h1 className="text-lg font-bold font-display text-teal-700">
                            {currentProject.title || 'Untitled Project'}
                        </h1>
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
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

                        <ExportActions
                            onSave={onSave}
                            saveStatus={saveStatus}
                            isSaving={isSaving}
                            onResearch={handleResearch}
                            isResearching={isResearching}
                            savedResearch={savedResearch}
                            onViewResearch={handleViewSavedReport}
                        />

                        <AISuggestionsPanel
                            suggestions={aiState.error ? [] : aiState.suggestions}
                            selectedItems={selectedSuggestions[levelConfig.id] || []}
                            onToggle={(sugg) => toggleSuggestion(levelConfig.id, sugg)}
                            onClear={() => clearSelections(levelConfig.id)}
                            isLoading={aiState.isLoading}
                            error={aiState.error}
                        />
                    </Card>
                </div>

                {/* Right Sidebar - Timeline */}
                <div className="hidden lg:block w-80 flex-shrink-0">
                    <ProjectTimeline
                        currentLevelId={levelConfig.id}
                        onJumpToLevel={handleJumpToLevel}
                    />
                </div>
            </div>

            {/* Research Result Modal */}
            {researchReport && (
                <ResearchResult
                    report={researchReport}
                    onClose={() => setResearchReport(null)}
                    projectTitle={currentProject?.title || 'Untitled Project'}
                />
            )}
        </div>
    );
};

export default QuestLevel;

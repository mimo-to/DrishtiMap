import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import { useQuestStore } from '../engine/useQuestStore';
import { ExportService } from '../../services/export.service';
import ExportPreview from './ExportPreview';

const ExportActions = ({ onSave, saveStatus, isSaving, onResearch, isResearching, savedResearch, onViewResearch }) => {
    // Read-only access to full answers state
    const { answers, projects, currentProjectId } = useQuestStore();
    const [previewType, setPreviewType] = useState(null); // 'json' | 'pdf' | null

    const handleExportClick = (type) => {
        // Quick check before opening modal
        if (!answers || Object.keys(answers).length === 0) {
            alert("Nothing to export yet. Please answer some questions first.");
            return;
        }

        // Check for basic validation - primitive "Warning"
        const hasMissing = Object.values(answers).some(a => !a) || Object.keys(answers).length < 5; // Arbitrary 5 check
        if (hasMissing && !window.confirm("Some questions are not answered. working draft?")) {
            return;
        }

        // Derive Title
        const currentProject = projects.find(p => p._id === currentProjectId);
        const projectTitle = currentProject?.title || "DrishtiMap Project";

        ExportService.exportProject(type, answers, projectTitle);
    };

    return (
        <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Project Actions
            </h3>
            <div className="flex justify-between items-center">
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => handleExportClick('json')}
                        className="text-xs py-1.5 h-8"
                    >
                        📥 Export JSON
                    </Button>

                </div>

                {/* Save Progress Button - Far Right */}
                <div className="flex items-center gap-3">
                    {saveStatus === 'saved' && <span className="text-green-600 text-xs font-medium animate-fade-in">Saved!</span>}
                    {saveStatus === 'error' && <span className="text-red-600 text-xs font-medium animate-fade-in">Failed</span>}

                    {/* Research Actions */}
                    <div className="flex items-center gap-2">
                        {savedResearch && (
                            <Button
                                variant="outline"
                                onClick={onViewResearch}
                                className="text-xs py-1.5 h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                            >
                                📄 Review Strategy Deck
                            </Button>
                        )}

                        <Button
                            onClick={onResearch}
                            disabled={isResearching || isSaving}
                            className="text-xs py-1.5 h-8 bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600 shadow-sm"
                        >
                            {isResearching ? 'Thinking...' : savedResearch ? '🔄 Regenerate Deck' : '✨ Finalize & Research'}
                        </Button>
                    </div>

                    <Button
                        variant={saveStatus === 'saved' ? 'secondary' : 'primary'}
                        onClick={onSave}
                        disabled={isSaving}
                        className={`text-xs py-1.5 h-8 ${saveStatus === 'saved' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : ''}`}
                    >
                        {isSaving ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save Progress'}
                    </Button>
                </div>
            </div>

            {/* PREVIEW MODAL */}
            <ExportPreview
                isOpen={!!previewType}
                onClose={() => setPreviewType(null)}
                answers={answers}
                exportType={previewType}
            />
        </div>
    );
};

export default ExportActions;

import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import { useQuestStore } from '../engine/useQuestStore';
import { ExportService } from '../../services/export.service';
import ExportPreview from './ExportPreview';
import { Download, FileText, RefreshCw, Sparkles, Check } from 'lucide-react';

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
                        <Download className="w-3.5 h-3.5 mr-1.5 inline-block" />
                        Export JSON
                    </Button>

                </div>

                {/* Save Progress Button - Far Right */}
                <div className="flex items-center gap-3">
                    {saveStatus === 'saved' && <span className="text-green-600 text-xs font-medium animate-fade-in flex items-center"><Check className="w-3 h-3 mr-1" />Saved!</span>}
                    {saveStatus === 'error' && <span className="text-red-600 text-xs font-medium animate-fade-in">Failed</span>}

                    {/* Research Actions */}
                    <div className="flex items-center gap-2">
                        {savedResearch && (
                            <Button
                                variant="outline"
                                onClick={onViewResearch}
                            >
                                <FileText className="w-3.5 h-3.5 mr-1.5 inline-block" />
                                Review Strategy Deck
                            </Button>
                        )}

                        <Button
                            onClick={onResearch}
                            disabled={isResearching || isSaving}
                            className="text-xs py-1.5 h-8 bg-teal-700 text-white hover:bg-teal-800 border-teal-700 shadow-sm"
                        >
                            {isResearching ? (
                                <span className="flex items-center"><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />Thinking...</span>
                            ) : savedResearch ? (
                                <span className="flex items-center"><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Regenerate Deck</span>
                            ) : (
                                <span className="flex items-center"><Sparkles className="w-3.5 h-3.5 mr-1.5" />Finalize & Research</span>
                            )}
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

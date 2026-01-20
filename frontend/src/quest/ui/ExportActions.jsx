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
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Project Actions
            </h3>

            {/* Mobile: Stack everything vertically */}
            <div className="flex flex-col gap-2 sm:hidden">
                {/* Export JSON */}
                <Button
                    variant="outline"
                    onClick={() => handleExportClick('json')}
                    className="text-xs py-1.5 h-8 w-full justify-center"
                >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Export JSON
                </Button>

                {/* Review Deck (if exists) */}
                {savedResearch && (
                    <Button
                        variant="outline"
                        onClick={onViewResearch}
                        className="text-xs py-1.5 h-8 w-full justify-center"
                    >
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                        Review Deck
                    </Button>
                )}

                {/* Research/Regenerate */}
                <Button
                    onClick={onResearch}
                    disabled={isResearching || isSaving}
                    className="text-xs py-1.5 h-8 bg-teal-700 text-white hover:bg-teal-800 w-full justify-center"
                >
                    {isResearching ? (
                        <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />Thinking...</>
                    ) : savedResearch ? (
                        <><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Regenerate</>
                    ) : (
                        <><Sparkles className="w-3.5 h-3.5 mr-1.5" />Research</>
                    )}
                </Button>

                {/* Save Progress */}
                <Button
                    variant={saveStatus === 'saved' ? 'secondary' : 'primary'}
                    onClick={onSave}
                    disabled={isSaving}
                    className={`text-xs py-1.5 h-8 w-full justify-center ${saveStatus === 'saved' ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                >
                    {isSaving ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved' : 'Save Progress'}
                </Button>

                {/* Status */}
                {saveStatus === 'error' && <span className="text-red-600 text-xs text-center">Save failed</span>}
            </div>

            {/* Desktop: Horizontal layout */}
            <div className="hidden sm:flex justify-between items-center">
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleExportClick('json')}
                        className="text-xs py-1.5 h-8"
                    >
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        Export JSON
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    {saveStatus === 'saved' && <span className="text-green-600 text-xs font-medium flex items-center"><Check className="w-3 h-3 mr-1" />Saved!</span>}
                    {saveStatus === 'error' && <span className="text-red-600 text-xs">Failed</span>}

                    {savedResearch && (
                        <Button
                            variant="outline"
                            onClick={onViewResearch}
                            className="text-xs py-1.5 h-8"
                        >
                            <FileText className="w-3.5 h-3.5 mr-1.5" />
                            Review Strategy Deck
                        </Button>
                    )}

                    <Button
                        onClick={onResearch}
                        disabled={isResearching || isSaving}
                        className="text-xs py-1.5 h-8 bg-teal-700 text-white hover:bg-teal-800"
                    >
                        {isResearching ? (
                            <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />Thinking...</>
                        ) : savedResearch ? (
                            <><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Regenerate Deck</>
                        ) : (
                            <><Sparkles className="w-3.5 h-3.5 mr-1.5" />Finalize & Research</>
                        )}
                    </Button>

                    <Button
                        variant={saveStatus === 'saved' ? 'secondary' : 'primary'}
                        onClick={onSave}
                        disabled={isSaving}
                        className={`text-xs py-1.5 h-8 ${saveStatus === 'saved' ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
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

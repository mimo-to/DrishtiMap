import React, { useState, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { LEVELS } from '../config/levels';
import { ExportService } from '../../services/export.service';

/**
 * ExportPreview
 * Mandatory pre-export step to validate quality and confirm content.
 * 
 * Logic:
 * - Calculates Quality Score (0-100) based on completion.
 * - Generates Warnings for empty or short fields.
 * - Shows Read-Only preview of all content.
 */
const ExportPreview = ({ isOpen, onClose, answers, exportType }) => {
    if (!isOpen) return null;

    // --- LOGIC: Validation & Scoring ---
    const { score, warnings, content } = useMemo(() => {
        let totalQuestions = 0;
        let answeredQuestions = 0;
        const warningsList = [];
        const contentList = [];

        LEVELS.forEach(level => {
            const levelContent = {
                title: level.title,
                items: []
            };

            level.questions.forEach(q => {
                totalQuestions++;
                const ans = answers[q.id];
                const isAnswered = ans && ans.trim().length > 0;

                if (isAnswered) {
                    answeredQuestions++;
                    // Check for quality (Volume)
                    if (ans.length < 40) {
                        warningsList.push({
                            level: level.title,
                            question: q.prompt,
                            issue: "Too brief (under 40 chars)"
                        });
                    }
                } else {
                    // Check for completion
                    warningsList.push({
                        level: level.title,
                        question: q.prompt,
                        issue: "Not completed"
                    });
                }

                levelContent.items.push({
                    prompt: q.prompt,
                    answer: ans || "(Not completed)",
                    isMissing: !isAnswered
                });
            });

            contentList.push(levelContent);
        });

        const calculatedScore = Math.round((answeredQuestions / totalQuestions) * 100);

        return { score: calculatedScore, warnings: warningsList, content: contentList };
    }, [answers]);

    // --- ACTIONS ---
    const handleConfirm = () => {
        const result = ExportService.exportProject(exportType, answers);
        if (!result.success) {
            alert(result.error);
        }
        onClose();
    };

    // --- RENDER ---
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* HEAD: Version & Title */}
                <div className="bg-stone-50 border-b border-stone-100 p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Review Before Export</h2>
                        <div className="text-xs text-gray-400 mt-1 font-mono">
                            DrishtiMap v1.0 | {new Date().toLocaleString()}
                        </div>
                    </div>
                    {/* Quality Score Badge */}
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                            Quality Score
                        </span>
                        <div className={`text-2xl font-bold ${score >= 80 ? 'text-green-600' :
                            score >= 50 ? 'text-yellow-600' :
                                'text-red-600'
                            }`}>
                            {score}/100
                        </div>
                    </div>
                </div>

                {/* BODY: Scrollable Review */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Warnings Section */}
                    {warnings.length > 0 && (
                        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-6">
                            <h4 className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Advisory Warnings
                            </h4>
                            <ul className="space-y-1">
                                {warnings.map((w, idx) => (
                                    <li key={idx} className="text-xs text-orange-700">
                                        <span className="font-semibold">{w.level}:</span> {w.question} —
                                        <span className="italic opacity-80"> {w.issue}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Content Preview */}
                    <div className="space-y-8">
                        {content.map((level, lIdx) => (
                            <div key={lIdx}>
                                <h3 className="text-sm font-bold font-display text-teal-800 border-b border-stone-200 pb-2 mb-3">
                                    {level.title.toUpperCase()}
                                </h3>
                                <div className="space-y-4">
                                    {level.items.map((item, qIdx) => (
                                        <div key={qIdx} className="text-sm">
                                            <div className="font-semibold text-gray-700 mb-1">
                                                {item.prompt}
                                            </div>
                                            <div className={`p-3 rounded-lg border ${item.isMissing
                                                ? 'bg-stone-50 border-stone-100 text-stone-400 italic'
                                                : 'bg-white border-gray-200 text-gray-800'
                                                }`}>
                                                {item.answer}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FOOTER: Actions */}
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
                    <Button variant="secondary" onClick={onClose}>
                        Back to Edit
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        className={exportType === 'pdf' ? 'bg-red-600 hover:bg-red-700 border-red-600 text-white' : ''}
                    >
                        Confirm Export {exportType?.toUpperCase()}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ExportPreview;

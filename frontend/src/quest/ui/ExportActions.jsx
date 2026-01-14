import React from 'react';
import Button from '../../components/ui/Button';
import { useQuestStore } from '../engine/useQuestStore';
import { ExportService } from '../../services/export.service';

const ExportActions = () => {
    // Read-only access to full answers state
    const answers = useQuestStore((state) => state.answers);

    const handleExport = (type) => {
        ExportService.exportProject(type, answers);
    };

    const hasData = Object.keys(answers).length > 0;

    if (!hasData) return null;

    return (
        <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Project Actions (Work In Progress)
            </h3>
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={() => handleExport('json')}
                    className="text-xs py-1.5 h-8"
                >
                    📥 Export JSON
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleExport('pdf')}
                    className="text-xs py-1.5 h-8 text-red-600 border-red-200 hover:bg-red-50"
                >
                    📄 Export PDF
                </Button>
            </div>
        </div>
    );
};

export default ExportActions;

import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { LEVELS } from '../quest/config/levels'; // Source of Truth for Order

/**
 * ExportService
 * Centralized logic for generating project deliverables.
 */
export const ExportService = {

    /**
     * Unified Export Entry Point
     * @param {string} type - 'pdf' | 'json'
     * @param {Object} projectData - The map of answers (key -> value)
     */
    exportProject: (type, projectData) => {
        // 1. EMPTY GUARD
        if (!projectData || Object.keys(projectData).length === 0) {
            return { success: false, error: "Nothing to export yet. Please answer some questions first." };
        }

        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `DrishtiMap_Project_${dateStr}`;

        if (type === 'json') {
            return exportToJson(projectData, filename);
        } else if (type === 'pdf') {
            return exportToPdf(projectData, filename);
        } else {
            return { success: false, error: "Invalid export type" };
        }
    }
};

/**
 * Internal: Generate JSON
 * Locks key order based on LEVELS config.
 */
const exportToJson = (projectData, filename) => {
    try {
        // Reconstruct data in Strict Order
        const orderedAnswers = {};
        
        LEVELS.forEach(level => {
            level.questions.forEach(q => {
                if (projectData[q.id]) {
                    orderedAnswers[q.id] = projectData[q.id];
                }
            });
        });

        const exportObject = {
            meta: {
                title: "DrishtiMap Project Export",
                status: "WORK_IN_PROGRESS", // User Requirement
                timestamp: new Date().toISOString(),
                version: "1.0"
            },
            data: orderedAnswers
        };

        const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: "application/json" });
        saveAs(blob, `${filename}.json`);
        return { success: true };
    } catch (error) {
        console.error("Export JSON failed:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Internal: Generate PDF
 * Iterates strictly through LEVELS to ensure correct flow.
 */
const exportToPdf = (projectData, filename) => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let y = 20;

        // --- TITLE PAGE ---
        doc.setFontSize(24);
        doc.setTextColor(33, 37, 41);
        doc.text("DrishtiMap Project Report", margin, y);
        y += 15;

        doc.setFontSize(10);
        doc.setTextColor(108, 117, 125);
        doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
        y += 10;
        
        // WIP Label
        doc.setFontSize(12);
        doc.setTextColor(220, 53, 69); // Red
        doc.text("STATUS: WORK IN PROGRESS", margin, y);
        y += 15;

        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 15;

        // --- SECTIONS (Locked Order) ---
        LEVELS.forEach((level) => {
            // Level Header
            if (y > pageHeight - 40) { doc.addPage(); y = 20; }
            
            doc.setFontSize(16);
            doc.setTextColor(0, 86, 179); // Blue
            doc.text(level.title.toUpperCase(), margin, y);
            y += 10;

            level.questions.forEach((q) => {
                const answer = projectData[q.id];
                
                // Question Label
                if (y > pageHeight - 30) { doc.addPage(); y = 20; }
                doc.setFontSize(11);
                doc.setTextColor(80, 80, 80);
                doc.setFont("helvetica", "bold");
                doc.text(q.prompt, margin, y);
                y += 6;

                // Answer Content
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);

                if (answer) {
                   const splitText = doc.splitTextToSize(String(answer), pageWidth - (margin * 2));
                   doc.text(splitText, margin, y);
                   y += (splitText.length * 5) + 8;
                } else {
                   doc.setTextColor(150);
                   doc.text("[Not completed]", margin, y);
                   y += 14;
                }
            });
            
            y += 5; // Spacing between levels
        });

        // --- FOOTER (WIP Note) ---
        const pageCount = doc.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount} | WORK IN PROGRESS`, pageWidth - margin - 50, pageHeight - 10);
        }

        doc.save(`${filename}.pdf`);
        return { success: true };

    } catch (error) {
        console.error("Export PDF failed:", error);
        return { success: false, error: error.message };
    }
};

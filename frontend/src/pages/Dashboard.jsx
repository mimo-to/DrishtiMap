import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useQuestStore } from '../quest/engine/useQuestStore';
import { Trash2, Edit2, Check, X, Plus, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { BackgroundPattern } from '../components/ui/BackgroundPattern';

const Dashboard = () => {
    const { getToken, userId } = useAuth();
    const navigate = useNavigate();
    const { projects, loadProjects, resetStore, loadProject, deleteProject, updateProjectTitle, isLoading, saveProject } = useQuestStore();

    // UI State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [editTitle, setEditTitle] = useState('');

    // New Project State
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
    const [newProjectTitle, setNewProjectTitle] = useState('');

    useEffect(() => {
        const fetchProjects = async () => {
            if (userId) {
                const token = await getToken();
                loadProjects(token);
            }
        };
        fetchProjects();
    }, [userId, getToken, loadProjects]);

    // --- Actions ---

    // 1. New Project
    const handleStartNewProject = () => {
        setNewProjectTitle('');
        setIsNewProjectModalOpen(true);
    };

    const confirmNewProject = async () => {
        if (!newProjectTitle.trim()) return;

        const token = await getToken();
        resetStore();

        const title = newProjectTitle.trim();
        setIsNewProjectModalOpen(false);

        const result = await saveProject(token, title);

        if (result && result.success) {
            navigate(`/quest/${result.project._id}`);
        }
    };

    // ...

    // 2. Delete Project
    const requestDelete = (project, e) => {
        e.stopPropagation();
        setProjectToDelete(project);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (projectToDelete) {
            const token = await getToken();
            await deleteProject(projectToDelete._id, token);
            setIsDeleteModalOpen(false);
            setProjectToDelete(null);
        }
    };

    // 3. Edit Title
    const startEditing = (project, e) => {
        e.stopPropagation();
        setEditingProjectId(project._id);
        setEditTitle(project.title);
    };

    const cancelEditing = (e) => {
        if (e) e.stopPropagation();
        setEditingProjectId(null);
        setEditTitle('');
    };

    const saveTitle = async (e) => {
        e.stopPropagation();
        if (!editTitle.trim()) return;

        const token = await getToken();
        await updateProjectTitle(editingProjectId, editTitle, token);
        setEditingProjectId(null);
    };

    const handleOpenProject = (projectId) => {
        navigate(`/quest/${projectId}`);
    };

    // --- Render Helpers ---

    return (
        <div className="min-h-screen bg-stone-50 relative">
            <BackgroundPattern variant="dots" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-display font-bold text-stone-900">Your Projects</h1>
                    <Button variant="teal" onClick={handleStartNewProject}>
                        <Plus className="w-4 h-4 mr-2" />
                        Start New Project
                    </Button>
                </div>

                {/* List */}
                {isLoading && projects.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700 mx-auto"></div>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="bg-white overflow-hidden shadow-md rounded-xl p-12 text-center border border-stone-200">
                        <p className="font-body text-stone-600 mb-6">No projects yet. Start your first journey!</p>
                        <button onClick={handleStartNewProject} className="text-teal-700 font-display font-medium hover:text-teal-800">
                            Create one now &rarr;
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div
                                key={project._id}
                                onClick={() => handleOpenProject(project._id)}
                                className="bg-white overflow-hidden shadow-sm rounded-xl hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-stone-200 hover:border-teal-200 group"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        {editingProjectId === project._id ? (
                                            <div className="flex items-center space-x-2 flex-grow mr-2" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    className="block w-full border-2 border-teal-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 px-3 py-2 font-display"
                                                    autoFocus
                                                />
                                                <button onClick={saveTitle} className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"><Check size={18} /></button>
                                                <button onClick={cancelEditing} className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"><X size={18} /></button>
                                            </div>
                                        ) : (
                                            <h3 className="text-xl font-display font-bold text-stone-900 truncate flex-grow pr-2">
                                                {project.title}
                                            </h3>
                                        )}

                                        {/* Action Buttons (Visible on Hover or if Editing) */}
                                        <div className={`flex items-center space-x-1 ${editingProjectId === project._id ? 'hidden' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                                            <button
                                                onClick={(e) => startEditing(project, e)}
                                                className="p-2 text-stone-400 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all"
                                                title="Rename"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => requestDelete(project, e)}
                                                className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-display font-medium text-stone-700">
                                                Progress
                                            </span>
                                            <span className="text-xs font-body text-stone-600">
                                                {(project.meta?.completionPercent || 0)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-teal-600 to-teal-700 rounded-full transition-all duration-500"
                                                style={{ width: `${project.meta?.completionPercent || 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="mt-4 flex items-center justify-between">
                                        {(() => {
                                            const percent = project.meta?.completionPercent || 0;
                                            const effectiveStatus = (project.status === 'draft' && percent === 100) ? 'completed' : project.status;

                                            const statusConfig = {
                                                completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
                                                archived: { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-300' },
                                                draft: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' }
                                            };

                                            const config = statusConfig[effectiveStatus] || statusConfig.draft;

                                            return (
                                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-display font-semibold border ${config.bg} ${config.text} ${config.border}`}>
                                                    {effectiveStatus === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1.5" />}
                                                    {effectiveStatus.charAt(0).toUpperCase() + effectiveStatus.slice(1)}
                                                </span>
                                            );
                                        })()}
                                        <span className="text-xs font-body text-stone-500">
                                            {new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- Modals --- */}

                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in-up">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                <Trash2 className="text-red-600" size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Delete Project?</h3>
                            <p className="text-sm text-center text-gray-500 mb-6">
                                Are you sure you want to delete <strong>{projectToDelete?.title}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium font-display text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Delete Project
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* New Project Modal */}
                {isNewProjectModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in-up">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Start New Project</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                                <input
                                    type="text"
                                    className="block w-full border-stone-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm px-3 py-2 border font-body"
                                    placeholder="e.g. My Awesome Quest"
                                    value={newProjectTitle}
                                    onChange={(e) => setNewProjectTitle(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setIsNewProjectModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmNewProject}
                                    disabled={!newProjectTitle.trim()}
                                    className="px-4 py-2 text-sm font-medium font-display text-white bg-teal-700 border border-transparent rounded-md hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create Project
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default Dashboard;

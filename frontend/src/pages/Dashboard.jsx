import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useQuestStore } from '../quest/engine/useQuestStore';
import { Trash2, Edit2, Check, X, Plus } from 'lucide-react'; // Assuming lucide-react or similar icons

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

        // Create project immediately? Or just navigate with state?
        // Requirement: "Allow users to name projects when creating them"
        // Let's create it immediately so it has an ID and title
        const title = newProjectTitle.trim();
        setIsNewProjectModalOpen(false); // Close first

        // We need updates to useQuestStore to support creating with title directly
        // But saveProject works.
        // Let's set context/answers to empty first via resetStore, then save.
        await saveProject(token, title);

        // After save, currentProjectId is set. usage of saveProject updates store.
        // We can navigate now. 
        // Note: saveProject is async. 
        navigate('/quest');
    };

    // 2. Delete Project
    const requestDelete = (project, e) => {
        e.stopPropagation();
        setProjectToDelete(project);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;
        const token = await getToken();
        await deleteProject(projectToDelete._id, token);
        setIsDeleteModalOpen(false);
        setProjectToDelete(null);
    };

    // 3. Edit Title
    const startEditing = (project, e) => {
        e.stopPropagation();
        setEditingProjectId(project._id);
        setEditTitle(project.title);
    };

    const cancelEditing = (e) => {
        e.stopPropagation();
        setEditingProjectId(null);
        setEditTitle('');
    };

    const saveTitle = async (e) => {
        e.stopPropagation();
        if (!editTitle.trim()) return;

        const token = await getToken();
        await updateProjectTitle(editingProjectId, editTitle.trim(), token);
        setEditingProjectId(null);
    };

    const handleOpenProject = async (projectId) => {
        const token = await getToken();
        await loadProject(projectId, token);
        navigate('/quest');
    };

    // --- Render Helpers ---

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Your Projects</h1>
                <button
                    onClick={handleStartNewProject}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Start New Project
                </button>
            </div>

            {/* List */}
            {isLoading && projects.length === 0 ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
            ) : projects.length === 0 ? (
                <div className="bg-white overflow-hidden shadow rounded-lg p-12 text-center">
                    <p className="text-gray-500 mb-6">No projects yet. Start your first journey!</p>
                    <button onClick={handleStartNewProject} className="text-indigo-600 font-medium hover:text-indigo-500">
                        Create one now &rarr;
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div
                            key={project._id}
                            onClick={() => handleOpenProject(project._id)}
                            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-indigo-100 group"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    {editingProjectId === project._id ? (
                                        <div className="flex items-center space-x-2 flex-grow mr-2" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                autoFocus
                                            />
                                            <button onClick={saveTitle} className="text-green-600 hover:text-green-700 p-1"><Check size={16} /></button>
                                            <button onClick={cancelEditing} className="text-red-600 hover:text-red-700 p-1"><X size={16} /></button>
                                        </div>
                                    ) : (
                                        <h3 className="text-lg font-medium text-gray-900 truncate flex-grow pr-2">
                                            {project.title}
                                        </h3>
                                    )}

                                    {/* Action Buttons (Visible on Hover or if Editing) */}
                                    <div className={`flex items-center space-x-1 ${editingProjectId === project._id ? 'hidden' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                                        <button
                                            onClick={(e) => startEditing(project, e)}
                                            className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors"
                                            title="Rename"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => requestDelete(project, e)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 mb-4">
                                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                                </p>

                                <div className="flex items-center justify-between mt-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            project.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {project.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {(project.meta?.completionPercent || 0)}% Complete
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
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
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
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Create Project
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

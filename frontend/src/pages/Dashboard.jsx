import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
            <div className="bg-white overflow-hidden shadow rounded-lg p-6 text-center">
                <p className="text-gray-500 mb-6">No projects yet.</p>
                <Link to="/quest" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Start New Project
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;

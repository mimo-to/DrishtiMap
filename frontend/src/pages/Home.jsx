import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to DrishtiMap</h1>
            <p className="text-xl text-gray-600 mb-8">AI-Powered Logical Framework Analysis Builder</p>

            <div className="flex justify-center gap-4">
                <Link to="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Enter App
                </Link>
            </div>
        </div>
    );
};

export default Home;

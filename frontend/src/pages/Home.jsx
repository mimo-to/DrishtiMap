import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth, UserButton } from '@clerk/clerk-react';

const Home = () => {
    const { isSignedIn, isLoaded } = useAuth();

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* 1. Header (Minimal Navigation) */}
            <header className="bg-white shadow-sm border-b border-gray-200 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Brand / Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="font-bold text-xl text-indigo-600 tracking-tight">
                            DrishtiMap
                        </Link>
                    </div>

                    {/* Right Side Actions */}
                    <nav className="flex items-center space-x-4">
                        {isLoaded && isSignedIn ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                                >
                                    Go to Dashboard
                                </Link>
                                <UserButton afterSignOutUrl="/" />
                            </>
                        ) : (
                            <Link
                                to="/signin"
                                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                            >
                                Sign In
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* 2. Main Hero Content */}
            <main className="flex-grow flex flex-col items-center justify-center -mt-16 px-4">
                <div className="text-center max-w-2xl mx-auto space-y-8">
                    {/* Logo/Icon Placeholder (optional visual anchor) */}
                    <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                        <span className="text-3xl">🗺️</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
                        Welcome to <span className="text-indigo-600">DrishtiMap</span>
                    </h1>

                    <p className="text-xl text-gray-500 leading-relaxed">
                        AI-Powered Logical Framework Analysis Builder for NGOs and Social Impact Projects.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                        {/* Primary CTA: "Enter App" */}
                        <Link
                            to="/dashboard"
                            className="px-8 py-4 bg-indigo-600 text-white text-lg rounded-xl font-semibold hover:bg-indigo-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                            Enter App
                        </Link>

                        {/* Secondary CTA: Dependent on Auth State */}
                        {isLoaded && !isSignedIn && (
                            <Link
                                to="/signin"
                                className="px-8 py-4 bg-white text-gray-700 text-lg rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                            >
                                Existing User? Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </main>

            {/* 3. Footer (Simple) */}
            <footer className="bg-white border-t border-gray-200 py-6">
                <div className="text-center text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} DrishtiMap. Built for Impact.
                </div>
            </footer>
        </div>
    );
};

export default Home;

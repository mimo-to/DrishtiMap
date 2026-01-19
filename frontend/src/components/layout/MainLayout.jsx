import { Outlet, Link } from 'react-router-dom';
import { UserButton, useAuth } from '@clerk/clerk-react';

const MainLayout = () => {
    const { isSignedIn } = useAuth();

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="font-bold text-xl font-display text-teal-700 hover:text-teal-800 transition-colors">
                        DrishtiMap
                    </Link>
                    <nav className="flex items-center space-x-4">
                        <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Home</Link>
                        <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Dashboard</Link>

                        {isSignedIn && (
                            <div className="ml-2">
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} DrishtiMap. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;

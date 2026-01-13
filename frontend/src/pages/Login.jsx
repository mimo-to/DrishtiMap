import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Label from '../components/ui/Label';

const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticating, error, user } = useAuthStore();

    // Local state for form
    const [role, setRole] = useState('user');

    // Redirect if already logged in
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(role);
        if (success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">Sign in</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        DrishtiMap Account (Dev Mode)
                    </p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        {/* Role Select (Dev Only) */}
                        <div>
                            <Label htmlFor="role-select" className="mb-1">Select Role (Dev Only)</Label>
                            <select
                                id="role-select"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                disabled={isAuthenticating}
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                This dropdown mimics different user personas for testing.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                isLoading={isAuthenticating}
                            >
                                {isAuthenticating ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </div>

                    </form>
                </Card>

                <div className="mt-6 text-center">
                    <Link to="/" className="text-primary hover:text-primary-hover text-sm font-medium">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const ProtectedRoute = () => {
    const { user, isAuthenticating } = useAuthStore();
    const location = useLocation();

    if (isAuthenticating) {
        // Minimal hydration UI (invisible to prevent flicker)
        return null;
    }

    if (!user) {
        // Redirect to login, preserving the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;

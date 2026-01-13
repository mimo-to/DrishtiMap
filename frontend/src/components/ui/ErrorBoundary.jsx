import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                    <div className="bg-white p-6 rounded shadow-md text-center">
                        <h1 className="text-xl font-bold text-red-600 mb-2">Something went wrong.</h1>
                        <p className="text-gray-600">Please refresh the page or try again later.</p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

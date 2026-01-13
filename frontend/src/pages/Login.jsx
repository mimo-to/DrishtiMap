import { Link } from 'react-router-dom';

const Login = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white shadow rounded-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Sign in</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        DrishtiMap Account
                    </p>
                </div>
                <div className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="p-4 text-center text-gray-500 border border-gray-300 rounded">
                            Login Form Placeholder
                        </div>
                    </div>
                    <div className="text-center">
                        <Link to="/" className="text-indigo-600 hover:text-indigo-500 text-sm">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

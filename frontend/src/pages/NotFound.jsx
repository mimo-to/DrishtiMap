import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="text-center py-16">
            <h1 className="text-9xl font-bold text-gray-200">404</h1>
            <h2 className="text-3xl font-bold text-gray-900 mt-4">Page Not Found</h2>
            <p className="text-gray-600 mt-4 mb-8">The page you are looking for does not exist.</p>
            <Link to="/" className="text-indigo-600 font-semibold hover:text-indigo-800">
                Go back home
            </Link>
        </div>
    );
};

export default NotFound;

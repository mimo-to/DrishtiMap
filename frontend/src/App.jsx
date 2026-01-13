import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ui/ErrorBoundary';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    {/* Standalone Layout */}
                    <Route path="/login" element={<Login />} />

                    {/* Main App Layout */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;

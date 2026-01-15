import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ui/ErrorBoundary';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import QuestPage from './pages/QuestPage'; // Import QuestPage
import ProtectedRoute from './components/layout/ProtectedRoute';

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                }}
            >
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/signin/*" element={<SignInPage />} />
                    <Route path="/signup/*" element={<SignUpPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<MainLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            {/* New Routes with Project Context */}
                            <Route path="/quest/:projectId" element={<QuestPage />} />
                            <Route path="/quest/:projectId/:levelId" element={<QuestPage />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;

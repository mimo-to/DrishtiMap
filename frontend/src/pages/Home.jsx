import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { BackgroundPattern } from '../components/ui/BackgroundPattern';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { HeroIllustration } from '../components/illustrations/HeroIllustration';
import { FileText, Zap, Shield } from 'lucide-react';

const Home = () => {
    const { isSignedIn, isLoaded } = useAuth();

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="font-display font-bold text-2xl text-stone-900">
                        DrishtiMap
                    </Link>

                    <nav className="flex items-center space-x-4">
                        {isLoaded && isSignedIn ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="text-sm font-display font-medium text-stone-700 hover:text-teal-700 transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <UserButton afterSignOutUrl="/" />
                            </>
                        ) : (
                            <Link
                                to="/signin"
                                className="text-sm font-display font-medium text-stone-700 hover:text-teal-700 transition-colors"
                            >
                                Sign In
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center">
                <BackgroundPattern variant="mesh" />
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="animate-fade-in-up">
                            <h1 className="font-display text-5xl md:text-6xl font-bold text-stone-900 mb-6">
                                Transform Your <span className="text-teal-700">Impact</span>
                            </h1>
                            <p className="font-body text-xl text-stone-600 mb-8">
                                AI-Powered Logical Framework Analysis Builder for NGOs and Social Impact Projects.
                                Make data-driven decisions with confidence.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/dashboard">
                                    <Button variant="teal" size="lg">
                                        Enter App
                                    </Button>
                                </Link>
                                {isLoaded && !isSignedIn && (
                                    <Link to="/signin">
                                        <Button variant="secondary" size="lg">
                                            Sign In
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <HeroIllustration />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-stone-50">
                <div className="container mx-auto px-6">
                    <h2 className="font-display text-4xl font-bold text-stone-900 mb-4 text-center">
                        Why Choose DrishtiMap
                    </h2>
                    <p className="font-body text-xl text-stone-600 text-center mb-12 max-w-2xl mx-auto">
                        Powerful features designed for impact-driven organizations
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        <Card hover={true}>
                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                                <FileText className="text-teal-700" size={24} />
                            </div>
                            <h3 className="font-display text-xl font-semibold mb-3 text-stone-900">
                                AI-Powered Research
                            </h3>
                            <p className="font-body text-stone-600">
                                Generate comprehensive research reports with real government schemes and data
                            </p>
                        </Card>

                        <Card hover={true}>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                                <Zap className="text-yellow-600" size={24} />
                            </div>
                            <h3 className="font-display text-xl font-semibold mb-3 text-stone-900">
                                Lightning Fast
                            </h3>
                            <p className="font-body text-stone-600">
                                Get insights in minutes, not days. Accelerate your decision-making process
                            </p>
                        </Card>

                        <Card hover={true}>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Shield className="text-green-600" size={24} />
                            </div>
                            <h3 className="font-display text-xl font-semibold mb-3 text-stone-900">
                                Verified Sources
                            </h3>
                            <p className="font-body text-stone-600">
                                All data backed by official government sources and verified statistics
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-20">
                <BackgroundPattern variant="grain" />
                <div className="container mx-auto px-6 text-center">
                    <h2 className="font-display text-4xl font-bold text-stone-900 mb-6">
                        Ready to get started?
                    </h2>
                    <p className="font-body text-xl text-stone-600 mb-8 max-w-2xl mx-auto">
                        Join organizations making data-driven impact decisions
                    </p>
                    <Link to="/dashboard">
                        <Button variant="teal" size="lg">
                            Start Your Journey
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-stone-100 border-t border-stone-200">
                <div className="container mx-auto px-6 py-8">
                    <div className="text-center">
                        <p className="font-body text-sm text-stone-600">
                            © {new Date().getFullYear()} DrishtiMap. Built for Impact.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;

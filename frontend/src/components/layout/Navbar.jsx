import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <a href="/" className="text-2xl font-display font-bold text-teal-900">
                        DrishtiMap
                    </a>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="/features" className="text-stone-700 hover:text-teal-700 transition-colors font-display">
                            Features
                        </a>
                        <a href="/pricing" className="text-stone-700 hover:text-teal-700 transition-colors font-display">
                            Pricing
                        </a>
                        <Button variant="primary" size="sm">Get Started</Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`
        fixed inset-y-0 right-0 w-64 bg-white shadow-2xl
        transform transition-transform duration-300 ease-[var(--ease-smooth)]
        ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        md:hidden
      `}>
                <div className="p-6 space-y-4">
                    <a href="/features" className="block text-stone-700 hover:text-teal-700 font-display">
                        Features
                    </a>
                    <a href="/pricing" className="block text-stone-700 hover:text-teal-700 font-display">
                        Pricing
                    </a>
                    <Button variant="primary" className="w-full">Get Started</Button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

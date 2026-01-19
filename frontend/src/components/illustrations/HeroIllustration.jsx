import React from 'react';

export const HeroIllustration = ({ className = "" }) => {
    return (
        <svg
            viewBox="0 0 400 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`w-full h-auto ${className}`}
        >
            <defs>
                <linearGradient id="grid-fade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Background Grid - Isometric Feel */}
            <path d="M0 150 L400 150" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
            <path d="M0 75 L400 75" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
            <path d="M0 225 L400 225" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
            <path d="M100 0 L100 300" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
            <path d="M200 0 L200 300" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
            <path d="M300 0 L300 300" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />

            {/* Central Node - Strategy/Vision */}
            <circle cx="200" cy="150" r="40" fill="url(#grid-fade)" className="text-teal-500 animate-pulse-slow" />
            <circle cx="200" cy="150" r="25" stroke="currentColor" strokeWidth="2" className="text-teal-600" />
            <circle cx="200" cy="150" r="12" fill="currentColor" className="text-teal-700" />

            {/* Connected Nodes - Network Effect */}
            <g className="text-stone-400">
                {/* Top Right */}
                <line x1="200" y1="150" x2="320" y2="80" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                <circle cx="320" cy="80" r="8" fill="white" stroke="currentColor" strokeWidth="2" />

                {/* Bottom Left */}
                <line x1="200" y1="150" x2="80" y2="220" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                <circle cx="80" cy="220" r="8" fill="white" stroke="currentColor" strokeWidth="2" />

                {/* Top Left */}
                <line x1="200" y1="150" x2="100" y2="90" stroke="currentColor" strokeWidth="1.5" />
                <rect x="90" y="80" width="20" height="20" rx="4" fill="white" stroke="currentColor" strokeWidth="2" />

                {/* Bottom Right */}
                <line x1="200" y1="150" x2="300" y2="200" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="300" cy="200" r="6" fill="currentColor" className="text-teal-400" />
            </g>

            {/* Floating Elements - Dynamic Feel */}
            <g className="animate-float">
                <circle cx="340" cy="100" r="4" fill="currentColor" className="text-teal-300" />
                <circle cx="60" cy="180" r="3" fill="currentColor" className="text-stone-300" />
                <circle cx="250" cy="250" r="5" fill="currentColor" className="text-teal-300" />
            </g>
        </svg>
    );
};

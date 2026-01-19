import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { BackgroundPattern } from '../components/ui/BackgroundPattern';

const SignUpPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 relative">
            <BackgroundPattern variant="grain" />
            <div className="relative z-10">
                <SignUp
                    path="/signup"
                    routing="path"
                    signInUrl="/signin"
                    forceRedirectUrl="/dashboard"
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "bg-white shadow-xl rounded-2xl border border-stone-200",
                            headerTitle: "font-display text-stone-900",
                            headerSubtitle: "font-body text-stone-600",
                            socialButtonsBlockButton: "border-stone-200 hover:bg-stone-50 font-display",
                            formButtonPrimary: "bg-gradient-to-br from-teal-700 to-teal-600 hover:shadow-lg font-display",
                            formFieldInput: "border-stone-200 focus:border-teal-500 focus:ring-teal-500 font-body",
                            footerActionLink: "text-teal-700 hover:text-teal-800 font-display"
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default SignUpPage;

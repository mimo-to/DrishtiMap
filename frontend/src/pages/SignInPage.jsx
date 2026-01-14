import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const SignInPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <SignIn
                path="/signin"
                routing="path"
                signUpUrl="/signup"
                forceRedirectUrl="/dashboard"
            />
        </div>
    );
};

export default SignInPage;

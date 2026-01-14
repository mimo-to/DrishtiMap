import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const SignUpPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <SignUp
                path="/signup"
                routing="path"
                signInUrl="/signin"
                forceRedirectUrl="/dashboard"
            />
        </div>
    );
};

export default SignUpPage;

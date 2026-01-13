import React, { forwardRef } from 'react';
import Label from './Label';

const Input = forwardRef(({
    label,
    id,
    type = 'text',
    error,
    helperText,
    className = '',
    ...props
}, ref) => {
    // Restrict to text-like inputs
    const allowedTypes = ['text', 'email', 'password'];
    const inputType = allowedTypes.includes(type) ? type : 'text';

    return (
        <div className="w-full">
            {label && <Label htmlFor={id} className="mb-1">{label}</Label>}

            <div className="relative">
                <input
                    ref={ref}
                    id={id}
                    type={inputType}
                    className={`
            block w-full rounded-md shadow-sm sm:text-sm
            border-gray-300 focus:border-primary focus:ring-primary
            disabled:bg-gray-100 disabled:text-gray-500
            ${error ? 'border-danger focus:border-danger focus:ring-danger' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>

            {error && (
                <p className="mt-1 text-sm text-danger">{error}</p>
            )}

            {!error && helperText && (
                <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;

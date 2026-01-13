import React from 'react';

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    isLoading = false,
    className = '',
    ...props
}) => {
    // Base styles
    const baseStyles = 'inline-flex items-center justify-center border font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';

    // Variants
    const variants = {
        primary: 'border-transparent text-white bg-primary hover:bg-primary-hover focus:ring-primary',
        secondary: 'border-transparent text-white bg-secondary hover:bg-secondary-hover focus:ring-secondary',
        danger: 'border-transparent text-white bg-danger hover:bg-red-600 focus:ring-danger',
        outline: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary',
    };

    // Sizes
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    // State styles
    const disabledStyles = (disabled || isLoading)
        ? 'opacity-75 cursor-not-allowed'
        : '';

    const widthStyles = fullWidth ? 'w-full' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${widthStyles}
        ${disabledStyles}
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;

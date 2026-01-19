import { Loader2 } from 'lucide-react';

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    ...props
}) => {
    const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-display font-medium rounded-lg
    transform transition-all duration-300 ease-[var(--ease-smooth)]
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;

    const variants = {
        primary: `
      bg-gradient-to-br from-stone-900 to-stone-800
      text-white hover:shadow-xl
      hover:scale-105 active:scale-95
      focus:ring-stone-500
    `,
        secondary: `
      bg-white border-2 border-stone-200
      text-stone-900 hover:border-stone-400 hover:shadow-md
      hover:scale-105 active:scale-95
      focus:ring-stone-300
    `,
        teal: `
      bg-gradient-to-br from-teal-700 to-teal-600
      text-white hover:shadow-xl
      hover:scale-105 active:scale-95
      focus:ring-teal-500
    `,
        ghost: `
      bg-transparent text-stone-700
      hover:bg-stone-100
      focus:ring-stone-300
    `,
        danger: `
      bg-gradient-to-br from-red-600 to-red-500
      text-white hover:shadow-xl
      hover:scale-105 active:scale-95
      focus:ring-red-500
    `
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {children}
        </button>
    );
};

export default Button;

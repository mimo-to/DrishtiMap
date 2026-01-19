export const Input = ({
    label,
    error,
    success,
    helperText,
    className = '',
    ...props
}) => {
    const borderColor = error
        ? 'border-red-500 focus:ring-red-500'
        : success
            ? 'border-green-500 focus:ring-green-500'
            : 'border-stone-200 focus:ring-teal-500';

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-stone-700 font-display">
                    {label}
                </label>
            )}
            <input
                className={`
          w-full px-4 py-3 rounded-lg
          border-2 ${borderColor}
          bg-white text-stone-900
          font-body
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          placeholder:text-stone-400
          ${className}
        `}
                {...props}
            />
            {helperText && !error && !success && (
                <p className="text-sm text-stone-500 font-body">{helperText}</p>
            )}
            {error && <p className="text-sm text-red-600 font-body">{error}</p>}
            {success && <p className="text-sm text-green-600 font-body">{success}</p>}
        </div>
    );
};

export default Input;

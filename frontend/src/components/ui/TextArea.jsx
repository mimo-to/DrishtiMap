import React from 'react';
import Label from './Label';

const TextArea = ({
    label,
    value,
    onChange,
    onBlur,
    placeholder,
    rows = 4,
    error,
    helperText,
    disabled
}) => {
    return (
        <div className="w-full">
            {label && <Label className="mb-1">{label}</Label>}
            <textarea
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                rows={rows}
                disabled={disabled}
                placeholder={placeholder}
                className={`
          block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm
          ${error
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-primary focus:ring-primary'
                    }
          ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
        `}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
        </div>
    );
};

export default TextArea;

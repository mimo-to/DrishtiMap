import React from 'react';
import Label from './Label';

const Select = ({
    label,
    value,
    onChange,
    onBlur,
    options = [],
    error,
    helperText,
    disabled
}) => {
    return (
        <div className="w-full">
            {label && <Label className="mb-1">{label}</Label>}
            <select
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
                className={`
          block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md
          ${error
                        ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300'
                    }
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
            >
                <option value="" disabled>Select an option</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
        </div>
    );
};

export default Select;

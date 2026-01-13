import React from 'react';

const Card = ({ children, className = '' }) => {
    return (
        <div className={`bg-surface shadow rounded-lg overflow-hidden p-6 ${className}`}>
            {children}
        </div>
    );
};

export default Card;

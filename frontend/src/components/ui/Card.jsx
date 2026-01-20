export const Card = ({ children, hover = true, className = '' }) => {
    return (
        <div className={`
      bg-white rounded-xl p-4 sm:p-6
      border border-stone-200
      shadow-sm
      transition-all duration-300 ease-[var(--ease-smooth)]
      ${hover ? 'hover:shadow-md hover:-translate-y-1' : ''}
      ${className}
    `}>
            {children}
        </div>
    );
};

export default Card;

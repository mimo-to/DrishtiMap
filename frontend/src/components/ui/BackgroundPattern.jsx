
export const BackgroundPattern = ({ variant = 'mesh', className = '' }) => {
  const patterns = {
    mesh: `
      linear-gradient(135deg, rgba(15, 118, 110, 0.05), rgba(202, 138, 4, 0.05)),
      repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(28,25,23,0.02) 2px, rgba(28,25,23,0.02) 4px),
      linear-gradient(to bottom, #fafaf9, #f5f5f4)
    `,
    noise: `
      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E"),
      linear-gradient(to bottom, #fafaf9, #f5f5f4)
    `,
    dots: `
      radial-gradient(circle at 25px 25px, rgba(28,25,23,0.05) 1px, transparent 1px),
      linear-gradient(to bottom, #fafaf9, #f5f5f4)
    `,
    grain: `
      url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='4'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='0.03'/%3E%3C/svg%3E"),
      linear-gradient(to bottom, #fafaf9, #f5f5f4)
    `
  };

  const backgroundSize = {
    mesh: 'auto',
    noise: 'auto',
    dots: '50px 50px, auto',
    grain: 'auto'
  };

  return (
    <div
      className={`absolute inset-0 -z-10 pointer-events-none ${className}`}
      style={{
        background: patterns[variant],
        backgroundSize: backgroundSize[variant]
      }}
      aria-hidden="true"
    />
  );
};

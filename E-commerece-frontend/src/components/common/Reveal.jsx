const Reveal = ({ delay = 0, className = '', children }) => (
  <div className={`animate-reveal ${className}`} style={{ animationDelay: `${delay}ms` }}>
    {children}
  </div>
);

export default Reveal;
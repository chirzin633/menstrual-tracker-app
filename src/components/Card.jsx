export default function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-pink-100 ${className}`}
    >
      {children}
    </div>
  );
}

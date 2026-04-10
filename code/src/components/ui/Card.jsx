const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl border border-gray-200 shadow-sm ${onClick ? "cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all" : ""} ${className}`}>
    {children}
  </div>
);

export default Card;

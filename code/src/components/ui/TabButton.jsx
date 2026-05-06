const TabButton = ({ active, onClick, children, icon: Icon, className = "" }) => (
  <button onClick={onClick} className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-2 text-xs font-medium border-b-2 transition-colors sm:px-4 sm:py-2.5 sm:text-sm ${active ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} ${className}`}>
    {Icon && <Icon size={16} />}{children}
  </button>
);

export default TabButton;

const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <button onClick={onClick} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${active ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
    {Icon && <Icon size={16} />}{children}
  </button>
);

export default TabButton;

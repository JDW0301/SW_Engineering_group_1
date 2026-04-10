import { MessageSquare, Search, Settings, LogOut } from "lucide-react";

const CustomerNav = ({ onLogout, setPage, setShowSearch, showSearch, page }) => (
  <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
    <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setPage("main"); setShowSearch(false); }}>
        <MessageSquare size={20} className="text-indigo-600" /><span className="font-bold text-gray-900">HelpDesk</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => { setShowSearch(!showSearch); if (page !== "search") setPage("search"); }} className="p-2 hover:bg-gray-100 rounded-lg"><Search size={18} /></button>
        <button onClick={() => setPage("settings")} className="p-2 hover:bg-gray-100 rounded-lg"><Settings size={18} /></button>
        <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded-lg text-red-500"><LogOut size={18} /></button>
      </div>
    </div>
  </div>
);

export default CustomerNav;

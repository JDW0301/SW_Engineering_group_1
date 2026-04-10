import { Home, MessageSquare, BarChart3, Settings, LogOut, Menu } from "lucide-react";

const OperatorNav = ({ page, setPage, onLogout, sideNav, setSideNav, storeName }) => (
  <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
    <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
      <div className="flex items-center gap-3">
        <button onClick={() => setSideNav(!sideNav)} className="p-1 lg:hidden"><Menu size={20} /></button>
        <div className="flex items-baseline gap-2 cursor-pointer" onClick={() => setPage("main")}>
          <span className="font-bold text-gray-900">{storeName}</span>
          <span className="text-xs text-gray-400">관리자</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage("main")} className={`p-2 rounded-lg ${page === "main" ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-100"}`}><Home size={18} /></button>
        <button onClick={() => setPage("channel")} className={`p-2 rounded-lg ${page === "channel" ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-100"}`}><MessageSquare size={18} /></button>
        <button onClick={() => setPage("stats")} className={`p-2 rounded-lg ${page === "stats" ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-100"}`}><BarChart3 size={18} /></button>
        <button onClick={() => setPage("settings")} className={`p-2 rounded-lg ${page === "settings" ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-100"}`}><Settings size={18} /></button>
        <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded-lg text-red-500 ml-2"><LogOut size={18} /></button>
      </div>
    </div>
  </div>
);

export default OperatorNav;

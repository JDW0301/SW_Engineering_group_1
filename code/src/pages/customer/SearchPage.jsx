import { useState } from "react";
import { ArrowLeft, Search, Store } from "lucide-react";
import { Card } from "../../components/ui";
import { MOCK_STORES } from "../../data/mockData";

const SearchPage = ({ setPage, openStore, searchQuery }) => {
  const [q, setQ] = useState(searchQuery);
  const [tab, setTab] = useState("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const cats = ["all", "의류", "음식", "전자기기", "생활용품", "기타"];
  const results = MOCK_STORES.filter(s => (tab === "all" || s.category === tab) && (!q || s.name.includes(q)));
  const suggestions = q.length > 0 ? MOCK_STORES.filter(s => s.name.includes(q)).slice(0, 5) : [];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setPage("main")}><ArrowLeft size={20} /></button>
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm" placeholder="스토어 검색..." value={q}
            onChange={e => { setQ(e.target.value); setShowSuggestions(true); }}
            onFocus={() => q && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            autoFocus />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 overflow-hidden">
              {suggestions.map(s => (
                <button key={s.id} className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 flex items-center gap-2 transition"
                  onMouseDown={() => { openStore(s); setShowSuggestions(false); }}>
                  <Store size={14} className="text-gray-400" />
                  <span>{s.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{s.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {cats.map(c => (
          <button key={c} onClick={() => setTab(c)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${tab === c ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}>
            {c === "all" ? "전체" : c}
          </button>
        ))}
      </div>
      {!q && <p className="text-xs text-gray-400 mb-3">내가 주문한 적 있는 스토어</p>}
      <div className="space-y-2">
        {results.map(s => (
          <Card key={s.id} className="p-3 flex items-center gap-3" onClick={() => openStore(s)}>
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center"><Store size={18} className="text-indigo-500" /></div>
            <div><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-gray-400">{s.category}</p></div>
          </Card>
        ))}
        {results.length === 0 && <p className="text-sm text-gray-400 text-center py-8">검색 결과가 없습니다</p>}
      </div>
    </div>
  );
};

export default SearchPage;

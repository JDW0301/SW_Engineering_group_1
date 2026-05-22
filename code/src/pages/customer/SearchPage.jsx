import { useState } from "react";
import { ArrowLeft, Package, Search, Store } from "lucide-react";
import { Card } from "../../components/ui";

const normalize = (value) => String(value ?? "").toLocaleLowerCase();

const formatPrice = (price) => {
  if (price === null || price === undefined || price === "") return "";
  const numericPrice = Number(price);
  return Number.isNaN(numericPrice) ? String(price) : `${numericPrice.toLocaleString()}원`;
};

const SearchPage = ({ setPage, openStore, searchQuery, stores = [], allStores = [], products = [] }) => {
  const [q, setQ] = useState(searchQuery);
  const [tab, setTab] = useState("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchStores = allStores.length > 0 ? allStores : stores;
  const query = normalize(q).trim();
  const categories = [
    "all",
    ...Array.from(new Set([
      ...searchStores.map(store => store.category).filter(Boolean),
      ...products.map(product => product.storeCategory).filter(Boolean),
    ])),
  ];
  const matchesQuery = (...values) => !query || values.some(value => normalize(value).includes(query));
  const matchesCategory = (category) => tab === "all" || category === tab;
  const storeResults = searchStores.filter(store => matchesCategory(store.category) && matchesQuery(store.name, store.category, store.desc, store.description));
  const productResults = query
    ? products.filter(product => matchesCategory(product.storeCategory) && matchesQuery(product.name, product.description))
    : [];
  const findProductStore = (product) => searchStores.find(store => store.id === product.storeId)
    || stores.find(store => store.id === product.storeId)
    || searchStores.find(store => store.name === product.storeName)
    || stores.find(store => store.name === product.storeName)
    || { id: product.storeId, name: product.storeName, category: product.storeCategory, desc: "" };
  const storeSuggestions = query ? storeResults.slice(0, 3).map(store => ({ type: "store", store })) : [];
  const productSuggestions = query ? productResults.slice(0, 3).map(product => ({ type: "product", product })) : [];
  const suggestions = [...storeSuggestions, ...productSuggestions].slice(0, 5);
  const hasResults = storeResults.length > 0 || productResults.length > 0;

  const openProductStore = (product) => {
    openStore(findProductStore(product));
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setPage("main")}><ArrowLeft size={20} /></button>
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm" placeholder="스토어 또는 상품 검색..." value={q}
            onChange={e => { setQ(e.target.value); setShowSuggestions(true); }}
            onFocus={() => q && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            autoFocus />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 overflow-hidden">
              {suggestions.map(suggestion => suggestion.type === "store" ? (
                <button key={`store-${suggestion.store.id}`} className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 flex items-center gap-2 transition"
                  onMouseDown={() => { openStore(suggestion.store); setShowSuggestions(false); }}>
                  <Store size={14} className="text-gray-400" />
                  <span>{suggestion.store.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{suggestion.store.category}</span>
                </button>
              ) : (
                <button key={`product-${suggestion.product.id}`} className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 flex items-center gap-2 transition"
                  onMouseDown={() => { openProductStore(suggestion.product); setShowSuggestions(false); }}>
                  <Package size={14} className="text-gray-400" />
                  <span>{suggestion.product.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{suggestion.product.storeName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {categories.map(category => (
          <button key={category} onClick={() => setTab(category)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${tab === category ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}>
            {category === "all" ? "전체" : category}
          </button>
        ))}
      </div>
      {!q && <p className="text-xs text-gray-400 mb-3">검색 가능한 스토어</p>}
      {q && <p className="text-xs text-gray-400 mb-3">스토어와 상품 검색 결과</p>}
      <div className="space-y-2">
        {storeResults.map(store => (
          <Card key={store.id} className="p-3 flex items-center gap-3" onClick={() => openStore(store)}>
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center"><Store size={18} className="text-indigo-500" /></div>
            <div className="min-w-0"><p className="text-sm font-medium truncate">{store.name}</p><p className="text-xs text-gray-400 truncate">{store.category}{store.desc ? ` · ${store.desc}` : ""}</p></div>
          </Card>
        ))}
        {productResults.map(product => {
          const price = formatPrice(product.price);
          return (
            <Card key={product.id} className="p-3 flex items-center gap-3" onClick={() => openProductStore(product)}>
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center"><Package size={18} className="text-indigo-500" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-500 truncate">{product.storeName}</p>
                {product.description && <p className="text-xs text-gray-400 truncate">{product.description}</p>}
              </div>
              {price && <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{price}</span>}
            </Card>
          );
        })}
        {!hasResults && <p className="text-sm text-gray-400 text-center py-8">검색 결과가 없습니다</p>}
      </div>
    </div>
  );
};

export default SearchPage;

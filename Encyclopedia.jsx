import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { api } from "../../api";
import Sidebar from "./Sidebar";

export default function Encyclopedia() {
  const [concepts, setConcepts] = useState([]);
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const isRootPage = location.pathname === "/encyclopedia";

  // Fetch unified encyclopedia entries
  useEffect(() => {
    api.get("/concepts").then((res) => {
      setConcepts(res.data);

      const grouped = {};
      res.data.forEach((item) => {
        const cat = item.category || (item.type === 'drill' ? "Drills" : "Uncategorized");
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
      });

      setCategories(grouped);
    });
  }, []);

  // Filter logic
  const filteredConcepts = concepts.filter((c) => {
    const combined = `
      ${c.title || ""}
      ${c.summary || ""}
      ${c.category || ""}
      ${c.type || ""}
      ${c.tags?.join(" ") || ""}
    `.toLowerCase();

    const matchesSearch = search ? combined.includes(search.toLowerCase()) : true;
    const matchesCategory = selectedCategory
      ? (c.category || (c.type === 'drill' ? "Drills" : "Uncategorized")) === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {isRootPage && (
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      <div className="flex-1 p-6 overflow-auto">
        {/* Header - Search and Actions */}
        {isRootPage && (
          <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="relative flex-1 w-full max-w-md">
              <input
                type="text"
                placeholder="Search articles, drills, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-2 pl-3 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              onClick={resetFilters}
              className="whitespace-nowrap bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition font-bold"
            >
              Clear Filters
            </button>

          </div>
        )}

        {/* This is where List.jsx or ConceptDetail.jsx will render */}
        <div className="animate-in fade-in duration-300">
          <Outlet
            context={{
              concepts: filteredConcepts,
              search: search
            }}
          />
        </div>

        {/* Empty State */}
        {isRootPage && filteredConcepts.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">No results found matching your search.</p>
            <button onClick={resetFilters} className="text-blue-600 underline mt-2">
              View all entries
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
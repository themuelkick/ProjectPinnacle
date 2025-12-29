import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import Sidebar from "./Sidebar";

/**
 * Transforms flat data into a folder-style tree structure
 */
const buildTree = (data) => {
  const tree = {};
  data.forEach((item) => {
    const path = item.category || (item.type === 'drill' ? "Drills" : "Uncategorized");
    const parts = path.split("/");
    let currentLevel = tree;

    parts.forEach((part, index) => {
      if (!currentLevel[part]) {
        currentLevel[part] = { _items: [], _isCategory: true };
      }
      if (index === parts.length - 1) {
        currentLevel[part]._items.push(item);
      }
      currentLevel = currentLevel[part];
    });
  });
  return tree;
};

export default function Encyclopedia() {
  const [concepts, setConcepts] = useState([]);
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const isRootPage = location.pathname === "/encyclopedia";

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        console.log("Fetching from Supabase...");

        const { data, error } = await supabase
          .from("concepts")
          .select("*")
          .order("title", { ascending: true });

        if (error) {
          console.error("Supabase Query Error:", error.message);
          return;
        }

        if (data) {
          console.log("Data received:", data);
          setConcepts(data);
          setCategories(buildTree(data));
        }
      } catch (err) {
        console.error("Unexpected Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  // Filter logic remains the same
  const filteredConcepts = concepts.filter((c) => {
    const combined = `
      ${c.title || ""}
      ${c.summary || ""}
      ${c.body || ""}
      ${c.category || ""}
      ${c.type || ""}
    `.toLowerCase();

    const matchesSearch = search ? combined.includes(search.toLowerCase()) : true;
    const currentCategoryPath = c.category || (c.type === 'drill' ? "Drills" : "Uncategorized");

    const matchesCategory = selectedCategory
      ? currentCategoryPath === selectedCategory || currentCategoryPath.startsWith(`${selectedCategory}/`)
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
        {/* Header/Search Bar */}
        {isRootPage && (
          <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
            <div className="relative flex-1 w-full max-w-md">
              <input
                type="text"
                placeholder="Search articles, drills, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-2 pl-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
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

        {/* Dynamic Content Area */}
        <div className="animate-in fade-in duration-300">
          <Outlet context={{ concepts: filteredConcepts, search: search }} />
        </div>

        {/* Loading/Empty State Visuals */}
        {loading && (
          <div className="text-center py-20 text-blue-600 font-bold animate-pulse">
            LOADING DATABASE...
          </div>
        )}

        {!loading && isRootPage && filteredConcepts.length === 0 && (
          <div className="text-center py-20 text-gray-500 bg-white border border-dashed rounded-lg">
            <p className="text-xl">No results found.</p>
            <button onClick={resetFilters} className="text-blue-600 underline mt-2 font-bold">
              View all entries
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
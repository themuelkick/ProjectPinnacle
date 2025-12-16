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

  // Fetch concepts
  useEffect(() => {
    api.get("/concepts").then((res) => {
      setConcepts(res.data);

      const grouped = {};
      res.data.forEach((c) => {
        const cat = c.category || "Uncategorized";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(c);
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
      ${c.tags?.join(" ") || ""}
    `.toLowerCase();

    const matchesSearch = search
      ? combined.includes(search.toLowerCase())
      : true;

    const matchesCategory = selectedCategory
      ? (c.category || "Uncategorized") === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory(null);
  };

  return (
    <div className="flex h-screen">
      {isRootPage && (
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        {isRootPage && (
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="Search concepts, tags, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md p-2 border rounded"
            />

            <button
              onClick={resetFilters}
              className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300"
            >
              Reset
            </button>

            <button
              onClick={() => navigate("/encyclopedia/new")}
              className="bg-blue-600 text-white px-4 py-2 rounded ml-auto"
            >
              + New Concept
            </button>
          </div>
        )}

        <Outlet
          context={{
            concepts: filteredConcepts,
          }}
        />
      </div>
    </div>
  );
}

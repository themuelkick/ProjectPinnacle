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

  // Determine if we're on a detail / edit / new page
  const isRootPage = location.pathname === "/encyclopedia";

  // ---------------------------------------
  // Fetch concepts once
  // ---------------------------------------
  useEffect(() => {
    api.get("/concepts").then((res) => {
      setConcepts(res.data);

      // Build category tree
      const grouped = {};
      res.data.forEach((c) => {
        const cat = c.category || "Uncategorized";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(c);
      });

      setCategories(grouped);
    });
  }, []);

  // ---------------------------------------
  // Filter concepts (search + category)
  // ---------------------------------------
  const filteredConcepts = concepts.filter((c) => {
    const searchText = search.toLowerCase();

    const combined =
      `${c.title || ""} ${c.summary || ""} ${c.category || ""} ${
        c.tags?.join(" ") || ""
      }`.toLowerCase();

    const matchesSearch = searchText
      ? combined.includes(searchText)
      : true;

    const matchesCategory = selectedCategory
      ? (c.category || "Uncategorized") === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-screen">
      {/* Sidebar only shows on encyclopedia root */}
      {isRootPage && (
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      {/* Main panel */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Header (only on root list view) */}
        {isRootPage && (
          <div className="flex items-center justify-between mb-4 gap-4">
            <input
              type="text"
              placeholder="Search concepts, tags, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md p-2 border rounded"
            />

            <button
              onClick={() => navigate("/encyclopedia/new")}
              className="bg-blue-600 text-white px-4 py-2 rounded whitespace-nowrap"
            >
              + New Concept
            </button>
          </div>
        )}

        {/* Child routes */}
        <Outlet
          context={{
            concepts: filteredConcepts,
            clearFilters: () => {
              setSearch("");
              setSelectedCategory(null);
            },
          }}
        />
      </div>
    </div>
  );
}

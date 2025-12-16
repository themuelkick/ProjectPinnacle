import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ categories, selectedCategory, onSelectCategory }) {
  const [openCategories, setOpenCategories] = useState({});
  const navigate = useNavigate();

  const toggle = (cat) => {
    setOpenCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-900 p-4 overflow-auto border-r">
      <h2 className="font-bold mb-4 text-gray-800 dark:text-gray-200">
        Categories
      </h2>

      {Object.keys(categories).length === 0 && (
        <p className="text-sm text-gray-500">No categories</p>
      )}

      {Object.keys(categories).map((cat) => (
        <div key={cat} className="mb-2">
          {/* Category header */}
          <button
            onClick={() => {
              toggle(cat);
              onSelectCategory(cat);
            }}
            className={`w-full text-left font-semibold flex items-center gap-1
              ${selectedCategory === cat ? "text-blue-600" : "text-gray-800 dark:text-gray-200"}
            `}
          >
            <span>{openCategories[cat] ? "▼" : "▶"}</span>
            <span>{cat}</span>
          </button>

          {/* Concepts under category */}
          {openCategories[cat] && (
            <ul className="ml-5 mt-1 space-y-1">
              {categories[cat].map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => navigate(`/encyclopedia/${c.id}`)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 text-left"
                  >
                    {c.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </aside>
  );
}

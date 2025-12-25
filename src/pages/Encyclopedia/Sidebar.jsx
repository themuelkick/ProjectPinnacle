import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * A recursive component that renders a category "node" and its children.
 */
function SidebarItem({ label, node, fullPath, selectedCategory, onSelectCategory, navigate }) {
  const [isOpen, setIsOpen] = useState(false);

  // Separate the sub-category keys from the items array
  const subCategoryKeys = Object.keys(node).filter(
    (key) => key !== "_items" && key !== "_isCategory"
  );
  const items = node._items || [];

  const handleCategoryClick = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    onSelectCategory(fullPath);
  };

  return (
    <div className="mb-1">
      {/* Category Folder Row */}
      <button
        onClick={handleCategoryClick}
        className={`w-full text-left font-semibold flex items-center gap-2 py-1.5 px-2 rounded transition-colors
          ${selectedCategory === fullPath
            ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
            : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800"
          }
        `}
      >
        <span className="text-[10px] w-3 flex-shrink-0">
          {subCategoryKeys.length > 0 || items.length > 0 ? (isOpen ? "▼" : "▶") : ""}
        </span>
        <span className="truncate text-sm">{label}</span>
      </button>

      {/* Nested Content */}
      {isOpen && (
        <div className="ml-3 mt-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
          {/* 1. Render Sub-folders (Recursion) */}
          {subCategoryKeys.map((subKey) => (
            <SidebarItem
              key={subKey}
              label={subKey}
              node={node[subKey]}
              fullPath={`${fullPath}/${subKey}`}
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory}
              navigate={navigate}
            />
          ))}

          {/* 2. Render Individual Items (Drills/Concepts) */}
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/encyclopedia/${item.id}`)}
              className="block w-full text-left text-xs py-1.5 px-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 truncate"
            >
              • {item.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ categories, selectedCategory, onSelectCategory }) {
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-900 p-4 overflow-auto border-r h-full custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-gray-800 dark:text-gray-200 uppercase text-xs tracking-wider">
          Library
        </h2>
      </div>

      {Object.keys(categories).length === 0 ? (
        <p className="text-sm text-gray-500 italic px-2">No categories found</p>
      ) : (
        <nav className="space-y-1">
          {Object.keys(categories).map((rootKey) => (
            <SidebarItem
              key={rootKey}
              label={rootKey}
              node={categories[rootKey]}
              fullPath={rootKey}
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory}
              navigate={navigate}
            />
          ))}
        </nav>
      )}
    </aside>
  );
}
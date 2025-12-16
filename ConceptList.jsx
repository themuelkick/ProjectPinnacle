import { useOutletContext, Link } from "react-router-dom";

export default function ConceptList() {
  // Get filtered concepts from Outlet context
  const { concepts } = useOutletContext();

  if (!concepts || concepts.length === 0) {
    return <p className="text-gray-500">No concepts found.</p>;
  }

  return (
    <div className="space-y-4">
      {concepts.map((c) => (
        <div key={c.id} className="border rounded p-4 bg-white shadow hover:shadow-md transition">
          <Link
            to={`/encyclopedia/${c.id}`}
            className="text-lg font-semibold text-blue-600 hover:underline"
          >
            {c.title}
          </Link>

          {c.summary && (
            <p className="text-sm text-gray-600 mt-1">{c.summary}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {c.category && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                {c.category}
              </span>
            )}

            {c.tags?.map((tag) => (
              <span
                key={tag}
                className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

import { useOutletContext, Link } from "react-router-dom";

export default function ConceptList() {
  // We assume the parent (Encyclopedia.jsx) fetches these from Supabase
  // and passes them down via <Outlet context={{ concepts }} />
  const { concepts } = useOutletContext();

  if (!concepts || concepts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl">
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
          No Intelligence Found in this Sector
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {concepts.map((c) => (
        <Link
          key={c.id}
          to={`/encyclopedia/${c.id}`}
          className="group relative overflow-hidden bg-gray-900/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:border-blue-500/50 transition-all duration-300 shadow-xl"
        >
          {/* Subtle Glow Effect on Hover */}
          <div className="absolute -inset-px bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500 rounded-2xl" />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-black italic tracking-tighter text-white group-hover:text-blue-400 transition-colors uppercase">
                {c.title}
              </h3>
              {c.category && (
                <span className="text-[9px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded uppercase tracking-tighter">
                  {c.category}
                </span>
              )}
            </div>

            {c.summary && (
              <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 font-medium">
                {c.summary}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {c.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300 transition-colors"
                >
                  #{tag.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
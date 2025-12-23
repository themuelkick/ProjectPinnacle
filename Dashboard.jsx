import { useState, useEffect } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = () => {
    api.get("/players").then((res) => setPlayers(res.data));
  };

  const handleDelete = async (e, id, name) => {
    // 1. Stop the click from navigating to the Player Detail page
    e.preventDefault();
    e.stopPropagation();

    // 2. First confirmation
    const confirmFirst = window.confirm(
      `Are you sure you want to delete ${name}? This will remove all their sessions and data.`
    );

    if (confirmFirst) {
      // 3. Second confirmation (The "Double Check")
      const confirmSecond = window.confirm(
        "FINAL WARNING: This action is permanent and cannot be undone. Proceed?"
      );

      if (confirmSecond) {
        try {
          await api.delete(`/players/${id}`);
          // 4. Update local state so the card disappears immediately
          setPlayers(players.filter(p => p.id !== id));
        } catch (err) {
          console.error("Failed to delete player", err);
          alert("Error deleting player. Please try again.");
        }
      }
    }
  };

  const filteredPlayers = players.filter((p) =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">

      {/* Header & Search Section */}
      <div className="text-center space-y-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">
            Dashboard
          </h1>
          <p className="text-blue-400 text-xs font-black uppercase tracking-[0.3em] ml-1">
            Pinnacle Player Development System
          </p>
        </div>

        <div className="max-w-xl mx-auto relative group">
          <div className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
          <input
            type="text"
            placeholder="Search Roster..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="relative w-full bg-gray-900/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/30 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xl text-lg"
          />
        </div>
      </div>

      {/* Players Grid Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            Active Roster
            <span className="text-blue-500 text-sm italic">[{filteredPlayers.length}]</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((p) => (
            <Link
              key={p.id}
              to={`/players/${p.id}`}
              className="group relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 transition-all hover:bg-white/[0.08] hover:border-blue-500/50 hover:-translate-y-1 shadow-xl overflow-hidden"
            >
              {/* Double-Confirmation Delete Button */}
              <button
                onClick={(e) => handleDelete(e, p.id, `${p.first_name} ${p.last_name}`)}
                className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                title="Delete Profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <div className="absolute -right-4 -top-4 text-white/[0.02] font-black text-6xl italic">
                {p.position || "P"}
              </div>

              <div className="flex items-center gap-5 relative z-10">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-xl font-black text-white shadow-lg group-hover:scale-110 transition-transform">
                  {p.first_name[0]}{p.last_name[0]}
                </div>

                <div className="flex flex-col">
                  <span className="text-lg font-black text-white leading-tight group-hover:text-blue-400 transition-colors">
                    {p.first_name} {p.last_name}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                      {p.position || "Prospect"}
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="text-[10px] font-bold text-white/40 uppercase">
                      {p.team || "Independent"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center border-t border-white/5 pt-4">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest group-hover:text-white/40 transition-colors">
                  View Analytics Profile
                </span>
                <span className="text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
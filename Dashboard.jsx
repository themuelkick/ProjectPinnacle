import { useState, useEffect } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/players").then((res) => setPlayers(res.data));
  }, []);

  // Filter players based on search input
  const filteredPlayers = players.filter((p) =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
            Dashboard
          </h1>
          <p className="text-white/60 text-sm font-bold uppercase tracking-widest mt-1">
            Player Development System
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <input
            type="text"
            placeholder="Search players by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xl"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-3 text-white/40 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Players Section */}
      <section className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
            Players
          </h2>
          <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1 rounded-full uppercase">
            {filteredPlayers.length} {search ? 'Found' : 'Total'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredPlayers.map((p) => (
            <Link
              key={p.id}
              to={`/players/${p.id}`}
              className="flex items-center p-4 border border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors mr-4">
                {p.first_name[0]}{p.last_name[0]}
              </div>
              <span className="text-gray-900 font-bold group-hover:text-blue-700">
                {p.first_name} {p.last_name}
              </span>
            </Link>
          ))}
        </div>

        {/* Empty States */}
        {players.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 italic">No players added to the system yet.</p>
          </div>
        ) : filteredPlayers.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 italic">No players match "{search}"</p>
          </div>
        )}
      </section>
    </div>
  );
}
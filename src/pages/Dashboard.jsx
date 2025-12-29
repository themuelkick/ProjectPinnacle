import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // Use your new Supabase client
import { useAuth } from "../context/AuthContext"; // Import our role logic
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { profile, user } = useAuth(); // Grab the user's role
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchPlayers();
  }, [user]);

  const fetchPlayers = async () => {
    // Supabase query: Only gets players this coach is allowed to see via RLS
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('last_name', { ascending: true });

    if (!error) setPlayers(data);
    setLoading(false);
  };

  const handleDelete = async (e, id, name) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm(`Are you sure you want to delete ${name}?`) &&
        window.confirm("FINAL WARNING: This is permanent. Proceed?")) {
      try {
        const { error } = await supabase.from('players').delete().eq('id', id);
        if (error) throw error;
        setPlayers(players.filter(p => p.id !== id));
      } catch (err) {
        alert("Error deleting player.");
      }
    }
  };

  const filteredPlayers = players.filter((p) =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-screen w-full">
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(10,15,24,0.7)_100%)]"></div>

      <div className="relative z-10 max-w-6xl mx-auto p-8 space-y-12">

        {/* Header & Search Section */}
        <div className="text-center space-y-6">
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic drop-shadow-2xl">
              Dashboard
            </h1>
            <p className="text-blue-400 text-xs font-black uppercase tracking-[0.3em] ml-1 drop-shadow-md">
              Welcome Back, {profile?.role} System
            </p>
          </div>

          <div className="max-w-xl mx-auto relative group">
            <input
              type="text"
              placeholder="Search Roster..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="relative w-full bg-gray-900/60 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/30 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xl text-lg"
            />
          </div>
        </div>

        {/* --- BUSINESS TIERS SECTION --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 1. Encyclopedia - Available to COACH, PRO, ADMIN */}
          <Link to="/encyclopedia" className="group relative p-8 bg-gray-900/60 border border-white/10 rounded-3xl overflow-hidden transition-all hover:border-blue-500/50">
            <div className="absolute top-0 right-0 p-4 text-white/5 font-black text-4xl">LIB</div>
            <h3 className="text-2xl font-black text-white uppercase italic">Encyclopedia</h3>
            <p className="text-gray-400 text-sm mt-2">Access standard drill libraries and mechanics guides.</p>
            <div className="mt-4 text-blue-500 font-bold text-xs uppercase tracking-widest">Enter Archive →</div>
          </Link>

          {/* 2. Intelligence Hub - ONLY PRO & ADMIN */}
          {(profile?.role === 'pro' || profile?.role === 'admin') ? (
            <Link to="/intelligence-hub" className="group relative p-8 bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-blue-500/30 rounded-3xl overflow-hidden transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <div className="absolute top-0 right-0 p-4 text-blue-400/10 font-black text-4xl">IQ</div>
              <h3 className="text-2xl font-black text-blue-400 uppercase italic">Intelligence Hub</h3>
              <p className="text-blue-100/60 text-sm mt-2">Advanced data and collaborative encyclopedia.</p>
              <div className="mt-4 text-white font-bold text-xs uppercase tracking-widest bg-blue-600 inline-block px-3 py-1 rounded">Pro Access Active</div>
            </Link>
          ) : (
            /* Locked State for Basic Coach */
            <div className="relative p-8 bg-gray-900/20 border border-white/5 rounded-3xl opacity-50 grayscale">
               <h3 className="text-2xl font-black text-gray-500 uppercase italic">Intelligence Hub</h3>
               <p className="text-gray-600 text-sm mt-2">Advanced data is locked for Standard Coach accounts.</p>
               <button className="mt-4 text-gray-600 font-bold text-xs uppercase tracking-widest border border-gray-700 px-3 py-1 rounded cursor-not-allowed">Upgrade to Pro</button>
            </div>
          )}
        </section>

        {/* Players Grid Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              Active Roster
              <span className="text-blue-500 text-sm italic">[{filteredPlayers.length}]</span>
            </h2>
            <Link to="/players/new" className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-colors">
              + New Player
            </Link>
          </div>

          {loading ? (
             <div className="text-white/20 animate-pulse font-black text-center py-20 uppercase tracking-widest">Scanning Database...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlayers.map((p) => (
                <Link key={p.id} to={`/players/${p.id}`} className="group relative bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:bg-white/[0.08] hover:border-blue-500/50 hover:-translate-y-1 shadow-xl overflow-hidden">
                  <button
                    onClick={(e) => handleDelete(e, p.id, `${p.first_name} ${p.last_name}`)}
                    className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-5 relative z-10">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-xl font-black text-white shadow-lg">
                      {p.first_name[0]}{p.last_name[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-white leading-tight group-hover:text-blue-400">
                        {p.first_name} {p.last_name}
                      </span>
                      <span className="text-[10px] font-black text-blue-500 uppercase mt-1">
                        {p.position || "Prospect"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
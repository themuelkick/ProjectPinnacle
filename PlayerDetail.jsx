import { useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { api } from "../api";
import SessionTimeline from "./Session/components/SessionTimeline";
import SessionModal from "./Session/components/SessionModal";

export default function PlayerDetail() {
  const { id: playerId } = useParams();

  const [player, setPlayer] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [modalSession, setModalSession] = useState(null);
  const [activeTab, setActiveTab] = useState("profile"); // profile, analytics

  // ----------------------------
  // Fetch helpers
  // ----------------------------
  const fetchPlayer = async () => {
    const res = await api.get(`/players/${playerId}`);
    setPlayer(res.data);
  };

  const fetchSessions = async () => {
    const res = await api.get(`/sessions/player/${playerId}`);
    setSessions(res.data);
  };

  useEffect(() => {
    fetchPlayer();
    fetchSessions();
  }, [playerId]);

  // ----------------------------
  // Analytics Logic (Career Averages)
  // ----------------------------
  const careerAverages = useMemo(() => {
    const stats = {};

    sessions.forEach((s) => {
      s.metrics.forEach((group) => {
        const pType = group.pitch_type;
        if (!stats[pType]) {
          stats[pType] = { count: 0, sums: {} };
        }
        stats[pType].count += 1;

        group.metrics.forEach((m) => {
          const val = parseFloat(m.metric_value);
          if (!isNaN(val)) {
            stats[pType].sums[m.metric_name] = (stats[pType].sums[m.metric_name] || 0) + val;
          }
        });
      });
    });

    return stats;
  }, [sessions]);

  // ----------------------------
  // Session deletion
  // ----------------------------
  const handleDeleteSession = async (sessionId) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      await api.delete(`/sessions/${sessionId}`);
      fetchSessions();
    }
  };

  if (!player) return <div className="p-8 text-center animate-pulse">Loading Player Profile...</div>;

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">

      {/* Header Section */}
      <div className="flex justify-between items-start bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
            {player.first_name} {player.last_name}
          </h1>
          <div className="flex gap-4 mt-2 text-sm font-bold text-indigo-600">
            <span>{player.position || "N/A"}</span>
            <span className="text-gray-300">|</span>
            <span>{player.team || "No Team"}</span>
          </div>
        </div>
        <button
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          onClick={() => setModalSession({})}
        >
          + New Session
        </button>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        {["profile", "analytics"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 font-bold capitalize transition-all ${
              activeTab === tab
              ? "border-b-4 border-indigo-600 text-indigo-600"
              : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">

          {/* Left Column: Physicals & Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Physical Attributes</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Height</span><span className="font-bold">{player.height_ft}' {player.height_in}"</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Weight</span><span className="font-bold">{player.weight_lbs} lbs</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Bats/Throws</span><span className="font-bold">{player.bats}/{player.throws}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">DOB</span><span className="font-bold">{player.dob ? new Date(player.dob).toLocaleDateString() : "N/A"}</span></div>
              </div>
            </div>

            {player.notes && (
              <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                <h2 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2">Scouting Notes</h2>
                <p className="text-sm text-amber-900 leading-relaxed italic">"{player.notes}"</p>
              </div>
            )}
          </div>

          {/* Right Column: Drills & Timeline */}
          <div className="md:col-span-2 space-y-6">

            {/* Assigned Drills */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                Active Training Plan
                <span className="ml-3 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded-full uppercase font-black">
                  {player.drills?.length || 0}
                </span>
              </h2>
              {(!player.drills || player.drills.length === 0) ? (
                <p className="text-gray-400 text-sm italic">No drills currently assigned.</p>
              ) : (
                <div className="space-y-3">
                  {player.drills.map((d) => (
                    <div key={d.id} className="group flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                      <div>
                        <div className="font-bold text-gray-800">{d.title}</div>
                        <div className="text-[11px]">
                          {d.session_origin ? (
                            <span className="text-indigo-600 font-medium">
                              Linked to {d.session_origin.type} session ({new Date(d.session_origin.date).toLocaleDateString()})
                            </span>
                          ) : (
                            <span className="text-gray-400 tracking-wide uppercase">Manual Assignment</span>
                          )}
                        </div>
                      </div>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs font-bold transition-all"
                        onClick={async () => {
                          if(confirm("Remove drill?")) {
                            await api.delete(`/player-drills/players/${playerId}/drills/${d.id}`);
                            fetchPlayer();
                          }
                        }}
                      >
                        REMOVE
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Session Timeline */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Training History</h2>
              <SessionTimeline
                sessions={sessions}
                onSelect={(session) => setModalSession(session)}
                onDelete={handleDeleteSession}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-indigo-900 p-6 rounded-2xl text-white shadow-xl">
            <h2 className="text-xl font-black uppercase tracking-wider mb-1">Career Analytics</h2>
            <p className="text-indigo-200 text-sm">Aggregated performance data across {sessions.length} training sessions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(careerAverages).length > 0 ? (
              Object.entries(careerAverages).map(([type, data]) => (
                <div key={type} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-black text-gray-800 tracking-tight">{type}</h3>
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase">
                      {data.count} Sessions
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Velo</p>
                      <p className="text-2xl font-black text-gray-900">
                        {(data.sums["Velocity"] / data.count).toFixed(1)} <span className="text-xs font-normal text-gray-400">mph</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Spin</p>
                      <p className="text-2xl font-black text-gray-900">
                        {(data.sums["Total Spin"] / data.count).toFixed(0)} <span className="text-xs font-normal text-gray-400">rpm</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Efficiency</p>
                      <p className="text-lg font-bold text-gray-800">
                        {(data.sums["Spin Efficiency (release)"] / data.count).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">V-Break</p>
                      <p className="text-lg font-bold text-gray-800">
                        {(data.sums["VB (spin)"] / data.count).toFixed(1)}"
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium italic">Upload Rapsodo data to generate career analytics.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Session Modal */}
      {modalSession !== null && (
        <SessionModal
          playerId={playerId}
          session={modalSession.session_type ? modalSession : null}
          onClose={() => setModalSession(null)}
          onUpdated={() => {
            setModalSession(null);
            fetchSessions();
            fetchPlayer();
          }}
        />
      )}
    </div>
  );
}
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { api } from "../api";
import SessionTimeline from "./Session/components/SessionTimeline";
import SessionModal from "./Session/components/SessionModal";

export default function PlayerDetail() {
  const { id: playerId } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [modalSession, setModalSession] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Comparison State
  const [compA, setCompA] = useState({ type: "all" });
  const [compB, setCompB] = useState({ type: "latest" });

  useEffect(() => {
    fetchPlayer();
    fetchSessions();
  }, [playerId]);

  const fetchPlayer = async () => {
    const res = await api.get(`/players/${playerId}`);
    setPlayer(res.data);
    setEditForm(res.data);
  };

  const fetchSessions = async () => {
    const res = await api.get(`/sessions/player/${playerId}`);
    setSessions(res.data);
  };

  const handleSaveProfile = async () => {
    try {
      const updatedNotesTimestamp = editForm.notes !== player.notes
        ? new Date().toISOString()
        : player.notes_updated_at;

      const payload = { ...editForm, notes_updated_at: updatedNotesTimestamp };
      await api.put(`/players/${playerId}`, payload);
      setIsEditing(false);
      fetchPlayer();
    } catch (err) {
      console.error("Failed to save profile", err);
      alert("Error saving profile changes.");
    }
  };

  const handleDeletePlayer = async () => {
    const confirmFirst = window.confirm(
      `Are you sure you want to delete ${player.first_name} ${player.last_name}? This will remove all their data and history.`
    );
    if (confirmFirst) {
      const confirmSecond = window.confirm("FINAL WARNING: This action is permanent. Do you wish to proceed?");
      if (confirmSecond) {
        try {
          await api.delete(`/players/${playerId}`);
          navigate("/");
        } catch (err) {
          console.error("Failed to delete player", err);
          alert("Error deleting player.");
        }
      }
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      await api.delete(`/sessions/${sessionId}`);
      fetchSessions();
    }
  };

  const clockToMinutes = (clockStr) => {
      if (!clockStr || typeof clockStr !== 'string' || !clockStr.includes(":")) return null;
      const [hours, minutes] = clockStr.split(":").map(Number);
      const h = hours === 12 ? 0 : hours;
      return (h * 60) + minutes;
    };

  const aggregateData = (selection) => {
      // Helper to convert "12:15" to total minutes for math/comparison
      const clockToMinutes = (clockStr) => {
        if (!clockStr || typeof clockStr !== 'string' || !clockStr.includes(":")) return null;
        const [hours, minutes] = clockStr.split(":").map(Number);
        const h = hours === 12 ? 0 : hours;
        return (h * 60) + minutes;
      };

      let targetSessions = [...sessions];
      if (selection.type === "latest" && sessions.length > 0) {
        targetSessions = [sessions[0]];
      } else if (selection.type === "session") {
        targetSessions = sessions.filter(s => s.id === selection.id);
      } else if (selection.type === "range") {
        targetSessions = sessions.filter(s => {
          const d = s.date.slice(0, 10);
          return d >= selection.start && d <= selection.end;
        });
      }

      const stats = {};
      targetSessions.forEach((s) => {
        s.metrics.forEach((group) => {
          const pType = group.pitch_type;

          // Initialize clocks array along with sums and max
          if (!stats[pType]) stats[pType] = { count: 0, sums: {}, max: {}, clocks: [] };
          stats[pType].count += 1;

          group.metrics.forEach((m) => {
            const val = parseFloat(m.metric_value);

            // 1. Handle Spin Direction (Clock Strings)
            if (m.metric_name === "Spin Direction") {
              stats[pType].clocks.push(m.metric_value);
            }
            // 2. Handle Numeric Metrics
            else if (!isNaN(val)) {
              stats[pType].sums[m.metric_name] = (stats[pType].sums[m.metric_name] || 0) + val;
              if (!stats[pType].max[m.metric_name] || val > stats[pType].max[m.metric_name]) {
                stats[pType].max[m.metric_name] = val;
              }
            }
          });
        });
      });
      return stats;
    };

  const dataA = useMemo(() => aggregateData(compA), [sessions, compA]);
  const dataB = useMemo(() => aggregateData(compB), [sessions, compB]);
  const allPitchTypes = useMemo(() => Array.from(new Set([...Object.keys(dataA), ...Object.keys(dataB)])), [dataA, dataB]);

  const Selector = ({ label, value, onChange }) => (
    <div className="flex flex-col space-y-2 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-sm">
      <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest">{label}</label>
      <select
        className="text-sm font-bold bg-transparent outline-none cursor-pointer text-white"
        value={value.type}
        onChange={(e) => onChange({ ...value, type: e.target.value })}
      >
        <option className="text-black" value="all">Career Average</option>
        <option className="text-black" value="latest">Latest Session</option>
        <option className="text-black" value="session">Specific Session</option>
        <option className="text-black" value="range">Date Range</option>
      </select>
      {value.type === "session" && (
        <select className="text-xs border-t border-white/10 mt-2 pt-2 outline-none bg-transparent text-white/70" value={value.id} onChange={(e) => onChange({ ...value, id: e.target.value })}>
          <option value="">Select Session...</option>
          {sessions.map(s => <option className="text-black" key={s.id} value={s.id}>{new Date(s.date).toLocaleDateString()} - {s.session_type}</option>)}
        </select>
      )}
      {value.type === "range" && (
        <div className="flex gap-2 mt-2 border-t border-white/10 pt-2">
          <input type="date" className="text-[10px] bg-white/10 text-white border-0 rounded p-1 w-full" value={value.start} onChange={e => onChange({...value, start: e.target.value})}/>
          <input type="date" className="text-[10px] bg-white/10 text-white border-0 rounded p-1 w-full" value={value.end} onChange={e => onChange({...value, end: e.target.value})}/>
        </div>
      )}
    </div>
  );

  const MetricRow = ({ label, valA, valB, isHigherBetter = true, isClock = false }) => {
      let diff = null;
      let colorClass = "text-white/20";

      if (isClock) {
        const minA = clockToMinutes(valA);
        const minB = clockToMinutes(valB);
        if (minA !== null && minB !== null) {
          const rawDiff = minB - minA;
          if (rawDiff !== 0) {
            diff = rawDiff > 0 ? `+${rawDiff}m` : `${rawDiff}m`;
            colorClass = "text-blue-400"; // Clocks use blue for change
          }
        }
      } else {
        const numA = parseFloat(valA) || 0;
        const numB = parseFloat(valB) || 0;
        const numericDiff = (numB - numA).toFixed(1);
        const isNeutral = numA === 0 || numB === 0 || numericDiff === "0.0";

        if (!isNeutral) {
          diff = parseFloat(numericDiff) > 0 ? `+${numericDiff}` : numericDiff;
          colorClass = (parseFloat(numericDiff) > 0 === isHigherBetter) ? "text-green-400" : "text-red-400";
        }
      }

      return (
        <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
          <span className="text-white/50 text-xs font-medium uppercase tracking-wider">{label}</span>
          <div className="flex items-center gap-6">
            <span className="text-sm font-bold text-white/30 w-16 text-right">{valA || "-"}</span>
            <span className="text-sm font-black text-white w-16 text-right">{valB || "-"}</span>
            <span className={`text-[10px] font-black w-10 text-right ${colorClass}`}>{diff || ""}</span>
          </div>
        </div>
      );
    };

  if (!player) return <div className="p-8 text-center text-white font-black animate-pulse">LOADING SCOUTING DATA...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12 space-y-8 min-h-screen">

      {/* 1. HERO HEADER */}
      <div className="relative overflow-hidden bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none select-none">
          <span className="text-9xl font-black italic uppercase">{player.position}</span>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-8">
            <div className="h-20 w-20 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-2xl ring-4 ring-white/10">
              {player.first_name[0]}{player.last_name[0]}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
                {player.first_name} <span className="text-blue-500">{player.last_name}</span>
              </h1>
              <div className="flex items-center gap-4 mt-3">
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                  {player.position || "Prospect"}
                </span>
                <span className="text-white/40 font-bold uppercase text-[10px] tracking-widest">
                  {player.team || "Independent"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={handleDeletePlayer} className="px-5 py-2.5 rounded-xl border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95">
              Delete Profile
            </button>
            <button onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)} className={`px-5 py-2.5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${isEditing ? 'bg-green-600' : 'bg-white/10 hover:bg-white/20'}`}>
              {isEditing ? "✓ Save Profile" : "✎ Edit Profile"}
            </button>
            <button onClick={() => setModalSession({})} className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all active:scale-95">
              + New Session
            </button>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex gap-2 p-1 bg-white/5 backdrop-blur-md rounded-2xl w-fit border border-white/5">
        {["profile", "analytics"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? "bg-white text-gray-900 shadow-xl" : "text-white/40 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* LEFT: PHYSICAL & NOTES */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
              <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-6">Physical Attributes</h2>
              <div className="grid grid-cols-2 gap-y-6">
                {[
                  { label: "Team", key: "team" },
                  { label: "Position", key: "position" },
                  { label: "Weight (lbs)", key: "weight_lbs" },
                  { label: "Bats", key: "bats" },
                  { label: "Throws", key: "throws" },
                ].map((field) => (
                  <div key={field.key}>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{field.label}</p>
                    {isEditing ? (
                      <input className="bg-transparent border-b border-blue-500 text-white font-black italic outline-none w-24" value={editForm[field.key] || ""} onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })} />
                    ) : (
                      <p className="text-xl font-black text-white italic">{player[field.key] || "N/A"}</p>
                    )}
                  </div>
                ))}
                <div>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">DOB</p>
                  <p className="text-xl font-black text-white italic">{player.dob ? new Date(player.dob).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-3xl border transition-all ${isEditing ? 'bg-white border-blue-500 ring-4 ring-blue-500/20 shadow-2xl' : 'bg-blue-600/10 border-blue-500/20'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-[10px] font-black uppercase tracking-widest ${isEditing ? 'text-blue-600' : 'text-blue-400'}`}>Details</h2>
                {player.notes_updated_at && !isEditing && (
                  <span className="text-[8px] font-black text-white/20 uppercase">Updated: {new Date(player.notes_updated_at).toLocaleDateString()}</span>
                )}
              </div>
              {isEditing ? (
                <textarea className="w-full h-48 p-3 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" value={editForm.notes || ""} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
              ) : (
                <p className="text-sm text-blue-100/70 leading-relaxed italic whitespace-pre-wrap">{player.notes || "No notes available."}</p>
              )}
            </div>
          </div>

          {/* RIGHT: DRILLS & HISTORY */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
              <h2 className="text-lg font-black text-white uppercase tracking-tighter mb-6 flex items-center">
                Assigned Drills
                <span className="ml-3 px-2 py-0.5 bg-blue-500 text-white text-[10px] rounded-full uppercase font-black tracking-widest">{player.drills?.length || 0}</span>
              </h2>
              {(!player.drills || player.drills.length === 0) ? (
                <p className="text-white/20 text-xs font-bold uppercase tracking-widest italic border-2 border-dashed border-white/5 py-8 text-center rounded-2xl">No drills currently assigned.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {player.drills.map((d) => (
                      <div key={d.id} className="group relative flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all">
                        <div>
                          <div className="font-black text-white text-xs uppercase tracking-wider">{d.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">
                              {d.session_origin ? `Via ${d.session_origin.type} session` : "Date Added"}
                            </div>
                            {/* Updated to use assigned_date from your Python router */}
                            {(d.assigned_date || d.date) && (
                              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                                • {new Date(d.assigned_date || d.date).toLocaleDateString() !== "Invalid Date"
                                    ? new Date(d.assigned_date || d.date).toLocaleDateString()
                                    : ""}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 text-[10px] font-black transition-all"
                          onClick={async () => {
                            if(window.confirm("Remove drill?")) {
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

            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-8 border-b border-gray-100 pb-4">Training History</h2>
              <SessionTimeline sessions={sessions} onSelect={setModalSession} onDelete={handleDeleteSession} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Selector label="Comparison Basis (A)" value={compA} onChange={setCompA} />
              <Selector label="Target Metrics (B)" value={compB} onChange={setCompB} />
            </div>
            <div className="grid grid-cols-1 gap-8">
              {allPitchTypes.length > 0 ? (
                allPitchTypes.map((type) => {
                  // Initialize with clocks array to prevent undefined errors
                  const sA = dataA[type] || { count: 0, sums: {}, max: {}, clocks: [] };
                  const sB = dataB[type] || { count: 0, sums: {}, max: {}, clocks: [] };

                  const getAvg = (s, k) => s.count > 0 && s.sums[k] ? (s.sums[k] / s.count).toFixed(1) : "0";
                  const getMax = (s, k) => (s.max[k] || 0).toFixed(1);

                  // Helper to get the most relevant clock string (latest in selection)
                  const getClock = (s) => (s.clocks && s.clocks.length > 0) ? s.clocks[s.clocks.length - 1] : "-";

                  return (
                    <div key={type} className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-8 py-4 flex justify-between items-center">
                        <h3 className="text-xl font-black italic tracking-tight uppercase text-white">{type}</h3>
                        <div className="flex gap-10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                          <span className="w-12 text-right">Side A</span>
                          <span className="w-12 text-right text-white">Side B</span>
                          <span className="w-10 text-right">Delta</span>
                        </div>
                      </div>
                      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2">
                        {/* Column 1: Speed, Spin & Direction */}
                        <div>
                          <MetricRow label="Avg Velocity" valA={getAvg(sA, "Velocity")} valB={getAvg(sB, "Velocity")} />
                          <MetricRow label="Max Velocity" valA={getMax(sA, "Max Velocity")} valB={getMax(sB, "Max Velocity")} />
                          <MetricRow label="Spin Direction" valA={getClock(sA)} valB={getClock(sB)} isClock={true} />
                          <MetricRow label="Total Spin" valA={getAvg(sA, "Total Spin")} valB={getAvg(sB, "Total Spin")} />
                          <MetricRow label="Spin Efficiency" valA={getAvg(sA, "Spin Efficiency (release)")} valB={getAvg(sB, "Spin Efficiency (release)")} />
                        </div>

                        {/* Column 2: Break & Release Metrics */}
                        <div>
                          <MetricRow label="V-Break (in)" valA={getAvg(sA, "VB (spin)")} valB={getAvg(sB, "VB (spin)")} />
                          <MetricRow label="H-Break (in)" valA={getAvg(sA, "HB (trajectory)")} valB={getAvg(sB, "HB (trajectory)")} />
                          <MetricRow label="Release Ht (ft)" valA={getAvg(sA, "Release Height")} valB={getAvg(sB, "Release Height")} isHigherBetter={false} />
                          <MetricRow label="Release Side (ft)" valA={getAvg(sA, "Release Side")} valB={getAvg(sB, "Release Side")} isHigherBetter={false} />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center bg-white/5 backdrop-blur-sm rounded-3xl border-2 border-dashed border-white/10">
                  <p className="text-white/40 font-black uppercase tracking-[0.2em] italic">No session data matches selection</p>
                </div>
              )}
            </div>
          </div>
        )}

      {modalSession && <SessionModal playerId={playerId} session={modalSession.session_type ? modalSession : null} onClose={() => setModalSession(null)} onUpdated={() => { setModalSession(null); fetchSessions(); fetchPlayer(); }} />}
    </div>
  );
}
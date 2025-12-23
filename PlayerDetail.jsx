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
    setEditForm(res.data); // Pre-fill the edit form
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

      const payload = {
        ...editForm,
        notes_updated_at: updatedNotesTimestamp
      };

      await api.put(`/players/${playerId}`, payload);
      setIsEditing(false);
      fetchPlayer();
    } catch (err) {
      console.error("Failed to save profile", err);
      alert("Error saving profile changes.");
    }
  };

  // NEW: Delete Player Logic
  const handleDeletePlayer = async () => {
    const confirmFirst = window.confirm(
      `Are you sure you want to delete ${player.first_name} ${player.last_name}? This will remove all their data and history.`
    );

    if (confirmFirst) {
      const confirmSecond = window.confirm(
        "FINAL WARNING: This action is permanent. Do you wish to proceed with the deletion?"
      );

      if (confirmSecond) {
        try {
          await api.delete(`/players/${playerId}`);
          navigate("/"); // Redirect to Dashboard
        } catch (err) {
          console.error("Failed to delete player", err);
          alert("Error deleting player. Please try again.");
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

  // ----------------------------
  // Analytics Comparison Logic
  // ----------------------------
  const aggregateData = (selection) => {
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
        if (!stats[pType]) stats[pType] = { count: 0, sums: {}, max: {} };
        stats[pType].count += 1;

        group.metrics.forEach((m) => {
          const val = parseFloat(m.metric_value);
          if (!isNaN(val)) {
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

  const allPitchTypes = useMemo(() => {
    return Array.from(new Set([...Object.keys(dataA), ...Object.keys(dataB)]));
  }, [dataA, dataB]);

  // ----------------------------
  // Helper Components
  // ----------------------------
  const Selector = ({ label, value, onChange }) => (
    <div className="flex flex-col space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{label}</label>
      <select
        className="text-sm font-bold bg-transparent outline-none cursor-pointer text-indigo-900"
        value={value.type}
        onChange={(e) => onChange({ ...value, type: e.target.value })}
      >
        <option value="all">Career Average</option>
        <option value="latest">Latest Session</option>
        <option value="session">Specific Session</option>
        <option value="range">Date Range</option>
      </select>

      {value.type === "session" && (
        <select
          className="text-xs border-t mt-2 pt-2 outline-none bg-transparent"
          value={value.id}
          onChange={(e) => onChange({ ...value, id: e.target.value })}
        >
          <option value="">Select Session...</option>
          {sessions.map(s => (
            <option key={s.id} value={s.id}>{new Date(s.date).toLocaleDateString()} - {s.session_type}</option>
          ))}
        </select>
      )}

      {value.type === "range" && (
        <div className="flex gap-2 mt-2 border-t pt-2">
          <input type="date" className="text-[10px] bg-white border rounded p-1 w-full" value={value.start} onChange={e => onChange({...value, start: e.target.value})}/>
          <input type="date" className="text-[10px] bg-white border rounded p-1 w-full" value={value.end} onChange={e => onChange({...value, end: e.target.value})}/>
        </div>
      )}
    </div>
  );

  const MetricRow = ({ label, valA, valB, isHigherBetter = true }) => {
    const numA = parseFloat(valA) || 0;
    const numB = parseFloat(valB) || 0;
    const diff = (numB - numA).toFixed(1);
    const isNeutral = numA === 0 || numB === 0 || diff === "0.0";

    let colorClass = "text-gray-400";
    if (!isNeutral) {
      const positiveResult = parseFloat(diff) > 0;
      colorClass = (positiveResult === isHigherBetter) ? "text-green-600" : "text-red-600";
    }

    return (
      <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
        <span className="text-gray-500 text-xs font-medium">{label}</span>
        <div className="flex items-center gap-6">
          <span className="text-sm font-bold text-gray-400 w-12 text-right">{valA || "-"}</span>
          <span className="text-sm font-black text-gray-900 w-12 text-right">{valB || "-"}</span>
          <span className={`text-[10px] font-black w-10 text-right ${colorClass}`}>
            {!isNeutral && (parseFloat(diff) > 0 ? `+${diff}` : diff)}
          </span>
        </div>
      </div>
    );
  };

  if (!player) return <div className="p-8 text-center animate-pulse text-white font-bold">Loading Player Profile...</div>;

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">

      {/* Header Section */}
      <div className="flex justify-between items-start bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
            {player.first_name} {player.last_name}
          </h1>
          <div className="flex gap-4 mt-1 text-sm font-bold text-indigo-600">
            <span>{player.position || "N/A"}</span>
            <span className="text-gray-300">|</span>
            <span>{player.team || "No Team"}</span>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Action: Delete Profile */}
          <button
            onClick={handleDeletePlayer}
            className="border border-red-500/50 text-red-500 px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
          >
            Delete Profile
          </button>

          {/* Action: Edit Profile */}
          <button
            onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            className={`${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-900'} text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg active:scale-95 text-sm`}
          >
            {isEditing ? "✓ Save Changes" : "✎ Edit Profile"}
          </button>

          {/* Action: New Session */}
          <button
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 text-sm"
            onClick={() => setModalSession({})}
          >
            + New Session
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/20">
        {["profile", "analytics"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 font-bold capitalize transition-all ${
              activeTab === tab ? "border-b-4 border-white text-white" : "text-white/50 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
          {/* Info Column */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Physical Attributes</h2>
              <div className="space-y-4 text-sm">
                {[
                  { label: "Team", key: "team" },
                  { label: "Position", key: "position" },
                  { label: "Weight (lbs)", key: "weight_lbs" },
                  { label: "Bats", key: "bats" },
                  { label: "Throws", key: "throws" },
                ].map((field) => (
                  <div key={field.key} className="flex flex-col">
                    <span className="text-gray-400 text-[10px] font-bold uppercase">{field.label}</span>
                    {isEditing ? (
                      <input
                        className="border-b-2 border-indigo-100 focus:border-indigo-500 outline-none font-bold py-1 bg-transparent"
                        value={editForm[field.key] || ""}
                        onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                      />
                    ) : (
                      <span className="font-bold">{player[field.key] || "N/A"}</span>
                    )}
                  </div>
                ))}
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] font-bold uppercase">DOB</span>
                  <span className="font-bold">{player.dob ? new Date(player.dob).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className={`p-5 rounded-xl border transition-all ${isEditing ? 'bg-white border-indigo-200 ring-2 ring-indigo-50' : 'bg-amber-50 border-amber-100 shadow-sm'}`}>
              <div className="flex justify-between items-center mb-3">
                <h2 className={`text-xs font-black uppercase tracking-widest ${isEditing ? 'text-indigo-600' : 'text-amber-600'}`}>
                  Scouting Notes
                </h2>
                {player.notes_updated_at && !isEditing && (
                  <span className="text-[9px] font-bold text-amber-400">
                    UPDATED: {new Date(player.notes_updated_at).toLocaleDateString()}
                  </span>
                )}
              </div>

              {isEditing ? (
                <textarea
                  className="w-full h-48 p-3 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editForm.notes || ""}
                  placeholder="Enter scouting reports or progression notes..."
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                />
              ) : (
                <p className="text-sm text-amber-900 leading-relaxed italic whitespace-pre-wrap overflow-y-auto max-h-64">
                  {player.notes ? `"${player.notes}"` : "No notes available."}
                </p>
              )}
            </div>
          </div>

          {/* Training Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                Assigned Drills
                <span className="ml-3 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded-full uppercase font-black">
                  {player.drills?.length || 0}
                </span>
              </h2>
              {(!player.drills || player.drills.length === 0) ? (
                <p className="text-gray-400 text-sm italic">No drills currently assigned.</p>
              ) : (
                <div className="space-y-3">
                  {player.drills.map((d) => {
                    const drillDate = d.session_origin?.date || d.assigned_date;
                    return (
                      <div key={d.id} className="group flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                        <div>
                          <div className="font-bold text-gray-800">{d.title}</div>
                          <div className="text-[11px]">
                            {d.session_origin ? (
                              <span className="text-indigo-600 font-medium">
                                Added via {d.session_origin.type} session {drillDate ? `on ${new Date(drillDate).toLocaleDateString()}` : ""}
                              </span>
                            ) : (
                              <span className="text-gray-400 tracking-wide uppercase">
                                {drillDate ? `Assigned: ${new Date(drillDate).toLocaleDateString()}` : "Manual Assignment"}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs font-bold transition-all"
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
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">History</h2>
              <SessionTimeline sessions={sessions} onSelect={setModalSession} onDelete={handleDeleteSession} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Selector label="Base Comparison (Side A)" value={compA} onChange={setCompA} />
            <Selector label="Target Comparison (Side B)" value={compB} onChange={setCompB} />
          </div>

          <div className="grid grid-cols-1 gap-6">
            {allPitchTypes.length > 0 ? (
              allPitchTypes.map((type) => {
                const sA = dataA[type] || { count: 0, sums: {}, max: {} };
                const sB = dataB[type] || { count: 0, sums: {}, max: {} };

                const getAvg = (s, k) => s.count > 0 ? (s.sums[k] / s.count).toFixed(1) : "0";
                const getMax = (s, k) => (s.max[k] || 0).toFixed(1);

                return (
                  <div key={type} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-indigo-900 text-white px-6 py-3 flex justify-between items-center">
                      <h3 className="text-lg font-black tracking-tight uppercase">{type}</h3>
                      <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-indigo-300">
                        <span className="w-12 text-right">Side A</span>
                        <span className="w-12 text-right text-white">Side B</span>
                        <span className="w-10 text-right">Delta</span>
                      </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                      <div>
                        <MetricRow label="Avg Velocity" valA={getAvg(sA, "Velocity")} valB={getAvg(sB, "Velocity")} />
                        <MetricRow label="Max Velocity" valA={getMax(sA, "Max Velocity")} valB={getMax(sB, "Max Velocity")} />
                        <MetricRow label="Total Spin" valA={getAvg(sA, "Total Spin")} valB={getAvg(sB, "Total Spin")} />
                        <MetricRow label="Spin Efficiency" valA={getAvg(sA, "Spin Efficiency (release)")} valB={getAvg(sB, "Spin Efficiency (release)")} />
                      </div>
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
              <div className="py-20 text-center bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white/30">
                <p className="text-white font-medium italic">No sessions match your selection.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {modalSession !== null && (
        <SessionModal
          playerId={playerId}
          session={modalSession.session_type ? modalSession : null}
          onClose={() => setModalSession(null)}
          onUpdated={() => { setModalSession(null); fetchSessions(); fetchPlayer(); }}
        />
      )}
    </div>
  );
}
import { useState, useEffect, useMemo } from "react";
import { api } from "../../../api";
import MetricsTab from "./MetricsTab";

function CSVUpload({ onMetricsParsed }) {
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    // Split by newline and filter out empty rows
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length < 2) return;

    // Detect separator (handles both standard CSV commas and Rapsodo tab-separated TXT exports)
    const separator = lines[0].includes("\t") ? "\t" : ",";
    const headers = lines[0].split(separator).map(h => h.trim().replace(/"/g, ''));
    const dataLines = lines.slice(1);

    const pitchGroups = {};

    dataLines.forEach(line => {
      const values = line.split(separator).map(v => v.trim().replace(/"/g, ''));
      const row = headers.reduce((acc, h, i) => {
        acc[h] = values[i] || "0";
        return acc;
      }, {});

      const pType = row["Pitch Type"] || "Unknown";
      if (!pitchGroups[pType]) pitchGroups[pType] = [];
      pitchGroups[pType].push(row);
    });

    const parsedMetrics = Object.entries(pitchGroups).map(([type, pitches]) => {
      const getVal = (p, col) => parseFloat(p[col]) || 0;

      const avg = (col, decimals = 1) => {
        const total = pitches.reduce((sum, p) => sum + getVal(p, col), 0);
        return (total / pitches.length).toFixed(decimals);
      };

      const max = (col, decimals = 1) => {
        return Math.max(...pitches.map(p => getVal(p, col))).toFixed(decimals);
      };

      // --- Spin Direction Averaging (Vector Math for Clock Time) ---
      let sinSum = 0, cosSum = 0;
      pitches.forEach(p => {
        const clock = p["Spin Direction"];
        if (clock && clock.includes(":")) {
          const [h, m] = clock.split(":").map(Number);
          // Convert 12-hour clock to unit circle degrees (12:00 = 90 deg)
          const deg = 90 - ((h + m / 60) * 30);
          const rad = deg * (Math.PI / 180);
          sinSum += Math.sin(rad);
          cosSum += Math.cos(rad);
        }
      });
      const avgRad = Math.atan2(sinSum, cosSum);
      let avgDeg = avgRad * (180 / Math.PI);
      let avgClockRaw = (90 - avgDeg) / 30;
      if (avgClockRaw <= 0) avgClockRaw += 12;
      if (avgClockRaw > 12.5) avgClockRaw -= 12;
      const avgH = Math.floor(avgClockRaw) === 0 ? 12 : Math.floor(avgClockRaw);
      const avgM = Math.round((avgClockRaw % 1) * 60);
      const avgSpinDir = `${avgH}:${avgM.toString().padStart(2, '0')}`;

      // Return the 14-column flat structure
      return {
        source: "rapsodo",
        pitch_type: type,
        metrics: [
          { metric_name: "Velocity", metric_value: avg("Velocity"), unit: "mph" },
          { metric_name: "Max Velocity", metric_value: max("Velocity"), unit: "mph" },
          { metric_name: "Total Spin", metric_value: avg("Total Spin", 0), unit: "rpm" },
          { metric_name: "Max Total Spin", metric_value: max("Total Spin", 0), unit: "rpm" },
          { metric_name: "VB (spin)", metric_value: avg("VB (spin)"), unit: "in" },
          { metric_name: "HB (trajectory)", metric_value: avg("HB (trajectory)"), unit: "in" },
          { metric_name: "Spin Efficiency (release)", metric_value: avg("Spin Efficiency (release)"), unit: "%" },
          { metric_name: "Spin Direction", metric_value: avgSpinDir, unit: "clock" },
          { metric_name: "Gyro Degree (deg)", metric_value: avg("Gyro Degree (deg)"), unit: "deg" },
          { metric_name: "Release Angle", metric_value: avg("Release Angle"), unit: "deg" },
          { metric_name: "Release Height", metric_value: avg("Release Height", 2), unit: "ft" },
          { metric_name: "Horizontal Angle", metric_value: avg("Horizontal Angle"), unit: "deg" },
          { metric_name: "Release Side", metric_value: avg("Release Side", 2), unit: "ft" }
        ]
      };
    });

    onMetricsParsed(parsedMetrics);
  };

  return (
    <div className="my-4 border-2 border-dashed border-indigo-200 p-4 rounded-lg bg-indigo-50/30 text-center">
      <label className="block mb-2 font-bold text-indigo-800">Import Rapsodo Data</label>
      <input
        type="file"
        accept=".csv,.txt"
        onChange={handleFile}
        className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
      />
      <p className="mt-2 text-[10px] text-gray-500 uppercase tracking-wider">Averages and Max values will be calculated automatically</p>
    </div>
  );
}

export default function SessionModal({ playerId, session, onClose, onUpdated }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [allDrills, setAllDrills] = useState([]);
  const [drillSearch, setDrillSearch] = useState("");

  const [formData, setFormData] = useState({
    session_type: "",
    date: "",
    notes: "",
    metrics: [],
    newDrills: []
  });

  useEffect(() => {
    const fetchDrills = async () => {
      const res = await api.get("/drills");
      setAllDrills(res.data);
    };

    fetchDrills();

    if (session) {
      setFormData({
        session_type: session.session_type,
        date: session.date.slice(0, 10),
        notes: session.notes || "",
        metrics: session.metrics || [],
        newDrills: []
      });
    } else {
      setFormData({
        session_type: "",
        date: new Date().toISOString().slice(0, 10),
        notes: "",
        metrics: [],
        newDrills: []
      });
    }
    setLoading(false);
  }, [session]);

  const filteredDrills = useMemo(() => {
    const term = drillSearch.toLowerCase();
    if (!term) return allDrills;
    return allDrills.filter(drill => {
      const matchesTitle = drill.title.toLowerCase().includes(term);
      const matchesTags = drill.tags?.some(tag => tag.name.toLowerCase().includes(term));
      return matchesTitle || matchesTags;
    });
  }, [allDrills, drillSearch]);

  const toggleDrill = (drillId) => {
    setFormData((prev) => {
      const exists = prev.newDrills.includes(drillId);
      return {
        ...prev,
        newDrills: exists ? prev.newDrills.filter((id) => id !== drillId) : [...prev.newDrills, drillId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      session_type: formData.session_type,
      date: formData.date,
      notes: formData.notes,
      metrics: formData.metrics
    };

    try {
      let res;
      if (session) {
        res = await api.put(`/sessions/${session.id}`, payload);
      } else {
        res = await api.post("/sessions/", { ...payload, player_id: playerId });
      }

      const savedSession = res.data;

      // Map assigned drills with the origin session ID
      for (let drillId of formData.newDrills) {
          await api.post(`/player-drills/players/${playerId}/drills/${drillId}`, null, {
            params: { session_date: formData.date, session_id: savedSession.id }
          });
      }

      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to save session:", err);
      alert("Error saving session");
    }
  };

  if (loading) return <div className="p-4 text-center">Loading Data...</div>;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{session ? "Edit Session" : "Create New Session"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        {/* Tabs */}
        <div className="flex bg-white px-6 border-b">
          {["details", "metrics"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 font-bold capitalize transition-all ${
                activeTab === tab ? "border-b-4 border-indigo-600 text-indigo-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "details" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Session Type</label>
                  <input
                    type="text"
                    placeholder="Bullpen, Live BP, etc."
                    value={formData.session_type}
                    onChange={(e) => setFormData({ ...formData, session_type: e.target.value })}
                    className="w-full border-gray-300 p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border-gray-300 p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Coaching Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border-gray-300 p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={3}
                  placeholder="Focus on staying closed through landing..."
                />
              </div>

              <CSVUpload
                onMetricsParsed={(parsedMetrics) =>
                  setFormData((prev) => ({ ...prev, metrics: parsedMetrics }))
                }
              />

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Assign Development Drills</label>
                <input
                  type="text"
                  placeholder="Search by title or tag (Velocity, Arm Care...)"
                  className="w-full border p-2.5 rounded-lg mb-3 bg-gray-50 focus:bg-white transition-all outline-none"
                  value={drillSearch}
                  onChange={(e) => setDrillSearch(e.target.value)}
                />

                <div className="border rounded-lg max-h-40 overflow-y-auto divide-y bg-gray-50">
                  {filteredDrills.map((drill) => (
                    <label key={drill.id} className="flex items-center p-3 hover:bg-white cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.newDrills.includes(drill.id)}
                        onChange={() => toggleDrill(drill.id)}
                        className="w-5 h-5 rounded text-indigo-600 mr-3"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">{drill.title}</span>
                        <div className="flex gap-1 mt-1">
                          {drill.tags?.map(t => (
                            <span key={t.id} className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-black uppercase">{t.name}</span>
                          ))}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "metrics" && (
            <div className="animate-in fade-in duration-300">
               <MetricsTab metrics={formData.metrics} />
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-all">
            Cancel
          </button>
          <button type="submit" onClick={handleSubmit} className="px-10 py-2.5 rounded-lg font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
            {session ? "Save Changes" : "Create Session"}
          </button>
        </div>
      </div>
    </div>
  );
}
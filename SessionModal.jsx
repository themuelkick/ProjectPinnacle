import { useState, useEffect } from "react";
import { api } from "../../../api";
import MetricsTab from "./MetricsTab";

// ✅ CSVUpload is now an inner component (no default export)
function CSVUpload({ onMetricsParsed }) {
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split("\n").filter(line => line.trim() !== "");
    if (lines.length < 2) return; // must have headers + at least one row

    // First row is headers
    const headers = lines[0].trim().split("\t").map(h => h.trim());
    const dataLines = lines.slice(1); // data starts from second row

    const pitchData = {};

    dataLines.forEach(line => {
      if (!line.trim()) return;
      const values = line.trim().split("\t");
      const row = headers.reduce((acc, h, i) => {
        acc[h] = values[i]?.trim() || "0";
        return acc;
      }, {});

      const pitchType = row["Pitch Type"] || "Unknown";
      if (!pitchData[pitchType]) pitchData[pitchType] = [];
      pitchData[pitchType].push(row);
    });

    const metrics = Object.entries(pitchData).map(([pitchType, pitches]) => {
      const avg = (field) => {
        const numbers = pitches.map(p => parseFloat(p[field]) || 0);
        const sum = numbers.reduce((a, b) => a + b, 0);
        return numbers.length ? sum / numbers.length : 0;
      };

      // Spin Direction circular mean
      const spinRad = pitches.map(p => (parseFloat(p["Spin Direction"]) || 0) * (Math.PI / 6));
      const avgSpinDir = spinRad.length
        ? Math.atan2(
            spinRad.reduce((sum, r) => sum + Math.sin(r), 0) / spinRad.length,
            spinRad.reduce((sum, r) => sum + Math.cos(r), 0) / spinRad.length
          ) * (6 / Math.PI)
        : 0;

      return {
        source: "rapsodo",
        pitch_type: pitchType,
        metrics: [
          { metric_name: "Pitch Type", metric_value: pitchType, unit: "" },
          { metric_name: "Velocity", metric_value: avg("Velocity").toFixed(1), unit: "mph" },
          { metric_name: "Max Velocity", metric_value: Math.max(...pitches.map(p => parseFloat(p["Velocity"]) || 0)).toFixed(1), unit: "mph" },
          { metric_name: "Total Spin", metric_value: avg("Total Spin").toFixed(0), unit: "rpm" },
          { metric_name: "VB (spin)", metric_value: avg("VB (spin)").toFixed(1), unit: "" },
          { metric_name: "HB (trajectory)", metric_value: avg("HB (trajectory)").toFixed(1), unit: "" },
          { metric_name: "Spin Efficiency", metric_value: avg("Spin Efficiency (release)").toFixed(2), unit: "" },
          { metric_name: "Gyro Degree", metric_value: avg("Gyro Degree (deg)").toFixed(1), unit: "deg" },
          { metric_name: "Spin Direction", metric_value: avgSpinDir.toFixed(1), unit: "clock" },
          { metric_name: "Release Angle", metric_value: avg("Release Angle").toFixed(1), unit: "deg" },
          { metric_name: "Horizontal Angle", metric_value: avg("Horizontal Angle").toFixed(1), unit: "deg" },
          { metric_name: "Release Height", metric_value: avg("Release Height").toFixed(2), unit: "ft" },
          { metric_name: "Release Side", metric_value: avg("Release Side").toFixed(2), unit: "ft" },
        ]
      };
    });

    onMetricsParsed(metrics);
  };

  return (
    <div className="my-2">
      <label className="block mb-1 font-semibold">Upload Rapsodo CSV</label>
      <input
        type="file"
        accept=".csv,.txt"
        onChange={handleFile}
        className="border p-1 rounded w-full"
      />
    </div>
  );
}

// ✅ Only one default export for this file
export default function SessionModal({ playerId, session, onClose, onUpdated }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  const [formData, setFormData] = useState({
    session_type: "",
    date: "",
    notes: "",
    metrics: []
  });

  useEffect(() => {
    if (session) {
      setFormData({
        session_type: session.session_type,
        date: session.date.slice(0, 10),
        notes: session.notes || "",
        metrics: session.metrics || []
      });
    } else {
      setFormData({
        session_type: "",
        date: new Date().toISOString().slice(0, 10),
        notes: "",
        metrics: []
      });
    }
    setLoading(false);
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      session_type: formData.session_type,
      date: formData.date,
      notes: formData.notes,
      metrics: formData.metrics,
      media: formData.media || []
    };

    try {
      if (session) {
        await api.put(`/sessions/${session.id}`, payload);
      } else {
        await api.post("/sessions/", { ...payload, player_id: playerId });
      }

      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to save session:", err);
      alert("Error saving session");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-xl">
        <h2 className="text-xl font-semibold mb-4">
          {session ? "Edit Session" : "New Session"}
        </h2>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          {["details", "metrics"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold capitalize ${
                activeTab === tab
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* DETAILS TAB */}
          {activeTab === "details" && (
            <>
              <div>
                <label className="block font-semibold">Session Type</label>
                <input
                  type="text"
                  value={formData.session_type}
                  onChange={(e) =>
                    setFormData({ ...formData, session_type: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                  rows={4}
                />
              </div>

              <CSVUpload
                onMetricsParsed={(parsedMetrics) =>
                  setFormData((prev) => ({ ...prev, metrics: parsedMetrics }))
                }
              />
            </>
          )}

          {/* METRICS TAB */}
          {activeTab === "metrics" && (
            <MetricsTab
              metrics={formData.metrics}
              onChange={(metrics) => setFormData({ ...formData, metrics })}
            />
          )}

          {/* ACTIONS */}
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from "react";
import { api } from "../../../api";

export default function SessionCSVUploadModal({ sessionId, onClose, onMetricsUpdated }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const parseCSV = (text) => {
    const lines = text.split("\n").map(line => line.trim()).filter(line => line);
    if (lines.length < 2) return [];

    // First row = headers
    const headers = lines[0].split("\t").map(h => h.trim());

    // Rest of the rows
    const data = lines.slice(1).map(line => {
      const values = line.split("\t");
      const row = {};
      headers.forEach((h, i) => {
        row[h] = values[i] ? values[i].trim() : "";
      });
      return row;
    });

    return data;
  };

  const calculatePitchAverages = (data) => {
    const pitchGroups = {};
    data.forEach(row => {
      const pitch = row["Pitch Type"] || "Unknown";
      if (!pitchGroups[pitch]) pitchGroups[pitch] = [];
      pitchGroups[pitch].push(row);
    });

    const numericCols = [
      "Velocity",
      "Total Spin",
      "VB (spin)",
      "HB (trajectory)",
      "Spin Efficiency (release)",
      "Gyro Degree (deg)",
      "Spin Direction",
      "Release Angle",
      "Horizontal Angle",
      "Release Height",
      "Release Side"
    ];

    const metrics = Object.entries(pitchGroups).map(([pitchType, rows]) => {
      const pitchMetrics = numericCols.map(col => {
        const values = rows.map(r => parseFloat(r[col])).filter(v => !isNaN(v));
        const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        return {
          metric_name: col,
          metric_value: avg.toFixed(col.includes("Height") || col.includes("Side") ? 2 : 1),
          unit: ""
        };
      });

      // Add pitch type as a metric for the table
      pitchMetrics.push({ metric_name: "Pitch Type", metric_value: pitchType, unit: "" });

      return { source: "rapsodo", pitch_type: pitchType, metrics: pitchMetrics };
    });

    return metrics;
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const text = await file.text();
    const parsedData = parseCSV(text);
    const metrics = calculatePitchAverages(parsedData);

    try {
      const updatedSession = await api.put(`/sessions/${sessionId}`, { metrics });
      if (onMetricsUpdated) onMetricsUpdated(updatedSession);
      onClose();
    } catch (err) {
      console.error("Failed to upload CSV:", err);
      alert("Error uploading CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Upload Session CSV</h2>
        <input type="file" accept=".csv,.txt" onChange={handleFileChange} />
        <div className="flex justify-end space-x-2 pt-4">
          <button type="button" className="px-4 py-2 rounded border" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

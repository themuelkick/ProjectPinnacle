import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api";

export default function SessionForm() {
  const { id: playerId } = useParams();
  const navigate = useNavigate();

  const [sessionType, setSessionType] = useState("Bullpen");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.post("/sessions", {
        player_id: playerId,
        session_type: sessionType,
        // send null if empty so backend can default
        date: date || null,
        notes,
      });

      // ✅ Close form and return to player detail
      navigate(`/players/${playerId}`);
    } catch (err) {
      console.error("Failed to create session", err);
      alert("Failed to create session");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-md mt-6">
      <h2 className="text-xl font-semibold mb-4">New Session</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Session Type */}
        <div>
          <label className="block font-semibold">Session Type</label>
          <select
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            className="border p-2 w-full rounded"
            required
          >
            <option>Bullpen</option>
            <option>Game</option>
            <option>Plyo</option>
            <option>Biomech</option>
            <option>Notes</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block font-semibold">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block font-semibold">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border p-2 w-full rounded"
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Session"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

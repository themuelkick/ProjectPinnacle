import { useState, useEffect } from "react";
import { api } from "../../../api";

export default function SessionModal({ playerId, session, onClose, onUpdated }) {
  const [sessionType, setSessionType] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      setSessionType(session.session_type);
      setDate(session.date.slice(0, 10));
      setNotes(session.notes || "");
    } else {
      setSessionType("");
      setDate(new Date().toISOString().slice(0, 10));
      setNotes("");
    }
    setLoading(false);
  }, [session]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (session) {
    // Edit existing session
    await api.put(`/sessions/${session.id}`, { session_type: sessionType, date, notes });
  } else {
    // Create new session
    await api.post("/sessions/", {
      player_id: playerId,      // <--- pass player ID here
      session_type: sessionType,
      date,
      notes
    });
  }
  if (onUpdated) onUpdated();
};


  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{session ? "Edit Session" : "New Session"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold">Session Type</label>
            <input
              type="text"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div>
            <label className="block font-semibold">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div>
            <label className="block font-semibold">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border p-2 w-full rounded"
              rows={4}
            />
          </div>
          <div className="flex justify-end space-x-2">
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

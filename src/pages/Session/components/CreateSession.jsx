// src/pages/Session/CreateSession.jsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../api";


export default function CreateSession() {
  const { id: playerId } = useParams(); // player id
  const navigate = useNavigate();

  const [sessionType, setSessionType] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/sessions", {
      player_id: playerId,
      session_type: sessionType,
      date,
      notes,
    });

    navigate(`/players/${playerId}`); // go back to PlayerDetail
  };

  return (
    <div className="p-6 bg-white shadow rounded-md max-w-md mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4">New Session</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Session Type</label>
          <input
            type="text"
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="e.g., Bullpen, Game, Plyo"
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

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Create Session
        </button>
      </form>
    </div>
  );
}

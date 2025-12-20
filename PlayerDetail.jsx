import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../api";
import SessionTimeline from "./Session/components/SessionTimeline";
import SessionModal from "./Session/components/SessionModal";

export default function PlayerDetail() {
  const { id: playerId } = useParams();

  const [player, setPlayer] = useState(null);
  const [allDrills, setAllDrills] = useState([]);
  const [assignedDrills, setAssignedDrills] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [modalSession, setModalSession] = useState(null); // null = modal closed

  // ----------------------------
  // Fetch helpers
  // ----------------------------
  const fetchPlayer = async () => {
    const res = await api.get(`/players/${playerId}`);
    setPlayer(res.data);
    setAssignedDrills(res.data.drills || []);
  };

  const fetchDrills = async () => {
    const res = await api.get("/drills");
    setAllDrills(res.data);
  };

  const fetchSessions = async () => {
    const res = await api.get(`/sessions/player/${playerId}`);
    setSessions(res.data);
  };

  useEffect(() => {
    fetchPlayer();
    fetchDrills();
    fetchSessions();
  }, [playerId]);

  // ----------------------------
  // Drill assignment
  // ----------------------------
  const addDrill = async (drillId) => {
    await api.post(`/player-drills/players/${playerId}/drills/${drillId}`);
    fetchPlayer();
  };

  // ----------------------------
  // Session deletion
  // ----------------------------
  const handleDeleteSession = async (sessionId) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      await api.delete(`/sessions/${sessionId}`);
      fetchSessions();
    }
  };

  if (!player) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 space-y-6 max-w-3xl mx-auto bg-white shadow rounded-md">

      {/* Add Session Button */}
      <div className="flex justify-end">
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          onClick={() => setModalSession({})} // empty object = create new
        >
          + New Session
        </button>
      </div>

      {/* Player Info */}
      <div>
        <h1 className="text-2xl font-bold">
          {player.first_name} {player.last_name}
        </h1>
        {player.dob && <p>DOB: {new Date(player.dob).toLocaleDateString()}</p>}
        {player.position && <p>Position: {player.position}</p>}
        {player.team && <p>Team: {player.team}</p>}
      </div>

      {/* Physical Attributes */}
      <div>
        <h2 className="text-xl font-semibold">Physical Attributes</h2>
        <p>
          Height: {(player.height_ft ?? 0) + "'" + " " + (player.height_in ?? 0) + '"'}
        </p>
        <p>Weight: {player.weight_lbs ?? 0} lbs</p>
        <p>Bats: {player.bats ?? "N/A"}</p>
        <p>Throws: {player.throws ?? "N/A"}</p>
      </div>

      {/* Notes */}
      {player.notes && (
        <div>
          <h2 className="text-xl font-semibold">Notes</h2>
          <p className="whitespace-pre-wrap">{player.notes}</p>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="text-xl font-semibold">History</h2>
        {player.history && player.history.length > 0 ? (
          <ul className="list-disc pl-6">
            {player.history.map((item) => (
              <li key={item.id}>
                <strong>{new Date(item.date).toLocaleDateString()}</strong>:{" "}
                {item.change_type} {item.notes && `- ${item.notes}`}
              </li>
            ))}
          </ul>
        ) : (
          <p>No history available.</p>
        )}
      </div>

      {/* Assigned Drills */}
      <div>
        <h2 className="text-xl font-semibold mt-6">Assigned Drills</h2>
        <ul className="list-disc pl-6">
          {assignedDrills.map((d) => (
            <li key={d.id}>{d.title}</li>
          ))}
        </ul>
      </div>

      {/* Add a Drill */}
      <div>
        <h2 className="text-xl font-semibold mt-6">Add a Drill</h2>
        <ul className="list-disc pl-6">
          {allDrills.map((drill) => (
            <li key={drill.id}>
              <button
                className="text-indigo-600 underline"
                onClick={() => addDrill(drill.id)}
              >
                Add {drill.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Session Timeline */}
      <div>
        <h2 className="text-xl font-semibold mt-6">Sessions</h2>
        <SessionTimeline
          sessions={sessions}
          onSelect={(session) => setModalSession(session)}
          onDelete={handleDeleteSession}
        />
      </div>

      {/* Session Modal */}
      {modalSession !== null && (
        <SessionModal
          playerId={playerId}
          session={modalSession.session_type ? modalSession : null}
          onClose={() => setModalSession(null)}
          onUpdated={() => {
            setModalSession(null);
            fetchSessions();
          }}
        />
      )}
    </div>
  );
}
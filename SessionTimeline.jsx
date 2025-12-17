export default function SessionTimeline({ sessions, onSelect, onDelete }) {
  if (!sessions || sessions.length === 0) return <p>No sessions yet.</p>;

  return (
    <ul className="space-y-2">
      {sessions.map((session) => (
        <li key={session.id} className="flex justify-between items-center border p-2 rounded">
          <button
            className="text-left w-full"
            onClick={() => onSelect(session)} // open modal
          >
            {new Date(session.date).toLocaleDateString()} – {session.session_type}
          </button>
          <button
            className="text-red-600 ml-4"
            onClick={() => onDelete(session.id)}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

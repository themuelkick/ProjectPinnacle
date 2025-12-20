export default function SessionTimeline({ sessions, onSelect, onDelete }) {
  if (!sessions || sessions.length === 0) {
    return <p>No sessions yet.</p>;
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        const hasMetrics =
          session.metrics &&
          session.metrics.some(group => group.metrics && group.metrics.length > 0);

        return (
          <div
            key={session.id}
            className="border rounded p-4 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <div onClick={() => onSelect(session)}>
                <p className="font-semibold">
                  {new Date(session.date).toLocaleDateString()} — {session.session_type}
                </p>

                {hasMetrics ? (
                  <p className="text-sm text-green-600">
                    Metrics recorded
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    No metrics recorded yet.
                  </p>
                )}
              </div>

              <button
                className="text-red-600 text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session.id);
                }}
              >
                Delete
              </button>
            </div>

            {/* Optional quick preview */}
            {hasMetrics && (
              <div className="mt-2 text-sm text-gray-700">
                {session.metrics.map((group, i) => (
                  <div key={i}>
                    <strong className="capitalize">{group.source}</strong>:{" "}
                    {group.metrics.length} metrics
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

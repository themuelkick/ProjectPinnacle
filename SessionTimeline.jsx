export default function SessionTimeline({ sessions, onSelect, onDelete }) {
  if (!sessions || sessions.length === 0) {
    return <p className="text-gray-500 italic">No sessions yet.</p>;
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        // Calculate total unique metrics across all groups
        const totalMetricsCount = session.metrics?.reduce(
          (sum, group) => sum + (group.metrics?.length || 0),
          0
        ) || 0;

        const hasMetrics = totalMetricsCount > 0;

        // Get unique source names
        const uniqueSources = Array.from(
          new Set(session.metrics?.map((group) => group.source?.toLowerCase()))
        ).filter(Boolean);

        return (
          <div
            key={session.id}
            className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <div className="flex justify-between items-center">
              <div className="flex-1" onClick={() => onSelect(session)}>
                <p className="font-bold text-gray-900">
                  {new Date(session.date).toLocaleDateString()} — {session.session_type}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  {hasMetrics ? (
                    <>
                      <span className="text-xs font-bold text-green-600 uppercase tracking-tight">
                        Metrics recorded
                      </span>
                      <span className="text-gray-300">•</span>
                      {/* Only show unique sources here */}
                      {uniqueSources.map((source) => (
                        <span key={source} className="text-xs text-gray-500 font-medium capitalize">
                          {source}: {totalMetricsCount} total
                        </span>
                      ))}
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">
                      No metrics recorded yet.
                    </span>
                  )}
                </div>
              </div>

              <button
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs font-bold transition-all px-2 py-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session.id);
                }}
              >
                DELETE
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
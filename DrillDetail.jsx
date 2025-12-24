import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../api";

export default function DrillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drill, setDrill] = useState(null);

  useEffect(() => {
    // We fetch from /concepts because our unified router handles both
    api.get(`/concepts/${id}`).then((res) => setDrill(res.data));
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Delete this drill and all its history?")) {
      if (window.confirm("Final Warning: This cannot be undone.")) {
        await api.delete(`/concepts/${id}`);
        navigate("/encyclopedia");
      }
    }
  };

  if (!drill) return <div className="p-8 text-white animate-pulse">Scanning Drill Data...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl my-8 overflow-hidden">

      {/* 1. ACTION BAR */}
      <div className="flex justify-between items-center bg-gray-100/80 -mx-8 -mt-8 mb-8 px-8 py-4 border-b border-gray-200">
        <Link to="/encyclopedia" className="text-xs font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
          ← Library
        </Link>
        <div className="flex gap-3">
          <Link
            to={`/encyclopedia/${id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg hover:bg-blue-700 transition-all"
          >
            Update Drill
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded border border-red-100 hover:bg-red-600 hover:text-white transition-all"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter bg-green-600 text-white">
            Active Drill
          </span>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter">
            {drill.category || "General"}
          </span>
        </div>
        <h1 className="text-5xl font-black text-gray-900 italic uppercase tracking-tighter">
          {drill.title}
        </h1>
      </div>

      {/* 2. KNOWLEDGE EVOLUTION TIMELINE */}
      <section className="py-8 border-t border-b border-gray-100">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8 text-center">
          Execution & Evolution
        </h2>

        <div className="space-y-10 max-w-2xl mx-auto">
          {/* Original Setup / Description */}
          <div className="relative pl-10 border-l-2 border-blue-600">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-100"></div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
              Base Setup
            </span>
            <div className="mt-4 text-gray-800 leading-loose text-lg font-medium">
              {drill.body || drill.description}
            </div>
          </div>

          {/* History Additions */}
          {drill.history?.map((entry, idx) => (
            <div key={idx} className="relative pl-10 border-l-2 border-green-500 animate-in slide-in-from-left duration-500">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500 ring-4 ring-green-100"></div>
              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded">
                Optimization: {new Date(entry.date).toLocaleDateString()}
              </span>
              <div className="mt-4 p-6 bg-green-50/30 rounded-2xl border border-green-100 text-gray-800 italic text-lg shadow-sm">
                "{entry.addition}"
              </div>
            </div>
          ))}

          {(!drill.history || drill.history.length === 0) && (
            <div className="text-center text-gray-300 text-[10px] font-bold uppercase tracking-widest py-4 border-2 border-dashed border-gray-100 rounded-xl">
              Standard Protocol (No Changes Logged)
            </div>
          )}
        </div>
      </section>

      {/* Video / Media Display */}
      {drill.media_files?.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Demonstration</h2>
          <div className="grid grid-cols-1 gap-4">
            {drill.media_files.map((url, idx) => (
               <div key={idx} className="aspect-video">
                 {/* This handles the logic from your old DrillDetail but supports multiple files */}
                 <video controls className="w-full h-full rounded-xl shadow-lg bg-black">
                    <source src={url} type="video/mp4" />
                 </video>
               </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {drill.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-8 border-t border-gray-50">
          {drill.tags.map((tag, idx) => (
            <span key={idx} className="text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-400 px-3 py-1 rounded-full">
              #{typeof tag === 'string' ? tag : tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
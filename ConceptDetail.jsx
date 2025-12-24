import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../../api";

export default function ConceptDetail() {
  const { conceptId } = useParams();
  const navigate = useNavigate();
  const [concept, setConcept] = useState(null);

  useEffect(() => {
    api.get(`/concepts/${conceptId}`).then((res) => setConcept(res.data));
  }, [conceptId]);

  // Double-confirmation delete handler
  const handleDelete = async () => {
    const confirmFirst = window.confirm(
      `Are you sure you want to delete "${concept.title}"? This will remove all history and media associated with it.`
    );

    if (confirmFirst) {
      const confirmSecond = window.confirm(
        "FINAL WARNING: This action is permanent and cannot be undone. Proceed?"
      );

      if (confirmSecond) {
        try {
          await api.delete(`/concepts/${conceptId}`);
          navigate("/encyclopedia");
        } catch (err) {
          console.error("Failed to delete concept", err);
          alert("Error deleting concept. Please try again.");
        }
      }
    }
  };

  if (!concept) return <p className="p-6 text-white text-center">Loading Data Hub...</p>;

  // Helper to render media (YouTube or Local Video/Image)
  const renderMediaItem = (url, idx) => {
    const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
    const isShort = url.includes("/shorts/");
    const isImage = url.match(/\.(jpg|jpeg|png|gif)$/i);

    if (isYouTube) {
      let embedUrl = url;
      if (isShort) {
        embedUrl = url.replace("/shorts/", "/embed/");
      } else if (url.includes("watch?v=")) {
        embedUrl = url.replace("watch?v=", "embed/").split("&")[0];
      } else if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1]?.split("?")[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }

      return (
        <div key={idx} className={`w-full ${isShort ? "max-w-[350px] mx-auto aspect-[9/16]" : "aspect-video"}`}>
          <iframe
            className="w-full h-full rounded-lg shadow-md"
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    if (isImage) {
      return (
        <img key={idx} src={url} alt="" className="w-full max-h-96 object-contain rounded-lg shadow-md bg-gray-900" />
      );
    }

    return (
      <video key={idx} src={url} controls className="w-full rounded-lg shadow-md bg-black" />
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl my-8 overflow-hidden">

      {/* 1. TOP ACTION BAR */}
      <div className="flex justify-between items-center bg-gray-100/80 -mx-8 -mt-8 mb-8 px-8 py-4 border-b border-gray-200">
        <Link to="/encyclopedia" className="text-xs font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
          ← Library
        </Link>
        <div className="flex gap-3">
          <Link
            to={`/encyclopedia/${conceptId}/edit`}
            className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg hover:bg-blue-700 transition-all"
          >
            Edit / Add Update
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
          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${
            concept.type === 'drill' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
          }`}>
            {concept.type || 'Concept'}
          </span>
          {concept.category && (
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter">
              {concept.category}
            </span>
          )}
        </div>
        <h1 className="text-5xl font-black text-gray-900 italic uppercase tracking-tighter">
          {concept.title}
        </h1>
      </div>

      {/* Summary Section */}
      {concept.summary && (
        <div className="bg-blue-50/50 p-5 rounded-xl border-l-4 border-blue-500 shadow-inner">
          <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Executive Summary</h3>
          <p className="text-gray-700 leading-relaxed font-medium italic">
            {concept.summary}
          </p>
        </div>
      )}

      {/* 2. KNOWLEDGE EVOLUTION TIMELINE */}
      <section className="py-8 border-t border-b border-gray-100">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8 text-center">
          Learning Evolution
        </h2>

        <div className="space-y-10 max-w-2xl mx-auto">
          {/* Original Foundational Entry */}
          <div className="relative pl-10 border-l-2 border-blue-600">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-100"></div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
              Original Foundation
            </span>
            <div className="mt-4 text-gray-800 leading-loose text-lg font-medium">
              {(concept.body || concept.description || "").split("\n").map((line, idx) => (
                <p key={idx} className="mb-4">{line}</p>
              ))}
            </div>
          </div>

          {/* Dated Additions (History) */}
          {concept.history?.map((entry, idx) => (
            <div key={idx} className="relative pl-10 border-l-2 border-green-500 animate-in slide-in-from-left duration-500">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500 ring-4 ring-green-100"></div>
              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded">
                Update Log: {new Date(entry.date).toLocaleDateString()}
              </span>
              <div className="mt-4 p-6 bg-green-50/30 rounded-2xl border border-green-100 text-gray-800 italic text-lg shadow-sm">
                "{entry.addition}"
              </div>
            </div>
          ))}

          {!concept.history?.length && (
            <div className="text-center text-gray-300 text-[10px] font-bold uppercase tracking-widest py-4 border-2 border-dashed border-gray-100 rounded-xl">
              No subsequent updates logged
            </div>
          )}
        </div>
      </section>

      {/* Media Gallery */}
      {concept.media_files?.length > 0 && (
        <div className="space-y-6 pt-4">
          <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-2">
            Visual Demonstrations
          </h3>
          <div className="grid grid-cols-1 gap-8">
            {concept.media_files.map((url, idx) => renderMediaItem(url, idx))}
          </div>
        </div>
      )}

      {/* Footer / Connections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
        {concept.related_concepts?.length > 0 && (
          <section>
            <h3 className="font-black text-gray-400 mb-4 uppercase text-[10px] tracking-widest">Deep Dive Links</h3>
            <ul className="space-y-3">
              {concept.related_concepts.map((rc) => (
                <li key={rc.id}>
                  <Link to={`/encyclopedia/${rc.id}`} className="group flex items-center gap-3 text-blue-600 font-bold hover:text-blue-800 transition-colors">
                    <span className="p-2 bg-blue-50 rounded group-hover:bg-blue-600 group-hover:text-white transition-all text-sm">📖</span>
                    {rc.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {concept.drills?.length > 0 && (
          <section>
            <h3 className="font-black text-gray-400 mb-4 uppercase text-[10px] tracking-widest">Active Application</h3>
            <ul className="space-y-3">
              {concept.drills.map((d) => (
                <li key={d.id}>
                  <Link to={`/encyclopedia/${d.id}`} className="group flex items-center gap-3 text-green-600 font-bold hover:text-green-800 transition-colors">
                    <span className="p-2 bg-green-50 rounded group-hover:bg-green-600 group-hover:text-white transition-all text-sm">⚾</span>
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Metadata Tags */}
      {concept.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-8 border-t border-gray-50">
          {concept.tags.map((tag, idx) => (
            <span key={idx} className="text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-400 px-3 py-1 rounded-full">
              #{typeof tag === 'string' ? tag : tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
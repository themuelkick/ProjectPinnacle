import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../../api";

export default function ConceptDetail() {
  const { conceptId } = useParams();
  const [concept, setConcept] = useState(null);

  useEffect(() => {
    api.get(`/concepts/${conceptId}`).then((res) => setConcept(res.data));
  }, [conceptId]);

  if (!concept) return <p className="p-6 text-white">Loading...</p>;

  // Helper to render media (YouTube or Local Video/Image)
  const renderMediaItem = (url, idx) => {
      const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
      const isShort = url.includes("/shorts/");
      const isImage = url.match(/\.(jpg|jpeg|png|gif)$/i);

      if (isYouTube) {
        let embedUrl = url;

        // 1. Handle YouTube Shorts
        if (isShort) {
          embedUrl = url.replace("/shorts/", "/embed/");
        }
        // 2. Handle Standard watch URLs
        else if (url.includes("watch?v=")) {
          embedUrl = url.replace("watch?v=", "embed/").split("&")[0];
        }
        // 3. Handle Mobile Share links (youtu.be)
        else if (url.includes("youtu.be/")) {
          const videoId = url.split("youtu.be/")[1]?.split("?")[0];
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }

        return (
          <div
            key={idx}
            className={`w-full ${isShort ? "max-w-[350px] mx-auto aspect-[9/16]" : "aspect-video"}`}
          >
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
          <img
            key={idx}
            src={url}
            alt=""
            className="w-full max-h-96 object-contain rounded-lg shadow-md bg-gray-900"
          />
        );
      }

      // Fallback for local video uploads
      return (
        <video
          key={idx}
          src={url}
          controls
          className="w-full rounded-lg shadow-md bg-black"
        />
      );
    };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl my-8">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
              concept.type === 'drill' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
            }`}>
              {concept.type || 'Concept'}
            </span>
            {concept.category && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm font-medium">
                {concept.category}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900">{concept.title}</h1>
        </div>

        <Link to="/encyclopedia" className="text-gray-400 hover:text-gray-600">
          ✕
        </Link>
      </div>

      {/* Summary */}
      {concept.summary && (
        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
          <p className="text-gray-700 italic">
            <span className="font-bold not-italic">Quick Summary:</span> {concept.summary}
          </p>
        </div>
      )}

      {/* Media Gallery */}
      {concept.media_files?.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>🎥</span> Media & Demonstrations
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {concept.media_files.map((url, idx) => renderMediaItem(url, idx))}
          </div>
        </div>
      )}

      {/* Content Body */}
      {(concept.body || concept.description) && (
        <div className="prose max-w-none text-gray-800 py-4">
          {/* Note: In our unified router, we mapped Drill description to 'body' */}
          {(concept.body || concept.description).split("\n").map((line, idx) => (
            <p key={idx} className="mb-4 leading-relaxed">{line}</p>
          ))}
        </div>
      )}

      {/* Related Data Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
        {/* Related Concepts */}
        {concept.related_concepts?.length > 0 && (
          <section>
            <h3 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider">Related Articles</h3>
            <ul className="space-y-2">
              {concept.related_concepts.map((rc) => (
                <li key={rc.id}>
                  <Link to={`/encyclopedia/${rc.id}`} className="text-blue-600 hover:underline flex items-center gap-2">
                    <span className="text-blue-300">📖</span> {rc.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Related Drills */}
        {concept.drills?.length > 0 && (
          <section>
            <h3 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider">Associated Drills</h3>
            <ul className="space-y-2">
              {concept.drills.map((d) => (
                <li key={d.id}>
                  <Link to={`/encyclopedia/${d.id}`} className="text-green-600 hover:underline flex items-center gap-2">
                    <span className="text-green-300">⚾</span> {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Tags Footer */}
      {concept.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-4">
          {concept.tags.map((tag, idx) => (
            <span key={idx} className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
              #{typeof tag === 'string' ? tag : tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="pt-8 text-center">
        <Link
          to="/encyclopedia"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition"
        >
          ← Back to Encyclopedia
        </Link>
      </div>
    </div>
  );
}
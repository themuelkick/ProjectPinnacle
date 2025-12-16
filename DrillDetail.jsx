import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../api";

export default function DrillDetail() {
  const { id } = useParams();
  const [drill, setDrill] = useState(null);

  useEffect(() => {
    api.get(`/drills/${id}`).then((res) => setDrill(res.data));
  }, [id]);

  if (!drill) return <div className="p-8">Loading...</div>;

  // Determine if video is a file path or URL
  const isVideoFile = drill.video_url && !drill.video_url.startsWith("http");

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">{drill.title}</h1>
      <p className="text-gray-700">{drill.description}</p>

      {drill.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {drill.tags.map((tag) => (
            <span
              key={tag.id}
              className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Video Display */}
      {drill.video_url && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Video</h2>
          {isVideoFile ? (
            <video controls className="w-full max-w-lg rounded">
              <source src={`/${drill.video_url}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <a
              href={drill.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Watch Video
            </a>
          )}
        </div>
      )}
    </div>
  );
}

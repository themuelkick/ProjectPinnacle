import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../../api";

export default function ConceptDetail() {
  const { conceptId } = useParams();
  const [concept, setConcept] = useState(null);

  useEffect(() => {
    api.get(`/concepts/${conceptId}`).then((res) => setConcept(res.data));
  }, [conceptId]);

  if (!concept) return <p>Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-8 flex gap-6">
      {/* Left Sidebar */}
      <aside className="w-1/4 bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h2 className="font-semibold mb-4">Categories</h2>
        <ul className="space-y-2">
          <li>Hitting</li>
          <li>Pitching</li>
          <li>Defense</li>
          <li>Mental</li>
          <li>Strength & Conditioning</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white dark:bg-gray-800 p-6 rounded shadow space-y-4">
        <h1 className="text-2xl font-bold">{concept.title}</h1>

        {concept.category && (
          <p className="text-sm text-gray-500">Category: {concept.category}</p>
        )}

        {concept.summary && (
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            <strong>TL;DR:</strong> {concept.summary}
          </p>
        )}

        {concept.body && (
          <div className="mt-4 text-gray-800 dark:text-gray-200">
            {concept.body.split("\n").map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        )}

        {/* Media */}
        {concept.media_files?.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Media</h3>
            <div className="flex flex-wrap gap-4">
              {concept.media_files.map((url, idx) =>
                url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img
                    key={idx}
                    src={url}
                    alt=""
                    className="w-32 h-32 object-cover rounded"
                  />
                ) : (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600"
                  >
                    File
                  </a>
                )
              )}
            </div>
          </div>
        )}

        {/* Related Concepts */}
        {concept.related_concepts?.length > 0 && (
          <section className="mt-6">
            <h3 className="font-semibold mb-2">Related Concepts</h3>
            <ul className="list-disc pl-6">
              {concept.related_concepts.map((rc) => (
                <li key={rc.id}>
                  <Link
                    to={`/concepts/${rc.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {rc.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Related Drills */}
        {concept.drills?.length > 0 && (
          <section className="mt-6">
            <h3 className="font-semibold mb-2">Drills</h3>
            <ul className="list-disc pl-6">
              {concept.drills.map((d) => (
                <li key={d.id}>
                  <Link
                    to={`/drills/${d.id}`}
                    className="text-green-600 hover:underline"
                  >
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Related Player Notes */}
        {concept.player_notes?.length > 0 && (
          <section className="mt-6">
            <h3 className="font-semibold mb-2">Player Notes</h3>
            <ul className="list-disc pl-6">
              {concept.player_notes.map((note) => (
                <li key={note.id}>
                  <Link
                    to={`/players/${note.player_id}`}
                    className="text-purple-600 hover:underline"
                  >
                    {note.player_name} - "{note.note.substring(0, 50)}..."
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

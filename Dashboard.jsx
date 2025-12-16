import { useState, useEffect } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [players, setPlayers] = useState([]);
  const [drills, setDrills] = useState([]);

  useEffect(() => {
    api.get("/players").then((res) => setPlayers(res.data));
    api.get("/drills").then((res) => setDrills(res.data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
        Player & Drill Dashboard
      </h1>

      {/* Top Navigation Buttons */}
      <div className="flex justify-end gap-4 mb-4">
        <Link
          to="/players/new"
          className="bg-blue-500 text-white px-3 py-2 rounded"
        >
          New Player
        </Link>
        <Link
          to="/drills/new"
          className="bg-green-500 text-white px-3 py-2 rounded"
        >
          New Drill
        </Link>
        <Link
          to="/encyclopedia"
          className="bg-purple-500 text-white px-3 py-2 rounded"
        >
          Encyclopedia
        </Link>
        <Link
          to="/encyclopedia/new"
          className="bg-purple-700 text-white px-3 py-2 rounded"
        >
          New Concept
        </Link>
      </div>

      {/* Players Section */}
      <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Players
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          {players.map((p) => (
            <li key={p.id}>
              <Link
                to={`/players/${p.id}`}
                className="text-blue-600 hover:underline"
              >
                {p.first_name} {p.last_name}
              </Link>
            </li>
          ))}
        </ul>
        {players.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">No players yet</p>
        )}
      </section>

      {/* Drills Section */}
      <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Drills
        </h2>
        <ul className="list-none space-y-4">
          {drills.map((d) => (
            <li key={d.id} className="border-b pb-2">
              <Link
                to={`/drills/${d.id}`}
                className="text-green-600 hover:underline font-medium"
              >
                {d.title}
              </Link>
              {d.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {d.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
        {drills.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">No drills yet</p>
        )}
      </section>
    </div>
  );
}

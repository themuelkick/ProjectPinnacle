import React from "react";

export default function ConceptCard({ concept }) {
  return (
    <div className="border rounded p-4 mb-4 shadow-sm hover:shadow-md transition">
      <h3 className="text-lg font-bold">{concept.title}</h3>
      <p className="text-gray-600">{concept.summary}</p>
      <div className="mt-2 text-sm text-gray-500">
        <span>{concept.category}</span> | <span>{concept.level}</span>
      </div>
    </div>
  );
}

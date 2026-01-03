import { useState, useEffect } from "react";
import { fetchConcepts, fetchConceptById, fetchConceptLinks } from "../api/encyclopedia";

export default function Encyclopedia() {
  const [concepts, setConcepts] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [links, setLinks] = useState({});

  useEffect(() => {
    const loadConcepts = async () => {
      const data = await fetchConcepts();
      setConcepts(data);
    };
    loadConcepts();
  }, []);

  const handleSelectConcept = async (id) => {
    const concept = await fetchConceptById(id);
    setSelectedConcept(concept);
    const conceptLinks = await fetchConceptLinks(id);
    setLinks(conceptLinks);
  };

  return (
    <div className="flex h-screen">
      <aside className="w-1/4 border-r p-4 overflow-y-auto">
        {concepts.map((c) => (
          <div key={c.id} onClick={() => handleSelectConcept(c.id)} className="cursor-pointer">
            {c.title}
          </div>
        ))}
      </aside>

      <main className="w-1/2 p-4 overflow-y-auto">
        {selectedConcept ? (
          <>
            <h1 className="text-xl font-bold">{selectedConcept.title}</h1>
            <p className="mt-2">{selectedConcept.summary}</p>
            <div className="mt-4">{selectedConcept.body}</div>
          </>
        ) : (
          <p>Select a concept</p>
        )}
      </main>

      <aside className="w-1/4 border-l p-4 overflow-y-auto">
        {links.relatedConcepts?.map((lc) => (
          <div key={lc.id}>{lc.title}</div>
        ))}
        {/* Add drills and players here */}
      </aside>
    </div>
  );
}

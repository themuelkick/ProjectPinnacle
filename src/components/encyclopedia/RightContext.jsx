export default function RightContext({ concept }) {
  return (
    <div>
      <h2 className="font-semibold mb-2">Related Concepts</h2>
      <ul className="list-disc pl-5 mb-4">
        {(concept.related || []).map((rel) => (
          <li key={rel.id}>{rel.title}</li>
        ))}
      </ul>

      <h2 className="font-semibold mb-2">Drills</h2>
      <ul className="list-disc pl-5 mb-4">
        {(concept.drills || []).map((d) => (
          <li key={d.id}>{d.title}</li>
        ))}
      </ul>

      <h2 className="font-semibold mb-2">Players</h2>
      <ul className="list-disc pl-5">
        {(concept.players || []).map((p) => (
          <li key={p.id}>{p.first_name} {p.last_name}</li>
        ))}
      </ul>
    </div>
  );
}

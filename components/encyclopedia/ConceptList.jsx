export default function ConceptList({ concepts, onSelect }) {
  return (
    <ul className="p-4 space-y-2">
      {concepts.map((c) => (
        <li
          key={c.id}
          className="cursor-pointer hover:bg-gray-100 p-2 rounded"
          onClick={() => onSelect(c)}
        >
          {c.title}
        </li>
      ))}
    </ul>
  );
}

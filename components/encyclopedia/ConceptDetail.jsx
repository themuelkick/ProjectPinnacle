export default function ConceptDetail({ concept }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">{concept.title}</h1>
      <p className="text-sm text-gray-500">{concept.category} | {concept.level}</p>

      <div className="mt-4">
        <h2 className="font-semibold">TL;DR</h2>
        <p>{concept.summary}</p>
      </div>

      <div className="mt-4">
        <h2 className="font-semibold">Body</h2>
        <p>{concept.body}</p>
      </div>
    </div>
  );
}

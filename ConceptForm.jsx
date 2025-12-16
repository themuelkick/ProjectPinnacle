import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";

export default function ConceptForm({ isEdit = false }) {
  const { conceptId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]); // New
  const [uploading, setUploading] = useState(false);

  // Fetch existing concept if editing
  useEffect(() => {
    if (isEdit && conceptId) {
      api.get(`/concepts/${conceptId}`).then((res) => {
        const c = res.data;
        setTitle(c.title);
        setSummary(c.summary);
        setBody(c.body);
        setCategory(c.category);
        setTags(c.tags);
        setMediaFiles(c.media_files || []);
      });
    }

    // Fetch all tags
    api.get("/tags").then((res) =>
      setAllTags(res.data.map((t) => t.name))
    );
  }, [isEdit, conceptId]);

  // Handle concept submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { title, summary, body, category, tags, media_files: mediaFiles };

    try {
      if (isEdit) {
        await api.put(`/concepts/${conceptId}`, payload);
      } else {
        await api.post("/concepts", payload);
      }
      navigate("/encyclopedia", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Error saving concept");
    }
  };

  // Toggle tag selection
  const toggleTag = (tagName) => {
    setTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  // Add a new tag
  const handleAddNewTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !allTags.includes(trimmed)) {
      setAllTags([...allTags, trimmed]);
      setTags([...tags, trimmed]);
      setNewTag("");
    }
  };

  // Handle media file upload
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/concepts/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMediaFiles([...mediaFiles, res.data.url]);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Remove a media file
  const removeMedia = (url) => {
    setMediaFiles(mediaFiles.filter((m) => m !== url));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">
        {isEdit ? "Edit Concept" : "New Concept"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full p-2 border rounded h-40"
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded"
        />

        {/* Tags */}
        <div>
          <label className="block mb-1 font-semibold">Tags:</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {allTags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                className={`px-2 py-1 rounded text-sm ${
                  tags.includes(t)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add new tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="border p-2 rounded flex-1"
            />
            <button
              type="button"
              onClick={handleAddNewTag}
              className="bg-blue-500 text-white px-3 py-2 rounded"
            >
              Add
            </button>
          </div>
        </div>

        {/* Media Upload */}
        <div>
          <label className="block mb-1 font-semibold">Media:</label>
          <input type="file" onChange={handleUpload} disabled={uploading} />
          <div className="flex flex-wrap gap-2 mt-2">
            {mediaFiles.map((url, idx) => (
              <div key={idx} className="relative">
                {url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img src={url} alt="" className="w-24 h-24 object-cover rounded" />
                ) : (
                  <a href={url} target="_blank" rel="noreferrer" className="text-blue-600">
                    File
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(url)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {isEdit ? "Update Concept" : "Create Concept"}
        </button>
      </form>
    </div>
  );
}

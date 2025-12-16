import { useState, useEffect } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export default function CreateDrill() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tag_names: [], // array of strings
  });

  const [availableTags, setAvailableTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  // Video state
  const [videoFile, setVideoFile] = useState(null);
  const [videoLink, setVideoLink] = useState("");

  // Fetch existing tags
  useEffect(() => {
    api.get("/tags").then((res) => setAvailableTags(res.data.map((t) => t.name)));
  }, []);

  // Tag input handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !formData.tag_names.includes(newTag)) {
        setFormData({ ...formData, tag_names: [...formData.tag_names, newTag] });
      }
      setTagInput("");
    } else if (e.key === "Backspace" && !tagInput) {
      setFormData({
        ...formData,
        tag_names: formData.tag_names.slice(0, -1),
      });
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tag_names: formData.tag_names.filter((t) => t !== tagToRemove),
    });
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description || "");
    data.append("tag_names", formData.tag_names.join(","));

    if (videoFile) data.append("video_file", videoFile);
    if (videoLink) data.append("video_link", videoLink);

    await api.post("/drills", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    navigate("/");
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white shadow rounded-md space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Create Drill</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Title"
          className="w-full border px-3 py-2 rounded"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          className="w-full border px-3 py-2 rounded"
          value={formData.description}
          onChange={handleChange}
        />

        {/* Tag Input */}
        <div>
          <label className="block text-gray-700 mb-1">Tags</label>
          <div className="flex flex-wrap gap-2 border rounded px-2 py-1 min-h-[40px]">
            {formData.tag_names.map((tag) => (
              <span
                key={tag}
                className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  className="ml-1 font-bold"
                  onClick={() => removeTag(tag)}
                >
                  ×
                </button>
              </span>
            ))}

            <input
              type="text"
              className="flex-1 border-none outline-none min-w-[100px]"
              placeholder="Type and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
            />
          </div>
          {availableTags.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Existing tags: {availableTags.join(", ")}
            </p>
          )}
        </div>

        {/* Video Upload / Link */}
        <div>
          <label className="block text-gray-700 mb-1">Video (optional)</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
            className="mb-2"
          />
          <input
            type="url"
            placeholder="Or paste video link"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Save Drill
        </button>
      </form>
    </div>
  );
}

import { useState, useEffect } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export default function CreateDrill() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Drills", // Default to Drills root
    tag_names: [],
  });

  const [existingCategories, setExistingCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  // Video/Media state
  const [uploading, setUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [videoLink, setVideoLink] = useState("");

  useEffect(() => {
    // 1. Fetch tags from the encyclopedia route
    api.get("/concepts/tags").then((res) => {
      setAvailableTags(res.data.map((t) => (typeof t === 'string' ? t : t.name)));
    });

    // 2. Fetch all current category paths for the datalist suggestions
    api.get("/concepts").then((res) => {
      const uniqueCats = [
        ...new Set(res.data.map((item) => item.category).filter(Boolean))
      ];
      setExistingCategories(uniqueCats);
    });
  }, []);

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await api.post("/concepts/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Add the new URL to our media list
      setMediaFiles([...mediaFiles, res.data.url]);
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Failed to upload video.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare media: Combine uploaded files and manual link
    const finalMedia = [...mediaFiles];
    if (videoLink.trim()) finalMedia.push(videoLink.trim());

    // We use the /concepts POST endpoint because your backend router
    // is set up to handle both Concepts and Drills correctly there.
    const payload = {
      title: formData.title,
      summary: "Drill Exercise", // Default summary for drills
      body: formData.description,
      category: formData.category,
      tags: formData.tag_names,
      media_files: finalMedia,
      history: [{ date: new Date().toISOString(), addition: "Initial drill creation." }]
    };

    try {
      const res = await api.post("/concepts", payload);
      // Redirect to the newly created drill in the encyclopedia
      navigate(`/encyclopedia/${res.data.id}`);
    } catch (err) {
      console.error("Save Error:", err);
      alert("Error saving drill.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-2xl rounded-2xl my-10 border border-gray-100">
      <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900 mb-6">Create New Drill</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Drill Title</label>
          <input
            type="text"
            name="title"
            placeholder="e.g., 90/90 Med Ball Rotational Throw"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Category Path */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Category / Path</label>
          <input
            type="text"
            name="category"
            list="drill-category-list"
            placeholder="e.g., Drills/Weighted Ball"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-semibold text-gray-700"
          />
          <datalist id="drill-category-list">
            {existingCategories.map((cat, idx) => (
              <option key={idx} value={cat} />
            ))}
          </datalist>
          <p className="text-[9px] text-gray-400 mt-1 italic font-bold uppercase tracking-tight ml-1">
            * Use "/" for sub-folders (e.g. Drills/Power)
          </p>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Drill Description</label>
          <textarea
            name="description"
            placeholder="Execution cues and technical details..."
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-32 focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Tags */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Tags</label>
          <div className="flex flex-wrap gap-2 border border-gray-200 bg-gray-50 rounded-xl p-3 min-h-[50px]">
            {formData.tag_names.map((tag) => (
              <span key={tag} className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                #{tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-300">×</button>
              </span>
            ))}
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-sm min-w-[120px]"
              placeholder="Type and press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
            />
          </div>
        </div>

        {/* Video Handling */}
        <div className="space-y-4 border-t border-gray-100 pt-6">
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Video Documentation</label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col items-center px-4 py-4 bg-gray-50 text-blue-500 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:bg-blue-50 transition-all">
              <span className="text-xs font-bold uppercase tracking-widest">
                {uploading ? "Uploading..." : "Upload MP4"}
              </span>
              <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>

            <input
              type="url"
              placeholder="Or paste YouTube/Vimeo link"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
            />
          </div>

          {mediaFiles.length > 0 && (
            <div className="flex gap-2">
              {mediaFiles.map((url, i) => (
                <div key={i} className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">
                  ✓ VIDEO ATTACHED
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading}
          className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl transition-all ${
            uploading ? "bg-gray-200 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1"
          }`}
        >
          Establish Drill & Sync
        </button>
      </form>
    </div>
  );
}
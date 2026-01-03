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
  const [videoLinkInput, setVideoLinkInput] = useState("");

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

  const addVideoLink = () => {
      if (videoLinkInput.trim()) {
        setMediaFiles([...mediaFiles, videoLinkInput.trim()]);
        setVideoLinkInput("");
      }
    };

  const handleSubmit = async (e) => {
      e.preventDefault();

      // 1. Title check to prevent empty submissions
      if (!formData.title.trim()) {
        return alert("A drill title is required.");
      }

      // 2. Prepare the payload
      // Since we are now using addVideoLink to push links directly into the mediaFiles array,
      // finalMedia is just a copy of the current mediaFiles state.
      const finalMedia = [...mediaFiles];

      const payload = {
        title: formData.title,
        summary: "Drill Exercise", // Default summary for drills
        body: formData.description,
        category: formData.category,
        tags: formData.tag_names,
        media_files: finalMedia,
        // BACKEND SYNC: We pick the first video to populate the legacy 'video_url' column
        video_url: finalMedia.length > 0 ? finalMedia[0] : null,
        history: [
          {
            date: new Date().toISOString(),
            addition: "Initial drill creation with synchronized video library."
          }
        ]
      };

  try {
    // We hit the unified concepts endpoint
    const res = await api.post("/concepts", payload);

    // 3. Success: Navigate to the new entry in the encyclopedia
    navigate(`/encyclopedia/${res.data.id}`);
  } catch (err) {
    console.error("Save Error:", err);
    const errorMsg = err.response?.data?.detail || "Error saving drill. Please check connection.";
    alert(errorMsg);
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
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">
                Video & Media Library
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File Upload Trigger */}
                <label className="flex flex-col items-center justify-center px-4 py-4 bg-gray-50 text-blue-500 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:bg-blue-50 transition-all">
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {uploading ? "Uploading..." : "Upload MP4"}
                  </span>
                  <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>

                {/* URL Link Input + Add Button */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste YouTube, Vimeo, or Shorts link"
                    className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                    value={videoLinkInput} // Make sure to define const [videoLinkInput, setVideoLinkInput] = useState("");
                    onChange={(e) => setVideoLinkInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={addVideoLink} // Make sure to define the addVideoLink function from the previous step
                    className="bg-blue-600 text-white px-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Active Media List (Previews & Deletion) */}
              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {mediaFiles.map((url, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-white border border-gray-200 p-2 pl-3 rounded-xl shadow-sm group"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-tighter">
                          {url.includes("youtube.com") || url.includes("youtu.be") ? "YouTube Source" : "Direct Video/File"}
                        </span>
                        <span className="text-[10px] font-bold text-gray-600 truncate max-w-[180px]">
                          {url}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setMediaFiles(mediaFiles.filter((_, idx) => idx !== i))}
                        className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                      >
                        <span className="text-lg font-bold">×</span>
                      </button>
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
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";

export default function ConceptForm({ isEdit = false }) {
  const { conceptId } = useParams();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [existingCategories, setExistingCategories] = useState([]);

  // Update Logic State
  const [currentAddition, setCurrentAddition] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Fetch existing concept/drill if in edit mode
        if (isEdit && conceptId) {
          const res = await api.get(`/concepts/${conceptId}`);
          const c = res.data;
          setTitle(c.title || "");
          setSummary(c.summary || "");
          setBody(c.body || c.description || "");
          setCategory(c.category || "");
          setTags(c.tags || []);
          setMediaFiles(c.media_files || []);
          setHistory(c.history || []);
        }

        // 2. Fetch all available tags from the unified concepts route
        const tagsRes = await api.get("/concepts/tags");
        setAllTags(tagsRes.data.map((t) => (typeof t === 'string' ? t : t.name)));

        // 3. NEW: Fetch all concepts to extract existing category paths for the datalist
        const conceptsRes = await api.get("/concepts");
        // We use a Set to ensure the list only contains unique folder paths
        const uniqueCats = [
          ...new Set(conceptsRes.data.map((item) => item.category).filter(Boolean))
        ];
        setExistingCategories(uniqueCats);

      } catch (err) {
        console.error("Initialization Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isEdit, conceptId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if title is empty
    if (!title.trim()) return alert("Title is required");

    // Build the history: append the new addition if one exists
    let updatedHistory = [...history];
    if (currentAddition.trim()) {
      updatedHistory.push({
        date: new Date().toISOString(),
        addition: currentAddition.trim()
      });
    }

    const payload = {
      title,
      summary,
      body,
      category,
      tags,
      media_files: mediaFiles,
      history: updatedHistory
    };

    try {
      let finalId = conceptId;

      if (isEdit) {
        await api.put(`/concepts/${conceptId}`, payload);
      } else {
        const res = await api.post("/concepts", payload);
        finalId = res.data.id; // Get the new ID for the redirect
      }

      // Success: Clear local entry state and navigate to the entry view
      setCurrentAddition("");
      navigate(`/encyclopedia/${finalId}`, { replace: true });
    } catch (err) {
      console.error("Save Error:", err);
      alert(err.response?.data?.detail || "Error saving intelligence data. Check backend logs.");
    }
  };

  const toggleTag = (tagName) => {
    setTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleAddNewTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !allTags.includes(trimmed)) {
      setAllTags([...allTags, trimmed]);
      setTags([...tags, trimmed]);
      setNewTag("");
    }
  };

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
      console.error("Upload Error:", err);
      alert("Media upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (url) => {
    setMediaFiles(mediaFiles.filter((m) => m !== url));
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse">LOADING INTELLIGENCE...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-2xl rounded-2xl my-10 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900">
          {isEdit ? "Update Intelligence" : "Establish Concept"}
        </h1>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-gray-300 hover:text-red-500 transition-colors font-bold text-xl"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Concept Title</label>
          <input
            type="text"
            placeholder="e.g., Kinetic Linkage Optimization"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
            required
          />
        </div>

        {/* Summary */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Core Summary</label>
          <textarea
            placeholder="Brief overview of the concept..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none italic h-20"
          />
        </div>

        {/* Body */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Foundational Details</label>
          <textarea
            placeholder="Deep dive into the technical execution..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-40 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Learning History (The "Addition" box) */}
        <div className="p-5 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200 shadow-inner">
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-600">
            {isEdit ? "Evolution: Add New Insight" : "Initial Learning Log (Optional)"}
          </label>
          <textarea
            placeholder="What new data or results were observed today?"
            value={currentAddition}
            onChange={(e) => setCurrentAddition(e.target.value)}
            className="w-full mt-2 p-3 bg-white border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm italic"
          />
          <p className="text-[9px] text-blue-400 mt-2 font-bold uppercase italic tracking-tight">
            * This creates a dated entry in the Knowledge Evolution timeline.
          </p>
        </div>

        {/* Category & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">
                  Category / Path
                </label>
                <input
                  type="text"
                  list="category-list" // This links the input to the datalist below
                  placeholder="e.g., Drills/Weighted Ball"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-700"
                />

                {/* This provides the dropdown suggestions for existing folder paths */}
                <datalist id="category-list">
                  {existingCategories.map((cat, idx) => (
                    <option key={idx} value={cat} />
                  ))}
                </datalist>

                <p className="text-[9px] text-gray-400 mt-1 italic font-bold uppercase tracking-tight ml-1">
                  * Use "/" for folders (e.g. Drills/Waterbag)
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                  Active Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
                        tags.includes(t)
                          ? "bg-blue-600 text-white shadow-md scale-105"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

        {/* Media Upload */}
        <div className="space-y-4 border-t border-gray-100 pt-6">
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Media Documentation</label>
          <div className="flex items-center justify-center w-full">
            <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-50 text-blue-500 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all">
              <span className="text-sm font-bold uppercase tracking-widest">
                {uploading ? "Uploading File..." : "Add Video / Image"}
              </span>
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            {mediaFiles.map((url, idx) => (
              <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-100">
                {url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img src={url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white text-[10px] font-black tracking-tighter italic">VIDEO</div>
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(url)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl transition-all ${
            uploading
            ? "bg-gray-200 cursor-not-allowed text-gray-400"
            : "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0"
          }`}
        >
          {isEdit ? "Commit Intelligence Update" : "Establish Concept"}
        </button>
      </form>
    </div>
  );
}
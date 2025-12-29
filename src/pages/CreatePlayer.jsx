import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CreatePlayer() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the current coach's ID

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    dob: "",
    position: "",
    team: "",
    height_ft: "",
    height_in: "",
    weight_lbs: "",
    bats: "R",
    throws: "R",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Supabase Insert Logic
    const { error } = await supabase.from("players").insert([
      {
        ...formData,
        user_id: user.id, // Links this player to YOU specifically
        // Convert numbers if necessary (Supabase expects integers for numeric columns)
        height_ft: formData.height_ft ? parseInt(formData.height_ft) : null,
        height_in: formData.height_in ? parseInt(formData.height_in) : null,
        weight_lbs: formData.weight_lbs ? parseInt(formData.weight_lbs) : null,
      },
    ]);

    if (error) {
      console.error("Error saving player:", error.message);
      alert("Failed to recruit player: " + error.message);
    } else {
      navigate("/"); // Go back home
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 text-white">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">
          Recruit <span className="text-blue-500">New Prospect</span>
        </h2>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">
          Entry into Pinnacle Intelligence System
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">

        {/* Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-blue-500 ml-1">First Name</label>
            <input
              type="text"
              name="first_name"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-blue-500 ml-1">Last Name</label>
            <input
              type="text"
              name="last_name"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-blue-500 ml-1">DOB</label>
            <input
              type="date"
              name="dob"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.dob}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-blue-500 ml-1">Position</label>
            <input
              type="text"
              name="position"
              placeholder="e.g. RHP / SS"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-white"
              value={formData.position}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-blue-500 ml-1">Current Team</label>
            <input
              type="text"
              name="team"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.team}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Physical Traits */}
        <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-blue-500 ml-1">Height (ft)</label>
            <input
              type="number"
              name="height_ft"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.height_ft}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-blue-500 ml-1">Height (in)</label>
            <input
              type="number"
              name="height_in"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.height_in}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-blue-500 ml-1">Weight (lbs)</label>
            <input
              type="number"
              name="weight_lbs"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.weight_lbs}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Mechanics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-blue-500 ml-1">Bats</label>
            <select
              name="bats"
              value={formData.bats}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
            >
              <option value="R" className="bg-gray-900 text-white">Right</option>
              <option value="L" className="bg-gray-900 text-white">Left</option>
              <option value="S" className="bg-gray-900 text-white">Switch</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-blue-500 ml-1">Throws</label>
            <select
              name="throws"
              value={formData.throws}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
            >
              <option value="R" className="bg-gray-900 text-white">Right</option>
              <option value="L" className="bg-gray-900 text-white">Left</option>
            </select>
          </div>
        </div>

        {/* Scouting Notes */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-blue-500 ml-1">Notes</label>
          <textarea
            name="notes"
            rows="3"
            className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          Confirm Recruitment
        </button>
      </form>
    </div>
  );
}
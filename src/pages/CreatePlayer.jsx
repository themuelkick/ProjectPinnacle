import { useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export default function CreatePlayer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    dob: "",
    position: "",
    team: "",
    height_ft: "",
    height_in: "",
    weight_lbs: "",
    bats: "R",  // default
    throws: "R", // default
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/players", formData);
    navigate("/"); // go back home
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white shadow rounded-md space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Create Player</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          className="w-full border px-3 py-2 rounded"
          value={formData.first_name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          className="w-full border px-3 py-2 rounded"
          value={formData.last_name}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="dob"
          className="w-full border px-3 py-2 rounded"
          value={formData.dob}
          onChange={handleChange}
        />

        <input
          type="text"
          name="position"
          placeholder="Position"
          className="w-full border px-3 py-2 rounded"
          value={formData.position}
          onChange={handleChange}
        />

        <input
          type="text"
          name="team"
          placeholder="Team"
          className="w-full border px-3 py-2 rounded"
          value={formData.team}
          onChange={handleChange}
        />

        {/* Height */}
        <div className="flex gap-2">
          <input
            type="number"
            name="height_ft"
            placeholder="Height (ft)"
            className="w-1/2 border px-3 py-2 rounded"
            value={formData.height_ft}
            onChange={handleChange}
            min="0"
          />
          <input
            type="number"
            name="height_in"
            placeholder="Height (in)"
            className="w-1/2 border px-3 py-2 rounded"
            value={formData.height_in}
            onChange={handleChange}
            min="0"
            max="11"
          />
        </div>

        <input
          type="number"
          name="weight_lbs"
          placeholder="Weight (lbs)"
          className="w-full border px-3 py-2 rounded"
          value={formData.weight_lbs}
          onChange={handleChange}
          min="0"
        />

        {/* Bats */}
        <label className="block text-gray-700 mb-1">Bats</label>
        <select
          name="bats"
          value={formData.bats}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="R">Right</option>
          <option value="L">Left</option>
          <option value="S">Switch</option>
        </select>

        {/* Throws */}
        <label className="block text-gray-700 mb-1">Throws</label>
        <select
          name="throws"
          value={formData.throws}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="R">Right</option>
          <option value="L">Left</option>
        </select>

        {/* Notes */}
        <textarea
          name="notes"
          placeholder="Notes"
          className="w-full border px-3 py-2 rounded"
          value={formData.notes}
          onChange={handleChange}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Save Player
        </button>
      </form>
    </div>
  );
}
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Fetch all concepts for sidebar
export const fetchConcepts = async () => {
  const res = await api.get("/concepts");
  return res.data;
};

// Fetch a single concept by ID
export const fetchConceptById = async (id) => {
  const res = await api.get(`/concepts/${id}`);
  return res.data;
};

// Fetch related drills, players, and notes
export const fetchConceptLinks = async (id) => {
  const res = await api.get(`/concepts/${id}/links`);
  return res.data;
};

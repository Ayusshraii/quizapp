import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:3001",
});
// USERS
export const registerUser = (userData) => api.post("/users", userData);
export const getUsers = () => api.get("/users");
// RESULTS
export const saveResult = (resultData) => api.post("/results", resultData);
export const getResults = () => api.get("/results");
export const getUserResults = (userId) =>
  api.get(`/results?userId=${userId}`);
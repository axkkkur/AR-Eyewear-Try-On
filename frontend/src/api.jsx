import axios from "axios";

const API = axios.create({
  baseURL: "https://ar-eyewear-try-on-1.onrender.com/api",
});

export const getProducts = () => API.get("/products");

import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000"; // Flask backend URL
const API_BASE = process.env.REACT_APP_API_BASE || BASE_URL;

export const fetchProducts = (params) => axios.get(`${API_BASE}/api/products`, { params }).then(r => r.data);
export const fetchProduct = (id) => axios.get(`${API_BASE}/api/products/${id}`).then(r => r.data);
export const autosuggest = (q) => axios.get(`${API_BASE}/api/search-autosuggest`, { params: { q } }).then(r => r.data);
export const validateCart = (items) => axios.post(`${API_BASE}/api/cart/validate`, { items }).then(r => r.data);
export const checkoutOrder = (payload) => axios.post(`${API_BASE}/api/checkout`, payload).then(r => r.data);
export const fetchOrders = (params) => axios.get(`${API_BASE}/api/orders`, { params }).then(r => r.data);
export const invoiceDownload = (orderId) => axios.get(`${API_BASE}/api/invoice/${orderId}`, { responseType: 'blob' }).then(r => r.data);
export const updateOrderStatus = (orderId, status) => axios.put(`${API_BASE}/api/orders/${orderId}/status`, { status }).then(r => r.data);

export async function signup(username, password) {
  const res = await fetch("http://localhost:5000/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return await res.json();
}

export const getPrediction = async (inputData) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${BASE_URL}/predict`,
      inputData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

// ✅ NEW: Get weather data using city name
export const getWeather = async (city) => {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: { city },
    });
    return response.data;
  } catch (error) {
    console.error("Weather API error:", error);
    throw error;
  }
};
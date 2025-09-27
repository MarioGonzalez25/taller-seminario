// /src/api.js
import axios from 'axios';

// Usa .env (VITE_API_URL) o 5001 por defecto
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Exporta la instancia (tendrá .get/.post/.put/.delete)
export default api;

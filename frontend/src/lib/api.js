import axios from 'axios';

// Use relative path for API calls in production (handled by nginx proxy)
// In development, it will use the Vite proxy
const API_BASE = import.meta.env.PROD ? '/api' : 'http://127.0.0.1:8000';

export async function fetchScripts() {
    const res = await axios.get(`${API_BASE}/scripts/`);
    return res.data;
}

export async function searchScripts(query) {
    const res = await axios.get(`${API_BASE}/scripts/search/`, { params: { query } });
    return res.data;
}

export async function createScript(data) {
    const res = await axios.post(`${API_BASE}/scripts/`, data);
    return res.data;
}

// You'll need to add update & delete endpoints in FastAPI, but assuming:
export async function updateScript(id, data) {
    const res = await axios.put(`${API_BASE}/scripts/${id}`, data);
    return res.data;
}

export async function deleteScript(id) {
    const res = await axios.delete(`${API_BASE}/scripts/${id}`);
    return res.data;
}

export async function runScriptLocally(script) {
    // This is client-side "run", simulated
    alert(`Running script:\n${script.content}`);
}
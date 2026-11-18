import axios from 'axios'

// One place for the API address. Locally it is JSON Server on port 3001.
// On Vercel we set VITE_API_URL to the Render address instead.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({ baseURL: API_URL })

export default api

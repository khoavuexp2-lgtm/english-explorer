import { StrictMode } from 'react'
console.log("Kiem tra Key:", import.meta.env.VITE_GEMINI_API_KEY);
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

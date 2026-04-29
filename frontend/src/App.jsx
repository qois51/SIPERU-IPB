import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import "./App.css";
import BookingForm from './pages/BookingForm'; /* Agoy */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function App() {
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await fetch(`${API_BASE}/api/health`);
        if (!response.ok) {
          throw new Error("Backend responded with non-200 status");
        }
        const data = await response.json();
        setStatus(`${data.status} - ${data.message}`);
      } catch (error) {
        setStatus("Backend belum terhubung. Jalankan FastAPI server.");
      }
    }
    checkBackend();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <section className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
              <h1 className="text-2xl font-bold text-[#263C92] mb-4">SIPERU Fullstack Starter</h1>
              <p className="text-gray-700">Frontend: React + Vite + Tailwind</p>
              <p className="text-gray-700 mb-6">Backend: FastAPI + PostgreSQL</p>
              <div className="bg-blue-50 text-[#263C92] p-3 rounded-md font-medium">
                API Status: {status}
              </div>
            </section>
          </main>
        } />

        <Route path="/booking" element={<BookingForm />} />
        
      </Routes>
    </Router>
  );
}

export default App;
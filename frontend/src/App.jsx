import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

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
        setStatus("Backend belum terhubung. Jalankan Flask API.");
      }
    }

    checkBackend();
  }, []);

  return (
    <main className="page">
      <section className="card">
        <h1>SIPERU Fullstack Starter</h1>
        <p>Frontend: React + Vite</p>
        <p>Backend: Flask</p>
        <p className="status">API Status: {status}</p>
      </section>
    </main>
  );
}

export default App;

import { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import PerformancePage from "./pages/PerformancePage";
import AIReportPage from "./pages/AIReportPage";

// ─── Toast Context ────────────────────────────────────────────────────────────
export const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

function ToastContainer({ toasts }) {
  return (
    <div style={{
      position: "fixed", top: "20px", right: "20px",
      zIndex: 99999, display: "flex", flexDirection: "column", gap: "10px"
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          padding: "12px 20px",
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: "500",
          color: "white",
          minWidth: "250px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          animation: "slideIn 0.3s ease",
          backgroundColor:
            t.type === "success" ? "#11998e" :
            t.type === "error" ? "#e52d27" :
            t.type === "warning" ? "#f7971e" : "#534AB7",
        }}>
          {t.type === "success" ? "✅ " : t.type === "error" ? "❌ " : t.type === "warning" ? "⚠️ " : "ℹ️ "}
          {t.message}
        </div>
      ))}
    </div>
  );
}

function AppRoutes({ showToast }) {
  const [results, setResults] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("quizUser"));
    if (!user) return;

    fetch(`http://localhost:3000/results?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.length > 0) setResults(data);
        else loadFromLocalStorage(user);
      })
      .catch(() => loadFromLocalStorage(user));

    function loadFromLocalStorage(user) {
      const all = JSON.parse(localStorage.getItem("quizResults") || "[]");
      setResults(all.filter((r) => r.userId === user.id).map((r) => ({
        ...r,
        percentage: r.percentage ?? Math.round((r.score / r.total) * 100),
        correctAnswers: r.correctAnswers ?? r.score,
        wrongAnswers: r.wrongAnswers ?? (r.total - r.score),
        date: r.date ?? new Date().toISOString(),
      })));
    }
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/login" element={<Login showToast={showToast} />} />
      <Route path="/register" element={<Register showToast={showToast} />} />
      <Route path="/dashboard" element={<Dashboard showToast={showToast} />} />
      <Route path="/quiz/:id" element={<Quiz showToast={showToast} />} />
      <Route path="/results/:id" element={<Results showToast={showToast} />} />
      <Route path="/performance" element={<PerformancePage results={results} />} />
      <Route path="/ai-report" element={<AIReportPage results={results} showToast={showToast} />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  const [toasts, setToasts] = useState([]);

  function showToast(message, type = "info") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }

  return (
    <ToastContext.Provider value={showToast}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .page-enter { animation: fadeInUp 0.4s ease; }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; }
        .btn-hover { transition: transform 0.15s ease, opacity 0.15s ease; }
        .btn-hover:hover { transform: scale(1.02); opacity: 0.9; }
        .btn-hover:active { transform: scale(0.98); }
      `}</style>
      <BrowserRouter>
        <ToastContainer toasts={toasts} />
        <AppRoutes showToast={showToast} />
      </BrowserRouter>
    </ToastContext.Provider>
  );
}

export default App;
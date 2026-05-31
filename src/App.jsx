import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import PerformancePage from "./pages/PerformancePage";
import AIReportPage from "./pages/AIReportPage";

function AppRoutes() {
  const [results, setResults] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("quizUser"));
    if (!user) return;

    fetch(`http://localhost:3000/results?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.length > 0) {
          setResults(data);
        } else {
          const all = JSON.parse(localStorage.getItem("quizResults") || "[]");
          setResults(all.filter((r) => r.userId === user.id).map((r) => ({
            ...r,
            percentage: r.percentage ?? Math.round((r.score / r.total) * 100),
            correctAnswers: r.correctAnswers ?? r.score,
            wrongAnswers: r.wrongAnswers ?? (r.total - r.score),
            date: r.date ?? new Date().toISOString(),
          })));
        }
      })
      .catch(() => {
        const user = JSON.parse(localStorage.getItem("quizUser"));
        const all = JSON.parse(localStorage.getItem("quizResults") || "[]");
        setResults(all.filter((r) => r.userId === user?.id).map((r) => ({
          ...r,
          percentage: r.percentage ?? Math.round((r.score / r.total) * 100),
          correctAnswers: r.correctAnswers ?? r.score,
          wrongAnswers: r.wrongAnswers ?? (r.total - r.score),
          date: r.date ?? new Date().toISOString(),
        })));
      });
  }, [location.pathname]); // ← re-fetches every time route changes

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/quiz/:id" element={<Quiz />} />
      <Route path="/results/:id" element={<Results />} />
      <Route path="/performance" element={<PerformancePage results={results} />} />
      <Route path="/ai-report" element={<AIReportPage results={results} />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
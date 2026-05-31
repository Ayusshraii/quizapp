import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import quizData from "../data/quizData";

function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quiz = quizData.find((q) => q.id === parseInt(id));

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(quiz?.questions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState((quiz?.questions.length || 10) * 60);
  const [selected, setSelected] = useState(null);
  const [showExitWarning, setShowExitWarning] = useState(false);

  const user = JSON.parse(localStorage.getItem("quizUser"));

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!quiz) { navigate("/dashboard"); return; }
  }, []);

  // Fullscreen
  useEffect(() => {
    document.documentElement.requestFullscreen().catch(() => {});

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setShowExitWarning(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement) document.exitFullscreen();
    };
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) { handleSubmit(); return; }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  function formatTime(s) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  function handleSelect(option) {
    setSelected(option);
    const updated = [...answers];
    updated[current] = option;
    setAnswers(updated);
  }

  function handleNext() {
    if (current < quiz.questions.length - 1) {
      setCurrent(current + 1);
      setSelected(answers[current + 1]);
    } else {
      handleSubmit();
    }
  }

  function handlePrev() {
    if (current > 0) {
      setCurrent(current - 1);
      setSelected(answers[current - 1]);
    }
  }

  async function handleSubmit() {
    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.answer) score++;
    });

    const total = quiz.questions.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 60;
    const timeTaken = (quiz.questions.length * 60) - timeLeft;

    const result = {
      userId: user.id,
      quizId: quiz.id,
      quizTitle: quiz.title,
      score,
      total,
      percentage,
      correctAnswers: score,
      wrongAnswers: total - score,
      passed,
      timeTaken,
      date: new Date().toISOString(),
      answers,
    };

    // Save to JSON Server
    try {
      await fetch("http://localhost:3000/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
    } catch {
      console.error("Could not save to JSON Server");
    }

    // Also save to localStorage as backup
    const existing = JSON.parse(localStorage.getItem("quizResults") || "[]");
    existing.push(result);
    localStorage.setItem("quizResults", JSON.stringify(existing));

    if (document.fullscreenElement) document.exitFullscreen();
    navigate(`/results/${id}`, { state: result });
  }

  function reenterFullscreen() {
    document.documentElement.requestFullscreen().catch(() => {});
    setShowExitWarning(false);
  }

  if (!quiz) return null;

  const question = quiz.questions[current];
  const progress = ((current + 1) / quiz.questions.length) * 100;
  const timerColor = timeLeft < 60 ? "#e52d27" : timeLeft < 120 ? "#f7971e" : "#534AB7";

  return (
    <div style={styles.page}>

      {/* Exit fullscreen warning */}
      {showExitWarning && (
        <div style={styles.warningOverlay}>
          <div style={styles.warningBox}>
            <div style={styles.warningIcon}>⚠️</div>
            <h3 style={styles.warningTitle}>You exited fullscreen!</h3>
            <p style={styles.warningText}>The quiz requires fullscreen mode. Please return to fullscreen to continue.</p>
            <button style={styles.reenterBtn} onClick={reenterFullscreen}>
              Re-enter Fullscreen
            </button>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <h2 style={styles.quizTitle}>{quiz.title}</h2>
        <div style={{ ...styles.timer, color: timerColor }}>⏱ {formatTime(timeLeft)}</div>
      </div>

      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      <div style={styles.content}>
        <div style={styles.questionCard}>
          <p style={styles.questionNum}>Question {current + 1} of {quiz.questions.length}</p>
          <h3 style={styles.questionText}>{question.question}</h3>

          <div style={styles.options}>
            {question.options.map((option, i) => (
              <button
                key={i}
                style={{
                  ...styles.option,
                  backgroundColor: selected === option ? "#534AB7" : "white",
                  color: selected === option ? "white" : "#1a1a2e",
                  borderColor: selected === option ? "#534AB7" : "#ddd",
                }}
                onClick={() => handleSelect(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <div style={styles.btnRow}>
            <button style={styles.prevBtn} onClick={handlePrev} disabled={current === 0}>Previous</button>
            <button style={styles.nextBtn} onClick={handleNext}>
              {current === quiz.questions.length - 1 ? "Submit" : "Next"}
            </button>
          </div>
        </div>

        <div style={styles.sidebar}>
          <p style={styles.sidebarTitle}>Questions</p>
          <div style={styles.dotGrid}>
            {quiz.questions.map((_, i) => (
              <div
                key={i}
                style={{
                  ...styles.dot,
                  backgroundColor: i === current ? "#534AB7" : answers[i] ? "#11998e" : "#eee",
                  color: i === current || answers[i] ? "white" : "#888",
                }}
                onClick={() => { setCurrent(i); setSelected(answers[i]); }}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <button style={styles.submitBtn} onClick={handleSubmit}>Submit Quiz</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
  warningOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 },
  warningBox: { backgroundColor: "white", borderRadius: "16px", padding: "40px", textAlign: "center", maxWidth: "400px", width: "90%" },
  warningIcon: { fontSize: "48px", marginBottom: "16px" },
  warningTitle: { fontSize: "20px", fontWeight: "700", color: "#1a1a2e", marginBottom: "12px" },
  warningText: { fontSize: "14px", color: "#666", marginBottom: "24px", lineHeight: 1.6 },
  reenterBtn: { padding: "12px 32px", backgroundColor: "#534AB7", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer" },
  header: { backgroundColor: "white", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  quizTitle: { fontSize: "18px", fontWeight: "700", color: "#534AB7", margin: 0 },
  timer: { fontSize: "16px", fontWeight: "600" },
  progressBar: { height: "4px", backgroundColor: "#e8e8e8" },
  progressFill: { height: "100%", backgroundColor: "#534AB7", transition: "width 0.3s" },
  content: { maxWidth: "900px", margin: "0 auto", padding: "32px 16px", display: "flex", gap: "24px" },
  questionCard: { flex: 1, backgroundColor: "white", borderRadius: "16px", padding: "32px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
  questionNum: { fontSize: "13px", color: "#888", marginBottom: "12px" },
  questionText: { fontSize: "18px", fontWeight: "600", color: "#1a1a2e", marginBottom: "24px", lineHeight: 1.5 },
  options: { display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" },
  option: { padding: "14px 18px", border: "2px solid", borderRadius: "10px", fontSize: "15px", textAlign: "left", cursor: "pointer", transition: "all 0.15s" },
  btnRow: { display: "flex", gap: "12px" },
  prevBtn: { flex: 1, padding: "12px", backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", cursor: "pointer", color: "#333" },
  nextBtn: { flex: 1, padding: "12px", backgroundColor: "#534AB7", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", color: "white" },
  sidebar: { width: "200px", backgroundColor: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", height: "fit-content" },
  sidebarTitle: { fontSize: "13px", fontWeight: "600", color: "#888", marginBottom: "12px" },
  dotGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "16px" },
  dot: { width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  submitBtn: { width: "100%", padding: "10px", backgroundColor: "#11998e", border: "none", borderRadius: "8px", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
};

export default Quiz;
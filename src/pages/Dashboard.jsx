import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("quizUser"));
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login");
  }, []);

  function handleLogout() {
    localStorage.removeItem("quizUser");
    navigate("/login");
  }

  const quizzes = [
    { id: 1, title: "JavaScript Basics",  questions: 10, time: 10, color: "#f7971e" },
    { id: 2, title: "React Fundamentals", questions: 10, time: 10, color: "#534AB7" },
    { id: 3, title: "HTML & CSS",         questions: 10, time: 10, color: "#11998e" },
    { id: 4, title: "Python Basics",      questions: 10, time: 10, color: "#e52d27" },
    { id: 5, title: "General Knowledge",  questions: 10, time: 10, color: "#1a1a2e" },
  ];

  const results = JSON.parse(localStorage.getItem("quizResults") || "[]")
    .filter((r) => r.userId === user?.id);

  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        <h2 style={styles.logo}>Quiz App</h2>
        <div style={styles.navLinks}>
          <button style={styles.navLinkBtn} onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button style={styles.navLinkBtn} onClick={() => navigate("/performance")}>📊 Performance</button>
          <button style={styles.navLinkBtn} onClick={() => navigate("/ai-report")}>🤖 AI Report</button>
        </div>
        <div style={styles.navRight}>
          <span style={styles.navName}>Hi, {user?.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.welcomeCard}>
          <h1 style={styles.welcomeTitle}>Welcome back, {user?.name}! 👋</h1>
          <p style={styles.welcomeSubtitle}>You have attempted {results.length} quiz{results.length !== 1 ? "zes" : ""} so far. Keep going!</p>
        </div>

        <h2 style={styles.sectionTitle}>Available Quizzes</h2>
        <div style={styles.quizGrid}>
          {quizzes.map((quiz) => (
            <div key={quiz.id} style={styles.quizCard}>
              <div style={{ ...styles.quizColor, backgroundColor: quiz.color }} />
              <div style={styles.quizBody}>
                <h3 style={styles.quizTitle}>{quiz.title}</h3>
                <p style={styles.quizInfo}>{quiz.questions} Questions • {quiz.time} Minutes</p>
                <button style={{ ...styles.startBtn, backgroundColor: quiz.color }} onClick={() => navigate(`/quiz/${quiz.id}`)}>Start Quiz</button>
              </div>
            </div>
          ))}
        </div>

        <h2 style={styles.sectionTitle}>Previous Attempts</h2>
        {results.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyText}>You haven't attempted any quiz yet. Start one above!</p>
          </div>
        ) : (
          <div style={styles.resultsList}>
            {results.map((r, i) => (
              <div key={i} style={styles.resultRow}>
                <span style={styles.resultName}>{r.quizTitle}</span>
                <span style={styles.resultScore}>{r.score}/{r.total}</span>
                <span style={{ ...styles.resultBadge, backgroundColor: r.passed ? "#e6f9f0" : "#fff0f0", color: r.passed ? "#1a7a4a" : "#cc0000" }}>
                  {r.passed ? "PASS" : "FAIL"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
  navbar: { backgroundColor: "white", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  logo: { fontSize: "20px", fontWeight: "700", color: "#534AB7", margin: 0 },
  navLinks: { display: "flex", gap: "8px" },
  navLinkBtn: { padding: "8px 14px", backgroundColor: "transparent", border: "1px solid #e8e8e8", borderRadius: "8px", cursor: "pointer", fontSize: "13px", color: "#333", fontWeight: "500" },
  navRight: { display: "flex", alignItems: "center", gap: "16px" },
  navName: { fontSize: "14px", color: "#555" },
  logoutBtn: { padding: "8px 16px", backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontSize: "14px", color: "#333" },
  content: { maxWidth: "900px", margin: "0 auto", padding: "32px 16px" },
  welcomeCard: { backgroundColor: "#534AB7", borderRadius: "16px", padding: "32px", marginBottom: "32px", color: "white" },
  welcomeTitle: { fontSize: "24px", fontWeight: "700", marginBottom: "8px" },
  welcomeSubtitle: { fontSize: "15px", opacity: 0.85, margin: 0 },
  sectionTitle: { fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "#1a1a2e" },
  quizGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px", marginBottom: "32px" },
  quizCard: { backgroundColor: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
  quizColor: { height: "6px" },
  quizBody: { padding: "20px" },
  quizTitle: { fontSize: "16px", fontWeight: "600", marginBottom: "6px", color: "#1a1a2e" },
  quizInfo: { fontSize: "13px", color: "#888", marginBottom: "16px" },
  startBtn: { width: "100%", padding: "10px", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  emptyBox: { backgroundColor: "white", borderRadius: "12px", padding: "32px", textAlign: "center" },
  emptyText: { color: "#888", fontSize: "14px", margin: 0 },
  resultsList: { backgroundColor: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
  resultRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f0f0f0" },
  resultName: { fontSize: "14px", fontWeight: "500", color: "#1a1a2e", flex: 1 },
  resultScore: { fontSize: "14px", fontWeight: "600", color: "#534AB7", marginRight: "16px" },
  resultBadge: { fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "20px" },
};

export default Dashboard;
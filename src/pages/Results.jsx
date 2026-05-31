import { useLocation, useNavigate, useParams } from "react-router-dom";
import quizData from "../data/quizData";

function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const result = location.state;

  if (!result) { navigate("/dashboard"); return null; }

  const quiz = quizData.find((q) => q.id === parseInt(id));

  function formatTime(seconds) {
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  }

  const percentage = Math.round((result.score / result.total) * 100);

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <div style={{ ...styles.scoreCard, backgroundColor: result.passed ? "#534AB7" : "#e52d27" }}>
          <p style={styles.scoreLabel}>Your Score</p>
          <h1 style={styles.scoreNumber}>{result.score}/{result.total}</h1>
          <p style={styles.scorePercent}>{percentage}%</p>
          <div style={styles.badge}>{result.passed ? "PASS" : "FAIL"}</div>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statBox}><p style={styles.statValue}>{result.score}</p><p style={styles.statLabel}>Correct</p></div>
          <div style={styles.statBox}><p style={styles.statValue}>{result.total - result.score}</p><p style={styles.statLabel}>Wrong</p></div>
          <div style={styles.statBox}><p style={styles.statValue}>{formatTime(result.timeTaken)}</p><p style={styles.statLabel}>Time Taken</p></div>
          <div style={styles.statBox}><p style={styles.statValue}>{percentage}%</p><p style={styles.statLabel}>Percentage</p></div>
        </div>

        <div style={styles.btnRow}>
          <button style={styles.dashBtn} onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
          <button style={styles.retryBtn} onClick={() => navigate(`/quiz/${id}`)}>Retry Quiz</button>
        </div>

        <h2 style={styles.reviewTitle}>Answer Review</h2>
        <div style={styles.reviewList}>
          {quiz.questions.map((q, index) => {
            const userAnswer = result.answers[index];
            const isCorrect = userAnswer === q.answer;
            return (
              <div key={index} style={styles.reviewItem}>
                <p style={styles.reviewQuestion}><span style={styles.qNumber}>Q{index + 1}.</span> {q.question}</p>
                <div style={styles.optionsReview}>
                  {q.options.map((option, i) => {
                    let bg = "white", border = "#ddd", color = "#333";
                    if (option === q.answer) { bg = "#e6f9f0"; border = "#1a7a4a"; color = "#1a7a4a"; }
                    else if (option === userAnswer && !isCorrect) { bg = "#fff0f0"; border = "#cc0000"; color = "#cc0000"; }
                    return (
                      <div key={i} style={{ ...styles.reviewOption, backgroundColor: bg, borderColor: border, color }}>
                        {option}
                        {option === q.answer && <span style={{ color: "#1a7a4a", fontWeight: 700 }}> ✓</span>}
                        {option === userAnswer && !isCorrect && <span style={{ color: "#cc0000", fontWeight: 700 }}> ✗</span>}
                      </div>
                    );
                  })}
                </div>
                {!userAnswer && <p style={styles.skipped}>You skipped this question</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#f0f2f5", paddingBottom: "40px" },
  content: { maxWidth: "700px", margin: "0 auto", padding: "32px 16px" },
  scoreCard: { borderRadius: "16px", padding: "40px", textAlign: "center", color: "white", marginBottom: "24px" },
  scoreLabel: { fontSize: "14px", opacity: 0.85, marginBottom: "8px" },
  scoreNumber: { fontSize: "56px", fontWeight: "700", margin: "0 0 8px 0" },
  scorePercent: { fontSize: "20px", opacity: 0.9, marginBottom: "16px" },
  badge: { display: "inline-block", padding: "6px 24px", borderRadius: "20px", fontSize: "14px", fontWeight: "700", letterSpacing: "1px", backgroundColor: "#ffffff33" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" },
  statBox: { backgroundColor: "white", borderRadius: "12px", padding: "16px", textAlign: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
  statValue: { fontSize: "22px", fontWeight: "700", color: "#534AB7", margin: "0 0 4px 0" },
  statLabel: { fontSize: "12px", color: "#888", margin: 0 },
  btnRow: { display: "flex", gap: "12px", marginBottom: "32px" },
  dashBtn: { flex: 1, padding: "12px", backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", color: "#333" },
  retryBtn: { flex: 1, padding: "12px", backgroundColor: "#534AB7", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", color: "white" },
  reviewTitle: { fontSize: "18px", fontWeight: "600", color: "#1a1a2e", marginBottom: "16px" },
  reviewList: { display: "flex", flexDirection: "column", gap: "16px" },
  reviewItem: { backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
  reviewQuestion: { fontSize: "15px", fontWeight: "600", color: "#1a1a2e", marginBottom: "12px", lineHeight: 1.5 },
  qNumber: { color: "#534AB7" },
  optionsReview: { display: "flex", flexDirection: "column", gap: "8px" },
  reviewOption: { padding: "10px 14px", borderRadius: "8px", border: "1px solid", fontSize: "14px", display: "flex", justifyContent: "space-between" },
  skipped: { fontSize: "13px", color: "#888", fontStyle: "italic", marginTop: "8px" },
};

export default Results;
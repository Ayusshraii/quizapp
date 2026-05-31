import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ showToast }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleLogin() {
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      showToast("Please fill in all fields.", "error");
      return;
    }
    const users = JSON.parse(localStorage.getItem("quizUsers") || "[]");
    const user = users.find(u => u.email === form.email && u.password === form.password);
    if (!user) {
      setError("Invalid email or password.");
      showToast("Invalid email or password.", "error");
      return;
    }
    localStorage.setItem("quizUser", JSON.stringify(user));
    showToast(`Welcome back, ${user.name}! 👋`, "success");
    setTimeout(() => navigate("/dashboard"), 500);
  }

  return (
    <div style={styles.page} className="page-enter">
      <div style={styles.card} className="card-hover">
        <div style={styles.logoBox}>🎯</div>
        <h2 style={styles.title}>Welcome Back 👋</h2>
        <p style={styles.subtitle}>Login to continue your quizzes</p>
        {error && <div style={styles.error}>{error}</div>}
        <input style={styles.input} type="email" name="email" placeholder="Email address" value={form.email} onChange={handleChange} />
        <input style={styles.input} type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
        <button style={styles.btn} className="btn-hover" onClick={handleLogin}>Login →</button>
        <p style={styles.switchText}>
          Don't have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/register")}>Register</span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: "white", borderRadius: "20px", padding: "48px 40px", width: "100%", maxWidth: "420px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  logoBox: { fontSize: "48px", textAlign: "center", marginBottom: "16px" },
  title: { fontSize: "24px", fontWeight: "700", color: "#1a1a2e", marginBottom: "8px", textAlign: "center" },
  subtitle: { fontSize: "14px", color: "#888", textAlign: "center", marginBottom: "28px" },
  error: { backgroundColor: "#fff0f0", color: "#cc0000", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", animation: "fadeIn 0.3s ease" },
  input: { width: "100%", padding: "13px 14px", fontSize: "14px", border: "1.5px solid #eee", borderRadius: "10px", marginBottom: "12px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
  btn: { width: "100%", padding: "13px", backgroundColor: "#534AB7", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer", marginTop: "8px" },
  switchText: { textAlign: "center", fontSize: "14px", color: "#888", marginTop: "20px" },
  link: { color: "#534AB7", fontWeight: "600", cursor: "pointer" },
};

export default Login;
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleLogin() {
    if (!form.email || !form.password) {
      setError("Please fill in all fields."); return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/users?email=${form.email}&password=${form.password}`);
      const users = await res.json();

      if (users.length === 0) {
        setError("Invalid email or password."); setLoading(false); return;
      }

      localStorage.setItem("quizUser", JSON.stringify(users[0]));
      navigate("/dashboard");
    } catch {
      setError("Could not connect to server. Is JSON Server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back 👋</h2>
        <p style={styles.subtitle}>Login to continue your quizzes</p>
        {error && <div style={styles.error}>{error}</div>}
        <input style={styles.input} type="email" name="email" placeholder="Email address" value={form.email} onChange={handleChange} />
        <input style={styles.input} type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} />
        <button style={styles.btn} onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
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
  card: { backgroundColor: "white", borderRadius: "16px", padding: "40px", width: "100%", maxWidth: "400px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  title: { fontSize: "24px", fontWeight: "700", color: "#1a1a2e", marginBottom: "8px", textAlign: "center" },
  subtitle: { fontSize: "14px", color: "#888", textAlign: "center", marginBottom: "24px" },
  error: { backgroundColor: "#fff0f0", color: "#cc0000", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" },
  input: { width: "100%", padding: "12px 14px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px", outline: "none", boxSizing: "border-box" },
  btn: { width: "100%", padding: "12px", backgroundColor: "#534AB7", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer", marginTop: "8px" },
  switchText: { textAlign: "center", fontSize: "14px", color: "#888", marginTop: "20px" },
  link: { color: "#534AB7", fontWeight: "600", cursor: "pointer" },
};

export default Login;
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleRegister() {
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields."); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    const users = JSON.parse(localStorage.getItem("quizUsers") || "[]");
    if (users.find(u => u.email === form.email)) {
      setError("Email already registered."); return;
    }
    const newUser = { id: Date.now().toString(), ...form };
    users.push(newUser);
    localStorage.setItem("quizUsers", JSON.stringify(users));
    localStorage.setItem("quizUser", JSON.stringify(newUser));
    navigate("/dashboard");
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account 🎉</h2>
        <p style={styles.subtitle}>Register to start taking quizzes</p>
        {error && <div style={styles.error}>{error}</div>}
        <input style={styles.input} type="text" name="name" placeholder="Full name" value={form.name} onChange={handleChange} />
        <input style={styles.input} type="email" name="email" placeholder="Email address" value={form.email} onChange={handleChange} />
        <input style={styles.input} type="password" name="password" placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange} />
        <button style={styles.btn} onClick={handleRegister}>Register</button>
        <p style={styles.switchText}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/login")}>Login</span>
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

export default Register;
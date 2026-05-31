import { useState } from "react";
import "./AIReportPage.css";

function buildPrompt(results) {
  if (!results || results.length === 0) return "";
  const scores = results.map((r) => r.percentage ?? 0);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const bestScore = Math.max(...scores);
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;
  const subjectMap = {};
  
  results.forEach((r) => {
    const subj = r.quizTitle || r.subject || "Unknown";
    if (!subjectMap[subj]) subjectMap[subj] = { correct: 0, wrong: 0 };
    subjectMap[subj].correct += r.correctAnswers ?? 0;
    subjectMap[subj].wrong += r.wrongAnswers ?? 0;
  });

  const weakSubjects = Object.entries(subjectMap).map(([name, d]) => {
    const total = d.correct + d.wrong;
    const pct = total > 0 ? Math.round((d.correct / total) * 100) : 0;
    return `${name} (${pct}%)`;
  }).filter((s) => parseInt(s.match(/\d+/)[0]) < 70).join(", ");

  const recentScores = results.slice(-5).map((r) => `${r.quizTitle || "Quiz"} (${r.percentage}%)`).join(", ");

  return `You are an expert educational analyst. Based on this student's quiz performance data, generate a detailed AI performance report.

Student performance summary:
- Average score: ${avgScore}%
- Best score: ${bestScore}%
- Total attempts: ${results.length} (${passed} passed, ${failed} failed)
- Weak subjects: ${weakSubjects || "none identified yet"}
- Recent quiz scores: ${recentScores}

Respond ONLY with a valid JSON object (no markdown, no backticks, no preamble). Use this exact structure:
{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "suggestions": "2-3 sentences with actionable improvement advice",
  "roadmap": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "skillLevel": "Beginner | Intermediate | Advanced",
  "skillBreakdown": { "Subject1": 80, "Subject2": 55 },
  "summary": "2-3 sentence overall assessment"
}`;
}

async function fetchGeminiReport(apiKey, prompt) {
  const res = await fetch(
    // UPDATED: Changed gemini-1.5-flash to gemini-2.5-flash
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1200 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

const SKILL_COLORS = { 
  default: "#378ADD", 
  JavaScript: "#378ADD", 
  CSS: "#639922", 
  React: "#BA7517", 
  DSA: "#E24B4A", 
  SQL: "#534AB7", 
  HTML: "#D85A30" 
};

function SkillBar({ name, pct }) {
  return (
    <div className="ai-skill-row">
      <span className="ai-skill-name">{name}</span>
      <div className="ai-skill-track">
        <div 
          className="ai-skill-fill" 
          style={{ width: `${Math.round(pct)}%`, background: SKILL_COLORS[name] || SKILL_COLORS.default }} 
        />
      </div>
      <span className="ai-skill-pct">{Math.round(pct)}%</span>
    </div>
  );
}

function ReportView({ report }) {
  return (
    <div>
      <div className="ai-summary-banner">
        <div className="ai-summary-label">Overall assessment</div>
        <div className="ai-summary-text">{report.summary}</div>
        <div className="ai-skill-level-row">
          <span className="ai-skill-level-label">Skill level:</span>
          <span className="ai-skill-level-value">{report.skillLevel}</span>
        </div>
      </div>
      <div className="ai-report-grid">
        <div className="ai-report-section">
          <div className="ai-section-header">
            <div className="ai-section-icon green">👍</div>
            <div className="ai-section-title">Strengths</div>
          </div>
          <div className="ai-section-body">
            {report.strengths?.map((s, i) => <span key={i} className="ai-chip strength">{s}</span>)}
          </div>
        </div>
        <div className="ai-report-section">
          <div className="ai-section-header">
            <div className="ai-section-icon red">⚠️</div>
            <div className="ai-section-title">Areas to improve</div>
          </div>
          <div className="ai-section-body">
            {report.weaknesses?.map((w, i) => <span key={i} className="ai-chip weakness">{w}</span>)}
          </div>
        </div>
        <div className="ai-report-section">
          <div className="ai-section-header">
            <div className="ai-section-icon amber">💡</div>
            <div className="ai-section-title">Improvement suggestions</div>
          </div>
          <div className="ai-section-body">
            <p className="ai-body-text">{report.suggestions}</p>
          </div>
        </div>
        <div className="ai-report-section">
          <div className="ai-section-header">
            <div className="ai-section-icon blue">📊</div>
            <div className="ai-section-title">Skill level estimate</div>
          </div>
          <div className="ai-section-body">
            {Object.entries(report.skillBreakdown || {}).map(([name, pct]) => (
              <SkillBar key={name} name={name} pct={pct} />
            ))}
          </div>
        </div>
        <div className="ai-report-section full">
          <div className="ai-section-header">
            <div className="ai-section-icon blue">🗺️</div>
            <div className="ai-section-title">Learning roadmap</div>
          </div>
          <div className="ai-section-body">
            {report.roadmap?.map((step, i) => (
              <div key={i} className="ai-roadmap-step">
                <div className="ai-step-num">{i + 1}</div>
                <div className="ai-step-text">{step}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIReportPage({ results }) {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_KEY || "");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!apiKey.trim()) { 
      setError("Please enter your Gemini API key."); 
      return; 
    }
    if (!results || results.length === 0) { 
      setError("No quiz results found. Complete at least one quiz first."); 
      return; 
    }
    
    setLoading(true); 
    setError(""); 
    setReport(null);
    
    try {
      const generatedReport = await fetchGeminiReport(apiKey.trim(), buildPrompt(results));
      setReport(generatedReport);
    } catch (e) {
      setError(e.message || "Something went wrong. Check your API key and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-page">
      <div className="ai-page-header">
        <div>
          <h1 className="ai-heading">AI performance report</h1>
          <p className="ai-subheading">Powered by Gemini 1.5 Flash</p>
        </div>
        <span className="ai-model-badge">Gemini Flash</span>
      </div>
      
      <div className="ai-key-card">
        <div className="ai-key-label">Enter your Gemini API key to generate a personalised report</div>
        <div className="ai-key-row">
          <input 
            type="password" 
            className="ai-key-input" 
            placeholder="AIza..." 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()} 
            autoComplete="off" 
          />
          <button className="ai-gen-btn" onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating…" : report ? "Regenerate ↗" : "Generate report ↗"}
          </button>
        </div>
        <div className="ai-key-hint">
          Free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">aistudio.google.com</a> · key is never stored permanently
        </div>
        <div className="ai-key-hint" style={{ marginTop: 4 }}>
          Tip: set <code>VITE_GEMINI_KEY=your_key_here</code> in your <code>.env</code> file or hosting dashboard to pre-fill.
        </div>
      </div>
      
      {error && <div className="ai-error">{error}</div>}
      
      {loading && (
        <div className="ai-loading">
          <div className="ai-spinner" />
          <p>Analysing your performance with Gemini AI…</p>
        </div>
      )}
      
      {report && !loading && <ReportView report={report} />}
      
      {!report && !loading && !error && (
        <div className="ai-empty">
          <div className="ai-empty-icon">🤖</div>
          <p>Enter your API key above and click generate to get your AI-powered analysis</p>
        </div>
      )}
    </div>
  );
}




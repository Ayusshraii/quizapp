import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import "./PerformancePage.css";

Chart.register(...registerables);

function aggregatePerformance(results) {
  if (!results || results.length === 0) return null;
  const scores = results.map((r) => r.percentage ?? 0);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const bestScore = Math.max(...scores);
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;
  const half = Math.floor(scores.length / 2);
  const firstHalfAvg = half > 0 ? scores.slice(0, half).reduce((a, b) => a + b, 0) / half : 0;
  const lastHalfAvg = half > 0 ? scores.slice(half).reduce((a, b) => a + b, 0) / (scores.length - half) : 0;
  const improvement = Math.round(lastHalfAvg - firstHalfAvg);
  const subjectMap = {};
  results.forEach((r) => {
    const subj = r.quizTitle || r.subject || "Unknown";
    if (!subjectMap[subj]) subjectMap[subj] = { correct: 0, wrong: 0 };
    subjectMap[subj].correct += r.correctAnswers ?? 0;
    subjectMap[subj].wrong += r.wrongAnswers ?? 0;
  });
  const subjects = Object.entries(subjectMap).slice(0, 5);
  const weakSubjects = subjects.map(([name, d]) => {
    const total = d.correct + d.wrong;
    const pct = total > 0 ? Math.round((d.correct / total) * 100) : 0;
    return { name, pct };
  }).filter((s) => s.pct < 70).sort((a, b) => a.pct - b.pct).slice(0, 4);
  return {
    avgScore, bestScore, totalAttempts: results.length, passed, failed, improvement, scores,
    subjectLabels: subjects.map(([n]) => n),
    subjectCorrect: subjects.map(([, d]) => d.correct),
    subjectWrong: subjects.map(([, d]) => d.wrong),
    weakSubjects,
    history: [...results].reverse(),
  };
}

function MetricCard({ label, value, sub, colorClass }) {
  return (
    <div className="pf-metric-card">
      <div className="pf-metric-label">{label}</div>
      <div className={`pf-metric-value ${colorClass || ""}`}>{value}</div>
      {sub && <div className="pf-metric-sub">{sub}</div>}
    </div>
  );
}

function TrendChart({ scores }) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels: scores.map((_, i) => `A${i + 1}`),
        datasets: [
          { label: "Score %", data: scores, borderColor: "#378ADD", backgroundColor: "rgba(55,138,221,0.08)", borderWidth: 2, pointBackgroundColor: "#378ADD", pointRadius: 4, fill: true, tension: 0.35 },
          { label: "Pass threshold", data: scores.map(() => 60), borderColor: "#E24B4A", borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0, fill: false },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 105, ticks: { font: { size: 11 }, callback: (v) => v + "%" }, grid: { color: "rgba(128,128,128,.1)" } },
          x: { ticks: { font: { size: 11 } }, grid: { display: false } },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [scores]);
  return (
    <div className="pf-chart-card">
      <div className="pf-chart-title">Score trend</div>
      <div className="pf-legend">
        <span className="pf-legend-item"><span className="pf-legend-dot" style={{ background: "#378ADD" }} />Score %</span>
        <span className="pf-legend-item"><span className="pf-legend-dot" style={{ background: "#E24B4A", borderRadius: "50%" }} />Pass threshold (60%)</span>
      </div>
      <div style={{ position: "relative", height: 200 }}><canvas ref={ref} /></div>
    </div>
  );
}

function SubjectChart({ labels, correct, wrong }) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(ref.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Correct", data: correct, backgroundColor: "#378ADD", borderRadius: 3 },
          { label: "Wrong", data: wrong, backgroundColor: "#F09595", borderRadius: 3 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { font: { size: 11 } }, grid: { color: "rgba(128,128,128,.1)" } },
          y: { ticks: { font: { size: 11 } }, grid: { display: false } },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [labels, correct, wrong]);
  return (
    <div className="pf-chart-card">
      <div className="pf-chart-title">Score by subject</div>
      <div className="pf-legend">
        <span className="pf-legend-item"><span className="pf-legend-dot" style={{ background: "#378ADD" }} />Correct</span>
        <span className="pf-legend-item"><span className="pf-legend-dot" style={{ background: "#F09595" }} />Wrong</span>
      </div>
      <div style={{ position: "relative", height: 200 }}><canvas ref={ref} /></div>
    </div>
  );
}

function PieChart({ passed, failed }) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(ref.current, {
      type: "doughnut",
      data: {
        labels: ["Passed", "Failed"],
        datasets: [{ data: [passed, failed], backgroundColor: ["#639922", "#E24B4A"], borderWidth: 0, hoverOffset: 4 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: "62%",
        plugins: { legend: { display: false } },
      },
    });
    return () => chartRef.current?.destroy();
  }, [passed, failed]);
  return (
    <div className="pf-chart-card">
      <div className="pf-chart-title">Pass / fail ratio</div>
      <div className="pf-legend">
        <span className="pf-legend-item"><span className="pf-legend-dot" style={{ background: "#639922" }} />Passed ({passed})</span>
        <span className="pf-legend-item"><span className="pf-legend-dot" style={{ background: "#E24B4A" }} />Failed ({failed})</span>
      </div>
      <div style={{ position: "relative", height: 180 }}><canvas ref={ref} /></div>
    </div>
  );
}

function WeakSubjects({ items }) {
  return (
    <div className="pf-chart-card">
      <div className="pf-chart-title">Weak subjects</div>
      <div className="pf-weak-list">
        {items.map((item) => (
          <div key={item.name} className="pf-weak-item">
            <div>
              <div className="pf-weak-name">{item.name}</div>
              <div className="pf-weak-score">{item.pct}% avg</div>
              <div className="pf-progress-bar"><div className="pf-progress-fill" style={{ width: item.pct + "%" }} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryTable({ history }) {
  return (
    <div className="pf-full-card">
      <div className="pf-chart-title" style={{ marginBottom: "0.75rem" }}>Attempt history</div>
      <table className="pf-table">
        <thead><tr><th>#</th><th>Quiz</th><th>Date</th><th>Score</th><th>Time</th><th>Status</th></tr></thead>
        <tbody>
          {history.map((r, i) => (
            <tr key={i}>
              <td>{history.length - i}</td>
              <td>{r.quizTitle || "—"}</td>
              <td>{r.date ? new Date(r.date).toLocaleDateString() : "—"}</td>
              <td>{r.percentage ?? "—"}%</td>
              <td>{r.timeTaken ? `${Math.floor(r.timeTaken / 60)}m ${r.timeTaken % 60}s` : "—"}</td>
              <td><span className={`pf-badge ${r.passed ? "pass" : "fail"}`}>{r.passed ? "Pass" : "Fail"}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PerformancePage({ results }) {
  const data = aggregatePerformance(results);
  if (!data) return <div className="pf-empty"><p>No quiz attempts found. Complete a quiz to see your performance.</p></div>;
  return (
    <div className="pf-page">
      <h1 className="pf-heading">Performance tracking</h1>
      <div className="pf-metrics-grid">
        <MetricCard label="Average score" value={`${data.avgScore}%`} sub={`across ${data.totalAttempts} attempts`} />
        <MetricCard label="Best score" value={`${data.bestScore}%`} colorClass="green" />
        <MetricCard label="Quizzes taken" value={data.totalAttempts} sub={`${data.passed} passed · ${data.failed} failed`} />
        <MetricCard label="Improvement" value={`${data.improvement >= 0 ? "+" : ""}${data.improvement}%`} sub="last half vs first half" colorClass={data.improvement >= 0 ? "amber" : "red"} />
      </div>
      <div className="pf-charts-grid">
        <TrendChart scores={data.scores} />
        <SubjectChart labels={data.subjectLabels} correct={data.subjectCorrect} wrong={data.subjectWrong} />
      </div>
      <div className="pf-charts-grid">
        <PieChart passed={data.passed} failed={data.failed} />
        {data.weakSubjects.length > 0 && <WeakSubjects items={data.weakSubjects} />}
      </div>
      <HistoryTable history={data.history} />
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { getEntries, getStats, checkToday } from "../api/client";
import StatCard from "../components/StatCard";
import StreakCalendar from "../components/StreakCalendar";
import ShareCard from "../components/ShareCard";

function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyGoal, setDailyGoal] = useState(() => {
    return parseInt(localStorage.getItem("dailyGoal")) || 5;
  });
  const hasCelebrated = useRef(false);

  const [placementDate, setPlacementDate] = useState(() => {
    return localStorage.getItem("placementDate") || "";
  });
  const [targetProblems, setTargetProblems] = useState(() => {
    return parseInt(localStorage.getItem("targetProblems")) || 300;
  });
  const [editingTarget, setEditingTarget] = useState(false);
  const [dateDraft, setDateDraft] = useState(placementDate);
  const [targetDraft, setTargetDraft] = useState(targetProblems);

  const [mustDoTopics, setMustDoTopics] = useState(() => {
    const saved = localStorage.getItem("mustDoTopics");
    return saved ? JSON.parse(saved) : [];
  });
  const [newMustDo, setNewMustDo] = useState("");
  const [editingMustDo, setEditingMustDo] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [entriesData, statsData, todayData] = await Promise.all([
          getEntries(),
          getStats(),
          checkToday(),
        ]);
        setEntries(entriesData);
        setStats(statsData);
        setTodayStatus(todayData);
      } catch (err) {
        setError("Could not connect to backend. Is the server running?");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function updateGoal(newGoal) {
    setDailyGoal(newGoal);
    localStorage.setItem("dailyGoal", newGoal);
  }

  function saveTarget() {
    setPlacementDate(dateDraft);
    setTargetProblems(Number(targetDraft));
    localStorage.setItem("placementDate", dateDraft);
    localStorage.setItem("targetProblems", targetDraft);
    setEditingTarget(false);
  }

  function addMustDoTopic() {
    const trimmed = newMustDo.trim();
    if (!trimmed || mustDoTopics.includes(trimmed)) return;
    const updated = [...mustDoTopics, trimmed];
    setMustDoTopics(updated);
    localStorage.setItem("mustDoTopics", JSON.stringify(updated));
    setNewMustDo("");
  }

  function removeMustDoTopic(topic) {
    const updated = mustDoTopics.filter((t) => t !== topic);
    setMustDoTopics(updated);
    localStorage.setItem("mustDoTopics", JSON.stringify(updated));
  }

  if (loading) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p style={{ color: "var(--accent)" }}>{error}</p>
      </div>
    );
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayProblems = entries
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + e.problems_solved, 0);
  const goalProgress = Math.min((todayProblems / dailyGoal) * 100, 100);
  const goalReached = todayProblems >= dailyGoal;

  if (goalReached && !hasCelebrated.current) {
    hasCelebrated.current = true;
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#ff6b4a", "#ffb199", "#ffffff"],
    });
  }

  let daysLeft = null;
  let requiredPace = null;
  let currentPace = null;
  let onTrack = null;

  if (placementDate) {
    const today = new Date();
    const target = new Date(placementDate);
    const diffMs = target - today;
    daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const problemsRemaining = Math.max(targetProblems - stats.total_problems, 0);
    requiredPace = daysLeft > 0 ? (problemsRemaining / daysLeft).toFixed(1) : 0;
    currentPace = stats.weekly_problems ? (stats.weekly_problems / 7).toFixed(1) : 0;
    onTrack = parseFloat(currentPace) >= parseFloat(requiredPace);
  }

  // Case-insensitive, whitespace-trimmed comparison so "DSA" / "dsa" / " DSA " all match
  const todayTopics = new Set(
    entries
      .filter((e) => e.date === todayStr)
      .map((e) => e.topic.trim().toLowerCase())
  );
  const missedMustDo = mustDoTopics.filter(
    (t) => !todayTopics.has(t.trim().toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <h1>Dashboard</h1>
        <ShareCard stats={stats} />
      </div>
      <p style={{ marginBottom: 32 }}>
        {todayStatus?.logged_today
          ? "You've logged today. Nice work! 🔥"
          : "You haven't logged today yet — keep the streak alive!"}
      </p>

      <div className="stats-grid">
        <StatCard icon="🔥" label="Current Streak" value={stats.current_streak} suffix=" days" accent />
        <StatCard icon="🏆" label="Longest Streak" value={stats.longest_streak} suffix=" days" />
        <StatCard icon="✅" label="Total Problems" value={stats.total_problems} />
        <StatCard icon="📅" label="This Week" value={stats.weekly_problems} />
      </div>

      <div className="card goal-card" style={{ marginBottom: 32 }}>
        <div className="goal-header">
          <h2>Today's Goal</h2>
          <div className="goal-controls">
            <button className="goal-btn" onClick={() => updateGoal(Math.max(1, dailyGoal - 1))}>−</button>
            <span className="goal-number">{dailyGoal}/day</span>
            <button className="goal-btn" onClick={() => updateGoal(dailyGoal + 1)}>+</button>
          </div>
        </div>
        <div className="goal-bar-track">
          <div
            className={`goal-bar-fill ${goalReached ? "goal-reached" : ""}`}
            style={{ width: `${goalProgress}%` }}
          />
        </div>
        <p className="goal-status">
          {goalReached
            ? `🎉 Goal reached! ${todayProblems}/${dailyGoal} problems today.`
            : `${todayProblems}/${dailyGoal} problems today — ${dailyGoal - todayProblems} more to go.`}
        </p>
      </div>

      <div className="card mustdo-card" style={{ marginBottom: 32 }}>
        <div className="countdown-header">
          <h2>✅ Daily Must-Do Topics</h2>
          <button className="theory-edit-btn" onClick={() => setEditingMustDo(!editingMustDo)}>
            {editingMustDo ? "Done" : "Manage"}
          </button>
        </div>

        {editingMustDo && (
          <div className="mustdo-manage">
            <div className="mustdo-add-row">
              <input
                type="text"
                placeholder="e.g. Python"
                value={newMustDo}
                onChange={(e) => setNewMustDo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addMustDoTopic()}
              />
              <button className="btn-primary" onClick={addMustDoTopic}>Add</button>
            </div>
            {mustDoTopics.length > 0 && (
              <div className="mustdo-chip-list">
                {mustDoTopics.map((t) => (
                  <span key={t} className="mustdo-chip">
                    {t}
                    <button onClick={() => removeMustDoTopic(t)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {mustDoTopics.length === 0 ? (
          <p className="theory-empty">No daily must-do topics set. Click "Manage" to add one (e.g. Python).</p>
        ) : missedMustDo.length === 0 ? (
          <p className="countdown-status on-track">✅ All daily must-do topics covered today!</p>
        ) : (
          <div>
            <p className="countdown-status behind">
              ⚠️ {missedMustDo.length} topic{missedMustDo.length > 1 ? "s" : ""} not practiced today:
            </p>
            <div className="mustdo-chip-list">
              {missedMustDo.map((t) => (
                <span key={t} className="mustdo-chip missed">{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card countdown-card" style={{ marginBottom: 32 }}>
        <div className="countdown-header">
          <h2>📅 Placement Countdown</h2>
          {!editingTarget && (
            <button className="theory-edit-btn" onClick={() => setEditingTarget(true)}>
              {placementDate ? "Edit" : "+ Set Target"}
            </button>
          )}
        </div>

        {editingTarget ? (
          <div className="countdown-editor">
            <div className="form-group">
              <label>Placement Date</label>
              <input
                type="date"
                value={dateDraft}
                onChange={(e) => setDateDraft(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Target Problems to Solve</label>
              <input
                type="number"
                min="1"
                value={targetDraft}
                onChange={(e) => setTargetDraft(e.target.value)}
              />
            </div>
            <div className="theory-editor-actions">
              <button className="btn-secondary" onClick={() => setEditingTarget(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveTarget}>Save Target</button>
            </div>
          </div>
        ) : placementDate && daysLeft !== null ? (
          <div>
            <p className="countdown-days">
              {daysLeft > 0 ? `⏳ ${daysLeft} days left until placements` : "🎯 Placement date has arrived!"}
            </p>
            {daysLeft > 0 && (
              <>
                <p className={`countdown-status ${onTrack ? "on-track" : "behind"}`}>
                  {onTrack
                    ? `✅ On track! You're averaging ${currentPace}/day, need ${requiredPace}/day.`
                    : `⚠️ Behind pace. You're averaging ${currentPace}/day, but need ${requiredPace}/day to hit ${targetProblems} problems.`}
                </p>
                <p className="countdown-detail">
                  {stats.total_problems}/{targetProblems} problems solved so far.
                </p>
              </>
            )}
          </div>
        ) : (
          <p className="theory-empty">Set a placement date and target to see your pace prediction.</p>
        )}
      </div>

      <StreakCalendar entries={entries} />
    </div>
  );
}

export default Dashboard;
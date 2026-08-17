import { useState, useEffect } from "react";
import { getEntries, getStats } from "../api/client";
import "./Stats.css";

const CATEGORY_COLORS = {
  DSA: "#ff6b4a",
  "Topic Study": "#a78bfa",
  "Mock Test": "#3fb950",
};

function Stats() {
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [entriesData, statsData] = await Promise.all([getEntries(), getStats()]);
        setEntries(entriesData);
        setStats(statsData);
      } catch (err) {
        setError("Could not connect to backend. Is the server running?");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div>
        <h1>Stats</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Stats</h1>
        <p style={{ color: "var(--accent)" }}>{error}</p>
      </div>
    );
  }

  // ---- Category breakdown ----
  const categoryTotals = {};
  entries.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.problems_solved;
  });
  const totalProblems = Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1;
  const categoryList = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  // ---- Last 7 days trend ----
  const today = new Date();
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayTotal = entries
      .filter((e) => e.date === dateStr)
      .reduce((sum, e) => sum + e.problems_solved, 0);
    last7.push({
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: dateStr,
      count: dayTotal,
    });
  }
  const maxDayCount = Math.max(...last7.map((d) => d.count), 1);

  // ---- Top topics ----
  const topicTotals = {};
  entries.forEach((e) => {
    if (!topicTotals[e.topic]) topicTotals[e.topic] = { count: 0, problems: 0 };
    topicTotals[e.topic].count += 1;
    topicTotals[e.topic].problems += e.problems_solved;
  });
  const topTopics = Object.entries(topicTotals)
    .sort((a, b) => b[1].problems - a[1].problems)
    .slice(0, 5);

  // ---- Active days / averages ----
  const uniqueDays = new Set(entries.map((e) => e.date));
  const avgPerActiveDay = uniqueDays.size ? (totalProblems / uniqueDays.size).toFixed(1) : 0;

  return (
    <div>
      <h1>Stats</h1>
      <p style={{ marginBottom: 24 }}>
           Your prep journey — a bird's eye view.
      </p>

      <div className="stats-grid">
        <div className="card stat-card">
          <span className="stat-icon">🎯</span>
          <div>
            <div className="stat-value">{stats.total_problems}</div>
            <div className="stat-label">Total Problems</div>
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">📆</span>
          <div>
            <div className="stat-value">{uniqueDays.size}</div>
            <div className="stat-label">Active Days</div>
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">⚡</span>
          <div>
            <div className="stat-value">{avgPerActiveDay}</div>
            <div className="stat-label">Avg / Active Day</div>
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">🏆</span>
          <div>
            <div className="stat-value">{stats.longest_streak}</div>
            <div className="stat-label">Longest Streak</div>
          </div>
        </div>
      </div>

      <div className="stats-row">
        {/* Weekly trend chart */}
        <div className="card trend-card">
          <h2>Last 7 Days</h2>
          <div className="trend-chart">
            {last7.map((d) => (
              <div className="trend-bar-col" key={d.date}>
                <div className="trend-bar-track">
                  <div
                    className="trend-bar-fill"
                    style={{ height: `${(d.count / maxDayCount) * 100}%` }}
                    title={`${d.count} problems`}
                  />
                </div>
                <span className="trend-bar-label">{d.label}</span>
                <span className="trend-bar-count">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="card breakdown-card">
          <h2>Category Breakdown</h2>
          {categoryList.length === 0 ? (
            <p>Innum data illa.</p>
          ) : (
            <div className="breakdown-list">
              {categoryList.map(([cat, count]) => {
                const pct = Math.round((count / totalProblems) * 100);
                return (
                  <div className="breakdown-row" key={cat}>
                    <div className="breakdown-row-top">
                      <span
                        className="breakdown-dot"
                        style={{ background: CATEGORY_COLORS[cat] || "#888" }}
                      />
                      <span className="breakdown-name">{cat}</span>
                      <span className="breakdown-pct">{pct}%</span>
                    </div>
                    <div className="breakdown-track">
                      <div
                        className="breakdown-fill"
                        style={{
                          width: `${pct}%`,
                          background: CATEGORY_COLORS[cat] || "#888",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top topics */}
      <div className="card">
        <h2>Top Topics</h2>
        {topTopics.length === 0 ? (
          <p>Innum data illa.</p>
        ) : (
          <div className="topics-list">
            {topTopics.map(([topic, data], i) => (
              <div className="topic-row" key={topic}>
                <span className="topic-rank">#{i + 1}</span>
                <span className="topic-name">{topic}</span>
                <span className="topic-meta">{data.count}x logged</span>
                <span className="topic-problems">{data.problems} problems</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Stats;
import { useState, useEffect } from "react";
import { getEntries, deleteEntry } from "../api/client";
import "./History.css";

function History() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [deletingId, setDeletingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [theoryNotes, setTheoryNotes] = useState(() => {
    const saved = localStorage.getItem("theoryNotes");
    return saved ? JSON.parse(saved) : {};
  });
  const [editingTheory, setEditingTheory] = useState(null);
  const [expandedTheory, setExpandedTheory] = useState(null);
  const [theoryDraft, setTheoryDraft] = useState("");

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      const data = await getEntries();
      const sorted = [...data].sort((a, b) => (a.date < b.date ? 1 : -1));
      setEntries(sorted);
    } catch (err) {
      setError("Could not connect to backend. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteEntry(id);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (err) {
      setError("Failed to delete entry. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function startEditingTheory(topicName) {
    setEditingTheory(topicName);
    setTheoryDraft(theoryNotes[topicName] || "");
  }

  function saveTheory(topicName) {
    const updated = { ...theoryNotes, [topicName]: theoryDraft };
    setTheoryNotes(updated);
    localStorage.setItem("theoryNotes", JSON.stringify(updated));
    setEditingTheory(null);
  }

  if (loading) {
    return (
      <div>
        <h1>History</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>History</h1>
        <p style={{ color: "var(--accent)" }}>{error}</p>
      </div>
    );
  }

    // Combine our default categories with any custom categories the user has actually used
   const defaultCategories = ["DSA", "Aptitude", "Mock Test"];
   const usedCategories = [...new Set(entries.map((e) => e.category))];
   const extraCategories = usedCategories.filter((c) => !defaultCategories.includes(c));
   const categories = ["All", ...defaultCategories, ...extraCategories];
  const filteredEntries = filter === "All" ? entries : entries.filter((e) => e.category === filter);

  const groupedByTopic = {};
  filteredEntries.forEach((entry) => {
    if (!groupedByTopic[entry.topic]) {
      groupedByTopic[entry.topic] = {
        category: entry.category,
        entries: [],
        totalProblems: 0,
      };
    }
    groupedByTopic[entry.topic].entries.push(entry);
    groupedByTopic[entry.topic].totalProblems += entry.problems_solved;
  });

  const topicGroups = Object.entries(groupedByTopic);

  return (
    <div>
      <h1>History</h1>
      <p style={{ marginBottom: 24 }}>
        <p style={{ marginBottom: 24 }}>
           All your logged entries — {entries.length} total.
        </p>
      </p>

      <div className="filter-row">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-chip ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {topicGroups.length === 0 ? (
        <div className="card">
           <p>No entries in this category yet.</p>
        </div>
      ) : (
        <div className="topic-group-list">
          {topicGroups.map(([topicName, group]) => (
            <div className="card topic-group" key={topicName}>
              <div className="topic-group-header">
                <div>
                  <span className={`category-badge cat-${group.category.replace(/\s+/g, "-").toLowerCase()}`}>
                    {group.category}
                  </span>
                  <h3 className="topic-group-title">📁 {topicName}</h3>
                </div>
                <div className="topic-group-summary">
                  {group.entries.length} session{group.entries.length > 1 ? "s" : ""} · {group.totalProblems} problems
                </div>
              </div>

              <div className="topic-group-entries">
                {group.entries.map((entry) => {
                  const isExpanded = expandedId === entry.id;
                  const hasDetails = entry.notes || entry.problem_name;
                  return (
                    <div
                      className={`problem-row ${isExpanded ? "expanded" : ""}`}
                      key={entry.id}
                      onClick={() => hasDetails && toggleExpand(entry.id)}
                      style={{ cursor: hasDetails ? "pointer" : "default" }}
                    >
                      <div className="problem-row-top">
                        <div className="problem-row-main">
                          <div className="problem-name">
                            {entry.problem_name || "Problems Solved"}
                          </div>
                          <span className="problem-date">{entry.date}</span>
                        </div>
                        <div className="problem-row-side">
                          <span className="problem-count">{entry.problems_solved}</span>
                          {hasDetails && (
                            <span className={`expand-arrow ${isExpanded ? "open" : ""}`}>▾</span>
                          )}
                          <button
                            className="delete-btn"
                            onClick={(e) => handleDelete(entry.id, e)}
                            disabled={deletingId === entry.id}
                            title="Delete entry"
                          >
                            {deletingId === entry.id ? "..." : "🗑"}
                          </button>
                        </div>
                      </div>

                      {isExpanded && entry.notes && (
                        <div className="problem-notes-expanded">
                          <pre>{entry.notes}</pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ===== Theory Notes Section ===== */}
              <div
                className="theory-header"
                onClick={() => theoryNotes[topicName] && editingTheory !== topicName &&
                  setExpandedTheory((prev) => (prev === topicName ? null : topicName))}
                style={{ cursor: theoryNotes[topicName] ? "pointer" : "default" }}
              >
                <h4>
                  📖 Theory Notes
                  {theoryNotes[topicName] && (
                    <span className={`expand-arrow ${expandedTheory === topicName ? "open" : ""}`} style={{ marginLeft: 8 }}>▾</span>
                  )}
                </h4>
                {editingTheory !== topicName && (
                  <button
                    className="theory-edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingTheory(topicName);
                    }}
                  >
                    {theoryNotes[topicName] ? "Edit" : "+ Add"}
                  </button>
                )}
              </div>

              {editingTheory === topicName ? (
                <div className="theory-editor">
                  <textarea
                    value={theoryDraft}
                    onChange={(e) => setTheoryDraft(e.target.value)}
                    placeholder={`Paste important ${topicName} concepts, interview points, or a summary here...`}
                    rows={8}
                  />
                  <div className="theory-editor-actions">
                    <button className="btn-secondary" onClick={() => setEditingTheory(null)}>
                      Cancel
                    </button>
                    <button className="btn-primary" onClick={() => saveTheory(topicName)}>
                      Save Theory
                    </button>
                  </div>
                </div>
              ) : expandedTheory === topicName && theoryNotes[topicName] ? (
                <pre className="theory-content">{theoryNotes[topicName]}</pre>
              ) : !theoryNotes[topicName] ? (
                <p className="theory-empty">No theory notes yet for {topicName}.</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;
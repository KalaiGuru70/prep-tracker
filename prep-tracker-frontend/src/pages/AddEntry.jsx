import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createEntry } from "../api/client";
import "./AddEntry.css";

const BASE_CATEGORIES = ["DSA", "Aptitude", "Mock Test"];

function AddEntry() {
  const navigate = useNavigate();

  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem("customCategories");
    return saved ? JSON.parse(saved) : [];
  });

  const [category, setCategory] = useState("DSA");
  const [customCategory, setCustomCategory] = useState("");
  const [topic, setTopic] = useState("");
  const [problemsSolved, setProblemsSolved] = useState(0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const allCategories = [...BASE_CATEGORIES, ...customCategories];

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const finalCategory = category === "Other" ? customCategory.trim() : category;

    // Remember this new category for next time, if it's genuinely new
    if (category === "Other" && finalCategory && !allCategories.includes(finalCategory)) {
      const updated = [...customCategories, finalCategory];
      setCustomCategories(updated);
      localStorage.setItem("customCategories", JSON.stringify(updated));
    }

    try {
      await createEntry({
        date: new Date().toISOString().slice(0, 10),
        category: finalCategory,
        topic,
        problems_solved: Number(problemsSolved),
        notes,
      });
      navigate("/");
    } catch (err) {
      setError("Failed to save entry. Make sure the backend server is running.");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1>Add Entry</h1>
      <p style={{ marginBottom: 24, color: "var(--text-secondary)" }}>
        Log what you studied today.
      </p>

      <form onSubmit={handleSubmit} className="entry-form">
        <div className="form-group">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="Other">Other (type your own)</option>
          </select>
        </div>

        {category === "Other" && (
          <div className="form-group">
            <label>New Category Name</label>
            <input
              type="text"
              placeholder="e.g. Python, System Design..."
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Topic</label>
          <input
            type="text"
            placeholder="e.g. Binary Trees, Data Types..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Problems Solved</label>
          <input
            type="number"
            min="0"
            value={problemsSolved}
            onChange={(e) => setProblemsSolved(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Notes (optional)</label>
          <textarea
            placeholder="List the problems you solved, your approach, code, or anything you want to remember..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
          />
        </div>

        {error && <p style={{ color: "#f85149", marginBottom: 12 }}>{error}</p>}

        <button type="submit" disabled={submitting} className="submit-btn">
          {submitting ? "Saving..." : "Save Entry"}
        </button>
      </form>
    </div>
  );
}

export default AddEntry;
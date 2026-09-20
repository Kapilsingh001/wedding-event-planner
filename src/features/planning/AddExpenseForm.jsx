import { useState } from "react";

const API_URL = "http://localhost:3001";
const EXPENSE_CATEGORIES = ["Catering", "Decoration", "Photography", "Music", "Venue", "Gifts", "Transport", "Others"];

export default function AddExpenseForm({ eventId, onClose, onAdded }) {
  const [formData, setFormData] = useState({ category: "Catering", amount: "", date: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.amount || !formData.date) {
      setError("Please fill in all fields.");
      return;
    }
    if (Number(formData.amount) <= 0) {
      setError("Amount must be a positive number.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, category: formData.category, amount: Number(formData.amount), date: formData.date }),
      });
      if (!response.ok) throw new Error("Failed to add expense");
      onAdded(await response.json());
    } catch (err) {
      setError("Could not add expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "21px", fontWeight: "700", color: "#1f1015" }}>
            Add Expense
          </h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {error && <div style={styles.alertError}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={styles.label}>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} style={styles.input}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={styles.label}>Amount (₹)</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="e.g. 25000" min="0" style={styles.input} />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={styles.label}>Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} style={styles.input} />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
            <button type="button" onClick={onClose} style={styles.btnSecondary}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ ...styles.btnPrimary, opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Adding..." : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(31,16,21,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "18px",
    padding: "26px",
    width: "100%",
    maxWidth: "400px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#9f6b7a",
  },
  alertError: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "10px 14px",
    borderRadius: "10px",
    marginBottom: "14px",
    fontSize: "14px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#5b3a44",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #fde3ea",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  btnSecondary: {
    flex: 1,
    padding: "11px",
    borderRadius: "999px",
    border: "1px solid #fde3ea",
    backgroundColor: "#fff",
    color: "#5b3a44",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnPrimary: {
    flex: 1,
    padding: "11px",
    borderRadius: "999px",
    border: "none",
    backgroundColor: "#f43f5e",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },
};
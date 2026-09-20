import { useState } from "react";

const API_URL = "http://localhost:3001";
const EVENT_TYPES = ["Wedding", "Engagement", "Reception", "Birthday", "Anniversary"];

export default function CreateEventForm({ onClose, onCreated }) {
  const [formData, setFormData] = useState({ title: "", type: "Wedding", date: "", venue: "", budget: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim() || !formData.date || !formData.venue.trim() || !formData.budget) {
      setError("Please fill in all fields.");
      return;
    }
    if (Number(formData.budget) <= 0) {
      setError("Budget must be a positive number.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          type: formData.type,
          date: formData.date,
          venue: formData.venue.trim(),
          budget: Number(formData.budget),
        }),
      });
      if (!response.ok) throw new Error("Failed to create event");
      onCreated(await response.json());
    } catch (err) {
      setError("Could not create event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "21px", fontWeight: "700", color: "#1f1015" }}>
            Create Event
          </h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {error && <div style={styles.alertError}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <Field label="Event Title">
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. My Wedding" style={styles.input} />
          </Field>

          <Field label="Event Type">
            <select name="type" value={formData.type} onChange={handleChange} style={styles.input}>
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </Field>

          <Field label="Date">
            <input type="date" name="date" value={formData.date} onChange={handleChange} style={styles.input} />
          </Field>

          <Field label="Venue">
            <input type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder="e.g. Grand Palace" style={styles.input} />
          </Field>

          <Field label="Budget (₹)">
            <input type="number" name="budget" value={formData.budget} onChange={handleChange} placeholder="e.g. 500000" min="0" style={styles.input} />
          </Field>

          <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
            <button type="button" onClick={onClose} style={styles.btnSecondary}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ ...styles.btnPrimary, opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "15px" }}>
      <label style={styles.label}>{label}</label>
      {children}
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
    maxWidth: "420px",
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
    outlineColor: "#f43f5e",
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
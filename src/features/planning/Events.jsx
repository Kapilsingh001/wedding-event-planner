import { useEffect, useState } from "react";
import CreateEventForm from "./CreateEventForm";
import EventDetail from "./EventDetail";

const API_URL = "http://localhost:3001";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [eventsRes, expensesRes] = await Promise.all([
        fetch(`${API_URL}/events`),
        fetch(`${API_URL}/expenses`),
      ]);
      if (!eventsRes.ok || !expensesRes.ok) {
        throw new Error("Failed to fetch data from server");
      }
      setEvents(await eventsRes.json());
      setExpenses(await expensesRes.json());
    } catch (err) {
      setError("Could not load events. Make sure JSON Server is running on port 3001.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTotalSpent = (eventId) =>
    expenses.filter((exp) => exp.eventId === eventId).reduce((sum, exp) => sum + Number(exp.amount), 0);

  const handleEventCreated = (newEvent) => {
    setEvents((prev) => [...prev, newEvent]);
    setShowCreateForm(false);
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  if (selectedEventId) {
    return (
      <EventDetail
        eventId={selectedEventId}
        onBack={() => {
          setSelectedEventId(null);
          fetchData();
        }}
      />
    );
  }

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto", backgroundColor: "#fff5f7", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "32px", fontWeight: "700", color: "#1f1015" }}>
          Your Events
        </h1>
        <button onClick={() => setShowCreateForm(true)} style={styles.btnPrimary}>
          + Create Event
        </button>
      </div>

      {loading && <p style={{ color: "#9f6b7a", fontSize: "16px" }}>Loading...</p>}

      {error && <div style={styles.alertError}>{error}</div>}

      {!loading && !error && events.length === 0 && (
        <p style={{ color: "#9f6b7a" }}>No events yet. Click "Create Event" to add one.</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
        {events.map((event) => {
          const totalSpent = getTotalSpent(event.id);
          const remaining = Number(event.budget) - totalSpent;

          return (
            <div key={event.id} onClick={() => setSelectedEventId(event.id)} style={styles.card}>
              <span style={styles.badge}>{event.type}</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "19px", fontWeight: "700", color: "#1f1015", margin: "6px 0 4px" }}>
                {event.title}
              </h2>
              <p style={{ color: "#9f6b7a", fontSize: "14px", margin: "2px 0" }}>{formatDate(event.date)}</p>
              <p style={{ color: "#9f6b7a", fontSize: "14px", margin: "2px 0 14px" }}>{event.venue}</p>

              <div style={{ borderTop: "1px solid #fde3ea", paddingTop: "12px", fontSize: "13px" }}>
                <div style={styles.statRow}>
                  <span>Budget</span>
                  <span style={styles.statValue}>{formatCurrency(event.budget)}</span>
                </div>
                <div style={styles.statRow}>
                  <span>Spent</span>
                  <span style={styles.statValue}>{formatCurrency(totalSpent)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9f6b7a" }}>Remaining</span>
                  <span style={{ fontWeight: "700", color: remaining < 0 ? "#dc2626" : "#059669" }}>
                    {formatCurrency(remaining)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showCreateForm && (
        <CreateEventForm onClose={() => setShowCreateForm(false)} onCreated={handleEventCreated} />
      )}
    </div>
  );
}

const styles = {
  btnPrimary: {
    backgroundColor: "#f43f5e",
    color: "#fff",
    border: "none",
    borderRadius: "999px",
    padding: "11px 22px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(244,63,94,0.25)",
  },
  alertError: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  card: {
    border: "1px solid #fde3ea",
    borderRadius: "16px",
    padding: "20px",
    backgroundColor: "#fff",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(244,63,94,0.06)",
  },
  badge: {
    display: "inline-block",
    backgroundColor: "#fce7f3",
    color: "#be185d",
    fontSize: "12px",
    fontWeight: "600",
    padding: "3px 12px",
    borderRadius: "999px",
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "5px",
    color: "#9f6b7a",
  },
  statValue: {
    fontWeight: "600",
    color: "#1f1015",
  },
};
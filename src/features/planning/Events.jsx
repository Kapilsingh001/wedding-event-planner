import { useEffect, useState } from "react";
import CreateEventForm from "./CreateEventForm";
import EventDetail from "./EventDetail";
import "./Events.css";

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
      if (!eventsRes.ok || !expensesRes.ok) throw new Error("Failed to fetch data");
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
    <div className="events-page">
      <div className="events-header">
        <h1 className="events-title">Events</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
          + Create Event
        </button>
      </div>

      {loading && <p className="status-text">Loading...</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !error && events.length === 0 && (
        <p className="status-text">No events yet. Click "Create Event" to add one.</p>
      )}

      <div className="events-grid">
        {events.map((event) => {
          const totalSpent = getTotalSpent(event.id);
          const remaining = Number(event.budget) - totalSpent;

          return (
            <div key={event.id} className="event-card" onClick={() => setSelectedEventId(event.id)}>
              <span className="event-type-badge">{event.type}</span>
              <h2 className="event-card-title">{event.title}</h2>
              <p className="event-card-meta">{formatDate(event.date)}</p>
              <p className="event-card-meta event-card-venue">{event.venue}</p>

              <div className="event-card-stats">
                <div className="event-card-stat-row">
                  <span>Budget</span>
                  <span className="event-card-stat-value">{formatCurrency(event.budget)}</span>
                </div>
                <div className="event-card-stat-row">
                  <span>Spent</span>
                  <span className="event-card-stat-value">{formatCurrency(totalSpent)}</span>
                </div>
                <div className="event-card-stat-row">
                  <span>Remaining</span>
                  <span className={`event-card-stat-value ${remaining < 0 ? "text-negative" : "text-positive"}`}>
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
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../services/api";
import { getUser } from "../auth/auth";
import { eventSchema } from "./schemas";
import Dropdown from "../../components/Dropdown.jsx";
import DatePicker from "../../components/DatePicker.jsx";

const EVENT_TYPES = ["Wedding", "Haldi", "Mehendi", "Sangeet", "Engagement", "Reception", "Birthday", "Anniversary"];
const TYPE_OPTIONS = EVENT_TYPES.map((type) => ({ value: type, label: type }));

export default function CreateEventForm({ onClose, onSaved, event }) {
  const isEdit = Boolean(event);
  const [error, setError] = useState("");
  const [venues, setVenues] = useState([]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event ? event.title : "",
      type: event ? event.type : "Wedding",
      date: event ? event.date : "",
      venue: event ? event.venue : "",
      budget: event ? event.budget : "",
    },
  });

  // Load vendors in the "Venue" category for the dropdown
  useEffect(() => {
    const loadVenues = async () => {
      try {
        const res = await api.get("/vendors", { params: { category: "Venue" } });
        setVenues(res.data);
      } catch (err) {
        setVenues([]); // form still works, the dropdown is just short
      }
    };
    loadVenues();
  }, []);

  // Dropdown names. In edit mode, keep the saved venue even if it is not a vendor.
  const venueNames = [
    ...new Set([...(event?.venue ? [event.venue] : []), ...venues.map((v) => v.name)]),
  ];

  const venueOptions = [
    { value: "", label: "Select a venue" },
    ...venueNames.map((name) => ({ value: name, label: name })),
  ];

  // An event cannot be planned for a day that has already passed
  const today = new Date().toLocaleDateString("en-CA");

  // Runs only when Zod says the data is valid
  const onSubmit = async (values) => {
    setError("");
    const body = {
      title: values.title,
      type: values.type,
      date: values.date,
      venue: values.venue,
      budget: values.budget,
    };

    try {
      let res;
      if (isEdit) {
        // PATCH: update only these fields (userId is not sent, so it stays unchanged)
        res = await api.patch(`/events/${event.id}`, body);
      } else {
        const user = getUser();
        if (!user) throw new Error("Not logged in");
        // POST: create a new event owned by the logged-in user
        res = await api.post("/events", { ...body, userId: user.id });
      }
      onSaved(res.data);
    } catch (err) {
      setError(isEdit ? "Could not update event. Please try again." : "Could not create event. Please try again.");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "21px", fontWeight: "700", color: "#1f1015" }}>
            {isEdit ? "Edit Event" : "Create Event"}
          </h2>
          <button type="button" onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {error && <div style={styles.alertError}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field label="Event Title" error={errors.title?.message}>
            <input type="text" placeholder="e.g. My Wedding" style={styles.input} {...register("title")} />
          </Field>

          <Field label="Event Type" error={errors.type?.message}>
            {/* Controller connects the shared Dropdown / DatePicker to React Hook Form */}
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Dropdown label="Event type" value={field.value} onChange={field.onChange} options={TYPE_OPTIONS} />
              )}
            />
          </Field>

          <Field label="Date" error={errors.date?.message}>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker id="event-date" value={field.value} onChange={field.onChange} min={today} />
              )}
            />
          </Field>

          <Field label="Venue" error={errors.venue?.message}>
            <Controller
              name="venue"
              control={control}
              render={({ field }) => (
                <Dropdown label="Venue" value={field.value} onChange={field.onChange} options={venueOptions} />
              )}
            />
          </Field>

          <Field label="Budget (₹)" error={errors.budget?.message}>
            <input type="number" placeholder="e.g. 500000" min="0" style={styles.input} {...register("budget")} />
          </Field>

          <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
            <button type="button" onClick={onClose} style={styles.btnSecondary}>Cancel</button>
            <button type="submit" disabled={isSubmitting} style={{ ...styles.btnPrimary, opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save" : "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: "15px" }}>
      <label style={styles.label}>{label}</label>
      {children}
      {error && <p style={styles.fieldError}>{error}</p>}
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
  fieldError: {
    color: "#b91c1c",
    fontSize: "12px",
    margin: "5px 0 0",
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
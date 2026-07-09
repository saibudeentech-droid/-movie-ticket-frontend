import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Context/AuthContext";
import { Link } from "react-router-dom";
import BackButton from "../Components/BackButton";
import "../styles/backButton.css";
import api from "../utils/api";

const statusStyles = {
  COMPLETED: { bg: "rgba(0,200,83,0.16)", color: "#00c853", border: "rgba(0,200,83,0.35)" },
  CONFIRMED: { bg: "rgba(46,125,50,0.16)", color: "#2e7d32", border: "rgba(46,125,50,0.35)" },
  PENDING: { bg: "rgba(245,124,0,0.16)", color: "#f57c00", border: "rgba(245,124,0,0.35)" },
  CANCELLED: { bg: "rgba(211,47,47,0.16)", color: "#d32f2f", border: "rgba(211,47,47,0.35)" },
};

function StatusBadge({ status }) {
  const s = String(status || "").toUpperCase();
  const c = statusStyles[s] || { bg: "rgba(0,0,0,0.06)", color: "#a1a1aa", border: "rgba(255,255,255,0.1)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: c.bg, color: c.color, border: `1px solid ${c.border}`, textTransform: "capitalize" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.color }} />
      {status?.toLowerCase()}
    </span>
  );
}

function MyBookings() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/bookings")
      .then((res) => setBookings(res.data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-center" style={{ textAlign: "center", marginTop: 60 }}>
        <div style={{ width: 36, height: 36, border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "var(--muted)" }}>Loading your bookings...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div style={{ marginBottom: 12 }}><BackButton /></div>
      <h1>My Bookings</h1>
      {user && (
        <p style={{ textAlign: "center", color: "var(--muted)", marginBottom: 24 }}>
          Welcome, {user.name || user.email}
        </p>
      )}

      {bookings.length === 0 ? (
        <div className="page-center" style={{ textAlign: "center", padding: "40px 22px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎫</div>
          <h3 style={{ margin: "0 0 6px" }}>No bookings yet</h3>
          <p style={{ color: "var(--muted)", margin: "0 0 20px" }}>Browse movies and book your first ticket!</p>
          <Link to="/" style={{ display: "inline-flex", padding: "10px 28px", borderRadius: 999, background: "var(--primary)", color: "#fff", fontWeight: 700, textDecoration: "none" }}>Browse Movies</Link>
        </div>
      ) : (
        <div className="orders-list">
          {bookings.map((b) => {
            const date = b.bookingDate ? new Date(b.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
            const time = b.showTime || "";
            return (
              <div key={b.bookingId || b.id} className="order-card" style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 17 }}>{b.movieTitle || `Movie #${b.movieId}`}</h3>
                  <p style={{ margin: "2px 0", fontSize: 13, color: "var(--muted)" }}>
                    {b.theater && <>📍 {b.theater}</>}
                    {b.theater && time && <span style={{ margin: "0 6px" }}>•</span>}
                    {time && <>{time}</>}
                  </p>
                  <p style={{ margin: "2px 0", fontSize: 13, color: "var(--muted)" }}>
                    🆔 {b.bookingId?.slice(0, 8)}… &nbsp;•&nbsp; 📅 {date}
                  </p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                  <div style={{ textAlign: "right", minWidth: 100 }}>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>Seats</p>
                    <p style={{ margin: 0, fontWeight: 700 }}>{b.seats}</p>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 80 }}>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>Total</p>
                    <p style={{ margin: 0, fontWeight: 700, color: "var(--primary2)" }}>₹{b.totalPrice}</p>
                  </div>
                  <div style={{ minWidth: 100, textAlign: "right" }}>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyBookings;

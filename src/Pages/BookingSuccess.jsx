import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../utils/api";

function BookingSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState(null);

  const bookingIdFromQuery = searchParams.get("bookingId");
  const status = searchParams.get("status");
  const isConfirmed = status === "confirmed" || status === "completed";

  useEffect(() => {
    api.get(`/bookings/${id}`)
      .then((res) => setBooking(res.data))
      .catch(() => setBooking(null));
  }, [id]);

  return (
    <div style={{
      minHeight: "calc(100vh - 200px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        maxWidth: 480,
        width: "100%",
        background: "linear-gradient(135deg, rgba(17,28,51,0.95), rgba(15,23,48,0.95))",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        padding: "48px 32px",
        textAlign: "center",
        boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        animation: "fadeIn 0.5s ease",
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: isConfirmed
            ? "linear-gradient(135deg, #4CAF50, #2E7D32)"
            : "linear-gradient(135deg, #FF9800, #F57C00)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: isConfirmed
            ? "0 8px 32px rgba(76,175,80,0.4)"
            : "0 8px 32px rgba(255,152,0,0.4)",
          animation: "scaleIn 0.5s ease 0.2s both",
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {isConfirmed ? (
              <polyline points="20 6 9 17 4 12" />
            ) : (
              <>
                <line x1="12" y1="1" x2="12" y2="23" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </>
            )}
          </svg>
        </div>

        <h1 style={{
          fontSize: 28,
          fontWeight: 900,
          margin: "0 0 6px",
          color: "#fff",
        }}>
          {isConfirmed ? "Payment Successful!" : "Payment Received"}
        </h1>

        <p style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: 14,
          margin: "0 0 28px",
        }}>
          {isConfirmed
            ? "Your booking has been completed."
            : "Your payment is being verified. Booking will be completed shortly."}
        </p>

        <div style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: 16,
          padding: "20px 24px",
          marginBottom: 28,
          textAlign: "left",
        }}>
          <div style={{ marginBottom: 14 }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Booking ID</span>
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 700, color: "#a78bfa" }}>
              {bookingIdFromQuery || booking?.bookingId || "—"}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Movie</span>
              <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 600 }}>{booking?.movieTitle || "—"}</p>
            </div>
            <div>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Date</span>
              <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 600 }}>
                {booking?.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : new Date().toLocaleDateString()}
              </p>
            </div>
            <div>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Seats</span>
              <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 600 }}>{booking?.seats || "—"}</p>
            </div>
            <div>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Total</span>
              <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, color: "#4CAF50" }}>₹{booking?.totalPrice || "—"}</p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => navigate("/my-bookings")}
            style={{
              width: "100%",
              padding: "14px 20px",
              border: "none",
              borderRadius: 12,
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              transition: "transform 0.15s, box-shadow 0.15s",
              boxShadow: "0 8px 24px rgba(124,58,237,0.3)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(124,58,237,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(124,58,237,0.3)"; }}
          >
            View My Bookings
          </button>
          <button
            onClick={() => navigate("/")}
            style={{
              width: "100%",
              padding: "12px 20px",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 12,
              background: "transparent",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingSuccess;

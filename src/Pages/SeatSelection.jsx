import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { getMovieById } from "../Data/movieData";
import api from "../utils/api";
import "../styles/seat.css";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const LOCK_DURATION_SECONDS = 5 * 60;

function nowMs() {
  return Date.now();
}

function formatMMSS(totalSeconds) {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(sec / 60);
  const ss = sec % 60;
  return `${mm.toString().padStart(1, "0")}:${ss.toString().padStart(2, "0")}`;
}

function SeatSelection() {
  const { id: movieIdParam } = useParams();
  const movieId = Number(movieIdParam);
  const [searchParams] = useSearchParams();
  const showId = Number(searchParams.get("showId"));
  const showTime = searchParams.get("showTime");
  const theaterName = searchParams.get("theaterName");
  const price = Number(searchParams.get("price")) || 250;

  const navigate = useNavigate();
  const expiryTimer = useRef(null);

  const [movie, setMovie] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState(new Set());
  const [expiryTimeMs, setExpiryTimeMs] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(LOCK_DURATION_SECONDS);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const isExpired = expiryTimeMs ? nowMs() >= expiryTimeMs : false;
  const activeLockWarning = expiryTimeMs && remainingSeconds <= 60;

  useEffect(() => {
    Promise.all([
      getMovieById(movieId).catch(() => null),
      api.get(`/shows/${showId}/seats`).then((r) => r.data).catch(() => []),
    ])
      .then(([movieData, seatData]) => {
        setMovie(movieData);
        setSeats(seatData);
      })
      .finally(() => setLoading(false));
  }, [movieId, showId]);

  useEffect(() => {
    if (!expiryTimeMs) return;
    expiryTimer.current = setInterval(() => {
      const now = nowMs();
      const rem = Math.max(0, Math.floor((expiryTimeMs - now) / 1000));
      setRemainingSeconds(rem);
      if (now >= expiryTimeMs) {
        clearInterval(expiryTimer.current);
        setLockedSeats(new Set());
        setSelectedSeats([]);
        setExpiryTimeMs(null);
      }
    }, 1000);
    return () => clearInterval(expiryTimer.current);
  }, [expiryTimeMs]);

  const groupedSeats = useMemo(() => {
    const map = {};
    for (const s of seats) {
      if (!map[s.row]) map[s.row] = [];
      map[s.row].push(s);
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [seats]);

  const seatStatus = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) return "SELECTED";
    if (lockedSeats.has(seatNumber)) return "LOCKED";
    const seat = seats.find((s) => s.seatNumber === seatNumber);
    if (!seat) return "AVAILABLE";
    if (seat.status === "BOOKED" || seat.status === "LOCKED") return "BOOKED";
    return "AVAILABLE";
  };

  const totalPrice = selectedSeats.length * price;

  const handleToggleSeat = (seatNumber) => {
    const status = seatStatus(seatNumber);
    if (status === "BOOKED") return;

    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) return prev.filter((s) => s !== seatNumber);
      return [...prev, seatNumber];
    });

    if (expiryTimeMs && nowMs() < expiryTimeMs) return;
    const expiry = nowMs() + LOCK_DURATION_SECONDS * 1000;
    setExpiryTimeMs(expiry);

    api.post("/seats/lock", { showId, seatNumbers: [seatNumber] }).catch(() => {});
  };

  const onProceedPayment = async () => {
    if (selectedSeats.length === 0) return;
    setProcessing(true);
    setPaymentError("");

    try {
      await api.post("/seats/lock", { showId, seatNumbers: selectedSeats });

      const res = await api.post("/bookings", {
        movieId,
        showId,
        seats: selectedSeats,
        totalPrice,
      });

      const booking = res.data;

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setPaymentError("Failed to load payment gateway. Please try again.");
        setProcessing(false);
        return;
      }

      const orderRes = await api.post("/payments/create-order", { bookingId: booking.id });
      const { razorpayOrderId, amount, currency, key } = orderRes.data;

      const options = {
        key,
        amount: Math.round(amount * 100),
        currency: currency || "INR",
        name: "Movie Ticket Booking",
        description: `Booking #${booking.bookingId?.slice(0, 8) || booking.id}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post("/payments/verify", {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              bookingId: booking.id,
            });
            navigate(`/booking-success/${booking.id}?bookingId=${booking.bookingId || booking.id}&status=confirmed`);
          } catch {
            navigate(`/booking-success/${booking.id}?bookingId=${booking.bookingId || booking.id}&status=pending`);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setPaymentError("Payment failed. Please try again.");
        setProcessing(false);
      });
      rzp.open();
    } catch {
      setPaymentError("Failed to initiate payment. Please try again.");
      setProcessing(false);
    }
  };

  const onBack = () => {
    try {
      if (selectedSeats.length > 0) {
        api.post("/seats/unlock", { showId, seatNumbers: selectedSeats }).catch(() => {});
      }
      navigate(-1);
    } catch {
      navigate("/");
    }
  };

  if (loading) return null;

  const lockDisplay = expiryTimeMs ? formatMMSS(remainingSeconds) : formatMMSS(0);

  return (
    <div className="seat-page">
      <div className="seat-sticky-header">
        <div className="seat-sticky-inner">
          <button className="seat-back" onClick={onBack}>
            ← Back
          </button>
          <div className="seat-sticky-meta">
            <div className="seat-sticky-title">{movie?.title || "Loading..."}</div>
            <div className="seat-sticky-sub">
              {theaterName || ""} • {showTime ? (() => { const [h, m] = showTime.slice(0, 5).split(":").map(Number); const a = h >= 12 ? "PM" : "AM"; const h12 = h % 12 || 12; return `${h12}:${String(m).padStart(2, "0")} ${a}`; })() : ""}
            </div>
          </div>
          <div className="seat-sticky-price">
            ₹{price} / seat
            <div className={`seat-lock-timer ${activeLockWarning ? "warn" : ""}`}>
              {expiryTimeMs ? (
                <>Lock: <span>{lockDisplay}</span></>
              ) : (
                <>Select seats</>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="seat-shell">
        <div className="seat-grid-panel">
          <h2 className="seat-panel-title">Seat Selection</h2>

          <div className={`seat-lock-warning ${activeLockWarning ? "red" : ""}`}>
            {expiryTimeMs ? (
              remainingSeconds <= 0
                ? "Lock expired, select seats again"
                : activeLockWarning
                  ? "Complete payment!"
                  : "Seats are locked for you"
            ) : selectedSeats.length > 0 ? (
              "Select seats to start lock timer"
            ) : (
              "Choose your seats"
            )}
          </div>

          <div className="seat-legend">
            <LegendItem color="#4CAF50" label="Available" />
            <LegendItem color="#BDBDBD" label="Locked" />
            <LegendItem color="#E50013" label="Booked" />
            <LegendItem color="#2196F3" label="Selected" />
          </div>

          <div className="seat-screen-label">Screen</div>

          <div className="seat-grid-wrap" aria-label="Seat grid">
            {groupedSeats.map(([row, rowSeats]) => (
              <div className="seat-grid-row" key={row}>
                <div className="seat-row-label">{row}</div>
                <div className="seat-grid-row-seats">
                  {rowSeats.map((s) => {
                    const status = seatStatus(s.seatNumber);
                    return (
                      <button
                        key={s.id}
                        className={`seat-btn ${status.toLowerCase()}`}
                        onClick={() => handleToggleSeat(s.seatNumber)}
                        disabled={status === "BOOKED"}
                        title={`${s.seatNumber} (${status})`}
                      >
                        <div className="seat-btn-inner">
                          <div className="seat-number">{s.seatNumber}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="seat-summary-panel">
          <h3 className="seat-summary-title">Your Selection</h3>

          <div className="seat-summary-box">
            <div className="seat-summary-row">
              <div className="seat-summary-label">Selected</div>
              <div className="seat-summary-value">
                {selectedSeats.length > 0
                  ? `${selectedSeats.length} seats selected for ₹${totalPrice}`
                  : "No seats selected"}
              </div>
            </div>

            <div className="seat-summary-row">
              <div className="seat-summary-label">Lock time remaining</div>
              <div className={`seat-summary-value ${activeLockWarning ? "red" : ""}`}>
                {expiryTimeMs ? lockDisplay : "—"}
              </div>
            </div>

            <div className="seat-summary-row">
              <div className="seat-summary-label">Total price</div>
              <div className="seat-summary-total">₹{totalPrice}</div>
            </div>

            {selectedSeats.length > 0 ? (
              <div className="seat-selected-list">
                {selectedSeats.map((sn) => (
                  <button
                    key={sn}
                    className="seat-selected-chip"
                    onClick={() => handleToggleSeat(sn)}
                    type="button"
                    title="Click to deselect"
                  >
                    {sn} ✕
                  </button>
                ))}
              </div>
            ) : (
              <div className="seat-selected-empty">Pick seats to see them here.</div>
            )}
          </div>

          {paymentError && <div className="auth-error">{paymentError}</div>}

          <button
            className="seat-proceed-btn"
            onClick={onProceedPayment}
            disabled={selectedSeats.length === 0 || processing}
          >
            {processing ? "Processing..." : "Proceed to Payment"}
          </button>

          <div className={`seat-payment-hint ${activeLockWarning ? "red" : ""}`}>
            Complete payment within 5 minutes
          </div>

          {expiryTimeMs && isExpired ? (
            <div className="seat-expiry-note red">Lock expired, select seats again</div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="seat-legend-item">
      <span className="seat-legend-dot" style={{ background: color }} />
      <span className="seat-legend-label">{label}</span>
    </div>
  );
}

export default SeatSelection;

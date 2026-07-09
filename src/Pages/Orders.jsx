import { useEffect, useState } from "react";
import api from "../utils/api";

function Orders() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/bookings")
      .then((res) => setBookings(res.data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <div className="orders-page">
      <h1>Your Orders</h1>
      <div className="orders-list">
        {bookings.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          bookings.map((b) => (
            <div key={b.bookingId || b.id} className="order-card">
              <h3>{b.movieTitle || `Movie #${b.movieId}`}</h3>
              <p>Booking ID: {b.bookingId}</p>
              <p>Seat: {b.seats}</p>
              <p>Total: ₹{b.totalPrice}</p>
              <p>Status: {b.status}</p>
              <p>Date: {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : ""}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Orders;

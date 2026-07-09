import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import BackButton from "../Components/BackButton";
import "../styles/backButton.css";
import api from "../utils/api";

function ShowSelection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [theaters, setTheaters] = useState([]);
  const [shows, setShows] = useState([]);
  const [selectedTheaterId, setSelectedTheaterId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/theaters")
      .then((res) => {
        setTheaters(res.data);
        if (res.data.length > 0) setSelectedTheaterId(res.data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function formatTime(time) {
    if (!time) return "";
    const [h, m] = time.slice(0, 5).split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  }

  useEffect(() => {
    if (!selectedTheaterId) return;
    api.get(`/shows?movieId=${id}&theaterId=${selectedTheaterId}`)
      .then((res) => { setShows(res.data); })
      .catch(() => { setShows([]); });
  }, [id, selectedTheaterId]);

  if (loading) return null;

  const poster = searchParams.get("poster") || "";

  return (
    <div className="page-center flow-card">
      <div className="bb-page-topbar">
        <div className="bb-page-topbar-inner">
          <BackButton />
        </div>
      </div>
      <h1>Select Theater & Show</h1>

      <div style={{ marginTop: 10 }}>
        <h3 style={{ margin: "10px 0 12px" }}>Select Theater</h3>
        <div className="booking-flow-buttons" style={{ justifyContent: "center" }}>
          {theaters.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTheaterId(t.id)}
              style={{
                background:
                  t.id === selectedTheaterId
                    ? "rgba(229,0,19,.90)"
                    : undefined,
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ margin: "10px 0 12px" }}>Select Show Time</h3>
        <div className="booking-flow-buttons">
          {shows.map((show) => (
            <button
              key={show.id}
              onClick={() => {
                navigate(
                  `/seat-selection/${id}?showId=${show.id}&showTime=${encodeURIComponent(show.showTime)}&theaterId=${selectedTheaterId}&theaterName=${encodeURIComponent(show.theater?.name || "")}&price=${show.ticketPrice}${poster ? `&poster=${encodeURIComponent(poster)}` : ""}`
                );
              }}
            >
              {formatTime(show.showTime)} — ₹{show.ticketPrice} ({show.format})
            </button>
          ))}
          {shows.length === 0 && !loading && (
            <p style={{ color: "var(--muted)" }}>No shows available for this theater.</p>
          )}
        </div>
      </div>

      <p style={{ marginTop: 14, color: "var(--muted)" }}>
        Selected: <b>{theaters.find((t) => t.id === selectedTheaterId)?.name || ""}</b>
      </p>
    </div>
  );
}

export default ShowSelection;

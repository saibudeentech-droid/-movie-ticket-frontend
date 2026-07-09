import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
import BackButton from "../Components/BackButton";
import "../styles/backButton.css";
import { getMovieById } from "../Data/movieData";
import { getReviewsByMovieId, createReview } from "../Data/reviewData";
import { useToast } from "../Context/ToastContext";

function formatMinutes(d) {
  const t = Number(d);
  if (Number.isNaN(t) || t <= 0) return "";
  return `${Math.floor(t / 60)}h ${t % 60}m`;
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
}

function StarRating({ value, onChange }) {
  return (
    <Box className="md-starPicker">
      {[1, 2, 3, 4, 5].map((star) => (
        <Typography
          key={star}
          className={`md-star ${star <= value ? "md-starFilled" : "md-starEmpty"} ${onChange ? "md-starClickable" : ""}`}
          onClick={() => onChange?.(star)}
        >
          {star <= value ? "⭐" : "★"}
        </Typography>
      ))}
    </Box>
  );
}

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const showToast = useToast();

  const [reviews, setReviews] = useState([]);
  const [revLoading, setRevLoading] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");
  const isAuth = !!token;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    getMovieById(id)
      .then((data) => { if (mounted) { setMovie(data); setLoading(false); } })
      .catch(() => { if (mounted) { setError("Movie not found."); setLoading(false); } });
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    if (!id || loading) return;
    let cancelled = false;
    setRevLoading(true);
    getReviewsByMovieId(id)
      .then((data) => { if (!cancelled) setReviews(data ?? []); })
      .catch(() => { if (!cancelled) setReviews([]); })
      .finally(() => { if (!cancelled) setRevLoading(false); });
    return () => { cancelled = true; };
  }, [id, loading]);

  const onBook = () => navigate(`/booking/cinema?movieId=${encodeURIComponent(id)}`);

  const onShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ url }); return; }
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); }
      else {
        const ta = document.createElement("textarea");
        ta.value = url; ta.style.position = "fixed"; ta.style.left = "-9999px";
        document.body.appendChild(ta); ta.select(); document.execCommand("copy");
        document.body.removeChild(ta);
      }
      showToast("Link copied!");
    } catch { showToast("Unable to share"); }
  };

  const onSubmitReview = async () => {
    if (newRating === 0) { showToast("Please select a rating"); return; }
    if (!newComment.trim()) { showToast("Please write a comment"); return; }
    setSubmitting(true);
    try {
      const rev = await createReview(Number(id), newRating, newComment.trim());
      setReviews((prev) => [rev, ...prev]);
      setNewRating(0);
      setNewComment("");
      showToast("Review submitted!");
    } catch {
      showToast("Failed to submit review");
    }
    setSubmitting(false);
  };

  const posterUrl = movie?.imageUrl || movie?.poster;
  const rating = movie?.rating;
  const votes = movie?.votes;

  const genreStr = movie?.genre
    ? (Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre)
    : (movie?.languages ? movie.languages.split(",")[0] : "");

  const languageList = movie?.languages
    ? (Array.isArray(movie.languages) ? movie.languages : movie.languages.split(","))
    : [];

  const infoParts = [
    formatMinutes(movie?.duration),
    genreStr,
    movie?.ageRating != null ? `${movie.ageRating}+` : "UA13+",
    formatDate(movie?.releaseDate),
  ].filter(Boolean);

  if (loading) {
    return (
      <Box className="movieDetails-page">
        <Box className="bb-page-topbar"><Box className="bb-page-topbar-inner"><BackButton /></Box></Box>
        <Box className="movieDetails-loading"><Typography variant="h5">Loading...</Typography></Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="movieDetails-page">
        <Box className="bb-page-topbar"><Box className="bb-page-topbar-inner"><BackButton /></Box></Box>
        <Box className="movieDetails-error">
          <Typography variant="h5">Something went wrong</Typography>
          <Typography sx={{ color: "var(--muted)", mt: 1 }}>{error}</Typography>
        </Box>
      </Box>
    );
  }

  if (!movie) return null;

  return (
    <Box className="movieDetails-page">
      <Box className="bb-page-topbar">
        <Box className="bb-page-topbar-inner"><BackButton /></Box>
      </Box>

      {/* Hero section */}
      <Box className="md-hero">
        <Box className="md-backdrop"
          sx={{ backgroundImage: posterUrl ? `url(${posterUrl})` : "none" }}
        />
        <Box className="md-overlay" />

        <Box className="md-row">
          <Box className="md-left">
            <Box className="md-posterCard">
              {posterUrl ? (
                <Box className="md-posterImg" sx={{ backgroundImage: `url(${posterUrl})` }} />
              ) : (
                <Box className="md-posterFallback">
                  {movie.title?.charAt(0)?.toUpperCase()}
                </Box>
              )}
            </Box>
            <Box className={`md-badge ${movie.status === "COMING_SOON" ? "md-badge--upcoming" : ""}`}>
              {movie.status === "COMING_SOON" ? "Coming Soon" : "In cinemas"}
            </Box>
          </Box>

          <Box className="md-right">
            <Box className="md-shareWrap">
              <Button className="md-shareBtn" onClick={onShare}>Share</Button>
            </Box>
            <Typography className="md-title">{movie.title}</Typography>

            <Box className="md-ratingCard">
              <Box className="md-ratingLeft">
                <Box className="md-starRow">
                  <Typography className="md-starIcon">⭐</Typography>
                  <Typography className="md-ratingVal">{rating ? `${rating}/10` : "–/10"}</Typography>
                  <Typography className="md-votes">
                    {votes ? `${Number(votes).toLocaleString()}+ Votes` : "0 Votes"}
                  </Typography>
                </Box>
              </Box>
              <Button className="md-rateBtn">Rate now</Button>
            </Box>

            <Typography className="md-info">{infoParts.join(" • ")}</Typography>

            <Box className="md-tags">
              <Chip label="2D" className="md-chip" />
              {languageList.slice(0, 2).map((lang) => (
                <Chip key={lang} label={lang.trim()} className="md-chip" />
              ))}
            </Box>

            <Button className={`md-bookBtn${movie.status === "COMING_SOON" ? " md-bookBtn--upcoming" : ""}`} onClick={onBook}>
              {movie.status === "COMING_SOON" ? "Book Advance" : "Book tickets"}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Reviews section */}
      <Box className="md-reviews">
        <Typography className="md-reviewsTitle">Reviews</Typography>

        {revLoading && reviews.length === 0 && (
          <Typography className="md-reviewsEmpty">Loading reviews...</Typography>
        )}

        {!revLoading && reviews.length === 0 && (
          <Typography className="md-reviewsEmpty">No reviews yet. Be the first to review!</Typography>
        )}

        {reviews.map((rev) => (
          <Box key={rev.id} className="md-reviewCard">
            <Box className="md-reviewHeader">
              <Box className="md-reviewUser">
                <Box className="md-reviewAvatar">{rev.userName?.charAt(0)?.toUpperCase() || "?"}</Box>
                <Typography className="md-reviewName">{rev.userName || "Anonymous"}</Typography>
              </Box>
              <Typography className="md-reviewTime">{timeAgo(rev.createdAt)}</Typography>
            </Box>
            <Box className="md-reviewStars">
              <StarRating value={rev.rating} />
            </Box>
            {rev.comment && (
              <Typography className="md-reviewComment">{rev.comment}</Typography>
            )}
          </Box>
        ))}

        {/* Review form */}
        {isAuth && (
          <Box className="md-reviewForm">
            <Typography className="md-reviewFormTitle">Write a Review</Typography>
            <Box className="md-reviewFormStars">
              <Typography sx={{ mr: 1, color: "var(--muted)", fontWeight: 600 }}>Rating:</Typography>
              <StarRating value={newRating} onChange={setNewRating} />
            </Box>
            <textarea
              className="md-reviewTextarea"
              placeholder="Share your thoughts about this movie..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <Typography className="md-reviewCharCount">{newComment.length}/500</Typography>
            <Button
              className="md-reviewSubmit"
              onClick={onSubmitReview}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </Box>
        )}

        {!isAuth && (
          <Typography className="md-reviewLoginPrompt">
            <Button
              className="md-reviewLoginBtn"
              onClick={() => navigate("/login")}
            >
              Log in
            </Button>
            {" "}to write a review.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default MovieDetails;

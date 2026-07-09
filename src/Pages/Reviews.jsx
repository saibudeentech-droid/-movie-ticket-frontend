import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";

function Reviews() {
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get("movieId") || 1;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/reviews", { params: { movieId } })
      .then((res) => setReviews(res.data ?? []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [movieId]);

  if (loading) return null;

  return (
    <div className="reviews-page">
      <h1>Reviews</h1>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="review-card">
            <h3>{review.userName || review.user?.name || "Anonymous"}</h3>
            <p>{"⭐".repeat(review.rating)}</p>
            <p>{review.comment}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Reviews;

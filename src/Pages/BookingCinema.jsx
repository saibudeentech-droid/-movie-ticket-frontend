import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function BookingCinema() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const movieId = searchParams.get("movieId");

  useEffect(() => {
    if (movieId) {
      navigate(`/show-selection/${encodeURIComponent(movieId)}?${searchParams.toString()}`, { replace: true });
    } else {
      navigate("/");
    }
  }, [movieId, navigate]);

  return null;
}

export default BookingCinema;

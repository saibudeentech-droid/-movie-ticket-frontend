import { Link } from "react-router-dom";

function MovieCard({ movie }) {
  const isUpcoming = movie.status === "COMING_SOON";

  return (
    <div className={`movie-card${isUpcoming ? " movie-card--upcoming" : ""}`}>
      <div className="movie-card__img-wrap">
        <img
          src={movie.imageUrl || movie.poster}
          alt={movie.title}
        />
        {isUpcoming && <div className="movie-card__badge">Coming Soon</div>}
      </div>
      <div className="movie-card__body">
        <h3>{movie.title}</h3>
        <p>Language: {movie.languages || movie.language || ""}</p>
        <p>Duration: {movie.duration}</p>
        {!isUpcoming && <p>⭐ Rating: {movie.rating}</p>}
      </div>
      <Link to={`/movie-details/${movie.id}`}>
        <button className={isUpcoming ? "btn-advance" : ""}>
          {isUpcoming ? "Book Advance" : "Book Now"}
        </button>
      </Link>
    </div>
  );
}

export default MovieCard;
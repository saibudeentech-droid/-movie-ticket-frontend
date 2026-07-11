import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MovieCard from "../Components/MovieCard";
import MovieCarousel from "../Components/MovieCarousel";
import { getAllMovies } from "../Data/movieData";

function Home() {
  const [movies, setMovies] = useState([]);
  const [searchParams] = useSearchParams();
  const search = searchParams.get("q") || "";

  useEffect(() => {
    getAllMovies().then((data) => setMovies(data ?? [])).catch(() => setMovies([]));
  }, []);

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <MovieCarousel />
      <div className="movie-container">
        {filteredMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
      {filteredMovies.length === 0 && (
        <p style={{ marginTop: 20 }}>No movies found.</p>
      )}
    </div>
  );


}

export default Home;
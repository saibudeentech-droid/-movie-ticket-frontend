import api from "../utils/api";

export async function getAllMovies() {
   res = await api.get("/movies");
  return res.data;
}
//export const getAllMovies = async () => {
  //const res = await api.get('/movies'); // or whatever your endpoint is
  //return res.data.content; // not res.data
//};

export async function getMovieById(id) {
  const res = await api.get(`/movies/${id}`);
  return res.data;
}

export async function saveMovie(movie) {
  if (movie.id) {
    const res = await api.put(`/admin/movies/${movie.id}`, movie);
    return res.data;
  }
  const res = await api.post("/admin/movies", movie);
  return res.data;
}

export async function deleteMovie(id) {
  await api.delete(`/admin/movies/${id}`);
  return true;
}

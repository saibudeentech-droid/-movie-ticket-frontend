import api from "../utils/api";

export async function getReviewsByMovieId(movieId) {
  const res = await api.get("/reviews", { params: { movieId } });
  return res.data;
}

export async function createReview(movieId, rating, comment) {
  const res = await api.post("/reviews", { movieId, rating, comment });
  return res.data;
}

export async function getAllReviews() {
  const res = await api.get("/admin/reviews");
  return res.data;
}

export async function updateReview(id, data) {
  const res = await api.put(`/admin/reviews/${id}`, data);
  return res.data;
}

export async function deleteReview(id) {
  await api.delete(`/admin/reviews/${id}`);
  return true;
}

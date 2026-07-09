import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { getAllMovies, saveMovie, deleteMovie } from "../../Data/movieData";
import { useToast } from "../../Context/ToastContext";
import api from "../../utils/api";

const EditIcon = () => <span aria-hidden="true" style={{ fontSize: 18 }}>✏️</span>;
const DeleteIcon = () => <span aria-hidden="true" style={{ fontSize: 18 }}>🗑️</span>;

const emptyMovie = {
  id: null, title: "", genre: "", duration: "", releaseDate: "",
  status: "NOW_SHOWING", imageUrl: "", description: "", price: 0, rating: 0, language: "",

};

export default function ManageMovies() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyMovie);
  const showToast = useToast();
  const [generating, setGenerating] = useState(false);

  useEffect(() => { getAllMovies().then((data) => setMovies(data ?? [])).catch(() => setMovies([])); }, []);

  const refresh = () => getAllMovies().then((data) => setMovies(data ?? [])).catch(() => setMovies([]));

  const filteredMovies = filter === "ALL" ? movies : movies.filter((m) => m.status === filter);

  const openAdd = () => { setEditingId(null); setForm({ ...emptyMovie }); setOpen(true); };
  const openEdit = (movie) => { setEditingId(movie.id); setForm({ ...emptyMovie, ...movie, genre: movie.genre || movie.languages || "", language: movie.language || movie.languages || "" }); setOpen(true); };
  const handleClose = () => setOpen(false);

  const handleGenerateShows = async () => {
    if (!window.confirm("Generate shows for all existing movies without shows?")) return;
    setGenerating(true);
    try {
      await api.post("/admin/shows/generate-missing");
      showToast("Shows generated successfully!");
    } catch {
      showToast("Failed to generate shows.");
    }
    setGenerating(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.genre.trim() || !form.duration) {
      showToast("Please fill Title, Genre and Duration.");
      return;
    }
    try {
      const label = editingId ? "updated" : "created";
      await saveMovie({ ...form, duration: Number(form.duration), price: Number(form.price) || 0, rating: Number(form.rating) || 0 });
      refresh();
      setOpen(false);
      showToast(`Movie ${label} successfully!`);
    } catch { showToast("Failed to save movie."); }
  };

  const handleDelete = async (movie) => {
    if (!window.confirm(`Delete movie "${movie.title}"?`)) return;
    try { await deleteMovie(movie.id); refresh(); showToast(`Movie "${movie.title}" deleted.`); } catch { showToast("Failed to delete movie."); }
  };

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, py: 4, maxWidth: 1200, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Button onClick={() => navigate("/admin/dashboard")} variant="outlined" sx={{ whiteSpace: "nowrap", borderRadius: 2 }}>← Back</Button>
        <Box>
          <Typography variant="h4" fontWeight={900}>Manage Movies</Typography>
          <Typography variant="body2" color="text.secondary">Add, edit or remove movies</Typography>
        </Box>
        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          <Button variant="outlined" onClick={handleGenerateShows} disabled={generating} sx={{ borderRadius: 2, borderColor: "#7c3aed", color: "#7c3aed" }}>{generating ? "Generating..." : "Generate Shows"}</Button>
          <Button variant="contained" onClick={openAdd} sx={{ borderRadius: 2, bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}>+ Add Movie</Button>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {[
          { label: "All", value: "ALL" },
          { label: "Now Showing", value: "NOW_SHOWING" },
          { label: "Coming Soon", value: "COMING_SOON" },
        ].map((opt) => (
          <Button
            key={opt.value}
            size="small"
            variant={filter === opt.value ? "contained" : "outlined"}
            onClick={() => setFilter(opt.value)}
            sx={{
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 12,
              borderColor: opt.value === "COMING_SOON" ? "rgba(251,191,36,.4)" : "rgba(124,58,237,.3)",
              bgcolor: filter === opt.value
                ? (opt.value === "COMING_SOON" ? "rgba(251,191,36,.85)" : "#7c3aed")
                : "transparent",
              color: filter === opt.value ? "#fff" : (opt.value === "COMING_SOON" ? "#fbbf24" : "inherit"),
              "&:hover": {
                bgcolor: filter === opt.value
                  ? (opt.value === "COMING_SOON" ? "rgba(251,191,36,.95)" : "#6d28d9")
                  : (opt.value === "COMING_SOON" ? "rgba(251,191,36,.12)" : "rgba(124,58,237,.08)"),
              },
            }}
          >
            {opt.label}
          </Button>
        ))}
      </Stack>

      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(124,58,237,0.06)" }}>
                <TableCell sx={{ fontWeight: 800 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Genre</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800, width: 120 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMovies.map((m) => (
                <TableRow key={m.id} sx={{ "&:hover": { bgcolor: "rgba(124,58,237,0.04)" } }}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      {m.imageUrl && (
                        <Box component="img" src={m.imageUrl} alt="" sx={{ width: 36, height: 52, borderRadius: 1, objectFit: "cover", bgcolor: "grey.100" }} />
                      )}
                      <Box>
                        <Typography fontWeight={700}>{m.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{m.duration} min{m.releaseDate ? ` • ${m.releaseDate}` : ""}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{m.genre || m.language}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "inline-flex", px: 1.25, py: 0.3, borderRadius: 999, fontSize: 12, fontWeight: 700, bgcolor: m.status === "NOW_SHOWING" ? "rgba(46,125,50,0.12)" : "rgba(251,191,36,0.15)", color: m.status === "NOW_SHOWING" ? "#2e7d32" : "#fbbf24" }}>
                      {m.status === "NOW_SHOWING" ? "Now Showing" : "Coming Soon"}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(m)} sx={{ color: "#7c3aed" }}><EditIcon /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(m)} sx={{ color: "#d32f2f" }}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMovies.length === 0 && (
                <TableRow><TableCell colSpan={4}><Typography color="text.secondary" sx={{ p: 3, textAlign: "center" }}>No {filter === "ALL" ? "" : filter === "COMING_SOON" ? "upcoming " : "showing "}movies yet.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>{editingId ? "Edit Movie" : "Add Movie"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField label="Title" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} fullWidth />
            <TextField label="Genre" value={form.genre} onChange={(e) => setForm((s) => ({ ...s, genre: e.target.value }))} fullWidth />
            <TextField label="Duration (minutes)" type="number" value={form.duration} onChange={(e) => setForm((s) => ({ ...s, duration: e.target.value }))} fullWidth />
            <TextField label="Release Date" type="date" InputLabelProps={{ shrink: true }} value={form.releaseDate} onChange={(e) => setForm((s) => ({ ...s, releaseDate: e.target.value }))} fullWidth />
            <TextField label="Price" type="number" value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} fullWidth />
            <TextField label="Rating" type="number" inputProps={{ min: 0, max: 10, step: 0.1 }} value={form.rating} onChange={(e) => setForm((s) => ({ ...s, rating: e.target.value }))} fullWidth />
            <TextField label="Language" value={form.language} onChange={(e) => setForm((s) => ({ ...s, language: e.target.value }))} fullWidth />
            <TextField select label="Status" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))} fullWidth>
              <MenuItem value="NOW_SHOWING">Now Showing</MenuItem>
              <MenuItem value="COMING_SOON">Coming Soon</MenuItem>
            </TextField>
            <Stack spacing={1}>
              <Typography variant="body2" fontWeight={600}>Poster Image</Typography>
              {form.imageUrl && <Box component="img" src={form.imageUrl} alt="preview" sx={{ width: 120, height: 180, objectFit: "cover", borderRadius: 2, border: "1px solid", borderColor: "divider" }} />}
              <Button variant="outlined" component="label" sx={{ borderRadius: 2 }}>
                {form.imageUrl ? "Change Image" : "Upload Image"}
                <input type="file" hidden accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => { const r = typeof reader.result === "string" ? reader.result : ""; setForm((s) => ({ ...s, imageUrl: r })); };
                  reader.readAsDataURL(file);
                }} />
              </Button>
              <TextField label="Or paste image URL" value={form.imageUrl} onChange={(e) => setForm((s) => ({ ...s, imageUrl: e.target.value }))} fullWidth size="small" />
            </Stack>
            <TextField label="Description" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} fullWidth multiline minRows={3} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ borderRadius: 2, bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

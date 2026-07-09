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
import { useToast } from "../../Context/ToastContext";
import api from "../../utils/api";

const EditIcon = () => <span aria-hidden="true" style={{ fontSize: 18 }}>✏️</span>;
const DeleteIcon = () => <span aria-hidden="true" style={{ fontSize: 18 }}>🗑️</span>;

const emptyShow = { movieId: "", theaterId: "", showTime: "", showDate: "", format: "2D", ticketPrice: "" };

export default function ManageShows() {
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const showToast = useToast();
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyShow);

  const fetchShows = () => api.get("/admin/shows").then((r) => setShows(r.data)).catch(() => setShows([]));
  const fetchMovies = () => api.get("/movies").then((r) => setMovies(r.data)).catch(() => setMovies([]));
  const fetchTheaters = () => api.get("/admin/theaters").then((r) => setTheaters(r.data)).catch(() => setTheaters([]));
  useEffect(() => { fetchShows(); fetchMovies(); fetchTheaters(); }, []);

  const openAdd = () => { setEditingId(null); setForm({ ...emptyShow }); setOpen(true); };
  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({ movieId: s.movie?.id || "", theaterId: s.theater?.id || "", showTime: s.showTime || "", showDate: s.showDate || "", format: s.format || "2D", ticketPrice: s.ticketPrice || "" });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (!form.movieId || !form.theaterId || !form.showTime || !form.showDate) { showToast("Please fill all required fields."); return; }
    const payload = { movieId: Number(form.movieId), theaterId: Number(form.theaterId), showTime: form.showTime, showDate: form.showDate, format: form.format, ticketPrice: Number(form.ticketPrice) || 0 };
    try {
      editingId ? await api.put(`/admin/shows/${editingId}`, payload) : await api.post("/admin/shows", payload);
      fetchShows(); setOpen(false);
      showToast("Show saved successfully!");
    } catch { showToast("Failed to save show."); }
  };

  const handleDelete = async (show) => {
    if (!window.confirm(`Delete show #${show.id}?`)) return;
    try { await api.delete(`/admin/shows/${show.id}`); fetchShows(); showToast(`Show #${show.id} deleted.`); } catch { showToast("Failed to delete show."); }
  };

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, py: 4, maxWidth: 1200, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Button onClick={() => navigate("/admin/dashboard")} variant="outlined" sx={{ whiteSpace: "nowrap", borderRadius: 2 }}>← Back</Button>
        <Box>
          <Typography variant="h4" fontWeight={900}>Manage Shows</Typography>
          <Typography variant="body2" color="text.secondary">Schedule movie shows</Typography>
        </Box>
        <Box sx={{ ml: "auto" }}>
          <Button variant="contained" onClick={openAdd} sx={{ borderRadius: 2, bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}>+ Add Show</Button>
        </Box>
      </Stack>

      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(124,58,237,0.06)" }}>
                <TableCell sx={{ fontWeight: 800 }}>Movie</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Theater</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Format</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 800, width: 120 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shows.map((s) => (
                <TableRow key={s.id} sx={{ "&:hover": { bgcolor: "rgba(124,58,237,0.04)" } }}>
                  <TableCell><Typography fontWeight={700}>{s.movie?.title || `#${s.movie?.id}`}</Typography></TableCell>
                  <TableCell>{s.theater?.name || `#${s.theater?.id}`}</TableCell>
                  <TableCell>{s.showTime}</TableCell>
                  <TableCell>{s.showDate}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "inline-flex", px: 1, py: 0.2, borderRadius: 999, fontSize: 11, fontWeight: 700, bgcolor: "rgba(124,58,237,0.1)", color: "#7c3aed" }}>{s.format}</Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>₹{s.ticketPrice}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(s)} sx={{ color: "#7c3aed" }}><EditIcon /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(s)} sx={{ color: "#d32f2f" }}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {shows.length === 0 && (
                <TableRow><TableCell colSpan={7}><Typography color="text.secondary" sx={{ p: 3, textAlign: "center" }}>No shows yet. Click "Add Show" to create one.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>{editingId ? "Edit Show" : "Add Show"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField select label="Movie" value={form.movieId} onChange={(e) => setForm((s) => ({ ...s, movieId: e.target.value }))} fullWidth>
              {movies.map((m) => <MenuItem key={m.id} value={m.id}>{m.title}</MenuItem>)}
            </TextField>
            <TextField select label="Theater" value={form.theaterId} onChange={(e) => setForm((s) => ({ ...s, theaterId: e.target.value }))} fullWidth>
              {theaters.map((t) => <MenuItem key={t.id} value={t.id}>{t.name} ({t.city})</MenuItem>)}
            </TextField>
            <TextField label="Show Time" type="time" InputLabelProps={{ shrink: true }} value={form.showTime} onChange={(e) => setForm((s) => ({ ...s, showTime: e.target.value }))} fullWidth />
            <TextField label="Show Date" type="date" InputLabelProps={{ shrink: true }} value={form.showDate} onChange={(e) => setForm((s) => ({ ...s, showDate: e.target.value }))} fullWidth />
            <TextField select label="Format" value={form.format} onChange={(e) => setForm((s) => ({ ...s, format: e.target.value }))} fullWidth>
              <MenuItem value="2D">2D</MenuItem>
              <MenuItem value="3D">3D</MenuItem>
              <MenuItem value="IMAX">IMAX</MenuItem>
              <MenuItem value="4DX">4DX</MenuItem>
            </TextField>
            <TextField label="Ticket Price" type="number" value={form.ticketPrice} onChange={(e) => setForm((s) => ({ ...s, ticketPrice: e.target.value }))} fullWidth />
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

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
import { getAllReviews, updateReview, deleteReview } from "../../Data/reviewData";

const EditIcon = () => <span aria-hidden="true" style={{ fontSize: 18 }}>✏️</span>;
const DeleteIcon = () => <span aria-hidden="true" style={{ fontSize: 18 }}>🗑️</span>;

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function Stars({ n }) {
  return <span>{[1, 2, 3, 4, 5].map((i) => (i <= n ? "⭐" : "★")).join(" ")}</span>;
}

export default function ManageReviews() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [reviews, setReviews] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ rating: "", comment: "" });

  const fetch = () => getAllReviews().then(setReviews).catch(() => setReviews([]));
  useEffect(() => { fetch(); }, []);

  const openEdit = (r) => {
    setEditing(r);
    setForm({ rating: String(r.rating || ""), comment: r.comment || "" });
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setEditing(null); };

  const handleSave = async () => {
    const ratingNum = Number(form.rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) { showToast("Rating must be between 1 and 5."); return; }
    try {
      await updateReview(editing.id, { rating: ratingNum, comment: form.comment });
      fetch();
      handleClose();
      showToast("Review updated successfully!");
    } catch { showToast("Failed to update review."); }
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete review by "${r.userName}"?`)) return;
    try { await deleteReview(r.id); fetch(); showToast("Review deleted."); } catch { showToast("Failed to delete review."); }
  };

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, py: 4, maxWidth: 1200, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Button onClick={() => navigate("/admin/dashboard")} variant="outlined" sx={{ whiteSpace: "nowrap", borderRadius: 2 }}>← Back</Button>
        <Box>
          <Typography variant="h4" fontWeight={900}>Manage Reviews</Typography>
          <Typography variant="body2" color="text.secondary">View, edit or remove user reviews</Typography>
        </Box>
      </Stack>

      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(124,58,237,0.06)" }}>
                <TableCell sx={{ fontWeight: 800, width: "18%" }}>User</TableCell>
                <TableCell sx={{ fontWeight: 800, width: "18%" }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 800, width: "18%" }}>Movie</TableCell>
                <TableCell sx={{ fontWeight: 800, width: "12%" }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 800, width: "22%" }}>Comment</TableCell>
                <TableCell sx={{ fontWeight: 800, width: "12%" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 800, width: 100 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((r) => (
                <TableRow key={r.id} sx={{ "&:hover": { bgcolor: "rgba(124,58,237,0.04)" } }}>
                  <TableCell><Typography fontWeight={700}>{r.userName || "Anonymous"}</Typography></TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{r.userEmail || "—"}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{r.movieTitle || "—"}</TableCell>
                  <TableCell><Stars n={r.rating} /></TableCell>
                  <TableCell sx={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "text.secondary" }}>{r.comment || "—"}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{timeAgo(r.createdAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(r)} sx={{ color: "#7c3aed" }}><EditIcon /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(r)} sx={{ color: "#d32f2f" }}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {reviews.length === 0 && (
                <TableRow><TableCell colSpan={7}><Typography color="text.secondary" sx={{ p: 3, textAlign: "center" }}>No reviews yet.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>Edit Review</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Review by <strong>{editing?.userName || "Anonymous"}</strong>
              {editing?.movieTitle ? <> for <strong>{editing.movieTitle}</strong></> : null}
            </Typography>
            <TextField label="Rating (1-5)" type="number" value={form.rating} onChange={(e) => setForm((s) => ({ ...s, rating: e.target.value }))} fullWidth inputProps={{ min: 1, max: 5 }} />
            <TextField label="Comment" value={form.comment} onChange={(e) => setForm((s) => ({ ...s, comment: e.target.value }))} fullWidth multiline rows={3} />
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

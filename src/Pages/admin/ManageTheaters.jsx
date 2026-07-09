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
import api from "../../utils/api";

const EditIcon = () => <span aria-hidden="true" style={{ fontSize: 18 }}>✏️</span>;
const DeleteIcon = () => <span aria-hidden="true" style={{ fontSize: 18 }}>🗑️</span>;

const emptyTheater = { name: "", city: "", address: "" };

export default function ManageTheaters() {
  const navigate = useNavigate();
  const [theaters, setTheaters] = useState([]);
  const [open, setOpen] = useState(false);
  const showToast = useToast();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyTheater);

  const fetch = () => api.get("/admin/theaters").then((r) => setTheaters(r.data)).catch(() => setTheaters([]));
  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditingId(null); setForm({ ...emptyTheater }); setOpen(true); };
  const openEdit = (t) => { setEditingId(t.id); setForm({ name: t.name, city: t.city, address: t.address || "" }); setOpen(true); };
  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (!form.name.trim() || !form.city.trim()) { showToast("Name and City are required."); return; }
    try {
      const label = editingId ? "updated" : "created";
      editingId ? await api.put(`/admin/theaters/${editingId}`, form) : await api.post("/admin/theaters", form);
      fetch(); setOpen(false);
      showToast(`Theater ${label} successfully!`);
    } catch { showToast("Failed to save theater."); }
  };

  const handleDelete = async (theater) => {
    if (!window.confirm(`Delete theater "${theater.name}"?`)) return;
    try { await api.delete(`/admin/theaters/${theater.id}`); fetch(); showToast(`Theater "${theater.name}" deleted.`); } catch { showToast("Failed to delete theater."); }
  };

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, py: 4, maxWidth: 1200, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Button onClick={() => navigate("/admin/dashboard")} variant="outlined" sx={{ whiteSpace: "nowrap", borderRadius: 2 }}>← Back</Button>
        <Box>
          <Typography variant="h4" fontWeight={900}>Manage Theaters</Typography>
          <Typography variant="body2" color="text.secondary">Manage theater locations</Typography>
        </Box>
        <Box sx={{ ml: "auto" }}>
          <Button variant="contained" onClick={openAdd} sx={{ borderRadius: 2, bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}>+ Add Theater</Button>
        </Box>
      </Stack>

      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(124,58,237,0.06)" }}>
                <TableCell sx={{ fontWeight: 800 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>City</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Address</TableCell>
                <TableCell sx={{ fontWeight: 800, width: 120 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {theaters.map((t) => (
                <TableRow key={t.id} sx={{ "&:hover": { bgcolor: "rgba(124,58,237,0.04)" } }}>
                  <TableCell><Typography fontWeight={700}>{t.name}</Typography></TableCell>
                  <TableCell>{t.city}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{t.address || "—"}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(t)} sx={{ color: "#7c3aed" }}><EditIcon /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(t)} sx={{ color: "#d32f2f" }}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {theaters.length === 0 && (
                <TableRow><TableCell colSpan={4}><Typography color="text.secondary" sx={{ p: 3, textAlign: "center" }}>No theaters yet. Click "Add Theater" to create one.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>{editingId ? "Edit Theater" : "Add Theater"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} fullWidth />
            <TextField label="City" value={form.city} onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))} fullWidth />
            <TextField label="Address" value={form.address} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} fullWidth multiline />
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

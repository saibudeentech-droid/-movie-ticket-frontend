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

export default function ManageUsers() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "USER", gender: "", address: "" });

  useEffect(() => {
    api.get("/admin/users").then((res) => setUsers(res.data)).catch(() => setUsers([]));
  }, []);

  const refresh = () => api.get("/admin/users").then((res) => setUsers(res.data)).catch(() => setUsers([]));

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({ name: user.name || "", email: user.email || "", phone: user.phone || "", role: user.role || "USER", gender: user.gender || "", address: user.address || "" });
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setEditingUser(null); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      showToast("Name and Email are required.");
      return;
    }
    try {
      await api.put(`/admin/users/${editingUser.id}`, form);
      refresh();
      handleClose();
      showToast("User updated successfully!");
    } catch { showToast("Failed to update user."); }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}" (${user.email})?`)) return;
    try {
      await api.delete(`/admin/users/${user.id}`);
      refresh();
      showToast(`User "${user.name}" deleted.`);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Failed to delete user.";
      showToast(typeof msg === "string" ? msg : "Failed to delete user.");
    }
  };

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, py: 4, maxWidth: 1200, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Button onClick={() => navigate("/admin/dashboard")} variant="outlined" sx={{ whiteSpace: "nowrap", borderRadius: 2 }}>← Back</Button>
        <Box>
          <Typography variant="h4" fontWeight={900}>Manage Users</Typography>
          <Typography variant="body2" color="text.secondary">View, edit or remove users</Typography>
        </Box>
      </Stack>

      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(124,58,237,0.06)" }}>
                <TableCell sx={{ fontWeight: 800 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Gender</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 800, width: 100 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} sx={{ "&:hover": { bgcolor: "rgba(124,58,237,0.04)" } }}>
                  <TableCell><Typography fontWeight={700}>{u.name}</Typography></TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone || "—"}</TableCell>
                  <TableCell>{u.gender || "—"}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "inline-flex", px: 1.25, py: 0.3, borderRadius: 999, fontSize: 12, fontWeight: 700, bgcolor: u.role === "ADMIN" ? "rgba(124,58,237,0.12)" : "rgba(33,150,243,0.12)", color: u.role === "ADMIN" ? "#7c3aed" : "#2196F3" }}>
                      {u.role}
                    </Box>
                  </TableCell>
                  <TableCell>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(u)} sx={{ color: "#7c3aed" }}><EditIcon /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(u)} sx={{ color: "#d32f2f" }}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow><TableCell colSpan={7}><Typography color="text.secondary" sx={{ p: 3, textAlign: "center" }}>No users found.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} fullWidth />
            <TextField label="Email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} fullWidth />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} fullWidth />
            <TextField select label="Gender" value={form.gender} onChange={(e) => setForm((s) => ({ ...s, gender: e.target.value }))} fullWidth>
              <MenuItem value="">Select Gender</MenuItem>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField label="Address" value={form.address} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} fullWidth multiline minRows={2} />
            <TextField select label="Role" value={form.role} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))} fullWidth>
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </TextField>
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
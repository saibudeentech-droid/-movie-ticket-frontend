import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
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
import { FaTrash } from "react-icons/fa";
import { useToast } from "../../Context/ToastContext";
import api from "../../utils/api";

const formatTime = (time) => {
  if (!time) return "—";
  const [h, m] = time.slice(0, 5).split(":").map(Number);
  const a = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${a}`;
};

const StatusBadge = ({ status }) => {
  const normalized = String(status || "").toLowerCase();
  const config =
    normalized === "confirmed"
      ? { bg: "rgba(46, 125, 50, 0.16)", color: "#2e7d32", border: "rgba(46, 125, 50, 0.35)" }
      : normalized === "pending"
      ? { bg: "rgba(245, 124, 0, 0.16)", color: "#f57c00", border: "rgba(245, 124, 0, 0.35)" }
      : normalized === "completed"
      ? { bg: "rgba(0, 200, 83, 0.16)", color: "#00c853", border: "rgba(0, 200, 83, 0.35)" }
      : normalized === "cancelled" || normalized === "canceled"
      ? { bg: "rgba(211, 47, 47, 0.16)", color: "#d32f2f", border: "rgba(211, 47, 47, 0.35)" }
      : normalized === "deleted"
      ? { bg: "rgba(100, 100, 100, 0.16)", color: "#9e9e9e", border: "rgba(100, 100, 100, 0.35)" }
      : { bg: "rgba(0,0,0,0.06)", color: "text.primary", border: "rgba(0,0,0,0.12)" };

  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", px: 1.25, py: 0.5, borderRadius: 999, fontSize: 12, fontWeight: 700, bgcolor: config.bg, color: config.color, border: `1px solid ${config.border}`, textTransform: "capitalize" }}>
      {status}
    </Box>
  );
};

export default function ManageBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const showToast = useToast();
  const [statusMap, setStatusMap] = useState({});
  const deletedIds = useRef(new Set());

  useEffect(() => {
    api.get("/admin/bookings").then((r) => {
      setBookings(r.data);
      const map = {};
      r.data.forEach((b) => { map[b.id] = b.status; });
      setStatusMap(map);
    }).catch(() => setBookings([]));
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/admin/bookings/${id}/status`, { status: newStatus });
      setStatusMap((prev) => ({ ...prev, [id]: newStatus }));
      showToast(`Status changed to ${newStatus}`);
    } catch { showToast("Failed to update booking status."); }
  };

  const handleDelete = async (booking) => {
    if (!window.confirm(`Delete booking #${(booking.bookingId || "").slice(0, 8)}?`)) return;
    try {
      await api.delete(`/admin/bookings/${booking.id}`);
      const label = (booking.bookingId || "").slice(0, 8);
      showToast(`Booking #${label} deleted permanently`);
      deletedIds.current.add(booking.id);
      setBookings((prev) => prev.filter((b) => !deletedIds.current.has(b.id)));
    } catch { showToast("Failed to delete booking"); }
  };

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, py: 4, maxWidth: 1200, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Button onClick={() => navigate("/admin/dashboard")} variant="outlined" sx={{ whiteSpace: "nowrap", borderRadius: 2 }}>← Back</Button>
        <Box>
          <Typography variant="h4" fontWeight={900}>Manage Bookings</Typography>
          <Typography variant="body2" color="text.secondary">View and update booking statuses</Typography>
        </Box>
      </Stack>

      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(124,58,237,0.06)" }}>
                <TableCell sx={{ fontWeight: 800 }}>Movie</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Show Time</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Seats</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800, width: 200 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id} sx={{ "&:hover": { bgcolor: "rgba(124,58,237,0.04)" } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{b.movieTitle || "—"}</TableCell>
                  <TableCell>{formatTime(b.showTime)}</TableCell>
                  <TableCell>{b.userName || "—"}</TableCell>
                  <TableCell>{b.userEmail || "—"}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{b.seats}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>₹{b.totalPrice}</TableCell>
                  <TableCell sx={{ color: "text.secondary", fontSize: 13 }}>{b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : "—"}</TableCell>
                  <TableCell><StatusBadge status={statusMap[b.id] || b.status} /></TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        select size="small" value={statusMap[b.id] || b.status || ""}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        sx={{ minWidth: 120, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      >
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="COMPLETED">Completed</MenuItem>
                        <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                        <MenuItem value="CANCELLED">Cancelled</MenuItem>
                      </TextField>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(b)}
                        sx={{ color: "#9e9e9e", "&:hover": { color: "#d32f2f" } }}
                        title="Delete booking"
                      >
                        <FaTrash size={14} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow><TableCell colSpan={9}><Typography color="text.secondary" sx={{ p: 3, textAlign: "center" }}>No bookings found.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

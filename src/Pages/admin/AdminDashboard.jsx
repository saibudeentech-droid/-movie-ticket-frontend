import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
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
    normalized === "completed"
      ? { bg: "rgba(0, 200, 83, 0.16)", color: "#00c853", border: "rgba(0, 200, 83, 0.35)" }
      : normalized === "confirmed"
      ? { bg: "rgba(46, 125, 50, 0.16)", color: "#2e7d32", border: "rgba(46, 125, 50, 0.35)" }
      : normalized === "pending"
      ? { bg: "rgba(245, 124, 0, 0.16)", color: "#f57c00", border: "rgba(245, 124, 0, 0.35)" }
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

const statCards = [
  { label: "Movies", key: "totalMovies", icon: "🎬", color: "#7c3aed" },
  { label: "Theaters", key: "totalTheaters", icon: "🏛️", color: "#0891b2" },
  { label: "Shows Today", key: "showsToday", icon: "🎭", color: "#059669" },
  { label: "Total Bookings", key: "totalBookings", icon: "🎟️", color: "#d97706" },
];

const manageItems = [
  { label: "Movies", path: "/admin/movies", icon: "🎬", desc: "Add, edit or remove movies" },
  { label: "Theaters", path: "/admin/theaters", icon: "🏛️", desc: "Manage theater locations" },
  { label: "Shows", path: "/admin/shows", icon: "🎭", desc: "Schedule movie shows" },
  { label: "Bookings", path: "/admin/bookings", icon: "🎟️", desc: "View and update bookings" },
  { label: "Users", path: "/admin/users", icon: "👥", desc: "Manage user accounts" },
  { label: "Reviews", path: "/admin/reviews", icon: "⭐", desc: "Manage user reviews" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard")
      .then((res) => setStats(res.data))
      .catch(() => setStats(null));
  }, []);

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, py: 4, maxWidth: 1200, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Button onClick={() => navigate("/")} variant="outlined" sx={{ whiteSpace: "nowrap", borderRadius: 2 }}>← Home</Button>
        <Box>
          <Typography variant="h4" fontWeight={900}>Admin Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Overview & quick actions</Typography>
        </Box>
      </Stack>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statCards.map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.key}>
            <Card
              elevation={0}
              onClick={s.key === "totalMovies" ? () => navigate("/admin/movies") : undefined}
              sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", cursor: s.key === "totalMovies" ? "pointer" : "default", transition: "transform 0.15s, box-shadow 0.15s", "&:hover": { transform: s.key === "totalMovies" ? "translateY(-2px)" : "none", boxShadow: s.key === "totalMovies" ? "0 4px 12px rgba(0,0,0,0.08)" : "none" } }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ fontSize: 28 }}>{s.icon}</Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>{s.label}</Typography>
                  <Typography variant="h4" fontWeight={900} sx={{ color: s.color, lineHeight: 1.2 }}>
                    {stats?.[s.key] ?? "—"}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>Manage</Typography>
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {manageItems.map((m) => (
          <Grid item xs={12} sm={6} md={4} key={m.label} sx={{ display: "flex" }}>
            <Card elevation={0} sx={{ width: "100%", borderRadius: 3, border: "1px solid", borderColor: "divider", transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 16px rgba(124,58,237,0.12)", borderColor: "rgba(124,58,237,0.3)" } }}>
              <CardActionArea onClick={() => navigate(m.path)} sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1.5, height: "100%" }}>
                <Box sx={{ fontSize: 28 }}>{m.icon}</Box>
                <Box>
                  <Typography fontWeight={800} sx={{ fontSize: 16 }}>{m.label}</Typography>
                  <Typography variant="body2" color="text.secondary">{m.desc}</Typography>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>Recent Bookings</Typography>
      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(124,58,237,0.06)" }}>
                <TableCell sx={{ fontWeight: 800 }}>Movie</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Show Time</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Theater</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Seats</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(!stats?.recentBookings || stats.recentBookings.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>No recent bookings</TableCell>
                </TableRow>
              ) : (
                stats.recentBookings.map((b, idx) => (
                  <TableRow key={b.bookingId || idx} sx={{ "&:hover": { bgcolor: "rgba(124,58,237,0.04)" } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{b.movieTitle}</TableCell>
                    <TableCell>{formatTime(b.showTime)}</TableCell>
                    <TableCell>{b.userName || "—"}</TableCell>
                    <TableCell>{b.userEmail || "—"}</TableCell>
                    <TableCell>{b.theater || "—"}</TableCell>
                    <TableCell>{b.seats}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        {String(b.status || "").toLowerCase() === "deleted" && (
                          <Box component="span" sx={{ fontSize: 14, lineHeight: 1 }}>🗑</Box>
                        )}
                        <StatusBadge status={b.status} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

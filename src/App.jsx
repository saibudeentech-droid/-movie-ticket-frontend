import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import { ToastProvider } from "./Context/ToastContext";
import MyBookings from "./Pages/MyBookings";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ProtectedRoute from "./Components/ProtectedRoute";
import Profile from "./Pages/Profile";
import Reviews from "./Pages/Reviews";
import Account from "./Pages/Account";
import Orders from "./Pages/Orders";

import Home from "./Pages/Home";
import MovieDetails from "./Pages/MovieDetails";
import ShowSelection from "./Pages/ShowSelection";
import SeatSelection from "./Pages/SeatSelection";

import BookingCinema from "./Pages/BookingCinema";
import BookingSuccess from "./Pages/BookingSuccess";
import NotFound from "./Pages/NotFound";

import AdminRoute from "./Components/AdminRoute";
import AdminDashboard from "./Pages/admin/AdminDashboard";
import ManageMovies from "./Pages/admin/ManageMovies";
import ManageTheaters from "./Pages/admin/ManageTheaters";
import ManageShows from "./Pages/admin/ManageShows";
import ManageBookings from "./Pages/admin/ManageBookings";
import ManageUsers from "./Pages/admin/ManageUsers";
import ManageReviews from "./Pages/admin/ManageReviews";


function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Navbar />

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Routes>

            <Route path="/" element={<Home />} />

            <Route
              path="/movie-details/:id"
              element={<MovieDetails />}
            />

            <Route
               path="/show-selection/:id"
              element={<ShowSelection />}
              />

            <Route
              path="/seat-selection/:id"
              element={<SeatSelection />}
            />


            <Route
              path="/booking/cinema"
              element={<BookingCinema />}
            />

            <Route
              path="/booking-success/:id"
              element={<BookingSuccess />}
            />
            <Route
              path="*"
              element={<NotFound />}
            />
            <Route

            path="/my-bookings"

            element={ <ProtectedRoute> <MyBookings /> </ProtectedRoute> }
            />

            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/movies"
              element={
                <AdminRoute>
                  <ManageMovies />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/theaters"
              element={
                <AdminRoute>
                  <ManageTheaters />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/shows"
              element={
                <AdminRoute>
                  <ManageShows />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/bookings"
              element={
                <AdminRoute>
                  <ManageBookings />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <ManageUsers />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/reviews"
              element={
                <AdminRoute>
                  <ManageReviews />
                </AdminRoute>
              }
            />

            <Route
            path="/login"
            element={<Login />}
            />

            
            <Route
            path="/register"
            element={<Register />}
            />
            <Route
             path="/profile"
             element={ <ProtectedRoute> <Profile /> </ProtectedRoute> }
            />
            <Route
            path="/reviews"
            element={<Reviews />}
            />
            <Route
            path="/account"
            element={ <ProtectedRoute> <Account /> </ProtectedRoute> }
            />

            <Route
            path="/orders"
            element={ <ProtectedRoute> <Orders /> </ProtectedRoute> }
            />

          </Routes>
        </div>

        <Footer />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
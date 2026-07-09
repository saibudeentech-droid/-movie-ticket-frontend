# TODO
- [x] Fix registration/login so users (non-admin) can register and then login successfully.
- [x] Persist auth state in AuthProvider from localStorage so ProtectedRoute works after navigation/refresh.
- [x] Update Login to authenticate against both dummy users and users saved by Register in localStorage.
- [x] Update Register to save created user into localStorage (including role: "user").
- [x] Verify admin route still blocks non-admin users.
- [ ] Run app / quick manual test: register user -> login -> access /my-bookings and /profile (protected).
- [x] Fix Navbar dashboard visibility: user login no longer shows admin dashboard link.




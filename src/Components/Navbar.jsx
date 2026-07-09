import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "../Context/AuthContext";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import "../styles/navbar.css";

function Navbar() {
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();
  const inputRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  const isHome = location.pathname === "/";

  const searchValue = searchParams.get("q") || "";

  const setSearchValue = (val) => {
    if (val) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <span className="nav-logo-icon">🎬</span>
        <span className="nav-logo-text">MovieTicket</span>
      </Link>

      {isHome && (
        <div className={`nav-search ${searchFocused ? "focused" : ""}`}>
          <FaSearch className="nav-search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search movies..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchValue && (
            <button
              className="nav-search-clear"
              onClick={() => {
                setSearchValue("");
                inputRef.current?.focus();
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      <div className="nav-links">
        <Link to="/" className={isActive("/") ? "nav-link active" : "nav-link"}>
          Home
        </Link>

        {isLoggedIn && !isAdmin && (
          <Link to="/my-bookings" className={isActive("/my-bookings") ? "nav-link active" : "nav-link"}>
            My Bookings
          </Link>
        )}

        {isAdmin && (
          <Link
            to="/admin/dashboard"
            className={isActive("/admin/dashboard") ? "nav-link active" : "nav-link"}
          >
            Dashboard
          </Link>
        )}

        {!isLoggedIn ? (
          <Link to="/login" className="nav-login-btn">
            Login
          </Link>
        ) : (
          <div className="profile-menu" aria-label="Profile menu">
            <div
              onClick={() => setShowMenu((v) => !v)}
              role="button"
              tabIndex={0}
              className="nav-profile-trigger"
            >
              <FaUserCircle size={32} />
            </div>

            {showMenu && (
              <div className="dropdown">
                <Link to="/profile" onClick={() => setShowMenu(false)}>
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setShowMenu(false);
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;


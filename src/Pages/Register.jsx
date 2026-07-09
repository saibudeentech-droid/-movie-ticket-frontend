import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";

import { AuthContext } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import api from "../utils/api";

function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const showToast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      const res = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: "",
      });
      const { token, userId, email: userEmail, role, name: userName } = res.data;
      login(token, { userId, email: userEmail, role, name: userName });
      navigate("/", { replace: true });
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Account already exists for this email");
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="auth-card">
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 8, fontSize: 26,
      }}>📝</div>
      <h1>Create Account</h1>
      <p style={{ margin: "-6px 0 18px", color: "var(--muted)", fontSize: 14 }}>Join us and start booking</p>

      {error && <div className="auth-error"><span aria-hidden="true">⚠️</span>{error}</div>}

      <div className="auth-form">
        <div className="input-group">
          <label className="input-label">Name</label>
          <input
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <div className="input-wrapper">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="pw-toggle"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <button type="button" onClick={submit}>
        Register
      </button>

      <div className="auth-switch">
        <p className="auth-switch-text">Already have an account?</p>
        <button
          className="auth-link"
          type="button"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Register;

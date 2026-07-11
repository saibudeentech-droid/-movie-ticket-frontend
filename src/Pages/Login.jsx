import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import api from "../utils/api";
import Loader from "../Components/Loader";

function Login() {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const showToast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    setAuthError(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email: email.trim(), password });
      const { token, userId, email: userEmail, role, name } = res.data;
      login(token, { userId, email: userEmail, role, name });

      if (role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setAuthError({ type: "invalid" });
      } else {
        setAuthError({ type: "server" });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="auth-card">
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 8, fontSize: 26,
      }}>🔐</div>
      <h1>Welcome Back</h1>
      <p style={{ margin: "-6px 0 18px", color: "var(--muted)", fontSize: 14 }}>Sign in to your account</p>

      <form className="auth-form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <div className="input-group">
          <label className="input-label">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (authError) setAuthError(null);
            }}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <div className="input-wrapper">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (authError) setAuthError(null);
              }}
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

        {authError && (
          <div className="auth-error" role="alert" aria-live="polite">
            <span aria-hidden="true">⚠️</span>
            {authError.type === "server"
              ? "Server error. Please try again."
              : "Invalid password or email"}
          </div>
        )}

        <button type="submit">
          Login
        </button>
      </form>

      <div className="auth-switch">
        <p className="auth-switch-text">New user?</p>
        <button
          className="auth-link"
          type="button"
          onClick={() => navigate("/register")}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

export default Login;

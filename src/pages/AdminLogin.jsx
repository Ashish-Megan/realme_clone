import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (username === ADMIN_USER && password === ADMIN_PASS) {
        sessionStorage.setItem("adminLoggedIn", "true");
        navigate("/admin/dashboard");
      } else {
        setError("Invalid username or password. Please try again.");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="al-root">
      {/* ── Left panel ── */}
      <div className="al-left">
        <div className="al-geo al-geo1" />
        <div className="al-geo al-geo2" />
        <div className="al-geo al-geo3" />
        <div className="al-brand">
          <div className="al-brand-icon">⚡</div>
          <h1 className="al-brand-name">RealMe</h1>
          <p className="al-brand-sub">Admin Control Panel</p>
        </div>
        <div className="al-left-footer">
          Manage users · Upload visas · Verify records
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="al-right">
        <div className="al-form-card">
          <div className="al-form-top">
            <span className="al-badge">ADMIN ACCESS</span>
            <h2 className="al-form-title">Sign In</h2>
            <p className="al-form-subtitle">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="al-form">
            <div className="al-field-group">
              <label className="al-label">Username</label>
              <input
                className={`al-input ${error ? "al-input-err" : ""}`}
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="al-field-group">
              <label className="al-label">Password</label>
              <input
                className={`al-input ${error ? "al-input-err" : ""}`}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && <div className="al-error">{error}</div>}

            <button className="al-submit" type="submit" disabled={loading}>
              {loading ? <span className="al-spinner" /> : "Sign In →"}
            </button>
          </form>

          <p className="al-hint">
            Hint: <code>admin</code> / <code>admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}

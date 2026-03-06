import { useState } from "react";

// ── Static credentials ──────────────────────────────────────────────
const VALID_USERNAME = "Admin Realme";
const VALID_PASSWORD = "RealmeAdmin@2026";
// ───────────────────────────────────────────────────────────────────

export default function Login({ onAuth }) {
  const [form, setForm] = useState({ user: "", pass: "" });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setAuthError("");

    // ── Field-level validation ──
    let newErrors = {};
    if (!form.user.trim()) newErrors.user = "Please enter your Username";
    if (!form.pass.trim()) newErrors.pass = "Please enter your Password";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // ── Show loading spinner ──
    setLoading(true);

    // ── Simulate network delay, then check credentials ──
    setTimeout(() => {
      if (form.user.trim() === VALID_USERNAME && form.pass === VALID_PASSWORD) {
        onAuth();
      } else {
        setAuthError(
          "The username or password you entered is incorrect. Please try again.",
        );
        setLoading(false);
      }
    }, 1500);
  };

  const clearFieldError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  return (
    <div className="main-container">
      {/* Maintenance Banner */}
      <div className="maintenance-banner">
        We're upgrading our RealMe verified identity service. You will be unable
        to apply for, manage or use your RealMe verified identity from 12am–8am,
        Sunday 8 March. The RealMe login service is not impacted and can be used
        as usual.
      </div>

      <div className="auth-card">
        {/* ── Left: Login ── */}
        <div className="auth-column border-right">
          <h2 style={{ fontWeight: 300, fontSize: "28px", marginTop: 0 }}>
            Log in with{" "}
            <span style={{ color: "#D64309", fontWeight: 700 }}>RealMe</span>
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            {/* Auth-level error (wrong credentials) */}
            {authError && (
              <div className="login-auth-error">⚠️ {authError}</div>
            )}

            {/* Username */}
            <input
              type="text"
              placeholder="Username"
              className={`realme-input ${errors.user ? "error" : ""}`}
              value={form.user}
              onChange={(e) => {
                setForm({ ...form, user: e.target.value });
                clearFieldError("user");
                setAuthError("");
              }}
              disabled={loading}
              autoComplete="username"
            />
            {errors.user && <div className="error-text">{errors.user}</div>}

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              className={`realme-input ${errors.pass ? "error" : ""}`}
              value={form.pass}
              onChange={(e) => {
                setForm({ ...form, pass: e.target.value });
                clearFieldError("pass");
                setAuthError("");
              }}
              disabled={loading}
              autoComplete="current-password"
            />
            {errors.pass && <div className="error-text">{errors.pass}</div>}

            {/* Submit button with loading state */}
            <button
              className="realme-btn"
              type="submit"
              disabled={loading}
              style={{
                marginTop: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                opacity: loading ? 0.85 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Logging in…
                </>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: "25px",
              display: "flex",
              gap: "10px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            <a
              // href="/forgot"
              style={{ color: "#D64309", textDecoration: "none" }}
            >
              Forgot Username
            </a>
            <span style={{ color: "#CCC", fontWeight: "normal" }}>or</span>
            <a
              // href="/forgot"
              style={{ color: "#D64309", textDecoration: "none" }}
            >
              Forgot Password?
            </a>
          </div>
        </div>

        {/* ── Right: Register ── */}
        <div className="auth-column">
          <h2 style={{ fontWeight: 300, fontSize: "28px", marginTop: 0 }}>
            Create a{" "}
            <span style={{ color: "#D64309", fontWeight: 700 }}>RealMe</span>{" "}
            login
          </h2>
          <p style={{ lineHeight: "1.6", color: "#4C4C4C" }}>
            To access this service you need a RealMe login.
          </p>
          <button className="realme-btn">Create a RealMe login</button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import seedUsers from "../data/users.json";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");

  // ── Auth guard ──
  useEffect(() => {
    if (sessionStorage.getItem("adminLoggedIn") !== "true") {
      navigate("/admin");
    }
  }, [navigate]);

  // ── Load users from sessionStorage (persists across admin pages in session) ──
  useEffect(() => {
    const stored = sessionStorage.getItem("adminUsers");
    if (stored) {
      setUsers(JSON.parse(stored));
    } else {
      sessionStorage.setItem("adminUsers", JSON.stringify(seedUsers));
      setUsers(seedUsers);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("adminLoggedIn");
    navigate("/admin");
  };

  const handleDelete = (id) => {
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    sessionStorage.setItem("adminUsers", JSON.stringify(updated));
    setDeleteTarget(null);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(users, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = users.filter(
    (u) =>
      u.familyName.toLowerCase().includes(search.toLowerCase()) ||
      u.passportNumber.toLowerCase().includes(search.toLowerCase()) ||
      u.nationality.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="ad-root">
      {/* ── Top Bar ── */}
      <header className="ad-topbar">
        <div className="ad-topbar-left">
          <span className="ad-topbar-icon">⚡</span>
          <span className="ad-topbar-title">RealMe Admin</span>
        </div>
        <div className="ad-topbar-right">
          <button className="ad-export-btn" onClick={handleExportJSON}>
            ⬇ Export users.json
          </button>
          <button className="ad-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="ad-main">
        {/* ── Stats strip ── */}
        <div className="ad-stats">
          <div className="ad-stat-card ad-stat-orange">
            <span className="ad-stat-num">{users.length}</span>
            <span className="ad-stat-label">Total Users</span>
          </div>
          <div className="ad-stat-card ad-stat-blue">
            <span className="ad-stat-num">
              {users.filter((u) => u.pdfPath).length}
            </span>
            <span className="ad-stat-label">PDFs Linked</span>
          </div>
          <div className="ad-stat-card ad-stat-green">
            <span className="ad-stat-num">
              {users.filter((u) => u.nationality === "New Zealand").length}
            </span>
            <span className="ad-stat-label">NZ Nationals</span>
          </div>
          <div className="ad-stat-card ad-stat-purple">
            <span className="ad-stat-num">
              {users.filter((u) => u.nationality === "Nepal").length}
            </span>
            <span className="ad-stat-label">Nepal Nationals</span>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="ad-controls">
          <input
            className="ad-search"
            type="text"
            placeholder="🔍  Search by name, passport, nationality…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="ad-add-btn"
            onClick={() => navigate("/admin/user/new")}
          >
            + Add New User
          </button>
        </div>

        {/* ── Table ── */}
        <div className="ad-table-wrap">
          {filtered.length === 0 ? (
            <div className="ad-empty">No users found.</div>
          ) : (
            <table className="ad-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Family Name</th>
                  <th>Nationality</th>
                  <th>Passport No.</th>
                  <th>Date of Birth</th>
                  <th>Gender</th>
                  <th>Visa Start</th>
                  <th>PDF</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id}>
                    <td className="ad-td-num">{i + 1}</td>
                    <td className="ad-td-bold">{u.familyName}</td>
                    <td>
                      <span className="ad-nat-badge">{u.nationality}</span>
                    </td>
                    <td className="ad-td-mono">{u.passportNumber}</td>
                    <td>{u.dob}</td>
                    <td>{u.gender}</td>
                    <td>{u.visaStartDate}</td>
                    <td>
                      {u.pdfPath ? (
                        <a
                          href={u.pdfPath}
                          target="_blank"
                          rel="noreferrer"
                          className="ad-pdf-link"
                        >
                          📄 View
                        </a>
                      ) : (
                        <span className="ad-no-pdf">—</span>
                      )}
                    </td>
                    <td className="ad-actions">
                      <button
                        className="ad-edit-btn"
                        onClick={() => navigate(`/admin/user/edit/${u.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="ad-del-btn"
                        onClick={() => setDeleteTarget(u)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="ad-modal-overlay">
          <div className="ad-modal">
            <div className="ad-modal-icon">🗑️</div>
            <h3 className="ad-modal-title">Delete User?</h3>
            <p className="ad-modal-body">
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.familyName}</strong>? This cannot be undone.
            </p>
            <div className="ad-modal-actions">
              <button
                className="ad-modal-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className="ad-modal-confirm"
                onClick={() => handleDelete(deleteTarget.id)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

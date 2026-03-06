import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EMPTY_FORM = {
  familyName: "",
  nationality: "",
  passportNumber: "",
  dob: "",
  gender: "",
  visaStartDate: "",
  pdfPath: "",
};

export default function AdminUserForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // present only in edit mode
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [pdfFile, setPdfFile] = useState(null); // the File object chosen by admin
  const [pdfPreviewName, setPdfPreviewName] = useState("");
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  // ── Auth guard ──
  useEffect(() => {
    if (sessionStorage.getItem("adminLoggedIn") !== "true") {
      navigate("/admin");
    }
  }, [navigate]);

  // ── Pre-fill in edit mode ──
  useEffect(() => {
    if (isEdit) {
      const stored = sessionStorage.getItem("adminUsers");
      if (stored) {
        const users = JSON.parse(stored);
        const found = users.find((u) => u.id === id);
        if (found) {
          setFormData(found);
          if (found.pdfPath) {
            setPdfPreviewName(found.pdfPath.split("/").pop());
          }
        }
      }
    }
  }, [id, isEdit]);

  const set = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    setPdfPreviewName(file.name);
    // Store the intended path (will live in public/pdfs/)
    setFormData((prev) => ({ ...prev, pdfPath: `/pdfs/${file.name}` }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.familyName.trim()) errs.familyName = "Required";
    if (!formData.nationality) errs.nationality = "Required";
    if (!formData.passportNumber.trim()) errs.passportNumber = "Required";
    if (!formData.dob) errs.dob = "Required";
    if (!formData.gender) errs.gender = "Required";
    if (!formData.visaStartDate) errs.visaStartDate = "Required";
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // ── Always store dob and visaStartDate as YYYY-MM-DD (ISO) ──
    // input[type=date] already returns YYYY-MM-DD, this guards against any edge case
    const ensureISO = (dateStr) => {
      if (!dateStr) return "";
      const s = dateStr.trim();
      // Already YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      // DD/MM/YYYY → YYYY-MM-DD
      const dmy = s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
      if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
      // Fallback via Date object
      const parsed = new Date(s);
      if (!isNaN(parsed)) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, "0");
        const d = String(parsed.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
      return s;
    };

    const cleanedForm = {
      ...formData,
      dob: ensureISO(formData.dob),
      visaStartDate: ensureISO(formData.visaStartDate),
    };

    // ── 1. Update users array in sessionStorage ──
    const stored = sessionStorage.getItem("adminUsers");
    let users = stored ? JSON.parse(stored) : [];

    if (isEdit) {
      users = users.map((u) => (u.id === id ? { ...cleanedForm } : u));
    } else {
      const newUser = {
        ...cleanedForm,
        id: `u${Date.now()}`,
      };
      users = [...users, newUser];
    }

    sessionStorage.setItem("adminUsers", JSON.stringify(users));

    // ── 2. Download updated users.json to local system ──
    const jsonBlob = new Blob([JSON.stringify(users, null, 2)], {
      type: "application/json",
    });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement("a");
    jsonLink.href = jsonUrl;
    jsonLink.download = "users.json";
    jsonLink.click();
    URL.revokeObjectURL(jsonUrl);

    // ── 3. If a new PDF was uploaded, download it for placing in public/pdfs/ ──
    if (pdfFile) {
      const pdfUrl = URL.createObjectURL(pdfFile);
      const pdfLink = document.createElement("a");
      pdfLink.href = pdfUrl;
      pdfLink.download = pdfFile.name;
      pdfLink.click();
      URL.revokeObjectURL(pdfUrl);
    }

    setSaved(true);
    setTimeout(() => navigate("/admin/dashboard"), 1500);
  };

  return (
    <div className="auf-root">
      {/* ── Top Bar ── */}
      <header className="ad-topbar">
        <div className="ad-topbar-left">
          <span className="ad-topbar-icon">⚡</span>
          <span className="ad-topbar-title">RealMe Admin</span>
        </div>
        <div className="ad-topbar-right">
          <button
            className="ad-logout-btn"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="auf-main">
        <div className="auf-card">
          {/* Header */}
          <div className="auf-card-header">
            <div className="auf-card-icon">{isEdit ? "✏️" : "➕"}</div>
            <div>
              <h2 className="auf-card-title">
                {isEdit ? "Edit User" : "Add New User"}
              </h2>
              <p className="auf-card-sub">
                {isEdit
                  ? "Update the user's visa details below."
                  : "Fill in all details to create a new user record."}
              </p>
            </div>
          </div>

          {saved && (
            <div className="auf-success">
              ✅ Saved! Redirecting to dashboard…
            </div>
          )}

          <div className="auf-grid">
            {/* Family Name */}
            <div className="auf-field">
              <label className="auf-label">
                Family Name <span className="auf-req">*</span>
              </label>
              <input
                className={`auf-input ${errors.familyName ? "auf-input-err" : ""}`}
                type="text"
                value={formData.familyName}
                onChange={(e) => set("familyName", e.target.value)}
                placeholder="e.g. Sharma"
              />
              {errors.familyName && (
                <span className="auf-err-text">{errors.familyName}</span>
              )}
            </div>

            {/* Nationality */}
            <div className="auf-field">
              <label className="auf-label">
                Nationality <span className="auf-req">*</span>
              </label>
              <select
                className={`auf-input ${errors.nationality ? "auf-input-err" : ""}`}
                value={formData.nationality}
                onChange={(e) => set("nationality", e.target.value)}
              >
                <option value="">Select Nationality</option>
                <option value="Nepal">Nepal</option>
                <option value="New Zealand">New Zealand</option>
              </select>
              {errors.nationality && (
                <span className="auf-err-text">{errors.nationality}</span>
              )}
            </div>

            {/* Passport Number */}
            <div className="auf-field">
              <label className="auf-label">
                Passport Number <span className="auf-req">*</span>
              </label>
              <input
                className={`auf-input ${errors.passportNumber ? "auf-input-err" : ""}`}
                type="text"
                value={formData.passportNumber}
                onChange={(e) => set("passportNumber", e.target.value)}
                placeholder="e.g. NP456789"
              />
              {errors.passportNumber && (
                <span className="auf-err-text">{errors.passportNumber}</span>
              )}
            </div>

            {/* Date of Birth */}
            <div className="auf-field">
              <label className="auf-label">
                Date of Birth <span className="auf-req">*</span>
              </label>
              <input
                className={`auf-input ${errors.dob ? "auf-input-err" : ""}`}
                type="date"
                value={formData.dob}
                onChange={(e) => set("dob", e.target.value)}
              />
              {formData.dob && !errors.dob && (
                <span className="auf-dob-preview">
                  Stored as: {formData.dob} &nbsp;|&nbsp; Displays as:{" "}
                  {(() => {
                    const [y, m, d] = formData.dob.split("-");
                    return d && m && y ? `${d}/${m}/${y}` : formData.dob;
                  })()}
                </span>
              )}
              {errors.dob && <span className="auf-err-text">{errors.dob}</span>}
            </div>

            {/* Gender */}
            <div className="auf-field">
              <label className="auf-label">
                Gender <span className="auf-req">*</span>
              </label>
              <select
                className={`auf-input ${errors.gender ? "auf-input-err" : ""}`}
                value={formData.gender}
                onChange={(e) => set("gender", e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && (
                <span className="auf-err-text">{errors.gender}</span>
              )}
            </div>

            {/* Visa Start Date */}
            <div className="auf-field">
              <label className="auf-label">
                Visa Start Date <span className="auf-req">*</span>
              </label>
              <input
                className={`auf-input ${errors.visaStartDate ? "auf-input-err" : ""}`}
                type="date"
                value={formData.visaStartDate}
                onChange={(e) => set("visaStartDate", e.target.value)}
              />
              {errors.visaStartDate && (
                <span className="auf-err-text">{errors.visaStartDate}</span>
              )}
            </div>
          </div>

          {/* PDF Upload — full width */}
          <div className="auf-pdf-section">
            <label className="auf-label">
              Upload Visa PDF <span className="auf-optional">(optional)</span>
            </label>
            <div className="auf-pdf-box">
              <input
                type="file"
                accept=".pdf"
                id="pdf-upload"
                className="auf-pdf-input"
                onChange={handlePdfChange}
              />
              <label htmlFor="pdf-upload" className="auf-pdf-label">
                <span className="auf-pdf-icon">📎</span>
                {pdfPreviewName ? pdfPreviewName : "Click to choose a PDF file"}
              </label>
            </div>
            {pdfPreviewName && (
              <p className="auf-pdf-hint">
                ⚠️ After saving, place the downloaded PDF into{" "}
                <code>public/pdfs/</code> of your project.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="auf-actions">
            <button
              className="auf-cancel-btn"
              onClick={() => navigate("/admin/dashboard")}
            >
              Cancel
            </button>
            <button className="auf-save-btn" onClick={handleSave}>
              {isEdit ? "Update User" : "Create User"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

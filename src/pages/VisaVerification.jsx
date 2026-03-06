import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { getNames } from "country-list";
import ConfirmationModal from "../components/ConfirmationModal";
import seedUsers from "../data/users.json";

// ── Country names only, no flags ─────────────────────────────────────
const countryOptions = Object.values(getNames())
  .sort((a, b) => a.localeCompare(b))
  .map((name) => ({ value: name, label: name }));

// ── react-select styles matching existing .visa-field design ─────────
const selectStyles = {
  control: (base, state) => ({
    ...base,
    width: "100%",
    padding: "2px 4px",
    border: `1px solid ${state.isFocused ? "#0066cc" : "#ccc"}`,
    borderRadius: "4px",
    fontSize: "15px",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(0,102,204,0.12)" : "none",
    outline: "none",
    cursor: "text",
    minHeight: "42px",
    backgroundColor: "#fff",
    transition: "border-color 0.2s, box-shadow 0.2s",
    "&:hover": { borderColor: "#0066cc" },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "6px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
    zIndex: 100,
    fontSize: "15px",
    marginTop: "4px",
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: "220px",
    padding: "4px",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#0066cc"
      : state.isFocused
        ? "#eef5ff"
        : "transparent",
    color: state.isSelected ? "#fff" : "#333",
    borderRadius: "4px",
    padding: "8px 12px",
    cursor: "pointer",
  }),
  placeholder: (base) => ({ ...base, color: "#aaa" }),
  singleValue: (base) => ({ ...base, color: "#333" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, color: "#aaa", padding: "0 6px" }),
};

// ── Normalize any date string → YYYY-MM-DD ───────────────────────────
function normalizeDob(raw) {
  if (!raw) return "";
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const dmy = s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  const parsed = new Date(s);
  if (!isNaN(parsed)) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return s;
}

export default function VisaVerification({ onBack }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    familyName: "",
    nationality: null, // react-select { value, label }
    passportNumber: "",
    dob: "",
    gender: "",
    visaStartDate: "",
    consent: true,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const handleOpenModal = (e) => {
    e.preventDefault();
    setLookupError("");
    setIsModalOpen(true);
  };

  const handleFinalSubmit = () => {
    setIsModalOpen(false);

    const stored = sessionStorage.getItem("adminUsers");
    const users = stored ? JSON.parse(stored) : seedUsers;

    const enteredDob = normalizeDob(formData.dob);
    const enteredPassport = formData.passportNumber.trim().toLowerCase();

    const match = users.find((u) => {
      const storedDob = normalizeDob(u.dob);
      const storedPassport = u.passportNumber.trim().toLowerCase();
      return storedPassport === enteredPassport && storedDob === enteredDob;
    });

    if (!match) {
      setLookupError(
        "No visa record found for the provided passport number and date of birth. Please check your details or contact support.",
      );
      return;
    }

    navigate("/view-pdf", {
      state: { pdfPath: match.pdfPath, userName: match.familyName },
    });
  };

  return (
    <div className="visa-container">
      <button className="back-btn" onClick={onBack}>
        <span className="arrow">←</span> Go Back
      </button>

      <h2 className="visa-header-title">Visa Verification Enquiry</h2>
      <p className="visa-instruction-text">
        Enter the details of the visa to be verified.
      </p>
      <p className="visa-instruction-text">
        Please enter these details exactly as they appear in the visa holder's
        current passport.
      </p>

      {lookupError && <div className="visa-lookup-error">⚠️ {lookupError}</div>}

      <form className="visa-form-box" onSubmit={handleOpenModal}>
        {/* Family Name */}
        <div className="visa-input-group">
          <label>
            Family Name <span className="req">*</span> :
          </label>
          <input
            type="text"
            className="visa-field"
            value={formData.familyName}
            onChange={(e) =>
              setFormData({ ...formData, familyName: e.target.value })
            }
            required
          />
        </div>

        {/* Nationality — searchable country list, names only */}
        <div className="visa-input-group">
          <label>
            Passport Nationality <span className="req">*</span> :
          </label>
          <Select
            options={countryOptions}
            value={formData.nationality}
            onChange={(opt) => setFormData({ ...formData, nationality: opt })}
            styles={selectStyles}
            placeholder="Search nationality…"
            isSearchable
          />
          <input
            tabIndex={-1}
            style={{ opacity: 0, height: 0, position: "absolute" }}
            value={formData.nationality?.value || ""}
            required
            onChange={() => {}}
          />
        </div>

        {/* Passport Number */}
        <div className="visa-input-group">
          <label>
            Passport Number <span className="req">*</span> :
          </label>
          <input
            type="text"
            className="visa-field"
            value={formData.passportNumber}
            onChange={(e) =>
              setFormData({ ...formData, passportNumber: e.target.value })
            }
            required
          />
        </div>

        {/* Date of Birth — original native date input */}
        <div className="visa-input-group">
          <label>
            Date of Birth <span className="req">*</span> :
          </label>
          <input
            type="date"
            className="visa-field"
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            required
          />
        </div>

        {/* Gender */}
        <div className="visa-input-group">
          <label>
            Gender <span className="req">*</span> :
          </label>
          <select
            className="visa-field"
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Visa Start Date — original native date input */}
        <div className="visa-input-group">
          <label>
            Visa Start Date <span className="req">*</span> :
          </label>
          <input
            type="date"
            className="visa-field"
            value={formData.visaStartDate}
            onChange={(e) =>
              setFormData({ ...formData, visaStartDate: e.target.value })
            }
            required
          />
        </div>

        {/* Consent */}
        <div className="visa-consent-section">
          <input
            type="checkbox"
            id="consent-check"
            checked={formData.consent}
            onChange={(e) =>
              setFormData({ ...formData, consent: e.target.checked })
            }
            required
          />
          <label htmlFor="consent-check">
            The visa holder has consented to this check.
          </label>
        </div>

        <button type="submit" className="visa-submit-btn">
          Check Visa Status
        </button>
      </form>

      <ConfirmationModal
        isOpen={isModalOpen}
        onConfirm={handleFinalSubmit}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}

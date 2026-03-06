import { useNavigate, useLocation } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

export default function PdfView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Get pdfPath and userName passed via navigate state
  const pdfPath = location.state?.pdfPath || null;

  // Redirect if accessed directly with no state
  useEffect(() => {
    if (!pdfPath) {
      navigate("/");
    }
  }, [pdfPath, navigate]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!pdfPath) return null;

  return (
    <div className="pdfview-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <span className="arrow">←</span> Go Back
      </button>

      <h2 className="visa-header-title">Visa Verification Document</h2>
      <p className="visa-instruction-text">
        Your visa document is displayed below.
      </p>

      {loading && (
        <div className="pdfview-loading">
          <div className="pdfview-spinner" />
          <span>Loading document…</span>
        </div>
      )}

      <div
        className="pdfview-frame-wrapper"
        style={{ display: loading ? "none" : "block" }}
      >
        {isMobile ? (
          <object
            data={pdfPath}
            type="application/pdf"
            className="pdfview-object"
            onLoad={() => setLoading(false)}
          >
            <div className="pdfview-fallback">
              <p>Your browser cannot display the PDF inline.</p>
              <a href={pdfPath} download className="pdfview-download-btn">
                ⬇ Download PDF to View
              </a>
            </div>
          </object>
        ) : (
          <iframe
            src={pdfPath}
            title="Visa Document"
            className="pdfview-iframe"
            onLoad={() => setLoading(false)}
          />
        )}
      </div>

      <div className="pdfview-actions">
        <a href={pdfPath} download className="pdfview-download-btn">
          ⬇ Download PDF
        </a>
      </div>
    </div>
  );
}

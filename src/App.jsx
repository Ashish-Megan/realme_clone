import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import VisaRouter from "./VisaRouter";
import InProgress from "./pages/InProgress";
import ForgotScreen from "./pages/ForgotScreen";
import PdfView from "./pages/PdfView";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserForm from "./pages/AdminUserForm";
import "./index.css";

export default function App() {
  return (
    <Router>
      <div
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        {/* Hide header/footer on admin pages */}
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<Header />} />
        </Routes>

        <main style={{ flexGrow: 1 }}>
          <Routes>
            {/* ── Public routes ── */}
            <Route path="/" element={<VisaRouter />} />
            <Route path="/forgot" element={<ForgotScreen />} />
            <Route path="/view-pdf" element={<PdfView />} />
            <Route
              path="/help"
              element={<InProgress title="Help & Contact" />}
            />
            <Route
              path="/terms"
              element={<InProgress title="Terms of Use" />}
            />
            <Route
              path="/privacy"
              element={<InProgress title="Privacy Policy" />}
            />
            <Route
              path="/about"
              element={<InProgress title="About RealMe" />}
            />

            {/* ── Admin routes (no header/footer) ── */}
            {/* <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/user/new" element={<AdminUserForm />} />
            <Route path="/admin/user/edit/:id" element={<AdminUserForm />} /> */}
          </Routes>
        </main>

        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<Footer />} />
        </Routes>
      </div>
    </Router>
  );
}

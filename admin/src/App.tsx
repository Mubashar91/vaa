import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminShell from "./AdminShell";
import AdminPricing from "./AdminPricing";
import AdminHowItWorks from "./AdminHowItWorks";
import AdminFAQ from "./AdminFAQ";
import AdminServices from "./AdminServices";
import AdminTestimonials from "./AdminTestimonials";
import AdminBlog from "./AdminBlog";
import AdminCaseStudy from "./AdminCaseStudy";
import AdminHero from "./AdminHero";
import AdminWhyChooseUs from "./AdminWhyChooseUs";
import AdminFooter from "./AdminFooter";
import AdminLogin from "./auth/AdminLogin";
import RequireAdmin from "./auth/RequireAdmin";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/signup" element={<AdminLogin />} />
      <Route
        path="/"
        element={
          <RequireAdmin>
            <AdminShell />
          </RequireAdmin>
        }
      >
        <Route index element={<Navigate to="/pricing" replace />} />
        <Route path="pricing" element={<AdminPricing />} />
        <Route path="how-it-works" element={<AdminHowItWorks />} />
        <Route path="faq" element={<AdminFAQ />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="blogs" element={<AdminBlog />} />
        <Route path="case-studies" element={<AdminCaseStudy />} />
        <Route path="hero" element={<AdminHero />} />
        <Route path="why-choose-us" element={<AdminWhyChooseUs />} />
        <Route path="footer" element={<AdminFooter />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;


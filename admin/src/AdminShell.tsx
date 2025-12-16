import { Outlet, NavLink } from "react-router-dom";

export default function AdminShell() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0b1220' }}>
      <aside style={{ width: 220, padding: 16, background: '#0f172a', color: '#e2e8f0' }}>
        <h2 style={{ fontWeight: 800, marginBottom: 12 }}>Admin</h2>
        <nav style={{ display: 'grid', gap: 8 }}>
          <NavLink to="/pricing">Pricing</NavLink>
          <NavLink to="/how-it-works">How it works</NavLink>
          <NavLink to="/faq">FAQ</NavLink>
          <NavLink to="/services">Services</NavLink>
          <NavLink to="/testimonials">Testimonials</NavLink>
          <NavLink to="/blogs">Blogs</NavLink>
          <NavLink to="/case-studies">Case studies</NavLink>
          <NavLink to="/hero">Hero</NavLink>
          <NavLink to="/why-choose-us">Why choose us</NavLink>
          <NavLink to="/footer">Footer</NavLink>
        </nav>
      </aside>
      <main style={{ flex: 1, background: '#0b1220', color: '#e5e7eb' }}>
        <div style={{ padding: 24 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

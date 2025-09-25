import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css"; // make sure the CSS below lives here (or import your existing one)

function useStaggerIn(delayMs = 300, stepMs = 150) {
  return (refs) => {
    refs.forEach((ref, i) => {
      const el = ref.current;
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(40px)";
      setTimeout(() => {
        el.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, delayMs + i * stepMs);
    });
  };
}

function AccessCard({ variant, icon, title, desc, onClick, refObj }) {
  return (
    <div
      ref={refObj}
      className={`access-card ${variant}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => ((e.key === "Enter" || e.key === " ") && onClick())}
      aria-label={`${title} available`}
    >
      <div className="card-header">
        <div className="card-icon" aria-hidden="true">{icon}</div>
        <div className="card-content">
          <h2 className="card-title">{title}</h2>
          <p className="card-description">{desc}</p>
        </div>
      </div>
      <div className="card-footer">
        <div className="status-indicator status-available">✓ Available</div>
        <div className="access-arrow">→</div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  // refs for stagger animation
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const runStagger = useStaggerIn();

  useEffect(() => {
    // header + footer entrance
    const header = document.querySelector(".header");
    const footer = document.querySelector(".footer");
    header?.classList.add("fade-in");
    setTimeout(() => footer?.classList.add("slide-up"), 300 + refs.length * 150);
    // cards stagger
    runStagger(refs);
  }, []); // eslint-disable-line

  return (
    <>
      <div className="bg-decoration" />

      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="logo-container">
            <div className="logo">STL</div>
          </div>
          <h1 className="title">STL Gaming System</h1>
          <p className="subtitle">Select your access level to continue to your dashboard</p>
        </header>

        {/* Dashboard Grid */}
        <main className="dashboard-grid">
          <AccessCard
            variant="super-admin"
            icon="👑"
            title="Super Admin"
            desc="Complete system oversight with full administrative privileges and comprehensive control."
            onClick={() => navigate("/super-admin")}
            refObj={refs[0]}
          />

          <AccessCard
            variant="system-operator"
            icon="⚙️"
            title="Game Administrator"
            desc="Technical operations, system maintenance, and infrastructure management tools."
            onClick={() => navigate("/game-administrator")}
            refObj={refs[1]}
          />

          <AccessCard
            variant="collector"
            icon="📊"
            title="Collector"
            desc="Revenue collection, financial reporting, and comprehensive transaction oversight."
            onClick={() => navigate("/collector")}
            refObj={refs[2]}
          />

          <AccessCard
            variant="sales-monitoring"
            icon="📈"
            title="Operation Support"
            desc="Track real-time ticket sales, monitor agent performance, and view daily totals."
            onClick={() => navigate("/operation-support")}
            refObj={refs[3]}
          />

          <AccessCard
            variant="teller"
            icon="🎯"
            title="Teller Agent"
            desc="Process transactions, create tickets, and manage daily operational activities."
            onClick={() => navigate("/teller")}
            refObj={refs[4]}
          />
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <p className="footer-text">STL Gaming System Dashboard</p>
            <p className="footer-subtext">Philippine Charity Sweepstakes Office • Secure Access Portal</p>
          </div>
        </footer>
      </div>
    </>
  );
}

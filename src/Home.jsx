import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

function AccessCard({ variant, icon, title, desc, onClick, refObj, delay }) {
  useEffect(() => {
    const el = refObj.current;
    if (!el) return;

    // Use requestAnimationFrame for better performance
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        el.classList.add('is-visible');
      });
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [refObj, delay]);

  return (
    <div
      ref={refObj}
      className={`access-card ${variant}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
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
  const headerRef = useRef(null);
  const footerRef = useRef(null);

  // Card refs
  const cardRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  useEffect(() => {
    // Use requestAnimationFrame for smooth animations
    const timeoutIds = [];

    // Animate header
    const headerTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        headerRef.current?.classList.add('is-visible');
      });
    }, 100);
    timeoutIds.push(headerTimeout);

    // Animate footer after cards
    const footerDelay = 300 + cardRefs.length * 150;
    const footerTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        footerRef.current?.classList.add('is-visible');
      });
    }, footerDelay);
    timeoutIds.push(footerTimeout);

    // Cleanup
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, []);

  const cards = [
    {
      variant: "super-admin",
      icon: "👑",
      title: "Super Admin",
      desc: "Complete system oversight with full administrative privileges and comprehensive control.",
      path: "/super-admin"
    },
    {
      variant: "system-operator",
      icon: "⚙️",
      title: "Game Administrator",
      desc: "Technical operations, system maintenance, and infrastructure management tools.",
      path: "/game-administrator"
    },
        {
      variant: "sales-monitoring",
      icon: "📈",
      title: "Operation Support",
      desc: "Track real-time ticket sales, monitor agent performance, and view daily totals.",
      path: "/operation-support"
    },
    {
      variant: "collector",
      icon: "📊",
      title: "Collector",
      desc: "Revenue collection, financial reporting, and comprehensive transaction oversight.",
      path: "/collector"
    },
    {
      variant: "teller",
      icon: "🎯",
      title: "Teller Agent",
      desc: "Process transactions, create tickets, and manage daily operational activities.",
      path: "/teller"
    }
  ];

  return (
    <>
      <div className="bg-decoration" />

      <div className="container">
        {/* Header */}
        <header ref={headerRef} className="main-header">
          <div className="logo-container">
            <div className="logo">STL</div>
          </div>
          <h1 className="title">STL Gaming System</h1>
          <p className="subtitle">Select your access level to continue to your dashboard</p>
        </header>

        {/* Dashboard Grid */}
        <main className="dashboard-grid">
          {cards.map((card, index) => (
            <AccessCard
              key={card.variant}
              variant={card.variant}
              icon={card.icon}
              title={card.title}
              desc={card.desc}
              onClick={() => navigate(card.path)}
              refObj={cardRefs[index]}
              delay={300 + index * 150}
            />
          ))}
        </main>

        {/* Footer */}
        <footer ref={footerRef} className="footer">
          <div className="footer-content">
            <p className="footer-text">STL Gaming System Dashboard</p>
            <p className="footer-subtext">Philippine Charity Sweepstakes Office • Secure Access Portal</p>
          </div>
        </footer>
      </div>
    </>
  );
}
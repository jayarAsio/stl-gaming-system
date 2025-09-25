import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/dashboard.css";

/** ---------- Helpers ---------- */
const peso = (n) =>
  `₱${Number(n || 0).toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;

const initials = (name = "") => {
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  const i = (first + last).toUpperCase();
  return i || "XX";
};

/** ---------- Demo/Fallback Data (swap with API) ---------- */
const demoCollector = { name: "Maria Cruz", code: "C001", status: "ON DUTY" };
const demoStats = { collections: 45250, payouts_tapal: 16250, tellers: 12 };
const demoSchedule = [
  { variant: "variant-a", title: "Swertres", times: ["2:00 PM — Open", "5:00 PM — Open", "9:00 PM — Open"] },
  { variant: "variant-b", title: "Last 2",   times: ["3:00 PM — Open", "7:00 PM — Open"] },
  { variant: "variant-c", title: "STL Pares",times: ["10:30 AM — Closed", "4:00 PM — Open", "8:00 PM — Open"] },
];

export default function Dashboard({
  collector = demoCollector,
  stats: initialStats = demoStats,
  schedule = demoSchedule,
}) {
  // Full-bleed background (matches Teller)
  useEffect(() => {
    document.body.classList.add("collector-bg");
    return () => document.body.classList.remove("collector-bg");
  }, []);

  // Live-updating collections (demo)
  const [stats, setStats] = useState(initialStats);
  useEffect(() => {
    const id = setInterval(() => {
      setStats((s) => {
        const delta = Math.floor(Math.random() * 5000);
        return { ...s, collections: s.collections + delta };
      });
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const collectorInitials = useMemo(() => initials(collector.name), [collector.name]);

  return (
    <div className="collector-container" aria-live="polite">
      {/* Header */}
      <header className="collector-header">
        <h1>💰 Collector Dashboard</h1>
        <div className="user-info" aria-label="Collector status">
          <div className="user-avatar" aria-hidden="true">{collectorInitials}</div>
          <div className="user-details">
            <div className="user-name">{collector.name}</div>
            <div className="user-role">Collector #{collector.code}</div>
          </div>
          <div className="status-badge">{collector.status}</div>
        </div>
      </header>

      {/* Stats */}
      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">Today's Collection Stats</h2>
        <div className="stats-grid">
          <Stat icon="💵" value={peso(stats.collections)} label="Collections" live />
          <Stat icon="🎯" value={peso(stats.payouts_tapal)} label="Payouts / Tapal" />
          <Stat icon="👥" value={String(stats.tellers)} label="Tellers" />
        </div>
      </section>

      {/* Cards */}
      <main className="bento-grid">
        <Tile
          to="/collector/sales-collection"
          icon="💰"
          title="Sales Collection"
          desc="Collect remittances from tellers and update ledger records."
          cta="Collect Sales"
        />
        <Tile
          to="/collector/payouts-tapal"
          icon="🎯"
          title="Payouts & Tapal"
          desc="Process winner payouts or issue tapal for insufficient funds."
          cta="Process Payouts"
        />
        <Tile
          to="/collector/reports-winners"
          icon="📊"
          title="Reports & Winners"
          desc="Generate remittance and combined payouts/tapal reports."
          cta="View Reports"
        />

        {/* Schedule */}
        <section className="bento-card large" aria-labelledby="schedule-title">
          <div className="card-icon" aria-hidden="true">📅</div>
          <div className="card-title" id="schedule-title">Today's Draw Schedule</div>
          <div className="card-description">Upcoming draws for all games</div>

          <div className="schedule-grid">
            {schedule.map((block, i) => (
              <div className={`schedule-card ${block.variant}`} key={i}>
                <div className="schedule-title">{block.title}</div>
                {block.times.map((t, j) => (
                  <div className="schedule-time" key={j}>{t}</div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

/** ---------- Small UI Bits ---------- */
function Stat({ icon, value, label, live = false }) {
  return (
    <div className="stat-card" aria-live={live ? "polite" : undefined}>
      <div className="stat-icon" aria-hidden="true">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Tile({ to, icon, title, desc, cta }) {
  return (
    <Link className="bento-card" to={to} aria-label={title}>
      <div className="card-icon" aria-hidden="true">{icon}</div>
      <div className="card-title">{title}</div>
      <div className="card-description">{desc}</div>
      <span className="card-cta" aria-hidden="true">{cta} →</span>
    </Link>
  );
}

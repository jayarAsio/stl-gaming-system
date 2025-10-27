import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import "../styles/dashboard.css";

/** ---------- Helpers ---------- */
const peso = (n) =>
  `₱${Number(n || 0).toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
const num = (n) => Number(n || 0).toLocaleString();

const initials = (name = "") => {
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  const i = (first + last).toUpperCase();
  return i || "XX";
};

// Time helpers (enhanced from teller dashboard)
const formatTime = (date) =>
  date.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const formatCountdown = (ms) => {
  if (ms <= 0) return "00:00:00";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

// Date and time helpers for header
const formatHeaderDate = (date) =>
  date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
const formatHeaderTime = (date) =>
  date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

/** ---------- Demo/Fallback Data (enhanced with draw schedule) ---------- */
const demoCollector = { name: "Maria Cruz", code: "C001", status: "ON DUTY" };
const demoStats = {
  collections: 45250,
  payouts_tapal: 16250,
  tellers: 12,
  processed_payouts: 8,
};

// Enhanced schedule with draw times and results (persistent until midnight)
const createDemoSchedule = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return [
    {
      title: "Swertres",
      variant: "variant-a",
      draws: [
        {
          time: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2:00 PM
          result:
            now >= new Date(today.getTime() + 14 * 60 * 60 * 1000)
              ? "1-2-3"
              : null,
          status:
            now >= new Date(today.getTime() + 14 * 60 * 60 * 1000)
              ? "completed"
              : "upcoming",
        },
        {
          time: new Date(today.getTime() + 17 * 60 * 60 * 1000), // 5:00 PM
          result:
            now >= new Date(today.getTime() + 17 * 60 * 60 * 1000)
              ? "4-5-6"
              : null,
          status:
            now >= new Date(today.getTime() + 17 * 60 * 60 * 1000)
              ? "completed"
              : "upcoming",
        },
        {
          time: new Date(today.getTime() + 21 * 60 * 60 * 1000), // 9:00 PM
          result:
            now >= new Date(today.getTime() + 21 * 60 * 60 * 1000)
              ? "7-8-9"
              : null,
          status:
            now >= new Date(today.getTime() + 21 * 60 * 60 * 1000)
              ? "completed"
              : "upcoming",
        },
      ],
    },
    {
      title: "Last 2",
      variant: "variant-b",
      draws: [
        {
          time: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 3:00 PM
          result:
            now >= new Date(today.getTime() + 15 * 60 * 60 * 1000)
              ? "12"
              : null,
          status:
            now >= new Date(today.getTime() + 15 * 60 * 60 * 1000)
              ? "completed"
              : "upcoming",
        },
        {
          time: new Date(today.getTime() + 19 * 60 * 60 * 1000), // 7:00 PM
          result:
            now >= new Date(today.getTime() + 19 * 60 * 60 * 1000)
              ? "34"
              : null,
          status:
            now >= new Date(today.getTime() + 19 * 60 * 60 * 1000)
              ? "completed"
              : "upcoming",
        },
      ],
    },
    {
      title: "STL Pares",
      variant: "variant-c",
      draws: [
        {
          time: new Date(today.getTime() + 10.5 * 60 * 60 * 1000), // 10:30 AM
          result:
            now >= new Date(today.getTime() + 10.5 * 60 * 60 * 1000)
              ? "01-15"
              : null,
          status:
            now >= new Date(today.getTime() + 10.5 * 60 * 60 * 1000)
              ? "completed"
              : "upcoming",
        },
        {
          time: new Date(today.getTime() + 16 * 60 * 60 * 1000), // 4:00 PM
          result:
            now >= new Date(today.getTime() + 16 * 60 * 60 * 1000)
              ? "03-21"
              : null,
          status:
            now >= new Date(today.getTime() + 16 * 60 * 60 * 1000)
              ? "completed"
              : "upcoming",
        },
        {
          time: new Date(today.getTime() + 20 * 60 * 60 * 1000), // 8:00 PM
          result:
            now >= new Date(today.getTime() + 20 * 60 * 60 * 1000)
              ? "07-19"
              : null,
          status:
            now >= new Date(today.getTime() + 20 * 60 * 60 * 1000)
              ? "completed"
              : "upcoming",
        },
      ],
    },
  ];
};

export default function Dashboard({
  collector: propCollector = demoCollector,
  stats: initialStats = demoStats,
  schedule = createDemoSchedule(),
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Get authentication context
  const { user: authUser, logout, isAuthenticated, loading } = useAuth();

  // Derive collector info from authenticated user
  const collector = authUser
    ? {
        name: authUser.fullName || "Collector",
        code: authUser.id || "C001",
        status: "ON DUTY",
        email: authUser.email,
      }
    : propCollector;

  // Check authentication on mount
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Handle logout
  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      setProfileMenuOpen(false);
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen]);

  // Close profile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && profileMenuOpen) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [profileMenuOpen]);

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Full-bleed background
  useEffect(() => {
    document.body.classList.add("collector-bg");
    return () => document.body.classList.remove("collector-bg");
  }, []);

  // Live-updating collections
  const [stats, setStats] = useState(initialStats);
  useEffect(() => {
    const id = setInterval(() => {
      setStats((s) => {
        const collectionDelta = Math.floor(Math.random() * 5000);
        const payoutDelta = Math.floor(Math.random() * 2000);
        return {
          ...s,
          collections: s.collections + collectionDelta,
          payouts_tapal: s.payouts_tapal + payoutDelta,
          processed_payouts: s.processed_payouts + (Math.random() > 0.7 ? 1 : 0),
        };
      });
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const collectorInitials = useMemo(
    () => initials(collector.name),
    [collector.name]
  );

  const toggleProfileMenu = () => {
    setProfileMenuOpen((prev) => !prev);
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          fontSize: "1.25rem",
          color: "#6b7280",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className="collector-container" aria-live="polite">
      {/* Enhanced Header with Live Time and Profile Menu */}
      <header className="collector-header">
        <h1>💰 Collector Dashboard</h1>
        <div className="header-right">
          <div
            ref={profileRef}
            className={`user-info ${profileMenuOpen ? "menu-open" : ""}`}
            aria-label="Collector status"
            onClick={toggleProfileMenu}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleProfileMenu();
              }
            }}
          >
            <div className="user-avatar" aria-hidden="true">
              {collectorInitials}
            </div>
            <div className="user-details">
              <div className="user-name">{collector.name}</div>
              <div className="user-role">Collector #{collector.code}</div>
            </div>
            <div className="status-badge">{collector.status}</div>

            {/* Dropdown Chevron Arrow */}
            <span className="profile-chevron" aria-hidden="true"></span>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="collector-profile-menu">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  disabled={loggingOut}
                  type="button"
                >
                  <span>🚪</span>
                  <span>{loggingOut ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            )}
          </div>
          <div className="datetime-pill">
            {formatHeaderDate(currentTime)} • {formatHeaderTime(currentTime)}
          </div>
        </div>
      </header>

      {/* Enhanced Stats */}
      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">
          Today&apos;s Collection Stats
        </h2>
        <div className="stats-grid">
          <Stat icon="💵" value={peso(stats.collections)} label="Collections" live />
          <Stat icon="🎯" value={peso(stats.payouts_tapal)} label="Payouts / Tapal" live />
          <Stat icon="👥" value={num(stats.tellers)} label="Active Tellers" />
          <Stat icon="✅" value={num(stats.processed_payouts)} label="Processed Today" />
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
          to="/collector/reports"
          icon="📊"
          title="Reports"
          desc="Generate remittance and combined payouts/tapal reports."
          cta="View Reports"
        />

        {/* Enhanced Schedule with Countdown */}
        <section className="bento-card large" aria-labelledby="schedule-title">
          <div className="card-icon" aria-hidden="true">
            📅
          </div>
          <div className="card-title" id="schedule-title">
            Today&apos;s Draw Schedule
          </div>
          <div className="card-description">Live countdown and results tracking</div>

          <div className="schedule-grid">
            {schedule.map((game, i) => (
              <ScheduleCard key={i} game={game} currentTime={currentTime} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

/** ---------- Enhanced UI Components ---------- */
function Stat({ icon, value, label, live = false }) {
  return (
    <div className="stat-card" aria-live={live ? "polite" : undefined}>
      <div className="stat-icon" aria-hidden="true">
        {icon}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// Imperative navigate version; keeps your existing CSS class names
function Tile({ to, icon, title, desc, cta }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="bento-card"
      aria-label={title}
      onClick={() => navigate(to)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(to);
        }
      }}
      style={{ position: "relative", zIndex: 2 }}
    >
      <div className="card-icon" aria-hidden="true">
        {icon}
      </div>
      <div className="card-title">{title}</div>
      <div className="card-description">{desc}</div>
      <span className="card-cta" aria-hidden="true">
        {cta} →
      </span>
    </button>
  );
}

// Enhanced Schedule Card with Countdown
function ScheduleCard({ game, currentTime }) {
  const upcomingDraw = game.draws.find(
    (draw) => draw.status === "upcoming" && draw.time > currentTime
  );

  return (
    <div className={`schedule-card ${game.variant}`}>
      <div className="schedule-title">{game.title}</div>

      {upcomingDraw && (
        <div className="schedule-countdown">
          <div className="countdown-label">Next Draw</div>
          <div className="countdown-time">{formatTime(upcomingDraw.time)}</div>
          <div className="countdown-timer">
            {formatCountdown(upcomingDraw.time - currentTime)}
          </div>
        </div>
      )}

      <div className="schedule-draws">
        {game.draws.map((draw, index) => (
          <div key={index} className={`schedule-draw ${draw.status}`}>
            <div className="draw-time">{formatTime(draw.time)}</div>
            {draw.status === "completed" && draw.result && (
              <div className="draw-result">
                <span className="result-label">Result:</span>
                <span className="result-numbers">{draw.result}</span>
              </div>
            )}
            {draw.status === "upcoming" && (
              <div className="draw-status">
                {draw === upcomingDraw ? "Next" : "Upcoming"}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

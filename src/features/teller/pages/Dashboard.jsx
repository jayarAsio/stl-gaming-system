// ============================================
// File: features/teller/pages/Dashboard.jsx
// Role: Teller layout + dashboard (renders children via useOutlet())
// ============================================

import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useOutlet } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import useAuth from "../../../hooks/useAuth";
import qrIconUrl from "/src/assets/qrcode.svg";
import "../styles/common.css";
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

// Time helpers
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

/** ---------- Demo/Fallback Data ---------- */
const demoUser = {
  initials: "JD",
  name: "Juan Dela Cruz",
  role: "Teller Agent #1234",
  status: "ACTIVE",
};
const demoStats = { sales: 12450, tickets: 87, commission: 1245, winners: 3 };

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
  user: propUser = demoUser,
  stats: initialStats = demoStats,
  schedule = createDemoSchedule(),
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [isScanButtonVisible, setIsScanButtonVisible] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [stats, setStats] = useState(initialStats);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const outlet = useOutlet(); // ← if a child route is active, this returns the element

  // Get authentication context
  const { user: authUser, logout, isAuthenticated, loading } = useAuth();

  // Derive user info from authenticated user
  const user = authUser
    ? {
        initials: initials(authUser.fullName || "User"),
        name: authUser.fullName || "Teller Agent",
        role: `Teller Agent #${authUser.id || "1234"}`,
        status: "ACTIVE",
        email: authUser.email,
      }
    : propUser;

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

  // Handle scroll-based button visibility
  useEffect(() => {
    let scrollTimeout;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Hide button when scrolling
      setIsScanButtonVisible(false);

      // Clear existing timeout
      clearTimeout(scrollTimeout);

      // Show button again after scroll stops (500ms delay)
      scrollTimeout = setTimeout(() => {
        setIsScanButtonVisible(true);
      }, 500);

      lastScrollY = currentScrollY;
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup function
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Optional page bg (matches your design)
  useEffect(() => {
    document.body.classList.add("teller-bg");
    return () => document.body.classList.remove("teller-bg");
  }, []);

  // Live-updating stats (demo)
  useEffect(() => {
    const id = setInterval(() => {
      setStats((s) => {
        const salesDelta = Math.floor(Math.random() * 1000);
        const ticketDelta = Math.random() > 0.7 ? 1 : 0;
        return {
          ...s,
          sales: s.sales + salesDelta,
          tickets: s.tickets + ticketDelta,
          commission: Math.floor((s.sales + salesDelta) * 0.1),
          winners: s.winners + (Math.random() > 0.9 ? 1 : 0),
        };
      });
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // QR Scanning Functions
  const openScanModal = () => {
    setShowScanModal(true);
    setScanResult(null);
    setScanError("");
    setIsScanning(true);
  };

  const closeScanModal = () => {
    setShowScanModal(false);
    setScanResult(null);
    setScanError("");
    setIsScanning(false);
  };

  const handleQRDetected = (result) => {
    if (result && result.text) {
      handleQRScan(result.text);
    }
  };

  const handleQRError = (error) => {
    console.error("QR Scanner Error:", error);
    setScanError(
      "Camera access denied or QR scanner error. Please check permissions."
    );
    setIsScanning(false);
  };

  const handleQRScan = async (qrData) => {
    setIsScanning(false);
    setScanError("");

    try {
      // Parse QR data
      const ticketData = JSON.parse(qrData);

      // Validate ticket structure
      if (!ticketData.id || !ticketData.bets || !ticketData.verified) {
        throw new Error("Invalid ticket format");
      }

      // Check authenticity
      const isAuthentic = ticketData.verified === true;

      // Check if ticket is winning
      const winningResults = checkWinningStatus(ticketData, schedule);

      setScanResult({
        authentic: isAuthentic,
        ticket: ticketData,
        winningResults,
      });
    } catch (error) {
      setScanError("Invalid QR code or ticket data. Please try again.");
      setIsScanning(true); // Allow retry
    }
  };

  const checkWinningStatus = (ticketData, gameSchedule) => {
    const results = [];

    // For each bet in the ticket
    ticketData.bets.forEach((bet) => {
      // Find the corresponding game in schedule
      const game = gameSchedule.find((g) => g.title === bet.game);

      if (game) {
        // Check each completed draw
        game.draws.forEach((draw) => {
          if (draw.status === "completed" && draw.result) {
            const isWinner = draw.result === bet.combo;

            results.push({
              game: bet.game,
              combo: bet.combo,
              drawResult: draw.result,
              isWinner: isWinner,
              payout: isWinner ? bet.amount * 20 : 0, // Example multiplier
            });
          }
        });
      }
    });

    return results;
  };

  const resetScanner = () => {
    setScanResult(null);
    setScanError("");
    setIsScanning(true);
  };

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
    <div className="container teller-page" aria-live="polite">
      {/* Header with Live Time and Profile Menu */}
      <header className="header teller-header">
        <h1>🎟️ Teller Dashboard</h1>
        <div className="header-right">
          <div
            ref={profileRef}
            className={`user-info ${profileMenuOpen ? "menu-open" : ""}`}
            aria-label="Teller status"
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
              {user.initials}
            </div>
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
            <div className="status-badge">{user.status}</div>

            {/* Dropdown Chevron Arrow */}
            <span className="profile-chevron" aria-hidden="true"></span>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="teller-profile-menu">
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

      {/* If no child route is active, show the dashboard stats + tiles + schedule */}
      {!outlet && (
        <>
          {/* Enhanced Stats */}
          <section aria-labelledby="stats-title">
            <h2 id="stats-title" className="sr-only">
              Today&apos;s Teller Stats
            </h2>
            <div className="stats-grid">
              <Stat icon="💵" value={peso(stats.sales)} label="Today's Sales" />
              <Stat icon="🎫" value={num(stats.tickets)} label="Tickets Sold" />
              <Stat
                icon="💰"
                value={peso(stats.commission)}
                label="Commission"
              />
              <Stat icon="🏆" value={num(stats.winners)} label="Winners" />
            </div>
          </section>

          {/* Cards + Schedule */}
          <main className="bento-grid">
            <Tile
              to="/teller/create-ticket"
              icon="🎫"
              title="Create Ticket"
              desc="Generate new betting tickets for customers with QR codes."
              cta="New Ticket"
            />
            <Tile
              to="/teller/check-winners"
              icon="🏆"
              title="Check Winners"
              desc="Scan tickets to verify winners and calculate payouts instantly."
              cta="Check Winners"
            />
            <Tile
              to="/teller/sales-report"
              icon="📊"
              title="Sales Report"
              desc="View detailed sales and commission reports for any date range."
              cta="View Reports"
            />
            <Tile
              to="/teller/void-request"
              icon="❌"
              title="Void Request"
              desc="Request to void a ticket within the allowed time window."
              cta="Request Void"
            />

            {/* Enhanced Schedule with Countdown */}
            <section className="bento-card large" aria-labelledby="schedule-title">
              <div className="card-icon" aria-hidden="true">
                📅
              </div>
              <div className="card-title" id="schedule-title">
                Today&apos;s Draw Schedule
              </div>
              <div className="card-description">
                Upcoming draws and results
              </div>

              <div className="schedule-grid">
                {schedule.map((game, i) => (
                  <ScheduleCard key={i} game={game} currentTime={currentTime} />
                ))}
              </div>
            </section>
          </main>
        </>
      )}

      {/* If a child route is active, render the child INSTEAD of the dashboard content */}
      {outlet && (
        <section className="teller-outlet" aria-label="Module Content">
          {outlet}
        </section>
      )}

      {/* Floating Scan Button with Auto-Hide (only show when on dashboard) */}
      {!outlet && (
        <button
          className={`floating-scan-btn ${!isScanButtonVisible ? "hidden" : ""}`}
          onClick={openScanModal}
          aria-label="Scan ticket QR code"
          title="Scan Ticket QR"
        >
          <img src={qrIconUrl} alt="QR" className="scan-icon" />
        </button>
      )}

      {/* QR Scan Modal */}
      {showScanModal && (
        <div
          className="scan-modal active"
          role="dialog"
          aria-modal="true"
          aria-label="Scan ticket QR code"
        >
          <div className="scan-container">
            <div className="scan-header">
              <div className="scan-title">Scan Ticket QR</div>
              <div className="scan-subtitle">
                Position QR code in camera view
              </div>
              <button
                className="close-btn"
                onClick={closeScanModal}
                aria-label="Close scanner"
              >
                ×
              </button>
            </div>

            <div className="scan-body">
              {!scanResult && (
                <div className="camera-section">
                  <div className="qr-scanner-container">
                    {isScanning && (
                      <Scanner
                        onDecode={handleQRDetected}
                        onError={handleQRError}
                        constraints={{
                          facingMode: "environment",
                        }}
                        scanDelay={300}
                        containerStyle={{
                          borderRadius: "12px",
                          overflow: "hidden",
                          position: "relative",
                          aspectRatio: "4/3",
                          maxHeight: "300px",
                        }}
                        videoStyle={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}

                    {isScanning && (
                      <div className="scan-overlay">
                        <div className="scan-frame"></div>
                        <div className="scan-instruction">
                          Position QR code within the frame
                        </div>
                      </div>
                    )}
                  </div>

                  {scanError && (
                    <div className="scan-error">
                      {scanError}
                      <button
                        className="retry-btn"
                        onClick={() => {
                          setScanError("");
                          setIsScanning(true);
                        }}
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}

              {scanResult && (
                <div className="scan-result">
                  <div
                    className={`authenticity-badge ${
                      scanResult.authentic ? "authentic" : "invalid"
                    }`}
                  >
                    {scanResult.authentic
                      ? "✅ AUTHENTIC TICKET"
                      : "❌ INVALID TICKET"}
                  </div>

                  <div className="ticket-info">
                    <div className="ticket-ref">REF: {scanResult.ticket.id}</div>
                    <div className="ticket-date">
                      {new Date(scanResult.ticket.timestamp).toLocaleString(
                        "en-PH"
                      )}
                    </div>
                    <div className="ticket-total">
                      Total: {peso(scanResult.ticket.total)}
                    </div>
                  </div>

                  <div className="winning-results">
                    <h3>Winning Check Results</h3>
                    {scanResult.winningResults.length === 0 ? (
                      <div className="no-results">
                        No completed draws found for this ticket
                      </div>
                    ) : (
                      <div className="results-list">
                        {scanResult.winningResults.map((result, index) => (
                          <div
                            key={index}
                            className={`result-item ${
                              result.isWinner ? "winner" : "non-winner"
                            }`}
                          >
                            <div className="result-game">{result.game}</div>
                            <div className="result-combo">
                              Bet: {result.combo}
                            </div>
                            <div className="result-draw">
                              Draw: {result.drawResult}
                            </div>
                            <div className="result-status">
                              {result.isWinner ? (
                                <span className="winner-badge">
                                  🏆 WINNER - {peso(result.payout)}
                                </span>
                              ) : (
                                <span className="non-winner-badge">No Win</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="scan-actions">
              <button className="scan-btn scan-btn-close" onClick={closeScanModal}>
                Close
              </button>
              {scanResult && (
                <button className="scan-btn scan-btn-new" onClick={resetScanner}>
                  Scan Another
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** ---------- UI Components ---------- */
function Stat({ icon, value, label }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" aria-hidden="true">
        {icon}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// Imperative navigate version
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
      <span className="card-action" aria-hidden="true">
        {cta} →
      </span>
    </button>
  );
}

function ScheduleCard({ game, currentTime }) {
  // Find the next upcoming draw
  const upcomingDraw = game.draws.find(
    (draw) => draw.status === "upcoming" && draw.time > currentTime
  );

  return (
    <div className={`schedule-card ${game.variant}`}>
      <div className="schedule-title">{game.title}</div>

      {/* Show countdown for next upcoming draw */}
      {upcomingDraw && (
        <div className="schedule-countdown">
          <div className="countdown-label">Next Draw</div>
          <div className="countdown-time">{formatTime(upcomingDraw.time)}</div>
          <div className="countdown-timer">
            {formatCountdown(upcomingDraw.time - currentTime)}
          </div>
        </div>
      )}

      {/* Show all draws with their status */}
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
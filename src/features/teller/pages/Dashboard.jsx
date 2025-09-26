import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import qrIconUrl from "/src/assets/qrcode.svg";
import "../styles/dashboard.css";


// helpers
const peso = (n) => `₱${Number(n || 0).toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
const num  = (n) => Number(n || 0).toLocaleString();

// time helpers
const formatTime = (date) => date.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", hour12: true });
const formatCountdown = (ms) => {
  if (ms <= 0) return "00:00:00";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// date and time helpers for header
const formatHeaderDate = (date) => date.toLocaleDateString("en-PH", { 
  month: "short", 
  day: "numeric", 
  year: "numeric" 
});
const formatHeaderTime = (date) => date.toLocaleTimeString("en-PH", { 
  hour: "numeric", 
  minute: "2-digit", 
  hour12: true 
});

// demo/fallback data (replace with API or state)
const demoUser = { initials: "JD", name: "Juan Dela Cruz", role: "Teller Agent #1234", status: "ACTIVE" };
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
          result: now >= new Date(today.getTime() + 14 * 60 * 60 * 1000) ? "1-2-3" : null,
          status: now >= new Date(today.getTime() + 14 * 60 * 60 * 1000) ? "completed" : "upcoming"
        },
        { 
          time: new Date(today.getTime() + 17 * 60 * 60 * 1000), // 5:00 PM
          result: now >= new Date(today.getTime() + 17 * 60 * 60 * 1000) ? "4-5-6" : null,
          status: now >= new Date(today.getTime() + 17 * 60 * 60 * 1000) ? "completed" : "upcoming"
        },
        { 
          time: new Date(today.getTime() + 21 * 60 * 60 * 1000), // 9:00 PM
          result: now >= new Date(today.getTime() + 21 * 60 * 60 * 1000) ? "7-8-9" : null,
          status: now >= new Date(today.getTime() + 21 * 60 * 60 * 1000) ? "completed" : "upcoming"
        }
      ]
    },
    { 
      title: "Last 2", 
      variant: "variant-b", 
      draws: [
        { 
          time: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 3:00 PM
          result: now >= new Date(today.getTime() + 15 * 60 * 60 * 1000) ? "12" : null,
          status: now >= new Date(today.getTime() + 15 * 60 * 60 * 1000) ? "completed" : "upcoming"
        },
        { 
          time: new Date(today.getTime() + 19 * 60 * 60 * 1000), // 7:00 PM
          result: now >= new Date(today.getTime() + 19 * 60 * 60 * 1000) ? "34" : null,
          status: now >= new Date(today.getTime() + 19 * 60 * 60 * 1000) ? "completed" : "upcoming"
        }
      ]
    },
    { 
      title: "STL Pares", 
      variant: "variant-c", 
      draws: [
        { 
          time: new Date(today.getTime() + 10.5 * 60 * 60 * 1000), // 10:30 AM
          result: now >= new Date(today.getTime() + 10.5 * 60 * 60 * 1000) ? "01-15" : null,
          status: now >= new Date(today.getTime() + 10.5 * 60 * 60 * 1000) ? "completed" : "upcoming"
        },
        { 
          time: new Date(today.getTime() + 16 * 60 * 60 * 1000), // 4:00 PM
          result: now >= new Date(today.getTime() + 16 * 60 * 60 * 1000) ? "03-21" : null,
          status: now >= new Date(today.getTime() + 16 * 60 * 60 * 1000) ? "completed" : "upcoming"
        },
        { 
          time: new Date(today.getTime() + 20 * 60 * 60 * 1000), // 8:00 PM
          result: now >= new Date(today.getTime() + 20 * 60 * 60 * 1000) ? "07-19" : null,
          status: now >= new Date(today.getTime() + 20 * 60 * 60 * 1000) ? "completed" : "upcoming"
        }
      ]
    }
  ];
};

export default function Dashboard({
  user = demoUser,
  stats = demoStats,
  schedule = createDemoSchedule(),
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // optional page bg (matches your design)
  useEffect(() => {
    document.body.classList.add("teller-bg");
    return () => document.body.classList.remove("teller-bg");
  }, []);

  // QR Scanning Functions
  const openScanModal = () => {
    setShowScanModal(true);
    setScanResult(null);
    setScanError('');
    setIsScanning(true);
  };

  const closeScanModal = () => {
    setShowScanModal(false);
    setScanResult(null);
    setScanError('');
    setIsScanning(false);
  };

  const handleQRDetected = (result) => {
    if (result && result.text) {
      handleQRScan(result.text);
    }
  };

  const handleQRError = (error) => {
    console.error('QR Scanner Error:', error);
    setScanError('Camera access denied or QR scanner error. Please check permissions.');
    setIsScanning(false);
  };

  const handleQRScan = async (qrData) => {
    setIsScanning(false);
    setScanError('');
    
    try {
      // Parse QR data
      const ticketData = JSON.parse(qrData);
      
      // Validate ticket structure
      if (!ticketData.id || !ticketData.bets || !ticketData.verified) {
        throw new Error('Invalid ticket format');
      }

      // Check authenticity
      const isAuthentic = ticketData.verified === true;
      
      // Check if ticket is winning
      const winningResults = checkWinningStatus(ticketData, schedule);
      
      setScanResult({
        authentic: isAuthentic,
        ticket: ticketData,
        winningResults
      });
      
    } catch (error) {
      setScanError('Invalid QR code or ticket data. Please try again.');
      setIsScanning(true); // Allow retry
    }
  };

  const checkWinningStatus = (ticketData, gameSchedule) => {
    const results = [];
    
    ticketData.bets?.forEach(bet => {
      // Find the game in schedule
      const game = gameSchedule.find(g => 
        g.title.toLowerCase().includes(bet.game.toLowerCase()) ||
        bet.game.toLowerCase().includes(g.title.toLowerCase())
      );
      
      if (game) {
        // Find completed draws for this game
        const completedDraws = game.draws.filter(draw => 
          draw.status === 'completed' && draw.result
        );
        
        completedDraws.forEach(draw => {
          const isWinner = checkIfWinning(bet, draw.result);
          results.push({
            game: bet.game,
            combo: bet.combo,
            amount: bet.amount,
            drawTime: formatTime(draw.time),
            drawResult: draw.result,
            isWinner,
            payout: isWinner ? calculatePayout(bet, bet.game) : 0
          });
        });
      }
    });
    
    return results;
  };

  const checkIfWinning = (bet, drawResult) => {
    const betCombo = bet.combo.replace(/[.-]/g, '');
    const result = drawResult.replace(/[.-]/g, '');
    
    // Simple matching logic - can be enhanced based on game rules
    return betCombo === result;
  };

  const calculatePayout = (bet, game) => {
    // Demo payout calculation - replace with actual game rules
    const multipliers = {
      'Swertres': 500,
      'Last 2': 80,
      'STL Pares': 700,
      'Swer3': 500
    };
    
    const multiplier = multipliers[game] || 100;
    return bet.amount * multiplier;
  };

  const resetScanner = () => {
    setScanResult(null);
    setScanError('');
    setIsScanning(true);
  };

  return (
    <div className="container teller-page">
      {/* Header */}
      <header className="header teller-header">
        <h1>🎲 Teller Dashboard</h1>
        <div className="header-right">
          <div className="user-info" aria-label="User status">
            <div className="user-avatar" aria-hidden="true">{user.initials}</div>
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
            <div className="status-badge">{user.status}</div>
          </div>
          <div className="datetime-pill">
            {formatHeaderDate(currentTime)} • {formatHeaderTime(currentTime)}
          </div>
        </div>
      </header>

      {/* Stats */}
      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">Today's Stats</h2>
        <div className="stats-grid">
          <Stat icon="📊" value={peso(stats.sales)}     label="Today's Sales" />
          <Stat icon="🎫" value={num(stats.tickets)}     label="Tickets Sold" />
          <Stat icon="💰" value={peso(stats.commission)} label="Commission" />
          <Stat icon="🏆" value={num(stats.winners)}     label="Winners Today" />
        </div>
      </section>

      {/* Actions */}
      <main className="bento-grid">
        <Tile
          to="/teller/create-ticket"
          icon="🎟️"
          title="Create New Ticket"
          desc="Start a new betting ticket for customers. Add multiple bets across different games."
          cta="Create Ticket"
        />
        <Tile
          to="/teller/check-winners"
          icon="🔍"
          title="Check Winners"
          desc="View winning tickets from your sales after draw results are posted."
          cta="View Winners"
        />
        <Tile
          to="/teller/sales-report"
          icon="📈"
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
          <div className="card-icon" aria-hidden="true">📅</div>
          <div className="card-title" id="schedule-title">Today's Draw Schedule</div>
          <div className="card-description">Upcoming draws and results</div>

          <div className="schedule-grid">
            {schedule.map((game, i) => (
              <ScheduleCard key={i} game={game} currentTime={currentTime} />
            ))}
          </div>
        </section>
      </main>

      {/* Floating Scan Button */}
      <button 
        className="floating-scan-btn" 
        onClick={openScanModal}
        aria-label="Scan ticket QR code"
        title="Scan Ticket QR"
      >
        <img src={qrIconUrl} alt="QR" className="scan-icon" />
      </button>

      {/* QR Scan Modal */}
      {showScanModal && (
        <div className="scan-modal active" role="dialog" aria-modal="true" aria-label="Scan ticket QR code">
          <div className="scan-container">
            <div className="scan-header">
              <div className="scan-title">Scan Ticket QR</div>
              <div className="scan-subtitle">Position QR code in camera view</div>
              <button className="close-btn" onClick={closeScanModal} aria-label="Close scanner">×</button>
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
                          facingMode: 'environment'
                        }}
                        scanDelay={300}
                        containerStyle={{
                          borderRadius: '12px',
                          overflow: 'hidden',
                          position: 'relative',
                          aspectRatio: '4/3',
                          maxHeight: '300px'
                        }}
                        videoStyle={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
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
                          setScanError('');
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
                  <div className={`authenticity-badge ${scanResult.authentic ? 'authentic' : 'invalid'}`}>
                    {scanResult.authentic ? '✅ AUTHENTIC TICKET' : '❌ INVALID TICKET'}
                  </div>
                  
                  <div className="ticket-info">
                    <div className="ticket-ref">REF: {scanResult.ticket.id}</div>
                    <div className="ticket-date">
                      {new Date(scanResult.ticket.timestamp).toLocaleString('en-PH')}
                    </div>
                    <div className="ticket-total">Total: {peso(scanResult.ticket.total)}</div>
                  </div>

                  <div className="winning-results">
                    <h3>Winning Check Results</h3>
                    {scanResult.winningResults.length === 0 ? (
                      <div className="no-results">No completed draws found for this ticket</div>
                    ) : (
                      <div className="results-list">
                        {scanResult.winningResults.map((result, index) => (
                          <div key={index} className={`result-item ${result.isWinner ? 'winner' : 'non-winner'}`}>
                            <div className="result-game">{result.game}</div>
                            <div className="result-combo">Bet: {result.combo}</div>
                            <div className="result-draw">Draw: {result.drawResult}</div>
                            <div className="result-status">
                              {result.isWinner ? (
                                <span className="winner-badge">🏆 WINNER - {peso(result.payout)}</span>
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
              <button className="scan-btn scan-btn-close" onClick={closeScanModal}>Close</button>
              {scanResult && (
                <button className="scan-btn scan-btn-new" onClick={resetScanner}>Scan Another</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* small UI bits */
function Stat({ icon, value, label }) {
  return (
    <div className="stat-card">
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
      <span className="card-action">{cta} →</span>
    </Link>
  );
}

function ScheduleCard({ game, currentTime }) {
  // Find the next upcoming draw
  const upcomingDraw = game.draws.find(draw => 
    draw.status === "upcoming" && draw.time > currentTime
  );

  return (
    <div className={`schedule-card ${game.variant}`}>
      <div className="schedule-title">{game.title}</div>
      
      {/* Show countdown for next upcoming draw */}
      {upcomingDraw && (
        <div className="schedule-countdown">
          <div className="countdown-label">Next Draw</div>
          <div className="countdown-time">
            {formatTime(upcomingDraw.time)}
          </div>
          <div className="countdown-timer">
            {formatCountdown(upcomingDraw.time - currentTime)}
          </div>
        </div>
      )}

      {/* Show all draws with their status */}
      <div className="schedule-draws">
        {game.draws.map((draw, index) => (
          <div key={index} className={`schedule-draw ${draw.status}`}>
            <div className="draw-time">
              {formatTime(draw.time)}
            </div>
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
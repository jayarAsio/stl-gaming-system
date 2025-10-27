// ============================================
// File: src/App.jsx
// Purpose: Main routing with authentication
// Note: Login is now served at the Home page ("/")
// ============================================

import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./Home";
import ScrollToTop from "./ScrollToTop";

// ============================================
// Lazy-loaded shells
// ============================================
const SuperAdmin        = lazy(() => import("./features/super-admin/pages/Dashboard"));
const GameAdministrator = lazy(() => import("./features/game-administrator/pages/Dashboard"));
const OperationSupport  = lazy(() => import("./features/operation-support/pages/Dashboard"));
const Collector         = lazy(() => import("./features/collector/pages/Dashboard"));
const Teller            = lazy(() => import("./features/teller/pages/Dashboard"));

// ============================================
// Super Admin — pages
// ============================================
const SuperAdminDashboard         = lazy(() => import("./features/super-admin/pages/DashboardPage"));
const SuperAdminModuleControl     = lazy(() => import("./features/super-admin/pages/ModuleControl"));
const SuperAdminAUserManagement   = lazy(() => import("./features/super-admin/pages/AUserManagement"));
const SuperAdminGameConfiguration = lazy(() => import("./features/super-admin/pages/GameConfiguration"));
const SuperAdminSalesTransactions = lazy(() => import("./features/super-admin/pages/SalesTransactions"));
const SuperAdminADrawManagement   = lazy(() => import("./features/super-admin/pages/ADrawManagement"));
const SuperAdminEscalations       = lazy(() => import("./features/super-admin/pages/Escalations"));
const SuperAdminSecurityAudit     = lazy(() => import("./features/super-admin/pages/SecurityAudit"));

// ============================================
// Game Administrator — pages
// ============================================
const GameAdminDashboard      = lazy(() => import("./features/game-administrator/pages/DashboardPage"));
const GameAdminConfiguration  = lazy(() => import("./features/game-administrator/pages/Configuration"));
const GameAdminUserManagement = lazy(() => import("./features/game-administrator/pages/UserManagement"));
const GameAdminDailyOps       = lazy(() => import("./features/game-administrator/pages/DailyOperations"));
const GameAdminDrawManagement = lazy(() => import("./features/game-administrator/pages/DrawManagement"));
const GameAdminEnforcement    = lazy(() => import("./features/game-administrator/pages/Enforcement"));
const GameAdminReports        = lazy(() => import("./features/game-administrator/pages/Reports"));

// ============================================
// Operation Support — pages
// ============================================
const OperationSupportDashboard    = lazy(() => import("./features/operation-support/pages/DashboardPage"));
const OperationSupportBalances     = lazy(() => import("./features/operation-support/pages/Balances"));
const OperationSupportDailyLedgers = lazy(() => import("./features/operation-support/pages/DailyLedgers"));
const OperationSupportReports      = lazy(() => import("./features/operation-support/pages/Reports"));

// ============================================
// Teller — pages
// ============================================
const TellerVoidRequest  = lazy(() => import("./features/teller/pages/VoidRequest"));
const TellerSalesReport  = lazy(() => import("./features/teller/pages/SalesReport"));
const TellerCheckWinners = lazy(() => import("./features/teller/pages/CheckWinners"));
const TellerCreateTicket = lazy(() => import("./features/teller/pages/CreateTicket"));

// ============================================
// Collector — pages
// ============================================
const CollectorSalesCollection = lazy(() => import("./features/collector/pages/SalesCollection"));
const CollectorPayoutsTapal    = lazy(() => import("./features/collector/pages/PayoutsTapal"));
const CollectorReports         = lazy(() => import("./features/collector/pages/Reports"));

// ============================================
// Loading Fallback
// ============================================
const LoadingFallback = () => (
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    fontSize: "1.25rem",
    color: "#6b7280"
  }}>
    Loading…
  </div>
);

// ============================================
// Unauthorized Page
// ============================================
const Unauthorized = () => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    gap: "1rem",
    padding: "2rem",
    textAlign: "center",
  }}>
    <h1 style={{ fontSize: "3rem", margin: 0 }}>⛔</h1>
    <h2 style={{ fontSize: "1.5rem", margin: 0, color: "#374151" }}>Access Denied</h2>
    <p style={{ color: "#6b7280" }}>You don't have permission to access this page.</p>
    {/* Back to Login now points to "/" since Home is Login */}
    <Link to="/" style={{
      marginTop: "1rem",
      padding: "0.75rem 1.5rem",
      background: "#1976d2",
      color: "white",
      borderRadius: "8px",
      textDecoration: "none",
      fontWeight: 600
    }}>
      Back to Login
    </Link>
  </div>
);

// ============================================
// Main App
// ============================================
export default function App() {
  return (
    <AuthProvider>
      {/* Important: basename matches Vite base without trailing slash */}
      <BrowserRouter basename="/stl-gaming-system">
        <ScrollToTop />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* PUBLIC: Home is the Login page */}
            <Route path="/" element={<Home />} />

            {/* PUBLIC: Unauthorized helper */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* PROTECTED: Super Admin */}
            <Route
              path="/super-admin"
              element={
                <ProtectedRoute requiredRole="super-admin">
                  <SuperAdmin />
                </ProtectedRoute>
              }
            >
              <Route index element={<SuperAdminDashboard />} />
              <Route path="module-control" element={<SuperAdminModuleControl />} />
              <Route path="user-management" element={<SuperAdminAUserManagement />} />
              <Route path="game-configuration" element={<SuperAdminGameConfiguration />} />
              <Route path="sales-transactions" element={<SuperAdminSalesTransactions />} />
              <Route path="draw-management" element={<SuperAdminADrawManagement />} />
              <Route path="escalations" element={<SuperAdminEscalations />} />
              <Route path="security-audit" element={<SuperAdminSecurityAudit />} />
            </Route>

            {/* PROTECTED: Game Administrator */}
            <Route
              path="/game-administrator"
              element={
                <ProtectedRoute requiredRole="game-administrator">
                  <GameAdministrator />
                </ProtectedRoute>
              }
            >
              <Route index element={<GameAdminDashboard />} />
              <Route path="configuration" element={<GameAdminConfiguration />} />
              <Route path="user-management" element={<GameAdminUserManagement />} />
              <Route path="daily-operations" element={<GameAdminDailyOps />} />
              <Route path="draw-management" element={<GameAdminDrawManagement />} />
              <Route path="enforcement" element={<GameAdminEnforcement />} />
              <Route path="reports" element={<GameAdminReports />} />
            </Route>

            {/* PROTECTED: Operation Support */}
            <Route
              path="/operation-support"
              element={
                <ProtectedRoute requiredRole="operation-support">
                  <OperationSupport />
                </ProtectedRoute>
              }
            >
              <Route index element={<OperationSupportDashboard />} />
              <Route path="balances" element={<OperationSupportBalances />} />
              <Route path="daily-ledgers" element={<OperationSupportDailyLedgers />} />
              <Route path="reports" element={<OperationSupportReports />} />
            </Route>

            {/* PROTECTED: Collector */}
            <Route
              path="/collector"
              element={
                <ProtectedRoute requiredRole="collector">
                  <Collector />
                </ProtectedRoute>
              }
            >
              <Route index element={<CollectorSalesCollection />} />
              <Route path="sales-collection" element={<CollectorSalesCollection />} />
              <Route path="payouts-tapal" element={<CollectorPayoutsTapal />} />
              <Route path="reports" element={<CollectorReports />} />
            </Route>

            {/* PROTECTED: Teller */}
            <Route
              path="/teller"
              element={
                <ProtectedRoute requiredRole="teller">
                  <Teller />
                </ProtectedRoute>
              }
            >
              <Route index element={<TellerCreateTicket />} />
              <Route path="create-ticket" element={<TellerCreateTicket />} />
              <Route path="check-winners" element={<TellerCheckWinners />} />
              <Route path="void-request" element={<TellerVoidRequest />} />
              <Route path="sales-report" element={<TellerSalesReport />} />
            </Route>

            {/* Catch-all → back to Home (Login) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

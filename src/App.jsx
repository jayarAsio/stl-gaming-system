// ============================================
// File: src/App.jsx (UPDATED VERSION)
// Purpose: Main routing with authentication
// ============================================

import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./Home";                 // <-- Your Login screen
import ScrollToTop from "./ScrollToTop";

// Dashboards (lazy-loaded from feature folders)
const SuperAdmin        = lazy(() => import("./features/super-admin/pages/Dashboard"));
const GameAdministrator = lazy(() => import("./features/game-administrator/pages/Dashboard"));
const OperationSupport  = lazy(() => import("./features/operation-support/pages/Dashboard"));
const Collector         = lazy(() => import("./features/collector/pages/Dashboard"));
const Teller            = lazy(() => import("./features/teller/pages/Dashboard"));

// ============================================
// Super Admin — Updated Module Structure
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
const GameAdminDashboard       = lazy(() => import("./features/game-administrator/pages/DashboardPage"));
const GameAdminConfiguration   = lazy(() => import("./features/game-administrator/pages/Configuration"));
const GameAdminUserManagement  = lazy(() => import("./features/game-administrator/pages/UserManagement"));
const GameAdminDailyOps        = lazy(() => import("./features/game-administrator/pages/DailyOperations"));
const GameAdminDrawManagement  = lazy(() => import("./features/game-administrator/pages/DrawManagement"));
const GameAdminEnforcement     = lazy(() => import("./features/game-administrator/pages/Enforcement"));
const GameAdminReports         = lazy(() => import("./features/game-administrator/pages/Reports"));

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
// Loading Component
// ============================================
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '1.5rem',
    color: '#666',
  }}>
    Loading...
  </div>
);

// ============================================
// Unauthorized Page
// ============================================
const Unauthorized = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    gap: '1rem',
    padding: '2rem',
    textAlign: 'center',
  }}>
    <h1 style={{ fontSize: '3rem', margin: 0 }}>⛔</h1>
    <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#374151' }}>Access Denied</h2>
    <p style={{ color: '#6b7280' }}>You don't have permission to access this page.</p>
    <Link to="/login" style={{
      marginTop: '1rem',
      padding: '0.75rem 1.5rem',
      background: '#1976d2',
      color: 'white',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: '600',
    }}>
      Back to Login
    </Link>
  </div>
);

// ============================================
// Basename normalization (prevents trailing-slash mismatch)
// ============================================
let basename = import.meta.env.BASE_URL || '/';
if (basename !== '/') basename = basename.replace(/\/+$/, '');

// ============================================
// Main App Component
// ============================================
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <ScrollToTop />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* ============================================
                PUBLIC ROUTES
                ============================================ */}
            {/* Your Login screen is Home */}
            <Route path="/login" element={<Home />} />

            {/* Root -> redirect to /login (keeps login public) */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* ============================================
                SUPER ADMIN - PROTECTED ROUTES
                ============================================ */}
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
            
            {/* ============================================
                GAME ADMINISTRATOR - PROTECTED ROUTES
                ============================================ */}
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

            {/* ============================================
                OPERATION SUPPORT - PROTECTED ROUTES
                ============================================ */}
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

            {/* ============================================
                COLLECTOR - PROTECTED ROUTES
                (parent layout renders <Outlet /> inside the dashboard)
                ============================================ */}
            <Route
              path="/collector"
              element={
                <ProtectedRoute requiredRole="collector">
                  <Collector />
                </ProtectedRoute>
              }
            >
              {/* At /collector: show ONLY the dashboard (no child) */}
              <Route path="sales-collection" element={<CollectorSalesCollection />} />
              <Route path="payouts-tapal" element={<CollectorPayoutsTapal />} />
              <Route path="reports" element={<CollectorReports />} />
            </Route>

            {/* ============================================
                TELLER - PROTECTED ROUTES
                ============================================ */}
            <Route
              path="/teller"
              element={
                <ProtectedRoute requiredRole="teller">
                  <Teller />
                </ProtectedRoute>
              }
            >
              {/* At /teller: show dashboard (no index route) */}
              <Route path="create-ticket" element={<TellerCreateTicket />} />
              <Route path="check-winners" element={<TellerCheckWinners />} />
              <Route path="void-request" element={<TellerVoidRequest />} />
              <Route path="sales-report" element={<TellerSalesReport />} />
            </Route>

            {/* ============================================
                CATCH ALL - Redirect to /login
                ============================================ */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

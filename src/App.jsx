import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Home from "./Home";
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
const SuperAdminAUserManagement    = lazy(() => import("./features/super-admin/pages/AUserManagement"));
const SuperAdminGameConfiguration = lazy(() => import("./features/super-admin/pages/GameConfiguration"));
const SuperAdminSalesTransactions = lazy(() => import("./features/super-admin/pages/SalesTransactions"));
const SuperAdminADrawManagement    = lazy(() => import("./features/super-admin/pages/ADrawManagement"));
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

export default function App() {
  return (
    <BrowserRouter basename="/stl-gaming-system">
      <ScrollToTop />
      <Suspense fallback={null}>
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* ============================================
              SUPER ADMIN - Updated Module Structure
              Complete System Control & Oversight
              ============================================ */}
          <Route path="/super-admin" element={<SuperAdmin />}>
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
              GAME ADMINISTRATOR
              Daily Operations & User Management
              ============================================ */}
          <Route path="/game-administrator" element={<GameAdministrator />}>
            <Route index element={<GameAdminDashboard />} />
            <Route path="configuration" element={<GameAdminConfiguration />} />
            <Route path="user-management" element={<GameAdminUserManagement />} />
            <Route path="daily-operations" element={<GameAdminDailyOps />} />
            <Route path="draw-management" element={<GameAdminDrawManagement />} />
            <Route path="enforcement" element={<GameAdminEnforcement />} />
            <Route path="reports" element={<GameAdminReports />} />
          </Route>

          {/* ============================================
              OPERATION SUPPORT
              Ledgers, Balances & Reports
              ============================================ */}
          <Route path="/operation-support" element={<OperationSupport />}>
            <Route index element={<OperationSupportDashboard />} />
            <Route path="balances" element={<OperationSupportBalances />} />
            <Route path="daily-ledgers" element={<OperationSupportDailyLedgers />} />
            <Route path="reports" element={<OperationSupportReports />} />
          </Route>

          {/* ============================================
              COLLECTOR
              Collections, Payouts & Tapal
              ============================================ */}
          <Route path="/collector" element={<Collector />} />
          <Route path="/collector/sales-collection" element={<CollectorSalesCollection />} />
          <Route path="/collector/payouts-tapal" element={<CollectorPayoutsTapal />} />
          <Route path="/collector/reports" element={<CollectorReports />} />

          {/* ============================================
              TELLER
              Ticket Creation & Sales
              ============================================ */}
          <Route path="/teller" element={<Teller />} />
          <Route path="/teller/void-request" element={<TellerVoidRequest />} />
          <Route path="/teller/sales-report" element={<TellerSalesReport />} />
          <Route path="/teller/check-winners" element={<TellerCheckWinners />} />
          <Route path="/teller/create-ticket" element={<TellerCreateTicket />} />

          {/* 404 Not Found */}
          <Route path="*" element={<div style={{ padding: 24 }}>Not found</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
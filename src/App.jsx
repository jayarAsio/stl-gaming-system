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

// Super Admin — pages
const SuperAdminDashboard      = lazy(() => import("./features/super-admin/pages/DashboardPage"));
const SuperAdminDrawManagement = lazy(() => import("./features/super-admin/pages/DrawManagement"));
const SuperAdminResults        = lazy(() => import("./features/super-admin/pages/ResultsWinners"));
const SuperAdminSales          = lazy(() => import("./features/super-admin/pages/SalesAnalytics"));
const SuperAdminUsers          = lazy(() => import("./features/super-admin/pages/UserManagement"));
const SuperAdminEscalations    = lazy(() => import("./features/super-admin/pages/Escalations"));
const SuperAdminSecurity       = lazy(() => import("./features/super-admin/pages/SecurityAudit"));
const SuperAdminSettings       = lazy(() => import("./features/super-admin/pages/SystemSettings"));

// Game Administrator — pages
const GameAdminDashboard       = lazy(() => import("./features/game-administrator/pages/DashboardPage"));
const GameAdminConfiguration   = lazy(() => import("./features/game-administrator/pages/Configuration"));
const GameAdminUserManagement  = lazy(() => import("./features/game-administrator/pages/UserManagement"));
const GameAdminDailyOps        = lazy(() => import("./features/game-administrator/pages/DailyOperations"));
const GameAdminDrawManagement  = lazy(() => import("./features/game-administrator/pages/DrawManagement"));
const GameAdminEnforcement     = lazy(() => import("./features/game-administrator/pages/Enforcement"));
const GameAdminReports         = lazy(() => import("./features/game-administrator/pages/Reports"));

// Operation Support — pages
const OperationSupportDashboard        = lazy(() => import("./features/operation-support/pages/DashboardPage"));
const OperationSupportLedger          = lazy(() => import("./features/operation-support/pages/LedgerManagement"));
const OperationSupportReconciliation  = lazy(() => import("./features/operation-support/pages/Reconciliation"));
const OperationSupportDiscrepancy     = lazy(() => import("./features/operation-support/pages/DiscrepancyHandling"));
const OperationSupportOversight       = lazy(() => import("./features/operation-support/pages/Oversight"));
const OperationSupportReports         = lazy(() => import("./features/operation-support/pages/Reports"));

// Teller — pages
const TellerVoidRequest  = lazy(() => import("./features/teller/pages/VoidRequest"));
const TellerSalesReport  = lazy(() => import("./features/teller/pages/SalesReport"));
const TellerCheckWinners = lazy(() => import("./features/teller/pages/CheckWinners"));
const TellerCreateTicket = lazy(() => import("./features/teller/pages/CreateTicket"));

// Collector — pages
const CollectorSalesCollection  = lazy(() => import("./features/collector/pages/SalesCollection"));
const CollectorPayoutsTapal     = lazy(() => import("./features/collector/pages/PayoutsTapal"));
const CollectorReports          = lazy(() => import("./features/collector/pages/Reports"));

export default function App() {
  return (
    <BrowserRouter basename="/stl-gaming-system">
      <ScrollToTop />
      <Suspense fallback={null}>
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Super Admin - with nested routes */}
          <Route path="/super-admin" element={<SuperAdmin />}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="draw-management" element={<SuperAdminDrawManagement />} />
            <Route path="results-winners" element={<SuperAdminResults />} />
            <Route path="sales-analytics" element={<SuperAdminSales />} />
            <Route path="user-management" element={<SuperAdminUsers />} />
            <Route path="escalations" element={<SuperAdminEscalations />} />
            <Route path="security-audit" element={<SuperAdminSecurity />} />
            <Route path="system-settings" element={<SuperAdminSettings />} />
          </Route>
          
          {/* Game Administrator - with nested routes */}
          <Route path="/game-administrator" element={<GameAdministrator />}>
            <Route index element={<GameAdminDashboard />} />
            <Route path="configuration" element={<GameAdminConfiguration />} />
            <Route path="user-management" element={<GameAdminUserManagement />} />
            <Route path="daily-operations" element={<GameAdminDailyOps />} />
            <Route path="draw-management" element={<GameAdminDrawManagement />} />
            <Route path="enforcement" element={<GameAdminEnforcement />} />
            <Route path="reports" element={<GameAdminReports />} />
          </Route>

          {/* Operation Support - with nested routes */}
          <Route path="/operation-support" element={<OperationSupport />}>
            <Route index element={<OperationSupportDashboard />} />
            <Route path="ledger-management" element={<OperationSupportLedger />} />
            <Route path="reconciliation" element={<OperationSupportReconciliation />} />
            <Route path="discrepancy-handling" element={<OperationSupportDiscrepancy />} />
            <Route path="oversight" element={<OperationSupportOversight />} />
            <Route path="reports" element={<OperationSupportReports />} />
          </Route>

          {/* Collector Dashboard */}
          <Route path="/collector" element={<Collector />} />

          {/* Collector sub-pages */}
          <Route path="/collector/sales-collection" element={<CollectorSalesCollection />} />
          <Route path="/collector/payouts-tapal" element={<CollectorPayoutsTapal />} />
          <Route path="/collector/reports" element={<CollectorReports />} />

          {/* Teller Dashboard */}
          <Route path="/teller" element={<Teller />} />

          {/* Teller sub-pages */}
          <Route path="/teller/void-request" element={<TellerVoidRequest />} />
          <Route path="/teller/sales-report" element={<TellerSalesReport />} />
          <Route path="/teller/check-winners" element={<TellerCheckWinners />} />
          <Route path="/teller/create-ticket" element={<TellerCreateTicket />} />

          {/* 404 */}
          <Route path="*" element={<div style={{ padding: 24 }}>Not found</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
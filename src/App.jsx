import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Home from "./Home";



// Dashboards (lazy-loaded from feature folders)
const SuperAdmin        = lazy(() => import("./features/super-admin/pages/Dashboard"));
const GameAdministrator = lazy(() => import("./features/game-administrator/pages/Dashboard"));
const OperationSupport  = lazy(() => import("./features/operation-support/pages/Dashboard"));
const Collector         = lazy(() => import("./features/collector/pages/Dashboard"));
const Teller            = lazy(() => import("./features/teller/pages/Dashboard"));

// Teller — pages
const TellerVoidRequest  = lazy(() => import("./features/teller/pages/VoidRequest"));
const TellerSalesReport  = lazy(() => import("./features/teller/pages/SalesReport"));
const TellerCheckWinners = lazy(() => import("./features/teller/pages/CheckWinners"));
const TellerCreateTicket = lazy(() => import("./features/teller/pages/CreateTicket"));

// Collector — pages
const CollectorSalesCollection  = lazy(() => import("./features/collector/pages/SalesCollection"));
const CollectorPayoutsTapal  = lazy(() => import("./features/collector/pages/PayoutsTapal"));
const CollectorReports  = lazy(() => import("./features/collector/pages/Reports"));

export default function App() {
  return (
    <BrowserRouter basename="/stl-gaming-system">
      <Suspense fallback={<div style={{ padding: 20 }}>Loading…</div>}>
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Dashboards */}
          <Route path="/super-admin"        element={<SuperAdmin />} />
          <Route path="/game-administrator" element={<GameAdministrator />} />
          <Route path="/operation-support"  element={<OperationSupport />} />
          <Route path="/collector"          element={<Collector />} />
          <Route path="/teller"             element={<Teller />} />

          {/* Teller sub-pages */}
          <Route path="/teller/void-request"   element={<TellerVoidRequest />} />
          <Route path="/teller/sales-report"   element={<TellerSalesReport />} />
          <Route path="/teller/check-winners"  element={<TellerCheckWinners />} />
          <Route path="/teller/create-ticket"  element={<TellerCreateTicket />} />

          {/* Collector sub-pages */}
          <Route path="/collector/sales-collection"   element={<CollectorSalesCollection />} />
          <Route path="/collector/payouts-tapal"   element={<CollectorPayoutsTapal />} />
          <Route path="/collector/reports"   element={<CollectorReports />} />

          {/* 404 */}
          <Route path="*" element={<div style={{ padding: 24 }}>Not found</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

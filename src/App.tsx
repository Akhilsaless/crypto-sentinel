import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import AgentCommand from "./pages/AgentCommand";
import TopBuys from "./pages/TopBuys";
import AvoidList from "./pages/AvoidList";
import ExitSignals from "./pages/ExitSignals";
import StrategyRisk from "./pages/StrategyRisk";
import Exchanges from "./pages/Exchanges";
import Execution from "./pages/Execution";
import Logs from "./pages/Logs";
import Portfolio from "./pages/Portfolio";
import Health from "./pages/Health";
import NotFound from "./pages/NotFound";
import Signals from "./pages/Signals";
import Alerts from "./pages/Alerts";
import Journal from "./pages/Journal";
import ChartReview from "./pages/ChartReview";
import Learn from "./pages/Learn";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/agent" element={<AgentCommand />} />
            <Route path="/opportunities" element={<Signals />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/chart-review" element={<ChartReview />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/opportunities/buys" element={<TopBuys />} />
            <Route path="/opportunities/avoid" element={<AvoidList />} />
            <Route path="/opportunities/exits" element={<ExitSignals />} />
            <Route path="/strategy" element={<StrategyRisk />} />
            <Route path="/exchanges" element={<Exchanges />} />
            <Route path="/execution" element={<Execution />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/health" element={<Health />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Login from "./pages/Login";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import GestionUtilisateurs from "./pages/GestionUtilisateurs";
import Clients from "./pages/Clients";
import Finance from "./pages/Finance";
import Parametres from "./pages/Parametres";
import Rapports from "./pages/Rapports";
import Stocks from "./pages/Stocks";
import Alertes from "./pages/Alertes";
import ClientOrders from "./pages/ClientOrders";
import ClientDashboard from "./pages/ClientDashboard";
import MyOrders from "./pages/MyOrders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="utilisateurs" element={<GestionUtilisateurs />} />
                <Route path="client" element={<ClientDashboard />} />
                <Route path="mes-commandes" element={<MyOrders />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/:id/commandes" element={<ClientOrders />} />
                <Route path="finance" element={<Finance />} />
                <Route path="parametres" element={<Parametres />} />
                <Route path="rapports" element={<Rapports />} />
                <Route path="stocks" element={<Stocks />} />
                <Route path="alertes" element={<Alertes />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

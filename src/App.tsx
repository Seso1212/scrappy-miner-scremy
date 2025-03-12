
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CryptoProvider, useCrypto } from "./contexts/CryptoContext";
import Dashboard from "./pages/Dashboard";
import Mining from "./pages/Mining";
import Market from "./pages/Market";
import Portfolio from "./pages/Portfolio";
import Wallet from "./pages/Wallet";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Layout from "./components/Layout";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useCrypto();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// App Component
const AppRoutes = () => {
  const { isAuthenticated, userData } = useCrypto();
  
  // Set up background processing for mining when app loads
  useEffect(() => {
    // Check if any mining operations are active
    if (userData && userData.userStats.lastMiningTimestamp) {
      // Record current timestamp when app is loaded to track mining time
      const now = Date.now();
      
      // Update last mining timestamp in localStorage
      const updatedUserData = {
        ...userData,
        userStats: {
          ...userData.userStats,
          lastMiningTimestamp: now
        }
      };
      
      // Store updated timestamp
      localStorage.setItem('scremycoin_app_data', JSON.stringify(updatedUserData));
    }
    
    // Clean up function for when app is closed/reloaded
    return () => {
      // This runs when component unmounts (app closes)
      // Record mining was happening when app closed
      const currentData = JSON.parse(localStorage.getItem('scremycoin_app_data') || '{}');
      if (currentData.userStats && currentData.userStats.autoMining !== false) {
        currentData.userStats.lastMiningTimestamp = Date.now();
        localStorage.setItem('scremycoin_app_data', JSON.stringify(currentData));
      }
    };
  }, []);
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Auth />
        } />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="/mining" element={<Mining />} />
          <Route path="/market" element={<Market />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CryptoProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </CryptoProvider>
  </QueryClientProvider>
);

export default App;

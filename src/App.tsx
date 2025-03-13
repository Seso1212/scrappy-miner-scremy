
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
import { useEffect, useRef } from "react";

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
  const { userData } = useCrypto();
  const isInitialMount = useRef(true);
  
  // Set up background processing for mining - runs only on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // Set up departure handler for when app is closed
      const handleBeforeUnload = () => {
        const currentData = JSON.parse(localStorage.getItem('scremycoin_app_data') || '{}');
        if (currentData.userStats) {
          // Record the current timestamp when app is closed
          currentData.userStats.lastMiningTimestamp = Date.now();
          localStorage.setItem('scremycoin_app_data', JSON.stringify(currentData));
        }
      };
      
      // Add event listeners for app closure
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        // Also run the handler on component unmount (though this is unlikely to happen in a SPA)
        handleBeforeUnload();
      };
    }
  }, []);
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={
          <Auth />
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

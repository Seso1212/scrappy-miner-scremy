
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DataService, UserData, UserStats, Transaction, CryptoHolding, MiningSpace, UserAuth } from '@/lib/dataService';
import { calculateExpRequired } from '@/lib/miningUtils';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface CryptoContextProps {
  userData: UserData;
  auth: UserAuth | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  updateUserStats: (stats: Partial<UserStats>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateHolding: (symbol: string, amount: number) => void;
  updateMiningSpace: (id: number, data: Partial<MiningSpace>) => void;
  addScr: (amount: number) => void;
  addScoins: (amount: number) => void;
  addExp: (amount: number) => void;
  resetData: () => void;
  convertScoinsToScr: () => void;
  extendMiningDuration: () => void;
}

const CryptoContext = createContext<CryptoContextProps | undefined>(undefined);

export const CryptoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>(DataService.initData());
  const [auth, setAuth] = useState<UserAuth | null>(DataService.getAuth());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(DataService.isLoggedIn());
  const { toast } = useToast();

  // Process background mining on app load
  useEffect(() => {
    const updatedData = DataService.processPendingMining();
    setUserData(updatedData);
  }, []);

  useEffect(() => {
    // Sync with localStorage on mount
    setUserData(DataService.initData());
    
    // Update crypto prices continuously
    const interval = setInterval(() => {
      const data = DataService.initData();
      
      // Update market data
      const updatedMarketData = data.marketData.map(coin => {
        // Get real-time data from API (simulated here)
        // In a real app, you would fetch from a cryptocurrency API
        const priceChange = (Math.random() * 3) - 1.5; // -1.5% to +1.5%
        const newPrice = coin.price * (1 + priceChange / 100);
        return {
          ...coin,
          price: newPrice,
          change24h: coin.change24h + (priceChange / 8), // Slightly adjust 24h change
          lastUpdated: Date.now()
        };
      });
      
      // Update holdings values based on new prices
      const updatedHoldings = data.holdings.map(holding => {
        const marketData = updatedMarketData.find(m => m.symbol === holding.symbol);
        const valueUsd = marketData ? marketData.price * holding.amount : holding.valueUsd;
        return {
          ...holding,
          valueUsd
        };
      });
      
      const updatedData = {
        ...data,
        marketData: updatedMarketData,
        holdings: updatedHoldings,
      };
      
      DataService.saveData(updatedData);
      setUserData(updatedData);
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Authentication methods
  const login = () => {
    const authData = DataService.getAuth();
    if (authData) {
      setAuth(authData);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    DataService.logoutUser();
    setAuth(null);
    setIsAuthenticated(false);
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
      duration: 3000,
    });
  };

  const updateUserStats = (stats: Partial<UserStats>) => {
    const updatedData = DataService.updateUserStats(stats);
    setUserData(updatedData);
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const updatedData = DataService.addTransaction(transaction);
    setUserData(updatedData);
  };

  const updateHolding = (symbol: string, amount: number) => {
    const updatedData = DataService.updateHolding(symbol, amount);
    setUserData(updatedData);
  };

  const updateMiningSpace = (id: number, data: Partial<MiningSpace>) => {
    const updatedData = DataService.updateMiningSpace(id, data);
    setUserData(updatedData);
  };

  const addScr = (amount: number) => {
    const currentScr = userData.holdings.find(h => h.symbol === 'SCR')?.amount || 0;
    updateHolding('SCR', currentScr + amount);
    
    // Add transaction
    addTransaction({
      type: 'mine',
      amount,
      symbol: 'SCR',
      timestamp: Date.now(),
      valueUsd: amount * DataService.getScrPrice(),
      status: 'completed'
    });
    
    toast({
      title: "Mining Successful",
      description: `You earned ${amount.toFixed(4)} SCR`,
      duration: 3000,
    });
  };

  const addScoins = (amount: number) => {
    updateUserStats({ scoins: (userData.userStats.scoins || 0) + amount });
    
    toast({
      title: "Scoins Earned",
      description: `You earned ${amount} Scoins`,
      duration: 3000,
    });
  };

  const addExp = (amount: number) => {
    const { level, exp } = userData.userStats;
    const expRequired = calculateExpRequired(level);
    const newExp = exp + amount;
    
    if (newExp >= expRequired && level < 10) {
      // Level up
      updateUserStats({
        level: level + 1,
        exp: newExp - expRequired,
        expRequired: calculateExpRequired(level + 1)
      });
      
      toast({
        title: "Level Up!",
        description: `Congratulations! You've reached level ${level + 1}.`,
        duration: 3000,
      });
    } else {
      updateUserStats({ exp: newExp });
    }
  };

  const resetData = () => {
    const freshData = DataService.resetData();
    setUserData(freshData);
    
    toast({
      title: "Data Reset",
      description: "All your cryptocurrency data has been reset.",
      duration: 3000,
    });
  };

  const convertScoinsToScr = () => {
    const { scoins } = userData.userStats;
    if (scoins < 10) {
      toast({
        title: "Conversion Failed",
        description: "You need at least 10 Scoins to convert to SCR.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    // Exchange rate: 10 Scoins = 0.1 SCR
    const scrAmount = scoins / 100;
    
    // Update scoins and SCR balance
    updateUserStats({ scoins: 0 });
    addScr(scrAmount);
    
    // Add transaction
    addTransaction({
      type: 'convert',
      amount: scrAmount,
      symbol: 'SCR',
      timestamp: Date.now(),
      valueUsd: scrAmount * DataService.getScrPrice(),
      status: 'completed'
    });
    
    toast({
      title: "Conversion Successful",
      description: `Converted ${scoins} Scoins to ${scrAmount.toFixed(2)} SCR`,
      duration: 3000,
    });
  };

  const extendMiningDuration = () => {
    const { scoins } = userData.userStats;
    
    if (scoins < 5) {
      toast({
        title: "Extension Failed",
        description: "You need at least 5 Scoins to extend mining duration.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    try {
      const updatedData = DataService.extendMiningDuration(scoins);
      setUserData(updatedData);
      
      toast({
        title: "Mining Extended",
        description: "Mining duration extended to 24 hours for 5 Scoins",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Extension Failed",
        description: error instanceof Error ? error.message : "Failed to extend mining duration",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const contextValue: CryptoContextProps = {
    userData,
    auth,
    isAuthenticated,
    login,
    logout,
    updateUserStats,
    addTransaction,
    updateHolding,
    updateMiningSpace,
    addScr,
    addScoins,
    addExp,
    resetData,
    convertScoinsToScr,
    extendMiningDuration
  };

  return (
    <CryptoContext.Provider value={contextValue}>
      {children}
    </CryptoContext.Provider>
  );
};

export const useCrypto = () => {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
};

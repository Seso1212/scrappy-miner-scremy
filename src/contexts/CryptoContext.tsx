
import React, { createContext, useContext, useState, useEffect } from 'react';
import { DataService, UserData, UserAuth } from '@/lib/dataService';
import { useToast } from '@/hooks/use-toast';

// Define the context shape
interface CryptoContextType {
  userData: UserData;
  userAuth: UserAuth | null;
  isLoggedIn: boolean;
  isAuthenticated: boolean; // Added for App.tsx
  registerUser: (email: string, password: string) => boolean;
  loginUser: (credentials: { email: string; password: string }) => boolean;
  socialLogin: (provider: 'github' | 'telegram') => boolean;
  logoutUser: () => void;
  logout: () => void; // Alias for DeleteAccountDialog.tsx
  updateUserStats: (stats: Partial<UserStats>) => void;
  refreshData: () => void;
  resetData: () => void; // Added for DeleteAccountDialog.tsx
  extendMiningDuration: () => void; // Added for MiningCard.tsx
  updateMiningSpace: (id: number, data: Partial<MiningSpace>) => void; // Added for MiningSpaces.tsx
  addScoins: (amount: number) => void; // Added for MiningSpaces.tsx
  convertScoinsToScr: () => void; // Added for Dashboard.tsx and Wallet.tsx
  addScr: (amount: number) => void; // Added for Mining.tsx and Wallet.tsx
  addExp: (amount: number) => void; // Added for Mining.tsx and Profile.tsx
}

// Import these types directly from dataService
import { UserStats, MiningSpace } from '@/lib/dataService';

// Provider component
export const CryptoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>(DataService.initData());
  const [userAuth, setUserAuth] = useState<UserAuth | null>(DataService.getAuth());
  const { toast } = useToast();

  // Refresh data
  const refreshData = () => {
    setUserData(DataService.initData());
    setUserAuth(DataService.getAuth());
  };

  // Initial load
  useEffect(() => {
    // Load data from localStorage on component mount
    const initialData = DataService.initData();
    setUserData(initialData);
    
    // Load auth data
    const authData = DataService.getAuth();
    setUserAuth(authData);
    
    // Process any pending mining from background
    const updatedData = DataService.processPendingMining();
    setUserData(updatedData);
  }, []);

  // Register a new user
  const registerUser = (email: string, password: string): boolean => {
    try {
      // Create a new user
      const newUser = DataService.registerUser({
        email,
        password,
        fullName: '',
        username: '',
        isEmailVerified: false,
        isPhoneVerified: false,
        provider: 'email'
      });
      
      // Set the user auth
      setUserAuth(newUser);
      
      // Update user data
      refreshData();
      
      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
  };

  // Login a user
  const loginUser = (credentials: { email: string; password: string }): boolean => {
    try {
      const loggedInUser = DataService.loginUser(credentials);
      
      if (loggedInUser) {
        setUserAuth(loggedInUser);
        refreshData();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };
  
  // Social login
  const socialLogin = (provider: 'github' | 'telegram'): boolean => {
    try {
      const loggedInUser = DataService.socialLogin(provider);
      
      if (loggedInUser) {
        setUserAuth(loggedInUser);
        refreshData();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error with ${provider} login:`, error);
      return false;
    }
  };

  // Logout user
  const logoutUser = (): void => {
    DataService.logoutUser();
    setUserAuth(null);
    refreshData();
  };

  // Alias for logoutUser
  const logout = logoutUser;

  // Update user stats
  const updateUserStats = (stats: Partial<UserStats>): void => {
    const updatedData = DataService.updateUserStats(stats);
    setUserData(updatedData);
  };

  // Reset all user data
  const resetData = (): void => {
    const freshData = DataService.resetData();
    setUserData(freshData);
    setUserAuth(null);
  };

  // Extend mining duration
  const extendMiningDuration = (): void => {
    if (userData.userStats.scoins < 5) {
      toast({
        title: "Not Enough Scoins",
        description: "You need 5 Scoins to extend mining duration to 24 hours",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    const updatedData = DataService.extendMiningDuration(5);
    setUserData(updatedData);
    
    toast({
      title: "Mining Duration Extended",
      description: "Mining duration extended to 24 hours",
      duration: 3000,
    });
  };

  // Update mining space
  const updateMiningSpace = (id: number, data: Partial<MiningSpace>): void => {
    const updatedData = DataService.updateMiningSpace(id, data);
    setUserData(updatedData);
  };

  // Add Scoins to user
  const addScoins = (amount: number): void => {
    const updatedData = DataService.updateUserStats({
      scoins: userData.userStats.scoins + amount
    });
    setUserData(updatedData);
  };

  // Convert Scoins to SCR
  const convertScoinsToScr = (): void => {
    if (userData.userStats.scoins < 10) {
      toast({
        title: "Not Enough Scoins",
        description: "You need at least 10 Scoins to convert to SCR",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    // Get current SCR price
    const scrPrice = DataService.getScrPrice();
    
    // Calculate conversion (10 Scoins = 0.01 SCR)
    const scoinsToConvert = Math.floor(userData.userStats.scoins / 10) * 10;
    const scrToAdd = (scoinsToConvert / 10) * 0.01;
    
    // Update user stats (remove Scoins)
    const updatedStatsData = DataService.updateUserStats({
      scoins: userData.userStats.scoins - scoinsToConvert
    });
    
    // Add SCR to holdings
    const currentHolding = updatedStatsData.holdings.find(h => h.symbol === 'SCR');
    const currentAmount = currentHolding ? currentHolding.amount : 0;
    const updatedHoldingsData = DataService.updateHolding('SCR', currentAmount + scrToAdd);
    
    // Add transaction record
    const updatedData = DataService.addTransaction({
      type: 'convert',
      amount: scrToAdd,
      symbol: 'SCR',
      timestamp: Date.now(),
      valueUsd: scrToAdd * scrPrice,
      status: 'completed'
    });
    
    setUserData(updatedData);
    
    toast({
      title: "Conversion Successful",
      description: `Converted ${scoinsToConvert} Scoins to ${scrToAdd.toFixed(4)} SCR`,
      duration: 3000,
    });
  };

  // Add SCR to user
  const addScr = (amount: number): void => {
    // Get current SCR price
    const scrPrice = DataService.getScrPrice();
    
    // Get current SCR holding
    const currentHolding = userData.holdings.find(h => h.symbol === 'SCR');
    const currentAmount = currentHolding ? currentHolding.amount : 0;
    
    // Update holding
    const updatedHoldingsData = DataService.updateHolding('SCR', currentAmount + amount);
    
    // Add transaction record
    const updatedData = DataService.addTransaction({
      type: 'mine',
      amount: amount,
      symbol: 'SCR',
      timestamp: Date.now(),
      valueUsd: amount * scrPrice,
      status: 'completed'
    });
    
    setUserData(updatedData);
    
    toast({
      title: "SCR Added",
      description: `Added ${amount.toFixed(4)} SCR to your wallet`,
      duration: 3000,
    });
  };

  // Add experience points
  const addExp = (amount: number): void => {
    const currentExp = userData.userStats.exp;
    const currentLevel = userData.userStats.level;
    const expRequired = userData.userStats.expRequired;
    
    let newExp = currentExp + amount;
    let newLevel = currentLevel;
    
    // Check if level up
    if (newExp >= expRequired && currentLevel < 10) {
      newLevel = currentLevel + 1;
      newExp = newExp - expRequired;
      
      // Calculate new expRequired for next level
      const newExpRequired = Math.floor(100 * Math.pow(1.5, newLevel - 1));
      
      const updatedData = DataService.updateUserStats({
        level: newLevel,
        exp: newExp,
        expRequired: newExpRequired
      });
      
      setUserData(updatedData);
      
      toast({
        title: "Level Up!",
        description: `You've reached level ${newLevel}!`,
        duration: 3000,
      });
    } else {
      const updatedData = DataService.updateUserStats({
        exp: newExp
      });
      
      setUserData(updatedData);
    }
  };

  // Value to be provided
  const contextValue: CryptoContextType = {
    userData,
    userAuth,
    isLoggedIn: !!userAuth,
    isAuthenticated: !!userAuth, // Added for App.tsx
    registerUser,
    loginUser,
    socialLogin,
    logoutUser,
    logout, // Alias for DeleteAccountDialog.tsx
    updateUserStats,
    refreshData,
    resetData, // Added for DeleteAccountDialog.tsx
    extendMiningDuration, // Added for MiningCard.tsx
    updateMiningSpace, // Added for MiningSpaces.tsx
    addScoins, // Added for MiningSpaces.tsx
    convertScoinsToScr, // Added for Dashboard.tsx and Wallet.tsx
    addScr, // Added for Mining.tsx and Wallet.tsx
    addExp // Added for Mining.tsx and Profile.tsx
  };

  return (
    <CryptoContext.Provider value={contextValue}>
      {children}
    </CryptoContext.Provider>
  );
};

// Create the context
const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

// Custom hook to use the crypto context
export const useCrypto = (): CryptoContextType => {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
};

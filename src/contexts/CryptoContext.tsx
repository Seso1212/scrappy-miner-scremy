import React, { createContext, useContext, useState, useEffect } from 'react';
import { DataService, UserData, UserAuth, UserProvider, UserStats } from '@/lib/dataService';
import { useToast } from '@/hooks/use-toast';

// Define the context shape
interface CryptoContextType {
  userData: UserData;
  userAuth: UserAuth | null;
  isLoggedIn: boolean;
  registerUser: (email: string, password: string) => boolean;
  loginUser: (credentials: { email: string; password: string }) => boolean;
  socialLogin: (provider: 'github' | 'telegram') => boolean;
  logoutUser: () => void;
  updateUserStats: (stats: Partial<UserStats>) => void;
  refreshData: () => void;
}

// Create the context
const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

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

  // Update user stats
  const updateUserStats = (stats: Partial<UserStats>): void => {
    const updatedData = DataService.updateUserStats(stats);
    setUserData(updatedData);
  };

  // Value to be provided
  const contextValue: CryptoContextType = {
    userData,
    userAuth,
    isLoggedIn: !!userAuth,
    registerUser,
    loginUser,
    socialLogin,
    logoutUser,
    updateUserStats,
    refreshData
  };

  return (
    <CryptoContext.Provider value={contextValue}>
      {children}
    </CryptoContext.Provider>
  );
};

// Custom hook to use the crypto context
export const useCrypto = (): CryptoContextType => {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
};

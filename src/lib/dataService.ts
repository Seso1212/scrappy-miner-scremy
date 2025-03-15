// Data persistence service for ScremyCoin application

// Define types for our data models
export interface CryptoHolding {
  symbol: string;
  name: string;
  amount: number;
  valueUsd: number;
  icon?: string;
}

export interface UserStats {
  level: number;
  exp: number;
  expRequired: number;
  successfulMines: number;
  totalAttempts: number;
  balance: number;
  scoins: number;
  activeMiningTime: number;
  autoMining: boolean;
  lastMiningTimestamp?: number;
  profileCompleted: boolean;
  firstName?: string;
  lastName?: string;
  username?: string;
  countryCode?: string;
  phoneNumber?: string;
  referralCode?: string;
}

export interface MiningSpace {
  id: number;
  active: boolean;
  unlocked: boolean;
  isPremium: boolean;
  expiresAt?: number;
  scoinsEarned: number;
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: number;
}

export type AuthProvider = 'email' | 'github' | 'telegram' | 'google';

export interface UserAuth {
  id: string;
  email: string;
  fullName: string;
  username: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  hasCompletedKyc: boolean;
  password: string;
  provider: AuthProvider;
  lastLogin: number;
}

// Main user data interface
export interface UserData {
  userStats: UserStats;
  holdings: CryptoHolding[];
  miningSpaces: MiningSpace[];
  marketData: MarketData[];
  transactions: Transaction[];
  auth?: UserAuth;
  lastUpdated: number;
}

export interface Transaction {
  id: string;
  type: 'mine' | 'buy' | 'sell' | 'transfer' | 'convert';
  amount: number;
  symbol: string;
  timestamp: number;
  valueUsd?: number;
  fee?: number;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
}

// Default data for new users
const DEFAULT_USER_DATA: UserData = {
  userStats: {
    level: 1,
    exp: 0,
    expRequired: 100,
    successfulMines: 0,
    totalAttempts: 0,
    balance: 0,
    scoins: 0,
    activeMiningTime: 0,
    autoMining: true,
    lastMiningTimestamp: undefined,
    profileCompleted: false,
    firstName: '',
    lastName: '',
    username: '',
  },
  holdings: [
    {
      symbol: 'SCR',
      name: 'ScremyCoin',
      amount: 0,
      valueUsd: 0,
      icon: '💎'
    }
  ],
  miningSpaces: [
    { id: 1, active: false, unlocked: true, isPremium: false, scoinsEarned: 0 },
    { id: 2, active: false, unlocked: false, isPremium: false, scoinsEarned: 0 },
    { id: 3, active: false, unlocked: false, isPremium: false, scoinsEarned: 0 },
    { id: 4, active: false, unlocked: false, isPremium: false, scoinsEarned: 0 },
    { id: 5, active: false, unlocked: false, isPremium: false, scoinsEarned: 0 }
  ],
  marketData: [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 49876.32,
      change24h: 2.5,
      volume24h: 29645123890,
      marketCap: 967453921834,
      lastUpdated: Date.now()
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 3226.74,
      change24h: 1.2,
      volume24h: 15432678945,
      marketCap: 387654321098,
      lastUpdated: Date.now()
    },
    {
      symbol: 'SCR',
      name: 'ScremyCoin',
      price: 0.15,
      change24h: 5.8,
      volume24h: 7865432,
      marketCap: 15000000,
      lastUpdated: Date.now()
    }
  ],
  transactions: [],
  lastUpdated: Date.now()
};

// Local storage key
const STORAGE_KEY = 'scremycoin_app_data';
const AUTH_KEY = 'scremycoin_auth';

// Timestamp constants
const HOUR_IN_MS = 3600000;
const MAX_MINING_DURATION = 12 * HOUR_IN_MS; // 12 hours in milliseconds
const EXTENDED_MINING_DURATION = 24 * HOUR_IN_MS; // 24 hours in milliseconds

// Social login mock users
const SOCIAL_MOCK_USERS = {
  github: {
    id: 'github-user-123',
    email: 'github-user@example.com',
    fullName: 'GitHub User',
    username: 'githubuser',
    isEmailVerified: true,
    isPhoneVerified: false,
    hasCompletedKyc: false,
    password: '', // Not needed for OAuth
    provider: 'github' as AuthProvider,
    lastLogin: Date.now()
  },
  telegram: {
    id: 'telegram-user-456',
    email: 'telegram-user@example.com',
    fullName: 'Telegram User',
    username: 'telegramuser',
    isEmailVerified: true,
    isPhoneVerified: true,
    hasCompletedKyc: false,
    password: '', // Not needed for OAuth
    provider: 'telegram' as AuthProvider,
    lastLogin: Date.now()
  },
  google: {
    id: 'google-user-789',
    email: 'google-user@example.com',
    fullName: 'Google User',
    username: 'googleuser',
    isEmailVerified: true,
    isPhoneVerified: false,
    hasCompletedKyc: false,
    password: '', // Not needed for OAuth
    provider: 'google' as AuthProvider,
    lastLogin: Date.now()
  }
};

// Service functions
export const DataService = {
  // Initialize data from localStorage or use defaults
  initData: (): UserData => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        return JSON.parse(storedData) as UserData;
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
    return { ...DEFAULT_USER_DATA };
  },

  // Save data to localStorage
  saveData: (data: UserData): void => {
    try {
      data.lastUpdated = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  },

  // Authentication methods
  saveAuth: (auth: UserAuth): void => {
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    } catch (error) {
      console.error('Error saving auth to localStorage:', error);
    }
  },

  getAuth: (): UserAuth | null => {
    try {
      const storedAuth = localStorage.getItem(AUTH_KEY);
      if (storedAuth) {
        return JSON.parse(storedAuth) as UserAuth;
      }
    } catch (error) {
      console.error('Error loading auth from localStorage:', error);
    }
    return null;
  },

  isLoggedIn: (): boolean => {
    return DataService.getAuth() !== null;
  },

  loginUser: (credentials: { email: string; password: string }): UserAuth | null => {
    const auth = DataService.getAuth();
    if (auth && auth.email === credentials.email && auth.password === credentials.password) {
      auth.lastLogin = Date.now();
      DataService.saveAuth(auth);
      return auth;
    }
    return null;
  },

  // Social login method
  socialLogin: (provider: 'github' | 'telegram' | 'google'): UserAuth | null => {
    const mockUser = SOCIAL_MOCK_USERS[provider];
    
    if (!mockUser) {
      console.error(`No mock user available for provider: ${provider}`);
      return null;
    }
    
    const user = { ...mockUser, lastLogin: Date.now() };
    
    DataService.saveAuth(user);
    
    const userData = DataService.initData();
    userData.auth = user;
    DataService.saveData(userData);
    
    return user;
  },

  registerUser: (user: Omit<UserAuth, 'id' | 'lastLogin' | 'hasCompletedKyc'>): UserAuth => {
    const newUser: UserAuth = {
      ...user,
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lastLogin: Date.now(),
      hasCompletedKyc: false
    };
    
    DataService.saveAuth(newUser);
    
    const userData = DataService.initData();
    userData.auth = newUser;
    DataService.saveData(userData);
    
    return newUser;
  },

  logoutUser: (): void => {
    localStorage.removeItem(AUTH_KEY);
  },

  // Update user stats
  updateUserStats: (stats: Partial<UserStats>): UserData => {
    const currentData = DataService.initData();
    const updatedData = {
      ...currentData,
      userStats: {
        ...currentData.userStats,
        ...stats
      }
    };
    DataService.saveData(updatedData);
    return updatedData;
  },

  // Add transaction
  addTransaction: (transaction: Omit<Transaction, 'id'>): UserData => {
    const currentData = DataService.initData();
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    
    const updatedData = {
      ...currentData,
      transactions: [newTransaction, ...currentData.transactions].slice(0, 100)
    };
    
    DataService.saveData(updatedData);
    return updatedData;
  },

  // Update crypto holding
  updateHolding: (symbol: string, amount: number): UserData => {
    const currentData = DataService.initData();
    const marketData = currentData.marketData.find(m => m.symbol === symbol);
    const valueUsd = marketData ? marketData.price * amount : 0;
    
    let holdings = [...currentData.holdings];
    const existingIndex = holdings.findIndex(h => h.symbol === symbol);
    
    if (existingIndex >= 0) {
      holdings[existingIndex] = {
        ...holdings[existingIndex],
        amount,
        valueUsd
      };
    } else if (amount > 0) {
      holdings.push({
        symbol,
        name: marketData?.name || symbol,
        amount,
        valueUsd,
        icon: symbol === 'SCR' ? '💎' : undefined
      });
    }
    
    holdings = holdings.filter(h => h.amount > 0);
    
    const updatedData = {
      ...currentData,
      holdings
    };
    
    DataService.saveData(updatedData);
    return updatedData;
  },

  // Update mining space
  updateMiningSpace: (id: number, data: Partial<MiningSpace>): UserData => {
    const currentData = DataService.initData();
    const spaces = [...currentData.miningSpaces];
    const spaceIndex = spaces.findIndex(s => s.id === id);
    
    if (spaceIndex >= 0) {
      spaces[spaceIndex] = {
        ...spaces[spaceIndex],
        ...data
      };
    }
    
    const updatedData = {
      ...currentData,
      miningSpaces: spaces
    };
    
    DataService.saveData(updatedData);
    return updatedData;
  },

  // Extend mining duration to 24 hours for a cost of 5 scoins
  extendMiningDuration: (scoins: number): UserData => {
    if (scoins < 5) {
      throw new Error("Not enough Scoins to extend mining duration");
    }
    
    const currentData = DataService.initData();
    
    const updatedData = {
      ...currentData,
      userStats: {
        ...currentData.userStats,
        scoins: currentData.userStats.scoins - 5
      }
    };
    
    DataService.saveData(updatedData);
    return updatedData;
  },

  // Get the current SCR price
  getScrPrice: (): number => {
    const data = DataService.initData();
    const scrData = data.marketData.find(m => m.symbol === 'SCR');
    return scrData?.price || 0.15;
  },

  // Reset all data
  resetData: (): UserData => {
    const freshData = { ...DEFAULT_USER_DATA };
    DataService.saveData(freshData);
    return freshData;
  },
  
  // Process background mining (called on app load)
  processPendingMining: (): UserData => {
    const currentData = DataService.initData();
    const now = Date.now();
    
    if (currentData.userStats.lastMiningTimestamp) {
      const elapsedTime = now - currentData.userStats.lastMiningTimestamp;
      
      if (elapsedTime > 0) {
        const miningRate = 0.0001 * currentData.userStats.level;
        const maxTime = MAX_MINING_DURATION;
        const actualTime = Math.min(elapsedTime, maxTime);
        const scrMined = (actualTime / 1000) * miningRate;
        
        if (scrMined > 0) {
          const currentScr = currentData.holdings.find(h => h.symbol === 'SCR')?.amount || 0;
          
          const updatedHoldings = currentData.holdings.map(h => {
            if (h.symbol === 'SCR') {
              return { ...h, amount: h.amount + scrMined };
            }
            return h;
          });
          
          const updatedStats = {
            ...currentData.userStats,
            activeMiningTime: currentData.userStats.activeMiningTime + (actualTime / 1000),
            successfulMines: currentData.userStats.successfulMines + Math.floor(actualTime / 30000),
            totalAttempts: currentData.userStats.totalAttempts + Math.floor(actualTime / 30000),
            lastMiningTimestamp: undefined
          };
          
          const newTransaction: Transaction = {
            id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: 'mine',
            amount: scrMined,
            symbol: 'SCR',
            timestamp: now,
            valueUsd: scrMined * DataService.getScrPrice(),
            status: 'completed'
          };
          
          const updatedData = {
            ...currentData,
            userStats: updatedStats,
            holdings: updatedHoldings,
            transactions: [newTransaction, ...currentData.transactions].slice(0, 100)
          };
          
          DataService.saveData(updatedData);
          return updatedData;
        }
      }
    }
    
    const updatedSpaces = currentData.miningSpaces.map(space => {
      if (space.active && space.expiresAt) {
        if (space.expiresAt > now) {
          const elapsedSeconds = (now - (currentData.lastUpdated || now)) / 1000;
          const scoinsPerHour = 5;
          const scoinsPerSecond = scoinsPerHour / 3600;
          const newScoins = space.scoinsEarned + (elapsedSeconds * scoinsPerSecond);
          
          return { ...space, scoinsEarned: newScoins };
        } else {
          return { ...space, active: false, expiresAt: undefined };
        }
      }
      return space;
    });
    
    if (JSON.stringify(updatedSpaces) !== JSON.stringify(currentData.miningSpaces)) {
      const updatedData = {
        ...currentData,
        miningSpaces: updatedSpaces
      };
      
      DataService.saveData(updatedData);
      return updatedData;
    }
    
    return currentData;
  }
};

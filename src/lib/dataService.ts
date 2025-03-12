
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

// Main user data interface
export interface UserData {
  userStats: UserStats;
  holdings: CryptoHolding[];
  miningSpaces: MiningSpace[];
  marketData: MarketData[];
  transactions: Transaction[];
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
    autoMining: true
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
      transactions: [newTransaction, ...currentData.transactions].slice(0, 100) // Keep last 100 transactions
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
    
    // Filter out zero balances
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
  }
};

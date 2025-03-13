
// Mining utility functions

export const MAX_MINING_TIME = 86400; // 24 hours in seconds

// Calculate experience required for next level
export const calculateExpRequired = (level: number): number => {
  const baseExp = 100;
  const multiplier = 1.5;
  return Math.floor(baseExp * Math.pow(multiplier, level - 1));
};

// Format number with commas
export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat().format(number);
};

// Format time from seconds to hh:mm:ss
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
};

// Format floats to fixed decimal places
export const formatFloat = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

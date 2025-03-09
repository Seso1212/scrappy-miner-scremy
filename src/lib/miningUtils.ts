
// Utility functions for mining logic

/**
 * Calculate mining reward based on level
 * Rewards 0.05 to 0.5 SCR per hour based on level
 */
export const calculateReward = (level: number): number => {
  // Base reward starts at 0.05 SCR/hour for level 1
  // Max reward is 0.5 SCR/hour for level 10
  const baseReward = 0.05;
  const maxReward = 0.5;
  const normalizedLevel = Math.max(1, Math.min(10, level));
  
  // Calculate reward based on level
  const rewardMultiplier = (normalizedLevel - 1) / 9; // 0 for level=1, 1 for level=10
  const rewardPerHour = baseReward + rewardMultiplier * (maxReward - baseReward);
  
  // Convert to reward per block (30 second blocks)
  const rewardPerBlock = rewardPerHour / 120; // 120 blocks per hour (30 seconds each)
  
  // Round to 4 decimal places
  return Math.round(rewardPerBlock * 10000) / 10000;
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

/**
 * Generate a hash-like string for visualization
 */
export const generateHash = (): string => {
  return Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

/**
 * Format time in seconds to mm:ss format
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format time in seconds to hh:mm:ss format
 */
export const formatLongTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculate max mining time (24 hours in seconds)
 */
export const MAX_MINING_TIME = 24 * 60 * 60; // 24 hours in seconds

/**
 * Calculate max space mining time (12 hours in seconds)
 */
export const MAX_SPACE_MINING_TIME = 12 * 60 * 60; // 12 hours in seconds

/**
 * Mining duration is 30 seconds
 */
export const MINING_DURATION = 30 * 1000; // 30 seconds in milliseconds

/**
 * Get random mining duration between 25-35 seconds
 */
export const getRandomMiningDuration = (): number => {
  return Math.floor(Math.random() * (35 * 1000 - 25 * 1000 + 1)) + 25 * 1000;
};

/**
 * Space ad duration in hours
 */
export const SPACE_AD_DURATION = 12; // 12 hours

/**
 * Maximum number of mining spaces
 */
export const MAX_SPACES = 5;

/**
 * Base EXP needed for leveling up
 */
export const BASE_EXP_REQUIRED = 100;

/**
 * Calculate exp required for level up
 */
export const calculateExpRequired = (level: number): number => {
  return BASE_EXP_REQUIRED * Math.pow(1.5, level - 1);
};

/**
 * Scoins per ad view
 */
export const SCOINS_PER_AD = 5;

/**
 * Scoins per hour of mining space
 */
export const SCOINS_PER_HOUR = 5;

/**
 * Friend referral bonus percentage
 */
export const FRIEND_REFERRAL_BONUS = 0.2; // 20%


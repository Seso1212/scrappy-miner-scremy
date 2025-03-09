
// Utility functions for mining logic

/**
 * Calculate probability of successful mining based on difficulty
 * @param difficulty 1-10 scale where higher is more difficult
 * @returns Probability of success (0-1)
 */
export const calculateMiningProbability = (difficulty: number): number => {
  // Normalize difficulty to 1-10 range
  const normalizedDifficulty = Math.max(1, Math.min(10, difficulty));
  // Higher difficulty = lower probability
  return 1 - (normalizedDifficulty - 1) / 10;
};

/**
 * Simulate mining attempt
 * @param difficulty 1-10 scale
 * @returns Whether mining was successful
 */
export const attemptMining = (difficulty: number): boolean => {
  const probability = calculateMiningProbability(difficulty);
  return Math.random() < probability;
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
 * Calculate mining reward based on difficulty
 * Rewards 0.11 to 1.92 SCR based on difficulty
 */
export const calculateReward = (difficulty: number): number => {
  // Base reward starts at 0.11 SCR for difficulty 1
  // Max reward is 1.92 SCR for difficulty 10
  const baseReward = 0.11;
  const maxReward = 1.92;
  const normalizedDifficulty = Math.max(1, Math.min(10, difficulty));
  
  // Calculate reward based on difficulty
  const rewardMultiplier = (normalizedDifficulty - 1) / 9; // 0 for diff=1, 1 for diff=10
  const reward = baseReward + rewardMultiplier * (maxReward - baseReward);
  
  // Round to 2 decimal places
  return Math.round(reward * 100) / 100;
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
 * Mining duration range in milliseconds (25-35 seconds)
 */
export const MIN_MINING_DURATION = 25 * 1000; // 25 seconds
export const MAX_MINING_DURATION = 35 * 1000; // 35 seconds

/**
 * Get random mining duration between MIN and MAX
 */
export const getRandomMiningDuration = (): number => {
  return Math.floor(Math.random() * (MAX_MINING_DURATION - MIN_MINING_DURATION + 1)) + MIN_MINING_DURATION;
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
 * Base reward for level 1
 */
export const BASE_REWARD = 0.1;


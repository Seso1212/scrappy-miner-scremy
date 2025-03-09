
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
 */
export const calculateReward = (difficulty: number): number => {
  // Base reward is 50 SCR
  return 50;
};

/**
 * Format time in seconds to mm:ss format
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

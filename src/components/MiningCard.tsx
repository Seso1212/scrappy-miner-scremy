
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  PlayCircle, 
  PauseCircle, 
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Info
} from 'lucide-react';

import { 
  calculateMiningProbability, 
  attemptMining, 
  calculateReward, 
  MINING_DURATION,
  MAX_MINING_TIME 
} from '@/lib/miningUtils';
import { useToast } from "@/components/ui/use-toast";

interface MiningCardProps {
  onMiningUpdate: (data: {
    isMining: boolean;
    wasSuccessful?: boolean;
    reward?: number;
  }) => void;
  onStatsUpdate: (data: {
    difficulty: number;
    successfulMines: number;
    totalAttempts: number;
    balance: number;
    activeMiningTime: number;
  }) => void;
}

const MiningCard: React.FC<MiningCardProps> = ({
  onMiningUpdate,
  onStatsUpdate
}) => {
  const { toast } = useToast();

  // Mining state
  const [isMining, setIsMining] = useState(false);
  const [difficulty, setDifficulty] = useState(5);
  const [successfulMines, setSuccessfulMines] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [balance, setBalance] = useState(0);
  const [activeMiningTime, setActiveMiningTime] = useState(0);
  const [successfulAnimation, setSuccessfulAnimation] = useState(false);
  const [miningTimeout, setMiningTimeout] = useState<number | null>(null);
  const [timeInterval, setTimeInterval] = useState<number | null>(null);
  const [isMiningComplete, setIsMiningComplete] = useState(false);

  // Mining info
  const probability = calculateMiningProbability(difficulty);
  const successProbability = Math.floor(probability * 100);
  const reward = calculateReward(difficulty);

  // Process mining attempt
  const processMiningAttempt = () => {
    const success = attemptMining(difficulty);
    const newTotalAttempts = totalAttempts + 1;
    
    setTotalAttempts(newTotalAttempts);
    
    if (success) {
      const newSuccessfulMines = successfulMines + 1;
      const miningReward = calculateReward(difficulty);
      const newBalance = balance + miningReward;
      
      setSuccessfulMines(newSuccessfulMines);
      setBalance(newBalance);
      setSuccessfulAnimation(true);
      
      // Notify parent component
      onMiningUpdate({ 
        isMining: false, 
        wasSuccessful: true,
        reward: miningReward
      });
      
      // Reset mining
      stopMining();
      
      // Show toast notification
      toast({
        title: "Block Successfully Mined!",
        description: `You earned ${miningReward.toFixed(2)} SCR.`,
        duration: 3000,
      });
    } else {
      // Mining failed, but operation is now complete
      setIsMiningComplete(true);
      stopMining();
      
      // Notify parent that mining is complete but unsuccessful
      onMiningUpdate({ isMining: false, wasSuccessful: false });
      
      toast({
        title: "Mining Unsuccessful",
        description: "Try again or adjust difficulty.",
        duration: 3000,
      });
    }
    
    // Update parent component with current stats
    onStatsUpdate({
      difficulty,
      successfulMines: success ? successfulMines + 1 : successfulMines,
      totalAttempts: newTotalAttempts,
      balance: success ? balance + reward : balance,
      activeMiningTime
    });
  };

  // Start mining function
  const startMining = () => {
    if (isMining) return;
    
    setIsMining(true);
    setSuccessfulAnimation(false);
    setIsMiningComplete(false);
    
    // Notify parent component
    onMiningUpdate({ isMining: true });
    
    // Set up fixed mining timeout (30 seconds)
    const timeout = window.setTimeout(() => {
      processMiningAttempt();
    }, MINING_DURATION);
    
    setMiningTimeout(timeout);
    
    // Set up time tracking interval
    const timeTracker = window.setInterval(() => {
      setActiveMiningTime(prev => {
        // Check if we've reached the maximum mining time
        if (prev >= MAX_MINING_TIME) {
          stopMining();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    
    setTimeInterval(timeTracker);
  };

  // Stop mining function
  const stopMining = () => {
    setIsMining(false);
    
    // Clear timeout and intervals
    if (miningTimeout) {
      clearTimeout(miningTimeout);
      setMiningTimeout(null);
    }
    
    if (timeInterval) {
      clearInterval(timeInterval);
      setTimeInterval(null);
    }
    
    // Notify parent component
    onMiningUpdate({ isMining: false });
  };

  // Handle difficulty change
  const handleDifficultyChange = (newValue: number[]) => {
    setDifficulty(newValue[0]);
    
    // Update parent with new difficulty
    onStatsUpdate({
      difficulty: newValue[0],
      successfulMines,
      totalAttempts,
      balance,
      activeMiningTime
    });
  };

  // Increment/decrement difficulty
  const adjustDifficulty = (amount: number) => {
    const newDifficulty = Math.min(Math.max(difficulty + amount, 1), 10);
    setDifficulty(newDifficulty);
    
    // Update parent with new difficulty
    onStatsUpdate({
      difficulty: newDifficulty,
      successfulMines,
      totalAttempts,
      balance,
      activeMiningTime
    });
  };

  // Reset mining stats
  const resetStats = () => {
    if (isMining) {
      stopMining();
    }
    
    setSuccessfulMines(0);
    setTotalAttempts(0);
    setBalance(0);
    setActiveMiningTime(0);
    setSuccessfulAnimation(false);
    setIsMiningComplete(false);
    
    // Update parent component
    onStatsUpdate({
      difficulty,
      successfulMines: 0,
      totalAttempts: 0,
      balance: 0,
      activeMiningTime: 0
    });
    
    toast({
      title: "Stats Reset",
      description: "All mining statistics have been reset.",
      duration: 3000,
    });
  };

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (miningTimeout) clearTimeout(miningTimeout);
      if (timeInterval) clearInterval(timeInterval);
    };
  }, [miningTimeout, timeInterval]);

  // Update parent component with initial stats
  useEffect(() => {
    onStatsUpdate({
      difficulty,
      successfulMines,
      totalAttempts,
      balance,
      activeMiningTime
    });
  }, []);
  
  return (
    <div className="glass-card rounded-xl p-6 shadow-sm transition-all duration-300">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Mining Control</h2>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={resetStats}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-6">
          {/* Difficulty control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Mining Difficulty
                <div className="relative group">
                  <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    Higher difficulty means lower chance of successful mining but higher rewards.
                  </div>
                </div>
              </label>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => adjustDifficulty(-1)}
                  disabled={difficulty <= 1 || isMining}
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-sm font-medium">{difficulty}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => adjustDifficulty(1)}
                  disabled={difficulty >= 10 || isMining}
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <Slider
              value={[difficulty]}
              min={1}
              max={10}
              step={1}
              onValueChange={handleDifficultyChange}
              disabled={isMining}
              className="py-1"
            />
            
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>Fixed</span>
              <span>Not Fixed</span>
            </div>
          </div>
          
          {/* Mining info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Success Chance</p>
              <p className="font-semibold">{successProbability}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Reward per Block</p>
              <p className="font-semibold">{reward.toFixed(2)} <span className="text-scremy">SCR</span></p>
            </div>
          </div>
          
          {/* Mining controls */}
          <div className="flex justify-center pt-2">
            {!isMining ? (
              <Button 
                onClick={startMining} 
                className="bg-scremy hover:bg-scremy/90 text-scremy-foreground"
                disabled={successfulAnimation || isMiningComplete}
                size="lg"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Start Mining
              </Button>
            ) : (
              <Button 
                onClick={stopMining} 
                variant="outline"
                size="lg"
              >
                <PauseCircle className="mr-2 h-5 w-5" />
                Stop Mining
              </Button>
            )}
          </div>
          
          {/* Mining status */}
          <div className="text-center text-sm text-muted-foreground">
            {isMining && (
              <p>Mining in progress... (30 seconds)</p>
            )}
            {!isMining && isMiningComplete && !successfulAnimation && (
              <p>Mining attempt failed. Try again?</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiningCard;

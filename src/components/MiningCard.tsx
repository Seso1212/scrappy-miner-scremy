
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  PlayCircle, 
  PauseCircle, 
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Info,
  Repeat
} from 'lucide-react';

import { 
  calculateMiningProbability, 
  attemptMining, 
  calculateReward, 
  MAX_MINING_TIME,
  getRandomMiningDuration,
  BASE_REWARD,
  formatLongTime
} from '@/lib/miningUtils';
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

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
    level: number;
    autoMining: boolean;
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
  const [autoMining, setAutoMining] = useState(true);
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0);
  const [taskCompleted, setTaskCompleted] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const [miningDuration, setMiningDuration] = useState(30000); // Default duration
  const [progressTimer, setProgressTimer] = useState<number | null>(null);
  const [progressValue, setProgressValue] = useState(0);

  // Mining info
  const probability = calculateMiningProbability(difficulty);
  const successProbability = Math.floor(probability * 100);
  const reward = calculateReward(difficulty);
  const levelReward = BASE_REWARD * level;

  // Tasks for level progression
  const tasks = [
    "Mine 5 blocks successfully",
    "Mine at difficulty 7 or higher",
    "Achieve 10 successful mines",
    "Mine with 75% success rate",
    "Maintain auto-mining for 30 minutes",
    "Mine 20 blocks successfully",
    "Mine at difficulty 10",
    "Achieve 50 successful mines",
    "Mine with 90% success rate",
    "Complete 24 hours of mining"
  ];

  // Update current task based on level
  useEffect(() => {
    if (level <= 10) {
      setCurrentTask(tasks[level - 1]);
      setProgress(0);
      setTaskCompleted(0);
    }
  }, [level]);

  // Check task completion
  const checkTaskCompletion = () => {
    let completed = 0;
    const successRate = totalAttempts > 0 ? (successfulMines / totalAttempts) * 100 : 0;
    
    // Check which task is complete based on level
    switch(level) {
      case 1:
        completed = Math.min(successfulMines / 5, 1);
        if (successfulMines >= 5) {
          levelUp();
        }
        break;
      case 2:
        if (difficulty >= 7) {
          completed = 1;
          levelUp();
        }
        break;
      case 3:
        completed = Math.min(successfulMines / 10, 1);
        if (successfulMines >= 10) {
          levelUp();
        }
        break;
      case 4:
        completed = Math.min(successRate / 75, 1);
        if (successRate >= 75 && totalAttempts >= 4) {
          levelUp();
        }
        break;
      case 5:
        completed = Math.min(activeMiningTime / (30 * 60), 1);
        if (activeMiningTime >= 30 * 60) {
          levelUp();
        }
        break;
      case 6:
        completed = Math.min(successfulMines / 20, 1);
        if (successfulMines >= 20) {
          levelUp();
        }
        break;
      case 7:
        if (difficulty >= 10) {
          completed = 1;
          levelUp();
        }
        break;
      case 8:
        completed = Math.min(successfulMines / 50, 1);
        if (successfulMines >= 50) {
          levelUp();
        }
        break;
      case 9:
        completed = Math.min(successRate / 90, 1);
        if (successRate >= 90 && totalAttempts >= 10) {
          levelUp();
        }
        break;
      case 10:
        completed = Math.min(activeMiningTime / MAX_MINING_TIME, 1);
        if (activeMiningTime >= MAX_MINING_TIME) {
          levelUp();
        }
        break;
    }
    
    setProgress(completed);
    setTaskCompleted(Math.floor(completed * 100));
  };

  // Level up function
  const levelUp = () => {
    if (level < 10) {
      const newLevel = level + 1;
      setLevel(newLevel);
      toast({
        title: "Level Up!",
        description: `You've reached level ${newLevel}! New task unlocked.`,
        duration: 3000,
      });
    }
  };

  // Process mining attempt
  const processMiningAttempt = () => {
    const success = attemptMining(difficulty);
    const newTotalAttempts = totalAttempts + 1;
    
    setTotalAttempts(newTotalAttempts);
    setProgressValue(0);
    
    if (success) {
      const newSuccessfulMines = successfulMines + 1;
      const miningReward = calculateReward(difficulty) + levelReward;
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
      
      // Show toast notification
      toast({
        title: "Block Successfully Mined!",
        description: `You earned ${miningReward.toFixed(2)} SCR.`,
        duration: 3000,
      });
    } else {
      // Mining failed
      onMiningUpdate({ isMining: false, wasSuccessful: false });
      
      toast({
        title: "Mining Unsuccessful",
        description: "Try again or adjust difficulty.",
        duration: 3000,
      });
    }
    
    // Check if we should continue auto-mining
    if (autoMining && activeMiningTime < MAX_MINING_TIME) {
      setIsMiningComplete(false);
      // Start the next mining attempt after a short delay
      setTimeout(() => {
        startMining();
      }, 1500);
    } else {
      setIsMiningComplete(true);
      stopMining();
    }
    
    // Check if tasks are completed
    checkTaskCompletion();
    
    // Update parent component with current stats
    onStatsUpdate({
      difficulty,
      successfulMines: success ? successfulMines + 1 : successfulMines,
      totalAttempts: newTotalAttempts,
      balance: success ? balance + reward + levelReward : balance,
      activeMiningTime,
      level,
      autoMining
    });
  };

  // Start mining function
  const startMining = () => {
    if (isMining) return;
    
    setIsMining(true);
    setSuccessfulAnimation(false);
    setIsMiningComplete(false);
    
    // Generate random duration for this mining attempt (25-35 seconds)
    const duration = getRandomMiningDuration();
    setMiningDuration(duration);
    
    // Notify parent component
    onMiningUpdate({ isMining: true });
    
    // Set up mining timeout
    const timeout = window.setTimeout(() => {
      processMiningAttempt();
    }, duration);
    
    setMiningTimeout(timeout);
    
    // Set up progress timer
    const progressUpdate = window.setInterval(() => {
      setProgressValue(prev => {
        const newValue = prev + (100 / (duration / 1000));
        return Math.min(newValue, 100);
      });
    }, 1000);
    
    setProgressTimer(progressUpdate);
    
    // Set up time tracking interval
    const timeTracker = window.setInterval(() => {
      setActiveMiningTime(prev => {
        // Check if we've reached the maximum mining time
        if (prev >= MAX_MINING_TIME) {
          if (!autoMining) {
            stopMining();
          }
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
    
    if (progressTimer) {
      clearInterval(progressTimer);
      setProgressTimer(null);
    }
    
    // Notify parent component
    onMiningUpdate({ isMining: false });
  };

  // Toggle auto mining
  const toggleAutoMining = () => {
    setAutoMining(!autoMining);
    
    toast({
      title: autoMining ? "Auto-Mining Disabled" : "Auto-Mining Enabled",
      description: autoMining ? "You'll need to start mining manually after each attempt." : "Mining will automatically continue after each attempt.",
      duration: 3000,
    });
    
    // Update parent component
    onStatsUpdate({
      difficulty,
      successfulMines,
      totalAttempts,
      balance,
      activeMiningTime,
      level,
      autoMining: !autoMining
    });
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
      activeMiningTime,
      level,
      autoMining
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
      activeMiningTime,
      level,
      autoMining
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
    setLevel(1);
    setProgress(0);
    setTaskCompleted(0);
    
    // Update parent component
    onStatsUpdate({
      difficulty,
      successfulMines: 0,
      totalAttempts: 0,
      balance: 0,
      activeMiningTime: 0,
      level: 1,
      autoMining
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
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [miningTimeout, timeInterval, progressTimer]);

  // Update parent component with initial stats
  useEffect(() => {
    onStatsUpdate({
      difficulty,
      successfulMines,
      totalAttempts,
      balance,
      activeMiningTime,
      level,
      autoMining
    });
    
    // Initial task completion check
    checkTaskCompletion();
  }, []);
  
  // Is 24h mining time reached
  const isMiningTimeExceeded = activeMiningTime >= MAX_MINING_TIME;
  
  // Calculate time remaining for current mining attempt
  const timeRemaining = (miningDuration / 1000) - (progressValue / 100 * (miningDuration / 1000));
  
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
        
        {/* Level progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Level {level}</span>
            <span className="text-xs text-muted-foreground">{taskCompleted}% complete</span>
          </div>
          <Progress value={progress * 100} className="h-2" />
          <p className="text-xs text-muted-foreground">Task: {currentTask}</p>
        </div>
        
        <div className="space-y-6">
          {/* Auto-mining switch */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Auto-Mining</span>
            </div>
            <Button
              variant={autoMining ? "default" : "outline"}
              size="sm"
              onClick={toggleAutoMining}
              className={autoMining ? "bg-scremy hover:bg-scremy/90" : ""}
            >
              {autoMining ? "Enabled" : "Disabled"}
            </Button>
          </div>
          
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
          
          {/* Mining progress */}
          {isMining && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Mining progress</span>
                <span className="text-xs text-muted-foreground">
                  {Math.floor(timeRemaining)}s remaining
                </span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
          )}
          
          {/* Mining info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Success Chance</p>
              <p className="font-semibold">{successProbability}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Reward per Block</p>
              <p className="font-semibold">
                {(reward + levelReward).toFixed(2)} <span className="text-scremy">SCR</span>
                {level > 1 && <span className="text-xs text-muted-foreground ml-1">(+{levelReward.toFixed(2)} level bonus)</span>}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Mining Time</p>
              <p className="font-semibold">{formatLongTime(activeMiningTime)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Time Limit</p>
              <p className="font-semibold">{formatLongTime(MAX_MINING_TIME)}</p>
            </div>
          </div>
          
          {/* Mining controls */}
          <div className="flex justify-center pt-2">
            {!isMining ? (
              <Button 
                onClick={startMining} 
                className="bg-scremy hover:bg-scremy/90 text-scremy-foreground"
                disabled={successfulAnimation || (isMiningComplete && isMiningTimeExceeded && autoMining)}
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
              <p>Mining in progress... ({Math.floor(timeRemaining)} seconds remaining)</p>
            )}
            {!isMining && isMiningComplete && !successfulAnimation && (
              <p>Mining attempt completed.</p>
            )}
            {isMiningTimeExceeded && (
              <p className="text-amber-400">24 hour mining limit reached. Click Start Mining to continue.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiningCard;

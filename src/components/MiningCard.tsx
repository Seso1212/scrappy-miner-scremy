
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  PlayCircle, 
  PauseCircle, 
  RefreshCw,
  Users,
  Share2,
  Info,
  Repeat,
  Lock
} from 'lucide-react';

import { 
  calculateReward, 
  MAX_MINING_TIME,
  getRandomMiningDuration,
  formatLongTime,
  calculateExpRequired
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
    level: number;
    exp: number;
    expRequired: number;
    successfulMines: number;
    totalAttempts: number;
    balance: number;
    scoins: number;
    activeMiningTime: number;
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
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [successfulMines, setSuccessfulMines] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [balance, setBalance] = useState(0);
  const [scoins, setScoins] = useState(0);
  const [activeMiningTime, setActiveMiningTime] = useState(0);
  const [successfulAnimation, setSuccessfulAnimation] = useState(false);
  const [miningTimeout, setMiningTimeout] = useState<number | null>(null);
  const [timeInterval, setTimeInterval] = useState<number | null>(null);
  const [isMiningComplete, setIsMiningComplete] = useState(false);
  const [autoMining, setAutoMining] = useState(true);
  const [currentTask, setCurrentTask] = useState("");
  const [miningDuration, setMiningDuration] = useState(30000); // Default duration
  const [progressTimer, setProgressTimer] = useState<number | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [referralLink, setReferralLink] = useState("https://scremycoin.com/ref/user123");
  const [shareToast, setShareToast] = useState(false);

  // Calculate exp required for next level
  const expRequired = calculateExpRequired(level);
  
  // Calculate mining reward based on level
  const reward = calculateReward(level);

  // Tasks for level progression
  const tasks = [
    "Share ScremyCoin on social media",
    "Invite 1 friend to join ScremyCoin",
    "Mine for 1 hour continuously",
    "Complete your profile",
    "Invite 3 friends to join ScremyCoin",
    "Mine for 5 hours total",
    "Share your mining achievements",
    "Invite 5 friends to join ScremyCoin",
    "Complete all tutorials",
    "Mine for 24 hours total"
  ];

  // Update current task based on level
  useEffect(() => {
    if (level <= 10) {
      setCurrentTask(tasks[level - 1]);
    }
  }, [level]);

  // Add experience points
  const addExp = (amount: number) => {
    setExp(prevExp => {
      const newExp = prevExp + amount;
      const expNeeded = calculateExpRequired(level);
      
      // Check if leveled up
      if (newExp >= expNeeded && level < 10) {
        setLevel(prevLevel => prevLevel + 1);
        toast({
          title: "Level Up!",
          description: `You've reached level ${level + 1}! New task unlocked.`,
          duration: 3000,
        });
        return newExp - expNeeded;
      }
      return newExp;
    });
  };

  // Process mining block
  const processMiningBlock = () => {
    const newTotalAttempts = totalAttempts + 1;
    const miningReward = calculateReward(level);
    const newBalance = balance + miningReward;
    const newSuccessfulMines = successfulMines + 1;
    
    setTotalAttempts(newTotalAttempts);
    setSuccessfulMines(newSuccessfulMines);
    setBalance(newBalance);
    setSuccessfulAnimation(true);
    setProgressValue(0);
    
    // Add exp for mining
    addExp(5);
    
    // Notify parent component
    onMiningUpdate({ 
      isMining: false, 
      wasSuccessful: true,
      reward: miningReward
    });
    
    // Show toast notification
    toast({
      title: "Block Successfully Mined!",
      description: `You earned ${miningReward.toFixed(4)} SCR.`,
      duration: 3000,
    });
    
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
    
    // Update parent component with current stats
    onStatsUpdate({
      level,
      exp, 
      expRequired,
      successfulMines: newSuccessfulMines,
      totalAttempts: newTotalAttempts,
      balance: newBalance,
      scoins,
      activeMiningTime,
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
      processMiningBlock();
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
      level,
      exp,
      expRequired,
      successfulMines,
      totalAttempts,
      balance,
      scoins,
      activeMiningTime,
      autoMining: !autoMining
    });
  };

  // Share on social media function
  const shareOnSocial = (platform: string) => {
    // Simulate sharing on social media
    toast({
      title: `Shared on ${platform}!`,
      description: "Thank you for spreading the word about ScremyCoin!",
      duration: 3000,
    });
    
    // Add exp for sharing
    addExp(15);
    
    // Show toast when social task is complete
    if (level === 1) {
      toast({
        title: "Task Completed!",
        description: "You've completed the social media sharing task!",
        duration: 3000,
      });
    }
  };

  // Copy referral link function
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setShareToast(true);
      toast({
        title: "Referral Link Copied!",
        description: "Share this link with friends to earn 20% of their scoins!",
        duration: 3000,
      });
      
      // Add exp for potential referral
      if (level === 2 || level === 5 || level === 8) {
        addExp(10);
      }
    });
  };

  // Simulate inviting a friend
  const inviteFriend = () => {
    // Add exp for inviting
    addExp(25);
    
    // Add scoins for successful referral
    const referralScoins = 10;
    setScoins(prev => prev + referralScoins);
    
    toast({
      title: "Friend Invited!",
      description: `You earned ${referralScoins} scoins as a referral bonus!`,
      duration: 3000,
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
    setExp(0);
    setScoins(0);
    
    // Update parent component
    onStatsUpdate({
      level: 1,
      exp: 0,
      expRequired: calculateExpRequired(1),
      successfulMines: 0,
      totalAttempts: 0,
      balance: 0,
      scoins: 0,
      activeMiningTime: 0,
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
      level,
      exp,
      expRequired,
      successfulMines,
      totalAttempts,
      balance,
      scoins,
      activeMiningTime,
      autoMining
    });
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
            <span className="text-sm font-medium">Level {level} Miner</span>
            <span className="text-xs text-muted-foreground">{Math.floor((exp / expRequired) * 100)}% complete</span>
          </div>
          <Progress value={(exp / expRequired) * 100} className="h-2" />
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
          
          {/* Mining level (locked) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Mining Level
                <div className="relative group">
                  <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    Complete tasks to level up and increase your mining rewards.
                  </div>
                </div>
              </label>
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="w-6 text-center text-sm font-medium">{level}</span>
              </div>
            </div>
            
            <div className="h-5 bg-secondary/50 rounded-md flex">
              {Array.from({ length: 10 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 ${i + 1 <= level ? 'bg-scremy/50' : ''} first:rounded-l-md last:rounded-r-md ${i > 0 ? 'border-l border-background/10' : ''}`}
                />
              ))}
            </div>
          </div>
          
          {/* Task completion */}
          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium mb-2">Complete Tasks to Level Up</p>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => shareOnSocial('Twitter')}
              >
                <Share2 className="h-4 w-4 mr-2 text-blue-400" />
                Share on Twitter
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={copyReferralLink}
              >
                <Users className="h-4 w-4 mr-2 text-scremy" />
                Copy Referral Link
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={inviteFriend}
              >
                <Users className="h-4 w-4 mr-2 text-green-400" />
                Invite Friends
              </Button>
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
              <p className="text-muted-foreground">Reward per Block</p>
              <p className="font-semibold">
                {reward.toFixed(4)} <span className="text-scremy">SCR</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Scoins Balance</p>
              <p className="font-semibold">
                {scoins} <span className="text-amber-400">Scoins</span>
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


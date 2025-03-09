
import React from 'react';
import { Gem, Trophy, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber, formatTime } from '@/lib/miningUtils';

interface StatsDisplayProps {
  balance: number;
  successfulMines: number;
  totalAttempts: number;
  difficulty: number;
  activeMiningTime: number;
  className?: string;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({
  balance,
  successfulMines,
  totalAttempts,
  difficulty,
  activeMiningTime,
  className
}) => {
  const successRate = totalAttempts > 0 
    ? (successfulMines / totalAttempts * 100).toFixed(1) 
    : '0.0';
  
  return (
    <div className={cn("grid grid-cols-2 gap-4 md:grid-cols-4", className)}>
      <div className="glass-card rounded-xl p-4 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-md">
        <div className="mb-2 flex items-center gap-2">
          <Gem className="h-5 w-5 text-scremy" strokeWidth={1.5} />
          <h3 className="text-sm font-medium text-muted-foreground">Balance</h3>
        </div>
        <p className="text-2xl font-bold text-balance">
          {formatNumber(balance)} <span className="text-scremy">SCR</span>
        </p>
      </div>
      
      <div className="glass-card rounded-xl p-4 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-md">
        <div className="mb-2 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-scremy" strokeWidth={1.5} />
          <h3 className="text-sm font-medium text-muted-foreground">Success Rate</h3>
        </div>
        <p className="text-2xl font-bold flex items-end gap-1">
          {successRate}
          <span className="text-muted-foreground text-lg">%</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {successfulMines}/{totalAttempts} blocks mined
        </p>
      </div>
      
      <div className="glass-card rounded-xl p-4 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-md">
        <div className="mb-2 flex items-center gap-2">
          <Zap className="h-5 w-5 text-scremy" strokeWidth={1.5} />
          <h3 className="text-sm font-medium text-muted-foreground">Difficulty</h3>
        </div>
        <div className="w-full flex justify-center gap-1 mt-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-4 w-1 rounded-full transition-all",
                i < difficulty 
                  ? "bg-scremy" 
                  : "bg-muted"
              )}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Level {difficulty} / 10
        </p>
      </div>
      
      <div className="glass-card rounded-xl p-4 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-md">
        <div className="mb-2 flex items-center gap-2">
          <Clock className="h-5 w-5 text-scremy" strokeWidth={1.5} />
          <h3 className="text-sm font-medium text-muted-foreground">Mining Time</h3>
        </div>
        <p className="text-2xl font-bold font-mono">
          {formatTime(activeMiningTime)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Active mining time
        </p>
      </div>
    </div>
  );
};

export default StatsDisplay;

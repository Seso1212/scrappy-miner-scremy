
import React from 'react';
import { 
  Bitcoin, 
  Clock, 
  BarChart3, 
  TrendingUp,
  Award
} from 'lucide-react';
import { formatNumber, formatTime, MAX_MINING_TIME } from '@/lib/miningUtils';

interface StatsDisplayProps {
  balance: number;
  successfulMines: number;
  totalAttempts: number;
  difficulty: number;
  activeMiningTime: number;
  level?: number;
  autoMining?: boolean;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({
  balance,
  successfulMines,
  totalAttempts,
  difficulty,
  activeMiningTime,
  level = 1,
  autoMining = true
}) => {
  const successRate = totalAttempts > 0 
    ? ((successfulMines / totalAttempts) * 100).toFixed(1) 
    : '0.0';
  
  const miningTimePercentage = (activeMiningTime / MAX_MINING_TIME) * 100;
  
  return (
    <div className="glass-card rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Mining Statistics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Balance */}
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-scremy/10 p-2 rounded-full">
              <Bitcoin className="h-4 w-4 text-scremy" />
            </div>
            <h3 className="text-sm font-medium">Balance</h3>
          </div>
          <p className="text-2xl font-bold">{balance.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">SCR</p>
        </div>
        
        {/* Success Rate */}
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-scremy/10 p-2 rounded-full">
              <BarChart3 className="h-4 w-4 text-scremy" />
            </div>
            <h3 className="text-sm font-medium">Success Rate</h3>
          </div>
          <p className="text-2xl font-bold">{successRate}%</p>
          <p className="text-xs text-muted-foreground">
            {successfulMines} / {totalAttempts} attempts
          </p>
        </div>
        
        {/* Mining Time */}
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-scremy/10 p-2 rounded-full">
              <Clock className="h-4 w-4 text-scremy" />
            </div>
            <h3 className="text-sm font-medium">Mining Time</h3>
          </div>
          <p className="text-2xl font-bold">{formatTime(activeMiningTime)}</p>
          <div className="w-full bg-muted h-1 rounded-full mt-2">
            <div 
              className="bg-scremy h-1 rounded-full"
              style={{ width: `${miningTimePercentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Level */}
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-scremy/10 p-2 rounded-full">
              <Award className="h-4 w-4 text-scremy" />
            </div>
            <h3 className="text-sm font-medium">Miner Level</h3>
          </div>
          <p className="text-2xl font-bold">{level}</p>
          <p className="text-xs text-muted-foreground">
            {autoMining ? "Auto-Mining Enabled" : "Auto-Mining Disabled"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;

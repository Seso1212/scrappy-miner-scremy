
import React, { useState, useEffect } from 'react';
import MiningCard from '@/components/MiningCard';
import MiningAnimation from '@/components/MiningAnimation';
import StatsDisplay from '@/components/StatsDisplay';
import { cn } from '@/lib/utils';

const Index = () => {
  // State for mining
  const [miningState, setMiningState] = useState({
    isMining: false,
    wasSuccessful: false,
  });
  
  // State for stats
  const [stats, setStats] = useState({
    difficulty: 5,
    successfulMines: 0,
    totalAttempts: 0,
    balance: 0,
    activeMiningTime: 0,
  });
  
  // Handle mining updates
  const handleMiningUpdate = (data: {
    isMining: boolean;
    wasSuccessful?: boolean;
    reward?: number;
  }) => {
    setMiningState({
      isMining: data.isMining,
      wasSuccessful: data.wasSuccessful || false,
    });
  };
  
  // Handle stats updates
  const handleStatsUpdate = (data: {
    difficulty: number;
    successfulMines: number;
    totalAttempts: number;
    balance: number;
    activeMiningTime: number;
  }) => {
    setStats(data);
  };
  
  // Animation complete handler
  const handleAnimationComplete = () => {
    setMiningState(prev => ({
      ...prev,
      wasSuccessful: false,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
      {/* Background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="circle-glow w-[800px] h-[800px] -top-[400px] -right-[400px] opacity-20" />
        <div className="circle-glow w-[600px] h-[600px] -bottom-[300px] -left-[300px] opacity-10" />
      </div>
      
      {/* Header */}
      <header className="w-full pt-8 pb-4 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-block">
            <span className="font-bold text-4xl md:text-5xl tracking-tight relative">
              <span className="opacity-90">Scremy</span>
              <span className="text-scremy">Coin</span>
              <div className="absolute -top-1 -right-3 w-2 h-2 rounded-full bg-scremy animate-pulse-soft" />
            </span>
          </div>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            The revolutionary cryptocurrency running on your browser
          </p>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 w-full px-4 sm:px-6 md:px-8 pb-12 max-w-7xl mx-auto">
        <div className="flex flex-col gap-8">
          {/* Mining section */}
          <section className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className={cn(
              "glass-card rounded-xl p-6 overflow-hidden transition-all duration-300",
              miningState.wasSuccessful ? "ring-2 ring-scremy/20" : ""
            )}>
              <h2 className="text-xl font-semibold mb-4 text-center">Mining Operation</h2>
              <MiningAnimation 
                isActive={true}
                isMining={miningState.isMining}
                wasSuccessful={miningState.wasSuccessful}
                onAnimationComplete={handleAnimationComplete}
              />
              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  {miningState.isMining 
                    ? "Mining in progress... please wait" 
                    : miningState.wasSuccessful 
                      ? "Block successfully mined!" 
                      : "Start mining to earn ScremyCoin"}
                </p>
              </div>
            </div>
            
            <MiningCard 
              onMiningUpdate={handleMiningUpdate}
              onStatsUpdate={handleStatsUpdate}
            />
          </section>
          
          {/* Stats display */}
          <section>
            <StatsDisplay 
              balance={stats.balance}
              successfulMines={stats.successfulMines}
              totalAttempts={stats.totalAttempts}
              difficulty={stats.difficulty}
              activeMiningTime={stats.activeMiningTime}
            />
          </section>
          
          {/* Info section */}
          <section className="glass-card rounded-xl p-6 md:p-8 mt-6">
            <h2 className="text-xl font-semibold mb-4">How Mining Works</h2>
            <p className="text-muted-foreground mb-4">
              Mining ScremyCoin involves solving complex computational puzzles. The higher the difficulty, the lower your chance of successfully mining a block. Each successful block rewards you with 50 SCR. Choose your difficulty wisely!
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="rounded-lg p-4 bg-secondary/50">
                <h3 className="font-medium mb-2">1. Set Mining Difficulty</h3>
                <p className="text-sm text-muted-foreground">
                  Adjust the difficulty level from 1-10. Higher difficulty means lower chance of success.
                </p>
              </div>
              <div className="rounded-lg p-4 bg-secondary/50">
                <h3 className="font-medium mb-2">2. Start Mining Process</h3>
                <p className="text-sm text-muted-foreground">
                  Click the Start Mining button and wait while the system attempts to solve the mining puzzle.
                </p>
              </div>
              <div className="rounded-lg p-4 bg-secondary/50">
                <h3 className="font-medium mb-2">3. Collect Your Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  If mining is successful, you'll earn 50 SCR regardless of difficulty level.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full py-6 px-4 sm:px-6 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            ScremyCoin Mining Simulator — A beautiful web application
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

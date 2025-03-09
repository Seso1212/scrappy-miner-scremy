
import React, { useState, useEffect } from 'react';
import MiningCard from '@/components/MiningCard';
import MiningAnimation from '@/components/MiningAnimation';
import StatsDisplay from '@/components/StatsDisplay';
import MiningSpaces from '@/components/MiningSpaces';
import { cn } from '@/lib/utils';
import { Bitcoin, Cpu, Shield, ChevronDown, Clock, Award } from 'lucide-react';

const Index = () => {
  // State for mining
  const [miningState, setMiningState] = useState({
    isMining: false,
    wasSuccessful: false,
    isSpace: false
  });
  
  // State for stats
  const [stats, setStats] = useState({
    difficulty: 5,
    successfulMines: 0,
    totalAttempts: 0,
    balance: 0,
    activeMiningTime: 0,
    level: 1,
    autoMining: true
  });
  
  // State for accordion sections
  const [openSection, setOpenSection] = useState<string | null>("about");
  
  // Handle mining updates
  const handleMiningUpdate = (data: {
    isMining: boolean;
    wasSuccessful?: boolean;
    reward?: number;
    isSpace?: boolean;
  }) => {
    setMiningState({
      isMining: data.isMining,
      wasSuccessful: data.wasSuccessful || false,
      isSpace: data.isSpace || false
    });
  };
  
  // Handle stats updates
  const handleStatsUpdate = (data: {
    difficulty: number;
    successfulMines: number;
    totalAttempts: number;
    balance: number;
    activeMiningTime: number;
    level: number;
    autoMining: boolean;
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
  
  // Toggle accordion section
  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
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
          {/* Hero section */}
          <section className="glass-card rounded-xl p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h1 className="text-3xl font-bold mb-4">
                  Web-Based Mining Simplified
                </h1>
                <p className="text-muted-foreground mb-6">
                  ScremyCoin represents the future of browser-based cryptocurrency mining. 
                  Our innovative approach allows anyone with a web browser to start mining 
                  without specialized hardware. Adjust difficulty settings, monitor real-time 
                  statistics, and earn rewards based on your mining success.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-scremy/10 p-2 rounded-full">
                      <Cpu className="h-5 w-5 text-scremy" />
                    </span>
                    <span className="text-sm">Browser-based mining</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-scremy/10 p-2 rounded-full">
                      <Shield className="h-5 w-5 text-scremy" />
                    </span>
                    <span className="text-sm">Secure processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-scremy/10 p-2 rounded-full">
                      <Bitcoin className="h-5 w-5 text-scremy" />
                    </span>
                    <span className="text-sm">Variable rewards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-scremy/10 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-scremy" />
                    </span>
                    <span className="text-sm">Auto-Mining feature</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-scremy/10 p-2 rounded-full">
                      <Award className="h-5 w-5 text-scremy" />
                    </span>
                    <span className="text-sm">Level progression</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <div className="absolute inset-0 bg-scremy/10 rounded-full animate-ping-slow opacity-30"></div>
                  <div className="absolute inset-4 bg-scremy/20 rounded-full animate-ping-slow opacity-50 animation-delay-500"></div>
                  <div className="relative bg-scremy text-white w-32 h-32 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    SCR
                  </div>
                </div>
              </div>
            </div>
          </section>
          
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
                    ? miningState.isSpace
                      ? "Space mining in progress..."
                      : "Mining in progress... please wait" 
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
              level={stats.level}
              autoMining={stats.autoMining}
            />
          </section>
          
          {/* Mining spaces */}
          <section>
            <MiningSpaces 
              onMiningUpdate={handleMiningUpdate}
            />
          </section>
          
          {/* Accordion Sections */}
          <section className="glass-card rounded-xl p-6 md:p-8 mt-6">
            {/* About ScremyCoin */}
            <div className="border-b border-border last:border-0">
              <button 
                className="flex items-center justify-between w-full py-4 text-left"
                onClick={() => toggleSection('about')}
              >
                <h2 className="text-xl font-semibold">About ScremyCoin</h2>
                <ChevronDown className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  openSection === 'about' ? "transform rotate-180" : ""
                )} />
              </button>
              <div className={cn(
                "overflow-hidden transition-all duration-300",
                openSection === 'about' ? "max-h-96 mb-4" : "max-h-0"
              )}>
                <p className="text-muted-foreground mb-4">
                  ScremyCoin (SCR) is a simulated cryptocurrency that demonstrates the principles of blockchain mining. 
                  Unlike traditional cryptocurrencies that require powerful computers, ScremyCoin operates entirely in your browser, 
                  making it accessible to everyone.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-lg p-4 bg-secondary/50">
                    <h3 className="font-medium mb-2">Browser-based Mining</h3>
                    <p className="text-sm text-muted-foreground">
                      ScremyCoin's innovation is its ability to mine directly in your web browser, eliminating the need for expensive mining equipment.
                    </p>
                  </div>
                  <div className="rounded-lg p-4 bg-secondary/50">
                    <h3 className="font-medium mb-2">Adaptive Rewards</h3>
                    <p className="text-sm text-muted-foreground">
                      Mining rewards range from 0.11 to 1.92 SCR per block, based on the difficulty level you choose. Higher difficulty means potentially higher rewards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* How Mining Works */}
            <div className="border-b border-border last:border-0">
              <button 
                className="flex items-center justify-between w-full py-4 text-left"
                onClick={() => toggleSection('mining')}
              >
                <h2 className="text-xl font-semibold">How Mining Works</h2>
                <ChevronDown className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  openSection === 'mining' ? "transform rotate-180" : ""
                )} />
              </button>
              <div className={cn(
                "overflow-hidden transition-all duration-300",
                openSection === 'mining' ? "max-h-[500px] mb-4" : "max-h-0"
              )}>
                <p className="text-muted-foreground mb-4">
                  Mining ScremyCoin involves solving complex computational puzzles. The higher the difficulty, 
                  the lower your chance of successfully mining a block, but the greater the potential reward.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="rounded-lg p-4 bg-secondary/50">
                    <h3 className="font-medium mb-2">1. Set Mining Difficulty</h3>
                    <p className="text-sm text-muted-foreground">
                      Adjust the difficulty level from 1-10. Higher difficulty means lower chance of success but higher rewards from 0.11 to 1.92 SCR.
                    </p>
                  </div>
                  <div className="rounded-lg p-4 bg-secondary/50">
                    <h3 className="font-medium mb-2">2. Start Mining Process</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the Start Mining button and wait while the system attempts to solve the mining puzzle. Each attempt takes 25-35 seconds.
                    </p>
                  </div>
                  <div className="rounded-lg p-4 bg-secondary/50">
                    <h3 className="font-medium mb-2">3. Collect Your Rewards</h3>
                    <p className="text-sm text-muted-foreground">
                      If mining is successful, you'll earn SCR based on the difficulty level. Mining continues automatically for up to 24 hours of active time.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Level Progression</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    As you mine, you'll level up by completing specific tasks. Each level increases your base mining reward, allowing you 
                    to earn more SCR with every successful block.
                  </p>
                  
                  <h3 className="font-medium mb-2">Mining Spaces</h3>
                  <p className="text-sm text-muted-foreground">
                    In addition to regular mining, you can unlock mining spaces by watching ads. Each space runs for 12 hours after being unlocked, 
                    providing an additional way to earn SCR.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Technical Details */}
            <div className="border-b border-border last:border-0">
              <button 
                className="flex items-center justify-between w-full py-4 text-left"
                onClick={() => toggleSection('technical')}
              >
                <h2 className="text-xl font-semibold">Technical Details</h2>
                <ChevronDown className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  openSection === 'technical' ? "transform rotate-180" : ""
                )} />
              </button>
              <div className={cn(
                "overflow-hidden transition-all duration-300",
                openSection === 'technical' ? "max-h-[500px] mb-4" : "max-h-0"
              )}>
                <p className="text-muted-foreground mb-4">
                  ScremyCoin's mining algorithm is designed to simulate real cryptocurrency mining with a few key differences to make it accessible in a browser.
                </p>
                <div className="space-y-4">
                  <div className="rounded-lg p-4 bg-secondary/50">
                    <h3 className="font-medium mb-2">Mining Algorithm</h3>
                    <p className="text-sm text-muted-foreground">
                      Each mining attempt lasts 25-35 seconds, during which the browser simulates the process of solving a cryptographic puzzle. The success probability is inversely proportional to the difficulty level.
                    </p>
                  </div>
                  <div className="rounded-lg p-4 bg-secondary/50">
                    <h3 className="font-medium mb-2">Reward Calculation</h3>
                    <p className="text-sm text-muted-foreground">
                      Basic rewards are calculated based on difficulty, ranging from 0.11 SCR (difficulty 1) to 1.92 SCR (difficulty 10). Additionally, you earn a level bonus of 0.1 SCR multiplied by your current level.
                    </p>
                  </div>
                  <div className="rounded-lg p-4 bg-secondary/50">
                    <h3 className="font-medium mb-2">Auto-Mining</h3>
                    <p className="text-sm text-muted-foreground">
                      With auto-mining enabled, the system automatically starts a new mining operation after each attempt completes, whether successful or not. This continues until the 24-hour limit is reached.
                    </p>
                  </div>
                  <div className="rounded-lg p-4 bg-secondary/50">
                    <h3 className="font-medium mb-2">Mining Spaces</h3>
                    <p className="text-sm text-muted-foreground">
                      The separate mining spaces feature allows you to unlock additional mining capacity by watching ads. Each space remains active for 12 hours after being unlocked, and you can unlock up to 5 spaces simultaneously.
                    </p>
                  </div>
                </div>
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

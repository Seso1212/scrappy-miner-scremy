import React, { useState, useEffect } from 'react';
import MiningCard from '@/components/MiningCard';
import MiningAnimation from '@/components/MiningAnimation';
import StatsDisplay from '@/components/StatsDisplay';
import MiningSpaces from '@/components/MiningSpaces';
import { cn } from '@/lib/utils';
import { Bitcoin, Cpu, Shield, ChevronDown, Clock, Award, Users, Gem } from 'lucide-react';
import { calculateExpRequired } from '@/lib/miningUtils';

const Mining = () => {
  // State for mining
  const [miningState, setMiningState] = useState({
    isMining: false,
    wasSuccessful: false,
    isSpace: false
  });
  
  // State for stats
  const [stats, setStats] = useState({
    level: 1,
    exp: 0,
    expRequired: calculateExpRequired(1),
    successfulMines: 0,
    totalAttempts: 0,
    balance: 0,
    scoins: 0,
    activeMiningTime: 0,
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
    level: number;
    exp: number;
    expRequired: number;
    successfulMines: number;
    totalAttempts: number;
    balance: number;
    scoins: number;
    activeMiningTime: number;
    autoMining: boolean;
  }) => {
    setStats(data);
  };
  
  // Handle scoins updates from mining spaces
  const handleScoinsUpdate = (scoins: number) => {
    setStats(prev => ({
      ...prev,
      scoins
    }));
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
                      ? "Space mining in progress... earning Scoins"
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
              level={stats.level}
              exp={stats.exp}
              expRequired={stats.expRequired}
              activeMiningTime={stats.activeMiningTime}
              autoMining={stats.autoMining}
              scoins={stats.scoins}
            />
          </section>
          
          {/* Mining spaces */}
          <section>
            <MiningSpaces 
              onMiningUpdate={handleMiningUpdate}
              onScoinsUpdate={handleScoinsUpdate}
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
                    <h3 className="font-medium mb-2">Level & Rewards</h3>
                    <p className="text-sm text-muted-foreground">
                      Mining rewards range from 0.05 to 0.5 SCR per hour, based on your mining level. Complete tasks to level up and increase your rewards.
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
                  Mining ScremyCoin involves a two-tier system: the main mining process that earns SCR directly, 
                  and mining spaces that generate Scoins which can be exchanged for SCR.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="rounded-lg p-4 bg-secondary/50">
                    <h3 className="font-medium mb-2">1. Main Mining</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the Start Mining button to begin mining SCR. Each mining block takes 25-35 seconds and automatically continues for up to 24 hours.
                    </p>
                  </div>
                  <div className="rounded-lg p-4 bg-secondary/50">
                    <h3 className="font-medium mb-2">2. Level Up</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete tasks like sharing on social media and inviting friends to earn EXP and level up. Higher levels mean higher rewards per mining block.
                    </p>
                  </div>
                  <div className="rounded-lg p-4 bg-secondary/50">
                    <h3 className="font-medium mb-2">3. Mining Spaces</h3>
                    <p className="text-sm text-muted-foreground">
                      Unlock additional mining spaces by watching ads or becoming a premium user. Each space generates Scoins that can be exchanged for SCR.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Scoins System</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Scoins are an intermediary currency earned from:
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                    <li>Watching ads (5 Scoins per ad)</li>
                    <li>Mining in spaces (5 Scoins per hour)</li>
                    <li>Referral bonuses (20% of friends' Scoins)</li>
                  </ul>
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
                      Each mining attempt lasts 25-35 seconds, during which the browser simulates the process of solving a cryptographic puzzle.
                    </p>
                  </div>
                  <div className="rounded-lg p-4 bg-secondary/50">
                    <h3 className="font-medium mb-2">Reward Calculation</h3>
                    <p className="text-sm text-muted-foreground">
                      Rewards range from 0.05 to 0.5 SCR per hour based on your level. This translates to approximately 0.0004 to 0.0042 SCR per 30-second block.
                    </p>
                  </div>
                  <div className="rounded-lg p-4 bg-secondary/50">
                    <h3 className="font-medium mb-2">Level Progression</h3>
                    <p className="text-sm text-muted-foreground">
                      Each level requires progressively more EXP to advance. EXP is earned by completing tasks, mining blocks, and participating in community activities.
                    </p>
                  </div>
                  <div className="rounded-lg p-4 bg-secondary/50">
                    <h3 className="font-medium mb-2">Mining Spaces</h3>
                    <p className="text-sm text-muted-foreground">
                      The first space is free, while the other 4 require watching ads or premium subscription. Ad-unlocked spaces last for 12 hours, while premium spaces are permanent.
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

export default Mining;

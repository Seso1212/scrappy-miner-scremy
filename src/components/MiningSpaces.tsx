
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Play, Lock, Eye, Award, Gem } from 'lucide-react';
import { 
  formatTime, 
  MAX_SPACE_MINING_TIME, 
  SPACE_AD_DURATION, 
  SCOINS_PER_AD,
  SCOINS_PER_HOUR 
} from '@/lib/miningUtils';
import { useToast } from "@/components/ui/use-toast";
import { useCrypto } from '@/contexts/CryptoContext';

interface MiningSpaceProps {
  onMiningUpdate: (data: {
    isMining: boolean;
    wasSuccessful?: boolean;
    reward?: number;
    isSpace?: boolean;
  }) => void;
}

const MiningSpaces: React.FC<MiningSpaceProps> = ({ 
  onMiningUpdate
}) => {
  const { toast } = useToast();
  const { userData, updateMiningSpace, addScoins } = useCrypto();
  
  // Initialize spaces from userData
  const [spaces, setSpaces] = useState<Array<{
    id: number;
    unlocked: boolean;
    timeRemaining: number;
    active: boolean;
    premium: boolean;
    accruedScoins: number;
  }>>(userData.miningSpaces.map(space => ({
    id: space.id,
    unlocked: space.unlocked,
    timeRemaining: space.expiresAt ? Math.max(0, Math.floor((space.expiresAt - Date.now()) / 1000)) : 0,
    active: space.active,
    premium: space.isPremium,
    accruedScoins: space.scoinsEarned
  })));
  
  const [timers, setTimers] = useState<number[]>([]);
  const [scoinTimers, setScoinTimers] = useState<number[]>([]);
  const [totalScoins, setTotalScoins] = useState(userData.userStats.scoins || 0);

  // Sync spaces with userData when it changes
  useEffect(() => {
    setSpaces(userData.miningSpaces.map(space => ({
      id: space.id,
      unlocked: space.unlocked,
      timeRemaining: space.expiresAt ? Math.max(0, Math.floor((space.expiresAt - Date.now()) / 1000)) : 0,
      active: space.active,
      premium: space.isPremium,
      accruedScoins: space.scoinsEarned
    })));
    setTotalScoins(userData.userStats.scoins || 0);
  }, [userData]);

  // Handle watching an ad to unlock a space
  const handleWatchAd = (spaceId: number) => {
    // Award scoins for watching ad
    addScoins(SCOINS_PER_AD);
    setTotalScoins(prev => prev + SCOINS_PER_AD);
    
    // Calculate expiration time (current time + duration in hours)
    const expiresAt = Date.now() + (SPACE_AD_DURATION * 60 * 60 * 1000);
    
    // Update the space in context
    updateMiningSpace(spaceId, {
      unlocked: true,
      expiresAt
    });
    
    // Update local state
    setSpaces(currentSpaces => 
      currentSpaces.map(space => 
        space.id === spaceId 
          ? { ...space, unlocked: true, timeRemaining: SPACE_AD_DURATION * 60 * 60 } 
          : space
      )
    );
    
    toast({
      title: "Space Unlocked!",
      description: `Mining space ${spaceId} has been unlocked for ${SPACE_AD_DURATION} hours. You earned ${SCOINS_PER_AD} scoins!`,
      duration: 3000,
    });
  };

  // Purchase premium for a space
  const purchasePremium = (spaceId: number) => {
    // Update the space in context
    updateMiningSpace(spaceId, {
      unlocked: true,
      isPremium: true,
      expiresAt: undefined
    });
    
    // Update local state
    setSpaces(currentSpaces => 
      currentSpaces.map(space => 
        space.id === spaceId 
          ? { ...space, unlocked: true, premium: true, timeRemaining: 0 } 
          : space
      )
    );
    
    toast({
      title: "Premium Space Unlocked!",
      description: `Mining space ${spaceId} has been permanently unlocked with premium.`,
      duration: 3000,
    });
  };

  // Start mining in a specific space
  const startSpaceMining = (spaceId: number) => {
    const space = spaces.find(s => s.id === spaceId);
    if (!space || !space.unlocked) return;
    
    // Update in context
    updateMiningSpace(spaceId, {
      active: true
    });
    
    // Update local state
    setSpaces(currentSpaces => 
      currentSpaces.map(space => 
        space.id === spaceId 
          ? { ...space, active: true } 
          : space
      )
    );
    
    onMiningUpdate({ 
      isMining: true,
      isSpace: true
    });
    
    // Set up scoin accrual timer for this space
    const scoinTimer = window.setInterval(() => {
      setSpaces(currentSpaces => 
        currentSpaces.map(space => 
          space.id === spaceId && space.active
            ? { ...space, accruedScoins: space.accruedScoins + (SCOINS_PER_HOUR / 60 / 60) }
            : space
        )
      );
      
      // Also update in context periodically
      updateMiningSpace(spaceId, {
        scoinsEarned: spaces.find(s => s.id === spaceId)?.accruedScoins || 0
      });
    }, 1000); // Update every second
    
    setScoinTimers(prev => [...prev, scoinTimer]);
    
    toast({
      title: "Space Mining Started",
      description: `Mining in space ${spaceId} has begun. You'll earn ${SCOINS_PER_HOUR} scoins per hour.`,
      duration: 3000,
    });
  };

  // Stop mining in a specific space
  const stopSpaceMining = (spaceId: number) => {
    // First, get the space to collect its accrued scoins
    const space = spaces.find(s => s.id === spaceId);
    
    if (space) {
      // Round the accrued scoins to 2 decimal places
      const collectedScoins = Math.round(space.accruedScoins * 100) / 100;
      
      // Update total scoins in context
      if (collectedScoins > 0) {
        addScoins(collectedScoins);
        setTotalScoins(prev => prev + collectedScoins);
        
        toast({
          title: "Scoins Collected!",
          description: `You collected ${collectedScoins} scoins from space ${spaceId}.`,
          duration: 3000,
        });
      }
    }
    
    // Update in context
    updateMiningSpace(spaceId, {
      active: false,
      scoinsEarned: 0
    });
    
    // Update local state
    setSpaces(currentSpaces => 
      currentSpaces.map(space => 
        space.id === spaceId
          ? { ...space, active: false, accruedScoins: 0 }
          : space
      )
    );
    
    onMiningUpdate({ 
      isMining: false,
      isSpace: true
    });
  };

  // Update timers for spaces
  useEffect(() => {
    // Clear existing timers
    timers.forEach(timerId => clearInterval(timerId));
    
    const newTimers = spaces
      .filter(space => space.unlocked && !space.premium && space.timeRemaining > 0)
      .map(space => {
        return window.setInterval(() => {
          setSpaces(currentSpaces => 
            currentSpaces.map(s => 
              s.id === space.id && s.timeRemaining > 0
                ? { ...s, timeRemaining: s.timeRemaining - 1 }
                : s.id === space.id && s.timeRemaining <= 0 && !s.premium
                  ? { ...s, unlocked: false, active: false, accruedScoins: 0 }
                  : s
            )
          );
          
          // If time just expired, update in context too
          if (space.timeRemaining === 1) {
            updateMiningSpace(space.id, {
              unlocked: false,
              active: false,
              scoinsEarned: 0,
              expiresAt: undefined
            });
          }
        }, 1000);
      });
    
    setTimers(newTimers);
    
    // Cleanup on unmount
    return () => {
      newTimers.forEach(timerId => clearInterval(timerId));
      scoinTimers.forEach(timerId => clearInterval(timerId));
    };
  }, [spaces.map(s => `${s.id}-${s.unlocked}-${s.premium}`).join(',')]);

  return (
    <div className="glass-card rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Mining Spaces</h2>
        <div className="flex items-center gap-2">
          <Gem className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-medium">{Math.floor(totalScoins)} Scoins</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4 text-center">
        Watch ads or upgrade to premium to unlock mining spaces that generate Scoins
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {spaces.map((space) => (
          <div 
            key={space.id}
            className={`glass-card p-4 rounded-lg flex flex-col items-center justify-center gap-2 ${
              space.unlocked 
                ? space.premium 
                  ? 'border border-amber-400/30' 
                  : 'border border-scremy/20'
                : 'border border-muted/10'
            }`}
          >
            <div className="text-lg font-medium flex items-center gap-2">
              {space.premium && <Award className="h-4 w-4 text-amber-400" />}
              Space {space.id}
            </div>
            
            {space.unlocked ? (
              <>
                {!space.premium && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {space.timeRemaining > 0 
                        ? `Expires in: ${formatTime(space.timeRemaining)}`
                        : 'Expired'}
                    </span>
                  </div>
                )}
                
                {space.premium && (
                  <div className="text-xs text-amber-400 flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    <span>Premium Space</span>
                  </div>
                )}
                
                {(space.timeRemaining > 0 || space.premium) ? (
                  !space.active ? (
                    <Button 
                      size="sm" 
                      className="mt-2 bg-amber-500 hover:bg-amber-600 text-white"
                      onClick={() => startSpaceMining(space.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Mine Scoins
                    </Button>
                  ) : (
                    <div className="space-y-2 w-full">
                      <div className="flex items-center justify-between text-xs">
                        <span>Scoins accrued:</span>
                        <span className="font-medium">{Math.floor(space.accruedScoins * 100) / 100}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full"
                        onClick={() => stopSpaceMining(space.id)}
                      >
                        Collect & Stop
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="space-y-2 w-full">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      onClick={() => handleWatchAd(space.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Watch Ad (+{SCOINS_PER_AD} scoins)
                    </Button>
                    <Button 
                      size="sm" 
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                      onClick={() => purchasePremium(space.id)}
                    >
                      <Award className="h-4 w-4 mr-1" />
                      Upgrade to Premium
                    </Button>
                  </div>
                )}
              </>
            ) : (
              space.id === 1 ? (
                <Button 
                  size="sm" 
                  className="mt-2 bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => startSpaceMining(space.id)}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Mine Scoins (Free)
                </Button>
              ) : (
                <>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    <span>Locked</span>
                  </div>
                  <div className="space-y-2 w-full mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      onClick={() => handleWatchAd(space.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Watch Ad (+{SCOINS_PER_AD} scoins)
                    </Button>
                    <Button 
                      size="sm" 
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                      onClick={() => purchasePremium(space.id)}
                    >
                      <Award className="h-4 w-4 mr-1" />
                      Upgrade to Premium
                    </Button>
                  </div>
                </>
              )
            )}
          </div>
        ))}
      </div>
      
      <div className="flex flex-col items-center text-xs text-muted-foreground mt-4 gap-1">
        <p>Premium users can unlock all spaces permanently</p>
        <p>Each space earns {SCOINS_PER_HOUR} Scoins per hour of active mining</p>
      </div>
    </div>
  );
};

export default MiningSpaces;

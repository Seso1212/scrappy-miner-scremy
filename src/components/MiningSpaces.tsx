
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Play, Lock, Eye } from 'lucide-react';
import { formatTime, MAX_SPACE_MINING_TIME, SPACE_AD_DURATION } from '@/lib/miningUtils';
import { useToast } from "@/components/ui/use-toast";

interface MiningSpaceProps {
  onMiningUpdate: (data: {
    isMining: boolean;
    wasSuccessful?: boolean;
    reward?: number;
    isSpace?: boolean;
  }) => void;
}

const MiningSpaces: React.FC<MiningSpaceProps> = ({ onMiningUpdate }) => {
  const { toast } = useToast();
  const [spaces, setSpaces] = useState<Array<{
    id: number;
    unlocked: boolean;
    timeRemaining: number;
    active: boolean;
  }>>([
    { id: 1, unlocked: true, timeRemaining: 0, active: false },
    { id: 2, unlocked: false, timeRemaining: 0, active: false },
    { id: 3, unlocked: false, timeRemaining: 0, active: false },
    { id: 4, unlocked: false, timeRemaining: 0, active: false },
    { id: 5, unlocked: false, timeRemaining: 0, active: false },
  ]);
  
  const [timers, setTimers] = useState<number[]>([]);

  // Handle watching an ad to unlock a space
  const handleWatchAd = (spaceId: number) => {
    setSpaces(currentSpaces => 
      currentSpaces.map(space => 
        space.id === spaceId 
          ? { ...space, unlocked: true, timeRemaining: SPACE_AD_DURATION * 60 * 60 } 
          : space
      )
    );
    
    toast({
      title: "Space Unlocked!",
      description: `Mining space ${spaceId} has been unlocked for ${SPACE_AD_DURATION} hours.`,
      duration: 3000,
    });
  };

  // Start mining in a specific space
  const startSpaceMining = (spaceId: number) => {
    if (!spaces.find(space => space.id === spaceId)?.unlocked) return;
    
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
    
    toast({
      title: "Space Mining Started",
      description: `Mining in space ${spaceId} has begun. This will run for 12 hours.`,
      duration: 3000,
    });
  };

  // Stop mining in a specific space
  const stopSpaceMining = (spaceId: number) => {
    setSpaces(currentSpaces => 
      currentSpaces.map(space => 
        space.id === spaceId 
          ? { ...space, active: false } 
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
      .filter(space => space.unlocked && space.timeRemaining > 0)
      .map(space => {
        return window.setInterval(() => {
          setSpaces(currentSpaces => 
            currentSpaces.map(s => 
              s.id === space.id && s.timeRemaining > 0
                ? { ...s, timeRemaining: s.timeRemaining - 1 }
                : s.id === space.id && s.timeRemaining <= 0
                  ? { ...s, unlocked: false, active: false }
                  : s
            )
          );
        }, 1000);
      });
    
    setTimers(newTimers);
    
    // Cleanup on unmount
    return () => {
      newTimers.forEach(timerId => clearInterval(timerId));
    };
  }, [spaces.map(s => s.unlocked).join(',')]);

  return (
    <div className="glass-card rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-center">Mining Spaces</h2>
      <p className="text-sm text-muted-foreground mb-4 text-center">
        Watch ads to unlock mining spaces that run for 12 hours
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {spaces.map((space) => (
          <div 
            key={space.id}
            className={`glass-card p-4 rounded-lg flex flex-col items-center justify-center gap-2 ${
              space.unlocked ? 'border border-scremy/20' : 'border border-muted/10'
            }`}
          >
            <div className="text-lg font-medium">Space {space.id}</div>
            
            {space.unlocked ? (
              <>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {space.timeRemaining > 0 
                      ? `Expires in: ${formatTime(space.timeRemaining)}`
                      : 'Expired'}
                  </span>
                </div>
                
                {space.timeRemaining > 0 ? (
                  !space.active ? (
                    <Button 
                      size="sm" 
                      className="mt-2 bg-scremy hover:bg-scremy/90 text-scremy-foreground"
                      onClick={() => startSpaceMining(space.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start Mining
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="mt-2"
                      onClick={() => stopSpaceMining(space.id)}
                    >
                      Stop Mining
                    </Button>
                  )
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="mt-2"
                    onClick={() => handleWatchAd(space.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Watch Ad Again
                  </Button>
                )}
              </>
            ) : (
              <>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  <span>Locked</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="mt-2"
                  onClick={() => handleWatchAd(space.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Watch Ad
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
      
      <div className="text-xs text-muted-foreground mt-4 text-center">
        Premium users can unlock all spaces permanently
      </div>
    </div>
  );
};

export default MiningSpaces;

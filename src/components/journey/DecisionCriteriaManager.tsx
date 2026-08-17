import { useJourney } from "@/hooks/useJourney";
import { useQuery } from "@tanstack/react-query";
import { DecisionDimensionService } from "@/lib/services/decision-intelligence";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Info, RotateCcw, Target, ShieldCheck, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { type UserPreferencePriority } from "@/lib/services/journey";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function DecisionCriteriaManager() {
  const { preferences, setPreference, resetPreferences, items } = useJourney();

  const { data: dimensions, isLoading } = useQuery({
    queryKey: ["decision-dimensions", "active"],
    queryFn: () => DecisionDimensionService.list(true),
  });

  if (isLoading) {
    return (
      <Card className="rounded-xl border-border bg-surface shadow-none animate-pulse">
        <CardContent className="h-64" />
      </Card>
    );
  }

  // Determine applicable compatibility groups based on journey items
  const hasPlaces = items.some(i => i.type === 'place' || i.type === 'project');
  const hasBuilders = items.some(i => i.type === 'builder' || i.type === 'project');

  const groups = [
    { 
      id: 'place_standard_v1', 
      label: 'Place Priorities', 
      description: 'What matters in a location?',
      icon: <MapPin className="h-4 w-4" />,
      active: hasPlaces 
    },
    { 
      id: 'builder_standard_v1', 
      label: 'Builder Priorities', 
      description: 'What matters in a developer?',
      icon: <ShieldCheck className="h-4 w-4" />,
      active: hasBuilders 
    },
  ];

  const handlePrioritySelect = (dimensionId: string, priority: UserPreferencePriority) => {
    setPreference(dimensionId, priority);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">What matters most to you?</h2>
          <p className="text-sm text-muted-foreground mt-1">Define your priorities to inform future decision intelligence.</p>
        </div>
        {preferences.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => resetPreferences()}
            className="text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="h-3 w-3 mr-2" />
            Reset
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {groups.map(group => {
          const groupDimensions = dimensions?.filter(d => d.compatibility_group === group.id) || [];
          if (groupDimensions.length === 0) return null;

          return (
            <Card key={group.id} className={cn(
              "rounded-xl border-border bg-surface shadow-none transition-opacity",
              !group.active && "opacity-60"
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-muted rounded-md text-muted-foreground">
                    {group.icon}
                  </div>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider">{group.label}</CardTitle>
                </div>
                <CardDescription className="text-xs">{group.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {groupDimensions.map(dim => {
                  const pref = preferences.find(p => p.dimensionId === dim.id);
                  const currentPriority = pref?.priority || 'none';

                  return (
                    <div key={dim.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{dim.name}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-muted-foreground hover:text-foreground">
                                  <Info className="h-3.5 w-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-[200px] text-xs">{dim.description || dim.semantic_definition}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {currentPriority !== 'none' && (
                          <Badge variant="outline" className={cn(
                            "text-[10px] capitalize",
                            currentPriority === 'high' && "border-accent text-accent bg-accent/5",
                            currentPriority === 'medium' && "border-blue-500/50 text-blue-500 bg-blue-500/5",
                            currentPriority === 'low' && "border-muted-foreground/30 text-muted-foreground"
                          )}>
                            {currentPriority}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1.5 p-1 bg-muted/50 rounded-lg border border-border/50">
                        <PriorityButton 
                          active={currentPriority === 'none'} 
                          onClick={() => handlePrioritySelect(dim.id, 'none')}
                          label="None"
                        />
                        <PriorityButton 
                          active={currentPriority === 'low'} 
                          onClick={() => handlePrioritySelect(dim.id, 'low')}
                          label="Low"
                        />
                        <PriorityButton 
                          active={currentPriority === 'medium'} 
                          onClick={() => handlePrioritySelect(dim.id, 'medium')}
                          label="Mid"
                        />
                        <PriorityButton 
                          active={currentPriority === 'high'} 
                          onClick={() => handlePrioritySelect(dim.id, 'high')}
                          label="High"
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function PriorityButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-1.5 text-[10px] font-semibold rounded-md transition-all duration-200",
        active 
          ? "bg-white text-foreground shadow-sm ring-1 ring-border" 
          : "text-muted-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  );
}

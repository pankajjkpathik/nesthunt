import React from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJourney } from "@/hooks/useJourney";
import { type JourneyEntityType } from "@/lib/services/journey";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SaveToJourneyButtonProps {
  type: JourneyEntityType;
  id: string;
  name: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
}

export function SaveToJourneyButton({
  type,
  id,
  name,
  className,
  variant = "outline",
  size = "default",
  showLabel = true,
}: SaveToJourneyButtonProps) {
  const { isSaved, add, remove, isAdding, isRemoving } = useJourney();
  const saved = isSaved(type, id);
  const loading = isAdding || isRemoving;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (saved) {
      remove(type, id);
      toast.info(`Removed ${name} from your journey`);
    } else {
      add(type, id);
      toast.success(`Saved ${name} to your journey`);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "transition-all duration-200",
        saved && "border-accent text-accent bg-accent/5 hover:bg-accent/10",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : saved ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="ml-2">
          {saved ? "Saved to Journey" : `Save ${type.charAt(0).toUpperCase() + type.slice(1)}`}
        </span>
      )}
    </Button>
  );
}

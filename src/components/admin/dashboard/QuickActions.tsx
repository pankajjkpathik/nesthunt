import { Link } from "@tanstack/react-router";
import {
  Building2,
  Boxes,
  FileText,
  MapPin,
  UploadCloud,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickAction {
  key: string;
  label: string;
  icon: LucideIcon;
  to?: string;
  disabled?: boolean;
}

const ACTIONS: QuickAction[] = [
  { key: "place", label: "Add Place", icon: MapPin, to: "/admin/places/new" },
  { key: "builder", label: "Add Builder", icon: Building2, disabled: true },
  { key: "project", label: "Add Project", icon: Boxes, disabled: true },
  { key: "media", label: "Upload Media", icon: UploadCloud, disabled: true },
  { key: "blog", label: "Create Blog", icon: FileText, disabled: true },
  { key: "user", label: "Invite User", icon: UserPlus, disabled: true },
];

export function QuickActions() {
  return (
    <Card className="border-border bg-surface">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Quick actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ACTIONS.map((a) => (
            <ActionTile key={a.key} action={a} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionTile({ action }: { action: QuickAction }) {
  const Icon = action.icon;
  const classes = cn(
    "group flex flex-col items-start gap-2 rounded-lg border border-border bg-background p-3 text-left transition-colors",
    action.disabled
      ? "cursor-not-allowed opacity-60"
      : "hover:border-accent hover:bg-accent/5",
  );

  const inner = (
    <>
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/5 text-primary group-hover:bg-accent/10 group-hover:text-accent">
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-sm font-medium text-foreground">{action.label}</span>
      {action.disabled ? (
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Soon</span>
      ) : null}
    </>
  );

  if (action.disabled || !action.to) {
    return (
      <div className={classes} aria-disabled>
        {inner}
      </div>
    );
  }

  return (
    <Link to={action.to} className={classes}>
      {inner}
    </Link>
  );
}

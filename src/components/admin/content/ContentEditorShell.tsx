import { type ReactNode, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  title: string;
  backHref: string;
  isDirty?: boolean;
  saving?: boolean;
  status?: string;
  onSave: () => void | Promise<void>;
  extraActions?: ReactNode;
  children: ReactNode;
}

export function ContentEditorShell({
  title,
  backHref,
  saving,
  status,
  onSave,
  extraActions,
  children,
}: Props) {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="ghost">
            <Link to={backHref}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-xl font-semibold text-foreground">{title}</h1>
            {status ? (
              <Badge variant="outline" className="mt-1 text-[10px] uppercase">
                {status}
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {extraActions}
          <Button onClick={() => void onSave()} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </header>
      <Card>
        <CardContent className="space-y-6 p-6">{children}</CardContent>
      </Card>
    </div>
  );
}

export function useDirtyState<T>(initial: T) {
  const [state, setState] = useState<T>(initial);
  const [initialState, setInitialState] = useState<T>(initial);
  const isDirty = JSON.stringify(state) !== JSON.stringify(initialState);
  return { state, setState, isDirty, reset: (next: T) => setInitialState(next) };
}

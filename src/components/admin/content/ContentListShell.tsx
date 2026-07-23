import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  title: string;
  description?: string;
  newHref: string;
  newLabel?: string;
  query: string;
  onQueryChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  extraFilters?: ReactNode;
  bulkActions?: ReactNode;
  children: ReactNode;
}

export function ContentListShell({
  title,
  description,
  newHref,
  newLabel = "New",
  query,
  onQueryChange,
  status,
  onStatusChange,
  extraFilters,
  bulkActions,
  children,
}: Props) {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <Button asChild>
          <Link to={newHref}>
            <Plus className="mr-1 h-4 w-4" />
            {newLabel}
          </Link>
        </Button>
      </header>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-64 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search by name or slug…"
                className="pl-9"
              />
            </div>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            {extraFilters}
            {bulkActions ? <div className="ml-auto">{bulkActions}</div> : null}
          </div>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

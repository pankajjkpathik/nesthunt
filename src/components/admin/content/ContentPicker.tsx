import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Tags, Sparkles, MapPin, Home } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useAmenities } from "@/hooks/useAmenities";
import { useInfrastructure } from "@/hooks/useInfrastructure";
import { useUnitTypes } from "@/hooks/useUnitTypes";
import type { ContentPickerItem } from "@/types/content";

export type ContentKind = "category" | "amenity" | "infrastructure" | "unit_type";

const KIND_LABELS: Record<ContentKind, string> = {
  category: "Categories",
  amenity: "Amenities",
  infrastructure: "Infrastructure",
  unit_type: "Unit Types",
};

const KIND_ICON = {
  category: Tags,
  amenity: Sparkles,
  infrastructure: MapPin,
  unit_type: Home,
} as const;

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (items: ContentPickerItem[]) => void;
  kinds: ContentKind[];
  multiple?: boolean;
  excludeIds?: string[];
  title?: string;
}

export function ContentPicker({
  open,
  onClose,
  onSelect,
  kinds,
  multiple = true,
  excludeIds = [],
  title = "Pick content",
}: Props) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Record<string, ContentPickerItem>>({});

  const catsQ = useCategories();
  const amsQ = useAmenities();
  const infQ = useInfrastructure();
  const unitQ = useUnitTypes();

  const items = useMemo<ContentPickerItem[]>(() => {
    const list: ContentPickerItem[] = [];
    if (kinds.includes("category")) {
      for (const c of catsQ.data ?? []) {
        list.push({
          kind: "category",
          id: c.id,
          name: c.name,
          slug: c.slug,
          subtitle: c.description ?? null,
          icon: c.icon,
        });
      }
    }
    if (kinds.includes("amenity")) {
      for (const a of amsQ.data ?? []) {
        list.push({
          kind: "amenity",
          id: a.id,
          name: a.name,
          slug: a.slug,
          subtitle: a.category,
          icon: a.icon,
        });
      }
    }
    if (kinds.includes("infrastructure")) {
      for (const i of infQ.data ?? []) {
        list.push({
          kind: "infrastructure",
          id: i.id,
          name: i.name,
          slug: i.slug,
          subtitle: [i.category, i.city].filter(Boolean).join(" · "),
        });
      }
    }
    if (kinds.includes("unit_type")) {
      for (const u of unitQ.data ?? []) {
        list.push({
          kind: "unit_type",
          id: u.id,
          name: u.name,
          slug: u.slug,
          subtitle: [u.category, u.bedrooms ? `${u.bedrooms} BHK` : ""].filter(Boolean).join(" · "),
        });
      }
    }
    const q = query.trim().toLowerCase();
    const excluded = new Set(excludeIds);
    return list.filter(
      (r) =>
        !excluded.has(r.id) &&
        (!q ||
          r.name.toLowerCase().includes(q) ||
          r.slug.toLowerCase().includes(q) ||
          (r.subtitle ?? "").toLowerCase().includes(q)),
    );
  }, [kinds, catsQ.data, amsQ.data, infQ.data, unitQ.data, query, excludeIds]);

  const grouped = useMemo(() => {
    const map = new Map<ContentKind, ContentPickerItem[]>();
    for (const r of items) {
      const arr = map.get(r.kind) ?? [];
      arr.push(r);
      map.set(r.kind, arr);
    }
    return Array.from(map.entries());
  }, [items]);

  function toggle(item: ContentPickerItem) {
    if (!multiple) {
      onSelect([item]);
      setPicked({});
      onClose();
      return;
    }
    setPicked((prev) => {
      const next = { ...prev };
      if (next[item.id]) delete next[item.id];
      else next[item.id] = item;
      return next;
    });
  }

  function confirm() {
    onSelect(Object.values(picked));
    setPicked({});
    onClose();
  }

  const loading =
    catsQ.isLoading || amsQ.isLoading || infQ.isLoading || unitQ.isLoading;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Command shouldFilter={false} className="max-h-[60vh]">
          <CommandInput
            placeholder={`Search ${kinds.map((k) => KIND_LABELS[k].toLowerCase()).join(", ")}…`}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading…</div>
            ) : items.length === 0 ? (
              <CommandEmpty>No matches.</CommandEmpty>
            ) : (
              grouped.map(([kind, list]) => {
                const Icon = KIND_ICON[kind];
                return (
                  <CommandGroup key={kind} heading={KIND_LABELS[kind]}>
                    {list.map((item) => {
                      const isPicked = !!picked[item.id];
                      return (
                        <CommandItem
                          key={`${item.kind}:${item.id}`}
                          value={`${item.kind}:${item.id}`}
                          onSelect={() => toggle(item)}
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded border border-border bg-muted/40">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{item.name}</div>
                            {item.subtitle ? (
                              <div className="truncate text-xs text-muted-foreground">
                                {item.subtitle}
                              </div>
                            ) : null}
                          </div>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {KIND_LABELS[item.kind].slice(0, -1)}
                          </Badge>
                          {multiple && isPicked ? (
                            <Check className="h-4 w-4 text-accent" />
                          ) : null}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                );
              })
            )}
          </CommandList>
        </Command>
        {multiple ? (
          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <p className="text-xs text-muted-foreground">
              {Object.keys(picked).length} selected
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" onClick={confirm} disabled={!Object.keys(picked).length}>
                Add selected
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

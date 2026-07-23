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
import { Check, ImageIcon, MapPin, Building2, Boxes } from "lucide-react";
import { useEntitySearch } from "@/hooks/useRelationships";
import type { EntityType } from "@/types/relationships";
import { ENTITY_LABELS, ENTITY_PLURALS } from "@/types/relationships";
import type { EntitySearchResult } from "@/lib/services/relationships";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (items: EntitySearchResult[]) => void;
  types: EntityType[];
  multiple?: boolean;
  excludeIds?: string[];
  title?: string;
}

const TYPE_ICON: Partial<Record<EntityType, typeof MapPin>> = {
  place: MapPin,
  builder: Building2,
  project: Boxes,
  media: ImageIcon,
};

export function EntityPicker({
  open,
  onClose,
  onSelect,
  types,
  multiple = false,
  excludeIds = [],
  title = "Choose entity",
}: Props) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Record<string, EntitySearchResult>>({});

  const { data, isLoading } = useEntitySearch({
    types,
    query,
    excludeIds,
    enabled: open,
  });

  const grouped = useMemo(() => {
    const map = new Map<EntityType, EntitySearchResult[]>();
    for (const r of data ?? []) {
      const arr = map.get(r.type) ?? [];
      arr.push(r);
      map.set(r.type, arr);
    }
    return Array.from(map.entries());
  }, [data]);

  function toggle(item: EntitySearchResult) {
    if (!multiple) {
      onSelect([item]);
      onClose();
      setPicked({});
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

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Command shouldFilter={false} className="max-h-[60vh]">
          <CommandInput
            placeholder={`Search ${types.map((t) => ENTITY_PLURALS[t].toLowerCase()).join(", ")}…`}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isLoading ? (
              <div className="p-4 text-sm text-muted-foreground">Searching…</div>
            ) : (data?.length ?? 0) === 0 ? (
              <CommandEmpty>No matches.</CommandEmpty>
            ) : (
              grouped.map(([type, items]) => {
                const Icon = TYPE_ICON[type];
                return (
                  <CommandGroup key={type} heading={ENTITY_LABELS[type]}>
                    {items.map((item) => {
                      const isPicked = !!picked[item.id];
                      return (
                        <CommandItem
                          key={`${item.type}:${item.id}`}
                          value={`${item.type}:${item.id}`}
                          onSelect={() => toggle(item)}
                          className="flex items-center gap-3"
                        >
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt=""
                              className="h-8 w-8 rounded border border-border object-cover"
                            />
                          ) : Icon ? (
                            <div className="flex h-8 w-8 items-center justify-center rounded border border-border bg-muted/40">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          ) : null}
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{item.name}</div>
                            {item.subtitle ? (
                              <div className="truncate text-xs text-muted-foreground">
                                {item.subtitle}
                              </div>
                            ) : null}
                          </div>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {ENTITY_LABELS[item.type]}
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
                Attach selected
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

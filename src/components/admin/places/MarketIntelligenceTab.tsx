import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, NumberField, TextareaField } from "@/components/admin/form/Fields";

export interface MarketIntelligenceValues {
  market_segment: string | null;
  investment_category: string | null;
  development_stage: string | null;
  average_price: number | null;
  price_min: number | null;
  price_max: number | null;
  rental_yield: number | null;
  absorption_rate: number | null;
  vacancy_rate: number | null;
  connectivity_summary: string | null;
  employment_summary: string | null;
  investment_outlook: string | null;
  growth_outlook: string | null;
  livability_outlook: string | null;
}

const SEGMENTS = ["affordable", "mid", "premium", "luxury", "ultra_luxury"];
const CATEGORIES = ["end_use", "short_term", "long_term", "speculative"];
const STAGES = ["proposed", "under_development", "emerging", "established", "saturated"];

interface Props {
  value: MarketIntelligenceValues;
  onChange: (patch: Partial<MarketIntelligenceValues>) => void;
}

export function MarketIntelligenceTab({ value, onChange }: Props) {
  return (
    <Card>
      <CardContent className="grid gap-5 p-6 md:grid-cols-3">
        <Field label="Market segment">
          <Select
            value={value.market_segment ?? "__none"}
            onValueChange={(v) => onChange({ market_segment: v === "__none" ? null : v })}
          >
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">—</SelectItem>
              {SEGMENTS.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Investment category">
          <Select
            value={value.investment_category ?? "__none"}
            onValueChange={(v) => onChange({ investment_category: v === "__none" ? null : v })}
          >
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">—</SelectItem>
              {CATEGORIES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Development stage">
          <Select
            value={value.development_stage ?? "__none"}
            onValueChange={(v) => onChange({ development_stage: v === "__none" ? null : v })}
          >
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">—</SelectItem>
              {STAGES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        <NumberField
          label="Average price (₹/sqft)"
          value={value.average_price ?? 0}
          onChange={(v) => onChange({ average_price: Number.isFinite(v) ? v : null })}
        />
        <NumberField
          label="Price min (₹/sqft)"
          value={value.price_min ?? 0}
          onChange={(v) => onChange({ price_min: Number.isFinite(v) ? v : null })}
        />
        <NumberField
          label="Price max (₹/sqft)"
          value={value.price_max ?? 0}
          onChange={(v) => onChange({ price_max: Number.isFinite(v) ? v : null })}
        />

        <NumberField
          label="Rental yield (%)"
          step={0.1}
          value={value.rental_yield ?? 0}
          onChange={(v) => onChange({ rental_yield: Number.isFinite(v) ? v : null })}
        />
        <NumberField
          label="Absorption rate (%)"
          step={0.1}
          value={value.absorption_rate ?? 0}
          onChange={(v) => onChange({ absorption_rate: Number.isFinite(v) ? v : null })}
        />
        <NumberField
          label="Vacancy rate (%)"
          step={0.1}
          value={value.vacancy_rate ?? 0}
          onChange={(v) => onChange({ vacancy_rate: Number.isFinite(v) ? v : null })}
        />

        <div className="md:col-span-3">
          <TextareaField
            label="Connectivity summary"
            rows={2}
            value={value.connectivity_summary ?? ""}
            onChange={(v) => onChange({ connectivity_summary: v })}
          />
        </div>
        <div className="md:col-span-3">
          <TextareaField
            label="Employment summary"
            rows={2}
            value={value.employment_summary ?? ""}
            onChange={(v) => onChange({ employment_summary: v })}
          />
        </div>
        <div>
          <TextareaField
            label="Investment outlook"
            rows={3}
            value={value.investment_outlook ?? ""}
            onChange={(v) => onChange({ investment_outlook: v })}
          />
        </div>
        <div>
          <TextareaField
            label="Growth outlook"
            rows={3}
            value={value.growth_outlook ?? ""}
            onChange={(v) => onChange({ growth_outlook: v })}
          />
        </div>
        <div>
          <TextareaField
            label="Livability outlook"
            rows={3}
            value={value.livability_outlook ?? ""}
            onChange={(v) => onChange({ livability_outlook: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

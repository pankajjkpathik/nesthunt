import { Card, CardContent } from "@/components/ui/card";
import { StringListField, TextareaField } from "@/components/admin/form/Fields";

export interface NarrativeValues {
  executive_summary: string;
  highlights: string[];
  weaknesses: string[];
  opportunities: string[];
  recommendation: string | null;
}

interface Props {
  value: NarrativeValues;
  onChange: (patch: Partial<NarrativeValues>) => void;
}

export function NarrativeTab({ value, onChange }: Props) {
  return (
    <Card>
      <CardContent className="grid gap-6 p-6">
        <TextareaField
          label="Executive summary"
          rows={6}
          value={value.executive_summary}
          onChange={(v) => onChange({ executive_summary: v })}
          hint="The single most important paragraph for buyers and investors."
        />
        <StringListField
          label="Strengths"
          items={value.highlights}
          onChange={(v) => onChange({ highlights: v })}
          placeholder="What makes this place strong…"
        />
        <StringListField
          label="Weaknesses"
          items={value.weaknesses}
          onChange={(v) => onChange({ weaknesses: v })}
          placeholder="Structural weakness or concern…"
        />
        <StringListField
          label="Opportunities"
          items={value.opportunities}
          onChange={(v) => onChange({ opportunities: v })}
          placeholder="Emerging opportunity…"
        />
        <TextareaField
          label="Recommendation / verdict"
          rows={4}
          value={value.recommendation ?? ""}
          onChange={(v) => onChange({ recommendation: v })}
          hint="NestHunt's final recommendation."
        />
      </CardContent>
    </Card>
  );
}

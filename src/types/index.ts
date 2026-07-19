export interface CategoryRating {
  label: string;
  score: number;
}

export interface DecisionSummary {
  score: number;
  confidence: "Low" | "Medium" | "High";
  categoryRatings?: CategoryRating[];
  verdict: string;
}

export interface TimelineEntry {
  year: number;
  label: string;
}

export interface Place {
  id: string;
  slug: string;
  name: string;
  region: string;
  summary: string;
  highlights: string[];
  metrics: {
    population: string;
    avgPricePerSqft: string;
    activeProjects: number;
    verifiedBuilders: number;
  };
  executiveSummary: string;
  decision: DecisionSummary;
  opportunities: string[];
  risks: string[];
}

export interface Builder {
  id: string;
  slug: string;
  name: string;
  headquarters: string;
  yearsActive: number;
  summary: string;
  metrics: {
    completedProjects: number;
    ongoingProjects: number;
    onTimeDeliveryRate: string;
    reraRegistered: boolean;
  };
  decision: DecisionSummary;
  strengths: string[];
  watchOuts: string[];
  timeline: TimelineEntry[];
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  builderId: string;
  placeId: string;
  status: "planning" | "under-construction" | "ready";
  summary: string;
  metrics: {
    unitTypes: string;
    priceRange: string;
    possessionYear: number;
    totalUnits: number;
  };
  suitableFor: string[];
  lessSuitableFor: string[];
  strengths: string[];
  risks: string[];
  legal: string[];
  progress: string[];
}

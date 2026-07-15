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
}

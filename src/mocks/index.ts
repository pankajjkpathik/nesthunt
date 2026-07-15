import type { Builder, Place, Project } from "@/types";

export const newChandigarh: Place = {
  id: "place_new_chandigarh",
  slug: "new-chandigarh",
  name: "New Chandigarh",
  region: "Punjab, India",
  summary:
    "A planned satellite township north-west of Chandigarh, developed under the Greater Mohali Area Development Authority. Positioned as an education and residential hub with structured zoning.",
  highlights: [
    "Master-planned by GMADA",
    "Proximity to Chandigarh & Mohali",
    "Growing education corridor",
    "Structured residential sectors",
  ],
  metrics: {
    population: "~85,000",
    avgPricePerSqft: "₹5,400",
    activeProjects: 18,
    verifiedBuilders: 12,
  },
};

export const omaxe: Builder = {
  id: "builder_omaxe",
  slug: "omaxe",
  name: "Omaxe",
  headquarters: "New Delhi, India",
  yearsActive: 35,
  summary:
    "A national real-estate developer with a diversified portfolio across residential, commercial, and township projects in Tier-1 and Tier-2 cities.",
  metrics: {
    completedProjects: 132,
    ongoingProjects: 24,
    onTimeDeliveryRate: "78%",
    reraRegistered: true,
  },
};

export const heroHomes: Project = {
  id: "project_hero_homes",
  slug: "hero-homes",
  name: "Hero Homes",
  builderId: omaxe.id,
  placeId: newChandigarh.id,
  status: "under-construction",
  summary:
    "A mid-to-premium residential development in New Chandigarh with a focus on low-density planning, open landscaping, and structured amenities.",
  metrics: {
    unitTypes: "2, 3 & 4 BHK",
    priceRange: "₹1.1 Cr – ₹2.4 Cr",
    possessionYear: 2027,
    totalUnits: 480,
  },
};

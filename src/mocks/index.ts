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
  executiveSummary:
    "New Chandigarh is emerging as one of the strongest long-term residential corridors around Chandigarh due to planned infrastructure, institutional growth and controlled development.",
  decision: {
    score: 8.9,
    confidence: "High",
    categoryRatings: [
      { label: "Connectivity", score: 9.0 },
      { label: "Education", score: 9.6 },
      { label: "Livability", score: 8.2 },
      { label: "Investment", score: 8.8 },
      { label: "Safety", score: 8.0 },
      { label: "Future Growth", score: 9.5 },
    ],
    verdict:
      "Best suited for long-term end users and patient investors seeking a planned township with strong institutional anchors and improving infrastructure.",
  },
  opportunities: [
    "Planned metro connectivity",
    "Growing education corridor",
    "Strong demand from Chandigarh spillover",
  ],
  risks: ["Infrastructure still evolving", "Premium pricing vs. peer suburbs"],
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
  decision: {
    score: 87,
    confidence: "High",
    verdict:
      "A large, RERA-registered builder with a broad delivery history — dependable for structured townships, but expect premium positioning.",
  },
  strengths: [
    "Timely delivery on recent townships",
    "Strong balance-sheet and financials",
    "Large, diversified project portfolio",
  ],
  watchOuts: [
    "Premium pricing across most launches",
    "Customer support response times",
  ],
  timeline: [
    { year: 2008, label: "First integrated township delivered" },
    { year: 2014, label: "100th project handover" },
    { year: 2019, label: "Expansion into Tier-2 markets" },
    { year: 2025, label: "132 completed, 24 ongoing" },
  ],
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
  suitableFor: ["Families", "Long-term investors", "End users"],
  lessSuitableFor: ["Immediate possession", "High rental yield"],
  strengths: [
    "Low-density master plan",
    "Reputed builder with RERA registration",
    "Location within a planned township",
  ],
  risks: [
    "Possession still ~2 years out",
    "Premium pricing vs. immediate neighborhood",
  ],
  legal: [
    "RERA registered — PBRERA-SAS80-PR0421",
    "Land title verified — freehold",
    "No pending litigation on file",
  ],
  progress: [
    "Excavation completed",
    "Tower A — 6 of 18 floors cast",
    "Tower B — foundation in progress",
  ],
};

# Builder Data Mapping: Public Page vs. Supabase/NHOS

| Public Field | Source Table:Field | Type | Notes |
| :--- | :--- | :--- | :--- |
| **Builder Name** | `builders:name` | CMS | |
| **Logo** | `builders:hero->logoUrl` | CMS | Media Library link |
| **Description** | `builders:description` | CMS | |
| **Executive Summary** | `builders:summary` | CMS | |
| **Founded Year** | `builders:year_established` | CMS | |
| **Headquarters** | `builders:headquarters` | CMS | Fallback to `head_office` |
| **Years in Business** | `builders:years_active` | Derived | `new Date().getFullYear() - year_established` |
| **Property Segments** | `builders:metrics->segments` | CMS | Fallback to `builder_type` |
| **Projects Completed** | `builders:metrics->completedProjects` | CMS | Manual override for now |
| **Projects Ongoing** | `builders:metrics->ongoingProjects` | CMS | Manual override for now |
| **Cities Served** | `builders:metrics->citiesServed` | CMS | Manual override for now |
| **Trust Score** | `builders:trust_score` | CMS | Average of Trust Breakdown |
| **Trust Breakdown** | `builders:trust_breakdown` | CMS | JSON array of label/score |
| **Strengths** | `builders:strengths` | CMS | string[] |
| **Watch-outs** | `builders:watch_outs` | CMS | string[] |
| **Projects** | `projects` table | Relational | Linked via `builder_id`, must be `published` |
| **Risks** | `place_risks` table | Relational | Linked via `builder_id` |
| **Evidence** | `place_evidence` table | Relational | Linked via `builder_id` |
| **Promises** | `place_promises` table | Relational | Linked via `builder_id` |
| **RERA Records** | `builder_rera_records` table | Relational | Linked via `builder_id` |
| **Leadership** | `builder_leadership` table | Relational | Linked via `builder_id` |
| **Awards** | `builder_awards` table | Relational | Linked via `builder_id` |
| **Certifications** | `builder_certifications` table | Relational | Linked via `builder_id` |
| **SEO** | `builders:seo` | CMS | JSON object |
| **Operating Areas** | `builder_places` table | Relational | Join table with `places` |

## Audit Status
- **Hardcoded Demo Data:** None currently visible in `BuilderHero` or `BuilderExecutiveSummary`. They correctly use `NA` or hide empty fields.
- **Fabricated Metrics:** The metrics in `builders:metrics` are currently manual CMS entries.
- **Trust Score:** Driven by `builders:trust_score` (computed average in CMS).
- **Project Portfolio:** Driven by live query in `builders.$slug.tsx`.

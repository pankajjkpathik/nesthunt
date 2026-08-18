# LAUNCH-002J — PROJECT INTELLIGENCE PRESENTATION UPGRADE

Improve the public Project Intelligence presentation layer using existing authoritative data and Gardenia Floors as the specimen.

## User Impact
Users will see clearer, evidence-backed project intelligence with explicit attribution, historical context for construction progress, and proactive due-diligence prompts.

## Proposed Changes

### 1. Presentation Components
- **`ProjectExecutiveSummary.tsx`**: Prominently display the `executive_summary` field near the top of the page. Handle NULL state with a "Summary not yet available" message.
- **`ProjectIntelligenceSummary.tsx`**: (Renamed/Replaced by `ProjectNestHuntIntelligence.tsx`): Surface "What we know" vs "What remains to verify" based on live data fields (RERA, Builder, Place, Configurations, Amenities, Progress).
- **`ProjectHero.tsx`**:
    - Implement granular evidence labels (VERIFIED, OFFICIAL UPDATE, REPORTED, NOT AVAILABLE).
    - Handle "Project imagery unavailable" empty media state gracefully.
- **`ProjectDueDiligence.tsx`**: Contextualize checklist prompts using project facts (e.g., specific mention of historical progress dates).
- **`ProjectEntityRelationships.tsx`**: Enhance Builder/Place links with "Explore Builder/Place Intelligence" language.
- **`ProjectQuickFacts.tsx`**: Ensure factual alignment with RERA number, status, and possession.

### 2. Intelligence Layer Hardening
- **Progress Display**: Surface the latest official construction progress with clear dating (e.g., "38.42% as of 5 June 2025"). 
- **Chronological History**: Ensure chronological rendering of construction history without fabricating the "0%" starting point unless explicitly in the data.
- **Price Handling**: Strictly maintain "Price on request" for NULL starting prices.
- **Decision Safety**: Enforce suppression of numerical scores and ratings.

### 3. Service Layer
- **`ProjectPublicService`**: Ensure `executive_summary` and latest progress are correctly passed to the view layer.

## Technical Details
- **Factual Mapping**: 
    - RERA -> VERIFIED
    - Construction Progress -> OFFICIAL UPDATE (dated)
    - Possession -> REPORTED
    - Price (NULL) -> NOT AVAILABLE
- **Responsive Audit**: Verify layout integrity across Desktop, Tablet, and Mobile.
- **SEO Maintenance**: Preserve all existing meta-tags and JSON-LD schema.

## Core Invariants (Maintained)
- NO Project Score.
- NO ranking or recommendations.
- NO fabricated narrative or imagery.
- NO database schema changes.

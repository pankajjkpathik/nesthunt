# BUILD-018 — Builder Intelligence SEO & Discoverability

Objective: Implement comprehensive SEO, metadata, canonical URLs, and structured data for public Builder Intelligence pages.

## User Review Required

> [!IMPORTANT]
> The canonical domain `https://www.nesthunt.in` will be used for all canonical and Open Graph URLs. Robots behavior will strictly follow publication status: `index, follow` for published builders, and `noindex, nofollow` for drafts/unpublished.

## Technical Details

### SEO Implementation Strategy
1.  **Dynamic Metadata**: Update `src/routes/builders.$slug.tsx`'s `head()` to use live builder data for:
    *   Title: `{Name} | Builder Intelligence | NestHunt`
    *   Meta Description: From `builder.summary` or fallback.
    *   Canonical URL: `https://www.nesthunt.in/builders/{slug}`
    *   Open Graph & Twitter: Map `og:title`, `og:description`, `og:image` (using builder logo), etc.
    *   Robots: Set `noindex` if status is not `published`.

2.  **Structured Data (JSON-LD)**:
    *   Implement `Organization` schema in `src/routes/builders.$slug.tsx`.
    *   Implement `BreadcrumbList` schema.
    *   Implement `FAQPage` schema if published FAQs exist.
    *   Ensure all JSON-LD properties are cleaned of `null`/`undefined` values.

3.  **Sitemap Generation**:
    *   Create `src/routes/api/public/sitemap.ts` to dynamically list all published builders.
    *   Integrate with existing sitemap logic if present.

4.  **Builders Index SEO**:
    *   The builders index seems to be the homepage or a missing route; I will verify if a `/builders` route needs to be created or if it's integrated elsewhere.

## Acceptance Criteria
- [ ] Unique HTML title and meta description for every builder.
- [ ] Canonical URLs pointing to the production domain.
- [ ] Open Graph and Twitter tags correctly populated.
- [ ] JSON-LD (Organization, Breadcrumb, FAQ) implemented.
- [ ] `noindex, nofollow` applied to unpublished builders.
- [ ] No visual changes to the UI.
- [ ] No fabricated data (ratings, reviews).

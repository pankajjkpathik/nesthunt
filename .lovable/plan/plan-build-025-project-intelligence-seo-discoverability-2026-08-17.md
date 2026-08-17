# Plan - BUILD-025 PROJECT INTELLIGENCE SEO & DISCOVERABILITY

Implement production-grade SEO and discoverability for the public Project Intelligence pages, reusing the existing NHOS SEO architecture.

## User Review Required

> [!IMPORTANT]
> - The canonical URL pattern will be `https://www.nesthunt.in/projects/{slug}`.
> - Legacy `/project/hero-homes` will be redirected to `/projects/hero-homes`.
> - Project directory/index does not exist and won't be created in this milestone as per instructions.

## Proposed Changes

### SEO & Metadata
#### [projects.$slug.tsx](src/routes/projects.$slug.tsx)
- Implement dynamic `head` function using `PublicProject` data.
- Generate dynamic title: `{Project Name} | Project Intelligence | NestHunt`.
- Generate meta description (140-160 chars) using project name, builder, and locality.
- Add canonical link to `https://www.nesthunt.in/projects/{slug}`.
- Implement Open Graph and Twitter metadata (title, description, url, type, site_name).
- Open Graph image priority: Project Hero Image -> DAM assets -> NestHunt default social image.
- Robots: `index, follow` for published projects, `noindex, nofollow` for drafts/others.
- Inject `BreadcrumbList` and `WebPage` structured data via JSON-LD in the component.

### Sitemap
#### [sitemap.ts](src/routes/api/public/sitemap.ts)
- Extend the dynamic sitemap to fetch and include all `published` projects.
- Use canonical URLs and `lastmod` from `updated_at`.

### Legacy Route Handling
#### [project.hero-homes.tsx](src/routes/project.hero-homes.tsx)
- Implement a redirect to the new canonical route `/projects/hero-homes`.

### Internal Linking Audit & Fixes
- Update all occurrences of `/project/` to `/projects/` to ensure canonical linking.
- Files affected:
    - `src/routes/index.tsx`
    - `src/routes/places.new-chandigarh.tsx`
    - `src/routes/builder.omaxe.tsx`
    - `src/routes/journey.tsx`
    - `src/components/layout/Header.tsx`
    - `src/components/layout/Footer.tsx`
    - `src/routes/admin.projects.index.tsx`
    - `src/components/admin/BuilderEditor.tsx`
    - `src/components/admin/ProjectEditor.tsx`

## Verification Plan

### Automated Tests
- Build the project to ensure no TypeScript or build errors.
- Verify sitemap response via `curl`.

### Manual Verification
- Inspect the generated HTML of a project page to verify:
    - `<title>` content.
    - `<meta name="description">` content.
    - `<link rel="canonical">` href.
    - Open Graph and Twitter tags.
    - `<script type="application/ld+json">` presence and correctness.
    - Robots meta tag based on publish status.
- Verify redirect from `/project/hero-homes`.
- Click internal project links to ensure they point to `/projects/`.

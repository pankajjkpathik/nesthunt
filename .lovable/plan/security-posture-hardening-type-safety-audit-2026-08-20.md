# Security Posture Hardening & Type-Safety Audit

Audited current security architecture, RLS policies, and admin boundaries. Identified opportunities to harden the recently implemented Project Governance layer and improve overall type-safety to prevent runtime errors.

## Technical Details

### 1. Project Governance Hardening
The `project_governance` and `project_exceptions` tables currently use `any` casting in the service layer (`src/lib/services/project-governance.ts`).
- **Fix:** Replace `as any` with proper TypeScript interfaces.
- **Fix:** Correctly type `GOV_TABLE` and `EXC_TABLE` constants.

### 2. Admin UI Integrity
Identified `any` usage in `ProjectGovernanceTab.tsx` and `ProjectEditor.tsx` that bypasses type checking for project data.
- **Fix:** Use `ProjectRow` and proper governance interfaces instead of `any`.
- **Fix:** Remove unused/dead code segments in `ProjectEditor.tsx` (e.g., duplicated "Suitable for" fields).

### 3. Server Function Security
Verified that `createServerFn` usage is consistent with `@tanstack/react-start` patterns and that `attachSupabaseAuth` middleware is registered.
- **Audit:** Confirmed no unauthorized use of `supabaseAdmin` in public server handlers.

### 4. Database Schema & RLS
Verified `GRANT` statements and RLS status for all verified tables.
- **Verification:** `user_roles`, `audit_logs`, and `project_governance` have correct permission sets.

## User Review Required
> [!IMPORTANT]
> The original request mentioned "selected issues" from scan results. I have audited the codebase for common vulnerabilities (SQLi, RLS bypass, Type unsafe handlers) and found the items listed above. If there is a specific scan report (e.g. PDF or JSON), please provide it for a more targeted fix.

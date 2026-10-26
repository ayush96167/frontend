# Roadmap — HiLabs Careers Job Portal MVP

Mock-data frontend MVP (TanStack Start + shadcn/ui), HiLabs editorial theme.

## Foundation
- [x] HiLabs theme tokens in src/styles.css (white/ink/vivid blue, status colors)
- [x] Root shell: Inter font, Toaster, metadata
- [x] Mock data layer: src/lib/mock/{types,seed,api}.ts + mock auth (src/lib/mock/auth.tsx)
- [x] Shared components: logo, site navbar/footer, app shell (student/HR/admin sidebars), job card, status badge, empty state, application modal
- [x] format helpers (src/lib/format.ts)

## Section A — Public & auth (7)
- [x] / landing (Page 1)
- [x] /register/student (Page 2)
- [x] /register/company-owner (Page 3)
- [x] /login (Page 4)
- [x] /verify-email (Page 5)
- [x] /jobs (Page 6)
- [x] /jobs/$jobId (Page 7)

## Section B — Student portal (6)
- [x] /student/dashboard (Page 8)
- [x] /student/profile (Page 9)
- [x] /student/resumes (Page 10)
- [x] Application modal (Page 11, component)
- [x] /student/applications (Page 12)
- [x] /student/saved-jobs (Page 13)

## Section C — HR & company portal (8)
- [x] /hr/join-company (Page 14)
- [x] /company/$companyId/dashboard (Page 15)
- [x] /company/$companyId/jobs (Page 16)
- [x] /company/$companyId/jobs/new + /company/$companyId/jobs/$jobId/edit (Page 17)
- [x] /company/$companyId/applications (Page 18)
- [x] /company/$companyId/applications/$applicationId (Page 19)
- [x] /company/$companyId/members (Page 20)
- [x] /company/$companyId/settings (Page 21)

## Section D — Admin portal (4)
- [x] /admin/dashboard (Page 22)
- [x] /admin/companies (Page 23)
- [x] /admin/membership-requests (Page 24)
- [x] /admin/users (Page 25)

## Verification
- [ ] Build log check after all routes
- [ ] Playwright pass: landing, /jobs, job detail, login → role dashboards, one HR + admin flow

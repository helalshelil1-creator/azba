# Test coverage inventory (local, disposable Postgres; not exhaustive, no zero-defect claim)

Legend: E = exercised by an HTTP test with assertions on behavior; S = smoke only (route answers, status < 500, authorization for investor checked on a few); U = not tested.

| Module | E | S | U |
|---|---|---|---|
| auth | login, refresh (rotation, reuse, cookie), forgot/reset (email captured), throttling, profile update conflicts, JWT secret enforcement (unit) | /auth/me | register edge cases, email/phone verification flows if any, logout |
| users | role change, status change, delete/escalation rules | list, stats | profile fields beyond role/status |
| investments | reservation create/cancel/expiry counters, confirm (sandbox), withdraw atomicity, concurrency | dashboard, list, wallet, transactions, reservations, admin/all | cancel investment (path only reachable for statuses the code never creates) |
| financial | expense approve/reject, journal create (cents) / reverse, distribution approve/execute (concurrency), P&L exclusions, inactive-account posting | accounts, entries list, expenses list, trial balance, distributions list | account create/update/deactivate, expense create/update, distribution create, sales/purchase-order paths |
| projects | create (2 projects), update consistency, public detail visibility | list, stats, admin list | publish/status changes, remove, getFinancials |
| farms | public detail privacy, pen create/update validation, employee add | list, stats | farm create/update/delete, building create/update, pen delete, employee remove |
| animals | detail authz, transfer, death, vet report approve (concurrency), feed/death validation | list, stats, qr | create, update, weights, health records, vaccinations, vet report create |
| support | ownership, internal notes, first response, rating, replies | list, all, stats | assign, update |
| notifications | own-only read/mark, admin-only stats | list | send, markAllAsRead, notifyProjectInvestors |
| admin | none | dashboard, kpis, audit logs, pending approvals | seed-accounts |
| web | login, silent refresh, forgot, reset page (pixels), build of 40 pages | none | dashboard pages, forms, i18n/RTL beyond reset page, mobile layouts |
| serverless shim | routing via x-azba-route, login, cookie refresh | health | CORS preflight, cold start under real Vercel |

Smoke only proves "no 5xx"; a 404/403 also passes it, so S rows can still hide wrong behavior.

# Planner

## Working conventions

- When adding or changing an API endpoint, write/update an automated test for it
  (see `apps/api/test/procurement-workflow.e2e-spec.ts` for the e2e pattern) instead
  of verifying it ad hoc with `curl` against a running dev server.

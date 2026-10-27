# Migration Plan

Order (strict):
1. foundation (app shell, shadcn setup, tokens)
2. command-palette (Cmd+K)
3. today-dashboard
4. jobs-list
5. cvs-grid
6. projects-grid
7. job-workspace
8. polish pass (toast/undo, a11y, mobile, dark mode)

Per screen:
1. Designer writes SCREEN_SPEC → Human Gate 1 approves
2. Builder implements on feat/ui-<id>
3. Verifier produces VERIFY_REPORT
4. Human Gate 2 approves → merge
5. Orchestrator updates TASKS.md

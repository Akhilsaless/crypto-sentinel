# Architecture rules
- Keep Phase 1 entirely client-side with no external service enablement; this release is safe UI consolidation only.
- Centralize sidebar/mobile destinations in `src/data/navigation.ts` and keep explorer matching exact; preserve detailed signal routes without ambiguous active links.
- Store only validated, manually entered alert/journal records under versioned browser-local keys; start empty and show storage errors so sample trading fixtures never become real history.
- Use pure deterministic validation/calculation in `src/features/phase1` and test it separately from UI; chart results must not imply AI analysis or execution.
- Prefix mock trading screens and statuses with sample/simulation context; execution controls only update page-local state and never modify trading fixtures.
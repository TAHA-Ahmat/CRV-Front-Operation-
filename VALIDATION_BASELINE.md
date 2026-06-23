---
name: crv-validation-baseline
type: non-rÃ©gression-baseline
date: 2026-06-23
---

# VALIDATION_BASELINE â€” CRV Non-RÃ©gression Reference

## Ã‰tat initial (baseline 2026-06-23 10:00 UTC)

Ã‰tat de rÃ©fÃ©rence pour dÃ©terminer si travail futur = rÃ©gression.

### Commits actuels

```
Frontend: 5430e0a fix: session 3h â†’ 10h sur page login
  Date: TBD
  Branch: main
  Origin: https://github.com/TAHA-Ahmat/CRV-Front-Operation-.git
  Status: âœ… En sync avec GitHub

Backend: 013561c fix(auth): JWT 3h â†’ 10h â€” agents terrain non dÃ©connectÃ©s en shift
  Date: TBD
  Branch: main
  Origin: https://github.com/TAHA-Ahmat/CRV-Back-Operation-.git
  Status: âœ… En sync avec GitHub
```

### Tests & Coverage

**Backend** (suite complÃ¨te, aucun skip):
```
âœ… 113 tests passants (P0_ROUTE_AUTH_001/002 + plus)
âœ… 0 tests failing
âœ… 0 tests skipped
Coverage: Backend complet (auth, services, models)
```

**Frontend** (coverage suite UX_AUDIT_SESSION7):
```
âœ… Desktop responsive (1920x1080)
âœ… Mobile responsive (<768px)
âœ… Wizard 7 Ã©tapes navigable
âœ… PDF gÃ©nÃ©ration OK
```

### Routes Auth (P0 baseline)

**CRV routes protÃ©gÃ©es** (excludeAdmin middleware):
```
27 routes P0_ROUTE_AUTH_001   âœ… Verified
20 routes P0_ROUTE_AUTH_002   âœ… Verified
Total: 47 routes             âœ… SUM = OK
```

### Code Quality

**Zones rouges status**:
- ðŸ”´ crv.controller.js:150 (Personnel save) = âœ… FIXED (findByIdAndUpdate atomique)
- ðŸ”´ crv.controller.js:220 (GET /api/crv/:id) = âœ… FIXED (materielUtilise â†’ AffectationEnginVol)
- ðŸ”´ CRVPersonnel.vue = âœ… FIXED (STAB-2 isResponsable embedded)

**Code mort removed**:
- -558 lignes (crvTransaction.service.js)
- -9 tests orphelins (crv-transaction.test.js)

### Missions completed

40+ missions documentÃ©es MISSION_INDEX.md:

**P0 sÃ©curitÃ©** (3 missions):
- âœ… P0_ROUTE_AUTH_001, P0_ROUTE_AUTH_002, P0_VERSION_ERROR_001

**P1 UX + traÃ§abilitÃ©** (13 missions):
- âœ… P1_UX_001, P1_UX_002, P1_UX_003, P1_UX_004
- âœ… P1_UI_API_001, P1_UI_API_002, P1_UI_API_003, P1_UI_API_004, P1_UI_API_005
- âœ… P1_WIZARD_STEP_001, P1_CHARGES_DISPLAY_001, P1_DELETE_GUARD_001, P1_PHASE_NONREALISE_001
- âœ… P1_BINDING_DEPART_TURNAROUND, P1_PREFILL_DEPART_TURNAROUND

**P2 hygiÃ¨ne** (5 missions):
- âœ… P2_DEAD_SERVICE_001, P2_DOUBLE_RELOAD_001, P2_ENDPOINT_001
- âœ… P2_CRVEVENT_INTEGRATION_001, P2_REMOVE_CRV_HOME

**Stabilisation** (4 missions):
- âœ… CRV_STAB_EXECUTION, CRV_STAB2_FINAL

**Superviseur** (4 missions):
- âœ… CRV_SUPERVISOR_WORKBENCH, CRV_SUPERVISOR_REFINEMENT
- âœ… CRV_SUPERVISOR_LIST_POLISH, CRV_SUPERVISOR_DETAIL_PARETO

**Audit** (3 missions):
- âœ… RUNTIME_E2E_CRV_BROWSER_AUDIT, GOOGLE_DRIVE_ARCHIVAGE, UX_AUDIT_SESSION7

**Gouvernance** (5 missions):
- âœ… CLAUDE_MD_REALIGNMENT, DOC_GOV_HARDENING, DOC_FINAL_LOCK
- âœ… GOVERNANCE_HARDENING_PRE_P2

**Merge & Validation** (3 missions):
- âœ… REVIEW_MERGE_AND_SOUMISSION_PREP, SAFE_MERGE_AND_SOUMISSION, P0_CLOSE_CRV_FINAL_BLOCKERS

**Architecture** (2 missions):
- âœ… CRV_PRODUCT_ARCHITECTURE, CRV_STABILIZATION_ALIGNMENT

---

**BASELINE LOCKED. Toute dÃ©viation = rÃ©gression potentielle Ã  documenter.**

### Comment utiliser ce fichier

1. **Avant chaque mission** : lire C2_IMPLEMENTATION.md (state actuel)
2. **AprÃ¨s chaque change** : comparer vs baseline
   - Tests encore 113 passing? âœ…
   - Auth routes 47? âœ…
   - Zones rouges toujours fixed? âœ…
   - Code mort toujours absent? âœ…
3. **Si delta** : documenter dans MISSION_INDEX.md + obtenir preuve adverse

---

**Validation = respect baseline + preuve adverse (code-review agent) + verify (E2E test).**


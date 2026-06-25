# ERROR_HANDLING.md - Zone Rouges + Recovery

**3 Zone Rouges:**

1. **Personnel Save Atomicity** (crv.controller.js:150)
   - Issue: Concurrent writes → VersionError
   - Fix: findByIdAndUpdate (atomic)
   - Recovery: Auto-retry with backoff

2. **GET /api/crv/:id Mapping** (crv.controller.js:220)
   - Issue: Wrong field returned (materielUtilise vs AffectationEnginVol)
   - Fix: Correct populate() chain
   - Recovery: Schema validation before response

3. **responsableVol UI Binding** (CRVPersonnel.vue)
   - Issue: No visual selector for isResponsable
   - Fix: Embedded isResponsable flag
   - Recovery: Auto UI/backend sync

**Validation Errors:**
- Missing mandatory fields
- Invalid dates
- SLA violations
- Null vs 0 distinction

**Integration Errors:**
- Google Drive: Retry 3x exponential backoff
- Network timeout: Queue for later
- PDF generation: Log + manual retry option

**Audit Trail:**
- All state changes logged (user, timestamp, IP)
- Accessible via /api/crv/:id/audit-log (ADMIN)

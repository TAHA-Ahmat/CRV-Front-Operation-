# API_CONTRACT.md - 45+ CRV Endpoints

**Main Endpoints:**
- POST /api/crv (create)
- GET /api/crv/:id (fetch)
- PATCH /api/crv/:id (update)
- POST /api/crv/:id/demarrer (start)
- POST /api/crv/:id/terminer (submit)
- POST /api/crv/:id/valider (validate)
- POST /api/crv/:id/verrouiller (lock)
- DELETE /api/crv/:id/annuler (cancel)

**Sub-Resources (20+ endpoints):**
- /personnel, /engins, /charges, /evenements, /observations
- Each: POST (create), DELETE (remove)

**Archiving:**
- POST /api/crv/:id/archiver (Google Drive upload)
- GET /api/crv/:id/export-pdf (download)

**Error Codes:**
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden (role)
- 409: Conflict (locked/transition)
- 500: Server error

**Auth Middleware:**
- protect (JWT)
- authorize (roles)
- excludeQualite (read-only)
- verifierCRVNonVerrouille (lock prevention)

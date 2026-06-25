# ARCHITECTURE.md - CRV Flight Manifest System

**Tech Stack:** Vue 3.4 + Node 18 + MongoDB + Render + Google Drive

**Frontend:** 7-step wizard (CRVNouveau → CRVValidation), Pinia stores, Dexie offline cache
- src/views/CRV/: CRVNouveau, CRVDepart, CRVArrivee, CRVTurnAround, CRVList
- src/stores/: crvStore, chargesStore, personnesStore, notificationsStore
- db/dexie.js: IndexedDB offline support

**Backend:** Express 45+ endpoints, Mongoose 11 collections, JWT auth
- models/: CRV, Phase, Vol, Personne, ValidationCRV, BulletinMouvement, Avion, Engin, ChargeOperationnelle, EvenementOperationnel, Observation
- routes/: CRV CRUD, state transitions, sub-resources (personnel, engins, charges, evenements)
- middlewares/: auth, roleMiddleware, auditRequest, verifierCRVNonVerrouille

**Deployment:** Render (Frankfurt), MongoDB Atlas, Google Drive API

**Key Features:**
- Completude calculation (0-100%)
- 6-state lifecycle (BROUILLON → EN_COURS → TERMINE → VALIDE → VERROUILLÉ → ANNULE)
- Zone rouges protection (3 critical points)
- Google Drive archiving (auto PDF)
- Real-time OPS tracking (WebSocket)
- Audit trail (all changes logged)

**Security:**
- JWT-based auth
- Role hierarchy: AGENT_ESCALE < CHEF_EQUIPE < SUPERVISEUR < MANAGER < QUALITE < ADMIN
- QUALITE read-only (excluded from mutations)
- ADMIN system-only (no CRV access)
- Zones rouges locked (immutable after VERROUILLÉ)

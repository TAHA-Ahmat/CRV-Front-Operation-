# WORKFLOWS.md - CRV 7-Step Wizard + State Machine

**7-Step Wizard:**
1. Mode (Planified vs Hors-Programme)
2. Flight selection
3. Personnel assignment
4. Equipment assignment
5. Horaire (ETD/ETA)
6. Phases initialization
7. Final validation & lock

**6-State Lifecycle:**
- BROUILLON: Draft, not started
- EN_COURS: Live, being filled
- TERMINE: Submitted, completude >= 50%
- VALIDE: Approved, completude >= 80%, manager OK
- VERROUILLÉ: Locked, immutable
- ANNULE: Cancelled (soft-delete)

**3 Phase Types:**
- Depart: Boarding, takeoff
- Arrivee: Landing, disembark
- TurnAround: Refuel, clean

**Role-Based Actions:**
- AGENT_ESCALE: Create, update, submit
- CHEF_EQUIPE: Oversee phases
- SUPERVISEUR: Escalate
- MANAGER: Validate, lock
- QUALITE: Audit (read-only)
- ADMIN: System only

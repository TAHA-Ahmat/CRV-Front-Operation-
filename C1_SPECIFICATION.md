---
name: crv-c1-specification
type: couche-1
version: 1.0
date: 2026-06-23
---

# C1 â€” SPECIFICATION CRV Operations

## Vue produit

**CRV** = Carnet de Route des Vols (Flight Manifest). SystÃ¨me complet de gestion de tournÃ©es aÃ©roportuaires pour THS AÃ©ro (Tchad).

### MÃ©tier
- **Acteurs** : Agent terrain (pilote/personnel), Superviseur (validation), DG (rapports)
- **Processus** : CrÃ©ation CRV â†’ Remplissage (7 Ã©tapes) â†’ Soumission â†’ Validation â†’ Verrouillage + PDF
- **DonnÃ©es** : Vol (aÃ©roports, horaires, Ã©quipage), Personnel (rÃ´les, affectations), Charges (engins/poids), Ã‰vÃ©nements (retards, incidents)

### Livrables clÃ©s
- âœ… Frontend responsif (desktop + mobile)
- âœ… Backend RESTful (sÃ©curitÃ© auth, journalisation)
- âœ… Google Drive archivage PDF (validation â†’ stockage)
- âœ… Superviseur workbench (lecture + dÃ©cision)
- â³ RUNBOOK utilisateur (terrain franÃ§ais)
- â³ Rotation credentials (post-livraison)

## PÃ©rimÃ¨tre technique

### Frontend (Vue.js)
```
src/views/CRV/
â”œâ”€â”€ CRVNouveau.vue       â† CrÃ©ation (step 1: vol)
â”œâ”€â”€ CRVDepart.vue        â† DÃ©part (step 2-3: personnel, charges)
â”œâ”€â”€ CRVTurnAround.vue    â† TurnAround (step 4-5: personnel, charges)
â”œâ”€â”€ CRVArrivee.vue       â† ArrivÃ©e (step 6: Ã©vÃ©nements)
â”œâ”€â”€ CRVValidation.vue    â† Soumission (step 7: validation + PDF)
â””â”€â”€ CRVSuperviseur.vue   â† Fiche superviseur (lecture, dÃ©cision)

src/components/crv/
â”œâ”€â”€ CRVHeader.vue        â† Infos vol (aÃ©roports, horaires)
â”œâ”€â”€ CRVPersonnel.vue     â† Affectation personnel (roles, responsable)
â”œâ”€â”€ CRVCharges.vue       â† Engins (selection, poids)
â”œâ”€â”€ CRVEvenements.vue    â† Incidents/retards
â””â”€â”€ CRVValidation.vue    â† Validation/soumission
```

### Backend (Node.js)
```
src/models/crv/
â”œâ”€â”€ CRV.js               â† Document principal (statut, dates, header)
â”œâ”€â”€ CRVEvent.js          â† Journal Ã©vÃ©nements (qui, quoi, quand)
â””â”€â”€ PersonnelAffecte.js  â† Embeded (rÃ´les, flags atomiques)

src/routes/crv/
â”œâ”€â”€ crv.routes.js        â† CRUD + auth excludeAdmin

src/services/crv/
â”œâ”€â”€ crv.service.js       â† Logique mÃ©tier
â”œâ”€â”€ crvEvent.service.js  â† Journalisation
â”œâ”€â”€ crvArchivageService.js â† PDF + Google Drive
```

### DonnÃ©es
```
CRV {
  _id, createdAt, updatedAt,
  statut: NOUVEAU|SOUMIS|VALIDÃ‰|VERROUILLÃ‰|REJETÃ‰,
  header: { aÃ©roportDÃ©part, aÃ©roportArrivÃ©e, dateVol, ... },
  personnelAffecte: [ { id, rÃ´le, isResponsable } ],
  charges: [ { engin, poids, ... } ],
  Ã©vÃ©nements: [ { type, date, details } ],
  historique: [ { statut, date, qui, motif } ],
  pdfPath: (Google Drive fileId)
}

CRVEvent {
  _id, crvId, timestamp,
  action: CRÃ‰Ã‰|PERSONNELAJOUTÃ‰|CHARGEAJOUTÃ‰E|SOUMIS|VALIDÃ‰|REJETÃ‰,
  acteur: userId,
  changements: { avant, aprÃ¨s }
}
```

## Ã‰tats et transitions

```
NOUVEAU
  â””â”€ [Remplissage 7 Ã©tapes]
     â””â”€ SOUMIS
        â”œâ”€ [Validation OK]
        â”‚  â””â”€ VALIDÃ‰ â†’ [Lockdown] â†’ VERROUILLÃ‰ + PDF
        â””â”€ [Validation KO]
           â””â”€ REJETÃ‰ (historique + motif)
              â””â”€ [Correction terrain]
                 â””â”€ Re-SOUMIS
```

## Profils utilisateurs

| RÃ´le | Permissions | Actions |
|------|------------|---------|
| Agent terrain | Lecture + Ã‰criture propre CRV | CrÃ©er, remplir, soumettre |
| Superviseur | Lecture tous CRV + Validation | Valider, rejeter, lire historique |
| Admin | Lecture audit, logs | AccÃ¨s crv.controller sans excludeAdmin |
| DG | Rapports + statistiques | Analytics via GET /api/crv/:id/events + stats |

## SÃ©curitÃ© & Audit

- **Auth** : JWT (10h session) â€” agents terrain connectÃ©s longtemps
- **Routes** : Tous les CRV endpoints nÃ©cessitent `excludeAdmin` middleware (P0_ROUTE_AUTH_001/002)
- **AtomicitÃ©** : Personnel save â†’ `findByIdAndUpdate` atomique (evite VersionError) (P0_VERSION_ERROR_001)
- **Journalisation** : Toute action â†’ CRVEvent (qui, quand, quoi)

## Zones rouges (critique)

| Zone | Fichier | Raison | Proof |
|------|---------|--------|-------|
| ðŸ”´ **Personnel save** | crv.controller.js:150 | VersionError concurrent writes | P0_VERSION_ERROR_001 atomique fix |
| ðŸ”´ **responsableVol UI** | CRVPersonnel.vue | Pas de sÃ©lecteur visuel (2 options) | STAB-2 embedded isResponsable flag |
| ðŸ”´ **GET /api/crv/:id** | crv.controller.js:220 | Retournait crv.materielUtilise âŒ au lieu d'AffectationEnginVol âœ… | FIX_ENGINS_GET_CRV zone rouge auditÃ©e |

## Backlog non-bloquant

- P2: RequÃªtes rÃ©seau x4 (double mount Vue) â€” Ã  investiguer
- P2: AÃ©roport destination non prÃ©-rempli â€” crÃ©ation seule
- P3: Notifications eventRegistry â†’ CRVEvent â€” brancher Ã  froid
- P3: Tests permissions (auth, verrouillage)

## Interfaces clÃ©s

```
GET  /api/crv              â† Liste (superviseur)
POST /api/crv              â† CrÃ©er (terrain)
GET  /api/crv/:id          â† Charger dÃ©tail (terrain/supervisor)
PATCH /api/crv/:id         â† Sauvegarder (terrain)
POST /api/crv/:id/submit   â† Soumettre (terrain)
POST /api/crv/:id/validate â† Valider (superviseur)
POST /api/crv/:id/reject   â† Rejeter (superviseur)
GET  /api/crv/:id/events   â† Audit trail (DG/superviseur)
GET  /api/crv/:id/stats    â† Statistiques CRV (DG)
POST /api/crv/:id/archive  â† Archiver PDF (interne)
```

## Standards appliquÃ©s

- **MOUSSA multi-cerveaux** : tout fix critical = 3+ agents indÃ©pendants avant merge
- **VÃ©rification adverse** : code-review agent cherche Ã  rÃ©futer avant livraison
- **VALIDATION_BASELINE** : comparaison Ã©tat initial (aucune rÃ©gression non-documentÃ©e)
- **Rapports obligatoires** : chaque mission = rapport + briefing + preuve d'exÃ©cution

---

**Specification locked. MISSION_INDEX.md est source de vÃ©ritÃ© pour dÃ©tails.**


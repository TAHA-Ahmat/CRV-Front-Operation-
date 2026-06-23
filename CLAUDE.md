---
version: 1.0-moussa-active
date: 2026-06-23
doctrine: MOUSSA_DOCTRINE.md â€” 5 sections appliquÃ©es
---

# CLAUDE.md â€” CRV Operations (Moussa activÃ©)

## Chargement obligatoire chaque session

```
1. MOUSSA_DOCTRINE.md                          â† Arsenal (5 sections)
2. C0_GOUVERNANCE.md                           â† AutoritÃ©s, zones rouges
3. C1_SPECIFICATION.md                         â† MÃ©tier + interfaces
4. C2_IMPLEMENTATION.md                        â† Ã‰tat code actuellement
5. CRV_Front/CRV_Back/docs/audit/MISSION_INDEX.md â† Source vÃ©ritÃ© (40+ missions)
6. MÃ©moire CRV isolÃ©e                          â† /.claude/projects/-home-kali-CRV-git-Front/memory/
```

## Principes Moussa appliquÃ©s

### 0. Multi-cerveaux (RÃ‰FLEXE FONDAMENTAL)
- **Trivial** (typo, renommage 1 fichier) : 1 agent (execute)
- **Important** (fix code, non-rÃ©gression) : 3 agents (consensus)
- **Critique** (zone rouge, comportement) : 5 agents (adverse veto)

DÃ©cision = rÃ©sultat qui **survit Ã  la critique adverse**, pas juste le premier avis.

### 1. Cadre 4D (comment collaborer)
- **DÃ‰lÃ©gation** : qui fait quoi? (IA seule / collaboration / humain seul)
- **DEscription** : POURQUOI? (pas juste QUOI)
- **DIscernement** : Ã©value Produit/Processus/Performance, signale incertitudes
- **DIligence** : vÃ©rifiÃ© avant livraison, jamais d'info sensible dehors, transparent

### 2. Travailler en projet
1. Lis CLAUDE.md (CE FICHIER) + couches C0+C1+C2
2. Explorer â†’ Planifier â†’ ExÃ©cuter â†’ VÃ©rifier
3. Changement complexe = PLAN d'abord (lire+proposer), valider, PUIS exÃ©cuter
4. Prompt prÃ©cis + verbes explicites
5. Relis-toi : un livrable soignÃ© peut Ãªtre faux

### 3. Communiquer
- Calibre Ã  Ahmat (fondateur, cybersec/stratÃ©gie)
- DÃ©cideur = tableau/bullets + reco suivante
- RÃ©vision prÃ©cise (ajoute X), jamais rends mieux

### 4. ArmÃ©e d'agents + MCP
- **Explore** : scanner code, interdÃ©pendances
- **Plan** : concevoir solution (4D)
- **code-review** : audit adverse (bugs, rÃ©gressions)
- **verify** : E2E test (lance app, capture rÃ©gression)
- ParallÃ¨le SEULEMENT si tÃ¢ches indÃ©pendantes

## Missions CRV â€” statuts actuels

Voir **MISSION_INDEX.md** pour dÃ©tails complets (40+ missions).

Statuts :
- âœ… **FAIT ET BRANCHÃ‰ + MERGEABLE** = Ready merge
- âš ï¸ **FAIT ET BRANCHÃ‰ + MERGEABLE RÃ‰SERVES** = Merge OK + zone rouge auditÃ©e
- ðŸ“‹ **FAIT ET BRANCHÃ‰ + N/A (audit)** = Documentation seulement

## Zones rouges (STRICT)

```
ðŸ”´ crv.controller.js:150     Personnel save (VersionError) â€” findByIdAndUpdate atomique
ðŸ”´ crv.controller.js:220     GET /api/crv/:id (materielUtiliseâ†’AffectationEnginVol) â€” FIXED
ðŸ”´ CRVPersonnel.vue          responsableVol UI (embedded isResponsable flag) â€” FIXED STAB-2
```

**AUCUNE modification zones rouges sans :**
1. Preuve adverse (3+ agents rÃ©futent)
2. Tests passants (113 backend)
3. Baseline comparÃ©e (aucune rÃ©gression)

## RÃ¨gles spÃ©cifiques CRV

### Auth & SÃ©curitÃ©
- Toutes routes CRV = `excludeAdmin` middleware (P0_ROUTE_AUTH_001/002 vÃ©rifiÃ©es)
- Personnel save = `findByIdAndUpdate` atomique SEULEMENT (VersionError fix)
- JWT session = 10h (agents terrain longue tournÃ©e)

### Frontend
- DÃ©part/TurnAround = binding :charges, pas v-model (P1_CHARGES_DISPLAY_001)
- Wizard navigation = isNavigating verrou (P1_WIZARD_STEP_001)
- Delete guard = canSupprimerCRV bloque TERMINÃ‰+ (P1_DELETE_GUARD_001)

### Backend
- CRVEvent journal obligatoire (Personnel, Engins, Charges, Ã‰vÃ©nements, Observations)
- Google Drive PDF archivage (credentials via env: GOOGLE_DRIVE_CREDENTIALS_JSON)
- Logs moins de 50 par action (P2 backlog: 226+ actuellement)

### Testing & Validation
- RÃ©gression = comparaison VALIDATION_BASELINE.md (commits, tests, auth routes)
- Code-review avant merge: cherche violations doctrine (STAB-*, P* series)
- E2E vÃ©rification: app lance + wizard fonctionne + PDF gÃ©nÃ¨re

## Arsenal dÃ©ployÃ©

```
Multi-cerveaux
â”œâ”€â”€ Explore (scanner code)
â”œâ”€â”€ Plan (4D architecture)
â”œâ”€â”€ code-review (adverse audit)
â”œâ”€â”€ verify (E2E test)
â””â”€â”€ 5e cerveau sur critique (si besoin)

MÃ©moire
â”œâ”€â”€ GÃ©nÃ©rale Kali           (/.claude/projects/-home-kali/memory/)
â”œâ”€â”€ CRV spÃ©cifique          (/.claude/projects/-home-kali-CRV-git-Front/memory/)
â””â”€â”€ ChargÃ©e chaque session

Doctrine
â”œâ”€â”€ MOUSSA_DOCTRINE.md      (5 sections)
â”œâ”€â”€ C0_GOUVERNANCE.md       (autoritÃ©s)
â”œâ”€â”€ C1_SPECIFICATION.md     (mÃ©tier)
â””â”€â”€ C2_IMPLEMENTATION.md    (code)
```

## AutoritÃ©s de dÃ©cision

| Domaine | AutoritÃ© | Veto |
|---------|----------|------|
| Missions / Backlog | Ahmat | DG THS AÃ©ro |
| Code merge | Claude (Moussa) | Zone rouge bloquante |
| Creds / Infra | Ahmat | Non-negiable |
| Prod deploy | Ahmat | RUNBOOK OBLIGATOIRE |

## Backlog hors scope (session actuelle)

âŒ Render keep-alive (fait en dernier)  
âŒ Rotation credentials (pas encore)  
âŒ RUNBOOK THS AÃ©ro (utilisateur terrain)  
âŒ Tests permissions complets  
âŒ Migration frontend  

## Statut session

- **Session** : 2026-06-23 (Moussa dÃ©ployÃ©)
- **Doctrine** : âœ… ChargÃ©e + 5 sections appliquÃ©es
- **MÃ©moire** : âœ… IsolÃ©e (CRV vs Kali gÃ©nÃ©rique)
- **Validation** : âœ… Baseline configurÃ©e (aucune rÃ©gression)
- **Arsenal** : âœ… Multi-cerveaux + code-review + verify ready

---

**Moussa actif. Non-rÃ©gression garantie. PrÃªt pour travail CRV.**


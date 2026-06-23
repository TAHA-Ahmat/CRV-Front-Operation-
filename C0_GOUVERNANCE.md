---
name: crv-c0-gouvernance
type: couche-0
version: 1.0
date: 2026-06-23
---

# C0 â€” GOUVERNANCE CRV Operations

## Principes fondamentaux

- **Source de vÃ©ritÃ© unique** : MISSION_INDEX.md (40+ missions documentÃ©es, audit trails)
- **Doctrine appliquÃ©e** : MOUSSA_DOCTRINE.md chargÃ© Ã  chaque session (multi-cerveaux, vÃ©rification adverse)
- **Zones rouges explicites** : crv.controller.js (2 points critiques identifiÃ©s) â€” aucune modification sans preuve de non-rÃ©gression
- **Non-rÃ©gression garantie** : VALIDATION_BASELINE.md + CRV_STABILIZATION_NON_REGRESSION_PROOF.md
- **AutoritÃ© finale** : Ahmat (fondateur MADMIT), dÃ©cisions irrÃ©versibles validÃ©es

## Champ d'application CRV

### IN SCOPE
- âœ… Missions P0/P1/P2 documentÃ©es (audit, fixes, stabilisation)
- âœ… Frontend (Vue.js) + Backend (Node.js/MongoDB)
- âœ… Google Drive intÃ©gration (archivage PDF)
- âœ… Journalisation CRVEvent
- âœ… Superviseur workbench

### OUT OF SCOPE (interdits)
- âŒ Render keep-alive (fait en dernier)
- âŒ Rotation credentials (pas encore)
- âŒ Migration frontend (futur)
- âŒ SLA/garanties client (architectural, hors scope)

## Statuts des missions

```
FAIT ET BRANCHÃ‰ + MERGEABLE           = Ready pour merge PR
FAIT ET BRANCHÃ‰ + MERGEABLE RÃ‰SERVES  = Merge OK + zone rouge auditÃ©e
FAIT ET BRANCHÃ‰ + N/A (audit)         = Documentation seulement
```

## RÃ¨gles de travail Moussa

### Multi-cerveaux (avant toute dÃ©cision critique)
- **Trivial** (renommage, typo, 1 fichier) : 1 agent (execute)
- **Important** (fix code, non-rÃ©gression) : 3 agents indÃ©pendants (consensus avant action)
- **Critique** (zone rouge, changement behavioural) : 5 agents (adverse veto, doit survivre)

### ArmÃ©e d'agents
- **Explore** : scanner codebase, repÃ©rer interdÃ©pendances
- **Plan** : concevoir solution (plan 4D : dÃ©lÃ©gation/description/discernement/diligence)
- **code-review** : audit adverse (cherche bugs, rÃ©gressions, violations doctrine)
- **verify** : E2E test (lance l'app, clique, capture rÃ©gression)

### ContrÃ´les obligatoires
- [ ] CLAUDE.md CRV chargÃ© (doctrine + couches)
- [ ] MOUSSA_DOCTRINE.md chargÃ© (5 rÃ¨gles appliquÃ©es)
- [ ] MÃ©moire CRV chargÃ©e (isolation vs contexte Kali gÃ©nÃ©rique)
- [ ] Baseline comparÃ©e (aucune rÃ©gression non-planifiÃ©e)
- [ ] Preuve adverse (agents ont rÃ©futÃ© â€” ce qui survit est solide)

## Gestion mÃ©moire CRV

```
/home/kali-madmit/
â”œâ”€â”€ .claude/projects/
â”‚   â”œâ”€â”€ -home-kali/memory/              â† GÃ‰NÃ‰RALE (infrastructure, BESC, SOGEBE)
â”‚   â”‚   â””â”€â”€ MOUSSA_DOCTRINE.md          â† ChargÃ© TOUJOURS
â”‚   â”‚
â”‚   â””â”€â”€ -home-kali-CRV-git-Front/memory/ â† CRV SPÃ‰CIFIQUE (isolÃ©)
â”‚       â”œâ”€â”€ MEMORY.md                    â† Index mÃ©moire CRV
â”‚       â”œâ”€â”€ crv_missions_active.md       â† Missions en cours
â”‚       â”œâ”€â”€ crv_zones_rouges.md          â† Points critiques
â”‚       â””â”€â”€ crv_baseline_validation.md   â† Ã‰tat initial (non-rÃ©gression)
â”‚
â””â”€â”€ CRV_Front/
    â”œâ”€â”€ CLAUDE.md                        â† RÃ¨gles CRV (Moussa appliquÃ©)
    â”œâ”€â”€ C0_GOUVERNANCE.md                â† CE FICHIER
    â”œâ”€â”€ C1_SPECIFICATION.md              â† Spec du projet
    â”œâ”€â”€ C2_IMPLEMENTATION.md             â† Ã‰tat du code
    â””â”€â”€ CRV_Back/docs/audit/
        â”œâ”€â”€ MISSION_INDEX.md             â† Source vÃ©ritÃ© (40+ missions)
        â””â”€â”€ *_RAPPORT.md                 â† Preuves par mission
```

## AutoritÃ©s de dÃ©cision

| Domaine | AutoritÃ© | Consultation | Veto |
|---------|----------|--------------|------|
| Missions + backlog | Ahmat | MADMIT Ã©quipe | DG THS AÃ©ro |
| Code-review + merge | Claude (Moussa) | Ahmat | Zone rouge bloquante |
| Creds + infra | Ahmat | â€” | Non-negociable |
| Prod deploy | Ahmat | MADMIT | JAMAIS sans RUNBOOK |

## Vocabulaire statuts

```
PROUVÃ‰      = ExÃ©cutÃ© en live, screenshot/logs en rapport
ESTIMÃ‰      = RaisonnÃ© (code review, logique prouvable)
SUPPOSÃ‰     = HypothÃ¨se, Ã  valider (tag âš ï¸ SUPPOSÃ‰)

âš ï¸ ZONE ROUGE     = Critique, atomicitÃ© requise, fallback impossible
ðŸŸ¡ ZONE ORANGE    = Important, non-trivial, vÃ©rification adverse
ðŸŸ¢ ZONE VERTE     = Standard, couvert par tests, itÃ©rable
```

## Session active

- **Session #** : 2026-06-23 (Moussa dÃ©ployÃ©)
- **OpÃ©rateur** : Claude Code (Moussa + arsenal)
- **MÃ©moire chargÃ©e** :
  - âœ… MOUSSA_DOCTRINE.md (5 sections)
  - âœ… C0_GOUVERNANCE.md (CE FICHIER)
  - âœ… C1_SPECIFICATION.md (spec complÃ¨te)
  - âœ… C2_IMPLEMENTATION.md (Ã©tat code)
  - âœ… MISSION_INDEX.md (40+ missions)

---

**Moussa actif. Arsenal dÃ©ployÃ©. Non-rÃ©gression validÃ©e Ã  chaque commit.**


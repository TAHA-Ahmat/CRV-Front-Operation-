# Carte de Référence - Données de Test CRV

## Comptes de Connexion Rapide

| Profil | Email | Mot de passe |
|--------|-------|--------------|
| **ADMIN** | `admin@airport.sn` | `Test2024!` |
| **AGENT** | `amadou.diallo@airport.sn` | `Test2024!` |
| **AGENT 2** | `mariama.faye@airport.sn` | `Test2024!` |
| **SUPERVISEUR** | `fatou.ndiaye@airport.sn` | `Test2024!` |
| **MANAGER** | `moussa.diop@airport.sn` | `Test2024!` |
| **QUALITÉ** | `aissatou.sow@airport.sn` | `Test2024!` |

---

## Vols Disponibles pour Tests

### Vols ARRIVÉE

| N° Vol | Compagnie | Origine | Heure | Avion | Passagers |
|--------|-----------|---------|-------|-------|-----------|
| **AF123** | Air France | Paris CDG | 14:30 | B738 | 168 |
| **EK752** | Emirates | Dubaï | 09:15 | B77W | 320 |
| **TK561** | Turkish | Istanbul | 10:30 | B789 | 275 |
| **AT500** | Royal Air Maroc | Casablanca | 13:30 | B738 | 145 |

### Vols DÉPART

| N° Vol | Compagnie | Destination | Heure | Avion | Passagers |
|--------|-----------|-------------|-------|-------|-----------|
| **SN205** | Brussels Airlines | Bruxelles | 23:45 | A333 | 265 |
| **AF124** | Air France | Paris CDG | 16:00 | B738 | 172 |
| **HC400** | Air Sénégal | Abidjan | 07:00 | A321 | 156 |

### Vols TURN AROUND

| N° Vol | Compagnie | Origine → Escale → Dest | Arrivée | Départ |
|--------|-----------|-------------------------|---------|--------|
| **ET908** | Ethiopian | ADD → DSS → JFK | 08:30 | 11:00 |
| **DL127** | Delta | ATL → DSS → JNB | 12:00 | 14:30 |
| **KQ500** | Kenya Airways | NBO → DSS → ACC | 11:30 | 13:00 |

---

## CRV Pré-créés

| N° CRV | Vol | Statut | Complétude | Agent |
|--------|-----|--------|------------|-------|
| CRV-2024-0001 | AF123 | EN_COURS | 40% | Diallo |
| CRV-2024-0002 | AF121 | EN_ATTENTE_VALIDATION | 92% | Diallo |
| CRV-2024-0003 | SN205 | VALIDE | 95% | Faye |
| CRV-2024-0004 | EK752 | REJETE | 78% | Sarr |
| CRV-2024-0005 | ET908 | EN_ATTENTE_VALIDATION | 95% | Sarr |
| CRV-2024-0006 | TK561 | DEVERROUILLE | 90% | Diallo |
| CRV-2024-0007 | HC400 | BROUILLON | 0% | Ba |

---

## Données de Charges à Saisir

### Passagers - Arrivée AF123
```
Type: PASSAGERS
Sens: DEBARQUEMENT
Adultes: 145
Enfants: 18
Bébés: 5
Total: 168
```

### Bagages - Arrivée AF123
```
Type: BAGAGES
Sens: DEBARQUEMENT
Bagages soute: 185
Poids soute: 2775 kg
Bagages cabine: 10
Total: 195
```

### Passagers - Départ SN205
```
Type: PASSAGERS
Sens: EMBARQUEMENT
Adultes: 230
Enfants: 28
Bébés: 7
Total: 265
```

### Bagages - Départ SN205
```
Type: BAGAGES
Sens: EMBARQUEMENT
Bagages soute: 295
Poids soute: 4720 kg
Bagages cabine: 25
Total: 320
```

### Fret - Départ SN205
```
Type: FRET
Sens: EMBARQUEMENT
Colis: 45
Poids: 1200 kg
```

---

## Progression Complétude

### CRV ARRIVÉE (5 phases)
```
0%  → Création
10% → Phase 1 (Positionnement)
15% → Phase 2 (Calage)
25% → Phase 3 (Débarquement)
40% → Phase 4 (Déchargement bagages)
55% → Passagers saisis
70% → Bagages saisis
80% → Fret terminé/N/A ← SEUIL VALIDATION
90% → Observation ajoutée
```

### CRV DÉPART (6 phases)
```
0%  → Création
10% → Phase 1 (Préparation)
25% → Phase 2 (Embarquement)
35% → Phase 3 (Chargement bagages)
45% → Phase 4 (Chargement fret)
60% → Passagers saisis
72% → Bagages saisis
82% → Fret saisi ← SEUIL VALIDATION
88% → Phases finales
95% → Observation ajoutée
```

### CRV TURN AROUND (12 phases)
```
0%  → Création
18% → Phases ARRIVÉE (4)
32% → Charges ARRIVÉE
50% → Phases ESCALE (4)
65% → Phases DÉPART (4)
85% → Charges DÉPART ← SEUIL VALIDATION
95% → Observation ajoutée
```

---

## Utilisateurs Complets

### Agents d'Escale
| Matricule | Nom | Prénom | Équipe | Actif |
|-----------|-----|--------|--------|-------|
| AGT-2024-001 | Diallo | Amadou | Équipe A - Matin | ✓ |
| AGT-2024-002 | Faye | Mariama | Équipe B - Nuit | ✓ |
| AGT-2024-003 | Sarr | Ousmane | Équipe A - Matin | ✓ |
| AGT-2024-004 | Ba | Ibrahima | Équipe C - Après-midi | ✓ (doit changer MDP) |
| AGT-2024-005 | Gueye | Awa | Équipe B - Nuit | ✗ (congé) |

### Chefs d'Équipe
| Matricule | Nom | Prénom | Équipe |
|-----------|-----|--------|--------|
| CHF-2024-001 | Niang | Abdoulaye | Équipe A - Matin |
| CHF-2024-002 | Thiam | Coumba | Équipe B - Nuit |

### Superviseurs
| Matricule | Nom | Prénom | Responsabilité |
|-----------|-----|--------|----------------|
| SUP-2024-001 | Ndiaye | Fatou | Tous terminaux |
| SUP-2024-002 | Fall | Moustapha | Terminal 1 |

### Manager
| Matricule | Nom | Prénom | Responsabilité |
|-----------|-----|--------|----------------|
| MGR-2024-001 | Diop | Moussa | Direction Ops Sol |

### Qualité
| Matricule | Nom | Prénom | Responsabilité |
|-----------|-----|--------|----------------|
| QUA-2024-001 | Sow | Aissatou | Audit & Conformité |
| QUA-2024-002 | Mbaye | Cheikh | Analyse & Reporting |

---

## Compagnies Fréquentes

| Code | Nom | Pays | Alliance |
|------|-----|------|----------|
| AF | Air France | France | SkyTeam |
| SN | Brussels Airlines | Belgique | Star Alliance |
| ET | Ethiopian Airlines | Éthiopie | Star Alliance |
| EK | Emirates | EAU | - |
| TK | Turkish Airlines | Turquie | Star Alliance |
| AT | Royal Air Maroc | Maroc | Oneworld |
| HC | Air Sénégal | Sénégal | - |

---

## Aéroports Principaux

| Code | Ville | Pays | UTC |
|------|-------|------|-----|
| **DSS** | Dakar | Sénégal | +0 |
| CDG | Paris | France | +1 |
| BRU | Bruxelles | Belgique | +1 |
| ADD | Addis Abeba | Éthiopie | +3 |
| DXB | Dubaï | EAU | +4 |
| IST | Istanbul | Turquie | +3 |
| JFK | New York | USA | -5 |

---

## Fichiers de Données

```
src/data/
├── seed/
│   ├── index.js          # Point d'entrée
│   ├── utilisateurs.js   # 13 utilisateurs
│   ├── vols.js           # 12 vols
│   ├── crv.js            # 7 CRV pré-créés
│   ├── compagnies.js     # 15 compagnies
│   ├── aeroports.js      # 22 aéroports
│   └── avions.js         # 13 avions
└── mockApi.js            # API mock complète
```

---

## Utilisation en Code

```javascript
// Importer les données
import { seedData } from '@/data/seed'
import { mockAPI } from '@/data/mockApi'

// Comptes de test rapide
import { comptesTest } from '@/data/seed/utilisateurs'
console.log(comptesTest.admin.email) // admin@airport.sn

// Utiliser le mock API
await mockAPI.auth.login('amadou.diallo@airport.sn', 'Test2024!')
const vols = await mockAPI.vols.getAll()
const crv = await mockAPI.crv.create({ volId: 'vol-af123' })
```

---

*Généré le: 2024*
*Version: 1.0*

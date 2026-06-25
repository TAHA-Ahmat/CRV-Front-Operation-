# DATA_MODEL.md - CRV Collections

**11 Core Collections:**

1. **CRV** (main): numeroCRV, statut, completude, personnelAffecte[], materielUtilise[], charges[], archivage{}, historiqueRejets[]
2. **Phase** (master): code, libelle, typeOperation, dureeStandardMinutes, slaMode
3. **Vol** (flights): numeroVol, compagnieAerienne, dateVol, horsProgramme
4. **Personne** (users): fonction, specialites[], statut, statutCompte
5. **ValidationCRV**: crv_ref, validePar_ref, scoreCompletude
6. **BulletinMouvement**: movement tracking
7. **Avion**: aircraft registry
8. **Engin**: equipment/materials
9. **ChargeOperationnelle**: cargo/passengers manifests
10. **EvenementOperationnel**: flight events
11. **Observation**: notes/comments

**Indexes:**
- CRV: vol+escale+date (unique)
- Personne: email (unique, login)
- Vol: numeroVol (search)

**Constraints:**
- Null ≠ 0 (not-entered vs explicit-zero)
- Completude 0-100%
- Statuts enum: BROUILLON|EN_COURS|TERMINE|VALIDE|VERROUILLÉ|ANNULE
- Verrouillé → immutable

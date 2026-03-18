# Briefing GPT — FIX_ENGINS_GET_CRV

## Résumé exécutif
Les engins ajoutés au CRV disparaissaient au reload. Cause : le GET CRV lisait un subdocument embarqué jamais alimenté au lieu de requêter les AffectationEnginVol du Vol. Corrigé backend + frontend.

## Ce qui a été fait
1. **Backend** (zone rouge crv.controller.js) : GET /crv/:id requête maintenant AffectationEnginVol.find({ vol }) au lieu de crv.materielUtilise
2. **Store** : loadCRV charge maintenant les engins dans this.engins
3. **Vues** (3 fichiers) : mapping AffectationEnginVol → format CRVEngins (type lowercase, immatriculation, heures HH:mm)

## Preuve
Engin AVT-006 (TRACTAGE) ajouté au Départ KP039 → reload → affiché correctement dans l'étape 3 avec type, immatriculation, usage, heure de début.

## Questions pour GPT
1. La zone rouge crv.controller.js a été touchée avec un fix très ciblé (import + 4 lignes). Le changement est-il acceptable ?
2. Le modèle CRV a toujours un champ `materielUtilise` embarqué qui n'est plus utilisé. Faut-il le nettoyer ou le garder comme backup ?
3. Avec ce fix, toutes les 9 étapes du flux CRV sont maintenant couvertes. Prochaine priorité ?

## Statut
FAIT ET BRANCHÉ — MERGEABLE AVEC RÉSERVES (zone rouge touchée)

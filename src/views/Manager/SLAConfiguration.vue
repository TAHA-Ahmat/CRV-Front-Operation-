<template>
  <div class="sla-config-container">
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="$router.push('/dashboard-manager')" class="btn-back">
            ← Retour
          </button>
          <h1>Configuration SLA par compagnie</h1>
        </div>
        <div class="header-actions" v-if="isManager">
          <button class="btn btn-primary" @click="openCreateForm">
            + Ajouter une compagnie
          </button>
        </div>
      </div>
    </header>

    <main class="page-main">
      <!-- Valeurs par défaut -->
      <section class="sla-defaults-section">
        <h3>SLA Standard (appliqué si aucune config compagnie)</h3>
        <div class="defaults-grid">
          <div class="default-card">
            <div class="default-value">{{ defaults.BROUILLON_TO_EN_COURS }}h</div>
            <div class="default-label">Brouillon → En cours</div>
          </div>
          <div class="default-card">
            <div class="default-value">{{ defaults.EN_COURS_TO_TERMINE }}h</div>
            <div class="default-label">En cours → Terminé</div>
          </div>
          <div class="default-card">
            <div class="default-value">{{ defaults.TERMINE_TO_VALIDE }}h</div>
            <div class="default-label">Terminé → Validé</div>
          </div>
          <div class="default-card">
            <div class="default-value">{{ defaults.GLOBAL }}h</div>
            <div class="default-label">Global CRV</div>
          </div>
        </div>
      </section>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">Chargement...</div>

      <!-- Tableau compagnies -->
      <section v-else class="sla-compagnies-section">
        <h3>Compagnies avec SLA spécifique ({{ compagnies.length }})</h3>

        <div v-if="compagnies.length === 0" class="empty-state">
          Aucune compagnie configurée. Les SLA standard s'appliquent à tous les CRV.
        </div>

        <table v-else class="sla-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Compagnie</th>
              <th>CRV</th>
              <th>Enregistrement</th>
              <th>Bagages</th>
              <th>Embarquement</th>
              <th>Rampe</th>
              <th>Actif</th>
              <th v-if="isManager">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in compagnies" :key="c._id" :class="{ inactive: !c.actif }">
              <td class="code-cell">{{ c.codeIATA }}</td>
              <td>{{ c.compagnieNom }}</td>
              <td>
                <span :class="hasDomainConfig(c, 'crv') ? 'badge-configured' : 'badge-default'">
                  {{ hasDomainConfig(c, 'crv') ? countConfigured(c, 'crv') + ' règle(s)' : 'standard' }}
                </span>
              </td>
              <td>
                <span :class="hasDomainConfig(c, 'checkin') ? 'badge-configured' : 'badge-default'">
                  {{ hasDomainConfig(c, 'checkin') ? countConfigured(c, 'checkin') + ' règle(s)' : '—' }}
                </span>
              </td>
              <td>
                <span :class="hasDomainConfig(c, 'bagages') ? 'badge-configured' : 'badge-default'">
                  {{ hasDomainConfig(c, 'bagages') ? countConfigured(c, 'bagages') + ' règle(s)' : '—' }}
                </span>
              </td>
              <td>
                <span :class="hasDomainConfig(c, 'boarding') ? 'badge-configured' : 'badge-default'">
                  {{ hasDomainConfig(c, 'boarding') ? countConfigured(c, 'boarding') + ' règle(s)' : '—' }}
                </span>
              </td>
              <td>
                <span :class="hasDomainConfig(c, 'ramp') ? 'badge-configured' : 'badge-default'">
                  {{ hasDomainConfig(c, 'ramp') ? countConfigured(c, 'ramp') + ' règle(s)' : '—' }}
                </span>
              </td>
              <td>
                <span :class="c.actif ? 'badge-actif' : 'badge-inactif'">
                  {{ c.actif ? 'Oui' : 'Non' }}
                </span>
              </td>
              <td v-if="isManager" class="actions-cell">
                <button class="btn-sm btn-edit" @click="editCompagnie(c)">Modifier</button>
                <button class="btn-sm btn-delete" @click="confirmDelete(c)">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Modal Formulaire Niveau 2 -->
      <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
        <div class="modal-content modal-lg">
          <h3>{{ editMode ? 'Modifier' : 'Ajouter' }} une config SLA</h3>

          <!-- Identité compagnie -->
          <div class="form-row">
            <div class="form-group">
              <label>Code IATA *</label>
              <input
                v-model="form.codeIATA"
                type="text"
                maxlength="3"
                placeholder="AF"
                :disabled="editMode"
                class="form-input"
              />
            </div>
            <div class="form-group flex-2">
              <label>Nom compagnie *</label>
              <input v-model="form.compagnieNom" type="text" placeholder="Air France" class="form-input" />
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" v-model="form.actif" /> Actif
              </label>
            </div>
          </div>

          <!-- Onglets domaines -->
          <div class="domain-tabs">
            <button
              v-for="tab in domainTabs"
              :key="tab.key"
              :class="['tab-btn', { active: activeTab === tab.key }]"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
              <span v-if="hasDomainValues(tab.key)" class="tab-dot"></span>
            </button>
          </div>

          <!-- Contenu onglet CRV -->
          <div v-show="activeTab === 'crv'" class="tab-content">
            <div class="tab-hint">Transitions statut CRV — en heures. Vide = hérite du standard.</div>
            <div class="form-grid">
              <div class="form-group" v-for="field in crvFields" :key="field.key">
                <label>{{ field.label }}</label>
                <input v-model.number="form.crv[field.key]" type="number" min="1" step="1"
                  :placeholder="defaults[field.defaultKey] + 'h (standard)'" class="form-input" />
                <span class="field-hint">{{ form.crv[field.key] ? form.crv[field.key] + 'h' : 'hérite' }}</span>
              </div>
            </div>
          </div>

          <!-- Contenu onglet Enregistrement -->
          <div v-show="activeTab === 'checkin'" class="tab-content">
            <div class="tab-hint">Comptoirs enregistrement — en minutes avant STD. Vide = hérite.</div>
            <div class="form-grid">
              <div class="form-group">
                <label>Ouverture comptoir</label>
                <input v-model.number="form.checkin.ouverture" type="number" min="1" step="1" placeholder="ex: 120" class="form-input" />
                <span class="field-hint">{{ form.checkin.ouverture ? form.checkin.ouverture + ' min avant STD' : 'hérite' }}</span>
              </div>
              <div class="form-group">
                <label>Fermeture comptoir</label>
                <input v-model.number="form.checkin.fermeture" type="number" min="1" step="1" placeholder="ex: 45" class="form-input" />
                <span class="field-hint">{{ form.checkin.fermeture ? form.checkin.fermeture + ' min avant STD' : 'hérite' }}</span>
              </div>
            </div>
          </div>

          <!-- Contenu onglet Bagages -->
          <div v-show="activeTab === 'bagages'" class="tab-content">
            <div class="tab-hint">Livraison bagages — en minutes après calage. Vide = hérite.</div>
            <div class="form-grid">
              <div class="form-group">
                <label>Premier bagage</label>
                <input v-model.number="form.bagages.premierBagage" type="number" min="1" step="1" placeholder="ex: 25" class="form-input" />
                <span class="field-hint">{{ form.bagages.premierBagage ? form.bagages.premierBagage + ' min après calage' : 'hérite' }}</span>
              </div>
              <div class="form-group">
                <label>Dernier bagage</label>
                <input v-model.number="form.bagages.dernierBagage" type="number" min="1" step="1" placeholder="ex: 40" class="form-input" />
                <span class="field-hint">{{ form.bagages.dernierBagage ? form.bagages.dernierBagage + ' min après calage' : 'hérite' }}</span>
              </div>
              <div class="form-group">
                <label>Bagage prioritaire</label>
                <input v-model.number="form.bagages.bagagePrioritaire" type="number" min="1" step="1" placeholder="ex: 15" class="form-input" />
                <span class="field-hint">{{ form.bagages.bagagePrioritaire ? form.bagages.bagagePrioritaire + ' min après calage' : 'hérite' }}</span>
              </div>
            </div>
          </div>

          <!-- Contenu onglet Embarquement -->
          <div v-show="activeTab === 'boarding'" class="tab-content">
            <div class="tab-hint">Opérations embarquement — en minutes avant ETD. Vide = hérite.</div>
            <div class="form-grid">
              <div class="form-group">
                <label>Début embarquement</label>
                <input v-model.number="form.boarding.debut" type="number" min="1" step="1" placeholder="ex: 40" class="form-input" />
                <span class="field-hint">{{ form.boarding.debut ? form.boarding.debut + ' min avant ETD' : 'hérite' }}</span>
              </div>
              <div class="form-group">
                <label>Fermeture porte</label>
                <input v-model.number="form.boarding.fermetureGate" type="number" min="1" step="1" placeholder="ex: 10" class="form-input" />
                <span class="field-hint">{{ form.boarding.fermetureGate ? form.boarding.fermetureGate + ' min avant ETD' : 'hérite' }}</span>
              </div>
              <div class="form-group">
                <label>Présence agent porte</label>
                <input v-model.number="form.boarding.presenceAgent" type="number" min="1" step="1" placeholder="ex: 60" class="form-input" />
                <span class="field-hint">{{ form.boarding.presenceAgent ? form.boarding.presenceAgent + ' min avant ETD' : 'hérite' }}</span>
              </div>
            </div>
          </div>

          <!-- Contenu onglet Rampe -->
          <div v-show="activeTab === 'ramp'" class="tab-content">
            <div class="tab-hint">Opérations rampe — en minutes calé-à-calé ou après calage. Vide = hérite.</div>
            <div class="form-grid">
              <div class="form-group">
                <label>Turnaround</label>
                <input v-model.number="form.ramp.turnaround" type="number" min="1" step="1" placeholder="ex: 45" class="form-input" />
                <span class="field-hint">{{ form.ramp.turnaround ? form.ramp.turnaround + ' min calé-à-calé' : 'hérite' }}</span>
              </div>
              <div class="form-group">
                <label>Turnaround narrow-body</label>
                <input v-model.number="form.ramp.turnaroundNarrow" type="number" min="1" step="1" placeholder="ex: 45" class="form-input" />
                <span class="field-hint">{{ form.ramp.turnaroundNarrow ? form.ramp.turnaroundNarrow + ' min (A320, B737...)' : 'hérite' }}</span>
              </div>
              <div class="form-group">
                <label>Turnaround wide-body</label>
                <input v-model.number="form.ramp.turnaroundWide" type="number" min="1" step="1" placeholder="ex: 75" class="form-input" />
                <span class="field-hint">{{ form.ramp.turnaroundWide ? form.ramp.turnaroundWide + ' min (A330, B777...)' : 'hérite' }}</span>
              </div>
              <div class="form-group">
                <label>GPU branché</label>
                <input v-model.number="form.ramp.gpu" type="number" min="1" step="1" placeholder="ex: 5" class="form-input" />
                <span class="field-hint">{{ form.ramp.gpu ? form.ramp.gpu + ' min après calage' : 'hérite' }}</span>
              </div>
            </div>
          </div>

          <!-- Contenu onglet Messages -->
          <div v-show="activeTab === 'messages'" class="tab-content">
            <div class="tab-hint">Messages opérationnels — en minutes. Vide = hérite. Faible priorité monitoring.</div>
            <div class="form-grid">
              <div class="form-group">
                <label>Envoi MVT</label>
                <input v-model.number="form.messages.mvt" type="number" min="1" step="1" placeholder="ex: 15" class="form-input" />
                <span class="field-hint">{{ form.messages.mvt ? form.messages.mvt + ' min après événement' : 'hérite' }}</span>
              </div>
              <div class="form-group">
                <label>Envoi LDM</label>
                <input v-model.number="form.messages.ldm" type="number" min="1" step="1" placeholder="ex: 60" class="form-input" />
                <span class="field-hint">{{ form.messages.ldm ? form.messages.ldm + ' min avant STD' : 'hérite' }}</span>
              </div>
              <div class="form-group">
                <label>Transmission APIS</label>
                <input v-model.number="form.messages.apis" type="number" min="1" step="1" placeholder="ex: 30" class="form-input" />
                <span class="field-hint">{{ form.messages.apis ? form.messages.apis + ' min avant STD' : 'hérite' }}</span>
              </div>
            </div>
          </div>

          <!-- Contenu onglet Phases (durées par phase) -->
          <div v-show="activeTab === 'phaseDurees'" class="tab-content">
            <div class="tab-hint">Durées maximales par phase — en minutes. Vide = hérite du standard. Seules les phases pertinentes sont listées.</div>
            <div class="form-grid">
              <div class="form-group" v-for="ph in phaseConfigurables" :key="ph.code">
                <label>{{ ph.label }}</label>
                <input v-model.number="form.phaseDurees[ph.code]" type="number" min="1" step="1" :placeholder="'std: ' + ph.defaultMin + ' min'" class="form-input" />
                <span class="field-hint">{{ form.phaseDurees[ph.code] ? form.phaseDurees[ph.code] + ' min max' : 'hérite (' + ph.defaultMin + ' min)' }}</span>
              </div>
            </div>
          </div>

          <!-- Contenu onglet Offsets (positionnement temporel par phase) -->
          <div v-show="activeTab === 'phaseOffsets'" class="tab-content">
            <div class="tab-hint">Positionnement temporel — en minutes avant la référence (ETA/ETD). Vide = utilise la valeur par défaut ou cascade séquentielle.</div>
            <div class="form-grid">
              <div class="form-group" v-for="ph in phaseOffsetsConfigurables" :key="ph.code">
                <label>{{ ph.label }}</label>
                <input v-model.number="form.phaseOffsets[ph.code]" type="number" min="0" step="5" :placeholder="'défaut: ' + ph.defaultOffset + ' min avant ' + ph.ref" class="form-input" />
                <span class="field-hint">{{ form.phaseOffsets[ph.code] ? form.phaseOffsets[ph.code] + ' min avant ' + ph.ref : 'hérite (' + ph.defaultOffset + ' min)' }}</span>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="form-group" style="margin-top: 12px;">
            <label>Notes</label>
            <textarea v-model="form.notes" rows="2" placeholder="Optionnel" class="form-input"></textarea>
          </div>

          <div v-if="formError" class="form-error">{{ formError }}</div>

          <div class="modal-actions">
            <button class="btn btn-secondary" @click="closeForm">Annuler</button>
            <button class="btn btn-primary" @click="saveCompagnie" :disabled="saving">
              {{ saving ? 'Enregistrement...' : (editMode ? 'Mettre à jour' : 'Créer') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Confirmation suppression -->
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="modal-content modal-sm">
          <h3>Supprimer la config SLA ?</h3>
          <p>La compagnie <strong>{{ deleteTarget.compagnieNom }} ({{ deleteTarget.codeIATA }})</strong> utilisera les SLA standard.</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="deleteTarget = null">Annuler</button>
            <button class="btn btn-danger" @click="doDelete" :disabled="saving">Supprimer</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { slaAPI } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'SLAConfiguration',
  data() {
    return {
      compagnies: [],
      defaults: { BROUILLON_TO_EN_COURS: 24, EN_COURS_TO_TERMINE: 48, TERMINE_TO_VALIDE: 72, GLOBAL: 168 },
      loading: true,
      showForm: false,
      editMode: false,
      saving: false,
      formError: '',
      deleteTarget: null,
      activeTab: 'crv',
      form: this.emptyForm(),
      domainTabs: [
        { key: 'crv', label: 'CRV' },
        { key: 'checkin', label: 'Enregistrement' },
        { key: 'bagages', label: 'Bagages' },
        { key: 'boarding', label: 'Embarquement' },
        { key: 'ramp', label: 'Rampe' },
        { key: 'messages', label: 'Messages' },
        { key: 'phaseDurees', label: 'Phases' },
        { key: 'phaseOffsets', label: 'Planning' }
      ],
      crvFields: [
        { key: 'brouillonToEnCours', label: 'Brouillon → En cours', defaultKey: 'BROUILLON_TO_EN_COURS' },
        { key: 'enCoursToTermine', label: 'En cours → Terminé', defaultKey: 'EN_COURS_TO_TERMINE' },
        { key: 'termineToValide', label: 'Terminé → Validé', defaultKey: 'TERMINE_TO_VALIDE' },
        { key: 'global', label: 'Global CRV', defaultKey: 'GLOBAL' }
      ],
      // Phases éligibles à une configuration durée par compagnie
      phaseConfigurables: [
        { code: 'ARR_DEBARQUEMENT', label: 'Débarquement passagers', defaultMin: 15 },
        { code: 'ARR_DECHARGEMENT', label: 'Déchargement bagages/fret', defaultMin: 25 },
        { code: 'ARR_LIVRAISON_BAGAGES', label: 'Livraison bagages', defaultMin: 20 },
        { code: 'DEP_CHECKIN', label: 'Enregistrement passagers (départ)', defaultMin: 75 },
        { code: 'DEP_CHARGEMENT', label: 'Chargement bagages/fret', defaultMin: 30 },
        { code: 'DEP_BOARDING', label: 'Embarquement & gate (départ)', defaultMin: 25 },
        { code: 'TA_CHECKIN', label: 'Enregistrement passagers (TA)', defaultMin: 75 },
        { code: 'TA_AVITAILLEMENT', label: 'Avitaillement carburant', defaultMin: 25 },
        { code: 'TA_CATERING', label: 'Catering', defaultMin: 20 },
        { code: 'TA_BOARDING', label: 'Embarquement & gate (TA)', defaultMin: 25 }
      ],
      // Phases éligibles à une configuration offset temporel (Palier 4)
      phaseOffsetsConfigurables: [
        { code: 'ARR_BRIEFING', label: 'Briefing arrivée', defaultOffset: 120, ref: 'ETA' },
        { code: 'DEP_INSPECTION', label: 'Inspection pré-vol', defaultOffset: 180, ref: 'ETD' },
        { code: 'DEP_AVITAILLEMENT', label: 'Avitaillement', defaultOffset: 150, ref: 'ETD' },
        { code: 'DEP_NETTOYAGE', label: 'Nettoyage cabine', defaultOffset: 120, ref: 'ETD' },
        { code: 'DEP_CHARG_SOUTE', label: 'Chargement soute', defaultOffset: 90, ref: 'ETD' },
        { code: 'TA_NETTOYAGE', label: 'Nettoyage cabine (TA)', defaultOffset: 90, ref: 'ETD' },
        { code: 'TA_AVITAILLEMENT', label: 'Avitaillement (TA)', defaultOffset: 80, ref: 'ETD' },
        { code: 'TA_CHARG_SOUTE', label: 'Chargement soute (TA)', defaultOffset: 60, ref: 'ETD' }
      ]
    }
  },
  computed: {
    isManager() {
      const auth = useAuthStore()
      return auth.user?.fonction === 'MANAGER'
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    emptyForm() {
      return {
        codeIATA: '',
        compagnieNom: '',
        actif: true,
        notes: '',
        crv: { brouillonToEnCours: null, enCoursToTermine: null, termineToValide: null, global: null },
        checkin: { ouverture: null, fermeture: null },
        bagages: { premierBagage: null, dernierBagage: null, bagagePrioritaire: null },
        boarding: { debut: null, fermetureGate: null, presenceAgent: null },
        ramp: { turnaround: null, turnaroundNarrow: null, turnaroundWide: null, gpu: null },
        messages: { mvt: null, ldm: null, apis: null },
        phaseDurees: {},
        phaseOffsets: {}
      }
    },
    async loadData() {
      this.loading = true
      try {
        const [configRes, compRes] = await Promise.all([
          slaAPI.getConfiguration(),
          slaAPI.getCompagnies()
        ])
        if (configRes.data?.data?.defaults?.CRV) {
          this.defaults = configRes.data.data.defaults.CRV
        }
        this.compagnies = compRes.data?.data || []
      } catch (err) {
        console.error('[SLA] Erreur chargement:', err)
      } finally {
        this.loading = false
      }
    },
    hasDomainConfig(compagnie, domaine) {
      const d = compagnie[domaine]
      if (!d) return false
      return Object.values(d).some(v => v !== null && v !== undefined)
    },
    countConfigured(compagnie, domaine) {
      const d = compagnie[domaine]
      if (!d) return 0
      return Object.values(d).filter(v => v !== null && v !== undefined).length
    },
    hasDomainValues(domainKey) {
      const d = this.form[domainKey]
      if (!d) return false
      return Object.values(d).some(v => v !== null && v !== undefined && v !== '' && v !== 0)
    },
    openCreateForm() {
      this.form = this.emptyForm()
      this.editMode = false
      this.formError = ''
      this.activeTab = 'crv'
      this.showForm = true
    },
    editCompagnie(c) {
      this.form = {
        codeIATA: c.codeIATA,
        compagnieNom: c.compagnieNom,
        actif: c.actif !== false,
        notes: c.notes || '',
        crv: {
          brouillonToEnCours: c.crv?.brouillonToEnCours ?? null,
          enCoursToTermine: c.crv?.enCoursToTermine ?? null,
          termineToValide: c.crv?.termineToValide ?? null,
          global: c.crv?.global ?? null
        },
        checkin: {
          ouverture: c.checkin?.ouverture ?? null,
          fermeture: c.checkin?.fermeture ?? null
        },
        bagages: {
          premierBagage: c.bagages?.premierBagage ?? null,
          dernierBagage: c.bagages?.dernierBagage ?? null,
          bagagePrioritaire: c.bagages?.bagagePrioritaire ?? null
        },
        boarding: {
          debut: c.boarding?.debut ?? null,
          fermetureGate: c.boarding?.fermetureGate ?? null,
          presenceAgent: c.boarding?.presenceAgent ?? null
        },
        ramp: {
          turnaround: c.ramp?.turnaround ?? null,
          turnaroundNarrow: c.ramp?.turnaroundNarrow ?? null,
          turnaroundWide: c.ramp?.turnaroundWide ?? null,
          gpu: c.ramp?.gpu ?? null
        },
        messages: {
          mvt: c.messages?.mvt ?? null,
          ldm: c.messages?.ldm ?? null,
          apis: c.messages?.apis ?? null
        },
        phaseDurees: c.phaseDurees ? (typeof c.phaseDurees === 'object' ? { ...c.phaseDurees } : {}) : {},
        phaseOffsets: c.phaseOffsets ? (typeof c.phaseOffsets === 'object' ? { ...c.phaseOffsets } : {}) : {}
      }
      this.editMode = true
      this.formError = ''
      this.activeTab = 'crv'
      this.showForm = true
    },
    closeForm() {
      this.showForm = false
      this.formError = ''
    },
    cleanDomain(obj) {
      // Convertir '' et 0 en null pour héritage
      const cleaned = {}
      for (const [key, val] of Object.entries(obj)) {
        cleaned[key] = (val === '' || val === 0 || val === undefined) ? null : val
      }
      return cleaned
    },
    async saveCompagnie() {
      const code = (this.form.codeIATA || '').toUpperCase().trim()
      if (!code || code.length < 2 || code.length > 3) {
        this.formError = 'Code IATA requis (2 ou 3 caractères)'
        return
      }
      if (!this.form.compagnieNom?.trim()) {
        this.formError = 'Nom compagnie requis'
        return
      }

      this.saving = true
      this.formError = ''
      try {
        const payload = {
          compagnieNom: this.form.compagnieNom.trim(),
          crv: this.cleanDomain(this.form.crv),
          checkin: this.cleanDomain(this.form.checkin),
          bagages: this.cleanDomain(this.form.bagages),
          boarding: this.cleanDomain(this.form.boarding),
          ramp: this.cleanDomain(this.form.ramp),
          messages: this.cleanDomain(this.form.messages),
          actif: this.form.actif,
          notes: this.form.notes || ''
        }
        await slaAPI.upsertCompagnie(code, payload)
        this.showForm = false
        await this.loadData()
      } catch (err) {
        this.formError = err.response?.data?.message || err.response?.data?.erreurs?.join(', ') || 'Erreur'
      } finally {
        this.saving = false
      }
    },
    confirmDelete(c) {
      this.deleteTarget = c
    },
    async doDelete() {
      if (!this.deleteTarget) return
      this.saving = true
      try {
        await slaAPI.deleteCompagnie(this.deleteTarget.codeIATA)
        this.deleteTarget = null
        await this.loadData()
      } catch (err) {
        alert(err.response?.data?.message || 'Erreur suppression')
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.sla-config-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header { margin-bottom: 24px; }

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h1 {
  font-size: 1.4rem;
  margin: 0;
  color: var(--text-primary, #1a1a2e);
}

.btn-back {
  background: var(--bg-secondary, #f0f0f5);
  border: 1px solid var(--border-color, #d1d1e0);
  color: var(--text-primary, #333);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-back:hover { background: var(--bg-hover, #e0e0e8); }

/* Defaults */
.sla-defaults-section { margin-bottom: 24px; }

.sla-defaults-section h3 {
  font-size: 1rem;
  color: var(--text-secondary, #666);
  margin-bottom: 12px;
}

.defaults-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.default-card {
  background: var(--bg-secondary, #f5f5fa);
  border: 1px solid var(--border-color, #e0e0e8);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.default-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary, #1a1a2e);
}

.default-label {
  font-size: 0.8rem;
  color: var(--text-secondary, #666);
  margin-top: 4px;
}

/* Table */
.sla-compagnies-section h3 {
  font-size: 1rem;
  margin-bottom: 12px;
  color: var(--text-primary, #1a1a2e);
}

.sla-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.sla-table th {
  background: var(--bg-secondary, #f0f0f5);
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary, #555);
  border-bottom: 2px solid var(--border-color, #ddd);
}

.sla-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-light, #eee);
  color: var(--text-primary, #333);
}

.sla-table tr:hover { background: var(--bg-hover, #f8f8fc); }
.sla-table tr.inactive { opacity: 0.5; }

.code-cell {
  font-weight: 700;
  font-family: monospace;
  font-size: 1rem;
}

.badge-configured {
  background: #e8f0fe;
  color: var(--primary-color, #4a6cf7);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-default {
  color: var(--text-secondary, #999);
  font-size: 0.8rem;
  font-style: italic;
}

.badge-actif {
  background: #d4edda;
  color: #155724;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.badge-inactif {
  background: #f8d7da;
  color: #721c24;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.actions-cell { white-space: nowrap; }

.btn-sm {
  padding: 4px 10px;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-right: 4px;
  background: var(--bg-secondary, #f5f5f5);
  color: var(--text-primary, #333);
}

.btn-edit:hover { background: #e8f0fe; }
.btn-delete { color: #dc3545; border-color: #dc3545; }
.btn-delete:hover { background: #fde8ea; }

/* Buttons */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-primary { background: var(--primary-color, #4a6cf7); color: white; }
.btn-primary:hover { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { background: var(--bg-secondary, #e0e0e8); color: var(--text-primary, #333); }
.btn-danger { background: #dc3545; color: white; }

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary, white);
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-lg { max-width: 680px; }
.modal-sm { max-width: 400px; }

.modal-content h3 {
  margin: 0 0 16px;
  color: var(--text-primary, #1a1a2e);
}

/* Form */
.form-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 16px;
}

.form-row .form-group { flex: 1; margin-bottom: 0; }
.flex-2 { flex: 2 !important; }

.form-group { margin-bottom: 12px; }

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--text-secondary, #555);
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #d1d1e0);
  border-radius: 6px;
  font-size: 0.9rem;
  background: var(--bg-primary, white);
  color: var(--text-primary, #333);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color, #4a6cf7);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field-hint {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary, #888);
  margin-top: 2px;
  font-style: italic;
}

/* Domain Tabs */
.domain-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 2px solid var(--border-color, #e0e0e8);
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 8px 14px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary, #666);
  position: relative;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--primary-color, #4a6cf7);
}

.tab-btn.active {
  color: var(--primary-color, #4a6cf7);
  border-bottom-color: var(--primary-color, #4a6cf7);
}

.tab-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: var(--primary-color, #4a6cf7);
  border-radius: 50%;
  margin-left: 4px;
  vertical-align: middle;
}

.tab-content {
  min-height: 140px;
}

.tab-hint {
  font-size: 0.8rem;
  color: var(--text-secondary, #888);
  margin-bottom: 12px;
  padding: 6px 10px;
  background: var(--bg-secondary, #f5f5fa);
  border-radius: 4px;
}

.form-error {
  color: #dc3545;
  font-size: 0.85rem;
  margin-bottom: 12px;
  padding: 8px;
  background: #fde8ea;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

/* States */
.loading-state, .empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary, #888);
  font-size: 0.95rem;
}
</style>

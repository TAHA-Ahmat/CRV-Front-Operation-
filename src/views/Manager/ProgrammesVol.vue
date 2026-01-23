<template>
  <div class="programmes-container">
    <!-- Pas de header local - AppHeader global dans App.vue -->

    <main class="main-content">
      <div class="page-header-bar">
        <h1>Programmes de Vol</h1>
        <button v-if="canCreate" @click="openCreateProgrammeModal" class="btn btn-primary">
          + Nouveau Programme
        </button>
      </div>
      <div class="container">
        <!-- Filtres -->
        <div class="filters-card">
          <div class="filters-row">
            <div class="filter-group">
              <label>Statut</label>
              <select v-model="filters.statut" @change="loadProgrammes">
                <option value="">Tous</option>
                <option value="BROUILLON">Brouillon</option>
                <option value="VALIDE">Validé</option>
                <option value="ACTIF">Actif</option>
                <option value="SUSPENDU">Suspendu</option>
                <option value="TERMINE">Terminé</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Recherche</label>
              <input v-model="filters.search" @input="debounceSearch" placeholder="Nom du programme...">
            </div>
            <div class="filter-group">
              <label>&nbsp;</label>
              <button @click="resetFilters" class="btn btn-secondary">Réinitialiser</button>
            </div>
          </div>
        </div>

        <!-- Indicateur workflow -->
        <div class="workflow-indicator">
          <div class="workflow-step">
            <span class="step-icon">1</span>
            <span class="step-label">BROUILLON</span>
          </div>
          <div class="workflow-arrow">→</div>
          <div class="workflow-step">
            <span class="step-icon">2</span>
            <span class="step-label">VALIDÉ</span>
          </div>
          <div class="workflow-arrow">→</div>
          <div class="workflow-step">
            <span class="step-icon">3</span>
            <span class="step-label">ACTIF</span>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading-state">
          <p>Chargement des programmes...</p>
        </div>

        <!-- Liste des programmes -->
        <div v-else-if="programmes.length > 0" class="programmes-grid">
          <div
            v-for="programme in programmes"
            :key="programme._id || programme.id"
            class="programme-card"
            :class="getStatutClass(programme.statut)"
          >
            <div class="programme-header">
              <div class="programme-title">
                <h3>{{ programme.nom }}</h3>
                <span v-if="programme.edition" class="edition-badge">{{ programme.edition }}</span>
              </div>
              <div class="status-container">
                <span v-if="programme.actif" class="active-indicator">EN COURS</span>
                <span class="status-badge" :class="getStatutBadgeClass(programme.statut)">
                  {{ programme.statut }}
                </span>
              </div>
            </div>

            <div class="programme-info">
              <div class="info-row">
                <span class="label">Période:</span>
                <span class="value">
                  {{ formatDate(programme.dateDebut) }} - {{ formatDate(programme.dateFin) }}
                </span>
              </div>
              <div class="info-row">
                <span class="label">Vols:</span>
                <span class="value stats-value">{{ programme.nombreVols || 0 }}</span>
              </div>
              <div v-if="programme.compagnies && programme.compagnies.length > 0" class="info-row">
                <span class="label">Compagnies:</span>
                <span class="value">
                  <span v-for="(comp, idx) in programme.compagnies" :key="idx" class="compagnie-tag">
                    {{ comp }}
                  </span>
                </span>
              </div>
              <div v-if="programme.description" class="info-row">
                <span class="label">Description:</span>
                <span class="value">{{ programme.description }}</span>
              </div>
            </div>

            <div class="programme-actions">
              <button @click="openProgrammeDetail(programme)" class="btn-action btn-view">
                Voir / Gérer vols
              </button>
              <button
                v-if="canEdit(programme)"
                @click="openEditProgrammeModal(programme)"
                class="btn-action btn-edit"
              >
                Modifier
              </button>
              <button
                v-if="programme.nombreVols > 0"
                @click="openPDFExport(programme)"
                class="btn-action btn-pdf"
                title="Exporter en PDF"
              >
                <i class="fas fa-file-pdf"></i> PDF
              </button>
              <ArchiveButton
                v-if="programme.statut === 'ACTIF' || programme.statut === 'VALIDE'"
                document-type="programme-vol"
                :document-id="programme._id || programme.id"
                :document-name="programme.nom"
                :archivage-info="programme.archivage"
                :document-statut="programme.statut"
                :api-service="programmesVolAPI"
                :compact="false"
                @archived="onProgrammeArchived"
                @error="onArchiveError"
              />
              <button
                v-if="canValidate && programme.statut === 'BROUILLON' && programme.nombreVols > 0"
                @click="validerProgramme(programme)"
                class="btn-action btn-validate"
              >
                Valider
              </button>
              <button
                v-if="canActivate && programme.statut === 'VALIDE'"
                @click="activerProgramme(programme)"
                class="btn-action btn-activate"
              >
                Activer
              </button>
              <button
                v-if="canActivate && programme.statut === 'ACTIF'"
                @click="openSuspendreModal(programme)"
                class="btn-action btn-suspend"
              >
                Suspendre
              </button>
              <button
                v-if="canDelete && programme.statut === 'BROUILLON'"
                @click="openDeleteModal(programme)"
                class="btn-action btn-delete"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>Aucun programme trouvé</h3>
          <p>Créez votre premier programme saisonnier pour automatiser la génération des vols.</p>
          <button v-if="canCreate" @click="openCreateProgrammeModal" class="btn btn-primary">
            Créer un programme
          </button>
        </div>
      </div>
    </main>

    <!-- Modal Création/Edition Programme -->
    <div v-if="showProgrammeModal" class="modal-overlay modal-overlay-top" @click.self="closeProgrammeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingProgramme ? 'Modifier le programme' : 'Nouveau programme' }}</h2>
          <button @click="closeProgrammeModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveProgramme">
            <div class="form-group">
              <label>Nom du programme <span class="required">*</span></label>
              <input v-model="programmeForm.nom" type="text" required placeholder="Ex: HIVER_2025_2026">
            </div>

            <div class="form-group">
              <label>Édition</label>
              <input v-model="programmeForm.edition" type="text" placeholder="Ex: N°01/17-déc.-25">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Date de début <span class="required">*</span></label>
                <input v-model="programmeForm.dateDebut" type="date" required>
              </div>

              <div class="form-group">
                <label>Date de fin <span class="required">*</span></label>
                <input v-model="programmeForm.dateFin" type="date" required>
              </div>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea v-model="programmeForm.description" rows="2" placeholder="Description du programme..."></textarea>
            </div>

            <div class="form-group">
              <label>Remarques</label>
              <textarea v-model="programmeForm.remarques" rows="2" placeholder="Remarques additionnelles..."></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeProgrammeModal" class="btn btn-secondary">Annuler</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Détail Programme avec Vols -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal-content modal-xlarge">
        <div class="modal-header">
          <div class="modal-header-info">
            <h2>{{ selectedProgramme?.nom }}</h2>
            <span v-if="selectedProgramme?.edition" class="edition-tag">{{ selectedProgramme.edition }}</span>
            <span class="status-badge" :class="getStatutBadgeClass(selectedProgramme?.statut)">
              {{ selectedProgramme?.statut }}
            </span>
          </div>
          <button @click="closeDetailModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <!-- Infos programme -->
          <div class="detail-summary">
            <div class="summary-item summary-item-editable">
              <span class="summary-label">
                Période
                <button
                  v-if="canEditVols"
                  @click="openEditProgrammeFromDetail"
                  class="btn-edit-inline"
                  title="Modifier le programme"
                >✎</button>
              </span>
              <span class="summary-value">
                {{ formatDate(selectedProgramme?.dateDebut) }} - {{ formatDate(selectedProgramme?.dateFin) }}
              </span>
              <span class="summary-sub">{{ nombreSemaines }} semaines</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Types de vols</span>
              <span class="summary-value highlight">{{ vols.length }}</span>
              <span class="summary-sub">définitions uniques</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Vols / semaine</span>
              <span class="summary-value highlight">{{ volsParSemaine }}</span>
              <span class="summary-sub">rotations hebdo</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Total période</span>
              <span class="summary-value highlight-total">~{{ totalVolsPeriode.toLocaleString('fr-FR') }}</span>
              <span class="summary-sub">vols estimés</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Compagnies</span>
              <span class="summary-value">
                <span v-for="(comp, idx) in (selectedProgramme?.compagnies || [])" :key="idx" class="compagnie-tag">
                  {{ comp }}
                </span>
                <span v-if="!selectedProgramme?.compagnies?.length">-</span>
              </span>
            </div>
          </div>

          <!-- Header vols avec toggle vue -->
          <div class="vols-header">
            <div class="vols-header-left">
              <h3>Vols du programme</h3>
              <div class="view-toggle">
                <button
                  :class="['toggle-btn', { active: viewMode === 'calendar' }]"
                  @click="viewMode = 'calendar'"
                >
                  <span class="toggle-icon">📅</span> Calendrier
                </button>
                <button
                  :class="['toggle-btn', { active: viewMode === 'list' }]"
                  @click="viewMode = 'list'"
                >
                  <span class="toggle-icon">📋</span> Liste
                </button>
              </div>
            </div>
            <div class="vols-actions">
              <div v-if="viewMode === 'list'" class="filter-jour">
                <label>Filtrer par jour:</label>
                <select v-model="filtrJour" @change="loadVolsFiltered">
                  <option value="">Tous</option>
                  <option v-for="(jour, idx) in joursNom" :key="idx" :value="idx">{{ jour }}</option>
                </select>
              </div>
              <button
                v-if="vols.length > 0"
                @click="openPDFExport(selectedProgramme)"
                class="btn btn-secondary btn-sm btn-pdf-detail"
                title="Exporter en PDF"
              >
                <i class="fas fa-file-pdf"></i> PDF
              </button>
              <ArchiveButton
                v-if="selectedProgramme && (selectedProgramme.statut === 'ACTIF' || selectedProgramme.statut === 'VALIDE')"
                document-type="programme-vol"
                :document-id="selectedProgramme._id || selectedProgramme.id"
                :document-name="selectedProgramme.nom"
                :archivage-info="selectedProgramme.archivage"
                :document-statut="selectedProgramme.statut"
                :api-service="programmesVolAPI"
                @archived="onProgrammeArchived"
                @error="onArchiveError"
              />
              <button
                v-if="canEditVols"
                @click="openAddVolModal"
                class="btn btn-primary btn-sm"
              >
                + Ajouter un vol
              </button>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="loadingVols" class="loading-state">
            <p>Chargement des vols...</p>
          </div>

          <!-- VUE CALENDRIER HEBDOMADAIRE (par défaut) -->
          <div v-else-if="viewMode === 'calendar'" class="calendar-view">
            <div class="calendar-grid">
              <!-- Colonnes Lundi → Dimanche -->
              <div
                v-for="jourIdx in joursCalendrier"
                :key="jourIdx"
                class="calendar-column"
              >
                <div class="calendar-day-header">
                  <span class="day-name">{{ joursNom[jourIdx] }}</span>
                  <span class="day-count">{{ volsParJour[jourIdx]?.length || 0 }} vol{{ (volsParJour[jourIdx]?.length || 0) > 1 ? 's' : '' }}</span>
                </div>
                <div class="calendar-day-content">
                  <!-- Vols du jour -->
                  <div
                    v-for="vol in volsParJour[jourIdx]"
                    :key="vol._id || vol.id"
                    class="calendar-vol-card"
                    :class="getCategorieClass(vol.categorieVol)"
                    @click="canEditVols && openEditVolModal(vol)"
                  >
                    <div class="vol-card-header">
                      <span class="vol-numero">{{ vol.numeroVol }}</span>
                      <span class="vol-avion">{{ vol.typeAvion || '-' }}</span>
                    </div>
                    <div class="vol-card-horaires">
                      <div v-if="vol.heureArrivee" class="vol-horaire">
                        <span class="horaire-label">ARR</span>
                        <span class="horaire-value">{{ vol.heureArrivee }}</span>
                        <span class="horaire-lieu">{{ vol.provenance || '-' }}</span>
                      </div>
                      <div v-if="vol.heureDepart" class="vol-horaire">
                        <span class="horaire-label">DEP</span>
                        <span class="horaire-value">
                          {{ vol.heureDepart }}
                          <span v-if="vol.departLendemain" class="j1-mini">+1</span>
                        </span>
                        <span class="horaire-lieu">{{ vol.destination || '-' }}</span>
                      </div>
                    </div>
                    <div class="vol-card-footer">
                      <span class="vol-categorie">{{ vol.categorieVol }}</span>
                      <button
                        v-if="canEditVols"
                        @click.stop="confirmDeleteVol(vol)"
                        class="vol-delete-btn"
                        title="Supprimer"
                      >✕</button>
                    </div>
                  </div>
                  <!-- Jour vide -->
                  <div v-if="!volsParJour[jourIdx]?.length" class="calendar-empty-day">
                    <span class="empty-icon">—</span>
                    <span class="empty-text">Aucun vol</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- VUE LISTE TABLEAU (alternative) -->
          <div v-else-if="viewMode === 'list' && vols.length > 0" class="vols-table-container">
            <table class="vols-table">
              <thead>
                <tr>
                  <th>Jours</th>
                  <th>N° Vol</th>
                  <th>Type Avion</th>
                  <th>Config</th>
                  <th>Provenance</th>
                  <th>Arrivée</th>
                  <th>Destination</th>
                  <th>Départ</th>
                  <th>Catégorie</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="vol in vols" :key="vol._id || vol.id">
                  <td class="jours-cell">
                    <span class="jours-badges">
                      <span
                        v-for="j in vol.joursSemaine"
                        :key="j"
                        class="jour-badge"
                        :title="joursNom[j]"
                      >{{ joursAbrev[j] }}</span>
                    </span>
                  </td>
                  <td class="numero-vol">{{ vol.numeroVol }}</td>
                  <td>{{ vol.typeAvion || '-' }}</td>
                  <td>{{ vol.version || 'TBN' }}</td>
                  <td>{{ vol.provenance || '-' }}</td>
                  <td class="heure-cell">{{ vol.heureArrivee || '-' }}</td>
                  <td>{{ vol.destination || '-' }}</td>
                  <td class="heure-cell">
                    {{ vol.heureDepart || '-' }}
                    <span v-if="vol.departLendemain" class="j1-badge">J+1</span>
                  </td>
                  <td>
                    <span class="categorie-badge" :class="getCategorieClass(vol.categorieVol)">
                      {{ vol.categorieVol }}
                    </span>
                  </td>
                  <td class="actions-cell">
                    <button
                      v-if="canEditVols"
                      @click="openEditVolModal(vol)"
                      class="btn-icon btn-edit-icon"
                      title="Modifier"
                    >✎</button>
                    <button
                      v-if="canEditVols"
                      @click="confirmDeleteVol(vol)"
                      class="btn-icon btn-delete-icon"
                      title="Supprimer"
                    >✕</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- État vide -->
          <div v-else-if="vols.length === 0 && !loadingVols" class="empty-vols">
            <p>Aucun vol dans ce programme.</p>
            <button v-if="canEditVols" @click="openAddVolModal" class="btn btn-primary">
              Ajouter le premier vol
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeDetailModal" class="btn btn-secondary">Fermer</button>
        </div>
      </div>
    </div>

    <!-- Modal Ajout/Edition Vol -->
    <div v-if="showVolModal" class="modal-overlay" @click.self="closeVolModal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2>{{ editingVol ? 'Modifier le vol' : 'Ajouter un vol' }}</h2>
          <button @click="closeVolModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveVol">
            <!-- Jours de la semaine -->
            <div class="form-group full-width">
              <label>Jours de récurrence <span class="required">*</span></label>
              <div class="jours-selector">
                <label
                  v-for="(jour, idx) in joursNom"
                  :key="idx"
                  class="jour-checkbox"
                  :class="{ active: volForm.joursSemaine.includes(idx) }"
                >
                  <input
                    type="checkbox"
                    :value="idx"
                    v-model="volForm.joursSemaine"
                    class="hidden-checkbox"
                  >
                  <span class="jour-label">{{ joursAbrev[idx] }}</span>
                </label>
                <button type="button" @click="selectAllJours" class="btn-select-all">
                  {{ volForm.joursSemaine.length === 7 ? 'Désélectionner tout' : 'Quotidien' }}
                </button>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Numéro de vol <span class="required">*</span></label>
                <input v-model="volForm.numeroVol" type="text" required placeholder="Ex: ET939">
              </div>

              <div class="form-group">
                <label>Code compagnie (2-3 car.)</label>
                <input
                  v-model="volForm.codeCompagnie"
                  type="text"
                  maxlength="3"
                  placeholder="Ex: ET, AF (auto si vide)"
                  style="text-transform: uppercase;"
                >
              </div>

              <div class="form-group">
                <label>Type d'avion</label>
                <input v-model="volForm.typeAvion" type="text" placeholder="Ex: B737-800">
              </div>

              <div class="form-group">
                <label>Configuration (version)</label>
                <input v-model="volForm.version" type="text" placeholder="Ex: 16C138Y ou TBN">
              </div>

              <div class="form-group">
                <label>Provenance</label>
                <input v-model="volForm.provenance" type="text" placeholder="Ex: ADD">
              </div>

              <div class="form-group">
                <label>Heure d'arrivée</label>
                <input v-model="volForm.heureArrivee" type="time" placeholder="HH:MM">
              </div>

              <div class="form-group">
                <label>Destination</label>
                <input v-model="volForm.destination" type="text" placeholder="Ex: CDG">
              </div>

              <div class="form-group">
                <label>Heure de départ</label>
                <div class="input-with-checkbox">
                  <input v-model="volForm.heureDepart" type="time" placeholder="HH:MM">
                  <label class="checkbox-inline">
                    <input type="checkbox" v-model="volForm.departLendemain">
                    J+1
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>Catégorie</label>
                <select v-model="volForm.categorieVol">
                  <option value="INTERNATIONAL">International</option>
                  <option value="REGIONAL">Régional</option>
                  <option value="DOMESTIQUE">Domestique</option>
                  <option value="CARGO">Cargo</option>
                </select>
              </div>

              <div class="form-group">
                <label>Type d'opération</label>
                <select v-model="volForm.typeOperation">
                  <option value="TURN_AROUND">Turn Around</option>
                  <option value="ARRIVEE">Arrivée seule</option>
                  <option value="DEPART">Départ seul</option>
                  <option value="TRANSIT">Transit</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label>Observations</label>
                <textarea v-model="volForm.observations" rows="2" placeholder="Remarques sur ce vol..."></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeVolModal" class="btn btn-secondary">Annuler</button>
              <button type="submit" class="btn btn-primary" :disabled="savingVol || volForm.joursSemaine.length === 0">
                {{ savingVol ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Suspension -->
    <div v-if="showSuspendreModal" class="modal-overlay" @click.self="closeSuspendreModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Suspendre le programme</h2>
          <button @click="closeSuspendreModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>Programme : <strong>{{ selectedProgramme?.nom }}</strong></p>
          <div class="form-group">
            <label>Raison de la suspension</label>
            <textarea v-model="suspendreRaison" rows="3" placeholder="Indiquez la raison..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeSuspendreModal" class="btn btn-secondary">Annuler</button>
          <button @click="confirmerSuspension" class="btn btn-warning">Suspendre</button>
        </div>
      </div>
    </div>

    <!-- Modal Suppression Programme -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-content">
        <div class="modal-header modal-header-danger">
          <h2>Supprimer le programme</h2>
          <button @click="closeDeleteModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="danger-box">
            <strong>Action irréversible</strong>
            <p>La suppression d'un programme supprime également tous ses vols.</p>
          </div>
          <p>Programme : <strong>{{ selectedProgramme?.nom }}</strong></p>
          <p v-if="selectedProgramme?.nombreVols">Vols associés : <strong>{{ selectedProgramme.nombreVols }}</strong></p>
        </div>
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn btn-secondary">Annuler</button>
          <button @click="confirmerSuppression" class="btn btn-danger">Supprimer</button>
        </div>
      </div>
    </div>

    <!-- Modal Suppression Vol -->
    <div v-if="showDeleteVolModal" class="modal-overlay" @click.self="closeDeleteVolModal">
      <div class="modal-content">
        <div class="modal-header modal-header-danger">
          <h2>Supprimer le vol</h2>
          <button @click="closeDeleteVolModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>Voulez-vous vraiment supprimer le vol <strong>{{ volToDelete?.numeroVol }}</strong> ?</p>
        </div>
        <div class="modal-footer">
          <button @click="closeDeleteVolModal" class="btn btn-secondary">Annuler</button>
          <button @click="executeDeleteVol" class="btn btn-danger">Supprimer</button>
        </div>
      </div>
    </div>

    <!-- Modal Export PDF -->
    <div v-if="showPDFExportModal" class="modal-overlay" @click.self="closePDFExportModal">
      <div class="modal-content modal-pdf">
        <div class="modal-header">
          <h2><i class="fas fa-file-pdf mr-2"></i> Export PDF</h2>
          <button @click="closePDFExportModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="programmeForPDF" class="pdf-export-content">
            <div class="pdf-programme-info">
              <h3>{{ programmeForPDF.nom }}</h3>
              <p class="pdf-periode">
                {{ formatDate(programmeForPDF.dateDebut) }} - {{ formatDate(programmeForPDF.dateFin) }}
              </p>
              <p class="pdf-vols-count">{{ programmeForPDF.nombreVols || 0 }} vols</p>
            </div>
            <ProgrammeVolPDF
              :programme-id="programmeForPDF._id || programmeForPDF.id"
              :programme-nom="programmeForPDF.nom"
              :show-preview-data="false"
              @success="onPDFSuccess"
              @error="onPDFError"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closePDFExportModal" class="btn btn-secondary">Fermer</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
/**
 * ProgrammesVol.vue - Gestion des programmes de vol saisonniers
 *
 * Architecture 2 niveaux:
 * - Programme (conteneur): nom, edition, dates, statut
 * - Vols (enfants): joursSemaine[0-6], numeroVol, heures HH:MM
 *
 * Workflow: BROUILLON -> VALIDE -> ACTIF
 */

import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { programmesVolAPI } from '@/services/api'
import { canValidateProgramme, canDeleteProgramme } from '@/utils/permissions'
import { normalizeRole } from '@/config/roles'
import ProgrammeVolPDF from '@/components/flights/ProgrammeVolPDF.vue'
import ArchiveButton from '@/components/Common/ArchiveButton.vue'

const router = useRouter()
const authStore = useAuthStore()

// ============================================
// CONSTANTES
// ============================================

const joursNom = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const joursAbrev = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
// Ordre pour le calendrier: Lundi(1) → Dimanche(0)
const joursCalendrier = [1, 2, 3, 4, 5, 6, 0]

// ============================================
// STATE - Programmes
// ============================================

const loading = ref(false)
const saving = ref(false)
const programmes = ref([])
const selectedProgramme = ref(null)
const editingProgramme = ref(null)

// ============================================
// STATE - Vols
// ============================================

const loadingVols = ref(false)
const savingVol = ref(false)
const vols = ref([])
const editingVol = ref(null)
const volToDelete = ref(null)
const filtrJour = ref('')
const viewMode = ref('calendar') // 'calendar' (défaut) ou 'list'

// ============================================
// MODALS
// ============================================

const showProgrammeModal = ref(false)
const showDetailModal = ref(false)
const showVolModal = ref(false)
const showSuspendreModal = ref(false)
const showDeleteModal = ref(false)
const showDeleteVolModal = ref(false)
const showPDFExportModal = ref(false)
const programmeForPDF = ref(null)
const suspendreRaison = ref('')

// ============================================
// FILTERS
// ============================================

const filters = reactive({
  statut: '',
  search: ''
})

// ============================================
// FORMS
// ============================================

const programmeForm = reactive({
  nom: '',
  edition: '',
  dateDebut: '',
  dateFin: '',
  description: '',
  remarques: ''
})

const volForm = reactive({
  joursSemaine: [],
  numeroVol: '',
  codeCompagnie: '',
  typeAvion: '',
  version: 'TBN',
  provenance: '',
  heureArrivee: '',
  destination: '',
  heureDepart: '',
  departLendemain: false,
  categorieVol: 'INTERNATIONAL',
  typeOperation: 'TURN_AROUND',
  observations: ''
})

// ============================================
// TOAST
// ============================================

const toast = reactive({ show: false, message: '', type: 'success' })

// ============================================
// COMPUTED - Permissions
// ============================================

const userRole = computed(() => {
  const role = authStore.currentUser?.fonction || authStore.currentUser?.role
  const normalized = normalizeRole(role)
  console.log('[ProgrammesVol] Role brut:', role, '→ normalisé:', normalized)
  return normalized
})
const canCreate = computed(() => canValidateProgramme(userRole.value))
const canValidate = computed(() => canValidateProgramme(userRole.value))
const canActivate = computed(() => canValidateProgramme(userRole.value))
const canDelete = computed(() => canDeleteProgramme(userRole.value))

const canEdit = (programme) => {
  // Modification autorisée pour BROUILLON, VALIDE et ACTIF
  const statutsModifiables = ['BROUILLON', 'VALIDE', 'ACTIF']
  return statutsModifiables.includes(programme.statut) && canCreate.value
}

const canEditVols = computed(() => {
  if (!selectedProgramme.value) return false
  // Modification des vols autorisée pour BROUILLON, VALIDE et ACTIF
  const statutsModifiables = ['BROUILLON', 'VALIDE', 'ACTIF']
  return statutsModifiables.includes(selectedProgramme.value.statut) && canCreate.value
})

// ============================================
// COMPUTED - Statistiques des vols
// ============================================

// Nombre de vols par semaine (somme des jours d'opération)
const volsParSemaine = computed(() => {
  return vols.value.reduce((total, vol) => {
    return total + (vol.joursSemaine?.length || 0)
  }, 0)
})

// Nombre de semaines dans la période du programme
const nombreSemaines = computed(() => {
  if (!selectedProgramme.value?.dateDebut || !selectedProgramme.value?.dateFin) return 0
  const debut = new Date(selectedProgramme.value.dateDebut)
  const fin = new Date(selectedProgramme.value.dateFin)
  const diffMs = fin - debut
  const diffJours = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  return Math.ceil(diffJours / 7)
})

// Total vols sur toute la période
const totalVolsPeriode = computed(() => {
  return volsParSemaine.value * nombreSemaines.value
})

// ============================================
// COMPUTED - Vols par jour (pour vue calendrier)
// ============================================

const volsParJour = computed(() => {
  // Organise les vols par jour de la semaine (0-6)
  const parJour = {
    0: [], // Dimanche
    1: [], // Lundi
    2: [], // Mardi
    3: [], // Mercredi
    4: [], // Jeudi
    5: [], // Vendredi
    6: []  // Samedi
  }

  vols.value.forEach(vol => {
    if (vol.joursSemaine && Array.isArray(vol.joursSemaine)) {
      vol.joursSemaine.forEach(jour => {
        if (parJour[jour]) {
          parJour[jour].push(vol)
        }
      })
    }
  })

  // Trier chaque jour par heure d'arrivée puis heure de départ
  Object.keys(parJour).forEach(jour => {
    parJour[jour].sort((a, b) => {
      const heureA = a.heureArrivee || a.heureDepart || '99:99'
      const heureB = b.heureArrivee || b.heureDepart || '99:99'
      return heureA.localeCompare(heureB)
    })
  })

  return parJour
})

// ============================================
// PROGRAMMES - CRUD
// ============================================

let searchTimeout = null
const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(loadProgrammes, 300)
}

const resetFilters = () => {
  filters.statut = ''
  filters.search = ''
  loadProgrammes()
}

const loadProgrammes = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.statut) params.statut = filters.statut
    if (filters.search) params.nom = filters.search

    const response = await programmesVolAPI.getAll(params)
    const data = response.data.data || response.data
    programmes.value = Array.isArray(data) ? data : (data.programmes || [])
  } catch (error) {
    console.error('[ProgrammesVol] Erreur chargement:', error)
    showToast('Erreur lors du chargement', 'error')
  } finally {
    loading.value = false
  }
}

const openCreateProgrammeModal = () => {
  editingProgramme.value = null
  resetProgrammeForm()
  showProgrammeModal.value = true
}

const openEditProgrammeModal = (programme) => {
  editingProgramme.value = programme
  Object.assign(programmeForm, {
    nom: programme.nom || '',
    edition: programme.edition || '',
    dateDebut: programme.dateDebut?.split('T')[0] || '',
    dateFin: programme.dateFin?.split('T')[0] || '',
    description: programme.description || '',
    remarques: programme.remarques || ''
  })
  showProgrammeModal.value = true
}

// Ouvrir l'édition depuis le modal détail
const openEditProgrammeFromDetail = () => {
  if (selectedProgramme.value) {
    openEditProgrammeModal(selectedProgramme.value)
  }
}

const closeProgrammeModal = () => {
  showProgrammeModal.value = false
  editingProgramme.value = null
  resetProgrammeForm()
}

const resetProgrammeForm = () => {
  Object.assign(programmeForm, {
    nom: '',
    edition: '',
    dateDebut: '',
    dateFin: '',
    description: '',
    remarques: ''
  })
}

const saveProgramme = async () => {
  // Validation 1: Unicité du nom (pour création uniquement)
  if (!editingProgramme.value) {
    const nomNormalise = programmeForm.nom?.trim().toUpperCase()
    const existe = programmes.value.find(p =>
      p.nom?.toUpperCase() === nomNormalise
    )
    if (existe) {
      showToast('Un programme avec ce nom existe déjà', 'error')
      return
    }
  }

  // Validation 2: Cohérence des dates
  const dateDebut = new Date(programmeForm.dateDebut)
  const dateFin = new Date(programmeForm.dateFin)

  if (dateFin <= dateDebut) {
    showToast('La date de fin doit être postérieure à la date de début', 'error')
    return
  }

  saving.value = true
  try {
    const data = {
      nom: programmeForm.nom.trim(),
      edition: programmeForm.edition || undefined,
      dateDebut: dateDebut.toISOString(),
      dateFin: dateFin.toISOString(),
      description: programmeForm.description || undefined,
      remarques: programmeForm.remarques || undefined
    }

    if (editingProgramme.value) {
      await programmesVolAPI.update(editingProgramme.value._id || editingProgramme.value.id, data)
      showToast('Programme modifié avec succès', 'success')
      // Rafraîchir le programme sélectionné si le modal détail est ouvert
      if (showDetailModal.value && selectedProgramme.value) {
        await refreshSelectedProgramme()
      }
    } else {
      await programmesVolAPI.create(data)
      showToast('Programme créé avec succès', 'success')
    }

    closeProgrammeModal()
    loadProgrammes()
  } catch (error) {
    console.error('[ProgrammesVol] Erreur sauvegarde:', error)
    const message = error.response?.data?.message ||
                    error.response?.data?.error?.message ||
                    'Erreur lors de la sauvegarde'
    showToast(message, 'error')
  } finally {
    saving.value = false
  }
}

// ============================================
// PROGRAMMES - WORKFLOW
// ============================================

const validerProgramme = async (programme) => {
  try {
    await programmesVolAPI.valider(programme._id || programme.id)
    showToast('Programme validé - Prêt pour activation', 'success')
    loadProgrammes()
  } catch (error) {
    showToast(error.response?.data?.message || 'Erreur lors de la validation', 'error')
  }
}

const activerProgramme = async (programme) => {
  try {
    await programmesVolAPI.activer(programme._id || programme.id)
    showToast('Programme activé - Les autres programmes ont été suspendus', 'success')
    loadProgrammes()
  } catch (error) {
    showToast(error.response?.data?.message || 'Erreur lors de l\'activation', 'error')
  }
}

const openSuspendreModal = (programme) => {
  selectedProgramme.value = programme
  suspendreRaison.value = ''
  showSuspendreModal.value = true
}

const closeSuspendreModal = () => {
  showSuspendreModal.value = false
  selectedProgramme.value = null
}

const confirmerSuspension = async () => {
  try {
    await programmesVolAPI.suspendre(selectedProgramme.value._id || selectedProgramme.value.id, suspendreRaison.value)
    showToast('Programme suspendu', 'success')
    closeSuspendreModal()
    loadProgrammes()
  } catch (error) {
    showToast(error.response?.data?.message || 'Erreur lors de la suspension', 'error')
  }
}

const openDeleteModal = (programme) => {
  selectedProgramme.value = programme
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedProgramme.value = null
}

const confirmerSuppression = async () => {
  try {
    await programmesVolAPI.delete(selectedProgramme.value._id || selectedProgramme.value.id)
    showToast('Programme supprimé', 'success')
    closeDeleteModal()
    loadProgrammes()
  } catch (error) {
    showToast(error.response?.data?.message || 'Erreur lors de la suppression', 'error')
  }
}

// ============================================
// DETAIL PROGRAMME + VOLS
// ============================================

const openProgrammeDetail = async (programme) => {
  selectedProgramme.value = programme
  showDetailModal.value = true
  filtrJour.value = ''
  await loadVols()
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedProgramme.value = null
  vols.value = []
}

const loadVols = async () => {
  if (!selectedProgramme.value) return
  loadingVols.value = true
  try {
    const programmeId = selectedProgramme.value._id || selectedProgramme.value.id
    const response = await programmesVolAPI.getVols(programmeId)
    const data = response.data.data || response.data
    vols.value = Array.isArray(data) ? data : (data.vols || [])
  } catch (error) {
    console.error('[ProgrammesVol] Erreur chargement vols:', error)
    showToast('Erreur lors du chargement des vols', 'error')
  } finally {
    loadingVols.value = false
  }
}

const loadVolsFiltered = async () => {
  if (!selectedProgramme.value) return
  loadingVols.value = true
  try {
    const programmeId = selectedProgramme.value._id || selectedProgramme.value.id
    let response
    if (filtrJour.value !== '') {
      response = await programmesVolAPI.getVolsParJour(programmeId, parseInt(filtrJour.value))
    } else {
      response = await programmesVolAPI.getVols(programmeId)
    }
    const data = response.data.data || response.data
    vols.value = Array.isArray(data) ? data : (data.vols || [])
  } catch (error) {
    console.error('[ProgrammesVol] Erreur filtrage vols:', error)
  } finally {
    loadingVols.value = false
  }
}

// ============================================
// VOLS - CRUD
// ============================================

const openAddVolModal = () => {
  editingVol.value = null
  resetVolForm()
  showVolModal.value = true
}

const openEditVolModal = (vol) => {
  editingVol.value = vol
  Object.assign(volForm, {
    joursSemaine: [...(vol.joursSemaine || [])],
    numeroVol: vol.numeroVol || '',
    codeCompagnie: vol.codeCompagnie || '',
    typeAvion: vol.typeAvion || '',
    version: vol.version || 'TBN',
    provenance: vol.provenance || '',
    heureArrivee: vol.heureArrivee || '',
    destination: vol.destination || '',
    heureDepart: vol.heureDepart || '',
    departLendemain: vol.departLendemain || false,
    categorieVol: vol.categorieVol || 'INTERNATIONAL',
    typeOperation: vol.typeOperation || 'TURN_AROUND',
    observations: vol.observations || ''
  })
  showVolModal.value = true
}

const closeVolModal = () => {
  showVolModal.value = false
  editingVol.value = null
  resetVolForm()
}

const resetVolForm = () => {
  Object.assign(volForm, {
    joursSemaine: [],
    numeroVol: '',
    codeCompagnie: '',
    typeAvion: '',
    version: 'TBN',
    provenance: '',
    heureArrivee: '',
    destination: '',
    heureDepart: '',
    departLendemain: false,
    categorieVol: 'INTERNATIONAL',
    typeOperation: 'TURN_AROUND',
    observations: ''
  })
}

const selectAllJours = () => {
  if (volForm.joursSemaine.length === 7) {
    volForm.joursSemaine = []
  } else {
    volForm.joursSemaine = [0, 1, 2, 3, 4, 5, 6]
  }
}

const saveVol = async () => {
  if (volForm.joursSemaine.length === 0) {
    showToast('Sélectionnez au moins un jour', 'error')
    return
  }

  savingVol.value = true
  try {
    const programmeId = selectedProgramme.value._id || selectedProgramme.value.id
    // Forcer majuscules et limiter codeCompagnie à 3 caractères max
    const codeCompagnieClean = volForm.codeCompagnie
      ? volForm.codeCompagnie.toUpperCase().trim().substring(0, 3)
      : undefined

    const data = {
      joursSemaine: volForm.joursSemaine.sort((a, b) => a - b),
      numeroVol: volForm.numeroVol.toUpperCase(),
      codeCompagnie: codeCompagnieClean,
      typeAvion: volForm.typeAvion || undefined,
      version: volForm.version || 'TBN',
      provenance: volForm.provenance || undefined,
      heureArrivee: volForm.heureArrivee || undefined,
      destination: volForm.destination || undefined,
      heureDepart: volForm.heureDepart || undefined,
      departLendemain: volForm.departLendemain,
      categorieVol: volForm.categorieVol,
      typeOperation: volForm.typeOperation,
      observations: volForm.observations || undefined
    }

    if (editingVol.value) {
      const volId = editingVol.value._id || editingVol.value.id
      await programmesVolAPI.updateVol(programmeId, volId, data)
      showToast('Vol modifié avec succès', 'success')
    } else {
      await programmesVolAPI.addVol(programmeId, data)
      showToast('Vol ajouté avec succès', 'success')
    }

    closeVolModal()
    await loadVols()
    // Refresh programme pour mettre à jour les stats
    await refreshSelectedProgramme()
  } catch (error) {
    console.error('[ProgrammesVol] Erreur sauvegarde vol:', error)
    showToast(error.response?.data?.message || 'Erreur lors de la sauvegarde', 'error')
  } finally {
    savingVol.value = false
  }
}

const confirmDeleteVol = (vol) => {
  volToDelete.value = vol
  showDeleteVolModal.value = true
}

const closeDeleteVolModal = () => {
  showDeleteVolModal.value = false
  volToDelete.value = null
}

const executeDeleteVol = async () => {
  try {
    const programmeId = selectedProgramme.value._id || selectedProgramme.value.id
    const volId = volToDelete.value._id || volToDelete.value.id
    await programmesVolAPI.deleteVol(programmeId, volId)
    showToast('Vol supprimé', 'success')
    closeDeleteVolModal()
    await loadVols()
    await refreshSelectedProgramme()
  } catch (error) {
    showToast(error.response?.data?.message || 'Erreur lors de la suppression', 'error')
  }
}

const refreshSelectedProgramme = async () => {
  if (!selectedProgramme.value) return
  try {
    const id = selectedProgramme.value._id || selectedProgramme.value.id
    const response = await programmesVolAPI.getById(id)
    selectedProgramme.value = response.data.data || response.data
    // Mettre à jour aussi dans la liste
    const idx = programmes.value.findIndex(p => (p._id || p.id) === id)
    if (idx !== -1) {
      programmes.value[idx] = selectedProgramme.value
    }
  } catch (error) {
    console.error('[ProgrammesVol] Erreur refresh:', error)
  }
}

// ============================================
// FORMATTERS
// ============================================

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR')
}

const getCategorieClass = (categorie) => {
  return {
    'cat-international': categorie === 'INTERNATIONAL',
    'cat-regional': categorie === 'REGIONAL',
    'cat-domestique': categorie === 'DOMESTIQUE',
    'cat-cargo': categorie === 'CARGO'
  }
}

const getStatutClass = (statut) => {
  return {
    'card-brouillon': statut === 'BROUILLON',
    'card-valide': statut === 'VALIDE',
    'card-actif': statut === 'ACTIF',
    'card-suspendu': statut === 'SUSPENDU',
    'card-termine': statut === 'TERMINE'
  }
}

const getStatutBadgeClass = (statut) => {
  return {
    'badge-brouillon': statut === 'BROUILLON',
    'badge-valide': statut === 'VALIDE',
    'badge-actif': statut === 'ACTIF',
    'badge-suspendu': statut === 'SUSPENDU',
    'badge-termine': statut === 'TERMINE'
  }
}

const showToast = (message, type = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 4000)
}

// ============================================
// PDF EXPORT
// ============================================

const openPDFExport = (programme) => {
  programmeForPDF.value = programme
  showPDFExportModal.value = true
}

const closePDFExportModal = () => {
  showPDFExportModal.value = false
  programmeForPDF.value = null
}

const onPDFSuccess = (message) => {
  showToast(message, 'success')
}

const onPDFError = (message) => {
  showToast(message, 'error')
}

// ============================================
// ARCHIVAGE GOOGLE DRIVE
// ============================================

const onProgrammeArchived = async ({ documentId, archivage }) => {
  console.log('[ProgrammesVol] Programme archivé:', documentId, archivage)
  showToast('Programme archivé dans Google Drive', 'success')

  // Rafraîchir la liste pour mettre à jour les infos d'archivage
  await loadProgrammes()

  // Si le modal détail est ouvert, rafraîchir aussi
  if (showDetailModal.value && selectedProgramme.value) {
    await refreshSelectedProgramme()
  }
}

const onArchiveError = ({ documentId, error }) => {
  console.error('[ProgrammesVol] Erreur archivage:', documentId, error)
  showToast(error || 'Erreur lors de l\'archivage', 'error')
}

// ============================================
// LIFECYCLE
// ============================================

onMounted(() => {
  loadProgrammes()
})
</script>

<style scoped>
.programmes-container {
  min-height: calc(100vh - 64px);
  background: #f9fafb;
}

.main-content {
  padding: 30px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header-bar h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Workflow indicator */
.workflow-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.workflow-step {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.step-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.workflow-arrow {
  color: #9ca3af;
  font-size: 20px;
}

/* Filters */
.filters-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.filters-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.filter-group select,
.filter-group input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  min-width: 150px;
}

/* Programmes grid */
.programmes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

.programme-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-left: 4px solid #e5e7eb;
}

.programme-card.card-brouillon { border-left-color: #9ca3af; }
.programme-card.card-valide { border-left-color: #f59e0b; }
.programme-card.card-actif { border-left-color: #10b981; }
.programme-card.card-suspendu { border-left-color: #ef4444; }
.programme-card.card-termine { border-left-color: #6b7280; }

.programme-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.programme-title h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.edition-badge {
  font-size: 12px;
  color: #6b7280;
}

.status-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.active-indicator {
  background: #10b981;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-brouillon { background: #f3f4f6; color: #4b5563; }
.badge-valide { background: #fef3c7; color: #92400e; }
.badge-actif { background: #d1fae5; color: #065f46; }
.badge-suspendu { background: #fee2e2; color: #991b1b; }
.badge-termine { background: #e5e7eb; color: #374151; }

.programme-info {
  margin-bottom: 15px;
}

.info-row {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-row .label {
  color: #6b7280;
  min-width: 90px;
}

.info-row .value {
  color: #374151;
  font-weight: 500;
}

.stats-value {
  background: #dbeafe;
  color: #1e40af;
  padding: 2px 8px;
  border-radius: 4px;
}

.compagnie-tag {
  display: inline-block;
  background: #f3f4f6;
  color: #374151;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 4px;
}

.programme-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 15px;
  border-top: 1px solid #e5e7eb;
}

.btn-action {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.btn-view { background: #dbeafe; color: #1e40af; }
.btn-edit { background: #e0e7ff; color: #3730a3; }
.btn-validate { background: #fef3c7; color: #92400e; }
.btn-activate { background: #d1fae5; color: #065f46; }
.btn-suspend { background: #fef3c7; color: #92400e; }
.btn-delete { background: #fee2e2; color: #991b1b; }

.btn-action:hover { opacity: 0.8; }

/* Empty state */
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 20px;
  color: #374151;
  margin-bottom: 10px;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 20px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-overlay-top {
  z-index: 1100;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-large {
  max-width: 700px;
}

.modal-xlarge {
  max-width: 95vw;
  width: 95vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-xlarge .modal-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.modal-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .modal-header-info {
    gap: 8px;
  }

  .modal-header-info h2 {
    font-size: 16px;
  }
}

.edition-tag {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
}

.modal-header-danger { background: #fee2e2; }
.modal-header-danger h2 { color: #991b1b; }

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
}

.modal-body { padding: 20px; }
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}

/* Detail summary */
.detail-summary {
  display: flex;
  gap: 30px;
  background: #f9fafb;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
}

.summary-value {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.summary-value.highlight {
  font-size: 24px;
  color: #1e40af;
  font-weight: 700;
}

.summary-value.highlight-total {
  font-size: 24px;
  color: #059669;
  font-weight: 700;
}

.summary-sub {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

.summary-item-editable .summary-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-edit-inline {
  background: #e0e7ff;
  border: none;
  color: #3730a3;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-edit-inline:hover {
  background: #3730a3;
  color: white;
}

@media (max-width: 640px) {
  .detail-summary {
    gap: 12px;
    padding: 12px;
  }

  .summary-item {
    min-width: calc(50% - 8px);
  }

  .summary-value.highlight,
  .summary-value.highlight-total {
    font-size: 18px;
  }

  .summary-sub {
    font-size: 10px;
  }
}

/* Vols section */
.vols-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.vols-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.vols-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

@media (max-width: 640px) {
  .vols-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .vols-header-left {
    width: 100%;
    justify-content: space-between;
  }

  .vols-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

/* Toggle vue calendrier/liste */
.view-toggle {
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 3px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  color: #374151;
}

.toggle-btn.active {
  background: white;
  color: #1e40af;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.toggle-icon {
  font-size: 14px;
}

.vols-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.filter-jour {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.filter-jour select {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 13px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

/* ============================================ */
/* VUE CALENDRIER HEBDOMADAIRE                 */
/* ============================================ */

.calendar-view {
  margin-top: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  flex: 1;
  min-height: 450px;
}

.calendar-column {
  background: #f9fafb;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  min-width: 0;
}

/* Weekend (Samedi index 6, Dimanche index 0) */
.calendar-column:last-child,
.calendar-column:nth-child(6) {
  background: #fef3c7;
  border-color: #fcd34d;
}

.calendar-column:last-child .calendar-day-header,
.calendar-column:nth-child(6) .calendar-day-header {
  background: #fcd34d;
}

.calendar-day-header {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  padding: 14px 10px;
  text-align: center;
  border-bottom: none;
}

.day-name {
  display: block;
  font-weight: 700;
  font-size: 15px;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.day-count {
  display: block;
  font-size: 12px;
  color: rgba(255,255,255,0.85);
  margin-top: 4px;
  font-weight: 500;
}

.calendar-day-content {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  min-height: 350px;
}

/* Responsive - Tablette */
@media (max-width: 1200px) {
  .calendar-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .calendar-day-content {
    min-height: 280px;
  }
}

/* Responsive - Petit écran */
@media (max-width: 900px) {
  .calendar-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .day-name {
    font-size: 13px;
  }

  .calendar-day-content {
    min-height: 250px;
    padding: 8px;
  }
}

/* Responsive - Mobile */
@media (max-width: 640px) {
  .calendar-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }

  .calendar-day-header {
    padding: 10px 6px;
  }

  .day-name {
    font-size: 12px;
  }

  .day-count {
    font-size: 10px;
  }

  .calendar-day-content {
    min-height: 200px;
    padding: 6px;
    gap: 6px;
  }

  .modal-xlarge {
    max-width: 100vw;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
}

/* Responsive - Très petit mobile */
@media (max-width: 480px) {
  .calendar-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .calendar-day-content {
    min-height: 150px;
  }
}

/* Carte vol dans calendrier */
.calendar-vol-card {
  background: white;
  border-radius: 8px;
  padding: 14px;
  border-left: 4px solid #2563eb;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: all 0.2s;
}

.calendar-vol-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.calendar-vol-card.cat-international { border-left-color: #2563eb; }
.calendar-vol-card.cat-regional { border-left-color: #10b981; }
.calendar-vol-card.cat-domestique { border-left-color: #f59e0b; }
.calendar-vol-card.cat-cargo { border-left-color: #6b7280; }

.vol-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.vol-numero {
  font-weight: 700;
  font-size: 16px;
  color: #1f2937;
}

.vol-avion {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 3px 8px;
  border-radius: 4px;
}

.vol-card-horaires {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.vol-horaire {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.horaire-label {
  font-weight: 600;
  font-size: 11px;
  color: white;
  width: 32px;
  text-align: center;
  padding: 2px 4px;
  border-radius: 3px;
  background: #3b82f6;
}

.vol-horaire:last-child .horaire-label {
  background: #10b981;
}

.horaire-value {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 15px;
  color: #1f2937;
  min-width: 50px;
}

.horaire-lieu {
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
}

.j1-mini {
  background: #fef3c7;
  color: #92400e;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 700;
  margin-left: 4px;
}

.vol-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #e5e7eb;
}

.vol-categorie {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.vol-delete-btn {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 14px;
  border-radius: 4px;
  opacity: 0.6;
  transition: all 0.2s;
}

.vol-delete-btn:hover {
  opacity: 1;
  background: #fee2e2;
}

/* Jour vide */
.calendar-empty-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 10px;
  color: #9ca3af;
  flex: 1;
}

.calendar-empty-day .empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.calendar-empty-day .empty-text {
  font-size: 13px;
  font-weight: 500;
}

/* Responsive pour les cartes vol */
@media (max-width: 900px) {
  .calendar-vol-card {
    padding: 10px;
  }

  .vol-numero {
    font-size: 14px;
  }

  .horaire-value {
    font-size: 13px;
  }

  .vol-horaire {
    gap: 6px;
  }
}

@media (max-width: 640px) {
  .calendar-vol-card {
    padding: 8px;
  }

  .vol-numero {
    font-size: 13px;
  }

  .vol-avion {
    font-size: 10px;
    padding: 2px 4px;
  }

  .horaire-label {
    font-size: 9px;
    width: 26px;
  }

  .horaire-value {
    font-size: 12px;
    min-width: 40px;
  }

  .horaire-lieu {
    font-size: 10px;
  }
}

/* Vols table */
.vols-table-container {
  overflow-x: auto;
}

.vols-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.vols-table th,
.vols-table td {
  padding: 10px 8px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.vols-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 12px;
  text-transform: uppercase;
}

.vols-table tr:hover {
  background: #f9fafb;
}

.jours-cell {
  min-width: 120px;
}

.jours-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.jour-badge {
  display: inline-block;
  background: #dbeafe;
  color: #1e40af;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
}

.numero-vol {
  font-weight: 600;
  color: #1f2937;
}

.heure-cell {
  font-family: monospace;
  color: #374151;
}

.j1-badge {
  background: #fef3c7;
  color: #92400e;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 10px;
  margin-left: 4px;
}

.categorie-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.cat-international { background: #dbeafe; color: #1e40af; }
.cat-regional { background: #d1fae5; color: #065f46; }
.cat-domestique { background: #fef3c7; color: #92400e; }
.cat-cargo { background: #e5e7eb; color: #374151; }

.actions-cell {
  white-space: nowrap;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 14px;
  border-radius: 4px;
}

.btn-edit-icon { color: #2563eb; }
.btn-edit-icon:hover { background: #dbeafe; }
.btn-delete-icon { color: #dc2626; }
.btn-delete-icon:hover { background: #fee2e2; }

.empty-vols {
  text-align: center;
  padding: 40px;
  background: #f9fafb;
  border-radius: 8px;
}

.empty-vols p {
  color: #6b7280;
  margin-bottom: 15px;
}

/* Form styles */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.required { color: #ef4444; }

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

/* Jours selector */
.jours-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.jour-checkbox {
  cursor: pointer;
}

.hidden-checkbox {
  display: none;
}

.jour-label {
  display: inline-block;
  padding: 8px 12px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
}

.jour-checkbox.active .jour-label {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.btn-select-all {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 8px;
}

.input-with-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
}

.input-with-checkbox input[type="time"] {
  flex: 1;
}

.checkbox-inline {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
}

/* Danger box */
.danger-box {
  background: #fee2e2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.danger-box strong { color: #991b1b; display: block; margin-bottom: 4px; }
.danger-box p { color: #991b1b; margin: 0; font-size: 14px; }

/* Buttons */
.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.btn-primary { background: #2563eb; color: white; }
.btn-primary:hover { background: #1d4ed8; }

.btn-secondary { background: #f3f4f6; color: #374151; }
.btn-secondary:hover { background: #e5e7eb; }

.btn-success { background: #10b981; color: white; }
.btn-warning { background: #f59e0b; color: white; }
.btn-danger { background: #ef4444; color: white; }

.btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Toast */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 2000;
}

.toast.success { background: #10b981; color: white; }
.toast.error { background: #ef4444; color: white; }

/* PDF Export */
.btn-pdf { background: #dc2626; color: white; }
.btn-pdf:hover { background: #b91c1c; }

.btn-pdf-detail {
  display: flex;
  align-items: center;
  gap: 6px;
}

.modal-pdf {
  max-width: 450px;
}

.pdf-export-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pdf-programme-info {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.pdf-programme-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.pdf-periode {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 4px 0;
}

.pdf-vols-count {
  font-size: 24px;
  font-weight: 700;
  color: #2563eb;
  margin: 0;
}

.mr-2 {
  margin-right: 0.5rem;
}
</style>

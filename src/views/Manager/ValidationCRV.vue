<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Validation CRV</h1>
      <p class="text-gray-600 mt-1">CRV en attente de validation</p>
    </div>

    <!-- Filtres -->
    <div class="card mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select v-model="filters.statut" @change="loadCRVList" class="input w-full">
            <option value="TERMINE">Soumis (en attente de validation)</option>
            <option value="VALIDE">Validé (en attente verrouillage)</option>
            <option value="VERROUILLE">Verrouillé</option>
            <option value="">Tous</option>
          </select>
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
          <input
            v-model="filters.search"
            @input="debounceSearch"
            type="text"
            placeholder="N° CRV, vol, compagnie..."
            class="input w-full"
          />
        </div>
        <button @click="loadCRVList" class="btn btn-secondary">
          Actualiser
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Liste CRV -->
    <div v-else-if="crvList.length > 0" class="space-y-4">
      <div
        v-for="crv in crvList"
        :key="crv.id || crv._id"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
        @click="selectCRV(crv)"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="font-bold text-lg">{{ crv.numeroCRV }}</span>
              <span :class="getStatutClass(crv.statut)" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ getStatutLabel(crv.statut) }}
              </span>
              <span v-if="hasRejets(crv)" class="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">↩ Rejeté</span>
              <span v-if="hasEvents(crv)" class="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">⚠ Événement</span>
            </div>
            <div class="text-gray-600 text-sm flex items-center gap-2">
              <span v-if="crv.vol" class="font-medium">{{ crv.vol.numeroVol }}</span>
              <span v-if="crv.vol" class="text-gray-400">{{ crv.vol.compagnieAerienne }}</span>
              <span v-if="crv.vol?.typeOperation" class="text-gray-400 text-xs">({{ getTypeOperationLabel(crv.vol.typeOperation) }})</span>
              <span v-if="getResponsable(crv)" class="text-xs text-blue-600">👤 {{ getResponsable(crv) }}</span>
            </div>
            <div class="text-gray-400 text-xs mt-1">
              {{ formatDate(crv.createdAt) }}
            </div>
          </div>
          <div class="flex gap-2">
            <!-- Actions rapides selon statut -->
            <template v-if="crv.statut === 'TERMINE'">
              <button
                v-if="canValidate"
                @click.stop="openValidateModal(crv)"
                class="btn btn-sm btn-success"
                :disabled="crv.completude < 80"
                :title="crv.completude < 80 ? 'Complétude insuffisante (minimum 80%)' : 'Approuver ce CRV'"
              >
                Valider
              </button>
              <button
                v-if="canReject"
                @click.stop="openRejectModal(crv)"
                class="btn btn-sm btn-warning"
                title="Renvoyer pour correction"
              >
                Rejeter
              </button>
            </template>
            <template v-else-if="crv.statut === 'VALIDE'">
              <button
                v-if="canLock"
                @click.stop="handleLock(crv)"
                class="btn btn-sm btn-primary"
                title="Finaliser ce CRV (aucune modification possible après)"
              >
                Verrouiller
              </button>
            </template>
            <template v-else-if="crv.statut === 'VERROUILLE'">
              <button
                v-if="canUnlock"
                @click.stop="openUnlockModal(crv)"
                class="btn btn-sm btn-danger"
                title="Opération exceptionnelle: déverrouiller ce CRV"
              >
                Déverrouiller
              </button>
            </template>
            <!-- Bouton Archiver Google Drive -->
            <div @click.stop>
              <ArchiveButton
                v-if="crv.statut === 'VALIDE' || crv.statut === 'VERROUILLE'"
                document-type="crv"
                :document-id="crv._id || crv.id"
                :document-name="crv.numeroCRV"
                :archivage-info="crv.archivage"
                :document-statut="crv.statut"
                :api-service="crvAPI"
                :compact="true"
                @archived="onCRVArchived"
                @error="onArchiveError"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="flex justify-center gap-2 mt-6">
        <button
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page <= 1"
          class="btn btn-sm btn-secondary"
        >
          Précédent
        </button>
        <span class="px-4 py-2 text-gray-600">
          Page {{ pagination.page }} / {{ pagination.pages }}
        </span>
        <button
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page >= pagination.pages"
          class="btn btn-sm btn-secondary"
        >
          Suivant
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="card text-center py-12">
      <div class="text-gray-400 text-6xl mb-4">📋</div>
      <h3 class="text-lg font-medium text-gray-700">Aucun CRV en attente</h3>
      <p class="text-gray-500 mt-1">
        {{ filters.statut === 'TERMINE'
          ? 'Aucun CRV terminé en attente de validation'
          : 'Aucun CRV correspondant aux critères'
        }}
      </p>
    </div>

    <!-- Fiche lecture CRV superviseur -->
    <div v-if="selectedCRV" class="modal-overlay" @click.self="closeCRVDetail">
      <div class="modal-content max-w-5xl">
        <div class="modal-header">
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-bold">{{ selectedCRV.numeroCRV }}</h2>
            <span :class="getStatutClass(selectedCRV.statut)" class="px-3 py-1 rounded-full text-sm font-medium">
              {{ getStatutLabel(selectedCRV.statut) }}
            </span>
            <span class="text-lg font-bold" :class="selectedCRV.completude >= 80 ? 'text-green-600' : 'text-orange-500'">
              {{ selectedCRV.completude }}%
            </span>
          </div>
          <button @click="closeCRVDetail" class="text-gray-400 hover:text-gray-600">
            <span class="text-2xl">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <!-- Chargement fiche complète -->
          <div v-if="ficheLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
          <div v-else-if="ficheData">
            <!-- RÉSUMÉ DÉCISIONNEL — lecture 5-10 secondes -->
            <div class="decision-summary">
              <div class="fiche-grid">
                <div class="fiche-field"><span class="fiche-label">Vol</span><span class="fiche-value">{{ ficheData.crv?.vol?.numeroVol || '-' }} — {{ ficheData.crv?.vol?.compagnieAerienne || '-' }}</span></div>
                <div class="fiche-field"><span class="fiche-label">Type</span><span class="fiche-value">{{ getTypeOperationLabel(ficheData.crv?.vol?.typeOperation) }}</span></div>
                <div class="fiche-field"><span class="fiche-label">Responsable vol</span><span class="fiche-value" :class="{ 'text-orange-500': !ficheResponsable }">{{ ficheResponsable || 'Non désigné' }}</span></div>
                <div class="fiche-field"><span class="fiche-label">Personnel</span><span class="fiche-value">{{ ficheData.crv?.personnelAffecte?.length || 0 }} agent(s)</span></div>
                <div class="fiche-field"><span class="fiche-label">Phases</span><span class="fiche-value">{{ fichePhasesSummary }}</span></div>
                <div class="fiche-field"><span class="fiche-label">Événements</span><span class="fiche-value" :class="{ 'text-red-600 font-bold': ficheData.evenements?.length > 0 }">{{ ficheData.evenements?.length || 0 }}{{ ficheData.evenements?.length > 0 ? ' ⚠' : '' }}</span></div>
              </div>
            </div>

            <!-- ALERTE REJET si rejets antérieurs -->
            <div v-if="ficheLastRejet" class="fiche-section-warning mb-4">
              <div class="text-sm font-semibold text-orange-700">↩ Rejeté {{ ficheData.crv.historiqueRejets.length }} fois — Dernier motif :</div>
              <div class="text-sm font-medium text-orange-800 mt-1">{{ ficheLastRejet.raison }}</div>
              <div class="text-xs text-orange-400 mt-0.5">{{ formatDate(ficheLastRejet.date) }}</div>
            </div>

            <!-- Section VOL -->
            <div class="fiche-section">
              <h3 class="fiche-section-title">Vol</h3>
              <div class="fiche-grid">
                <div class="fiche-field">
                  <span class="fiche-label">N° Vol</span>
                  <span class="fiche-value">{{ ficheData.crv?.vol?.numeroVol || '-' }}</span>
                </div>
                <div class="fiche-field">
                  <span class="fiche-label">Compagnie</span>
                  <span class="fiche-value">{{ ficheData.crv?.vol?.compagnieAerienne || '-' }}</span>
                </div>
                <div class="fiche-field">
                  <span class="fiche-label">Type</span>
                  <span class="fiche-value">{{ getTypeOperationLabel(ficheData.crv?.vol?.typeOperation) }}</span>
                </div>
                <div class="fiche-field">
                  <span class="fiche-label">Avion</span>
                  <span class="fiche-value">{{ ficheData.crv?.vol?.typeAvion || ficheData.crv?.vol?.avion?.typeAvion || '-' }}</span>
                </div>
                <div class="fiche-field">
                  <span class="fiche-label">Immat.</span>
                  <span class="fiche-value">{{ ficheData.crv?.vol?.avion?.immatriculation || ficheData.crv?.vol?.immatriculation || '-' }}</span>
                </div>
                <div class="fiche-field">
                  <span class="fiche-label">Poste</span>
                  <span class="fiche-value">{{ ficheData.crv?.vol?.posteStationnement || '-' }}</span>
                </div>
                <div class="fiche-field">
                  <span class="fiche-label">Origine</span>
                  <span class="fiche-value">{{ ficheData.crv?.vol?.aeroportOrigine || '-' }}</span>
                </div>
                <div class="fiche-field">
                  <span class="fiche-label">Destination</span>
                  <span class="fiche-value">{{ ficheData.crv?.vol?.aeroportDestination || '-' }}</span>
                </div>
              </div>
            </div>

            <!-- Section PERSONNEL -->
            <div class="fiche-section">
              <h3 class="fiche-section-title">
                Personnel
                <span class="fiche-count">{{ ficheData.crv?.personnelAffecte?.length || 0 }}</span>
              </h3>
              <div v-if="ficheData.crv?.personnelAffecte?.length > 0" class="fiche-table">
                <div v-for="(p, idx) in ficheData.crv.personnelAffecte" :key="idx" class="fiche-table-row">
                  <span class="font-medium">{{ p.nom }} {{ p.prenom }}</span>
                  <span class="text-gray-500 text-sm">{{ p.fonction }}</span>
                  <span v-if="p.isResponsable" class="fiche-badge-green">Responsable vol</span>
                  <span v-if="p.matricule" class="text-gray-400 text-xs">{{ p.matricule }}</span>
                </div>
              </div>
              <p v-else class="text-gray-400 text-sm italic">Aucun personnel déclaré</p>
            </div>

            <!-- Section PHASES -->
            <div class="fiche-section">
              <h3 class="fiche-section-title">
                Phases
                <span class="fiche-count">{{ ficheData.phases?.length || 0 }}</span>
              </h3>
              <div v-if="ficheData.phases?.length > 0" class="fiche-table">
                <div v-for="(ph, idx) in ficheData.phases" :key="idx" class="fiche-table-row">
                  <span class="font-medium text-sm">{{ ph.phase?.nom || ph.nom || '-' }}</span>
                  <span :class="phaseStatutClass(ph.statut)" class="text-xs px-2 py-0.5 rounded">{{ ph.statut }}</span>
                  <span v-if="ph.heureDebutReelle" class="text-gray-500 text-xs">
                    {{ formatTime(ph.heureDebutReelle) }}
                    <span v-if="ph.heureFinReelle"> → {{ formatTime(ph.heureFinReelle) }}</span>
                  </span>
                </div>
              </div>
              <p v-else class="text-gray-400 text-sm italic">Aucune phase</p>
            </div>

            <!-- Section ENGINS -->
            <div class="fiche-section">
              <h3 class="fiche-section-title">
                Engins
                <span class="fiche-count">{{ ficheData.engins?.length || 0 }}</span>
              </h3>
              <div v-if="ficheData.engins?.length > 0" class="fiche-table">
                <div v-for="(e, idx) in ficheData.engins" :key="idx" class="fiche-table-row">
                  <span class="font-medium text-sm">{{ e.engin?.typeEngin || e.type || '-' }}</span>
                  <span class="text-gray-500 text-sm">{{ e.engin?.numeroEngin || e.immatriculation || '-' }}</span>
                  <span v-if="e.usage" class="text-gray-400 text-xs">{{ e.usage }}</span>
                </div>
              </div>
              <p v-else class="text-gray-400 text-sm italic">Aucun engin déclaré</p>
            </div>

            <!-- Section CHARGES -->
            <div class="fiche-section">
              <h3 class="fiche-section-title">
                Charges
                <span class="fiche-count">{{ ficheData.charges?.length || 0 }}</span>
                <span v-if="ficheData.crv?.confirmationAucuneCharge" class="fiche-badge-blue">Aucune charge déclarée</span>
              </h3>
              <div v-if="ficheData.charges?.length > 0" class="fiche-table">
                <div v-for="(c, idx) in ficheData.charges" :key="idx" class="fiche-table-row">
                  <span class="font-medium text-sm">{{ c.typeCharge }}</span>
                  <span class="text-gray-500 text-sm">{{ c.sensOperation }}</span>
                  <span v-if="c.passagersAdultes" class="text-xs text-gray-400">PAX: {{ c.passagersAdultes }}</span>
                  <span v-if="c.poidsTotal" class="text-xs text-gray-400">{{ c.poidsTotal }} kg</span>
                </div>
              </div>
              <p v-else-if="!ficheData.crv?.confirmationAucuneCharge" class="text-gray-400 text-sm italic">Aucune charge saisie</p>
            </div>

            <!-- Section ÉVÉNEMENTS -->
            <div class="fiche-section">
              <h3 class="fiche-section-title">
                Événements
                <span class="fiche-count">{{ ficheData.evenements?.length || 0 }}</span>
              </h3>
              <div v-if="ficheData.evenements?.length > 0" class="fiche-table">
                <div v-for="(ev, idx) in ficheData.evenements" :key="idx" class="fiche-table-row">
                  <span :class="ev.gravite === 'CRITIQUE' ? 'text-red-600 font-bold' : ev.gravite === 'MAJEUR' ? 'text-orange-600 font-medium' : ''" class="text-sm">
                    {{ ev.typeEvenement }}
                  </span>
                  <span class="text-xs px-2 py-0.5 rounded" :class="ev.gravite === 'CRITIQUE' ? 'bg-red-100 text-red-800' : ev.gravite === 'MAJEUR' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'">
                    {{ ev.gravite }}
                  </span>
                  <span class="text-gray-500 text-xs truncate max-w-[200px]">{{ ev.description }}</span>
                </div>
              </div>
              <p v-else class="text-gray-400 text-sm italic">Aucun événement (vol nominal)</p>
            </div>

            <!-- Section OBSERVATIONS -->
            <div v-if="ficheData.observations?.length > 0" class="fiche-section">
              <h3 class="fiche-section-title">
                Observations
                <span class="fiche-count">{{ ficheData.observations.length }}</span>
              </h3>
              <div class="fiche-table">
                <div v-for="(obs, idx) in ficheData.observations" :key="idx" class="fiche-table-row">
                  <span class="text-sm">{{ obs.contenu || obs.texte || '-' }}</span>
                  <span class="text-gray-400 text-xs">{{ formatDate(obs.dateHeure) }}</span>
                </div>
              </div>
            </div>

            <!-- Section HISTORIQUE REJETS -->
            <div v-if="ficheData.crv?.historiqueRejets?.length > 0" class="fiche-section fiche-section-warning">
              <h3 class="fiche-section-title text-orange-700">
                Historique des rejets
                <span class="fiche-count bg-orange-100 text-orange-700">{{ ficheData.crv.historiqueRejets.length }}</span>
              </h3>
              <div class="fiche-table">
                <div v-for="(r, idx) in ficheData.crv.historiqueRejets" :key="idx" class="fiche-table-row">
                  <span class="text-sm font-medium text-orange-700">{{ r.raison }}</span>
                  <span class="text-gray-400 text-xs">{{ formatDate(r.date) }}</span>
                </div>
              </div>
            </div>

            <!-- Historique validation -->
            <div v-if="validationStatus?.historique?.length" class="fiche-section">
              <h3 class="fiche-section-title">Historique validation</h3>
              <div class="fiche-table">
                <div v-for="(action, idx) in validationStatus.historique" :key="idx" class="fiche-table-row">
                  <span class="font-medium text-sm">{{ action.action }}</span>
                  <span class="text-gray-500 text-xs">{{ formatDate(action.date) }}</span>
                  <span v-if="action.commentaires" class="text-gray-400 text-xs">{{ action.commentaires }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions superviseur -->
          <div class="flex gap-3 justify-end mt-6 pt-4 border-t">
            <button @click="downloadPDF(selectedCRV)" class="btn btn-secondary" title="Télécharger le PDF">
              📄 PDF
            </button>
            <template v-if="selectedCRV.statut === 'TERMINE'">
              <button
                v-if="canValidate"
                @click="openValidateModal(selectedCRV)"
                class="btn btn-success"
                :disabled="selectedCRV.completude < 80"
              >
                Valider
              </button>
              <button
                v-if="canReject"
                @click="openRejectModal(selectedCRV)"
                class="btn btn-warning"
              >
                Rejeter
              </button>
            </template>
            <template v-else-if="selectedCRV.statut === 'VALIDE'">
              <button v-if="canLock" @click="handleLock(selectedCRV)" class="btn btn-primary">Verrouiller</button>
            </template>
            <template v-else-if="selectedCRV.statut === 'VERROUILLE'">
              <button v-if="canUnlock" @click="openUnlockModal(selectedCRV)" class="btn btn-danger">Déverrouiller</button>
            </template>
            <ArchiveButton
              v-if="selectedCRV.statut === 'VALIDE' || selectedCRV.statut === 'VERROUILLE'"
              document-type="crv"
              :document-id="selectedCRV._id || selectedCRV.id"
              :document-name="selectedCRV.numeroCRV"
              :archivage-info="selectedCRV.archivage"
              :document-statut="selectedCRV.statut"
              :api-service="crvAPI"
              @archived="onCRVArchived"
              @error="onArchiveError"
            />
            <button @click="closeCRVDetail" class="btn btn-secondary">Fermer</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Validation -->
    <div v-if="showValidateModal" class="modal-overlay" @click.self="closeValidateModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="text-xl font-bold">Valider le CRV</h2>
          <button @click="closeValidateModal" class="text-gray-400 hover:text-gray-600">
            <span class="text-2xl">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <p class="text-gray-600 mb-4">
            Vous êtes sur le point de valider le CRV <strong>{{ crvToAction?.numeroCRV }}</strong>.
          </p>
          <p class="text-sm text-gray-500 mb-4">
            Ce CRV sera marqué comme validé et prêt pour verrouillage.
          </p>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Commentaires (optionnel)</label>
            <textarea
              v-model="actionComment"
              class="input w-full"
              rows="3"
              placeholder="Commentaires de validation..."
            ></textarea>
          </div>
          <div class="flex gap-3 justify-end">
            <button @click="closeValidateModal" class="btn btn-secondary">Annuler</button>
            <button @click="handleValidate" class="btn btn-success" :disabled="saving">
              {{ saving ? 'Validation...' : 'Confirmer la validation' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Rejet -->
    <div v-if="showRejectModal" class="modal-overlay" @click.self="closeRejectModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="text-xl font-bold">Rejeter le CRV</h2>
          <button @click="closeRejectModal" class="text-gray-400 hover:text-gray-600">
            <span class="text-2xl">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <p class="text-gray-600 mb-4">
            Vous êtes sur le point de rejeter le CRV <strong>{{ crvToAction?.numeroCRV }}</strong>.
          </p>
          <p class="text-sm text-gray-500 mb-4">
            Raison du rejet (obligatoire) - Le CRV retournera en cours pour correction.
          </p>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Indiquez les éléments à corriger <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="actionComment"
              class="input w-full"
              rows="4"
              placeholder="Décrivez les corrections à apporter..."
              required
            ></textarea>
            <p v-if="rejectError" class="text-red-500 text-sm mt-1">{{ rejectError }}</p>
          </div>
          <div class="flex gap-3 justify-end">
            <button @click="closeRejectModal" class="btn btn-secondary">Annuler</button>
            <button @click="handleReject" class="btn btn-warning" :disabled="saving || !actionComment.trim()">
              {{ saving ? 'Rejet...' : 'Confirmer le rejet' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Déverrouillage -->
    <div v-if="showUnlockModal" class="modal-overlay" @click.self="closeUnlockModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="text-xl font-bold text-red-600">Déverrouiller le CRV</h2>
          <button @click="closeUnlockModal" class="text-gray-400 hover:text-gray-600">
            <span class="text-2xl">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p class="text-red-700 font-medium">Opération exceptionnelle</p>
            <p class="text-red-600 text-sm mt-1">
              Le déverrouillage d'un CRV est une opération sensible réservée aux administrateurs.
              Cette action sera enregistrée dans l'historique d'audit.
            </p>
          </div>
          <p class="text-gray-600 mb-4">
            CRV concerné: <strong>{{ crvToAction?.numeroCRV }}</strong>
          </p>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Justification pour l'audit <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="actionComment"
              class="input w-full"
              rows="4"
              placeholder="Raison du déverrouillage (sera conservée pour l'audit)..."
              required
            ></textarea>
            <p v-if="unlockError" class="text-red-500 text-sm mt-1">{{ unlockError }}</p>
          </div>
          <div class="flex gap-3 justify-end">
            <button @click="closeUnlockModal" class="btn btn-secondary">Annuler</button>
            <button @click="handleUnlock" class="btn btn-danger" :disabled="saving || !actionComment.trim()">
              {{ saving ? 'Déverrouillage...' : 'Confirmer le déverrouillage' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast notifications -->
    <div v-if="toast.show" :class="toastClass" class="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
/**
 * ValidationCRV.vue - Page de validation des CRV
 *
 * CONFORME À: docs/process/MVS-10-Validation/FRONT-CORRECTIONS.md
 *
 * Permissions (MVS-10):
 * - Valider CRV: QUALITE, ADMIN uniquement (prérequis: complétude >= 80%)
 * - Rejeter CRV: QUALITE, ADMIN uniquement (commentaire obligatoire)
 * - Verrouiller CRV: QUALITE, ADMIN uniquement (prérequis: statut VALIDE)
 * - Déverrouiller CRV: ADMIN uniquement (raison obligatoire)
 */

import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { crvAPI, validationAPI } from '@/services/api'
import { canValidateCRV, canRejectCRV, canLockCRV, canUnlockCRV } from '@/utils/permissions'
import { STATUT_CRV_LABELS, TYPE_OPERATION_LABELS } from '@/config/crvEnums'
import ArchiveButton from '@/components/Common/ArchiveButton.vue'

// Stores
const authStore = useAuthStore()

// State
const loading = ref(false)
const saving = ref(false)
const crvList = ref([])
const selectedCRV = ref(null)
const validationStatus = ref(null)
const ficheData = ref(null)
const ficheLoading = ref(false)
const pagination = ref({ page: 1, pages: 1, total: 0 })

// Filtres
const filters = ref({
  statut: 'TERMINE',
  search: ''
})

// Modals
const showValidateModal = ref(false)
const showRejectModal = ref(false)
const showUnlockModal = ref(false)
const crvToAction = ref(null)
const actionComment = ref('')
const rejectError = ref('')
const unlockError = ref('')

// Toast
const toast = ref({ show: false, message: '', type: 'success' })

// Computed
const userRole = computed(() => authStore.user?.fonction || authStore.user?.role)
const canValidate = computed(() => canValidateCRV(userRole.value))
const canReject = computed(() => canRejectCRV(userRole.value))
const canLock = computed(() => canLockCRV(userRole.value))
const canUnlock = computed(() => canUnlockCRV(userRole.value))

const toastClass = computed(() => ({
  'bg-green-500 text-white': toast.value.type === 'success',
  'bg-red-500 text-white': toast.value.type === 'error',
  'bg-orange-500 text-white': toast.value.type === 'warning'
}))

// Helpers liste — signaux visuels
function hasEvents(crv) {
  return crv.evenements?.length > 0 || crv.nbEvenements > 0
}
function hasRejets(crv) {
  return crv.historiqueRejets?.length > 0
}
function getResponsable(crv) {
  const resp = crv.personnelAffecte?.find(p => p.isResponsable)
  return resp ? `${resp.nom} ${resp.prenom}` : null
}

// Helpers fiche — résumé décisionnel
const ficheResponsable = computed(() => {
  const resp = ficheData.value?.crv?.personnelAffecte?.find(p => p.isResponsable)
  return resp ? `${resp.nom} ${resp.prenom} (${resp.fonction})` : null
})
const fichePhasesSummary = computed(() => {
  const phases = ficheData.value?.phases
  if (!phases?.length) return '0'
  const done = phases.filter(p => p.statut === 'TERMINE' || p.statut === 'NON_REALISE').length
  return `${done}/${phases.length} traitées`
})
const ficheLastRejet = computed(() => {
  const rejets = ficheData.value?.crv?.historiqueRejets
  return rejets?.length > 0 ? rejets[rejets.length - 1] : null
})

// Methods
function getStatutLabel(statut) {
  return STATUT_CRV_LABELS[statut] || statut
}

function getTypeOperationLabel(type) {
  return TYPE_OPERATION_LABELS[type] || type || '-'
}

function getStatutClass(statut) {
  const classes = {
    'TERMINE': 'bg-blue-100 text-blue-800',
    'VALIDE': 'bg-green-100 text-green-800',
    'VERROUILLE': 'bg-gray-100 text-gray-800',
    'EN_COURS': 'bg-yellow-100 text-yellow-800',
    'BROUILLON': 'bg-gray-100 text-gray-600',
    'ANNULE': 'bg-red-100 text-red-800'
  }
  return classes[statut] || 'bg-gray-100 text-gray-800'
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

let searchTimeout = null
function debounceSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadCRVList()
  }, 300)
}

async function loadCRVList() {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: 20
    }
    if (filters.value.statut) {
      params.statut = filters.value.statut
    }
    if (filters.value.search) {
      params.search = filters.value.search
    }

    const response = await crvAPI.getAll(params)
    const data = response.data.data || response.data
    crvList.value = Array.isArray(data) ? data : (data.data || [])
    pagination.value = {
      page: data.page || data.pagination?.page || 1,
      pages: data.pages || data.pagination?.pages || 1,
      total: data.total || data.pagination?.total || 0
    }
  } catch (error) {
    console.error('[ValidationCRV] Erreur chargement:', error)
    showToast('Erreur lors du chargement des CRV', 'error')
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  if (page >= 1 && page <= pagination.value.pages) {
    pagination.value.page = page
    loadCRVList()
  }
}

async function selectCRV(crv) {
  selectedCRV.value = crv
  ficheData.value = null
  ficheLoading.value = true

  try {
    // Charger les données complètes du CRV (vol, phases, charges, engins, événements, observations)
    const [crvResponse, validResponse] = await Promise.allSettled([
      crvAPI.getById(crv.id || crv._id),
      validationAPI.getStatus(crv.id || crv._id)
    ])

    if (crvResponse.status === 'fulfilled') {
      ficheData.value = crvResponse.value.data.data || crvResponse.value.data
    }
    if (validResponse.status === 'fulfilled') {
      validationStatus.value = validResponse.value.data.data || validResponse.value.data
    } else {
      validationStatus.value = null
    }
  } catch (error) {
    console.error('[ValidationCRV] Erreur chargement fiche:', error)
  } finally {
    ficheLoading.value = false
  }
}

function closeCRVDetail() {
  selectedCRV.value = null
  validationStatus.value = null
  ficheData.value = null
}

function formatTime(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function phaseStatutClass(statut) {
  const classes = {
    'TERMINE': 'bg-green-100 text-green-700',
    'EN_COURS': 'bg-yellow-100 text-yellow-700',
    'NON_COMMENCE': 'bg-gray-100 text-gray-500',
    'NON_REALISE': 'bg-purple-100 text-purple-700'
  }
  return classes[statut] || 'bg-gray-100 text-gray-500'
}

async function downloadPDF(crv) {
  const crvId = crv?.id || crv?._id
  if (!crvId) return
  try {
    const response = await crvAPI.getPDFBase64(crvId)
    const data = response.data.data || response.data
    const { base64, mimeType } = data
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const blob = new Blob([new Uint8Array(byteNumbers)], { type: mimeType || 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `CRV_${crv.numeroCRV || crvId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (err) {
    showToast('Erreur génération PDF', 'error')
  }
}

// Modal handlers
function openValidateModal(crv) {
  crvToAction.value = crv
  actionComment.value = ''
  showValidateModal.value = true
}

function closeValidateModal() {
  showValidateModal.value = false
  crvToAction.value = null
  actionComment.value = ''
}

function openRejectModal(crv) {
  crvToAction.value = crv
  actionComment.value = ''
  rejectError.value = ''
  showRejectModal.value = true
}

function closeRejectModal() {
  showRejectModal.value = false
  crvToAction.value = null
  actionComment.value = ''
  rejectError.value = ''
}

function openUnlockModal(crv) {
  crvToAction.value = crv
  actionComment.value = ''
  unlockError.value = ''
  showUnlockModal.value = true
}

function closeUnlockModal() {
  showUnlockModal.value = false
  crvToAction.value = null
  actionComment.value = ''
  unlockError.value = ''
}

// Actions
async function handleValidate() {
  if (!crvToAction.value) return

  saving.value = true
  try {
    const crvId = crvToAction.value.id || crvToAction.value._id
    await validationAPI.valider(crvId, actionComment.value || null)
    showToast('CRV validé avec succès', 'success')
    closeValidateModal()
    closeCRVDetail()
    loadCRVList()
  } catch (error) {
    console.error('[ValidationCRV] Erreur validation:', error)
    showToast(error.response?.data?.message || 'Erreur lors de la validation', 'error')
  } finally {
    saving.value = false
  }
}

async function handleReject() {
  if (!crvToAction.value) return

  if (!actionComment.value.trim()) {
    rejectError.value = 'Le commentaire est obligatoire pour rejeter un CRV'
    return
  }

  saving.value = true
  try {
    const crvId = crvToAction.value.id || crvToAction.value._id
    // POST /api/validation/:id/rejeter — TERMINE → EN_COURS
    await validationAPI.rejeter(crvId, actionComment.value)
    showToast('CRV renvoyé pour correction', 'warning')
    closeRejectModal()
    closeCRVDetail()
    loadCRVList()
  } catch (error) {
    console.error('[ValidationCRV] Erreur rejet:', error)
    showToast(error.response?.data?.message || 'Erreur lors du rejet', 'error')
  } finally {
    saving.value = false
  }
}

async function handleLock(crv) {
  const crvToLock = crv || crvToAction.value
  if (!crvToLock) return

  if (!confirm('Le CRV sera définitif. Aucune modification possible après. Continuer ?')) {
    return
  }

  saving.value = true
  try {
    const crvId = crvToLock.id || crvToLock._id
    await validationAPI.verrouiller(crvId)
    showToast('CRV verrouillé définitivement', 'success')
    closeCRVDetail()
    loadCRVList()
  } catch (error) {
    console.error('[ValidationCRV] Erreur verrouillage:', error)
    showToast(error.response?.data?.message || 'Erreur lors du verrouillage', 'error')
  } finally {
    saving.value = false
  }
}

async function handleUnlock() {
  if (!crvToAction.value) return

  if (!actionComment.value.trim()) {
    unlockError.value = 'La raison est obligatoire pour déverrouiller un CRV'
    return
  }

  saving.value = true
  try {
    const crvId = crvToAction.value.id || crvToAction.value._id
    await validationAPI.deverrouiller(crvId, actionComment.value)
    showToast('CRV déverrouillé - retour au statut VALIDE', 'warning')
    closeUnlockModal()
    closeCRVDetail()
    loadCRVList()
  } catch (error) {
    console.error('[ValidationCRV] Erreur déverrouillage:', error)
    showToast(error.response?.data?.message || 'Erreur lors du déverrouillage', 'error')
  } finally {
    saving.value = false
  }
}

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 4000)
}

// Archivage Google Drive
async function onCRVArchived({ documentId, archivage }) {
  console.log('[ValidationCRV] CRV archivé:', documentId, archivage)
  showToast('CRV archivé dans Google Drive', 'success')
  // Rafraîchir la liste pour mettre à jour les infos d'archivage
  await loadCRVList()
  // Rafraîchir le CRV sélectionné si ouvert
  if (selectedCRV.value && (selectedCRV.value._id === documentId || selectedCRV.value.id === documentId)) {
    await selectCRV(selectedCRV.value)
  }
}

function onArchiveError({ documentId, error }) {
  console.error('[ValidationCRV] Erreur archivage:', documentId, error)
  showToast(error || 'Erreur lors de l\'archivage', 'error')
}

// Lifecycle
onMounted(() => {
  loadCRVList()
})

// Watch filters
watch(() => filters.value.statut, () => {
  pagination.value.page = 1
  loadCRVList()
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto;
}

.modal-header {
  @apply flex justify-between items-center p-4 border-b;
}

.modal-body {
  @apply p-4;
}

.card {
  @apply bg-white rounded-lg shadow p-4;
}

.input {
  @apply border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}

.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
}

.btn-sm {
  @apply px-3 py-1 text-sm;
}

.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
}

.btn-success {
  @apply bg-green-600 text-white hover:bg-green-700;
}

.btn-warning {
  @apply bg-orange-500 text-white hover:bg-orange-600;
}

.btn-danger {
  @apply bg-red-600 text-white hover:bg-red-700;
}

.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* Fiche lecture superviseur */
.fiche-section {
  @apply mb-4 pb-3 border-b border-gray-100;
}

.fiche-section:last-of-type {
  @apply border-b-0;
}

.fiche-section-warning {
  @apply bg-orange-50 rounded-lg p-3 border border-orange-200;
}

.fiche-section-title {
  @apply text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2;
}

.fiche-count {
  @apply bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full;
}

.fiche-grid {
  @apply grid grid-cols-4 gap-x-4 gap-y-2;
}

.fiche-field {
  @apply flex flex-col;
}

.fiche-label {
  @apply text-xs text-gray-400;
}

.fiche-value {
  @apply text-sm font-medium text-gray-800;
}

.fiche-table {
  @apply space-y-1;
}

.fiche-table-row {
  @apply flex items-center gap-3 py-1.5 px-2 bg-gray-50 rounded text-sm;
}

.fiche-badge-green {
  @apply bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium;
}

.fiche-badge-blue {
  @apply bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium;
}

/* Résumé décisionnel */
.decision-summary {
  @apply bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200;
}
</style>

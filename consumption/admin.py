# src/consumption/admin.py
from django.contrib import admin
from .models import Compteur, Releve, Consommation, Historique, PartieCommune

# Enregistrement de PartieCommune
@admin.register(PartieCommune)
class PartieCommuneAdmin(admin.ModelAdmin):
    list_display = ('nom', 'surface')
    search_fields = ('nom',)

# Enregistrement de Compteur
@admin.register(Compteur)
class CompteurAdmin(admin.ModelAdmin):
    list_display = ('reference', 'type_compteur', 'partie_commune', 'date_installation', 'etat_compteur')
    list_filter = ('type_compteur', 'etat_compteur', 'partie_commune')
    search_fields = ('reference', 'localisation')

# Enregistrement de Releve
@admin.register(Releve)
class ReleveAdmin(admin.ModelAdmin):
    list_display = ('compteur', 'valeur', 'date_releve', 'methode_releve', 'est_corrige')
    list_filter = ('methode_releve', 'est_corrige', 'compteur__partie_commune')
    search_fields = ('compteur__reference',)

# Enregistrement de Consommation
@admin.register(Consommation)
class ConsommationAdmin(admin.ModelAdmin):
    list_display = ('periode', 'valeur_consommee', 'cout', 'date_debut', 'date_fin', 'partie_commune')
    list_filter = ('periode', 'partie_commune')
    date_hierarchy = 'date_debut'

# Enregistrement de l'Historique
@admin.register(Historique)
class HistoriqueAdmin(admin.ModelAdmin):
    list_display = ('action', 'date_action', 'utilisateur')
    readonly_fields = ('action', 'date_action', 'utilisateur')
    list_filter = ('date_action',)
# src/claims/admin.py
from django.contrib import admin
from .models import Reclamation, Intervention

@admin.register(Reclamation)
class ReclamationAdmin(admin.ModelAdmin):
    list_display = ('id', 'resident', 'statut', 'niveau_priorite', 'date_soumission')
    list_filter = ('statut', 'niveau_priorite')
    list_editable = ('statut', 'niveau_priorite')

@admin.register(Intervention)
class InterventionAdmin(admin.ModelAdmin):
    list_display = ('reclamation', 'technicien', 'date_intervention')
    list_filter = ('technicien',)
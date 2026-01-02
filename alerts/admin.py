# src/alerts/admin.py
from django.contrib import admin
from .models import SeuilAlerte, Alerte

@admin.register(SeuilAlerte)
class SeuilAlerteAdmin(admin.ModelAdmin):
    list_display = ('type_alerte', 'valeur_seuil', 'compteur', 'date_creation')
    list_filter = ('type_alerte', 'compteur')

@admin.register(Alerte)
class AlerteAdmin(admin.ModelAdmin):
    list_display = ('seuil', 'compteur', 'date_detection', 'est_traitee')
    list_filter = ('est_traitee', 'date_detection')
    actions = ['mark_as_traitee']
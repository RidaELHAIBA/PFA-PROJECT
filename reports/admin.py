# src/reports/admin.py
from django.contrib import admin
from .models import Rapport, StatistiqueConsommation

@admin.register(Rapport)
class RapportAdmin(admin.ModelAdmin):
    list_display = ('type_rapport', 'format_export', 'date_generation')
    list_filter = ('format_export',)

@admin.register(StatistiqueConsommation)
class StatistiqueConsommationAdmin(admin.ModelAdmin):
    list_display = ('periode', 'partie_commune', 'valeur_moyenne', 'date_calcul')
    list_filter = ('periode', 'partie_commune')
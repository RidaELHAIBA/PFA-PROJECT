from django.db import models
from consumption.models import PartieCommune

class StatistiqueConsommation(models.Model):
    """
    Modèle StatistiqueConsommation (Diagramme de Packages). 
    Stocke les données agrégées pour éviter de recalculer constamment.
    """
    id = models.AutoField(primary_key=True)
    periode = models.CharField(max_length=50) # Ex: "2025-12"
    valeur_moyenne = models.FloatField()
    valeur_maximale = models.FloatField()
    cout_total = models.FloatField()
    
    # Relation : Les statistiques sont généralement liées à une partie commune
    partie_commune = models.ForeignKey(PartieCommune, on_delete=models.CASCADE, related_name='statistiques')
    date_calcul = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        # Assure l'unicité des stats par période et par partie commune
        unique_together = ('periode', 'partie_commune')

    def __str__(self):
        return f"Stats {self.periode} - {self.partie_commune.nom}"

class Rapport(models.Model):
    """
    Modèle Rapport (Diagramme de Packages). 
    Enregistre les détails de la génération d'un rapport exporté.
    """
    FORMAT_CHOICES = [
        ('PDF', 'PDF'),
        ('EXCEL', 'Excel'),
    ]

    id = models.AutoField(primary_key=True)
    type_rapport = models.CharField(max_length=100) # Ex: "Consommation Mensuelle"
    format_export = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    date_generation = models.DateTimeField(auto_now_add=True)
    
    # La relation est implicite : un rapport utilise plusieurs statistiques
    statistiques_incluses = models.ManyToManyField(StatistiqueConsommation)
    
    # Chemin vers le fichier généré (stocké temporairement)
    fichier_chemin = models.CharField(max_length=255, null=True, blank=True) 

    def __str__(self):
        return f"Rapport {self.type_rapport} ({self.format_export}) du {self.date_generation.date()}"
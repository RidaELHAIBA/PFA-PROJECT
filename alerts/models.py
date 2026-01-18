from django.db import models
from consumption.models import Compteur # Alerte concerne un Compteur

class SeuilAlerte(models.Model):
    """
    Modèle SeuilAlerte. Gère les alertes et les seuils paramétrables par le syndic[cite: 16].
    """
    TYPE_CHOICES = [
        ('SURCONS', 'Surconsommation'),
        ('ANOMALIE_RELEVE', 'Incohérence de relevé'),
    ]
    
    id = models.AutoField(primary_key=True)
    type_alerte = models.CharField(max_length=50, choices=TYPE_CHOICES, default='SURCONS')
    valeur_seuil = models.FloatField(help_text="Valeur absolue ou pourcentage de dépassement.")
    
    # Relation : Le seuil peut être lié à un Compteur spécifique (ou global si null)
    compteur = models.ForeignKey(Compteur, on_delete=models.SET_NULL, null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Seuil {self.type_alerte} - {self.valeur_seuil}"

# src/alerts/models.py
class Alerte(models.Model):
    id = models.AutoField(primary_key=True)
    seuil = models.ForeignKey('alerts.SeuilAlerte', on_delete=models.SET_NULL, null=True)
    description = models.TextField()
    date_detection = models.DateTimeField(auto_now_add=True)
    est_traitee = models.BooleanField(default=False)
    compteur = models.ForeignKey('consumption.Compteur', on_delete=models.CASCADE, related_name='alertes')

    def __str__(self):
        return f"Alerte sur {self.compteur.reference} ({'Traitée' if self.est_traitee else 'Ouverte'})"
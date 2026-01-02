from django.db import models
from users.models import Resident, TechnicienMaintenance 
from consumption.models import Compteur 

# Énumération pour la priorité de la réclamation (Diagramme 2.2.4)
class NiveauPriorite(models.TextChoices):
    BASSE = 'BASSE', 'Basse'
    MOYENNE = 'MOYENNE', 'Moyenne'
    HAUTE = 'HAUTE', 'Haute'
    CRITIQUE = 'CRITIQUE', 'Critique'

# Énumération pour le statut de la réclamation (pour le flux 2.3.3)
class StatutReclamation(models.TextChoices):
    OUVERTE = 'OUVERTE', 'Ouverte'
    EN_COURS = 'EN_COURS', 'En Cours'
    RESOLUE = 'RESOLUE', 'Résolue'
    REJETEE = 'REJETEE', 'Rejetée'


class Reclamation(models.Model):
    """
    Modèle Reclamation (Diagramme 2.2.4)
    Contient le statut, la description et le niveau d'urgence.
    """
    id = models.AutoField(primary_key=True)
    
    # Attributs principaux
    description = models.TextField() 
    date_soumission = models.DateTimeField(auto_now_add=True)
    
    # --- CHAMP CORRIGÉ PRÉCÉDEMMENT AJOUTÉ ---
    type_reclamation = models.CharField(max_length=50, default='Électricité')
    # ----------------------------

    # Le niveau de priorité (urgence)
    niveau_priorite = models.CharField(
        max_length=10, 
        choices=NiveauPriorite.choices, 
        default=NiveauPriorite.MOYENNE
    ) 
    
    # Le statut actuel dans le flux de travail
    statut = models.CharField(
        max_length=10, 
        choices=StatutReclamation.choices, 
        default=StatutReclamation.OUVERTE
    )
    
    # Relation : soumise par un Resident
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name='reclamations') 
    
    # Le Compteur/Equipement concerné 
    compteur_concerne = models.ForeignKey(Compteur, on_delete=models.SET_NULL, null=True, blank=True) 

    def __str__(self):
        return f"Réclamation {self.id} par {self.resident.email} - Statut: {self.statut}"


class Intervention(models.Model):
    """
    Modèle Intervention (Diagramme 2.2.4)
    La résolution peut nécessiter une Intervention, effectuée par un Technicien.
    """
    id = models.AutoField(primary_key=True)
    
    date_intervention = models.DateTimeField()
    rapport = models.TextField(blank=True, null=True, help_text="Description détaillée...")
    
    # Relations
    # L'intervention est liée à une seule réclamation
    reclamation = models.OneToOneField(Reclamation, on_delete=models.CASCADE, related_name='intervention') 
    
    # L'intervention est effectuée par un Technicien Maintenance
    technicien = models.ForeignKey(TechnicienMaintenance, on_delete=models.SET_NULL, null=True) 
    
    def __str__(self):
        return f"Intervention {self.id} sur Réclamation {self.reclamation.id}"
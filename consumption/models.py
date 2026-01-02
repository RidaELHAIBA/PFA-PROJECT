# src/consumption/models.py
from django.db import models
from users.models import Utilisateur # Import pour lier l'historique à l'utilisateur

# --- 1. Infrastructure (Modèle PartieCommune pour la relation) ---
# Dans un projet réel, cette classe serait dans l'application 'infrastructure'.
# Nous la définissons ici temporairement pour satisfaire la relation UML.

class PartieCommune(models.Model):
    # Basé sur le Diagramme de Packages (Infrastructure) et Diagramme de Classes 2.2.2 implicite
    id = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=100) # Attribut 'nom:string' [cite: 92]
    surface = models.FloatField(default=0.0) # Attribut 'surface:float' [cite: 93]
    
    # Méthodes (calculerChargesFrom() serait implémenté dans le manager ou une méthode de classe)
    
    def __str__(self):
        return self.nom

# --- 2. Classes de Consommation et Historique (Diagramme 2.2.2) ---

class Compteur(models.Model):
    """
    Modèle Compteur [cite: 60]
    """
    id = models.AutoField(primary_key=True)
    reference = models.CharField(max_length=50, unique=True) # Attribut 'reference:string' [cite: 105]
    localisation = models.CharField(max_length=255) # Attribut 'localisation:string' [cite: 106]
    date_installation = models.DateField() # Attribut 'dateInstallation:date' [cite: 107]
    type_compteur = models.CharField(max_length=50) # Attribut 'typeCompteur:string' [cite: 108]
    etat_compteur = models.CharField(max_length=50) # Attribut 'etatCompteur:string' [cite: 109]
    seuil_alerte = models.FloatField(default=200.0)
    
    # Relation (Compteur concerne une PartieCommune)
    partie_commune = models.ForeignKey(PartieCommune, on_delete=models.CASCADE, related_name='compteurs')
    
    # Méthodes (obtenirDerniereValeur(), calculerConsommation(), verifierEtat() seront implémentées ou gérées par l'API/services)
    
    def __str__(self):
        return self.reference

class Releve(models.Model):
    """
    Modèle Releve [cite: 61]
    Un Compteur enregistre plusieurs Releves [cite: 138]
    """
    id = models.AutoField(primary_key=True)
    compteur = models.ForeignKey(Compteur, on_delete=models.CASCADE, related_name='releves') # Relation "mesure" [cite: 77]
    valeur = models.FloatField() # Attribut 'valeur:float' [cite: 125]
    date_releve = models.DateTimeField() # Attribut 'dateReleve:datetime' [cite: 126]
    methode_releve = models.CharField(max_length=50) # Attribut 'methodeReleve:string' [cite: 127]
    commentaire = models.TextField(blank=True, null=True) # Attribut 'commentaire:string' [cite: 128]
    est_corrige = models.BooleanField(default=False) # Attribut 'estCorrige:boolean' [cite: 129]
    
    # Contrainte pour s'assurer qu'il n'y a qu'un relevé par compteur à un instant T
    class Meta:
        ordering = ['-date_releve']
        unique_together = ('compteur', 'date_releve') 
    
    def __str__(self):
        return f"Relevé {self.valeur} de {self.compteur.reference}"

class Consommation(models.Model):
    """
    Modèle Consommation [cite: 73]
    La Consommation est agrégée par periode et est liée à une PartieCommune[cite: 139].
    """
    id = models.AutoField(primary_key=True)
    periode = models.CharField(max_length=50) # Attribut 'periode:string' [cite: 116]
    valeur_consommee = models.FloatField() # Attribut 'valeurConsommee:float' [cite: 117]
    cout = models.FloatField() # Attribut 'cout:float' [cite: 118]
    date_debut = models.DateField() # Attribut 'dateDebut:date' [cite: 119]
    date_fin = models.DateField() # Attribut 'dateFin:date' [cite: 120]
    
    # Relations
    partie_commune = models.ForeignKey(PartieCommune, on_delete=models.CASCADE, related_name='consommations')
    
    # Méthodes (calculerMoyenne(), comparerPeriode(), calculerCout() seront implémentées dans le manager ou des services)
    
    def __str__(self):
        return f"Consommation {self.valeur_consommee} ({self.periode})"

class Historique(models.Model):
    """
    Modèle Historique [cite: 73]
    Permet la traçabilité des modifications[cite: 139].
    """
    id = models.AutoField(primary_key=True)
    action = models.CharField(max_length=255) # Attribut 'action:string' [cite: 136]
    date_action = models.DateTimeField(auto_now_add=True) # Attribut 'dateAction:datetime' [cite: 137]
    
    # Relation (Qui a effectué l'action)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.SET_NULL, null=True)
    
    def __str__(self):
        return f"{self.action} le {self.date_action.strftime('%Y-%m-%d')}"
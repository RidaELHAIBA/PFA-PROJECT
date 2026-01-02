# src/users/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class UtilisateurManager(BaseUserManager):
    """
    Gestionnaire pour le modèle Utilisateur personnalisé.
    Nécessaire car nous utilisons l'email au lieu du nom d'utilisateur.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'email est requis")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class Utilisateur(AbstractBaseUser, PermissionsMixin):
    """
    Classe mère Utilisateur (Diagramme 2.2.3).
    AbstractBaseUser fournit les fonctionnalités d'authentification de base.
    """
    email = models.EmailField(max_length=255, unique=True)
    nom = models.CharField(max_length=255)
    prenom = models.CharField(max_length=255)
    telephone = models.CharField(max_length=20, blank=True, null=True) # Attribut implicite ou ajouté
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # Définit l'email comme champ d'identification de connexion
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom']
    
    objects = UtilisateurManager()

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.email})"

# --- Classes héritées (Diagramme 2.2.3) ---

class Syndic(Utilisateur):
    """
    Hérite de Utilisateur. Rôle principal d'administration et de gestion (définir seuils, traiter réclamations, saisir relevés)[cite: 44].
    """
    # Ce champ crée le lien One-to-One vers l'Utilisateur
    class Meta:
        verbose_name_plural = "Syndics"

class Resident(Utilisateur):
    """
    Hérite de Utilisateur. Soumet les réclamations et consulte la consommation/historique[cite: 45].
    """
    class Meta:
        verbose_name_plural = "Résidents"

class ConseilSyndical(Utilisateur):
    """
    Hérite de Utilisateur. Rôle de consultation et de supervision (historique, rapports, alertes)[cite: 46].
    """
    class Meta:
        verbose_name_plural = "Conseils Syndicaux"

class TechnicienMaintenance(Utilisateur):
    """
    Hérite de Utilisateur. Effectue les interventions[cite: 159].
    """
    class Meta:
        verbose_name_plural = "Techniciens Maintenance"
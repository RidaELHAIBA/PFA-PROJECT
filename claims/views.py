# src/claims/views.py
from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from rest_framework import permissions


from .serializers import ReclamationSoumissionSerializer , ReclamationTraitementSerializer , InterventionTechnicienSerializer , InterventionAssignationSerializer
from .models import Reclamation, StatutReclamation , Intervention
from users.models import Resident, Syndic

# Mixin pour permettre seulement la création et la lecture de la liste/détail (sans update/delete)
class ReclamationSoumissionViewSet(mixins.CreateModelMixin,
                                   mixins.RetrieveModelMixin,
                                   mixins.ListModelMixin,
                                   viewsets.GenericViewSet):
    """
    VueSet pour la soumission (Création) des réclamations par le Résident 
    et la consultation de ses propres réclamations.
    """
    serializer_class = ReclamationSoumissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Un Résident ne peut voir que SES réclamations.
        """
        user = self.request.user

        
        
        # S'assurer que l'utilisateur est bien un Résident (ou un Syndic/Admin pour la supervision)
        if hasattr(user, 'resident'):
                return Reclamation.objects.filter(resident=user.resident).order_by('-date_soumission')
        
        # Le Syndic/Admin doit voir toutes les réclamations pour le traitement
        if hasattr(user, 'syndic'):
                return Reclamation.objects.all().order_by('-date_soumission')
            
        return Reclamation.objects.none()

    def perform_create(self, serializer):
        """
        Définit automatiquement le Résident à partir de l'utilisateur connecté (Relation 'soumise par').
        """
        user = self.request.user
        resident_profile = None
        if user.is_superuser and hasattr(user, 'resident'):
            resident_profile = user.resident
        elif hasattr(user, 'resident'):
                resident_profile = user.resident
        if resident_profile is None:
                raise serializers.ValidationError({"detail": "Seul un Résident peut soumettre une réclamation."})

        reclamation = serializer.save(resident=resident_profile, statut=StatutReclamation.OUVERTE)
        
        


class IsSyndicPermission(permissions.BasePermission):
    """
    Permission personnalisée : Autorise l'accès uniquement au Syndic.
    """
    def has_permission(self, request, view):
        # Vérifie si l'utilisateur est authentifié et possède le profil Syndic
        return (request.user.is_authenticated and hasattr(request.user, 'syndic')) or request.user.is_superuser

class ReclamationTraitementViewSet(mixins.RetrieveModelMixin,
                                    mixins.ListModelMixin,
                                    mixins.UpdateModelMixin, # Permet de changer le statut (Clôturer/Rejeter)
                                    viewsets.GenericViewSet):
    """
    Permet au Syndic de Consulter, Traiter (mettre à jour statut) et Clôturer les réclamations.
    """
    serializer_class = ReclamationTraitementSerializer
    permission_classes = [IsAuthenticated, IsSyndicPermission] # Seul le Syndic

    # Le Syndic voit toutes les réclamations
    queryset = Reclamation.objects.all().order_by('-date_soumission') 

    def perform_update(self, serializer):
        """
        Logique de notification après la mise à jour (Notification mise à jour/résolution/rejet).
        """
        reclamation = serializer.save()
        
        # Logique de Notification selon le changement de statut (Diagramme 2.3.3)
        if reclamation.statut in [StatutReclamation.RESOLUE, StatutReclamation.REJETEE]:
            print(f"Notification résolution/rejet envoyée au Résident pour {reclamation.id}")
            # ServiceDeNotification.envoyer_resolution(reclamation)
        else:
            print(f"Notification mise à jour envoyée pour {reclamation.id}")
            # ServiceDeNotification.envoyer_mise_a_jour(reclamation)


class EspaceTechnicienViewSet(viewsets.ModelViewSet):
    """
    Espace dédié aux techniciens : ils ne voient que leurs interventions
    et peuvent clôturer les réclamations via leur rapport.
    """
    serializer_class = InterventionTechnicienSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Filtrage strict : Seul le technicien assigné voit ses tâches
        if hasattr(user, 'technicienmaintenance'):
             return Intervention.objects.filter(technicien=user.technicienmaintenance).order_by('date_intervention')
        return Intervention.objects.none()

    def perform_update(self, serializer):
        """
        Quand le technicien enregistre son rapport, la réclamation passe en 'EN_COURS' ou 'RESOLUE'.
        """
        intervention = serializer.save()
        reclamation = intervention.reclamation
        
        # Si un rapport est écrit, on considère que c'est en cours de résolution ou résolu
        if intervention.rapport and len(intervention.rapport) > 10:
            reclamation.statut = StatutReclamation.RESOLUE
            reclamation.save()
            print(f"Flux Phase C : Réclamation {reclamation.id} clôturée par rapport technique.")

class InterventionViewSet(viewsets.ModelViewSet):
    """
    CRUD complet pour le Syndic : créer, assigner et supprimer des interventions.
    """
    queryset = Intervention.objects.all()
    # On utilise un serializer standard qui permet de choisir la réclamation et le tech
    serializer_class = InterventionAssignationSerializer 
    permission_classes = [IsAuthenticated, IsSyndicPermission] # 🔒 Seul le Syndic décide !

    def perform_create(self, serializer):
        # Quand le syndic crée l'intervention, on peut passer la réclamation en "EN_COURS"
        intervention = serializer.save()
        reclamation = intervention.reclamation
        reclamation.statut = StatutReclamation.EN_COURS
        reclamation.save()
        print(f"Syndic Action: Réclamation {reclamation.id} assignée au tech {intervention.technicien}")
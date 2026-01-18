from rest_framework import viewsets , mixins
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from .models import Resident, TechnicienMaintenance
from .serializers import ResidentSerializer, TechnicienSerializer
from claims.views import IsSyndicPermission , IsTechnicienPermission

class ResidentManagementViewSet(viewsets.ModelViewSet):
    """
    CRUD complet pour le Syndic : créer, lister, modifier, supprimer des résidents.
    """
    queryset = Resident.objects.all().order_by('nom')
    serializer_class = ResidentSerializer
    permission_classes = [IsAuthenticated, IsSyndicPermission]

class TechnicienManagementViewSet(viewsets.ModelViewSet):
    """
    CRUD complet pour le Syndic : gérer son équipe technique.
    """
    queryset = TechnicienMaintenance.objects.all().order_by('nom')
    serializer_class = TechnicienSerializer
    permission_classes = [IsAuthenticated, IsSyndicPermission ]
class UserProfileViewSet(viewsets.GenericViewSet, 
                         mixins.RetrieveModelMixin, 
                         mixins.UpdateModelMixin):
    """
    Permet à l'utilisateur connecté de gérer son propre profil.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TechnicienSerializer # On réutilise ton serializer

    def get_object(self):
        # On retourne l'instance liée à l'utilisateur connecté
        user = self.request.user
        if hasattr(user, 'technicienmaintenance'):
            return user.technicienmaintenance
        elif hasattr(user, 'resident'):
            return user.resident
        return user
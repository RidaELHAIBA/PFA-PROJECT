from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Resident, TechnicienMaintenance
from .serializers import ResidentSerializer, TechnicienSerializer
from claims.views import IsSyndicPermission

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
    permission_classes = [IsAuthenticated, IsSyndicPermission]
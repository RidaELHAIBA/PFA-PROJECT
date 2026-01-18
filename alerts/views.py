from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .serializers import AlerteSerializer , SeuilAlerteSerializer
from .models import Alerte , SeuilAlerte
from users.models import Syndic, ConseilSyndical 
from claims.views import IsSyndicPermission

class AlerteConsultationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AlerteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        zone_id = self.request.query_params.get('zone_id') # Récupéré du sélecteur Frontend
        
        # Le Syndic et le Conseil voient tout
        if hasattr(user, 'syndic') or hasattr(user, 'conseilsyndical'):
            queryset = Alerte.objects.all()
        elif hasattr(user, 'resident'):
            # Le résident voit les alertes historiques de la zone choisie
            queryset = Alerte.objects.filter(compteur__partie_commune_id=zone_id) if zone_id else Alerte.objects.none()
        else:
            return Alerte.objects.none()

        return queryset.order_by('-date_detection') # Ne retourne rien
    


class SeuilAlerteViewSet(viewsets.ModelViewSet):
    """
    Permet au Syndic de configurer les limites (Phase A/B).
    """
    queryset = SeuilAlerte.objects.all()
    serializer_class = SeuilAlerteSerializer
    permission_classes = [IsSyndicPermission]
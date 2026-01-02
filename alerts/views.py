from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .serializers import AlerteSerializer , SeuilAlerteSerializer
from .models import Alerte , SeuilAlerte
from users.models import Syndic, ConseilSyndical 
from claims.views import IsSyndicPermission


class AlerteConsultationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Permet au Syndic et au Conseil Syndical de Consulter les alertes[cite: 46].
    """
    serializer_class = AlerteSerializer
    
    # Les utilisateurs doivent être authentifiés
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filtre les résultats : seules les alertes en cours ou passées sont affichées.
        La consultation est autorisée pour le Syndic et le Conseil Syndical.
        """
        user = self.request.user
        
        # Vérification des rôles (Consultation/Supervision)
        is_syndic = hasattr(user, 'syndic')
        is_conseil = hasattr(user, 'conseilsyndical')
        
        if is_syndic or is_conseil:
            # Si c'est l'un des rôles autorisés, on affiche toutes les alertes.
            return Alerte.objects.all().order_by('-date_detection')
        
        # Si l'utilisateur n'est ni Syndic ni Conseil Syndical
        return Alerte.objects.none() # Ne retourne rien
    


class SeuilAlerteViewSet(viewsets.ModelViewSet):
    """
    Permet au Syndic de configurer les limites (Phase A/B).
    """
    queryset = SeuilAlerte.objects.all()
    serializer_class = SeuilAlerteSerializer
    permission_classes = [IsSyndicPermission]
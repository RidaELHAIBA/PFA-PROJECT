
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from claims.views import IsSyndicPermission
from rest_framework import viewsets

from .serializers import ReleveSaisieSerializer , PartieCommuneSerializer , CompteurSerializer
from .models import Releve, Compteur , PartieCommune
from users.models import Syndic 
from alerts.models import Alerte , SeuilAlerte

# src/consumption/views.py
class SaisieReleveAPIView(APIView):
    permission_classes = [IsAuthenticated] 

    def post(self, request, *args, **kwargs):
        # 1. Sécurité Syndic
        if not request.user.is_superuser and not hasattr(request.user, 'syndic'): 
            return Response({"detail": "Accès refusé."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ReleveSaisieSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Enregistrement
        releve_instance = serializer.save() 
        compteur = releve_instance.compteur
        valeur_saisie = releve_instance.valeur

        # 3. LOGIQUE DU CERVEAU (RETOUR AU SEUIL ALERTE)
        alerte_creee = False
        
        # On cherche la config spécifique pour ce compteur
        from alerts.models import SeuilAlerte, Alerte
        seuil_config = SeuilAlerte.objects.filter(compteur=compteur, type_alerte='SURCONS').first()

        if seuil_config and valeur_saisie > seuil_config.valeur_seuil:
            Alerte.objects.create(
                seuil=seuil_config,
                compteur=compteur,
                description=f"Dépassement détecté : {valeur_saisie} enregistré. Le seuil autorisé est de {seuil_config.valeur_seuil}.",
                est_traitee=False
            )
            alerte_creee = True

        return Response({
            "message": "Relevé enregistré.",
            "id": releve_instance.id,
            "alerte_generee": alerte_creee
        }, status=status.HTTP_201_CREATED)
class PartieCommuneViewSet(viewsets.ModelViewSet):
    queryset = PartieCommune.objects.all()
    serializer_class = PartieCommuneSerializer
    permission_classes = [IsAuthenticated]  

class CompteurViewSet(viewsets.ModelViewSet):
    queryset = Compteur.objects.all()
    serializer_class = CompteurSerializer
    permission_classes = [IsSyndicPermission]
class ReleveViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour lister, modifier et supprimer les relevés existants.
    """
    queryset = Releve.objects.all().order_by('-date_releve')
    serializer_class = ReleveSaisieSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Optionnel : filtrer par compteur via query params
        queryset = self.queryset
        compteur_ref = self.request.query_params.get('compteur')
        if compteur_ref:
            return self.queryset.filter(compteur__reference=compteur_ref)
        zone_id = self.request.query_params.get('zone_id')
        
        if zone_id:
            # On utilise le double underscore (__) pour traverser vers le compteur
            # puis vers la partie commune liée à ce compteur
            return queryset.filter(compteur__partie_commune_id=zone_id).order_by('-date_releve')
        return self.queryset
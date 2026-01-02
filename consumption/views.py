
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

class SaisieReleveAPIView(APIView):
    permission_classes = [IsAuthenticated] 

    def post(self, request, *args, **kwargs):
        # --- 1. Vérification Sécurité (Déjà ok chez toi) ---
        if not request.user.is_superuser and not hasattr(request.user, 'syndic'): 
            return Response(
                {"detail": "Accès refusé. Seul le Syndic peut saisir un relevé."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ReleveSaisieSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # --- 2. Récupération des données pour le calcul ---
        # Ton serializer.save() appelle sa méthode create() qui récupère le compteur
        releve_instance = serializer.save() 
        compteur = releve_instance.compteur
        valeur_saisie = releve_instance.valeur

        # --- 3. LOGIQUE DU CERVEAU (PHASE B) ---
        alerte_creee = False
        
        # On cherche si le Syndic a configuré un seuil pour CE compteur
        # On filtre par type 'SURCONS' (Surconsommation)
        seuil_config = SeuilAlerte.objects.filter(compteur=compteur, type_alerte='SURCONS').first()

        if seuil_config and valeur_saisie > seuil_config.valeur_seuil:
            # Création automatique de l'objet Alerte
            Alerte.objects.create(
                seuil=seuil_config,
                compteur=compteur,
                description=f"Dépassement détecté : {valeur_saisie} enregistré. Le seuil autorisé est de {seuil_config.valeur_seuil}.",
                est_traitee=False
            )
            alerte_creee = True

        # --- 4. Réponse JSON augmentée ---
        return Response(
            {
                "message": "Relevé enregistré avec succès.",
                "id": releve_instance.id,
                "alerte_generee": alerte_creee # Informe le front-end si une alerte est née
            }, 
            status=status.HTTP_201_CREATED
        )
class PartieCommuneViewSet(viewsets.ModelViewSet):
    queryset = PartieCommune.objects.all()
    serializer_class = PartieCommuneSerializer
    permission_classes = [IsSyndicPermission]  

class CompteurViewSet(viewsets.ModelViewSet):
    queryset = Compteur.objects.all()
    serializer_class = CompteurSerializer
    permission_classes = [IsSyndicPermission]
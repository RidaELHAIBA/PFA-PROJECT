# src/reports/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import models
from django.http import FileResponse
from django.shortcuts import get_object_or_404

from .serializers import RapportConfigSerializer
from .models import Rapport, StatistiqueConsommation
from claims.models import Reclamation , Intervention
from consumption.models import Releve, PartieCommune
from users.models import Syndic, Resident , TechnicienMaintenance
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from django.core.files.storage import default_storage
from consumption.models import PartieCommune, Compteur
from alerts.models import Alerte , SeuilAlerte
import os
from claims.views import IsSyndicPermission

def creer_pdf_complet(stats_conso, config):
    """
    Génère un PDF avec stats de consommation ET situation globale.
    """
    filename = f"rapport_global_{config['periode']}.pdf"
    folder = 'reports_exports'
    if not os.path.exists(folder): os.makedirs(folder)
    filepath = os.path.join(folder, filename)
    
    with default_storage.open(filepath, 'wb') as f:
        p = canvas.Canvas(f, pagesize=A4)
        # --- EN-TÊTE ---
        p.setFont("Helvetica-Bold", 18)
        p.drawString(50, 800, "RAPPORT DE SITUATION COPROPRIÉTÉ")
        p.setFont("Helvetica", 12)
        p.drawString(50, 780, f"Période : {config['periode']}")
        
        # --- SECTION 1 : MEMBRES & RÉCLAMATIONS ---
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, 740, "1. Situation des Membres et Réclamations")
        p.setFont("Helvetica", 11)
        p.drawString(70, 720, f"- Nombre de Résidents : {Resident.objects.count()}")
        p.drawString(70, 700, f"- Réclamations en attente : {Reclamation.objects.filter(statut='OUVERTE').count()}")
        
        # --- SECTION 2 : CONSOMMATION ---
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, 660, "2. Analyse de Consommation")
        p.setFont("Helvetica", 11)
        p.drawString(70, 640, f"- Moyenne période : {stats_conso['valeur_moyenne']} unités")
        
        p.showPage()
        p.save()
    
    return filepath
# Mise à jour de GlobalDashboardStatsView dans reports/views.py

class GlobalDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated, IsSyndicPermission]
    def get(self, request):
        return Response({
            "infrastructure": {
                "parties_communes": PartieCommune.objects.count(),
                "total_compteurs": Compteur.objects.count(),
            },
            "communaute": {
                "habitants": Resident.objects.count(),
                "staff_technique": TechnicienMaintenance.objects.count(),
            },
            "maintenance": {
                "alertes_ouvertes": Reclamation.objects.filter(statut='OUVERTE').count() + Alerte.objects.filter(est_traitee=False).count(),
                "interventions_en_cours": Intervention.objects.filter(reclamation__statut='EN_COURS').count(),
                "taux_resolution": self.get_resolution_rate(), # Optionnel : % de succès
            }
        })

    def get_resolution_rate(self):
        total = Reclamation.objects.count()
        if total == 0: return 100
        resolues = Reclamation.objects.filter(statut='RESOLUE').count()
        return round((resolues / total) * 100, 2)
    
class RapportGenerationAPIView(APIView):
    Permission_classes= [IsAuthenticated, IsSyndicPermission]
    def post(self, request):
        serializer = RapportConfigSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        
        config = serializer.validated_data
        
        # Calcul des stats de consommation réelles
        releves = Releve.objects.filter(compteur__partie_commune_id=config['partie_commune_id'])
        stats_conso = {
            'valeur_moyenne': releves.aggregate(models.Avg('valeur'))['valeur__avg'] or 0
        }

        # Génération du fichier réel
        if config['format_export'] == 'PDF':
            path = creer_pdf_complet(stats_conso, config)
        else:
            return Response({"error": "Excel non implémenté"}, status=400)

        # Enregistrement en base pour historique
        rapport = Rapport.objects.create(
            type_rapport=config['type_rapport'],
            format_export=config['format_export'],
            fichier_chemin=path
        )

        return Response({
            "status": "success",
            "rapport_id": rapport.id,
            "preview_stats": stats_conso
        })


class RapportDownloadAPIView(APIView):
    """
    Vue pour télécharger le fichier PDF/Excel une fois généré.
    """
    permission_classes = [IsAuthenticated, IsSyndicPermission] # Protection Syndic

    def get(self, request, rapport_id):
        # On récupère les infos du rapport en base de données
        rapport = get_object_or_404(Rapport, pk=rapport_id)
        
        if not rapport.fichier_chemin:
            return Response({"detail": "Le fichier n'a pas été trouvé sur le serveur."}, status=404)

        # On ouvre le fichier en mode binaire 'rb'
        try:
            file_handle = default_storage.open(rapport.fichier_chemin, 'rb')
            return FileResponse(file_handle, as_attachment=True, filename=os.path.basename(rapport.fichier_chemin))
        except FileNotFoundError:
            return Response({"detail": "Fichier physique manquant."}, status=404)
# src/reports/urls.py
from django.urls import path
from .views import (
    RapportGenerationAPIView, 
    RapportDownloadAPIView, 
    GlobalDashboardStatsView
)

urlpatterns = [
    # 1. Tableau de bord (Stats rapides pour le Front)
    path('dashboard/', GlobalDashboardStatsView.as_view(), name='dashboard-stats'),
    
    # 2. Génération du rapport (POST avec config)
    path('rapports/generer/', RapportGenerationAPIView.as_view(), name='generer-rapport'),
    
    # 3. Téléchargement du fichier (GET avec ID)
    path('rapports/telecharger/<int:rapport_id>/', RapportDownloadAPIView.as_view(), name='telecharger-rapport'),
]
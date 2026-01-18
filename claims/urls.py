# src/claims/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReclamationSoumissionViewSet, 
    ReclamationTraitementViewSet,
    EspaceTechnicienViewSet,
     InterventionViewSet # <--- N'oublie pas de l'importer !
)

router = DefaultRouter()

# 1. Pour les Résidents
router.register('reclamations', ReclamationSoumissionViewSet, basename='reclamation-resident')

# 2. Pour le Syndic , technicien (Traitement des réclamations)
router.register('traitement/reclamations', ReclamationTraitementViewSet, basename='reclamation-traitement')

# 3. NOUVEAU : Pour le Syndic (CRUD des Interventions / Assignation)
router.register('interventions', InterventionViewSet, basename='intervention-crud')

# 4. Pour le Technicien (Son planning perso)
router.register('mon-planning', EspaceTechnicienViewSet, basename='technicien-planning')

urlpatterns = [
    path('', include(router.urls)),
]
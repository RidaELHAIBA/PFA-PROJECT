from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AlerteConsultationViewSet, SeuilAlerteViewSet

router = DefaultRouter()

# 1. Endpoint pour que le Syndic configure les limites (Phase B - Cerveau)
# Permet: POST (créer seuil), GET (voir), PUT (modifier), DELETE
router.register('seuils', SeuilAlerteViewSet, basename='seuil-alerte')

# 2. Endpoint pour consulter les détections automatiques
# Permet: GET (liste et détail) uniquement
router.register('liste', AlerteConsultationViewSet, basename='alerte-liste')

urlpatterns = [
    path('', include(router.urls)),
]
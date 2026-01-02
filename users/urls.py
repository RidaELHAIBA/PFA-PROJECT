from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import ResidentManagementViewSet, TechnicienManagementViewSet

# 1. On initialise le router
router = DefaultRouter()

# 2. On enregistre nos ViewSets de gestion
# Cela crée automatiquement: /gestion-residents/ et /gestion-residents/{id}/
router.register(r'gestion-residents', ResidentManagementViewSet, basename='admin-residents')

# Cela crée automatiquement: /gestion-techniciens/ et /gestion-techniciens/{id}/
router.register(r'gestion-techniciens', TechnicienManagementViewSet, basename='admin-techs')

urlpatterns = [
    # Garde ton endpoint d'authentification actuel
    path('auth/token/', obtain_auth_token, name='api_token_auth'),
    
    # Inclut toutes les routes générées par le router (CRUD)
    path('', include(router.urls)),
]
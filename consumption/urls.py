from django.urls import path
from .views import SaisieReleveAPIView, PartieCommuneViewSet , CompteurViewSet , ReleveViewSet

urlpatterns = [
    path('releves/saisie/', SaisieReleveAPIView.as_view(), name='saisie-releve'),
    path('releves/', ReleveViewSet.as_view({'get': 'list'}), name='releve-list'),
    path('releves/<int:pk>/', ReleveViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='releve-detail'),
    

    # Mapping manuel pour les Parties Communes
    path('parties-communes/', PartieCommuneViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='partie-commune-list'),

    # Mapping manuel pour les Compteurs
    path('compteurs/', CompteurViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='compteur-list'),
    
    # modification/suppression
    path('compteurs/<int:pk>/', CompteurViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='compteur-detail'),

    path('parties-communes/<int:pk>/', PartieCommuneViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='partie-commune-detail'),
]

from rest_framework import serializers
from .models import Rapport

class RapportConfigSerializer(serializers.Serializer):
    """
    Sérialiseur pour recevoir les options de configuration du rapport (input).
    """
    type_rapport = serializers.CharField(max_length=100)
    periode = serializers.CharField(max_length=50, help_text="Ex: '2025-12' ou 'Trimestre 4'")
    format_export = serializers.ChoiceField(choices=Rapport.FORMAT_CHOICES)
    # L'utilisateur doit choisir la partie commune concernée
    partie_commune_id = serializers.IntegerField(help_text="ID de la partie commune pour le filtre.")
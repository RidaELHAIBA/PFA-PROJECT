# src/alerts/serializers.py
from rest_framework import serializers
from .models import Alerte, SeuilAlerte , Compteur

class AlerteSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour la consultation des alertes.
    """
    # Afficher la référence du compteur et le type de seuil directement dans la liste.
    compteur_reference = serializers.CharField(source='compteur.reference', read_only=True)
    type_seuil = serializers.CharField(source='seuil.type_alerte', read_only=True)

    class Meta:
        model = Alerte
        fields = (
            'id', 
            'compteur_reference', 
            'type_seuil',
            'description', 
            'date_detection', 
            'est_traitee'
        )
class SeuilAlerteSerializer(serializers.ModelSerializer):
    compteur_reference = serializers.CharField(write_only=True) # Le Syndic tape "REF001"

    class Meta:
        model = SeuilAlerte
        fields = ['id', 'type_alerte', 'valeur_seuil', 'compteur_reference']

    def create(self, validated_data):
        ref = validated_data.pop('compteur_reference')
        # On va chercher le compteur en interne via la référence
        compteur = Compteur.objects.get(reference=ref)
        return SeuilAlerte.objects.create(compteur=compteur, **validated_data)
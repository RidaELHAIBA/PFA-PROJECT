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
    # On utilise 'source' pour mapper le champ vers l'attribut du modèle lié
    compteur_reference = serializers.CharField(source='compteur.reference', required=True)

    class Meta:
        model = SeuilAlerte
        fields = ['id', 'type_alerte', 'valeur_seuil', 'compteur_reference']

    def create(self, validated_data):
        # On récupère la structure imbriquée créée par 'source'
        compteur_data = validated_data.pop('compteur')
        ref = compteur_data['reference']
        
        try:
            compteur = Compteur.objects.get(reference=ref)
        except Compteur.DoesNotExist:
            raise serializers.ValidationError({"compteur_reference": "Ce compteur n'existe pas."})
            
        return SeuilAlerte.objects.create(compteur=compteur, **validated_data)
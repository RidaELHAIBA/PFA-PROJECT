# src/consumption/serializers.py

from rest_framework import serializers
from .models import Releve, Compteur , PartieCommune

class ReleveSaisieSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour la saisie manuelle d'un Relevé par le Syndic.
    """
    # Ce champ n'est pas dans le modèle, mais il est dans le JSON d'entrée.
    compteur_reference = serializers.CharField(write_only=True) 

    class Meta:
        model = Releve
        # Les champs que l'API accepte en entrée
        fields = (
            'id', 
            'compteur_reference', 
            'valeur', 
            'date_releve', 
            'commentaire'
        )
        # Ces champs sont définis par le code, pas par l'utilisateur
        read_only_fields = ('est_corrige', 'methode_releve') 

    def create(self, validated_data):
        """
        Gère la liaison du Compteur et l'enregistrement du Relevé.
        """
        compteur_reference = validated_data.pop('compteur_reference')
        
        # 1. Chercher le Compteur par sa référence
        try:
            compteur = Compteur.objects.get(reference=compteur_reference)
        except Compteur.DoesNotExist:
            raise serializers.ValidationError({"compteur_reference": "Compteur non trouvé avec cette référence."})

        # 2. Remplir les champs automatiques
        validated_data['compteur'] = compteur
        validated_data['methode_releve'] = 'Manuelle' 
        
        # 3. Créer le Relevé
        return Releve.objects.create(**validated_data)
    
class PartieCommuneSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartieCommune
        fields = '__all__'

class CompteurSerializer(serializers.ModelSerializer):
    # On affiche le nom de la zone au lieu de l'ID pour plus de clarté
    nom_zone = serializers.ReadOnlyField(source='partie_commune.nom')

    class Meta:
        model = Compteur
        fields = ['id', 'reference', 'partie_commune', 'localisation', 'date_installation', 'seuil_alerte', 'type_compteur', 'etat_compteur', 'nom_zone']
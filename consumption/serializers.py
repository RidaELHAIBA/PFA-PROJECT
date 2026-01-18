# src/consumption/serializers.py

from rest_framework import serializers
from .models import Releve, Compteur , PartieCommune

class ReleveSaisieSerializer(serializers.ModelSerializer):
    # Ce champ sert à la LECTURE (GET)
    compteur_reference = serializers.CharField(source='compteur.reference', read_only=True)
    
    # Ce champ sert à l'ÉCRITURE (POST) - On l'appelle comme le Frontend l'envoie
    # On met required=False pour ne pas bloquer le PATCH/PUT
    ref_saisie_input = serializers.CharField(write_only=True, required=False, source='compteur_reference') 

    class Meta:
        model = Releve
        fields = ('id', 'compteur_reference', 'ref_saisie_input', 'valeur', 'date_releve', 'commentaire')
        read_only_fields = ('est_corrige', 'methode_releve')

    def create(self, validated_data):
        # On cherche la référence sous le nom envoyé par le Front
        # Note : Ton frontend envoie 'compteur_reference' dans le body du POST
        ref = self.initial_data.get('compteur_reference')
        
        if not ref:
            raise serializers.ValidationError({"compteur_reference": "Ce champ est obligatoire."})

        try:
            compteur = Compteur.objects.get(reference=ref)
        except Compteur.DoesNotExist:
            raise serializers.ValidationError({"compteur_reference": "Compteur introuvable."})
        
        validated_data['compteur'] = compteur
        validated_data['methode_releve'] = 'Manuelle'
        
        # On retire la clé temporaire si elle existe pour éviter les erreurs SQL
        validated_data.pop('compteur_reference', None)
        
        return Releve.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.valeur = validated_data.get('valeur', instance.valeur)
        instance.commentaire = validated_data.get('commentaire', instance.commentaire)
        instance.est_corrige = True
        instance.save()
        return instance
    
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
from rest_framework import serializers
from .models import Reclamation, NiveauPriorite , Intervention
from consumption.models import Compteur 

class ReclamationSoumissionSerializer(serializers.ModelSerializer):
    """ Sérialiseur pour les Résidents """
    resident_nom = serializers.CharField(source='resident.nom', read_only=True)
    resident_prenom = serializers.CharField(source='resident.prenom', read_only=True)
    resident_telephone = serializers.CharField(source='resident.telephone', read_only=True)
    resident_email = serializers.EmailField(source='resident.email', read_only=True)
    niveau_priorite = serializers.ChoiceField(choices=NiveauPriorite.choices)
    compteur_reference = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Reclamation
        fields = (
            'id', 'description', 'type_reclamation', 'niveau_priorite', 
            'date_soumission', 'statut', 'resident_nom', 'resident_prenom', 
            'resident_telephone', 'compteur_reference' , 'resident_email'
        )
        read_only_fields = ('statut',)

    def create(self, validated_data):
        compteur_reference = validated_data.pop('compteur_reference', None)
        if compteur_reference:
            try:
                compteur = Compteur.objects.get(reference=compteur_reference)
                validated_data['compteur_concerne'] = compteur
            except Compteur.DoesNotExist:
                raise serializers.ValidationError({"compteur_reference": "Compteur non trouvé."})
        return super().create(validated_data)

class ReclamationTraitementSerializer(serializers.ModelSerializer):
    """ Sérialiseur pour le Syndic (C'est ICI qu'il manquait les lignes !) """
    # IL FAUT RÉPÉTER CES LIGNES ICI AUSSI
    resident_nom = serializers.CharField(source='resident.nom', read_only=True)
    resident_prenom = serializers.CharField(source='resident.prenom', read_only=True)
    resident_telephone = serializers.CharField(source='resident.telephone', read_only=True)

    class Meta:
        model = Reclamation
        fields = (
            'id', 'statut', 'description', 'niveau_priorite',
            'date_soumission', 'compteur_concerne',
            'resident_nom', 'resident_prenom', 'resident_telephone',
        )
        read_only_fields = ('description', 'date_soumission', 'compteur_concerne', 'niveau_priorite')

class InterventionTechnicienSerializer(serializers.ModelSerializer):
    # On récupère les infos via la relation 'reclamation'
    probleme_description = serializers.CharField(source='reclamation.description', read_only=True)
    priorite = serializers.CharField(source='reclamation.niveau_priorite', read_only=True)
    
    # AJOUTEZ CES LIGNES POUR LES INFOS RÉSIDENT
    resident_nom = serializers.CharField(source='reclamation.resident.nom', read_only=True)
    resident_prenom = serializers.CharField(source='reclamation.resident.prenom', read_only=True)
    resident_telephone = serializers.CharField(source='reclamation.resident.telephone', read_only=True)

    class Meta:
        model = Intervention
        fields = (
            'id', 'date_intervention', 'rapport', 'probleme_description', 
            'priorite', 'reclamation', 'resident_nom', 'resident_prenom', 'resident_telephone'
        )
        read_only_fields = ('reclamation',)

class InterventionAssignationSerializer(serializers.ModelSerializer):
    # On récupère le nom et prénom depuis la relation 'technicien'
    technicien_nom = serializers.ReadOnlyField(source='technicien.prenom')
    technicien_prenom = serializers.ReadOnlyField(source='technicien.nom')

    class Meta:
        model = Intervention
        fields = ['id', 'reclamation', 'technicien', 'technicien_nom', 'technicien_prenom', 'date_intervention', 'rapport']
        extra_kwargs = {'rapport': {'required': False}}
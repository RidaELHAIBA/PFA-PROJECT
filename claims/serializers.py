from rest_framework import serializers
from .models import Reclamation, NiveauPriorite , Intervention
from consumption.models import Compteur 

class ReclamationSoumissionSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour la soumission d'une nouvelle réclamation par un Résident.
    """
    # Afficher la priorité comme nom lisible
    niveau_priorite = serializers.ChoiceField(choices=NiveauPriorite.choices)
    
    # Afficher la référence du Compteur s'il est concerné
    compteur_reference = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Reclamation
        fields = (
            'id', 
            'description', 
            'type_reclamation', 
            'niveau_priorite', 
            'date_soumission',
            'statut',
            'compteur_reference'
        )
        read_only_fields = ('statut',) # Le statut est toujours 'OUVERTE' à la soumission

    def create(self, validated_data):
        # La vue gérera l'ajout du 'resident' (utilisateur connecté) et du 'compteur_concerne'.
        
        # Récupérer la référence du compteur si elle existe et la retirer
        compteur_reference = validated_data.pop('compteur_reference', None)
        
        if compteur_reference:
            try:
                compteur = Compteur.objects.get(reference=compteur_reference)
                validated_data['compteur_concerne'] = compteur
            except Compteur.DoesNotExist:
                raise serializers.ValidationError({"compteur_reference": "Compteur non trouvé. La réclamation sera soumise sans référence spécifique."})
        
        return super().create(validated_data)
# src/claims/serializers.py (Ajout)

class ReclamationTraitementSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour le traitement et la clôture par le Syndic.
    """
    class Meta:
        model = Reclamation
        fields = (
            'id', 
            'statut',        # Changement de statut (EN_COURS, RESOLUE, REJETEE)
            'description',   # Le Syndic peut commenter dans la description/un champ séparé
            'niveau_priorite',
            'date_soumission',
            'compteur_concerne',
        )
        # Champs non modifiables par le Syndic
        read_only_fields = ('description', 'date_soumission', 'compteur_concerne', 'niveau_priorite')
class InterventionTechnicienSerializer(serializers.ModelSerializer):
    """
    Sérialiseur spécifique pour l'espace de travail du Technicien.
    """
    # On affiche des infos utiles de la réclamation en lecture seule
    probleme_description = serializers.CharField(source='reclamation.description', read_only=True)
    priorite = serializers.CharField(source='reclamation.niveau_priorite', read_only=True)

    class Meta:
        model = Intervention
        fields = ('id', 'date_intervention', 'rapport', 'probleme_description', 'priorite', 'reclamation')
        # Le technicien ne peut modifier QUE le rapport et la date effective
        read_only_fields = ('reclamation',)
class InterventionAssignationSerializer(serializers.ModelSerializer):
    """
    Utilisé par le Syndic pour créer une intervention.
    """
    class Meta:
        model = Intervention
        fields = ['id', 'reclamation', 'technicien', 'date_intervention', 'rapport']
        # Le rapport est vide au début, donc on le met optionnel ici
        extra_kwargs = {'rapport': {'required': False}}
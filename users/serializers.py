from rest_framework import serializers
from .models import Resident, TechnicienMaintenance, Utilisateur

class ResidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resident
        fields = ['id', 'email', 'nom', 'prenom', 'telephone', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': True},
            'id': {'read_only': True}
        }

    def create(self, validated_data):
        # On utilise le manager pour créer un utilisateur avec mot de passe haché
        return Resident.objects.create_user(**validated_data)

from rest_framework import serializers
from django.contrib.auth.hashers import check_password

class TechnicienSerializer(serializers.ModelSerializer):
    old_password = serializers.CharField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = TechnicienMaintenance
        # Ajout du téléphone et des champs password
        fields = ['id', 'email', 'nom', 'prenom', 'telephone', 'old_password', 'new_password']

    def update(self, instance, validated_data):
        old_password = validated_data.get('old_password')
        new_password = validated_data.get('new_password')

        # Si l'utilisateur veut changer de mot de passe
        if old_password and new_password:
            if not check_password(old_password, instance.password):
                raise serializers.ValidationError({"old_password": "L'ancien mot de passe est incorrect."})
            instance.set_password(new_password)
        
        # Mise à jour des autres champs
        instance.nom = validated_data.get('nom', instance.nom)
        instance.prenom = validated_data.get('prenom', instance.prenom)
        instance.telephone = validated_data.get('telephone', instance.telephone)
        instance.save()
        return instance
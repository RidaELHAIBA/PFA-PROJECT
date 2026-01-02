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

class TechnicienSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechnicienMaintenance
        fields = ['id', 'email', 'nom', 'prenom', 'telephone', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': True}
        }

    def create(self, validated_data):
        return TechnicienMaintenance.objects.create_user(**validated_data)
from django.contrib import admin
from .models import Syndic, Resident, ConseilSyndical, TechnicienMaintenance, Utilisateur
from django.contrib.auth.admin import UserAdmin

# Classe pour personnaliser l'affichage du modèle Utilisateur de base
class UtilisateurAdmin(UserAdmin):
    list_display = ('email', 'nom', 'prenom', 'is_staff', 'is_active')
    search_fields = ('email', 'nom', 'prenom')
    ordering = ('email',)
    
    # Personnalisation des groupes de champs (Fieldsets)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informations personnelles', {'fields': ('nom', 'prenom', 'telephone')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nom', 'prenom', 'telephone', 'password'),
        }),
    )
    model = Utilisateur

# Enregistrement
admin.site.register(Utilisateur, UtilisateurAdmin)
admin.site.register(Syndic)
admin.site.register(Resident)
admin.site.register(ConseilSyndical)
admin.site.register(TechnicienMaintenance)
# 🏢 Smart Copro - Système de Gestion Intelligente de Copropriété

Système backend complet développé avec **Django Rest Framework** pour la gestion automatisée des consommations, alertes, et maintenance d'une copropriété.

## 🚀 Architecture du Projet
Le projet est divisé en plusieurs modules (apps) :
- **Users** : Gestion des profils (Syndic, Résident, Technicien) avec Auth Token.
- **Consumption** : Relevés de compteurs et gestion des parties communes.
- **Claims** : Gestion des réclamations et planning d'interventions techniques.
- **Alertes** : Détection automatique des fuites et anomalies.
- **Reports** : Génération de statistiques dashboard et exports PDF.

## 🛠️ Stack Technique
- **Framework** : Django 5.x + Django Rest Framework
- **Auth** : Token Authentication (DRF)
- **PDF Generation** : ReportLab
- **Database** : SQLite (Dev) 
- **Security** : CORS Headers, Role-based permissions

## 📡 API Endpoints Clés
- `POST /api/users/auth/token/` : Authentification
- `GET /api/reports/dashboard/` : Statistiques globales (Syndic)
- `GET /api/claims/reclamations/` : Liste des tickets (Vue filtrée par rôle)
- `POST /api/reports/rapports/generer/` : Création de rapport PDF

## 🛠️ Installation
1. `python -m venv .env`
2. `source .env/bin/activate` (ou `.env\Scripts\activate` sur Windows)
3. `pip install -r requirements.txt`
4. `python manage.py migrate`
5. `python manage.py runserver`
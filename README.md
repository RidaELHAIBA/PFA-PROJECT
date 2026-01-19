# 🏢 Smart Copro - Système de Gestion Intelligente de l'Énergie Électrique en Copropriété

[![Django](https://img.shields.io/badge/Django-5.x-green.svg)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/DRF-3.x-red.svg)](https://www.django-rest-framework.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)

## 📋 Table des Matières

- [À Propos](#-à-propos)
- [Contexte et Problématique](#-contexte-et-problématique)
- [Objectifs du Projet](#-objectifs-du-projet)
- [Fonctionnalités Principales](#-fonctionnalités-principales)
- [Architecture Technique](#️-architecture-technique)
- [Installation et Démarrage](#-installation-et-démarrage)
- [Structure du Projet](#-structure-du-projet)
- [API Endpoints](#-api-endpoints)
- [Conception UML](#-conception-uml)
- [Cas d'Utilisation](#-cas-dutilisation)
- [Technologies Utilisées](#-technologies-utilisées)
- [Contributeurs](#-contributeurs)
- [License](#-license)

## 🎯 À Propos

**Smart Copro** est une solution numérique complète pour la gestion intelligente de l'énergie électrique dans les copropriétés marocaines. Le système permet un suivi précis et automatisé des consommations électriques des parties communes, avec détection d'anomalies, gestion des alertes et traitement structuré des réclamations.

### 👥 Équipe de Développement

- **Hiba ALAOUI**
- **Reda ELHAIBA**
- **Wiame YOUSFI**
- **Abdelouahed AKABBAB**

## 🔍 Contexte et Problématique

La gestion actuelle de l'électricité dans les copropriétés marocaines présente plusieurs limitations importantes :

### Problèmes Identifiés

- ⚠️ **Suivi imprécis** : Relevés manuels chronophages et sujets aux erreurs
- 📊 **Absence d'historique détaillé** : Difficulté à analyser les tendances de consommation
- 💸 **Surconsommation non détectée** : Pas d'alertes automatiques sur les anomalies
- 📝 **Gestion administrative lourde** : Processus papier et peu structurés
- 🔍 **Manque de transparence** : Visibilité limitée pour les copropriétaires

## 🎯 Objectifs du Projet

Le système vise à résoudre ces problématiques en offrant :

1. ✅ **Suivi précis et historisé** des consommations électriques des parties communes
2. 🚨 **Détection automatique** des anomalies et surconsommations
3. ⚙️ **Gestion paramétrable** des alertes et seuils par le syndic
4. 📋 **Traitement structuré** des réclamations des résidents
5. 📊 **Génération de rapports** détaillés et exportables (PDF, Excel)
6. 🔐 **Gestion multi-rôles** avec permissions adaptées

## ⚡ Fonctionnalités Principales

### Pour le Syndic 👨‍💼

- 📊 **Tableau de bord** avec statistiques en temps réel
- 📝 **Saisie/Import de relevés** (manuel ou fichier CSV/Excel)
- ⚙️ **Configuration des seuils** de consommation et alertes
- 📋 **Gestion des réclamations** : consultation, traitement, résolution
- 📑 **Génération de rapports** personnalisés (période, type, format)
- 🔔 **Réception d'alertes** sur les anomalies et dépassements de seuils
- 👥 **Gestion des utilisateurs** et permissions

### Pour les Résidents 🏠

- 📈 **Consultation de la consommation** des parties communes
- 📊 **Visualisation de l'historique** de consommation
- 📝 **Soumission de réclamations** avec suivi du statut
- 🔔 **Notifications** sur le traitement des réclamations
- 📄 **Accès aux rapports** de consommation

### Pour le Conseil Syndical 👔

- 📊 **Consultation des statistiques** et historiques
- 📈 **Visualisation des tendances** de consommation
- 🔔 **Accès aux alertes** et rapports
- 👀 **Supervision** de la gestion énergétique

### Pour les Techniciens de Maintenance 🔧

- 📋 **Gestion des interventions** techniques
- 🔧 **Suivi des équipements** et maintenances
- ✅ **Résolution des réclamations** techniques

## 🏗️ Architecture Technique

### Architecture Modulaire (Microservices-style)

Le projet est organisé en modules Django indépendants :

```
smart-copro/
├── users/              # Gestion des utilisateurs et authentification
├── consumption/        # Compteurs, relevés et consommations
├── alerts/            # Système d'alertes et notifications
├── claims/            # Réclamations et interventions
├── reports/           # Génération de rapports et statistiques
├── smart-copro-frontend/  # Application React TypeScript
└── src/               # Configuration principale Django
```

### Diagramme de Packages

```
┌─────────────────────┐
│  Gestion Utilisateurs│
│   - Syndic          │
│   - Resident        │
│   - ConseilSyndical │
│   - Technicien      │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│           Gestion Consommations                   │
│   - Compteur  - Releve  - Consommation           │
│   - PartieCommune  - Historique                  │
└────────────┬─────────────────────────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌─────────┐    ┌──────────────┐
│ Alertes │    │ Réclamations │
│         │    │ Interventions│
└────┬────┘    └──────┬───────┘
     │                │
     └────────┬───────┘
              ▼
      ┌─────────────┐
      │  Rapports   │
      └─────────────┘
```

## 🚀 Installation et Démarrage

### Prérequis

- Python 3.10+
- Node.js 18+ et npm/yarn
- pip (Python package manager)
- Git

### Installation du Backend (Django)

```bash
# Cloner le repository
git clone https://github.com/RidaELHAIBA/PFA-PROJECT.git
cd PFA-PROJECT

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Sur Windows
venv\Scripts\activate
# Sur macOS/Linux
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Lancer le serveur de développement
python manage.py runserver
```

Le backend sera accessible sur : `http://localhost:8000`

### Installation du Frontend (React + TypeScript)

```bash
# Aller dans le dossier frontend
cd smart-copro-frontend

# Installer les dépendances
npm install
# ou
yarn install

# Lancer le serveur de développement
npm run dev
# ou
yarn dev
```

Le frontend sera accessible sur : `http://localhost:5173`

## 📁 Structure du Projet

### Backend (Django)

```
PFA-PROJECT/
│
├── users/                      # Module de gestion des utilisateurs
│   ├── models.py              # Modèles: Utilisateur, Syndic, Resident, etc.
│   ├── serializers.py         # Sérialiseurs DRF
│   ├── views.py               # Vues API (Authentication, Profils)
│   └── permissions.py         # Permissions personnalisées
│
├── consumption/                # Module de gestion de la consommation
│   ├── models.py              # Modèles: Compteur, Releve, Consommation
│   ├── serializers.py         # Sérialiseurs pour les relevés
│   ├── views.py               # API: saisie relevés, historique
│   └── utils.py               # Calculs de consommation
│
├── alerts/                     # Module de gestion des alertes
│   ├── models.py              # Modèles: Alerte, Seuil, Notification
│   ├── services.py            # Détection d'anomalies
│   ├── views.py               # API: alertes, configuration seuils
│   └── tasks.py               # Tâches asynchrones (Celery)
│
├── claims/                     # Module de gestion des réclamations
│   ├── models.py              # Modèles: Reclamation, Intervention
│   ├── serializers.py         # Sérialiseurs pour réclamations
│   ├── views.py               # API: CRUD réclamations
│   └── permissions.py         # Permissions par rôle
│
├── reports/                    # Module de génération de rapports
│   ├── models.py              # Modèles: Rapport, Statistique
│   ├── views.py               # API: génération PDF/Excel
│   ├── generators.py          # Générateurs de rapports
│   └── utils.py               # Calculs statistiques
│
├── src/                        # Configuration principale Django
│   ├── settings.py            # Configuration du projet
│   ├── urls.py                # URLs principales
│   └── wsgi.py                # WSGI configuration
│
├── requirements.txt            # Dépendances Python
└── manage.py                   # Script de gestion Django
```

### Frontend (React + TypeScript)

```
smart-copro-frontend/
│
├── src/
│   ├── components/            # Composants réutilisables
│   │   ├── Dashboard/        # Tableaux de bord
│   │   ├── Consumption/      # Gestion consommation
│   │   ├── Alerts/           # Affichage alertes
│   │   ├── Claims/           # Gestion réclamations
│   │   └── Reports/          # Génération rapports
│   │
│   ├── pages/                # Pages principales
│   │   ├── Login.tsx
│   │   ├── SyndicDashboard.tsx
│   │   ├── ResidentDashboard.tsx
│   │   └── ConseilDashboard.tsx
│   │
│   ├── services/             # Services API
│   │   ├── authService.ts
│   │   ├── consumptionService.ts
│   │   ├── alertsService.ts
│   │   └── reportsService.ts
│   │
│   ├── types/                # Définitions TypeScript
│   │   └── models.ts
│   │
│   ├── hooks/                # Custom React Hooks
│   ├── utils/                # Fonctions utilitaires
│   └── App.tsx               # Composant principal
│
└── package.json              # Dépendances npm
```

## 📡 API Endpoints

### Authentication

```http
POST   /api/users/auth/token/           # Connexion (obtenir token)
POST   /api/users/auth/register/        # Inscription
POST   /api/users/auth/logout/          # Déconnexion
GET    /api/users/profile/              # Profil utilisateur
PUT    /api/users/profile/              # Modifier profil
```

### Consommation

```http
GET    /api/consumption/compteurs/       # Liste des compteurs
POST   /api/consumption/releves/         # Saisir un relevé
GET    /api/consumption/releves/         # Historique des relevés
POST   /api/consumption/import/          # Import fichier CSV/Excel
GET    /api/consumption/consommations/   # Statistiques de consommation
GET    /api/consumption/historique/      # Historique complet
```

### Alertes

```http
GET    /api/alerts/alertes/              # Liste des alertes
POST   /api/alerts/seuils/               # Configurer seuils
GET    /api/alerts/seuils/               # Voir seuils configurés
PUT    /api/alerts/alertes/:id/          # Marquer alerte comme lue
DELETE /api/alerts/alertes/:id/          # Supprimer alerte
```

### Réclamations

```http
GET    /api/claims/reclamations/         # Liste réclamations (filtrée par rôle)
POST   /api/claims/reclamations/         # Soumettre réclamation
GET    /api/claims/reclamations/:id/     # Détails réclamation
PUT    /api/claims/reclamations/:id/     # Traiter réclamation
DELETE /api/claims/reclamations/:id/     # Supprimer réclamation
POST   /api/claims/interventions/        # Créer intervention
GET    /api/claims/interventions/        # Liste interventions
```

### Rapports

```http
GET    /api/reports/dashboard/           # Statistiques dashboard (Syndic)
POST   /api/reports/rapports/generer/    # Générer rapport PDF/Excel
GET    /api/reports/rapports/            # Liste rapports générés
GET    /api/reports/rapports/:id/        # Télécharger rapport
GET    /api/reports/statistiques/        # Statistiques détaillées
```

## 🎨 Conception UML

Le projet a été conçu suivant une méthodologie UML complète :

### Diagramme de Cas d'Utilisation

Les acteurs principaux et leurs interactions :

- **Syndic** : Administration complète (relevés, seuils, réclamations, rapports)
- **Résident** : Consultation et soumission de réclamations
- **Conseil Syndical** : Supervision et consultation
- **Technicien de Maintenance** : Gestion des interventions

### Diagrammes de Classes

#### 1. Classes Utilisateurs

```
Utilisateur (Abstract)
├── Syndic
│   └── configurerSeuil()
│   └── traiterReclamation()
├── Resident
│   └── soumettreReclamation()
│   └── consulterConsommation()
├── ConseilSyndical
│   └── superviserGestion()
└── TechnicienMaintenance
    └── effectuerIntervention()
```

#### 2. Classes Consommation

```
Compteur
├── numeroSerie: String
├── partieCommune: PartieCommune
└── releves: Releve[]

Releve
├── valeur: Float
├── dateReleve: DateTime
├── type: TypeReleve (MANUEL/AUTOMATIQUE)
└── compteur: Compteur

Consommation
├── periode: String
├── valeur: Float
├── cout: Float
└── partieCommune: PartieCommune
```

#### 3. Classes Réclamations

```
Reclamation
├── description: String
├── statut: StatutReclamation
├── priorite: NiveauPriorite (FAIBLE/MOYENNE/HAUTE/URGENTE)
├── resident: Resident
└── intervention: Intervention?

Intervention
├── description: String
├── dateDebut: DateTime
├── dateFin: DateTime
├── technicien: TechnicienMaintenance
└── equipement: Equipement
```

### Diagrammes de Séquence

#### 1. Saisie Manuelle d'un Relevé

```
Syndic → Système : saisirReleve(valeur)
Système → BD : getDernierReleve()
BD → Système : dernierReleve
Système → Système : verifierCoherence()
alt [Valeur cohérente]
    Système → BD : enregistrerReleve()
else [Valeur aberrante]
    Système → Syndic : demanderCorrection()
    Syndic → Système : confirmerOuCorriger()
    Système → BD : enregistrerReleve()
end
Système → Syndic : confirmation
```

#### 2. Détection et Alerte

```
Système → BD : getSeuilsConfigures()
Système → BD : getConsommation()
Système → Système : comparerAvecSeuil()
alt [Dépassement détecté]
    Système → BD : creerAlerte()
    Système → Syndic : envoyerNotification()
end
```

#### 3. Traitement d'une Réclamation

```
Resident → Système : soumettreReclamation(données)
Système → Système : validerDonnees()
Système → BD : enregistrerReclamation()
Système → Resident : confirmationSoumission()

Syndic → Système : traiterReclamation(id)
Système → BD : updateStatut(EN_COURS)
Syndic → Système : cloturerReclamation(resolution)
Système → BD : updateStatut(RESOLU)
Système → Resident : notificationResolution()
```

## 🎯 Cas d'Utilisation

### Cas 1 : Suivi de Consommation

**Acteur** : Syndic
**Objectif** : Saisir et suivre les relevés de consommation

**Scénario principal** :
1. Le Syndic se connecte au système
2. Il accède à la section "Relevés"
3. Il sélectionne le compteur concerné
4. Il saisit la nouvelle valeur du relevé
5. Le système vérifie la cohérence avec le dernier relevé
6. Le système calcule automatiquement la consommation
7. Le système affiche une confirmation

**Scénario alternatif** :
- Si la valeur est aberrante, le système demande confirmation

### Cas 2 : Gestion des Alertes

**Acteur** : Système (automatique)
**Objectif** : Détecter et notifier les anomalies

**Scénario principal** :
1. Après chaque relevé, le système compare avec les seuils
2. Si dépassement détecté, création d'une alerte
3. Notification envoyée au Syndic
4. L'alerte apparaît dans le tableau de bord
5. Le Syndic peut consulter les détails
6. Le Syndic peut marquer l'alerte comme traitée

### Cas 3 : Réclamation d'un Résident

**Acteur** : Résident
**Objectif** : Soumettre et suivre une réclamation

**Scénario principal** :
1. Le Résident se connecte
2. Il accède à "Mes Réclamations"
3. Il clique sur "Nouvelle Réclamation"
4. Il remplit le formulaire (description, priorité)
5. Il soumet la réclamation
6. Le système enregistre et notifie le Syndic
7. Le Résident reçoit un numéro de suivi
8. Il peut consulter l'état d'avancement

## 🛠️ Technologies Utilisées

### Backend

- **Django 5.x** - Framework web Python
- **Django REST Framework 3.x** - API REST
- **Django CORS Headers** - Gestion CORS
- **Token Authentication** - Authentification sécurisée
- **ReportLab** - Génération de PDF
- **Pandas** - Traitement de données (import CSV/Excel)
- **Celery** (optionnel) - Tâches asynchrones
- **SQLite** - Base de données (dev)
- **PostgreSQL** (recommandé en production)

### Frontend

- **React 18.x** - Bibliothèque UI
- **TypeScript 5.x** - Typage statique
- **Vite** - Build tool moderne
- **Axios** - Client HTTP
- **React Router** - Navigation
- **TailwindCSS** - Framework CSS
- **Recharts / Chart.js** - Graphiques et visualisations
- **React Hook Form** - Gestion de formulaires

### Outils de Développement

- **Git** - Contrôle de version
- **VS Code** - IDE recommandé
- **Postman** - Tests API
- **ESLint / Prettier** - Linting et formatage
- **pytest** - Tests backend

## 🔐 Sécurité

- Authentification par Token (DRF Token Authentication)
- Permissions basées sur les rôles (RBAC)
- Validation des données en entrée
- Protection CSRF
- CORS configuré
- Hachage sécurisé des mots de passe
- Limitation du taux de requêtes (rate limiting)

## 📊 Performances et Optimisation

- Cache des requêtes fréquentes
- Pagination des listes
- Lazy loading des données
- Indexation des champs de recherche
- Optimisation des requêtes SQL (select_related, prefetch_related)

## 🧪 Tests

```bash
# Tests backend
python manage.py test

# Tests frontend
cd smart-copro-frontend
npm run test
```

## 📝 Licence

Ce projet est développé dans le cadre d'un Projet de Fin d'Année (PFA) académique.

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📞 Contact

Pour toute question ou suggestion, contactez l'équipe de développement.

---

**Développé avec ❤️ par l'équipe Smart Copro**

# Coiffure Digba

Bienvenue sur le code source du site web de **Coiffure Digba**.

## Fonctionnalités

- **Design Moderne & Sombre** : Respect de la DA Instagram (couleurs sombres, typographie élégante).
- **Galerie** : Mise en avant des coupes et réalisations.
- **Réservation en ligne** : Formulaire pour que les clients choisissent leur créneau.
- **Ajout Agenda** : Simulation d'envoi de notification (pour l'instant frontend-only).

## Installation

1.  Installer les dépendances :
    \\\ash
    npm install
    \\\

2.  Lancer le serveur de développement :
    \\\ash
    npm run dev
    \\\

3.  Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

## Personnalisation

- **Images** : Les images actuelles sont des placeholders Unsplash. Remplacez-les dans \src/app/page.tsx\ (\galleryImages\).
- **Couleurs/Fontes** : Modifiables dans \src/app/globals.css\ et \	ailwind.config.ts\ (si présent) ou via les classes utilitaires.

## Note sur l'Agenda

L'intégration avec Google Calendar nécessite une authentification OAuth et un backend. La version actuelle simule cette action et confirme le rendez-vous à l'utilisateur.

---
© 2026 Coiffure Digba


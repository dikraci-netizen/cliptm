# Facebook Auto Poster Pro - Extension Chrome

Extension Chrome professionnelle pour programmer et publier automatiquement des posts sur Facebook.

## Fonctionnalites

- **Publication instantanee** : Publiez directement sur votre profil, page ou groupe
- **Programmation de posts** : Planifiez vos publications a l'avance
- **Repetitions** : Programmez des publications quotidiennes, hebdomadaires ou mensuelles
- **Historique complet** : Suivez toutes vos publications (succes/echecs)
- **Comportement humain** : Delais aleatoires et interactions naturelles
- **Notifications** : Soyez informe du succes ou echec de vos publications
- **Auto-retry** : Reessai automatique en cas d'echec

## Installation

1. Ouvrez Chrome et allez sur `chrome://extensions/`
2. Activez le **Mode developpeur** (en haut a droite)
3. Cliquez sur **Charger l'extension non empaquetee**
4. Selectionnez le dossier `facebook-autoposter`

### Generer les icones

Avant l'installation, vous devez generer les icones PNG :
1. Ouvrez le fichier `icons/generate-icons.html` dans votre navigateur
2. Faites un clic droit sur chaque canvas et sauvegardez en PNG
3. Nommez-les : `icon16.png`, `icon48.png`, `icon128.png`

Ou remplacez simplement par vos propres icones PNG aux dimensions 16x16, 48x48 et 128x128.

## Utilisation

1. Connectez-vous a Facebook dans Chrome
2. Cliquez sur l'icone de l'extension
3. **Onglet Composer** : Ecrivez votre post et publiez ou programmez
4. **Onglet Programmer** : Choisissez la date, l'heure et la repetition
5. **Onglet Historique** : Consultez vos statistiques
6. **Onglet Params** : Configurez les delais et notifications

## Structure du projet

```
facebook-autoposter/
├── manifest.json          # Configuration Manifest V3
├── background/
│   └── background.js      # Service Worker (alarmes, logique metier)
├── content/
│   ├── content.js         # Script d'interaction avec Facebook
│   └── content.css        # Styles de feedback visuel
├── popup/
│   ├── popup.html         # Interface utilisateur
│   ├── popup.css          # Styles professionnels
│   └── popup.js           # Logique de la popup
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── generate-icons.html
└── README.md
```

## Notes importantes

- L'extension necessite que vous soyez connecte a Facebook
- Les delais aleatoires entre les actions imitent un comportement humain
- Facebook peut modifier son interface, ce qui peut necessiter des mises a jour du content script
- Utilisez de maniere responsable et respectez les conditions d'utilisation de Facebook

## Technologies

- **Chrome Extension Manifest V3**
- **Vanilla JavaScript** (ES6+)
- **Chrome Storage API** pour la persistance des donnees
- **Chrome Alarms API** pour la programmation
- **Chrome Notifications API** pour les alertes

## Licence

Usage personnel uniquement.

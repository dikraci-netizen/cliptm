# 📄 PDF Tools Pro

> Plateforme complète de gestion et manipulation de PDF - Tous vos outils PDF en un seul endroit.

## 🚀 Fonctionnalités

### Organiser
- **Fusionner PDF** — Combiner plusieurs PDFs en un seul
- **Diviser PDF** — Séparer un PDF en plusieurs fichiers
- **Compresser PDF** — Réduire la taille des fichiers
- **Supprimer Pages** — Retirer des pages spécifiques
- **Réordonner Pages** — Changer l'ordre des pages
- **Réparer PDF** — Réparer un PDF corrompu

### Convertir
- **Images → PDF** — Convertir des images en PDF
- **PDF → Images** — Extraire les pages en images
- **Extraire Texte** — Récupérer le texte du PDF
- **Noir & Blanc** — Convertir en niveaux de gris

### Sécurité
- **Protéger PDF** — Chiffrer avec mot de passe
- **Déverrouiller PDF** — Retirer la protection
- **Signer PDF** — Ajouter une signature image

### Éditer
- **Pivoter PDF** — Faire pivoter les pages
- **Filigrane** — Ajouter un filigrane texte
- **Numéroter Pages** — Ajouter des numéros
- **Éditer Métadonnées** — Modifier les infos du document
- **Voir Métadonnées** — Consulter les informations
- **Aplatir PDF** — Aplatir formulaires et annotations

## 📦 Installation

### Avec Docker (Recommandé)

```bash
docker-compose up -d
```

L'application sera accessible sur `http://localhost:3000`

### Installation manuelle

```bash
# Backend
cd backend
npm install
npm start

# L'application frontend est servie automatiquement par le backend
```

## 🛠️ Technologies

- **Backend** : Node.js, Express.js
- **PDF Engine** : pdf-lib, pdf-parse
- **Images** : Sharp
- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
- **Icons** : Font Awesome
- **Conteneurisation** : Docker

## 📁 Structure du projet

```
pdf-tools-platform/
├── backend/
│   ├── src/
│   │   ├── server.js              # Point d'entrée
│   │   ├── routes/pdf.routes.js   # Routes API
│   │   ├── controllers/           # Contrôleurs
│   │   ├── services/pdf.service.js # Logique métier
│   │   └── middleware/upload.js   # Gestion des uploads
│   ├── uploads/                   # Fichiers uploadés (temporaire)
│   ├── temp/                      # Fichiers traités (temporaire)
│   └── package.json
├── frontend/
│   └── public/
│       ├── index.html
│       ├── css/style.css
│       └── js/
│           ├── app.js
│           └── tools-config.js
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🔒 Sécurité

- Tous les fichiers sont supprimés automatiquement après 1 heure
- Rate limiting : 100 requêtes / 15 minutes par IP
- Taille max par fichier : 100 MB
- Validation des types MIME
- Noms de fichiers aléatoires (UUID)

## 📝 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/pdf/merge` | Fusionner PDFs |
| POST | `/api/pdf/split` | Diviser PDF |
| POST | `/api/pdf/compress` | Compresser PDF |
| POST | `/api/pdf/rotate` | Pivoter pages |
| POST | `/api/pdf/watermark` | Ajouter filigrane |
| POST | `/api/pdf/protect` | Protéger par mot de passe |
| POST | `/api/pdf/unlock` | Déverrouiller |
| POST | `/api/pdf/images-to-pdf` | Images vers PDF |
| POST | `/api/pdf/pdf-to-images` | PDF vers images |
| POST | `/api/pdf/extract-text` | Extraire texte |
| POST | `/api/pdf/page-numbers` | Numéroter pages |
| POST | `/api/pdf/remove-pages` | Supprimer pages |
| POST | `/api/pdf/reorder` | Réordonner pages |
| POST | `/api/pdf/metadata` | Voir métadonnées |
| POST | `/api/pdf/edit-metadata` | Éditer métadonnées |
| POST | `/api/pdf/flatten` | Aplatir PDF |
| POST | `/api/pdf/grayscale` | Noir & blanc |
| POST | `/api/pdf/sign` | Signer PDF |
| POST | `/api/pdf/repair` | Réparer PDF |
| GET | `/api/health` | Health check |

## 📄 Licence

MIT

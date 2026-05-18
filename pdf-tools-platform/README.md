# PDF Tools Pro v2.0 - La plateforme PDF la plus avancée

> Plus puissante que iLovePDF, SmallPDF et PDF24 combinés. 30+ outils professionnels avec IA, OCR, batch processing et temps réel.

## Ce qui nous rend unique

| Fonctionnalité | iLovePDF | SmallPDF | PDF24 | **PDF Tools Pro** |
|---|---|---|---|---|
| Outils de base | ✅ | ✅ | ✅ | ✅ |
| OCR intégré | ❌ | Premium | ✅ | **✅ Gratuit** |
| IA (Résumé/Analyse) | ❌ | ❌ | ❌ | **✅** |
| Comparaison PDF | ❌ | ❌ | ❌ | **✅** |
| Batch processing | Limité | Limité | ✅ | **✅ 50 fichiers** |
| WebSocket temps réel | ❌ | ❌ | ❌ | **✅** |
| Mode sombre | ❌ | ❌ | ❌ | **✅** |
| Multi-langue (FR/EN/AR) | Partiel | Partiel | Partiel | **✅ + RTL** |
| Command Palette | ❌ | ❌ | ❌ | **✅ Ctrl+K** |
| Annotations/Formes | Premium | Premium | ✅ | **✅ Gratuit** |
| Création formulaires | Premium | ❌ | ✅ | **✅ Gratuit** |
| Dashboard temps réel | ❌ | ❌ | ❌ | **✅** |
| Open Source | ❌ | ❌ | ❌ | **✅** |

## 30+ Outils disponibles

### Organiser
- Fusionner PDF • Diviser PDF • Compresser • Supprimer pages
- Réordonner pages • Extraire pages • Réparer • Redimensionner

### Convertir
- Images → PDF • PDF → Images • Extraire texte

### Éditer
- Pivoter • Filigrane • Numéroter pages • En-tête/Pied
- Métadonnées • Éditer métadonnées • Aplatir

### Sécurité
- Protéger (chiffrement) • Signer PDF • Rédaction (masquage)

### IA & Analyse
- OCR (reconnaissance de texte) • Résumé IA • Statistiques PDF • Comparer PDFs

### Avancé
- Annotations (texte, formes, surlignage) • Créer formulaire • Créer PDF from scratch

## Installation

### Docker (Recommandé)
```bash
docker-compose up -d
# → http://localhost:3000
```

### Manuel
```bash
cd backend
npm install
npm start
# → http://localhost:3000
```

## Architecture technique

```
├── backend/
│   ├── src/
│   │   ├── server.js              # Express + WebSocket server
│   │   ├── controllers/           # Request handlers
│   │   ├── services/
│   │   │   ├── pdf.service.js     # Core PDF operations
│   │   │   └── advanced.service.js # AI, OCR, Compare, Forms
│   │   ├── routes/                # API endpoints
│   │   ├── middleware/upload.js   # Multer (200MB, 50 files)
│   │   ├── queues/job-queue.js    # Job queue with priority
│   │   ├── websocket/ws-handler.js # Real-time progress
│   │   └── utils/helpers.js       # Utilities
│   ├── uploads/ temp/ output/     # Temporary storage
│   └── package.json
├── frontend/
│   └── public/
│       ├── index.html             # SPA entry point
│       ├── css/style.css          # Premium glassmorphism CSS
│       └── js/
│           ├── app.js             # Main application logic
│           ├── tools-config.js    # 30+ tools definitions
│           ├── i18n.js            # FR/EN/AR translations
│           └── websocket.js       # Real-time client
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Features premium

- **WebSocket** : Suivi en temps réel du traitement
- **Job Queue** : File d'attente avec priorité, retry automatique
- **Batch** : Traitement de 50 fichiers simultanément
- **Command Palette** : Ctrl+K pour recherche rapide
- **Dark Mode** : Interface sombre/claire avec persistance
- **i18n** : Français, English, العربية (avec RTL)
- **Auto-cleanup** : Fichiers supprimés après 1h
- **Rate limiting** : 200 requêtes/15min par IP
- **Responsive** : Mobile, tablette, desktop

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pdf/merge` | Merge multiple PDFs |
| POST | `/api/pdf/split` | Split PDF (ranges/fixed/each) |
| POST | `/api/pdf/compress` | Compress PDF |
| POST | `/api/pdf/rotate` | Rotate pages |
| POST | `/api/pdf/watermark` | Add text watermark |
| POST | `/api/pdf/protect` | Password protect |
| POST | `/api/pdf/page-numbers` | Add page numbers |
| POST | `/api/pdf/remove-pages` | Remove specific pages |
| POST | `/api/pdf/reorder` | Reorder pages |
| POST | `/api/pdf/extract-pages` | Extract pages |
| POST | `/api/pdf/extract-text` | Extract text content |
| POST | `/api/pdf/metadata` | Get metadata |
| POST | `/api/pdf/edit-metadata` | Edit metadata |
| POST | `/api/pdf/flatten` | Flatten forms |
| POST | `/api/pdf/repair` | Repair corrupted PDF |
| POST | `/api/pdf/sign` | Add signature image |
| POST | `/api/pdf/header-footer` | Add header/footer |
| POST | `/api/pdf/resize` | Resize pages |
| POST | `/api/convert/images-to-pdf` | Images to PDF |
| POST | `/api/convert/pdf-to-images` | PDF to images |
| POST | `/api/advanced/ocr` | OCR text recognition |
| POST | `/api/advanced/summarize` | AI summarization |
| POST | `/api/advanced/analyze` | PDF statistics |
| POST | `/api/advanced/compare` | Compare 2 PDFs |
| POST | `/api/advanced/redact` | Redaction |
| POST | `/api/advanced/annotate` | Add annotations |
| POST | `/api/advanced/create-form` | Create form fields |
| POST | `/api/advanced/create` | Create PDF from JSON |
| POST | `/api/batch/process` | Batch process files |
| GET | `/api/jobs/status` | Queue status |
| GET | `/api/health` | Health check |
| WS | `/ws` | WebSocket real-time |

## Licence

MIT

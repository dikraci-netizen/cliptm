# ClipTM — Workflow n8n professionnel : Génération + Publication vidéo automatique 100% gratuit

> Génère automatiquement des **vidéos verticales** (Shorts / Reels / TikTok) à partir d'une **niche** + un **mot-clé**, puis les **publie sur 6 réseaux sociaux** (YouTube, TikTok, Instagram, Facebook, X/Twitter, LinkedIn) — entièrement gratuit, self-hosted.

---

## Sommaire
1. [Schéma global du pipeline](#schéma-global-du-pipeline)
2. [Stack technique (tout gratuit)](#stack-technique-tout-gratuit)
3. [Installation rapide](#installation-rapide)
4. [Configuration des credentials](#configuration-des-credentials)
5. [Lancer la génération](#lancer-la-génération)
6. [Personnalisation](#personnalisation)
7. [FAQ & dépannage](#faq--dépannage)

---

## Schéma global du pipeline

```
┌───────────────────────────────────────────────────────────────────────────┐
│  WORKFLOW 1 : ClipTM - AI Video Generator                                 │
│                                                                           │
│  Trigger (Cron 6h / Manuel)                                               │
│        │                                                                  │
│        ▼                                                                  │
│  Configuration (niche, keyword, langue, durée, voix)                      │
│        │                                                                  │
│        ▼                                                                  │
│  Google Trends (RSS gratuit) ─► enrichissement du mot-clé                 │
│        │                                                                  │
│        ▼                                                                  │
│  Groq Llama 3.3 70B  ─► script JSON (titre, hook, scènes, CTA, SEO)       │
│        │                                                                  │
│        ▼                                                                  │
│  Split Scenes (boucle par scène)                                          │
│        │                                                                  │
│        ├──► Pollinations.ai  ─► image 1080×1920 par scène                 │
│        ├──► Edge TTS         ─► voix off MP3 par scène                    │
│        └──► FFmpeg           ─► clip mp4 avec zoom Ken-Burns              │
│        │                                                                  │
│        ▼                                                                  │
│  Aggregate ─► concat FFmpeg + musique de fond ─► final.mp4                │
│        │                                                                  │
│        ▼                                                                  │
│  Groq Whisper turbo ─► sous-titres SRT                                    │
│        │                                                                  │
│        ▼                                                                  │
│  FFmpeg ─► incrustation sous-titres style « TikTok » ─► final_subs.mp4    │
│        │                                                                  │
│        ▼                                                                  │
│  Google Drive (backup)  +  Webhook → Workflow 2                           │
└───────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  WORKFLOW 2 : ClipTM - Multi-Platform Publisher                           │
│                                                                           │
│  Webhook ─► Normalize Payload ─► Read Video binary                        │
│        │                                                                  │
│        ├──► YouTube Shorts  (OAuth2)                                      │
│        ├──► Facebook Page   (Graph API)                                   │
│        ├──► Instagram Reels (Graph API, 2 étapes : container → publish)   │
│        ├──► TikTok          (Content Posting API)                         │
│        ├──► X / Twitter     (API v2)                                      │
│        └──► LinkedIn        (REST API)                                    │
│        │                                                                  │
│        ▼                                                                  │
│  Google Sheets (logs OK/FAIL par plateforme)                              │
│        │                                                                  │
│        ▼                                                                  │
│  Telegram Bot (notification de publication)                               │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Stack technique (tout gratuit)

| Composant | Service | Coût | Limites du free-tier |
|---|---|---|---|
| Orchestration | **n8n** self-hosted | 0 € | Illimité |
| LLM (script + SEO) | **Groq** (Llama 3.3 70B) | 0 € | ~14 400 req/jour |
| Transcription / sous-titres | **Groq Whisper-large-v3-turbo** | 0 € | Idem Groq |
| Génération d'images | **Pollinations.ai** | 0 € | Pas de clé API |
| Voix off (TTS) | **Microsoft Edge TTS** | 0 € | Illimité, sans clé |
| Montage vidéo | **FFmpeg** | 0 € | Self-hosted |
| Stockage / backup | **Google Drive** | 0 € | 15 Go |
| Logs | **Google Sheets** | 0 € | Illimité |
| Notifications | **Telegram Bot** | 0 € | Illimité |
| Hébergement vidéo public | Cloudflare R2 / Catbox.moe / GitHub Releases | 0 € | 10 Go (R2) |
| Publication réseaux sociaux | APIs officielles | 0 € | Quotas standards |

---

## Installation rapide

### Pré-requis
- Docker + Docker Compose
- Un domaine ou un tunnel public (Cloudflare Tunnel, ngrok) — **uniquement** si tu veux publier sur Instagram/TikTok (qui nécessitent une URL publique vers ta vidéo)

### Étape 1 — Cloner et configurer

```bash
git clone https://github.com/dikraci-netizen/cliptm.git
cd cliptm/n8n-video-autoposter
cp .env.example .env
```

Édite le fichier `.env` :
- Génère une clé d'encryption : `openssl rand -hex 32` → colle dans `N8N_ENCRYPTION_KEY`
- Choisis ton mot de passe `N8N_PASSWORD`
- Le reste peut rester vide pour l'instant, on remplira après avoir créé les comptes.

### Étape 2 — Ajouter une musique de fond libre de droits (optionnel)

Place un fichier MP3 libre de droits dans `assets/music/bg.mp3`. Sources gratuites :
- [Pixabay Music](https://pixabay.com/music/) (CC0)
- [YouTube Audio Library](https://studio.youtube.com)
- [Free Music Archive](https://freemusicarchive.org)

Si tu n'en mets pas, retire le filtre `amix` du node "FFmpeg - Concat + BG music" du workflow.

### Étape 3 — Démarrer n8n

```bash
docker compose up -d --build
```

n8n est maintenant accessible sur `http://localhost:5678` (login : `admin` / mot de passe défini dans `.env`).

### Étape 4 — Importer les workflows

Dans l'interface n8n :
1. **Workflows → Import from file** → sélectionne `workflows/01-main-video-generator.json`
2. Recommence pour `workflows/02-multi-platform-publisher.json`

### Étape 5 — Créer les credentials

Suis le guide détaillé : **[docs/API_KEYS_GRATUITES.md](docs/API_KEYS_GRATUITES.md)**

Tu y trouveras pas-à-pas :
- Comment créer **toutes** les clés API gratuitement
- Comment les coller dans n8n

### Étape 6 — Connecter les deux workflows

Dans le workflow 1 (`AI Video Generator`), ajoute un dernier node **HTTP Request** (POST) qui appelle l'URL du webhook du workflow 2. L'URL apparaît dans le node "Webhook" du workflow 2 dès que tu l'actives.

Body à envoyer :
```json
{
  "title": "{{ $('Parse & Enrich Script').first().json.script.title }}",
  "description": "{{ $('Parse & Enrich Script').first().json.script.description }}",
  "hashtags": {{ $('Parse & Enrich Script').first().json.script.hashtags }},
  "youtube_tags": {{ $('Parse & Enrich Script').first().json.script.youtube_tags }},
  "video_path": "{{ $('Parse & Enrich Script').first().json.output_video_with_subs }}",
  "video_id": "{{ $('Parse & Enrich Script').first().json.video_id }}",
  "language": "{{ $('Parse & Enrich Script').first().json.language }}"
}
```

---

## Lancer la génération

### En manuel (pour tester)
1. Ouvre le workflow 1
2. Modifie les valeurs dans le node "Configuration" si besoin (ou via les variables d'env du `.env`)
3. Clique **Execute Workflow**

### En automatique
Le node "Schedule Trigger" est déjà configuré toutes les **6 heures**. Active simplement le workflow (toggle en haut à droite).

### Variables principales (dans `.env` ou node Configuration)
| Variable | Description | Exemple |
|---|---|---|
| `VIDEO_NICHE` | Niche thématique | `productivity`, `fitness`, `tech` |
| `VIDEO_KEYWORD` | Mot-clé cible | `morning routine` |
| `VIDEO_LANGUAGE` | Langue (fr / en / es / ar...) | `fr` |
| `VIDEO_DURATION` | Durée en secondes (15-60) | `45` |
| `VIDEO_VOICE` | Voix Edge TTS | `fr-FR-DeniseNeural` |

---

## Personnalisation

### Changer la voix (Edge TTS)
Liste complète : `edge-tts --list-voices` après installation.
Voix populaires :
- 🇫🇷 `fr-FR-DeniseNeural` (femme), `fr-FR-HenriNeural` (homme)
- 🇬🇧 `en-GB-SoniaNeural`, `en-US-AriaNeural`, `en-US-GuyNeural`
- 🇪🇸 `es-ES-ElviraNeural`
- 🇸🇦 `ar-SA-ZariyahNeural`

### Changer le style des sous-titres
Dans le node "FFmpeg - Burn Subtitles", édite la chaîne `force_style`. Exemple style « MrBeast » :
```
FontName=Arial Black,FontSize=18,PrimaryColour=&H0000FFFF,OutlineColour=&H00000000,BorderStyle=3,Outline=3,Shadow=2,Alignment=2,MarginV=160
```

### Changer le ratio (carré / horizontal)
Dans Pollinations URL : `width=1080&height=1080` (carré) ou `width=1920&height=1080` (16:9).
Dans le filtre FFmpeg `zoompan` : `s=1080x1080` ou `s=1920x1080`.

### Multi-niche planifié
Crée plusieurs Schedule Triggers, chacun connecté à son propre node "Configuration" avec une niche différente.

---

## FAQ & dépannage

**Q : Pourquoi Instagram et TikTok ont besoin d'une URL publique ?**
R : Leurs APIs n'acceptent pas l'upload direct de fichier. Il faut leur fournir une URL publique (`PUBLIC_VIDEO_URL_BASE`) qui pointe vers la vidéo. Solutions gratuites :
- **Cloudflare R2** : 10 Go/mois gratuit, distribution publique facile
- **Catbox.moe** : upload anonyme, URL directe
- **GitHub Releases** : 2 Go/release, publique
- **Cloudflare Tunnel** vers ton n8n : `cloudflared tunnel --url http://localhost:5678`

**Q : Groq tombe en rate limit ?**
R : Le free-tier Groq permet ~14 400 requêtes/jour. Si tu génères plusieurs vidéos par heure, ajoute un node "Wait" ou bascule sur un autre LLM gratuit (Mistral via OpenRouter free, ou Cerebras free-tier).

**Q : Mes vidéos ne sont pas approuvées par TikTok ?**
R : Le free-tier TikTok publie en mode "INBOX" (l'utilisateur doit valider dans l'app). Pour publier directement, demande l'audit TikTok Direct Post (gratuit aussi).

**Q : Comment éviter le shadow-ban ?**
R :
- Ne publie pas plus de 3-5 vidéos par jour par compte
- Espacement minimum 4h entre publications
- Varie les hashtags
- Active la rotation de musique de fond

**Q : Erreur FFmpeg "concat protocol"** ?
R : Vérifie que le fichier `concat.txt` contient bien `file '/chemin/absolu/clip.mp4'` avec des chemins absolus.

---

## Structure du repo

```
n8n-video-autoposter/
├── README.md                            # Ce fichier
├── Dockerfile                           # n8n + ffmpeg + edge-tts
├── docker-compose.yml
├── .env.example
├── workflows/
│   ├── 01-main-video-generator.json     # Pipeline génération
│   └── 02-multi-platform-publisher.json # Pipeline publication
├── scripts/
│   └── edge_tts.py                      # Wrapper TTS gratuit
├── assets/
│   ├── fonts/                           # (vide - mettre tes polices)
│   └── music/
│       └── bg.mp3                       # (à fournir)
└── docs/
    └── API_KEYS_GRATUITES.md            # Guide complet credentials
```

---

## Licence

MIT — utilise, modifie, partage librement.

## Contributions

PRs bienvenues. Idées de prochaines features :
- Nodes A/B testing (générer 3 variantes d'un même script)
- Auto-traduction multi-langue par vidéo
- Génération de thumbnail YouTube custom
- Retry automatique si une plateforme échoue
- Support Pinterest, Threads, Bluesky

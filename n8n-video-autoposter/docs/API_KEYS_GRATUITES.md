# Guide complet — Obtenir GRATUITEMENT toutes les clés API ClipTM

Ce guide explique pas-à-pas comment créer **chaque** credential nécessaire au workflow, sans payer un seul euro.

---

## Sommaire
1. [Groq API (script IA + sous-titres)](#1-groq-api)
2. [Google Drive + Sheets + YouTube](#2-google-cloud-drive--sheets--youtube)
3. [Facebook Page + Instagram Business](#3-facebook-page--instagram-business)
4. [TikTok Content Posting API](#4-tiktok-content-posting-api)
5. [X / Twitter API](#5-x--twitter-api)
6. [LinkedIn API](#6-linkedin-api)
7. [Telegram Bot](#7-telegram-bot)
8. [Hébergement vidéo public gratuit](#8-hébergement-vidéo-public-gratuit)

---

## 1. Groq API
**Usage : génération du script Llama 3.3 + sous-titres Whisper**

### Étapes
1. Va sur https://console.groq.com et inscris-toi (Google login OK).
2. Menu **API Keys → Create API Key** → nomme-la `cliptm`.
3. Copie la clé (commence par `gsk_...`).

### Configuration dans n8n
- Credentials → New → **Header Auth**
- Name : `Groq API`
- Header Name : `Authorization`
- Header Value : `Bearer gsk_xxxxxxxxxxxxx`

✅ **Free tier** : 14 400 requêtes/jour, 30 req/min. Largement assez pour 50+ vidéos/jour.

---

## 2. Google Cloud (Drive + Sheets + YouTube)
**Usage : backup vidéo, logs, publication YouTube Shorts**

### Étape 2.1 — Créer un projet Google Cloud
1. https://console.cloud.google.com → **Nouveau projet** → nom `cliptm`.
2. Menu **APIs & Services → Library** → active ces 3 APIs :
   - Google Drive API
   - Google Sheets API
   - YouTube Data API v3

### Étape 2.2 — Configurer l'écran de consentement OAuth
1. **APIs & Services → OAuth consent screen**
2. Type : **External** → Create
3. Remplis nom de l'app, email, et ajoute toi-même comme **Test user**

### Étape 2.3 — Créer l'identifiant OAuth
1. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
2. Application type : **Web application**
3. Authorized redirect URIs : `https://TON_DOMAINE/rest/oauth2-credential/callback`
   (en local : `http://localhost:5678/rest/oauth2-credential/callback`)
4. Copie **Client ID** et **Client Secret**.

### Configuration dans n8n
Crée 3 credentials, **toutes** avec le même Client ID / Secret :

#### Google Drive
- Type : `Google Drive OAuth2 API`
- Name : `Google Drive`
- Connect → autorise.

#### Google Sheets
- Type : `Google Sheets OAuth2 API`
- Name : `Google Sheets`

#### YouTube
- Type : `YouTube OAuth2 API`
- Name : `YouTube OAuth2`

✅ **Free tier** : YouTube = 10 000 unités/jour (≈ 6 uploads). Drive = 15 Go. Sheets = illimité.

---

## 3. Facebook Page + Instagram Business
**Usage : publication Reels Instagram + vidéos Facebook**

### Pré-requis
- Une **Page Facebook** (pas un profil perso)
- Un compte **Instagram Business** ou Creator lié à cette page (Settings IG → Account → Switch to Professional)

### Étape 3.1 — Créer l'app Meta
1. https://developers.facebook.com → **My Apps → Create App**
2. Type : **Business** → nom `cliptm`
3. Dashboard de l'app → ajoute les produits :
   - **Instagram Graph API**
   - **Facebook Login**
   - **Pages API**

### Étape 3.2 — Récupérer un long-lived Page Access Token
1. https://developers.facebook.com/tools/explorer/
2. Sélectionne ton app → **User Token** avec les permissions :
   - `pages_show_list`
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `instagram_basic`
   - `instagram_content_publish`
3. **Generate Access Token** → autorise.
4. Copie le token, puis convertis-le en long-lived (60 jours) :
   ```bash
   curl "https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=USER_TOKEN"
   ```
5. Récupère le **Page Access Token** (qui n'expire jamais) :
   ```bash
   curl "https://graph.facebook.com/v19.0/me/accounts?access_token=LONG_LIVED_USER_TOKEN"
   ```
   → tu obtiens une liste avec `access_token` et `id` de chaque Page.

### Étape 3.3 — Récupérer l'IG User ID
```bash
curl "https://graph.facebook.com/v19.0/PAGE_ID?fields=instagram_business_account&access_token=PAGE_TOKEN"
```
→ retourne `{ "instagram_business_account": { "id": "17841..." } }`

### Configuration dans `.env` et n8n
- `FB_PAGE_ID=...` (depuis l'étape 3.2)
- `IG_USER_ID=...` (depuis l'étape 3.3)
- n8n credential **Query Auth** nommée `Facebook Page Token` :
  - Param name : `access_token`
  - Param value : `<ton page token>`
- n8n credential **Query Auth** nommée `Instagram Graph Token` (même valeur que Facebook).

✅ **Free tier** : 200 publications par heure par Page.

---

## 4. TikTok Content Posting API
**Usage : publication TikTok**

### Étapes
1. https://developers.tiktok.com → **Manage apps → Create new app**
2. Choisis **Login Kit** + **Content Posting API**
3. Dans **Content Posting API**, ajoute le scope `video.upload`
4. Submit for review (validation = quelques heures).
5. Une fois approuvé, génère un **OAuth Bearer Token** via le flow Login Kit (OAuth2 standard) avec un de tes comptes TikTok.

### Configuration dans n8n
Credential **Header Auth** nommée `TikTok OAuth Bearer` :
- Header Name : `Authorization`
- Header Value : `Bearer act.xxxxxxxxxxxxx`

⚠️ Le token TikTok expire toutes les 24h. Pour automatiser le refresh, ajoute un sous-workflow qui appelle `/v2/oauth/token/` toutes les 23h avec le `refresh_token`.

✅ **Free tier** : Sandbox = mode INBOX (utilisateur valide manuellement). Mode Direct Post = audit gratuit à demander.

---

## 5. X / Twitter API
**Usage : tweet du titre + lien vers la vidéo**

### Étapes
1. https://developer.x.com → **Sign up for Free Account** (gratuit)
2. Crée un projet + une app
3. **User authentication settings** :
   - Type : **OAuth 1.0a**
   - Permissions : Read and Write
   - Callback URL : `http://localhost:5678/rest/oauth1-credential/callback`
4. Récupère :
   - API Key + API Secret (Consumer keys)
   - Access Token + Access Token Secret (Authentication Tokens → Generate)

### Configuration dans n8n
Credential **OAuth1 API** nommée `X / Twitter OAuth1` :
- Auth URL : `https://api.twitter.com/oauth/authorize`
- Access Token URL : `https://api.twitter.com/oauth/access_token`
- Consumer Key + Consumer Secret + Access Token + Access Token Secret = ce que tu viens de copier
- Signature Method : HMAC-SHA1

✅ **Free tier** : 1 500 tweets/mois en écriture. Pas d'upload vidéo direct dans le free-tier — c'est pourquoi le workflow envoie le **titre + hashtags** seulement (la vidéo se trouve sur YouTube/IG, donc le tweet sert de teaser).

---

## 6. LinkedIn API
**Usage : post professionnel sur ton profil**

### Étapes
1. https://www.linkedin.com/developers → **Create app**
2. Associe-la à ta page entreprise (créée gratuitement si besoin)
3. Onglet **Products** → demande l'accès à :
   - **Sign In with LinkedIn using OpenID Connect**
   - **Share on LinkedIn**
4. Onglet **Auth** → ajoute redirect URL n8n.
5. Récupère **Client ID** et **Client Secret**.

### Récupérer ton Person URN
Une fois OAuth configuré dans n8n, exécute un appel test à `https://api.linkedin.com/v2/userinfo` → tu obtiens `sub: "ABC123"`.
→ ton URN = `urn:li:person:ABC123` → mets-le dans `.env` `LINKEDIN_PERSON_URN`.

### Configuration dans n8n
Credential **LinkedIn OAuth2 API** nommée `LinkedIn OAuth2`.

✅ **Free tier** : 500 appels/jour.

---

## 7. Telegram Bot
**Usage : notifications après publication**

### Étapes
1. Sur Telegram, parle à **@BotFather** → `/newbot` → suis les instructions
2. Tu reçois un **token** type `123456:ABC-DEF...`
3. Crée un canal/groupe privé, ajoute ton bot dedans (en admin)
4. Récupère ton `chat_id` :
   - Envoie un message dans le canal
   - Va sur `https://api.telegram.org/bot<TON_TOKEN>/getUpdates`
   - Cherche `"chat":{"id":-1001234567890,...}` → c'est ton chat_id

### Configuration dans `.env`
```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_CHAT_ID=-1001234567890
```

✅ **Free tier** : illimité.

---

## 8. Hébergement vidéo public gratuit

Instagram Reels et TikTok exigent une **URL publique** pointant vers ta vidéo MP4. Voici 3 options 100% gratuites.

### Option A — Cloudflare R2 (recommandé)
- 10 Go/mois gratuit, transfert gratuit
- https://dash.cloudflare.com → R2 → Create bucket `cliptm-videos`
- Active **Public Access** sur le bucket
- Crée un token API R2 (write) pour uploader depuis n8n
- Ajoute un node `S3` n8n configuré avec l'endpoint R2 :
  - Endpoint : `https://<account_id>.r2.cloudflarestorage.com`
  - Région : `auto`

Mets dans `.env` :
```env
PUBLIC_VIDEO_URL_BASE=https://pub-xxxxx.r2.dev
```

### Option B — Catbox.moe (le plus simple)
- Aucun compte requis
- Upload via curl :
  ```bash
  curl -F "reqtype=fileupload" -F "fileToUpload=@final.mp4" https://catbox.moe/user/api.php
  ```
- Retourne directement l'URL publique
- Limite : 200 Mo par fichier

### Option C — GitHub Releases
- Crée une release dans ton repo cliptm, uploade la vidéo, copie l'URL du `assets/.../video.mp4`
- Limite : 2 Go par fichier

---

## Récapitulatif des credentials n8n à créer

| Nom du credential | Type | Pour |
|---|---|---|
| `Groq API` | Header Auth | Workflow 1 (script + Whisper) |
| `Google Drive` | Google OAuth2 | Workflow 1 (backup) |
| `Google Sheets` | Google OAuth2 | Workflow 2 (logs) |
| `YouTube OAuth2` | YouTube OAuth2 | Workflow 2 (Shorts) |
| `Facebook Page Token` | Query Auth | Workflow 2 (FB) |
| `Instagram Graph Token` | Query Auth | Workflow 2 (IG) |
| `TikTok OAuth Bearer` | Header Auth | Workflow 2 (TikTok) |
| `X / Twitter OAuth1` | OAuth1 API | Workflow 2 (X) |
| `LinkedIn OAuth2` | LinkedIn OAuth2 | Workflow 2 (LI) |

---

## Coût total mensuel : **0 €** ✅

Tant que tu restes en-dessous de :
- 50 vidéos / jour (Groq)
- 6 uploads YouTube / jour
- 10 Go stockage Cloudflare R2
- 5 publications IG/FB par compte par heure

Si tu dépasses → option upgrade payante : Groq Dev = 0,05 $/M tokens, R2 = 0,015 $/Go, etc. Tout reste très peu cher.

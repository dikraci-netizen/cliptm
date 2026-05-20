# ClipTM Social - AI Content Creator App 🇲🇦🇫🇷🇬🇧

Application Android de création de contenu social media propulsée par l'IA, avec support multilingue complet.

## 🌍 Langues supportées

| Langue | Code | Support |
|--------|------|---------|
| 🇬🇧 English | en | Full |
| 🇫🇷 Français | fr | Full |
| 🇲🇦 العربية الفصحى (Arabic MSA) | ar | Full |
| 🇲🇦 الدارجة المغربية (Darija) | darija | Full (Arabizi + Arabic script) |

## 📱 Fonctionnalités

- **Chat AI** - Interface conversationnelle avec l'agent de contenu
- **Multi-plateformes** - Instagram, TikTok, Facebook, YouTube, LinkedIn, Twitter/X, Pinterest
- **Types de contenu** - Posts, scripts vidéo, carrousels, ad copy, threads, calendriers éditoriaux
- **Configuration flexible** - Choix de langues, plateformes, ton de voix, audience
- **Copier/Coller** - Contenu généré copiable en un tap
- **Spintax** - Variations automatiques du contenu

## 🏗️ Architecture

```
app/
├── data/
│   ├── api/           # Retrofit OpenAI API service
│   ├── model/         # Data models (Language, Platform, ContentType, etc.)
│   └── repository/    # Chat repository with system prompt integration
├── di/                # Hilt dependency injection
├── ui/
│   ├── components/    # Reusable UI components (ConfigBottomSheet)
│   ├── navigation/    # Compose Navigation
│   ├── screens/       # Home, Chat, Settings screens
│   ├── theme/         # Material3 theme
│   └── viewmodel/     # Chat ViewModel
├── MainActivity.kt
└── SocialMediaApp.kt
```

## 🛠️ Tech Stack

- **Kotlin** + **Jetpack Compose** (UI)
- **Material3** Design
- **Hilt** (Dependency Injection)
- **Retrofit + OkHttp** (Networking)
- **Coroutines + Flow** (Async)
- **Navigation Compose**
- **DataStore** (Preferences)

## 🚀 Setup

1. Clone le repository
2. Ouvre dans Android Studio
3. Ajoute ta clé API dans l'app (Settings ou Config panel)
4. Build & Run

### Configuration API

L'app supporte toute API compatible OpenAI :
- **OpenAI** : `https://api.openai.com/`
- **Azure OpenAI** : Ton endpoint Azure
- **Groq** : `https://api.groq.com/openai/`
- **Local (Ollama)** : `http://localhost:11434/v1/`

## 📝 Utilisation

1. Ouvre l'app
2. Configure tes préférences (langues, plateformes, audience)
3. Entre ta clé API
4. Décris le contenu que tu veux :
   - "Crée 3 posts Instagram en Darija pour une pâtisserie"
   - "Script TikTok sur les tips beauté en arabe et français"
   - "Calendrier éditorial d'une semaine pour une marque fitness"

## 📄 License

MIT

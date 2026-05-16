// ============ INTERNATIONALIZATION ============
const TRANSLATIONS = {
  fr: {
    'nav.home': 'Accueil',
    'nav.tools': 'Outils',
    'nav.batch': 'Batch',
    'nav.dashboard': 'Dashboard',
    'hero.badge': 'Plus avancé que iLovePDF, SmallPDF & PDF24',
    'hero.title1': 'La plateforme PDF',
    'hero.title2': 'la plus puissante',
    'hero.subtitle': '30+ outils professionnels. OCR intelligent, IA intégrée, traitement batch, comparaison de documents et bien plus. 100% gratuit.',
    'hero.cta1': 'Explorer les outils',
    'hero.cta2': 'Mode Batch',
    'hero.stat1': 'Outils PDF',
    'hero.stat2': 'IA Intégrée',
    'hero.stat3': 'Temps réel',
    'hero.stat4': '100% Sécurisé',
    'tools.title': 'Tous nos outils PDF',
    'tools.subtitle': 'Choisissez parmi plus de 30 outils professionnels pour manipuler vos PDFs',
    'tools.search': 'Rechercher un outil...',
    'cat.all': 'Tous',
    'cat.organize': 'Organiser',
    'cat.convert': 'Convertir',
    'cat.edit': 'Éditer',
    'cat.security': 'Sécurité',
    'cat.ai': 'IA & Analyse',
    'cat.advanced': 'Avancé',
    'workspace.back': 'Retour',
    'batch.title': 'Mode Batch - Traitement en masse',
    'batch.subtitle': 'Traitez des dizaines de fichiers simultanément avec suivi en temps réel',
    'dashboard.title': 'Dashboard temps réel',
    'features.title': 'Pourquoi nous sommes différents',
    'features.subtitle': 'Des fonctionnalités que vous ne trouverez nulle part ailleurs',
    'features.ai.title': 'IA Intégrée',
    'features.ai.desc': 'Résumé automatique, analyse de contenu, extraction intelligente et OCR avancé propulsé par l\'intelligence artificielle.',
    'features.realtime.title': 'Temps Réel',
    'features.realtime.desc': 'Suivi en direct via WebSocket. Barre de progression live, queue de jobs et notifications instantanées.',
    'features.batch.title': 'Batch Processing',
    'features.batch.desc': 'Traitez 50 fichiers en une seule opération. Compression, watermark, numérotation en masse avec export ZIP.',
    'features.compare.title': 'Comparaison PDF',
    'features.compare.desc': 'Comparez deux PDFs côte à côte avec diff visuel, pourcentage de similarité et rapport détaillé.',
    'features.redact.title': 'Rédaction Sécurisée',
    'features.redact.desc': 'Masquez les informations sensibles de manière irréversible. Rédaction par zones ou par mots-clés.',
    'features.dark.title': 'Mode Sombre',
    'features.dark.desc': 'Interface élégante avec mode sombre/clair, animations fluides et design glassmorphism premium.',
    'footer.desc': 'La plateforme PDF la plus avancée au monde. Plus de 30 outils professionnels gratuits.',
    'footer.tools': 'Outils populaires',
    'footer.advanced': 'Fonctions avancées',
    'footer.info': 'Informations',
    'footer.rights': 'Tous droits réservés.',
    'upload.title': 'Glissez vos fichiers ici',
    'upload.subtitle': 'ou cliquez pour sélectionner',
    'btn.process': 'Traiter',
    'btn.download': 'Télécharger',
    'result.success': 'Traitement terminé !',
    'result.size': 'Taille',
  },
  en: {
    'nav.home': 'Home',
    'nav.tools': 'Tools',
    'nav.batch': 'Batch',
    'nav.dashboard': 'Dashboard',
    'hero.badge': 'More advanced than iLovePDF, SmallPDF & PDF24',
    'hero.title1': 'The most powerful',
    'hero.title2': 'PDF platform',
    'hero.subtitle': '30+ professional tools. Smart OCR, built-in AI, batch processing, document comparison and more. 100% free.',
    'hero.cta1': 'Explore tools',
    'hero.cta2': 'Batch Mode',
    'hero.stat1': 'PDF Tools',
    'hero.stat2': 'Built-in AI',
    'hero.stat3': 'Real-time',
    'hero.stat4': '100% Secure',
    'tools.title': 'All our PDF tools',
    'tools.subtitle': 'Choose from 30+ professional tools to manipulate your PDFs',
    'tools.search': 'Search for a tool...',
    'cat.all': 'All',
    'cat.organize': 'Organize',
    'cat.convert': 'Convert',
    'cat.edit': 'Edit',
    'cat.security': 'Security',
    'cat.ai': 'AI & Analysis',
    'cat.advanced': 'Advanced',
    'workspace.back': 'Back',
    'batch.title': 'Batch Mode - Mass Processing',
    'batch.subtitle': 'Process dozens of files simultaneously with real-time tracking',
    'dashboard.title': 'Real-time Dashboard',
    'features.title': 'Why we\'re different',
    'features.subtitle': 'Features you won\'t find anywhere else',
    'features.ai.title': 'Built-in AI',
    'features.ai.desc': 'Automatic summary, content analysis, smart extraction and advanced OCR powered by artificial intelligence.',
    'features.realtime.title': 'Real-Time',
    'features.realtime.desc': 'Live tracking via WebSocket. Live progress bar, job queue and instant notifications.',
    'features.batch.title': 'Batch Processing',
    'features.batch.desc': 'Process 50 files in a single operation. Compression, watermark, numbering in bulk with ZIP export.',
    'features.compare.title': 'PDF Comparison',
    'features.compare.desc': 'Compare two PDFs side by side with visual diff, similarity percentage and detailed report.',
    'features.redact.title': 'Secure Redaction',
    'features.redact.desc': 'Mask sensitive information irreversibly. Redaction by zones or by keywords.',
    'features.dark.title': 'Dark Mode',
    'features.dark.desc': 'Elegant interface with dark/light mode, smooth animations and premium glassmorphism design.',
    'footer.desc': 'The world\'s most advanced PDF platform. Over 30 free professional tools.',
    'footer.tools': 'Popular tools',
    'footer.advanced': 'Advanced features',
    'footer.info': 'Information',
    'footer.rights': 'All rights reserved.',
    'upload.title': 'Drop your files here',
    'upload.subtitle': 'or click to select',
    'btn.process': 'Process',
    'btn.download': 'Download',
    'result.success': 'Processing complete!',
    'result.size': 'Size',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.tools': 'الأدوات',
    'nav.batch': 'معالجة جماعية',
    'nav.dashboard': 'لوحة التحكم',
    'hero.badge': 'أكثر تقدماً من iLovePDF و SmallPDF و PDF24',
    'hero.title1': 'منصة PDF',
    'hero.title2': 'الأقوى',
    'hero.subtitle': 'أكثر من 30 أداة احترافية. OCR ذكي، ذكاء اصطناعي مدمج، معالجة جماعية، مقارنة المستندات والمزيد. مجاني 100%.',
    'hero.cta1': 'استكشف الأدوات',
    'hero.cta2': 'الوضع الجماعي',
    'tools.title': 'جميع أدوات PDF',
    'tools.subtitle': 'اختر من بين أكثر من 30 أداة احترافية',
    'cat.all': 'الكل',
    'workspace.back': 'رجوع',
    'footer.rights': 'جميع الحقوق محفوظة.',
  }
};

let currentLang = localStorage.getItem('pdftools_lang') || 'fr';

function t(key) {
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['fr'][key] || key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key);
    if (translation) el.textContent = translation;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translation = t(key);
    if (translation) el.placeholder = translation;
  });
}

function toggleLanguage() {
  const langs = ['fr', 'en', 'ar'];
  const idx = langs.indexOf(currentLang);
  currentLang = langs[(idx + 1) % langs.length];
  localStorage.setItem('pdftools_lang', currentLang);
  document.getElementById('langLabel').textContent = currentLang.toUpperCase();
  applyTranslations();
  
  // RTL support for Arabic
  if (currentLang === 'ar') {
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.removeAttribute('dir');
  }
}

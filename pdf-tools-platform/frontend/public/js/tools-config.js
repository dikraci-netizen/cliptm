// ============ COMPLETE TOOLS CONFIGURATION ============
const TOOLS = [
  // ===== ORGANIZE =====
  { id: 'merge', name: 'Fusionner PDF', nameEn: 'Merge PDF', description: 'Combiner plusieurs PDFs en un seul document', descEn: 'Combine multiple PDFs into one document', icon: 'fas fa-object-group', color: 'red', category: 'organize', multiple: true, accept: '.pdf', endpoint: '/api/pdf/merge', options: [] },
  { id: 'split', name: 'Diviser PDF', nameEn: 'Split PDF', description: 'Séparer un PDF en plusieurs fichiers par pages', descEn: 'Split a PDF into multiple files by pages', icon: 'fas fa-cut', color: 'blue', category: 'organize', multiple: false, accept: '.pdf', endpoint: '/api/pdf/split', options: [
    { name: 'mode', label: 'Mode', type: 'select', choices: [{ value: 'each', label: 'Chaque page séparée' }, { value: 'fixed', label: 'Toutes les N pages' }, { value: 'ranges', label: 'Plages personnalisées' }] },
    { name: 'ranges', label: 'Plages (ex: 1-3;5-7;8-10)', type: 'text', placeholder: '1-3;5-7;8-10', showIf: 'ranges' }
  ]},
  { id: 'compress', name: 'Compresser PDF', nameEn: 'Compress PDF', description: 'Réduire la taille sans perte de qualité visible', descEn: 'Reduce file size without visible quality loss', icon: 'fas fa-compress-arrows-alt', color: 'green', category: 'organize', multiple: false, accept: '.pdf', endpoint: '/api/pdf/compress', options: [
    { name: 'quality', label: 'Niveau', type: 'select', choices: [{ value: 'extreme', label: 'Compression maximale' }, { value: 'recommended', label: 'Recommandé (équilibré)' }, { value: 'high', label: 'Haute qualité' }] }
  ]},
  { id: 'remove-pages', name: 'Supprimer Pages', nameEn: 'Remove Pages', description: 'Retirer des pages spécifiques du document', descEn: 'Remove specific pages from document', icon: 'fas fa-eraser', color: 'red', category: 'organize', multiple: false, accept: '.pdf', endpoint: '/api/pdf/remove-pages', options: [
    { name: 'pages', label: 'Pages à supprimer', type: 'text', placeholder: 'Ex: 1,3,5-7', required: true }
  ]},
  { id: 'reorder', name: 'Réordonner Pages', nameEn: 'Reorder Pages', description: 'Changer l\'ordre des pages par glisser-déposer', descEn: 'Change page order by drag and drop', icon: 'fas fa-sort-numeric-down', color: 'purple', category: 'organize', multiple: false, accept: '.pdf', endpoint: '/api/pdf/reorder', options: [
    { name: 'order', label: 'Nouvel ordre (ex: 3,1,2,5,4)', type: 'text', placeholder: '3,1,2,5,4', required: true }
  ]},
  { id: 'extract-pages', name: 'Extraire Pages', nameEn: 'Extract Pages', description: 'Extraire certaines pages dans un nouveau PDF', descEn: 'Extract specific pages into a new PDF', icon: 'fas fa-file-export', color: 'teal', category: 'organize', multiple: false, accept: '.pdf', endpoint: '/api/pdf/extract-pages', options: [
    { name: 'pages', label: 'Pages à extraire', type: 'text', placeholder: 'Ex: 1-3,5,8-10', required: true }
  ]},
  { id: 'repair', name: 'Réparer PDF', nameEn: 'Repair PDF', description: 'Tenter de réparer un PDF corrompu ou endommagé', descEn: 'Try to repair a corrupted PDF file', icon: 'fas fa-wrench', color: 'orange', category: 'organize', multiple: false, accept: '.pdf', endpoint: '/api/pdf/repair', options: [] },
  { id: 'resize', name: 'Redimensionner', nameEn: 'Resize Pages', description: 'Changer le format des pages (A4, Letter, A3...)', descEn: 'Change page size format (A4, Letter, A3...)', icon: 'fas fa-expand-arrows-alt', color: 'indigo', category: 'organize', multiple: false, accept: '.pdf', endpoint: '/api/pdf/resize', options: [
    { name: 'targetSize', label: 'Format cible', type: 'select', choices: [{ value: 'A4', label: 'A4 (210 × 297 mm)' }, { value: 'A3', label: 'A3 (297 × 420 mm)' }, { value: 'A5', label: 'A5 (148 × 210 mm)' }, { value: 'Letter', label: 'Letter US (216 × 279 mm)' }, { value: 'Legal', label: 'Legal US (216 × 356 mm)' }] }
  ]},

  // ===== CONVERT =====
  { id: 'images-to-pdf', name: 'Images → PDF', nameEn: 'Images to PDF', description: 'Convertir JPG, PNG, WebP en PDF avec mise en page', descEn: 'Convert JPG, PNG, WebP to PDF with layout', icon: 'fas fa-images', color: 'blue', category: 'convert', multiple: true, accept: '.png,.jpg,.jpeg,.webp,.tiff,.gif,.bmp', endpoint: '/api/convert/images-to-pdf', options: [
    { name: 'pageSize', label: 'Taille de page', type: 'select', choices: [{ value: 'A4', label: 'A4' }, { value: 'Letter', label: 'Letter' }, { value: 'auto', label: 'Auto (taille image)' }] },
    { name: 'margin', label: 'Marge (px)', type: 'number', placeholder: '20' },
    { name: 'quality', label: 'Qualité', type: 'select', choices: [{ value: 'high', label: 'Haute' }, { value: 'medium', label: 'Moyenne' }, { value: 'low', label: 'Basse (petit fichier)' }] }
  ]},
  { id: 'pdf-to-images', name: 'PDF → Images', nameEn: 'PDF to Images', description: 'Extraire chaque page comme image haute résolution', descEn: 'Extract each page as high-res image', icon: 'fas fa-file-image', color: 'purple', category: 'convert', multiple: false, accept: '.pdf', endpoint: '/api/convert/pdf-to-images', options: [
    { name: 'format', label: 'Format', type: 'select', choices: [{ value: 'png', label: 'PNG (sans perte)' }, { value: 'jpg', label: 'JPEG (compact)' }] },
    { name: 'dpi', label: 'Résolution (DPI)', type: 'number', placeholder: '150' }
  ]},
  { id: 'extract-text', name: 'Extraire Texte', nameEn: 'Extract Text', description: 'Récupérer tout le texte contenu dans un PDF', descEn: 'Extract all text content from PDF', icon: 'fas fa-font', color: 'teal', category: 'convert', multiple: false, accept: '.pdf', endpoint: '/api/pdf/extract-text', responseType: 'json', options: [] },

  // ===== EDIT =====
  { id: 'rotate', name: 'Pivoter PDF', nameEn: 'Rotate PDF', description: 'Faire pivoter les pages (90°, 180°, 270°)', descEn: 'Rotate pages (90, 180, 270 degrees)', icon: 'fas fa-redo', color: 'purple', category: 'edit', multiple: false, accept: '.pdf', endpoint: '/api/pdf/rotate', options: [
    { name: 'angle', label: 'Angle', type: 'select', choices: [{ value: '90', label: '90° →' }, { value: '180', label: '180° ↓' }, { value: '270', label: '270° ←' }] },
    { name: 'pages', label: 'Pages (vide = toutes)', type: 'text', placeholder: 'Ex: 1,3,5' }
  ]},
  { id: 'watermark', name: 'Filigrane', nameEn: 'Watermark', description: 'Ajouter un filigrane texte personnalisable', descEn: 'Add customizable text watermark', icon: 'fas fa-tint', color: 'teal', category: 'edit', multiple: false, accept: '.pdf', endpoint: '/api/pdf/watermark', options: [
    { name: 'text', label: 'Texte', type: 'text', placeholder: 'CONFIDENTIEL', required: true },
    { name: 'position', label: 'Position', type: 'select', choices: [{ value: 'diagonal', label: 'Diagonal (centre)' }, { value: 'center', label: 'Centre' }, { value: 'top-left', label: 'Haut gauche' }, { value: 'top-right', label: 'Haut droite' }, { value: 'bottom-left', label: 'Bas gauche' }, { value: 'bottom-right', label: 'Bas droite' }] },
    { name: 'opacity', label: 'Opacité (0.1-1)', type: 'number', placeholder: '0.3' },
    { name: 'fontSize', label: 'Taille police', type: 'number', placeholder: '60' },
    { name: 'color', label: 'Couleur', type: 'color', defaultValue: '#808080' }
  ]},
  { id: 'page-numbers', name: 'Numéroter Pages', nameEn: 'Page Numbers', description: 'Ajouter des numéros avec styles personnalisés', descEn: 'Add page numbers with custom styles', icon: 'fas fa-list-ol', color: 'orange', category: 'edit', multiple: false, accept: '.pdf', endpoint: '/api/pdf/page-numbers', options: [
    { name: 'position', label: 'Position', type: 'select', choices: [{ value: 'bottom-center', label: 'Bas centre' }, { value: 'bottom-left', label: 'Bas gauche' }, { value: 'bottom-right', label: 'Bas droite' }, { value: 'top-center', label: 'Haut centre' }, { value: 'top-left', label: 'Haut gauche' }, { value: 'top-right', label: 'Haut droite' }] },
    { name: 'format', label: 'Format', type: 'select', choices: [{ value: 'numeric', label: '1, 2, 3...' }, { value: 'of_total', label: '1 / 10' }, { value: 'roman', label: 'I, II, III...' }, { value: 'alpha', label: 'A, B, C...' }] },
    { name: 'startFrom', label: 'Commencer à', type: 'number', placeholder: '1' },
    { name: 'prefix', label: 'Préfixe', type: 'text', placeholder: 'Page ' },
    { name: 'suffix', label: 'Suffixe', type: 'text', placeholder: '' }
  ]},
  { id: 'header-footer', name: 'En-tête / Pied', nameEn: 'Header / Footer', description: 'Ajouter en-tête et pied de page personnalisés', descEn: 'Add custom header and footer', icon: 'fas fa-heading', color: 'indigo', category: 'edit', multiple: false, accept: '.pdf', endpoint: '/api/pdf/header-footer', options: [
    { name: 'header', label: 'En-tête ({page} = n° page, {total} = total, {date} = date)', type: 'text', placeholder: 'Document - Page {page}/{total}' },
    { name: 'footer', label: 'Pied de page', type: 'text', placeholder: 'Confidentiel - {date}' },
    { name: 'fontSize', label: 'Taille', type: 'number', placeholder: '10' }
  ]},
  { id: 'metadata', name: 'Métadonnées', nameEn: 'Metadata', description: 'Voir et modifier les propriétés du document', descEn: 'View and edit document properties', icon: 'fas fa-info-circle', color: 'blue', category: 'edit', multiple: false, accept: '.pdf', endpoint: '/api/pdf/metadata', responseType: 'json', options: [] },
  { id: 'edit-metadata', name: 'Éditer Métadonnées', nameEn: 'Edit Metadata', description: 'Modifier titre, auteur, sujet et mots-clés', descEn: 'Edit title, author, subject and keywords', icon: 'fas fa-tags', color: 'green', category: 'edit', multiple: false, accept: '.pdf', endpoint: '/api/pdf/edit-metadata', options: [
    { name: 'title', label: 'Titre', type: 'text', placeholder: 'Titre du document' },
    { name: 'author', label: 'Auteur', type: 'text', placeholder: 'Nom de l\'auteur' },
    { name: 'subject', label: 'Sujet', type: 'text', placeholder: 'Sujet' },
    { name: 'keywords', label: 'Mots-clés (séparés par virgule)', type: 'text', placeholder: 'pdf, document, rapport' }
  ]},
  { id: 'flatten', name: 'Aplatir PDF', nameEn: 'Flatten PDF', description: 'Aplatir les formulaires et annotations interactifs', descEn: 'Flatten interactive forms and annotations', icon: 'fas fa-layer-group', color: 'orange', category: 'edit', multiple: false, accept: '.pdf', endpoint: '/api/pdf/flatten', options: [] },

  // ===== SECURITY =====
  { id: 'protect', name: 'Protéger PDF', nameEn: 'Protect PDF', description: 'Chiffrer avec mot de passe et permissions', descEn: 'Encrypt with password and permissions', icon: 'fas fa-lock', color: 'red', category: 'security', multiple: false, accept: '.pdf', endpoint: '/api/pdf/protect', options: [
    { name: 'password', label: 'Mot de passe', type: 'password', placeholder: 'Mot de passe de protection', required: true },
    { name: 'ownerPassword', label: 'Mot de passe propriétaire (optionnel)', type: 'password', placeholder: 'Laisser vide = même que ci-dessus' }
  ]},
  { id: 'sign', name: 'Signer PDF', nameEn: 'Sign PDF', description: 'Ajouter une signature image sur le document', descEn: 'Add signature image to document', icon: 'fas fa-signature', color: 'green', category: 'security', multiple: false, accept: '.pdf', endpoint: '/api/pdf/sign', hasSignature: true, options: [
    { name: 'page', label: 'Page', type: 'number', placeholder: '1' },
    { name: 'x', label: 'Position X', type: 'number', placeholder: '100' },
    { name: 'y', label: 'Position Y', type: 'number', placeholder: '100' },
    { name: 'width', label: 'Largeur', type: 'number', placeholder: '200' },
    { name: 'height', label: 'Hauteur', type: 'number', placeholder: '80' }
  ]},
  { id: 'redact', name: 'Rédaction', nameEn: 'Redaction', description: 'Masquer définitivement des zones sensibles', descEn: 'Permanently mask sensitive areas', icon: 'fas fa-user-secret', color: 'purple', category: 'security', badge: 'PRO', multiple: false, accept: '.pdf', endpoint: '/api/advanced/redact', options: [
    { name: 'options', label: 'Zones à masquer (JSON)', type: 'textarea', placeholder: '{"regions":[{"page":1,"x":100,"y":500,"width":200,"height":30}],"color":"#000000"}' }
  ]},

  // ===== AI & ANALYSIS =====
  { id: 'ocr', name: 'OCR (Reconnaissance)', nameEn: 'OCR (Recognition)', description: 'Reconnaître le texte dans les PDFs scannés', descEn: 'Recognize text in scanned PDFs', icon: 'fas fa-eye', color: 'indigo', category: 'ai', badge: 'AI', multiple: false, accept: '.pdf,.png,.jpg,.jpeg,.tiff', endpoint: '/api/advanced/ocr', responseType: 'json', options: [
    { name: 'language', label: 'Langue', type: 'select', choices: [{ value: 'fra', label: 'Français' }, { value: 'eng', label: 'English' }, { value: 'deu', label: 'Deutsch' }, { value: 'spa', label: 'Español' }, { value: 'ara', label: 'العربية' }] },
    { name: 'outputFormat', label: 'Sortie', type: 'select', choices: [{ value: 'text', label: 'Texte (affichage)' }, { value: 'file', label: 'Fichier .txt' }] }
  ]},
  { id: 'summarize', name: 'Résumé IA', nameEn: 'AI Summary', description: 'Générer un résumé intelligent du contenu', descEn: 'Generate smart content summary', icon: 'fas fa-brain', color: 'pink', category: 'ai', badge: 'AI', multiple: false, accept: '.pdf', endpoint: '/api/advanced/summarize', responseType: 'json', options: [
    { name: 'maxLength', label: 'Longueur max (caractères)', type: 'number', placeholder: '500' },
    { name: 'language', label: 'Langue du résumé', type: 'select', choices: [{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }] }
  ]},
  { id: 'analyze', name: 'Statistiques PDF', nameEn: 'PDF Statistics', description: 'Analyse complète: mots, fréquences, temps de lecture', descEn: 'Full analysis: words, frequencies, reading time', icon: 'fas fa-chart-bar', color: 'teal', category: 'ai', badge: 'AI', multiple: false, accept: '.pdf', endpoint: '/api/advanced/analyze', responseType: 'json', options: [] },
  { id: 'compare', name: 'Comparer PDFs', nameEn: 'Compare PDFs', description: 'Diff visuel entre deux documents avec % similarité', descEn: 'Visual diff between two documents with similarity %', icon: 'fas fa-code-compare', color: 'orange', category: 'ai', badge: 'NEW', multiple: true, maxFiles: 2, accept: '.pdf', endpoint: '/api/advanced/compare', responseType: 'json', options: [] },

  // ===== ADVANCED =====
  { id: 'annotate', name: 'Annotations', nameEn: 'Annotations', description: 'Ajouter texte, formes, surlignage sur le PDF', descEn: 'Add text, shapes, highlighting on PDF', icon: 'fas fa-highlighter', color: 'pink', category: 'advanced', badge: 'PRO', multiple: false, accept: '.pdf', endpoint: '/api/advanced/annotate', options: [
    { name: 'annotations', label: 'Annotations (JSON)', type: 'textarea', placeholder: '[{"type":"text","page":1,"x":100,"y":700,"content":"Hello","fontSize":16},{"type":"highlight","page":1,"x":50,"y":600,"width":200,"height":20}]' }
  ]},
  { id: 'create-form', name: 'Créer Formulaire', nameEn: 'Create Form', description: 'Ajouter des champs interactifs (texte, checkbox...)', descEn: 'Add interactive fields (text, checkbox...)', icon: 'fas fa-wpforms', color: 'indigo', category: 'advanced', badge: 'PRO', multiple: false, accept: '.pdf', endpoint: '/api/advanced/create-form', options: [
    { name: 'fields', label: 'Champs (JSON)', type: 'textarea', placeholder: '[{"type":"text","name":"nom","page":1,"x":100,"y":700,"width":200,"height":24},{"type":"checkbox","name":"agree","page":1,"x":100,"y":660}]' }
  ]},
  { id: 'create-pdf', name: 'Créer PDF', nameEn: 'Create PDF', description: 'Générer un PDF à partir de contenu structuré', descEn: 'Generate PDF from structured content', icon: 'fas fa-file-medical', color: 'green', category: 'advanced', badge: 'NEW', noFile: true, endpoint: '/api/advanced/create', responseType: 'download', options: [
    { name: 'content', label: 'Contenu (JSON)', type: 'textarea', placeholder: '[{"type":"title","text":"Mon Document"},{"type":"paragraph","text":"Contenu ici..."},{"type":"separator"},{"type":"list","items":["Item 1","Item 2"]}]', required: true }
  ]}
];

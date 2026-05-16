// ============ TOOLS CONFIGURATION ============
const TOOLS = [
  {
    id: 'merge',
    name: 'Fusionner PDF',
    description: 'Combiner plusieurs fichiers PDF en un seul document',
    icon: 'fas fa-object-group',
    color: 'red',
    category: 'organize',
    multiple: true,
    accept: '.pdf',
    endpoint: '/api/pdf/merge',
    fieldName: 'files',
    options: []
  },
  {
    id: 'split',
    name: 'Diviser PDF',
    description: 'Séparer un PDF en plusieurs fichiers',
    icon: 'fas fa-cut',
    color: 'blue',
    category: 'organize',
    multiple: false,
    accept: '.pdf',
    endpoint: '/api/pdf/split',
    fieldName: 'file',
    options: [
      { name: 'ranges', label: 'Pages à extraire', type: 'text', placeholder: 'Ex: 1-3,5,7-10 (vide = toutes séparées)', required: false }
    ]
  },
  {
    id: 'compress',
    name: 'Compresser PDF',
    description: 'Réduire la taille de vos fichiers PDF',
    icon: 'fas fa-compress-arrows-alt',
    color: 'green',
    category: 'organize',
    multiple: false,
    accept: '.pdf',
    endpoint: '/api/pdf/compress',
    fieldName: 'file',
    options: [
      { name: 'quality', label: 'Qualité', type: 'select', choices: [
        { value: 'low', label: 'Compression maximale' },
        { value: 'medium', label: 'Équilibré (recommandé)' },
        { value: 'high', label: 'Qualité maximale' }
      ]}
    ]
  },
  {
    id: 'rotate',
    name: 'Pivoter PDF',
    description: 'Faire pivoter les pages de votre PDF',
    icon: 'fas fa-redo',
    color: 'purple',
    category: 'edit',
    multiple: false,
    accept: '.pdf',
    endpoint: '/api/pdf/rotate',
    fieldName: 'file',
    options: [
      { name: 'angle', label: 'Angle de rotation', type: 'select', choices: [
        { value: '90', label: '90° (droite)' },
        { value: '180', label: '180°' },
        { value: '270', label: '270° (gauche)' }
      ]},
      { name: 'pages', label: 'Pages', type: 'text', placeholder: 'Ex: 1,3,5 (vide = toutes)', required: false }
    ]
  },
  {
    id: 'watermark',
    name: 'Filigrane',
    description: 'Ajouter un filigrane texte sur votre PDF',
    icon: 'fas fa-tint',
    color: 'teal',
    category: 'edit',
    multiple: false,
    accept: '.pdf',
    endpoint: '/api/pdf/watermark',
    fieldName: 'file',
    options: [
      { name: 'text', label: 'Texte du filigrane', type: 'text', placeholder: 'CONFIDENTIEL', required: true },
      { name: 'opacity', label: 'Opacité (0.1 - 1.0)', type: 'number', placeholder: '0.3', required: false },
      { name: 'fontSize', label: 'Taille de police', type: 'number', placeholder: '50', required: false },
      { name: 'position', label: 'Position', type: 'select', choices: [
        { value: 'center', label: 'Centre (diagonal)' },
        { value: 'top-left', label: 'Haut gauche' },
        { value: 'top-right', label: 'Haut droite' },
        { value: 'bottom-left', label: 'Bas gauche' },
        { value: 'bottom-right', label: 'Bas droite' }
      ]}
    ]
  },
  {
    id: 'protect',
    name: 'Protéger PDF',
    description: 'Chiffrer et protéger votre PDF par mot de passe',
    icon: 'fas fa-lock',
    color: 'orange',
    category: 'security',
    multiple: false,
    accept: '.pdf',
    endpoint: '/api/pdf/protect',
    fieldName: 'file',
    options: [
      { name: 'password', label: 'Mot de passe', type: 'password', placeholder: 'Entrez un mot de passe', required: true }
    ]
  },
  {
    id: 'unlock',
    name: 'Déverrouiller PDF',
    description: 'Retirer la protection par mot de passe',
    icon: 'fas fa-unlock',
    color: 'green',
    category: 'security',
    multiple: false,
    accept: '.pdf',
    endpoint: '/api/pdf/unlock',
    fieldName: 'file',
    options: [
      { name: 'password', label: 'Mot de passe actuel', type: 'password', placeholder: 'Entrez le mot de passe', required: false }
    ]
  },
  {
    id: 'images-to-pdf',
    name: 'Images → PDF',
    description: 'Convertir des images en un document PDF',
    icon: 'fas fa-images',
    color: 'blue',
    category: 'convert',
    multiple: true,
    accept: '.png,.jpg,.jpeg,.webp,.tiff',
    endpoint: '/api/pdf/images-to-pdf',
    fieldName: 'files',
    options: [
      { name: 'pageSize', label: 'Taille de page', type: 'select', choices: [
        { value: 'A4', label: 'A4' },
        { value: 'Letter', label: 'Letter (US)' }
      ]},
      { name: 'margin', label: 'Marge (px)', type: 'number', placeholder: '0', required: false }
    ]
  },
  {
    id: 'pdf-to-images',
    name: 'PDF → Images',
    description: 'Convertir chaque page du PDF en image',
    icon: 'fas fa-file-image',
    color: 'purple',
    category: 'convert',
    multiple: false,
    accept: '.pdf',
    endpoint: '/api/pdf/pdf-to-images',
    fieldName: 'file',
    options: [
      { name: 'format', label: 'Format', type: 'select', choices: [
        { value: 'png', label: 'PNG' },
        { value: 'jpg', label: 'JPEG' }
      ]},
      { name: 'dpi', label: 'Résolution (DPI)', type: 'number', placeholder: '150', required: false }
    ]
  },
  {
    id: 'extract-text',
    name: 'Extraire Texte',
    description: 'Extraire tout le texte contenu dans un PDF',
    icon: 'fas fa-font',
    color: 'teal',
    category: 'convert',
    multiple: false,
    accept: '.pdf',
    endpoint: '/api/pdf/extract-text',
    fieldName: 'file',
    options: [],
    responseType: 'json'
  },
  {
    id: 'page-numbers',
    name: 'Numéroter Pages',
    description: 'Ajouter des numéros de page à votre PDF',
    icon: 'fas fa-list-ol',
    color: 'orange',
    category: 'edit',
    multiple: false,
    accept: '.pdf',
    endpoint: '/api/pdf/page-numbers',
    fieldName: 'file',
    options: [
      { name: 'position', label: 'Position', type: 'select', choices: [
        { value: 'bottom-center', label: 'Bas centre' },
        { value: 'bottom-left', label: 'Bas gauche' },
        { value: 'bottom-right', label: 'Bas droite' },
        { value: 'top-center', label: 'Haut centre' },
        { value: 'top-left', label: 'Haut gauche' },
        { value: 'top-right', label: 'Haut droite' }
      ]},
      { name: 'startFrom', label: 'Commencer à', type: 'number', placeholder: '1', required: false },
      { name: 'format', label: 'Format', type: 'select', choices: [
        { value: 'numeric', label: 'Numérique (1, 2, 3...)' },
        { value: 'roman', label: 'Romain (I, II, III...)' },
        { value: 'alpha', label: 'Alphabétique (A, B, C...)' }
      ]}
    ]
  },
  {
    id: 'remove-pages',
    name: 'Supprimer Pages',
    description: 'Retirer des pages spécifiques du PDF',
    icon: 'fas fa-trash-alt',
    color: 'red',
    category: 'organize',
    multiple: false,
    accept: '.pdf',
    endpoint: '/api/pdf/remove-pages',
    fieldName: 'file',
    options: [
      { name: 'pages', label: 'Pages à supprimer', type: 'text', placeholder: 'Ex: 1,3,5-7', required: true }
    ]
  },
  {
    id: 'reorder',
    name: 'Réordonner Pages',
    description: 'Changer l\'ordre des pages du PDF',
    icon: 'fas fa-sort',
    color: 'blue',
    category: 'organize',
    multiple: false,
    accept: '.pdf',
    endpoint: '/api/pdf/reorder',
    fieldName: 'file',
    options: [
      { name: 'order', label: 'Nouvel ordre', type: 'text', placeholder: 'Ex: 3,1,2,5,4', required: true }
    ]
  },
  {
    id: 'metadata',
    name: 'Voir Métadonnées',
    description: 'Afficher les informations du document PDF',
    icon: 'fas fa-info-circle',
    color: 'teal',
    category: 'edit',
    multiple: false,
    accept: '.pdf',
    endpoint: '/api/pdf/metadata',
    fieldName: 'file',
    options: [],
    responseType: 'json'
  },
  {
    id: 'edit-metadata',
    name: 'Éditer Métadonnées',
    description: 'Modifier titre, auteur et autres métadonnées',
    icon: 'fas fa-edit',
    color: 'purple',
    category: 'edit',
    multiple: false,
    accept: '.pdf',
    endpoint: '/api/pdf/edit-metadata',
    fieldName: 'file',
    options: [
      { name: 'title', label: 'Titre', type: 'text', placeholder: 'Titre du document', required: false },
      { name: 'author', label: 'Auteur', type: 'text', placeholder: 'Nom de l\'auteur', required: false },
      { name: 'subject', label: 'Sujet', type: 'text', placeholder: 'Sujet du document', required: false },
      { name: 'keywords', label: 'Mots-clés', type: 'text', placeholder: 'mot1, mot2, mot3', required: false }
    ]
  },
  {
    id: 'flatten',
    name: 'Aplatir PDF',
    description: 'Aplatir les formulaires et annotations',
    icon: 'fas fa-layer-group',
    color: 'orange',
    category: 'edit',
    multiple: false,
    accept: '.pdf',
    endpoint: '/api/pdf/flatten',
    fieldName: 'file',
    options: []
  },
  {
    id: 'grayscale',
    name: 'Noir & Blanc',
    description: 'Convertir le PDF en niveaux de gris',
    icon: 'fas fa-adjust',
    color: 'purple',
    category: 'convert',
    multiple: false,
    accept: '.pdf',
    endpoint: '/api/pdf/grayscale',
    fieldName: 'file',
    options: []
  },
  {
    id: 'sign',
    name: 'Signer PDF',
    description: 'Ajouter une signature image à votre PDF',
    icon: 'fas fa-signature',
    color: 'green',
    category: 'security',
    multiple: false,
    accept: '.pdf',
    endpoint: '/api/pdf/sign',
    fieldName: 'file',
    hasSignature: true,
    options: [
      { name: 'page', label: 'Page', type: 'number', placeholder: '1', required: false },
      { name: 'x', label: 'Position X', type: 'number', placeholder: '100', required: false },
      { name: 'y', label: 'Position Y', type: 'number', placeholder: '100', required: false },
      { name: 'width', label: 'Largeur', type: 'number', placeholder: '200', required: false },
      { name: 'height', label: 'Hauteur', type: 'number', placeholder: '80', required: false }
    ]
  },
  {
    id: 'repair',
    name: 'Réparer PDF',
    description: 'Tenter de réparer un PDF corrompu',
    icon: 'fas fa-wrench',
    color: 'red',
    category: 'organize',
    multiple: false,
    accept: '.pdf',
    endpoint: '/api/pdf/repair',
    fieldName: 'file',
    options: []
  }
];

// Facebook Auto Poster Pro - Internationalization Module
const I18N = {
  currentLang: 'fr',
  
  languages: {
    ar: {
      name: 'العربية',
      dir: 'rtl',
      strings: {
        // Header
        appName: 'ناشر فيسبوك التلقائي',
        proBadge: 'احترافي',
        active: 'نشط',
        inactive: 'غير نشط',
        
        // Tabs
        tabCompose: 'إنشاء',
        tabSchedule: 'جدولة',
        tabHistory: 'السجل',
        tabTemplates: 'القوالب',
        tabBulk: 'نشر جماعي',
        tabAnalytics: 'التحليلات',
        tabCalendar: 'التقويم',
        tabAccounts: 'الحسابات',
        tabSettings: 'الإعدادات',
        
        // Compose
        postContent: 'محتوى المنشور',
        postPlaceholder: 'اكتب منشورك هنا...',
        characters: 'حرف',
        publishOn: 'النشر على',
        myProfile: 'ملفي الشخصي',
        myPage: 'صفحتي',
        aGroup: 'مجموعة',
        multipleTargets: 'أهداف متعددة',
        targetUrl: 'رابط الوجهة (اختياري)',
        targetUrlPlaceholder: 'https://www.facebook.com/groups/...',
        options: 'الخيارات',
        addEmoji: 'إضافة رموز تعبيرية',
        addHashtags: 'إضافة هاشتاغات',
        useSpintax: 'استخدام Spintax (تنوع المحتوى)',
        publishNow: 'نشر الآن',
        schedulePost: 'جدولة',
        
        // Schedule
        date: 'التاريخ',
        time: 'الوقت',
        repeat: 'التكرار',
        repeatNone: 'بدون تكرار',
        repeatDaily: 'يومي',
        repeatWeekly: 'أسبوعي',
        repeatMonthly: 'شهري',
        repeatCustom: 'مخصص',
        scheduledPosts: 'المنشورات المجدولة',
        noScheduledPosts: 'لا توجد منشورات مجدولة',
        
        // History
        totalPosts: 'إجمالي المنشورات',
        successful: 'ناجحة',
        failed: 'فاشلة',
        noHistory: 'لا يوجد سجل',
        success: 'نجح',
        failedStatus: 'فشل',
        pending: 'قيد الانتظار',
        
        // Templates
        templateName: 'اسم القالب',
        templateCategory: 'الفئة',
        catMarketing: 'تسويق',
        catEngagement: 'تفاعل',
        catPromotion: 'ترويج',
        catEducation: 'تعليم',
        catEntertainment: 'ترفيه',
        catNews: 'أخبار',
        catPersonal: 'شخصي',
        saveTemplate: 'حفظ القالب',
        useTemplate: 'استخدام',
        deleteTemplate: 'حذف',
        noTemplates: 'لا توجد قوالب محفوظة',
        
        // Bulk
        bulkTitle: 'نشر جماعي',
        importCSV: 'استيراد CSV',
        importTXT: 'استيراد TXT',
        bulkContent: 'أدخل المنشورات (منشور واحد لكل سطر)',
        bulkPlaceholder: 'المنشور الأول\nالمنشور الثاني\nالمنشور الثالث',
        intervalMinutes: 'الفاصل الزمني (دقائق)',
        startBulk: 'بدء النشر الجماعي',
        stopBulk: 'إيقاف',
        bulkProgress: 'التقدم',
        postsRemaining: 'منشورات متبقية',
        
        // Analytics
        analyticsTitle: 'لوحة التحليلات',
        postsToday: 'منشورات اليوم',
        postsThisWeek: 'منشورات هذا الأسبوع',
        postsThisMonth: 'منشورات هذا الشهر',
        successRate: 'نسبة النجاح',
        bestTime: 'أفضل وقت للنشر',
        activityChart: 'مخطط النشاط',
        
        // Calendar
        calendarTitle: 'تقويم المحتوى',
        today: 'اليوم',
        
        // Accounts
        accountsTitle: 'إدارة الحسابات',
        addAccount: 'إضافة حساب',
        accountName: 'اسم الحساب',
        accountType: 'نوع الحساب',
        typeProfile: 'ملف شخصي',
        typePage: 'صفحة',
        typeGroup: 'مجموعة',
        accountUrl: 'رابط الحساب',
        noAccounts: 'لا توجد حسابات مضافة',
        
        // Settings
        delayMin: 'الحد الأدنى للتأخير (دقائق)',
        delayMax: 'الحد الأقصى للتأخير (دقائق)',
        behavior: 'السلوك',
        randomDelay: 'تأخير عشوائي بين الإجراءات',
        notifySuccess: 'إشعار بالنجاح',
        notifyError: 'إشعار بالخطأ',
        autoRetry: 'إعادة المحاولة تلقائياً',
        maxRetries: 'الحد الأقصى للمحاولات',
        antiDetection: 'مكافحة الكشف',
        humanMode: 'وضع السلوك البشري',
        randomScrolling: 'تمرير عشوائي قبل النشر',
        randomPause: 'توقفات عشوائية',
        fingerprint: 'حماية البصمة الرقمية',
        language: 'اللغة',
        saveSettings: 'حفظ الإعدادات',
        settingsSaved: 'تم حفظ الإعدادات!',
        
        // Auto-reply
        autoReply: 'الرد التلقائي',
        autoReplyEnabled: 'تفعيل الرد التلقائي',
        replyTemplate: 'قالب الرد',
        replyDelay: 'تأخير الرد (ثواني)',
        
        // Spintax
        spintaxHelp: 'استخدم {خيار1|خيار2|خيار3} لتنويع المحتوى',
        
        // Watermark
        watermark: 'العلامة المائية',
        watermarkText: 'نص العلامة المائية',
        watermarkPosition: 'الموضع',
        posTopLeft: 'أعلى اليسار',
        posTopRight: 'أعلى اليمين',
        posBottomLeft: 'أسفل اليسار',
        posBottomRight: 'أسفل اليمين',
        posCenter: 'الوسط',
        
        // Common
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        confirm: 'تأكيد',
        close: 'إغلاق',
        loading: 'جاري التحميل...',
        error: 'خطأ',
        success_msg: 'نجاح',
        warning: 'تحذير',
        
        // Toasts
        postPublished: 'تم نشر المنشور بنجاح!',
        postScheduled: 'تم جدولة المنشور بنجاح!',
        postFailed: 'فشل في نشر المنشور',
        writeContent: 'يرجى كتابة محتوى',
        setDateTime: 'حدد التاريخ والوقت',
        templateSaved: 'تم حفظ القالب!',
        templateDeleted: 'تم حذف القالب',
        accountAdded: 'تم إضافة الحساب!',
        accountDeleted: 'تم حذف الحساب',
        bulkStarted: 'بدأ النشر الجماعي',
        bulkCompleted: 'اكتمل النشر الجماعي',
        bulkStopped: 'تم إيقاف النشر الجماعي',
        exportSuccess: 'تم تصدير البيانات بنجاح',
        importSuccess: 'تم استيراد البيانات بنجاح',
        connectionError: 'خطأ في الاتصال',
        facebookNotOpen: 'يرجى فتح فيسبوك أولاً'
      }
    },
    
    fr: {
      name: 'Français',
      dir: 'ltr',
      strings: {
        appName: 'Auto Poster',
        proBadge: 'PRO',
        active: 'Actif',
        inactive: 'Inactif',
        
        tabCompose: 'Composer',
        tabSchedule: 'Programmer',
        tabHistory: 'Historique',
        tabTemplates: 'Modeles',
        tabBulk: 'Bulk Post',
        tabAnalytics: 'Analytique',
        tabCalendar: 'Calendrier',
        tabAccounts: 'Comptes',
        tabSettings: 'Params',
        
        postContent: 'Contenu du post',
        postPlaceholder: 'Ecrivez votre publication ici...',
        characters: 'caracteres',
        publishOn: 'Publier sur',
        myProfile: 'Mon profil',
        myPage: 'Ma page',
        aGroup: 'Un groupe',
        multipleTargets: 'Cibles multiples',
        targetUrl: 'URL de destination (optionnel)',
        targetUrlPlaceholder: 'https://www.facebook.com/groups/...',
        options: 'Options',
        addEmoji: 'Ajouter des emojis',
        addHashtags: 'Ajouter des hashtags',
        useSpintax: 'Utiliser Spintax (variation de contenu)',
        publishNow: 'Publier maintenant',
        schedulePost: 'Programmer',
        
        date: 'Date',
        time: 'Heure',
        repeat: 'Repetition',
        repeatNone: 'Aucune',
        repeatDaily: 'Quotidienne',
        repeatWeekly: 'Hebdomadaire',
        repeatMonthly: 'Mensuelle',
        repeatCustom: 'Personnalisee',
        scheduledPosts: 'Posts programmes',
        noScheduledPosts: 'Aucun post programme',
        
        totalPosts: 'Total posts',
        successful: 'Reussis',
        failed: 'Echoues',
        noHistory: 'Aucun historique',
        success: 'Reussi',
        failedStatus: 'Echoue',
        pending: 'En attente',
        
        templateName: 'Nom du modele',
        templateCategory: 'Categorie',
        catMarketing: 'Marketing',
        catEngagement: 'Engagement',
        catPromotion: 'Promotion',
        catEducation: 'Education',
        catEntertainment: 'Divertissement',
        catNews: 'Actualites',
        catPersonal: 'Personnel',
        saveTemplate: 'Sauvegarder le modele',
        useTemplate: 'Utiliser',
        deleteTemplate: 'Supprimer',
        noTemplates: 'Aucun modele sauvegarde',
        
        bulkTitle: 'Publication en masse',
        importCSV: 'Importer CSV',
        importTXT: 'Importer TXT',
        bulkContent: 'Entrez les posts (un par ligne)',
        bulkPlaceholder: 'Premier post\nDeuxieme post\nTroisieme post',
        intervalMinutes: 'Intervalle (minutes)',
        startBulk: 'Demarrer le bulk',
        stopBulk: 'Arreter',
        bulkProgress: 'Progression',
        postsRemaining: 'posts restants',
        
        analyticsTitle: 'Tableau de bord analytique',
        postsToday: "Posts aujourd'hui",
        postsThisWeek: 'Posts cette semaine',
        postsThisMonth: 'Posts ce mois',
        successRate: 'Taux de reussite',
        bestTime: 'Meilleur moment pour poster',
        activityChart: "Graphique d'activite",
        
        calendarTitle: 'Calendrier de contenu',
        today: "Aujourd'hui",
        
        accountsTitle: 'Gestion des comptes',
        addAccount: 'Ajouter un compte',
        accountName: 'Nom du compte',
        accountType: 'Type de compte',
        typeProfile: 'Profil',
        typePage: 'Page',
        typeGroup: 'Groupe',
        accountUrl: 'URL du compte',
        noAccounts: 'Aucun compte ajoute',
        
        delayMin: 'Delai minimum entre posts (minutes)',
        delayMax: 'Delai maximum entre posts (minutes)',
        behavior: 'Comportement',
        randomDelay: 'Delai aleatoire entre actions',
        notifySuccess: 'Notification de succes',
        notifyError: "Notification d'erreur",
        autoRetry: 'Reessayer automatiquement',
        maxRetries: 'Nombre max de tentatives',
        antiDetection: 'Anti-detection',
        humanMode: 'Mode comportement humain',
        randomScrolling: 'Scroll aleatoire avant post',
        randomPause: 'Pauses aleatoires',
        fingerprint: 'Protection empreinte numerique',
        language: 'Langue',
        saveSettings: 'Sauvegarder les parametres',
        settingsSaved: 'Parametres sauvegardes!',
        
        autoReply: 'Reponse automatique',
        autoReplyEnabled: 'Activer la reponse auto',
        replyTemplate: 'Modele de reponse',
        replyDelay: 'Delai de reponse (secondes)',
        
        spintaxHelp: 'Utilisez {option1|option2|option3} pour varier le contenu',
        
        watermark: 'Filigrane',
        watermarkText: 'Texte du filigrane',
        watermarkPosition: 'Position',
        posTopLeft: 'Haut gauche',
        posTopRight: 'Haut droite',
        posBottomLeft: 'Bas gauche',
        posBottomRight: 'Bas droite',
        posCenter: 'Centre',
        
        save: 'Sauvegarder',
        cancel: 'Annuler',
        delete: 'Supprimer',
        edit: 'Modifier',
        confirm: 'Confirmer',
        close: 'Fermer',
        loading: 'Chargement...',
        error: 'Erreur',
        success_msg: 'Succes',
        warning: 'Attention',
        
        postPublished: 'Post publie avec succes!',
        postScheduled: 'Post programme avec succes!',
        postFailed: 'Echec de la publication',
        writeContent: 'Veuillez ecrire un contenu',
        setDateTime: 'Definissez une date et heure',
        templateSaved: 'Modele sauvegarde!',
        templateDeleted: 'Modele supprime',
        accountAdded: 'Compte ajoute!',
        accountDeleted: 'Compte supprime',
        bulkStarted: 'Publication en masse demarree',
        bulkCompleted: 'Publication en masse terminee',
        bulkStopped: 'Publication en masse arretee',
        exportSuccess: 'Donnees exportees avec succes',
        importSuccess: 'Donnees importees avec succes',
        connectionError: 'Erreur de connexion',
        facebookNotOpen: 'Veuillez ouvrir Facebook d\'abord'
      }
    },
    
    en: {
      name: 'English',
      dir: 'ltr',
      strings: {
        appName: 'Auto Poster',
        proBadge: 'PRO',
        active: 'Active',
        inactive: 'Inactive',
        
        tabCompose: 'Compose',
        tabSchedule: 'Schedule',
        tabHistory: 'History',
        tabTemplates: 'Templates',
        tabBulk: 'Bulk Post',
        tabAnalytics: 'Analytics',
        tabCalendar: 'Calendar',
        tabAccounts: 'Accounts',
        tabSettings: 'Settings',
        
        postContent: 'Post content',
        postPlaceholder: 'Write your post here...',
        characters: 'characters',
        publishOn: 'Publish to',
        myProfile: 'My profile',
        myPage: 'My page',
        aGroup: 'A group',
        multipleTargets: 'Multiple targets',
        targetUrl: 'Target URL (optional)',
        targetUrlPlaceholder: 'https://www.facebook.com/groups/...',
        options: 'Options',
        addEmoji: 'Add emojis',
        addHashtags: 'Add hashtags',
        useSpintax: 'Use Spintax (content variation)',
        publishNow: 'Publish now',
        schedulePost: 'Schedule',
        
        date: 'Date',
        time: 'Time',
        repeat: 'Repeat',
        repeatNone: 'None',
        repeatDaily: 'Daily',
        repeatWeekly: 'Weekly',
        repeatMonthly: 'Monthly',
        repeatCustom: 'Custom',
        scheduledPosts: 'Scheduled posts',
        noScheduledPosts: 'No scheduled posts',
        
        totalPosts: 'Total posts',
        successful: 'Successful',
        failed: 'Failed',
        noHistory: 'No history',
        success: 'Success',
        failedStatus: 'Failed',
        pending: 'Pending',
        
        templateName: 'Template name',
        templateCategory: 'Category',
        catMarketing: 'Marketing',
        catEngagement: 'Engagement',
        catPromotion: 'Promotion',
        catEducation: 'Education',
        catEntertainment: 'Entertainment',
        catNews: 'News',
        catPersonal: 'Personal',
        saveTemplate: 'Save template',
        useTemplate: 'Use',
        deleteTemplate: 'Delete',
        noTemplates: 'No saved templates',
        
        bulkTitle: 'Bulk posting',
        importCSV: 'Import CSV',
        importTXT: 'Import TXT',
        bulkContent: 'Enter posts (one per line)',
        bulkPlaceholder: 'First post\nSecond post\nThird post',
        intervalMinutes: 'Interval (minutes)',
        startBulk: 'Start bulk posting',
        stopBulk: 'Stop',
        bulkProgress: 'Progress',
        postsRemaining: 'posts remaining',
        
        analyticsTitle: 'Analytics Dashboard',
        postsToday: 'Posts today',
        postsThisWeek: 'Posts this week',
        postsThisMonth: 'Posts this month',
        successRate: 'Success rate',
        bestTime: 'Best time to post',
        activityChart: 'Activity chart',
        
        calendarTitle: 'Content Calendar',
        today: 'Today',
        
        accountsTitle: 'Account Management',
        addAccount: 'Add account',
        accountName: 'Account name',
        accountType: 'Account type',
        typeProfile: 'Profile',
        typePage: 'Page',
        typeGroup: 'Group',
        accountUrl: 'Account URL',
        noAccounts: 'No accounts added',
        
        delayMin: 'Minimum delay between posts (minutes)',
        delayMax: 'Maximum delay between posts (minutes)',
        behavior: 'Behavior',
        randomDelay: 'Random delay between actions',
        notifySuccess: 'Success notification',
        notifyError: 'Error notification',
        autoRetry: 'Auto retry on failure',
        maxRetries: 'Max retries',
        antiDetection: 'Anti-detection',
        humanMode: 'Human behavior mode',
        randomScrolling: 'Random scroll before posting',
        randomPause: 'Random pauses',
        fingerprint: 'Fingerprint protection',
        language: 'Language',
        saveSettings: 'Save settings',
        settingsSaved: 'Settings saved!',
        
        autoReply: 'Auto reply',
        autoReplyEnabled: 'Enable auto reply',
        replyTemplate: 'Reply template',
        replyDelay: 'Reply delay (seconds)',
        
        spintaxHelp: 'Use {option1|option2|option3} to vary content',
        
        watermark: 'Watermark',
        watermarkText: 'Watermark text',
        watermarkPosition: 'Position',
        posTopLeft: 'Top left',
        posTopRight: 'Top right',
        posBottomLeft: 'Bottom left',
        posBottomRight: 'Bottom right',
        posCenter: 'Center',
        
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        confirm: 'Confirm',
        close: 'Close',
        loading: 'Loading...',
        error: 'Error',
        success_msg: 'Success',
        warning: 'Warning',
        
        postPublished: 'Post published successfully!',
        postScheduled: 'Post scheduled successfully!',
        postFailed: 'Post failed to publish',
        writeContent: 'Please write content',
        setDateTime: 'Set a date and time',
        templateSaved: 'Template saved!',
        templateDeleted: 'Template deleted',
        accountAdded: 'Account added!',
        accountDeleted: 'Account deleted',
        bulkStarted: 'Bulk posting started',
        bulkCompleted: 'Bulk posting completed',
        bulkStopped: 'Bulk posting stopped',
        exportSuccess: 'Data exported successfully',
        importSuccess: 'Data imported successfully',
        connectionError: 'Connection error',
        facebookNotOpen: 'Please open Facebook first'
      }
    }
  },

  // Get translation
  t(key) {
    const lang = this.languages[this.currentLang];
    return (lang && lang.strings[key]) || key;
  },

  // Get direction
  getDir() {
    return this.languages[this.currentLang]?.dir || 'ltr';
  },

  // Set language
  setLang(lang) {
    if (this.languages[lang]) {
      this.currentLang = lang;
      document.documentElement.setAttribute('dir', this.getDir());
      document.documentElement.setAttribute('lang', lang);
      chrome.storage.local.set({ language: lang });
    }
  },

  // Load saved language
  async loadLang() {
    const { language } = await chrome.storage.local.get('language');
    if (language && this.languages[language]) {
      this.currentLang = language;
    }
    document.documentElement.setAttribute('dir', this.getDir());
    document.documentElement.setAttribute('lang', this.currentLang);
  }
};

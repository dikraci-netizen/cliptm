// Facebook Auto Poster Pro - AI Content Enhancement Module
const ContentEnhancer = {
  
  // === EMOJI SUGGESTIONS ===
  emojiSets: {
    marketing: ['🔥', '💯', '🚀', '✨', '💪', '🎯', '⭐', '💰', '📈', '🏆'],
    engagement: ['❤️', '👏', '🙌', '💬', '👇', '🤔', '💡', '🎉', '👀', '🗣️'],
    promotion: ['🎁', '🛒', '💸', '🏷️', '📦', '🔔', '⚡', '🆓', '💎', '🎊'],
    education: ['📚', '✅', '📝', '💡', '🧠', '📊', '🎓', '✍️', '📖', '🔍'],
    entertainment: ['😂', '🤣', '😍', '🎬', '🎵', '🎮', '🎭', '🌟', '🤩', '💥'],
    news: ['📰', '🗞️', '📢', '🔴', '⚠️', '📡', '🌐', '📌', '🔗', '📣'],
    personal: ['😊', '🌹', '☕', '🌅', '✈️', '🏠', '👨‍👩‍👧‍👦', '💕', '🙏', '🌈'],
    arabic: ['🤲', '☪️', '🕌', '🌙', '⭐', '🌺', '🏜️', '🐪', '🎆', '💫']
  },

  getEmojis(category = 'marketing', count = 3) {
    const set = this.emojiSets[category] || this.emojiSets.marketing;
    const shuffled = [...set].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  addEmojisToText(text, category = 'marketing', position = 'both') {
    const emojis = this.getEmojis(category, 2);
    switch (position) {
      case 'start': return `${emojis[0]} ${text}`;
      case 'end': return `${text} ${emojis[0]}`;
      case 'both': return `${emojis[0]} ${text} ${emojis[1]}`;
      default: return text;
    }
  },

  // === HASHTAG GENERATOR ===
  hashtagSets: {
    marketing: ['#marketing', '#business', '#entrepreneur', '#growth', '#success', '#digital', '#branding', '#strategy', '#startup', '#motivation'],
    engagement: ['#community', '#share', '#comment', '#follow', '#like', '#connect', '#network', '#together', '#support', '#feedback'],
    promotion: ['#sale', '#offer', '#discount', '#deal', '#limited', '#exclusive', '#promo', '#free', '#new', '#launch'],
    education: ['#learn', '#tips', '#howto', '#guide', '#tutorial', '#knowledge', '#skills', '#study', '#facts', '#didyouknow'],
    entertainment: ['#fun', '#funny', '#viral', '#trending', '#meme', '#comedy', '#entertainment', '#lol', '#smile', '#enjoy'],
    news: ['#news', '#breaking', '#update', '#trending', '#today', '#world', '#latest', '#headline', '#alert', '#report'],
    arabic: ['#عربي', '#العرب', '#السعودية', '#مصر', '#المغرب', '#الجزائر', '#تونس', '#الامارات', '#الكويت', '#قطر']
  },

  generateHashtags(text, category = 'marketing', count = 5) {
    const baseHashtags = this.hashtagSets[category] || this.hashtagSets.marketing;
    
    // Generate hashtags from content words
    const words = text.split(/\s+/).filter(w => w.length > 4 && !w.startsWith('#') && !w.startsWith('http'));
    const contentHashtags = words
      .map(w => `#${w.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '')}`)
      .filter(h => h.length > 2);
    
    // Mix base and content hashtags
    const allHashtags = [...new Set([...contentHashtags.slice(0, 3), ...baseHashtags])];
    const shuffled = allHashtags.sort(() => Math.random() - 0.5);
    
    return shuffled.slice(0, count);
  },

  // === TEXT ENHANCEMENT ===
  enhanceText(text, options = {}) {
    let enhanced = text;
    
    if (options.addEmoji) {
      enhanced = this.addEmojisToText(enhanced, options.category || 'marketing');
    }
    
    if (options.addHashtags) {
      const hashtags = this.generateHashtags(enhanced, options.category || 'marketing', options.hashtagCount || 5);
      enhanced += '\n\n' + hashtags.join(' ');
    }
    
    if (options.addCTA) {
      enhanced += '\n\n' + this.getCallToAction(options.ctaType || 'engagement');
    }
    
    if (options.addLineBreaks) {
      enhanced = this.formatWithLineBreaks(enhanced);
    }
    
    return enhanced;
  },

  // === CALL TO ACTION ===
  callToActions: {
    engagement: [
      '👇 Partagez votre avis en commentaire!',
      '💬 Qu\'en pensez-vous? Dites-le nous!',
      '❤️ Likez si vous etes d\'accord!',
      '🔄 Partagez avec vos amis!',
      '👇 شاركنا رأيك في التعليقات!',
      '❤️ أعجبني إذا كنت توافق!',
      '🔄 شارك مع أصدقائك!'
    ],
    promotion: [
      '🛒 Commandez maintenant - lien en bio!',
      '⚡ Offre limitee - Profitez-en!',
      '🎁 Cliquez sur le lien pour en savoir plus!',
      '🛒 اطلب الآن - الرابط في البايو!',
      '⚡ عرض محدود - استفد الآن!'
    ],
    education: [
      '💾 Enregistrez ce post pour plus tard!',
      '📚 Suivez-nous pour plus de conseils!',
      '🔔 Activez les notifications!',
      '💾 احفظ هذا المنشور للمرجع!',
      '📚 تابعنا لمزيد من النصائح!'
    ]
  },

  getCallToAction(type = 'engagement') {
    const ctas = this.callToActions[type] || this.callToActions.engagement;
    return ctas[Math.floor(Math.random() * ctas.length)];
  },

  // === TEXT FORMATTING ===
  formatWithLineBreaks(text) {
    // Add line breaks every 2-3 sentences for readability
    const sentences = text.split(/(?<=[.!?])\s+/);
    if (sentences.length <= 2) return text;
    
    let result = '';
    for (let i = 0; i < sentences.length; i++) {
      result += sentences[i];
      if ((i + 1) % 2 === 0 && i < sentences.length - 1) {
        result += '\n\n';
      } else if (i < sentences.length - 1) {
        result += ' ';
      }
    }
    return result;
  },

  // === CONTENT TEMPLATES BY CATEGORY ===
  quickTemplates: {
    marketing: [
      '{🔥|🚀|💯} {Decouvrez|Explorez|Profitez de} notre {nouvelle offre|nouveau produit|nouveau service}!\n\n{👉|➡️} {Lien en bio|Contactez-nous|Visitez notre site}\n\n#marketing #business #growth',
      '{🔥|🚀|💯} {اكتشف|استكشف|استفد من} {عرضنا الجديد|منتجنا الجديد|خدمتنا الجديدة}!\n\n{👉|➡️} {الرابط في البايو|تواصل معنا|زوروا موقعنا}\n\n#تسويق #أعمال #نمو'
    ],
    engagement: [
      '{🤔|💭|👀} Question du jour:\n\n{Quel est votre avis sur|Que pensez-vous de|Comment gerez-vous} {ce sujet|cette situation|ce defi}?\n\n👇 Repondez en commentaire!',
      '{🤔|💭|👀} سؤال اليوم:\n\n{ما رأيكم في|ماذا تعتقدون عن|كيف تتعاملون مع} {هذا الموضوع|هذه الحالة|هذا التحدي}?\n\n👇 أجيبوا في التعليقات!'
    ],
    promotion: [
      '{🎉|🎊|⚡} OFFRE SPECIALE {DU JOUR|DE LA SEMAINE|LIMITEE}!\n\n{-20%|-30%|-50%} sur {tout|une selection|nos best-sellers}\n\n⏰ {Valable 24h|Dernier jour|Ne ratez pas}\n\n{🛒 Commandez|👉 Profitez-en} maintenant!',
      '{🎉|🎊|⚡} عرض خاص {اليوم|هذا الأسبوع|محدود}!\n\n{-20%|-30%|-50%} على {كل شيء|مجموعة مختارة|الأكثر مبيعاً}\n\n⏰ {صالح 24 ساعة|آخر يوم|لا تفوت الفرصة}\n\n{🛒 اطلب|👉 استفد} الآن!'
    ]
  },

  getQuickTemplate(category) {
    const templates = this.quickTemplates[category];
    if (!templates) return '';
    return templates[Math.floor(Math.random() * templates.length)];
  },

  // === DETECT LANGUAGE ===
  detectLanguage(text) {
    const arabicPattern = /[\u0600-\u06FF]/;
    if (arabicPattern.test(text)) return 'ar';
    
    const frenchWords = ['le', 'la', 'les', 'un', 'une', 'des', 'est', 'sont', 'et', 'ou', 'de', 'du'];
    const words = text.toLowerCase().split(/\s+/);
    const frenchCount = words.filter(w => frenchWords.includes(w)).length;
    
    if (frenchCount > 2) return 'fr';
    return 'en';
  }
};

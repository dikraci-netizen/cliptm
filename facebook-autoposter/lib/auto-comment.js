// Facebook Auto Poster Pro - Auto Comment Module
const AutoComment = {

  // === DEFAULT COMMENT TEMPLATES ===
  defaultTemplates: {
    fr: [
      'Super post! Merci pour le partage 🙏',
      'Tres interessant! 👍',
      'Merci pour cette information! 💯',
      'Excellent contenu! Je partage 🔥',
      'J\'adore! Continuez comme ca 👏',
      'Genial! Exactement ce que je cherchais ✨',
      'Merci beaucoup pour ce partage! ❤️',
      'Top! Je recommande 🚀'
    ],
    ar: [
      'منشور رائع! شكراً للمشاركة 🙏',
      'مثير للاهتمام جداً! 👍',
      'شكراً على هذه المعلومة! 💯',
      'محتوى ممتاز! سأشاركه 🔥',
      'أحب هذا! استمروا 👏',
      'رائع! بالضبط ما كنت أبحث عنه ✨',
      'شكراً جزيلاً على المشاركة! ❤️',
      'ممتاز! أنصح به 🚀'
    ],
    en: [
      'Great post! Thanks for sharing 🙏',
      'Very interesting! 👍',
      'Thanks for this info! 💯',
      'Excellent content! Sharing this 🔥',
      'Love it! Keep going 👏',
      'Amazing! Exactly what I was looking for ✨',
      'Thank you so much for sharing! ❤️',
      'Top notch! I recommend 🚀'
    ]
  },

  // === PROMOTIONAL COMMENTS ===
  promoTemplates: {
    fr: [
      '{Excellent|Super|Genial} post! A propos, {j\'ai|nous avons} {un produit|une offre|un service} similaire: {LINK}',
      'Tres {interessant|pertinent|utile}! Pour ceux qui cherchent plus d\'infos: {LINK} 👈',
      '{Merci|Super} pour le partage! {Decouvrez aussi|Jetez un oeil a|Visitez} {LINK} 🔗'
    ],
    ar: [
      '{منشور ممتاز|رائع|مذهل}! بالمناسبة، {لدينا|عندنا} {منتج|عرض|خدمة} مشابه: {LINK}',
      '{مثير للاهتمام|مفيد جداً}! لمن يبحث عن المزيد: {LINK} 👈',
      '{شكراً|رائع} على المشاركة! {اكتشفوا أيضاً|ألقوا نظرة على|زوروا} {LINK} 🔗'
    ],
    en: [
      '{Great|Excellent|Amazing} post! By the way, {I have|we have} a similar {product|offer|service}: {LINK}',
      'Very {interesting|relevant|useful}! For those looking for more: {LINK} 👈',
      '{Thanks|Great} for sharing! {Check out also|Take a look at|Visit} {LINK} 🔗'
    ]
  },

  // === AUTO COMMENT ON FEED/GROUP ===
  async commentOnPosts(options = {}) {
    const {
      targetUrl = null,
      maxComments = 10,
      delayMin = 30,
      delayMax = 90,
      templates = null,
      language = 'fr',
      useSpintax = true,
      promoMode = false,
      promoLink = '',
      skipOwnPosts = true,
      keywords = [] // Only comment on posts containing these keywords
    } = options;

    await this.updateState({ isRunning: true, total: maxComments, current: 0, commented: 0 });

    const commentTemplates = templates || (promoMode ? this.promoTemplates[language] : this.defaultTemplates[language]);

    const result = await chrome.runtime.sendMessage({
      action: 'contentAction',
      data: {
        task: 'autoComment',
        url: targetUrl || 'https://www.facebook.com/',
        maxComments,
        delayMin,
        delayMax,
        templates: commentTemplates,
        useSpintax,
        promoLink,
        skipOwnPosts,
        keywords
      }
    });

    await this.updateState({ isRunning: false });
    return result;
  },

  // === COMMENT ON SPECIFIC POST ===
  async commentOnPost(postUrl, comment) {
    const result = await chrome.runtime.sendMessage({
      action: 'contentAction',
      data: {
        task: 'commentOnPost',
        url: postUrl,
        comment
      }
    });
    return result;
  },

  // === BULK COMMENT ON MULTIPLE GROUPS ===
  async bulkCommentGroups(groupUrls, options = {}) {
    const { commentsPerGroup = 3, delayBetweenGroups = 120 } = options;
    const results = [];

    for (const url of groupUrls) {
      if (!(await this.isRunning())) break;

      const result = await this.commentOnPosts({ 
        targetUrl: url, 
        maxComments: commentsPerGroup,
        ...options 
      });
      results.push({ url, ...result });

      const delay = (delayBetweenGroups + Math.random() * 60) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }

    return results;
  },

  // === GET RANDOM COMMENT ===
  getRandomComment(templates, promoLink = '') {
    let comment = templates[Math.floor(Math.random() * templates.length)];
    
    // Process spintax if available
    if (typeof Spintax !== 'undefined') {
      comment = Spintax.process(comment);
    }
    
    // Replace {LINK} placeholder
    if (promoLink) {
      comment = comment.replace('{LINK}', promoLink);
    } else {
      comment = comment.replace(/\s*{LINK}\s*/g, '');
    }
    
    return comment;
  },

  // === CUSTOM TEMPLATES ===
  async saveCustomTemplates(language, templates) {
    const { customCommentTemplates = {} } = await chrome.storage.local.get('customCommentTemplates');
    customCommentTemplates[language] = templates;
    await chrome.storage.local.set({ customCommentTemplates });
  },

  async getCustomTemplates(language) {
    const { customCommentTemplates = {} } = await chrome.storage.local.get('customCommentTemplates');
    return customCommentTemplates[language] || [];
  },

  // === STATS ===
  async recordComment(target) {
    const { commentStats = { total: 0, today: 0, todayDate: '', byTarget: {} } } = 
      await chrome.storage.local.get('commentStats');
    
    const today = new Date().toISOString().split('T')[0];
    if (commentStats.todayDate !== today) {
      commentStats.today = 0;
      commentStats.todayDate = today;
    }
    
    commentStats.total++;
    commentStats.today++;
    commentStats.byTarget[target] = (commentStats.byTarget[target] || 0) + 1;
    
    await chrome.storage.local.set({ commentStats });
  },

  async getStats() {
    const { commentStats = { total: 0, today: 0, byTarget: {} } } = 
      await chrome.storage.local.get('commentStats');
    return commentStats;
  },

  // === STATE ===
  async updateState(updates) {
    const { autoCommentState = {} } = await chrome.storage.local.get('autoCommentState');
    await chrome.storage.local.set({ autoCommentState: { ...autoCommentState, ...updates } });
  },

  async getState() {
    const { autoCommentState = {} } = await chrome.storage.local.get('autoCommentState');
    return autoCommentState;
  },

  async isRunning() {
    const state = await this.getState();
    return state.isRunning || false;
  },

  async stop() {
    await this.updateState({ isRunning: false });
  }
};

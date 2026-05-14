// Facebook Auto Poster Pro - Auto Reply Module
const AutoReply = {
  
  // === DEFAULT REPLY TEMPLATES ===
  defaultTemplates: {
    fr: [
      'Merci pour votre commentaire! 🙏',
      'Merci beaucoup! N\'hesitez pas a partager! ❤️',
      'Super! Merci pour votre retour! 💯',
      'Ravi que ca vous plaise! 🎉',
      'Merci de votre soutien! 🙌'
    ],
    ar: [
      'شكراً لتعليقك! 🙏',
      'شكراً جزيلاً! لا تتردد في المشاركة! ❤️',
      'رائع! شكراً على ملاحظاتك! 💯',
      'سعيد أن أعجبك! 🎉',
      'شكراً على دعمكم! 🙌'
    ],
    en: [
      'Thanks for your comment! 🙏',
      'Thank you so much! Feel free to share! ❤️',
      'Great! Thanks for your feedback! 💯',
      'Glad you liked it! 🎉',
      'Thanks for your support! 🙌'
    ]
  },

  // === CONFIGURE AUTO-REPLY ===
  async configure(config) {
    await chrome.storage.local.set({
      autoReplyConfig: {
        enabled: config.enabled || false,
        templates: config.templates || this.defaultTemplates,
        delay: config.delay || 30, // seconds
        maxRepliesPerPost: config.maxRepliesPerPost || 10,
        language: config.language || 'fr',
        useSpintax: config.useSpintax || false,
        excludeKeywords: config.excludeKeywords || [],
        includeKeywords: config.includeKeywords || [],
        replyToAll: config.replyToAll !== false
      }
    });
  },

  // === GET CONFIG ===
  async getConfig() {
    const { autoReplyConfig } = await chrome.storage.local.get('autoReplyConfig');
    return autoReplyConfig || {
      enabled: false,
      templates: this.defaultTemplates,
      delay: 30,
      maxRepliesPerPost: 10,
      language: 'fr',
      useSpintax: false,
      excludeKeywords: [],
      includeKeywords: [],
      replyToAll: true
    };
  },

  // === GET RANDOM REPLY ===
  getRandomReply(language = 'fr', customTemplates = null) {
    const templates = customTemplates || this.defaultTemplates[language] || this.defaultTemplates.fr;
    return templates[Math.floor(Math.random() * templates.length)];
  },

  // === SHOULD REPLY TO COMMENT ===
  shouldReply(commentText, config) {
    if (!config.replyToAll) {
      // Check include keywords
      if (config.includeKeywords.length > 0) {
        const hasKeyword = config.includeKeywords.some(kw => 
          commentText.toLowerCase().includes(kw.toLowerCase())
        );
        if (!hasKeyword) return false;
      }
    }
    
    // Check exclude keywords
    if (config.excludeKeywords.length > 0) {
      const hasExcluded = config.excludeKeywords.some(kw => 
        commentText.toLowerCase().includes(kw.toLowerCase())
      );
      if (hasExcluded) return false;
    }
    
    return true;
  },

  // === SAVE CUSTOM TEMPLATES ===
  async saveTemplates(language, templates) {
    const config = await this.getConfig();
    if (!config.templates) config.templates = {};
    config.templates[language] = templates;
    await chrome.storage.local.set({ autoReplyConfig: config });
  },

  // === GET REPLY STATS ===
  async getStats() {
    const { autoReplyStats = { total: 0, today: 0, lastReplyAt: null } } = 
      await chrome.storage.local.get('autoReplyStats');
    return autoReplyStats;
  },

  // === RECORD REPLY ===
  async recordReply() {
    const { autoReplyStats = { total: 0, today: 0, lastReplyAt: null, todayDate: '' } } = 
      await chrome.storage.local.get('autoReplyStats');
    
    const today = new Date().toISOString().split('T')[0];
    if (autoReplyStats.todayDate !== today) {
      autoReplyStats.today = 0;
      autoReplyStats.todayDate = today;
    }
    
    autoReplyStats.total++;
    autoReplyStats.today++;
    autoReplyStats.lastReplyAt = new Date().toISOString();
    
    await chrome.storage.local.set({ autoReplyStats });
  }
};

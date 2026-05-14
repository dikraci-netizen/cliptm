// Facebook Auto Poster Pro - Auto Friend Request Module
const AutoFriend = {

  // === SEND FRIEND REQUEST ===
  async sendRequest(profileUrl) {
    const result = await chrome.runtime.sendMessage({
      action: 'contentAction',
      data: { task: 'sendFriendRequest', url: profileUrl }
    });

    if (result?.success) await this.recordRequest(profileUrl);
    return result;
  },

  // === BULK SEND FRIEND REQUESTS ===
  async bulkSendRequests(profileUrls, options = {}) {
    const {
      delayMin = 30,
      delayMax = 120,
      maxPerSession = 20,
      sendMessage = false,
      messageTemplate = ''
    } = options;

    const results = [];
    const limit = Math.min(profileUrls.length, maxPerSession);

    await this.updateState({ isRunning: true, total: limit, current: 0, sent: 0, failed: 0 });

    for (let i = 0; i < limit; i++) {
      if (!(await this.isRunning())) break;

      const url = profileUrls[i].trim();
      if (!url) continue;

      try {
        const result = await chrome.runtime.sendMessage({
          action: 'contentAction',
          data: {
            task: 'sendFriendRequest',
            url,
            sendMessage,
            messageTemplate: sendMessage ? this.processMessage(messageTemplate) : ''
          }
        });

        results.push({ url, success: result?.success || false, error: result?.error });

        await this.updateState({
          current: i + 1,
          sent: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        });
      } catch (error) {
        results.push({ url, success: false, error: error.message });
      }

      // Random delay
      if (i < limit - 1) {
        const delay = Math.floor(Math.random() * (delayMax - delayMin + 1) + delayMin) * 1000;
        await new Promise(r => setTimeout(r, delay));
      }
    }

    await this.updateState({ isRunning: false });
    return results;
  },

  // === SEND REQUESTS TO GROUP MEMBERS ===
  async sendToGroupMembers(groupUrl, options = {}) {
    const { maxRequests = 15, delayMin = 45, delayMax = 120 } = options;

    // First extract members
    let members = [];
    if (typeof MemberExtractor !== 'undefined') {
      const extraction = await MemberExtractor.extractMembers(groupUrl, { maxMembers: maxRequests * 2 });
      if (extraction?.members) {
        members = extraction.members.map(m => m.profileUrl).filter(url => url);
      }
    }

    if (members.length === 0) {
      return { success: false, error: 'No members found' };
    }

    return this.bulkSendRequests(members.slice(0, maxRequests), { delayMin, delayMax, ...options });
  },

  // === SEND REQUESTS TO SUGGESTED FRIENDS ===
  async sendToSuggested(options = {}) {
    const { maxRequests = 10, delayMin = 20, delayMax = 60 } = options;

    const result = await chrome.runtime.sendMessage({
      action: 'contentAction',
      data: {
        task: 'addSuggestedFriends',
        url: 'https://www.facebook.com/friends/suggestions',
        maxRequests,
        delayMin,
        delayMax
      }
    });

    return result;
  },

  // === SEND MESSAGE WITH REQUEST ===
  processMessage(template) {
    if (!template) return '';
    if (typeof Spintax !== 'undefined') {
      return Spintax.process(template);
    }
    return template;
  },

  // === DEFAULT INTRO MESSAGES ===
  messageTemplates: {
    fr: [
      '{Salut|Bonjour|Hey}! Je {cherche|souhaite} {elargir|developper} mon reseau. {Connectons-nous|Ravis de se connecter}! 🤝',
      '{Bonjour|Salut}! Nous avons {des interets communs|des groupes en commun}. {Ajoutons-nous|Connectons-nous}! 👋',
      '{Hey|Salut}! {J\'ai vu votre profil|Votre profil est interessant}. {On reste en contact|Restons connectes}? 😊'
    ],
    ar: [
      '{مرحباً|السلام عليكم|أهلاً}! {أبحث عن|أرغب في} {توسيع|تطوير} شبكتي. {لنتواصل|سعيد بالتواصل}! 🤝',
      '{مرحباً|أهلاً}! {لدينا اهتمامات مشتركة|لدينا مجموعات مشتركة}. {لنتواصل|لنكن أصدقاء}! 👋',
      '{أهلاً|مرحباً}! {رأيت ملفك الشخصي|ملفك الشخصي مثير للاهتمام}. {نبقى على تواصل|لنتواصل}? 😊'
    ],
    en: [
      '{Hi|Hello|Hey}! I\'m {looking to|wanting to} {expand|grow} my network. {Let\'s connect|Nice to connect}! 🤝',
      '{Hello|Hi}! We have {common interests|groups in common}. {Let\'s connect|Let\'s add each other}! 👋',
      '{Hey|Hi}! {I saw your profile|Your profile looks interesting}. {Let\'s stay in touch|Let\'s connect}? 😊'
    ]
  },

  getRandomMessage(language = 'fr') {
    const templates = this.messageTemplates[language] || this.messageTemplates.fr;
    const template = templates[Math.floor(Math.random() * templates.length)];
    return this.processMessage(template);
  },

  // === STATS ===
  async recordRequest(profileUrl) {
    const { friendStats = { total: 0, today: 0, todayDate: '', requests: [] } } =
      await chrome.storage.local.get('friendStats');

    const today = new Date().toISOString().split('T')[0];
    if (friendStats.todayDate !== today) {
      friendStats.today = 0;
      friendStats.todayDate = today;
    }

    friendStats.total++;
    friendStats.today++;
    friendStats.requests.unshift({ url: profileUrl, date: new Date().toISOString() });
    if (friendStats.requests.length > 200) friendStats.requests = friendStats.requests.slice(0, 200);

    await chrome.storage.local.set({ friendStats });
  },

  async getStats() {
    const { friendStats = { total: 0, today: 0, requests: [] } } =
      await chrome.storage.local.get('friendStats');
    return friendStats;
  },

  // === DAILY LIMIT CHECK ===
  async canSendMore(dailyLimit = 20) {
    const stats = await this.getStats();
    return stats.today < dailyLimit;
  },

  // === STATE ===
  async updateState(updates) {
    const { autoFriendState = {} } = await chrome.storage.local.get('autoFriendState');
    await chrome.storage.local.set({ autoFriendState: { ...autoFriendState, ...updates } });
  },

  async getState() {
    const { autoFriendState = {} } = await chrome.storage.local.get('autoFriendState');
    return autoFriendState;
  },

  async isRunning() {
    const state = await this.getState();
    return state.isRunning || false;
  },

  async stop() {
    await this.updateState({ isRunning: false });
  }
};

// Facebook Auto Poster Pro - Auto Like Module
const AutoLike = {

  // === LIKE POSTS IN FEED ===
  async likeFeedPosts(options = {}) {
    const {
      maxLikes = 20,
      delayMin = 5,
      delayMax = 15,
      targetUrl = null, // null = news feed, or group/page URL
      likeType = 'like', // like, love, haha, wow, sad, angry
      skipAlreadyLiked = true
    } = options;

    await this.updateState({ isRunning: true, total: maxLikes, current: 0 });

    const result = await chrome.runtime.sendMessage({
      action: 'contentAction',
      data: {
        task: 'autoLike',
        url: targetUrl || 'https://www.facebook.com/',
        maxLikes,
        delayMin,
        delayMax,
        likeType,
        skipAlreadyLiked
      }
    });

    await this.updateState({ isRunning: false });
    return result;
  },

  // === LIKE POSTS IN A SPECIFIC GROUP ===
  async likeGroupPosts(groupUrl, options = {}) {
    return this.likeFeedPosts({ ...options, targetUrl: groupUrl });
  },

  // === LIKE POSTS ON A PAGE ===
  async likePagePosts(pageUrl, options = {}) {
    return this.likeFeedPosts({ ...options, targetUrl: pageUrl });
  },

  // === LIKE COMMENTS ON A POST ===
  async likeComments(postUrl, options = {}) {
    const { maxLikes = 10, delayMin = 3, delayMax = 8 } = options;

    const result = await chrome.runtime.sendMessage({
      action: 'contentAction',
      data: {
        task: 'likeComments',
        url: postUrl,
        maxLikes,
        delayMin,
        delayMax
      }
    });

    return result;
  },

  // === REACT TO POST (specific reaction) ===
  async reactToPost(postUrl, reaction = 'like') {
    const result = await chrome.runtime.sendMessage({
      action: 'contentAction',
      data: {
        task: 'reactToPost',
        url: postUrl,
        reaction
      }
    });
    return result;
  },

  // === BULK LIKE MULTIPLE GROUPS ===
  async bulkLikeGroups(groupUrls, options = {}) {
    const { likesPerGroup = 5, delayBetweenGroups = 60 } = options;
    const results = [];

    for (const url of groupUrls) {
      if (!(await this.isRunning())) break;

      const result = await this.likeGroupPosts(url, { maxLikes: likesPerGroup, ...options });
      results.push({ url, ...result });

      // Delay between groups
      const delay = (delayBetweenGroups + Math.random() * 30) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }

    return results;
  },

  // === STATS ===
  async recordLike(target) {
    const { likeStats = { total: 0, today: 0, todayDate: '', byTarget: {} } } = 
      await chrome.storage.local.get('likeStats');
    
    const today = new Date().toISOString().split('T')[0];
    if (likeStats.todayDate !== today) {
      likeStats.today = 0;
      likeStats.todayDate = today;
    }
    
    likeStats.total++;
    likeStats.today++;
    likeStats.byTarget[target] = (likeStats.byTarget[target] || 0) + 1;
    
    await chrome.storage.local.set({ likeStats });
  },

  async getStats() {
    const { likeStats = { total: 0, today: 0, byTarget: {} } } = 
      await chrome.storage.local.get('likeStats');
    return likeStats;
  },

  // === STATE ===
  async updateState(updates) {
    const { autoLikeState = {} } = await chrome.storage.local.get('autoLikeState');
    await chrome.storage.local.set({ autoLikeState: { ...autoLikeState, ...updates } });
  },

  async getState() {
    const { autoLikeState = {} } = await chrome.storage.local.get('autoLikeState');
    return autoLikeState;
  },

  async isRunning() {
    const state = await this.getState();
    return state.isRunning || false;
  },

  async stop() {
    await this.updateState({ isRunning: false });
  }
};

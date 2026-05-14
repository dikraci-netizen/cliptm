// Facebook Auto Poster Pro - Auto Share Module
const AutoShare = {

  // === SHARE POST TO TIMELINE ===
  async shareToTimeline(postUrl, options = {}) {
    const { caption = '', addEmoji = false, language = 'fr' } = options;
    
    let shareCaption = caption;
    if (addEmoji && typeof ContentEnhancer !== 'undefined') {
      shareCaption = ContentEnhancer.addEmojisToText(shareCaption, 'marketing');
    }

    const result = await chrome.runtime.sendMessage({
      action: 'contentAction',
      data: {
        task: 'sharePost',
        url: postUrl,
        shareTarget: 'timeline',
        caption: shareCaption
      }
    });

    if (result?.success) await this.recordShare('timeline');
    return result;
  },

  // === SHARE POST TO A GROUP ===
  async shareToGroup(postUrl, groupUrl, options = {}) {
    const { caption = '' } = options;

    const result = await chrome.runtime.sendMessage({
      action: 'contentAction',
      data: {
        task: 'sharePost',
        url: postUrl,
        shareTarget: 'group',
        targetUrl: groupUrl,
        caption
      }
    });

    if (result?.success) await this.recordShare(groupUrl);
    return result;
  },

  // === SHARE TO MULTIPLE GROUPS ===
  async shareToMultipleGroups(postUrl, groupUrls, options = {}) {
    const {
      caption = '',
      delayMin = 30,
      delayMax = 90,
      useSpintax = false,
      addEmoji = false,
      maxShares = 20
    } = options;

    const results = [];
    const limit = Math.min(groupUrls.length, maxShares);

    await this.updateState({ isRunning: true, total: limit, current: 0, shared: 0, failed: 0 });

    for (let i = 0; i < limit; i++) {
      if (!(await this.isRunning())) break;

      let shareCaption = caption;
      if (useSpintax && typeof Spintax !== 'undefined') {
        shareCaption = Spintax.process(caption);
      }
      if (addEmoji && typeof ContentEnhancer !== 'undefined') {
        shareCaption = ContentEnhancer.addEmojisToText(shareCaption, 'marketing');
      }

      try {
        const result = await chrome.runtime.sendMessage({
          action: 'contentAction',
          data: {
            task: 'sharePost',
            url: postUrl,
            shareTarget: 'group',
            targetUrl: groupUrls[i],
            caption: shareCaption
          }
        });

        results.push({ group: groupUrls[i], success: result?.success || false, error: result?.error });

        await this.updateState({
          current: i + 1,
          shared: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        });
      } catch (error) {
        results.push({ group: groupUrls[i], success: false, error: error.message });
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

  // === SHARE CONTENT FROM FEED TO GROUPS ===
  async shareFeedToGroups(options = {}) {
    const {
      sourceUrl = 'https://www.facebook.com/',
      groupUrls = [],
      maxPosts = 5,
      sharesPerPost = 3,
      delayMin = 60,
      delayMax = 180,
      keywords = [] // Only share posts containing these keywords
    } = options;

    const result = await chrome.runtime.sendMessage({
      action: 'contentAction',
      data: {
        task: 'shareFeedToGroups',
        sourceUrl,
        groupUrls,
        maxPosts,
        sharesPerPost,
        delayMin,
        delayMax,
        keywords
      }
    });

    return result;
  },

  // === SHARE PAGE POSTS TO GROUPS ===
  async sharePageToGroups(pageUrl, groupUrls, options = {}) {
    const { maxPosts = 3, caption = '', delayMin = 60, delayMax = 120 } = options;

    const results = [];

    // Get recent posts from page
    const posts = await chrome.runtime.sendMessage({
      action: 'contentAction',
      data: { task: 'getPagePosts', url: pageUrl, maxPosts }
    });

    if (!posts?.urls || posts.urls.length === 0) {
      return { success: false, error: 'No posts found on page' };
    }

    for (const postUrl of posts.urls) {
      const shareResults = await this.shareToMultipleGroups(postUrl, groupUrls, {
        caption, delayMin, delayMax, ...options
      });
      results.push({ postUrl, shares: shareResults });
    }

    return { success: true, results };
  },

  // === STATS ===
  async recordShare(target) {
    const { shareStats = { total: 0, today: 0, todayDate: '', byTarget: {} } } =
      await chrome.storage.local.get('shareStats');

    const today = new Date().toISOString().split('T')[0];
    if (shareStats.todayDate !== today) {
      shareStats.today = 0;
      shareStats.todayDate = today;
    }

    shareStats.total++;
    shareStats.today++;
    shareStats.byTarget[target] = (shareStats.byTarget[target] || 0) + 1;

    await chrome.storage.local.set({ shareStats });
  },

  async getStats() {
    const { shareStats = { total: 0, today: 0, byTarget: {} } } =
      await chrome.storage.local.get('shareStats');
    return shareStats;
  },

  // === STATE ===
  async updateState(updates) {
    const { autoShareState = {} } = await chrome.storage.local.get('autoShareState');
    await chrome.storage.local.set({ autoShareState: { ...autoShareState, ...updates } });
  },

  async getState() {
    const { autoShareState = {} } = await chrome.storage.local.get('autoShareState');
    return autoShareState;
  },

  async isRunning() {
    const state = await this.getState();
    return state.isRunning || false;
  },

  async stop() {
    await this.updateState({ isRunning: false });
  }
};

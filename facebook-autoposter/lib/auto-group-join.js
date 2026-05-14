// Facebook Auto Poster Pro - Auto Group Join Module
const AutoGroupJoin = {

  // === JOIN GROUP BY URL ===
  async joinGroup(groupUrl) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'executeInTab',
        data: { task: 'joinGroup', url: groupUrl }
      }, resolve);
    });
  },

  // === BULK JOIN GROUPS ===
  async bulkJoin(groupUrls, options = {}) {
    const { delayMin = 30, delayMax = 120, maxPerSession = 10, answerQuestions = true } = options;
    
    const results = [];
    const limit = Math.min(groupUrls.length, maxPerSession);
    
    await this.updateState({ isRunning: true, total: limit, current: 0, joined: 0, failed: 0 });

    for (let i = 0; i < limit; i++) {
      if (!(await this.isRunning())) break;

      const url = groupUrls[i].trim();
      if (!url) continue;

      try {
        const result = await chrome.runtime.sendMessage({
          action: 'contentAction',
          data: { task: 'joinGroup', url, answerQuestions }
        });

        results.push({ url, success: result?.success || false, error: result?.error });
        
        await this.updateState({
          current: i + 1,
          joined: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        });

      } catch (error) {
        results.push({ url, success: false, error: error.message });
      }

      // Random delay between joins
      if (i < limit - 1) {
        const delay = Math.floor(Math.random() * (delayMax - delayMin + 1) + delayMin) * 1000;
        await new Promise(r => setTimeout(r, delay));
      }
    }

    await this.updateState({ isRunning: false });
    return results;
  },

  // === SEARCH AND JOIN GROUPS BY KEYWORD ===
  async searchAndJoin(keywords, options = {}) {
    const { maxGroups = 5, delayMin = 30, delayMax = 90 } = options;
    
    const results = [];
    
    for (const keyword of keywords) {
      if (!(await this.isRunning())) break;

      const searchUrl = `https://www.facebook.com/search/groups/?q=${encodeURIComponent(keyword)}`;
      
      const groupsFound = await chrome.runtime.sendMessage({
        action: 'contentAction',
        data: { task: 'searchGroups', url: searchUrl, maxResults: maxGroups }
      });

      if (groupsFound?.groups) {
        for (const group of groupsFound.groups.slice(0, maxGroups)) {
          const joinResult = await chrome.runtime.sendMessage({
            action: 'contentAction',
            data: { task: 'joinGroup', url: group.url }
          });
          results.push({ ...group, joined: joinResult?.success || false });

          const delay = Math.floor(Math.random() * (delayMax - delayMin + 1) + delayMin) * 1000;
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }

    return results;
  },

  // === GET JOINED GROUPS LIST ===
  async getJoinedGroups() {
    const { joinedGroups = [] } = await chrome.storage.local.get('joinedGroups');
    return joinedGroups;
  },

  // === SAVE GROUP TO LIST ===
  async saveGroup(group) {
    const { joinedGroups = [] } = await chrome.storage.local.get('joinedGroups');
    if (!joinedGroups.find(g => g.url === group.url)) {
      joinedGroups.push({
        ...group,
        joinedAt: new Date().toISOString(),
        postCount: 0,
        lastPostAt: null
      });
      await chrome.storage.local.set({ joinedGroups });
    }
  },

  // === REMOVE GROUP ===
  async removeGroup(url) {
    const { joinedGroups = [] } = await chrome.storage.local.get('joinedGroups');
    await chrome.storage.local.set({ joinedGroups: joinedGroups.filter(g => g.url !== url) });
  },

  // === IMPORT GROUPS FROM TEXT ===
  parseGroupUrls(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    return lines.filter(l => l.includes('facebook.com/groups/'));
  },

  // === STATE MANAGEMENT ===
  async updateState(updates) {
    const { autoGroupState = {} } = await chrome.storage.local.get('autoGroupState');
    await chrome.storage.local.set({ autoGroupState: { ...autoGroupState, ...updates } });
  },

  async getState() {
    const { autoGroupState = {} } = await chrome.storage.local.get('autoGroupState');
    return autoGroupState;
  },

  async isRunning() {
    const state = await this.getState();
    return state.isRunning || false;
  },

  async stop() {
    await this.updateState({ isRunning: false });
  }
};

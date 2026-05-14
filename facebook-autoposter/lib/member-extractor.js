// Facebook Auto Poster Pro - Group Member Extractor Module
const MemberExtractor = {

  // === EXTRACT MEMBERS FROM GROUP ===
  async extractMembers(groupUrl, options = {}) {
    const {
      maxMembers = 100,
      scrollDelay = 2000,
      extractInfo = ['name', 'profileUrl', 'joinDate'],
      filterAdmins = false,
      filterNewMembers = false
    } = options;

    await this.updateState({ isRunning: true, total: maxMembers, current: 0 });

    const result = await chrome.runtime.sendMessage({
      action: 'contentAction',
      data: {
        task: 'extractMembers',
        url: groupUrl.includes('/members') ? groupUrl : groupUrl + '/members',
        maxMembers,
        scrollDelay,
        extractInfo,
        filterAdmins,
        filterNewMembers
      }
    });

    await this.updateState({ isRunning: false });

    if (result?.members) {
      await this.saveExtraction(groupUrl, result.members);
    }

    return result;
  },

  // === EXTRACT ACTIVE MEMBERS (who post/comment) ===
  async extractActiveMembers(groupUrl, options = {}) {
    const { maxPosts = 20, scrollDelay = 2000 } = options;

    const result = await chrome.runtime.sendMessage({
      action: 'contentAction',
      data: {
        task: 'extractActiveMembers',
        url: groupUrl,
        maxPosts,
        scrollDelay
      }
    });

    if (result?.members) {
      await this.saveExtraction(groupUrl, result.members, 'active');
    }

    return result;
  },

  // === EXTRACT ADMINS/MODERATORS ===
  async extractAdmins(groupUrl) {
    const result = await chrome.runtime.sendMessage({
      action: 'contentAction',
      data: {
        task: 'extractAdmins',
        url: groupUrl.includes('/members') ? groupUrl.replace('/members', '/members/admins') : groupUrl + '/members/admins'
      }
    });
    return result;
  },

  // === SAVE EXTRACTION ===
  async saveExtraction(groupUrl, members, type = 'all') {
    const { extractions = [] } = await chrome.storage.local.get('extractions');
    
    const extraction = {
      id: Date.now().toString(),
      groupUrl,
      groupName: this.extractGroupName(groupUrl),
      type,
      memberCount: members.length,
      members,
      extractedAt: new Date().toISOString()
    };

    extractions.unshift(extraction);
    if (extractions.length > 20) extractions.pop(); // Keep last 20 extractions
    
    await chrome.storage.local.set({ extractions });
    return extraction;
  },

  // === GET ALL EXTRACTIONS ===
  async getExtractions() {
    const { extractions = [] } = await chrome.storage.local.get('extractions');
    return extractions;
  },

  // === GET SPECIFIC EXTRACTION ===
  async getExtraction(id) {
    const { extractions = [] } = await chrome.storage.local.get('extractions');
    return extractions.find(e => e.id === id);
  },

  // === DELETE EXTRACTION ===
  async deleteExtraction(id) {
    const { extractions = [] } = await chrome.storage.local.get('extractions');
    await chrome.storage.local.set({ extractions: extractions.filter(e => e.id !== id) });
  },

  // === EXPORT MEMBERS ===
  async exportMembers(extractionId, format = 'csv') {
    const extraction = await this.getExtraction(extractionId);
    if (!extraction) return null;

    if (format === 'csv') {
      let csv = 'Name,Profile URL,Join Date,Role\n';
      extraction.members.forEach(m => {
        csv += `"${m.name || ''}","${m.profileUrl || ''}","${m.joinDate || ''}","${m.role || 'member'}"\n`;
      });
      return csv;
    }

    if (format === 'json') {
      return JSON.stringify(extraction.members, null, 2);
    }

    if (format === 'txt') {
      return extraction.members.map(m => `${m.name} - ${m.profileUrl}`).join('\n');
    }

    return null;
  },

  // === EXPORT ALL PROFILE URLS (for friend requests) ===
  async exportProfileUrls(extractionId) {
    const extraction = await this.getExtraction(extractionId);
    if (!extraction) return [];
    return extraction.members.map(m => m.profileUrl).filter(url => url);
  },

  // === FILTER MEMBERS ===
  filterMembers(members, criteria = {}) {
    let filtered = [...members];

    if (criteria.nameContains) {
      const search = criteria.nameContains.toLowerCase();
      filtered = filtered.filter(m => m.name && m.name.toLowerCase().includes(search));
    }

    if (criteria.role) {
      filtered = filtered.filter(m => m.role === criteria.role);
    }

    if (criteria.joinedAfter) {
      const after = new Date(criteria.joinedAfter);
      filtered = filtered.filter(m => m.joinDate && new Date(m.joinDate) >= after);
    }

    if (criteria.joinedBefore) {
      const before = new Date(criteria.joinedBefore);
      filtered = filtered.filter(m => m.joinDate && new Date(m.joinDate) <= before);
    }

    return filtered;
  },

  // === MERGE EXTRACTIONS (remove duplicates) ===
  async mergeExtractions(extractionIds) {
    const allMembers = [];
    const seenUrls = new Set();

    for (const id of extractionIds) {
      const extraction = await this.getExtraction(id);
      if (extraction) {
        for (const member of extraction.members) {
          if (member.profileUrl && !seenUrls.has(member.profileUrl)) {
            seenUrls.add(member.profileUrl);
            allMembers.push(member);
          }
        }
      }
    }

    return allMembers;
  },

  // === UTILITIES ===
  extractGroupName(url) {
    const match = url.match(/groups\/([^/?]+)/);
    return match ? match[1] : 'unknown';
  },

  // === STATE ===
  async updateState(updates) {
    const { extractorState = {} } = await chrome.storage.local.get('extractorState');
    await chrome.storage.local.set({ extractorState: { ...extractorState, ...updates } });
  },

  async getState() {
    const { extractorState = {} } = await chrome.storage.local.get('extractorState');
    return extractorState;
  },

  async isRunning() {
    const state = await this.getState();
    return state.isRunning || false;
  },

  async stop() {
    await this.updateState({ isRunning: false });
  }
};

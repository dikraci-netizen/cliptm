// Facebook Auto Poster Pro - Multi-Account Manager
const AccountManager = {
  
  // === ADD ACCOUNT ===
  async addAccount(account) {
    const { accounts = [] } = await chrome.storage.local.get('accounts');
    
    const newAccount = {
      id: Date.now().toString(),
      name: account.name,
      type: account.type, // profile, page, group
      url: account.url,
      isActive: true,
      createdAt: new Date().toISOString(),
      postCount: 0,
      lastPostAt: null
    };
    
    accounts.push(newAccount);
    await chrome.storage.local.set({ accounts });
    return newAccount;
  },

  // === GET ALL ACCOUNTS ===
  async getAccounts(type = null) {
    const { accounts = [] } = await chrome.storage.local.get('accounts');
    if (type) return accounts.filter(a => a.type === type);
    return accounts;
  },

  // === GET ACTIVE ACCOUNTS ===
  async getActiveAccounts() {
    const { accounts = [] } = await chrome.storage.local.get('accounts');
    return accounts.filter(a => a.isActive);
  },

  // === UPDATE ACCOUNT ===
  async updateAccount(id, updates) {
    const { accounts = [] } = await chrome.storage.local.get('accounts');
    const updated = accounts.map(a => a.id === id ? { ...a, ...updates } : a);
    await chrome.storage.local.set({ accounts: updated });
    return updated.find(a => a.id === id);
  },

  // === DELETE ACCOUNT ===
  async deleteAccount(id) {
    const { accounts = [] } = await chrome.storage.local.get('accounts');
    const filtered = accounts.filter(a => a.id !== id);
    await chrome.storage.local.set({ accounts: filtered });
    return { success: true };
  },

  // === TOGGLE ACCOUNT ===
  async toggleAccount(id) {
    const { accounts = [] } = await chrome.storage.local.get('accounts');
    const account = accounts.find(a => a.id === id);
    if (account) {
      account.isActive = !account.isActive;
      await chrome.storage.local.set({ accounts });
    }
    return account;
  },

  // === RECORD POST FOR ACCOUNT ===
  async recordPost(id) {
    const { accounts = [] } = await chrome.storage.local.get('accounts');
    const account = accounts.find(a => a.id === id);
    if (account) {
      account.postCount = (account.postCount || 0) + 1;
      account.lastPostAt = new Date().toISOString();
      await chrome.storage.local.set({ accounts });
    }
  },

  // === PUBLISH TO MULTIPLE ACCOUNTS ===
  async publishToMultiple(content, accountIds, options = {}) {
    const { accounts = [] } = await chrome.storage.local.get('accounts');
    const targets = accounts.filter(a => accountIds.includes(a.id) && a.isActive);
    
    const results = [];
    for (const target of targets) {
      // Add delay between posts to different targets
      if (results.length > 0) {
        const delay = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'publishPost',
          data: {
            content,
            target: target.type,
            targetUrl: target.url
          }
        });
        
        results.push({
          accountId: target.id,
          accountName: target.name,
          success: response?.success || false,
          error: response?.error
        });
        
        if (response?.success) {
          await this.recordPost(target.id);
        }
      } catch (error) {
        results.push({
          accountId: target.id,
          accountName: target.name,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  },

  // === EXPORT ACCOUNTS ===
  async exportAccounts() {
    const { accounts = [] } = await chrome.storage.local.get('accounts');
    return JSON.stringify(accounts, null, 2);
  },

  // === IMPORT ACCOUNTS ===
  async importAccounts(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      if (!Array.isArray(imported)) throw new Error('Invalid format');
      
      const { accounts = [] } = await chrome.storage.local.get('accounts');
      const existingUrls = new Set(accounts.map(a => a.url));
      
      const newAccounts = imported.filter(a => !existingUrls.has(a.url)).map(a => ({
        ...a,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      }));
      
      accounts.push(...newAccounts);
      await chrome.storage.local.set({ accounts });
      
      return { success: true, imported: newAccounts.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

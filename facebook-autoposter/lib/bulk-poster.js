// Facebook Auto Poster Pro - Bulk Posting Module
const BulkPoster = {
  isRunning: false,
  currentIndex: 0,
  posts: [],
  intervalId: null,

  // === START BULK POSTING ===
  async start(posts, options = {}) {
    if (this.isRunning) return { success: false, error: 'Bulk posting already running' };
    
    this.posts = posts.filter(p => p.trim().length > 0);
    if (this.posts.length === 0) return { success: false, error: 'No posts to publish' };
    
    this.isRunning = true;
    this.currentIndex = 0;
    
    await chrome.storage.local.set({
      bulkState: {
        isRunning: true,
        total: this.posts.length,
        current: 0,
        completed: 0,
        failed: 0,
        posts: this.posts,
        options
      }
    });
    
    // Start processing
    await this.processNext(options);
    return { success: true, total: this.posts.length };
  },

  // === PROCESS NEXT POST ===
  async processNext(options = {}) {
    if (!this.isRunning || this.currentIndex >= this.posts.length) {
      await this.complete();
      return;
    }
    
    const content = this.posts[this.currentIndex];
    
    // Process content (spintax, emojis, etc.)
    let processedContent = content;
    if (options.useSpintax && typeof Spintax !== 'undefined') {
      processedContent = Spintax.process(content);
    }
    if (options.addEmoji && typeof ContentEnhancer !== 'undefined') {
      processedContent = ContentEnhancer.addEmojisToText(processedContent, options.category || 'marketing');
    }
    if (options.addHashtags && typeof ContentEnhancer !== 'undefined') {
      const hashtags = ContentEnhancer.generateHashtags(processedContent, options.category || 'marketing', 3);
      processedContent += '\n\n' + hashtags.join(' ');
    }
    
    // Publish
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'publishPost',
        data: {
          content: processedContent,
          target: options.target || 'timeline',
          targetUrl: options.targetUrl || ''
        }
      });
      
      // Update state
      const { bulkState = {} } = await chrome.storage.local.get('bulkState');
      if (response && response.success) {
        bulkState.completed = (bulkState.completed || 0) + 1;
      } else {
        bulkState.failed = (bulkState.failed || 0) + 1;
      }
      bulkState.current = this.currentIndex + 1;
      await chrome.storage.local.set({ bulkState });
      
    } catch (error) {
      const { bulkState = {} } = await chrome.storage.local.get('bulkState');
      bulkState.failed = (bulkState.failed || 0) + 1;
      bulkState.current = this.currentIndex + 1;
      await chrome.storage.local.set({ bulkState });
    }
    
    this.currentIndex++;
    
    // Schedule next with random delay
    if (this.isRunning && this.currentIndex < this.posts.length) {
      const minDelay = (options.intervalMin || 5) * 60 * 1000;
      const maxDelay = (options.intervalMax || 15) * 60 * 1000;
      const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
      
      // Use alarm for reliability
      chrome.alarms.create('bulk_next', { when: Date.now() + delay });
    } else {
      await this.complete();
    }
  },

  // === STOP BULK POSTING ===
  async stop() {
    this.isRunning = false;
    chrome.alarms.clear('bulk_next');
    
    const { bulkState = {} } = await chrome.storage.local.get('bulkState');
    bulkState.isRunning = false;
    await chrome.storage.local.set({ bulkState });
    
    return { success: true, message: 'Bulk posting stopped' };
  },

  // === COMPLETE ===
  async complete() {
    this.isRunning = false;
    
    const { bulkState = {} } = await chrome.storage.local.get('bulkState');
    bulkState.isRunning = false;
    await chrome.storage.local.set({ bulkState });
    
    // Send notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/icon128.png',
      title: 'Facebook Auto Poster Pro',
      message: `Bulk posting termine! ${bulkState.completed || 0} reussis, ${bulkState.failed || 0} echoues`
    });
  },

  // === GET STATUS ===
  async getStatus() {
    const { bulkState = {} } = await chrome.storage.local.get('bulkState');
    return bulkState;
  },

  // === PARSE CSV ===
  parseCSV(csvText) {
    const lines = csvText.split('\n').filter(l => l.trim());
    if (lines.length === 0) return [];
    
    // Check if first line is header
    const firstLine = lines[0].toLowerCase();
    const startIndex = (firstLine.includes('content') || firstLine.includes('post') || firstLine.includes('text')) ? 1 : 0;
    
    return lines.slice(startIndex).map(line => {
      // Handle quoted CSV fields
      if (line.startsWith('"')) {
        const match = line.match(/^"([^"]*(?:""[^"]*)*)"/);
        return match ? match[1].replace(/""/g, '"') : line;
      }
      // Take first column if comma-separated
      const cols = line.split(',');
      return cols[0].trim();
    }).filter(p => p.length > 0);
  },

  // === PARSE TXT ===
  parseTXT(txtText) {
    return txtText.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('#'));
  }
};

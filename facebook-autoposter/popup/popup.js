// Facebook Auto Poster Pro - Popup Script
class FacebookAutoPoster {
  constructor() {
    this.init();
  }

  async init() {
    this.bindTabs();
    this.bindCompose();
    this.bindSchedule();
    this.bindSettings();
    this.loadData();
    this.updateStatus();
  }

  // === TAB NAVIGATION ===
  bindTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    });
  }

  // === COMPOSE TAB ===
  bindCompose() {
    const textarea = document.getElementById('postContent');
    const charCount = document.getElementById('charCount');
    
    textarea.addEventListener('input', () => {
      charCount.textContent = textarea.value.length;
    });

    document.getElementById('publishNow').addEventListener('click', () => this.publishNow());
    document.getElementById('addToSchedule').addEventListener('click', () => this.addToSchedule());
  }

  async publishNow() {
    const content = document.getElementById('postContent').value.trim();
    if (!content) {
      this.showToast('Veuillez ecrire un contenu', 'error');
      return;
    }

    const options = this.getPostOptions();
    
    try {
      // Send message to background script to publish
      const response = await chrome.runtime.sendMessage({
        action: 'publishPost',
        data: {
          content: this.processContent(content),
          target: options.target,
          targetUrl: options.targetUrl,
          options: options
        }
      });

      if (response && response.success) {
        this.showToast('Post publie avec succes !', 'success');
        this.addToHistory(content, 'success');
        document.getElementById('postContent').value = '';
        document.getElementById('charCount').textContent = '0';
      } else {
        this.showToast('Erreur: ' + (response?.error || 'Publication echouee'), 'error');
        this.addToHistory(content, 'failed');
      }
    } catch (error) {
      this.showToast('Erreur de connexion', 'error');
      this.addToHistory(content, 'failed');
    }
  }

  getPostOptions() {
    return {
      target: document.getElementById('postTarget').value,
      targetUrl: document.getElementById('targetUrl').value,
      addEmoji: document.getElementById('addEmoji').checked,
      addHashtags: document.getElementById('addHashtags').checked
    };
  }

  processContent(content) {
    let processed = content;
    
    if (document.getElementById('addEmoji').checked) {
      const emojis = ['🔥', '💯', '✨', '🚀', '💪', '👏', '🎯', '⭐'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      processed = `${randomEmoji} ${processed} ${randomEmoji}`;
    }

    if (document.getElementById('addHashtags').checked) {
      const words = content.split(' ').filter(w => w.length > 4);
      if (words.length > 0) {
        const hashtags = words.slice(0, 3).map(w => `#${w.replace(/[^a-zA-Z0-9]/g, '')}`);
        processed += `\n\n${hashtags.join(' ')}`;
      }
    }

    return processed;
  }

  // === SCHEDULE TAB ===
  bindSchedule() {
    // Set default date and time
    const now = new Date();
    now.setHours(now.getHours() + 1);
    document.getElementById('scheduleDate').valueAsDate = now;
    document.getElementById('scheduleTime').value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  async addToSchedule() {
    const content = document.getElementById('postContent').value.trim();
    if (!content) {
      this.showToast('Veuillez ecrire un contenu', 'error');
      return;
    }

    const date = document.getElementById('scheduleDate').value;
    const time = document.getElementById('scheduleTime').value;
    const repeat = document.getElementById('repeatOption').value;

    if (!date || !time) {
      // Switch to schedule tab
      document.querySelectorAll('.tab')[1].click();
      this.showToast('Definissez une date et heure', 'error');
      return;
    }

    const scheduledPost = {
      id: Date.now().toString(),
      content: this.processContent(content),
      rawContent: content,
      date,
      time,
      repeat,
      target: document.getElementById('postTarget').value,
      targetUrl: document.getElementById('targetUrl').value,
      options: this.getPostOptions(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Save to storage
    const { scheduledPosts = [] } = await chrome.storage.local.get('scheduledPosts');
    scheduledPosts.push(scheduledPost);
    await chrome.storage.local.set({ scheduledPosts });

    // Create alarm
    const alarmTime = new Date(`${date}T${time}`).getTime();
    chrome.alarms.create(`post_${scheduledPost.id}`, { when: alarmTime });

    this.showToast('Post programme avec succes !', 'success');
    document.getElementById('postContent').value = '';
    document.getElementById('charCount').textContent = '0';
    this.loadScheduledPosts();
  }

  async loadScheduledPosts() {
    const { scheduledPosts = [] } = await chrome.storage.local.get('scheduledPosts');
    const list = document.getElementById('scheduleList');
    const emptyState = document.getElementById('emptySchedule');

    const pending = scheduledPosts.filter(p => p.status === 'pending');

    if (pending.length === 0) {
      list.innerHTML = '';
      emptyState.style.display = 'flex';
      return;
    }

    emptyState.style.display = 'none';
    list.innerHTML = pending.map(post => `
      <div class="post-item">
        <div class="post-item-content">
          <div class="post-item-text">${this.escapeHtml(post.rawContent)}</div>
          <div class="post-item-meta">${post.date} a ${post.time} | ${this.getRepeatLabel(post.repeat)}</div>
        </div>
        <div class="post-item-actions">
          <button onclick="app.removeScheduled('${post.id}')" title="Supprimer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  async removeScheduled(id) {
    const { scheduledPosts = [] } = await chrome.storage.local.get('scheduledPosts');
    const updated = scheduledPosts.filter(p => p.id !== id);
    await chrome.storage.local.set({ scheduledPosts: updated });
    chrome.alarms.clear(`post_${id}`);
    this.loadScheduledPosts();
    this.showToast('Post supprime', 'success');
  }

  getRepeatLabel(repeat) {
    const labels = { none: 'Une fois', daily: 'Quotidien', weekly: 'Hebdomadaire', monthly: 'Mensuel' };
    return labels[repeat] || 'Une fois';
  }

  // === HISTORY TAB ===
  async addToHistory(content, status) {
    const { postHistory = [] } = await chrome.storage.local.get('postHistory');
    postHistory.unshift({
      id: Date.now().toString(),
      content,
      status,
      timestamp: new Date().toISOString()
    });
    // Keep only last 50 entries
    if (postHistory.length > 50) postHistory.pop();
    await chrome.storage.local.set({ postHistory });
    this.loadHistory();
  }

  async loadHistory() {
    const { postHistory = [] } = await chrome.storage.local.get('postHistory');
    const list = document.getElementById('historyList');
    
    // Update stats
    document.getElementById('totalPosts').textContent = postHistory.length;
    document.getElementById('successPosts').textContent = postHistory.filter(p => p.status === 'success').length;
    document.getElementById('failedPosts').textContent = postHistory.filter(p => p.status === 'failed').length;

    if (postHistory.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p>Aucun historique</p>
        </div>`;
      return;
    }

    list.innerHTML = postHistory.slice(0, 20).map(post => `
      <div class="post-item">
        <div class="post-item-content">
          <div class="post-item-text">${this.escapeHtml(post.content)}</div>
          <div class="post-item-meta">${this.formatDate(post.timestamp)}</div>
        </div>
        <span class="post-item-status ${post.status}">${post.status === 'success' ? 'Reussi' : 'Echoue'}</span>
      </div>
    `).join('');
  }

  // === SETTINGS TAB ===
  bindSettings() {
    document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
    this.loadSettings();
  }

  async saveSettings() {
    const settings = {
      delayMin: parseInt(document.getElementById('delayMin').value),
      delayMax: parseInt(document.getElementById('delayMax').value),
      randomDelay: document.getElementById('randomDelay').checked,
      notifySuccess: document.getElementById('notifySuccess').checked,
      notifyError: document.getElementById('notifyError').checked,
      autoRetry: document.getElementById('autoRetry').checked,
      maxRetries: parseInt(document.getElementById('maxRetries').value)
    };

    await chrome.storage.local.set({ settings });
    this.showToast('Parametres sauvegardes !', 'success');
  }

  async loadSettings() {
    const { settings } = await chrome.storage.local.get('settings');
    if (settings) {
      document.getElementById('delayMin').value = settings.delayMin || 5;
      document.getElementById('delayMax').value = settings.delayMax || 15;
      document.getElementById('randomDelay').checked = settings.randomDelay !== false;
      document.getElementById('notifySuccess').checked = settings.notifySuccess !== false;
      document.getElementById('notifyError').checked = settings.notifyError !== false;
      document.getElementById('autoRetry').checked = settings.autoRetry || false;
      document.getElementById('maxRetries').value = settings.maxRetries || 3;
    }
  }

  // === STATUS ===
  async updateStatus() {
    const { isActive } = await chrome.storage.local.get('isActive');
    const indicator = document.getElementById('statusIndicator');
    const dot = indicator.querySelector('.status-dot');
    const text = indicator.querySelector('.status-text');
    
    if (isActive) {
      dot.classList.add('active');
      text.textContent = 'Actif';
    } else {
      dot.classList.remove('active');
      text.textContent = 'Inactif';
    }
  }

  // === DATA LOADING ===
  async loadData() {
    this.loadScheduledPosts();
    this.loadHistory();
  }

  // === UTILITIES ===
  showToast(message, type = 'info') {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Initialize app
const app = new FacebookAutoPoster();

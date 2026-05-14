// Facebook Auto Poster Pro - Ultimate Edition - Popup Script
class FacebookAutoPoster {
  constructor() {
    this.init();
  }

  async init() {
    await I18N.loadLang();
    this.applyTranslations();
    this.bindTabs();
    this.bindCompose();
    this.bindSchedule();
    this.bindTemplates();
    this.bindBulk();
    this.bindAnalytics();
    this.bindAccounts();
    this.bindSettings();
    this.loadData();
    this.updateStatus();
  }

  // === INTERNATIONALIZATION ===
  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = I18N.t(key);
      if (text !== key) el.textContent = text;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = I18N.t(key);
      if (text !== key) el.placeholder = text;
    });
    // Set language selector
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) langSelect.value = I18N.currentLang;
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

    // Spintax toggle
    document.getElementById('useSpintax').addEventListener('change', (e) => {
      document.getElementById('spintaxHint').style.display = e.target.checked ? 'block' : 'none';
    });

    // Multi-target toggle
    document.getElementById('postTarget').addEventListener('change', (e) => {
      const multiGroup = document.getElementById('multiTargetGroup');
      const urlGroup = document.getElementById('targetUrlGroup');
      if (e.target.value === 'multiple') {
        multiGroup.style.display = 'block';
        urlGroup.style.display = 'none';
        this.loadAccountCheckboxes();
      } else {
        multiGroup.style.display = 'none';
        urlGroup.style.display = 'block';
      }
    });

    document.getElementById('publishNow').addEventListener('click', () => this.publishNow());
    document.getElementById('addToSchedule').addEventListener('click', () => this.addToSchedule());
  }

  async publishNow() {
    const content = document.getElementById('postContent').value.trim();
    if (!content) {
      this.showToast(I18N.t('writeContent'), 'error');
      return;
    }

    const processed = this.processContent(content);
    const target = document.getElementById('postTarget').value;
    
    try {
      if (target === 'multiple') {
        // Publish to multiple accounts
        const checked = document.querySelectorAll('#accountCheckboxes input:checked');
        const accountIds = [...checked].map(cb => cb.value);
        const results = await AccountManager.publishToMultiple(processed, accountIds);
        const successCount = results.filter(r => r.success).length;
        this.showToast(`${successCount}/${results.length} ${I18N.t('postPublished')}`, successCount > 0 ? 'success' : 'error');
      } else {
        const response = await chrome.runtime.sendMessage({
          action: 'publishPost',
          data: {
            content: processed,
            target,
            targetUrl: document.getElementById('targetUrl').value
          }
        });

        if (response && response.success) {
          this.showToast(I18N.t('postPublished'), 'success');
          await Analytics.recordPost({ content: processed, status: 'success', target });
        } else {
          this.showToast(I18N.t('postFailed') + ': ' + (response?.error || ''), 'error');
          await Analytics.recordPost({ content: processed, status: 'failed', target });
        }
      }
      
      document.getElementById('postContent').value = '';
      document.getElementById('charCount').textContent = '0';
      this.loadHistory();
    } catch (error) {
      this.showToast(I18N.t('connectionError'), 'error');
      await Analytics.recordPost({ content: processed, status: 'failed', target });
    }
  }

  processContent(content) {
    let processed = content;
    
    // Spintax processing
    if (document.getElementById('useSpintax').checked) {
      processed = Spintax.process(processed);
    }
    
    // Emoji enhancement
    if (document.getElementById('addEmoji').checked) {
      const category = this.detectCategory(processed);
      processed = ContentEnhancer.addEmojisToText(processed, category);
    }

    // Hashtag generation
    if (document.getElementById('addHashtags').checked) {
      const category = this.detectCategory(processed);
      const hashtags = ContentEnhancer.generateHashtags(processed, category, 5);
      processed += '\n\n' + hashtags.join(' ');
    }

    return processed;
  }

  detectCategory(text) {
    const lang = ContentEnhancer.detectLanguage(text);
    if (lang === 'ar') return 'arabic';
    return 'marketing';
  }

  async loadAccountCheckboxes() {
    const accounts = await AccountManager.getActiveAccounts();
    const container = document.getElementById('accountCheckboxes');
    if (accounts.length === 0) {
      container.innerHTML = `<p style="font-size:11px;color:#65676b">${I18N.t('noAccounts')}</p>`;
      return;
    }
    container.innerHTML = accounts.map(a => `
      <label class="checkbox-label">
        <input type="checkbox" value="${a.id}" checked> ${this.escapeHtml(a.name)} (${a.type})
      </label>
    `).join('');
  }

  // === SCHEDULE TAB ===
  bindSchedule() {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    document.getElementById('scheduleDate').valueAsDate = now;
    document.getElementById('scheduleTime').value = 
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  async addToSchedule() {
    const content = document.getElementById('postContent').value.trim();
    if (!content) { this.showToast(I18N.t('writeContent'), 'error'); return; }

    const date = document.getElementById('scheduleDate').value;
    const time = document.getElementById('scheduleTime').value;
    const repeat = document.getElementById('repeatOption').value;

    if (!date || !time) {
      document.querySelectorAll('.tab')[1].click();
      this.showToast(I18N.t('setDateTime'), 'error');
      return;
    }

    const scheduledPost = {
      id: Date.now().toString(),
      content: this.processContent(content),
      rawContent: content,
      date, time, repeat,
      target: document.getElementById('postTarget').value,
      targetUrl: document.getElementById('targetUrl').value,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const { scheduledPosts = [] } = await chrome.storage.local.get('scheduledPosts');
    scheduledPosts.push(scheduledPost);
    await chrome.storage.local.set({ scheduledPosts });
    chrome.alarms.create(`post_${scheduledPost.id}`, { when: new Date(`${date}T${time}`).getTime() });

    this.showToast(I18N.t('postScheduled'), 'success');
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
          <div class="post-item-meta">${post.date} - ${post.time} | ${this.getRepeatLabel(post.repeat)}</div>
        </div>
        <div class="post-item-actions">
          <button onclick="app.removeScheduled('${post.id}')" title="${I18N.t('delete')}">✕</button>
        </div>
      </div>
    `).join('');
  }

  async removeScheduled(id) {
    const { scheduledPosts = [] } = await chrome.storage.local.get('scheduledPosts');
    await chrome.storage.local.set({ scheduledPosts: scheduledPosts.filter(p => p.id !== id) });
    chrome.alarms.clear(`post_${id}`);
    this.loadScheduledPosts();
    this.showToast(I18N.t('templateDeleted'), 'success');
  }

  getRepeatLabel(repeat) {
    return I18N.t('repeat' + repeat.charAt(0).toUpperCase() + repeat.slice(1)) || repeat;
  }

  // === TEMPLATES TAB ===
  bindTemplates() {
    document.getElementById('saveTemplate').addEventListener('click', () => this.saveTemplate());
    
    // Quick templates
    document.querySelectorAll('.quick-templates button').forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        const template = ContentEnhancer.getQuickTemplate(category);
        document.getElementById('postContent').value = template;
        document.getElementById('charCount').textContent = template.length;
        document.querySelectorAll('.tab')[0].click(); // Switch to compose
        this.showToast('Template loaded!', 'success');
      });
    });
  }

  async saveTemplate() {
    const name = document.getElementById('templateName').value.trim();
    const category = document.getElementById('templateCategory').value;
    const content = document.getElementById('templateContent').value.trim();
    
    if (!name || !content) { this.showToast(I18N.t('writeContent'), 'error'); return; }

    const { templates = [] } = await chrome.storage.local.get('templates');
    templates.push({ id: Date.now().toString(), name, category, content, createdAt: new Date().toISOString() });
    await chrome.storage.local.set({ templates });

    document.getElementById('templateName').value = '';
    document.getElementById('templateContent').value = '';
    this.showToast(I18N.t('templateSaved'), 'success');
    this.loadTemplates();
  }

  async loadTemplates() {
    const { templates = [] } = await chrome.storage.local.get('templates');
    const list = document.getElementById('templateList');
    
    if (templates.length === 0) {
      list.innerHTML = `<div class="empty-state"><p>${I18N.t('noTemplates')}</p></div>`;
      return;
    }

    list.innerHTML = templates.map(t => `
      <div class="post-item">
        <div class="post-item-content">
          <div class="post-item-text"><strong>${this.escapeHtml(t.name)}</strong></div>
          <div class="post-item-meta">${t.category} | ${this.escapeHtml(t.content.substring(0, 40))}...</div>
        </div>
        <div class="post-item-actions">
          <button onclick="app.useTemplate('${t.id}')" title="${I18N.t('useTemplate')}">📋</button>
          <button onclick="app.deleteTemplate('${t.id}')" title="${I18N.t('delete')}">✕</button>
        </div>
      </div>
    `).join('');
  }

  async useTemplate(id) {
    const { templates = [] } = await chrome.storage.local.get('templates');
    const template = templates.find(t => t.id === id);
    if (template) {
      document.getElementById('postContent').value = template.content;
      document.getElementById('charCount').textContent = template.content.length;
      document.querySelectorAll('.tab')[0].click();
    }
  }

  async deleteTemplate(id) {
    const { templates = [] } = await chrome.storage.local.get('templates');
    await chrome.storage.local.set({ templates: templates.filter(t => t.id !== id) });
    this.loadTemplates();
    this.showToast(I18N.t('templateDeleted'), 'success');
  }

  // === BULK POSTING TAB ===
  bindBulk() {
    const bulkContent = document.getElementById('bulkContent');
    bulkContent.addEventListener('input', () => {
      const lines = bulkContent.value.split('\n').filter(l => l.trim());
      document.getElementById('bulkCount').textContent = lines.length;
    });

    document.getElementById('importCSVBtn').addEventListener('click', () => {
      document.getElementById('fileImport').accept = '.csv';
      document.getElementById('fileImport').click();
    });
    document.getElementById('importTXTBtn').addEventListener('click', () => {
      document.getElementById('fileImport').accept = '.txt';
      document.getElementById('fileImport').click();
    });
    document.getElementById('fileImport').addEventListener('change', (e) => this.handleFileImport(e));
    document.getElementById('startBulk').addEventListener('click', () => this.startBulk());
    document.getElementById('stopBulk').addEventListener('click', () => this.stopBulk());
  }

  handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      let posts;
      if (file.name.endsWith('.csv')) {
        posts = BulkPoster.parseCSV(text);
      } else {
        posts = BulkPoster.parseTXT(text);
      }
      document.getElementById('bulkContent').value = posts.join('\n');
      document.getElementById('bulkCount').textContent = posts.length;
      this.showToast(`${I18N.t('importSuccess')} (${posts.length} posts)`, 'success');
    };
    reader.readAsText(file);
  }

  async startBulk() {
    const content = document.getElementById('bulkContent').value.trim();
    if (!content) { this.showToast(I18N.t('writeContent'), 'error'); return; }

    const posts = content.split('\n').filter(l => l.trim());
    const interval = parseInt(document.getElementById('bulkInterval').value) || 10;

    const result = await BulkPoster.start(posts, {
      intervalMin: interval,
      intervalMax: interval * 2,
      useSpintax: document.getElementById('bulkSpintax').checked,
      addEmoji: document.getElementById('bulkEmoji').checked,
      addHashtags: document.getElementById('bulkHashtags').checked
    });

    if (result.success) {
      this.showToast(I18N.t('bulkStarted'), 'success');
      document.getElementById('startBulk').style.display = 'none';
      document.getElementById('stopBulk').style.display = 'flex';
      document.getElementById('bulkProgress').style.display = 'block';
      this.updateBulkProgress();
    }
  }

  async stopBulk() {
    await BulkPoster.stop();
    document.getElementById('startBulk').style.display = 'flex';
    document.getElementById('stopBulk').style.display = 'none';
    this.showToast(I18N.t('bulkStopped'), 'success');
  }

  async updateBulkProgress() {
    const status = await BulkPoster.getStatus();
    if (!status.isRunning) {
      document.getElementById('startBulk').style.display = 'flex';
      document.getElementById('stopBulk').style.display = 'none';
      return;
    }

    const progress = status.total > 0 ? (status.current / status.total) * 100 : 0;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = 
      `${status.current}/${status.total} (${status.completed || 0} OK, ${status.failed || 0} fail)`;
    
    setTimeout(() => this.updateBulkProgress(), 5000);
  }

  // === ANALYTICS TAB ===
  bindAnalytics() {
    document.getElementById('exportAnalytics').addEventListener('click', () => this.exportAnalytics());
    document.getElementById('resetAnalytics').addEventListener('click', () => this.resetAnalytics());
  }

  async loadAnalytics() {
    const today = await Analytics.getStats('today');
    const week = await Analytics.getStats('week');
    const month = await Analytics.getStats('month');
    const all = await Analytics.getStats('all');
    
    document.getElementById('statToday').textContent = today.total;
    document.getElementById('statWeek').textContent = week.total;
    document.getElementById('statMonth').textContent = month.total;
    document.getElementById('statRate').textContent = all.successRate + '%';

    // Best times
    const bestTimes = await Analytics.getBestPostingTimes();
    const btContainer = document.getElementById('bestTimesDisplay');
    if (bestTimes.bestHours.length > 0) {
      btContainer.innerHTML = bestTimes.bestHours
        .filter(h => h.count > 0)
        .map(h => `<span class="time-badge">${h.hour}:00 (${h.count})</span>`)
        .join('');
    } else {
      btContainer.innerHTML = '<span style="font-size:11px;color:#65676b">Pas assez de donnees</span>';
    }

    // Activity chart
    const chartData = await Analytics.getActivityData(14);
    this.drawChart(chartData);

    // Insights
    const insights = await Analytics.getInsights();
    const insightsContainer = document.getElementById('insightsList');
    insightsContainer.innerHTML = insights.map(i => 
      `<div class="insight-item ${i.type}">${i.text}</div>`
    ).join('');
  }

  drawChart(data) {
    const canvas = document.getElementById('activityChart');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    if (data.length === 0) return;
    
    const maxVal = Math.max(...data.map(d => d.total), 1);
    const barWidth = (width - 20) / data.length;
    
    data.forEach((d, i) => {
      const barHeight = (d.total / maxVal) * (height - 30);
      const x = 10 + i * barWidth;
      const y = height - barHeight - 20;
      
      // Success bar
      const successHeight = d.total > 0 ? (d.success / d.total) * barHeight : 0;
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(x + 2, y + (barHeight - successHeight), barWidth - 4, successHeight);
      
      // Failed bar
      const failedHeight = barHeight - successHeight;
      if (failedHeight > 0) {
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(x + 2, y, barWidth - 4, failedHeight);
      }
      
      // Label
      if (i % 2 === 0) {
        ctx.fillStyle = '#65676b';
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(d.label, x + barWidth / 2, height - 5);
      }
    });
  }

  async exportAnalytics() {
    const csv = await Analytics.exportData('csv');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'autoposter-analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
    this.showToast(I18N.t('exportSuccess'), 'success');
  }

  async resetAnalytics() {
    if (confirm('Reset all analytics data?')) {
      await Analytics.resetData();
      this.loadAnalytics();
    }
  }

  // === ACCOUNTS TAB ===
  bindAccounts() {
    document.getElementById('addAccountBtn').addEventListener('click', () => this.addAccount());
  }

  async addAccount() {
    const name = document.getElementById('accountName').value.trim();
    const type = document.getElementById('accountType').value;
    const url = document.getElementById('accountUrl').value.trim();
    
    if (!name || !url) { this.showToast(I18N.t('writeContent'), 'error'); return; }

    await AccountManager.addAccount({ name, type, url });
    document.getElementById('accountName').value = '';
    document.getElementById('accountUrl').value = '';
    this.showToast(I18N.t('accountAdded'), 'success');
    this.loadAccounts();
  }

  async loadAccounts() {
    const accounts = await AccountManager.getAccounts();
    const list = document.getElementById('accountsList');
    
    if (accounts.length === 0) {
      list.innerHTML = `<div class="empty-state"><p>${I18N.t('noAccounts')}</p></div>`;
      return;
    }

    list.innerHTML = accounts.map(a => `
      <div class="account-item">
        <div class="account-info">
          <div>
            <span class="account-name">${this.escapeHtml(a.name)}</span>
            <span class="account-type-badge">${a.type}</span>
          </div>
          <div class="account-url">${this.escapeHtml(a.url)}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="account-toggle ${a.isActive ? 'active' : ''}" onclick="app.toggleAccount('${a.id}')"></button>
          <button style="background:none;border:none;cursor:pointer;color:#ff4444" onclick="app.deleteAccount('${a.id}')">✕</button>
        </div>
      </div>
    `).join('');
  }

  async toggleAccount(id) {
    await AccountManager.toggleAccount(id);
    this.loadAccounts();
  }

  async deleteAccount(id) {
    await AccountManager.deleteAccount(id);
    this.loadAccounts();
    this.showToast(I18N.t('accountDeleted'), 'success');
  }

  // === HISTORY TAB ===
  async loadHistory() {
    const { postHistory = [] } = await chrome.storage.local.get('postHistory');
    const list = document.getElementById('historyList');
    
    document.getElementById('totalPosts').textContent = postHistory.length;
    document.getElementById('successPosts').textContent = postHistory.filter(p => p.status === 'success').length;
    document.getElementById('failedPosts').textContent = postHistory.filter(p => p.status === 'failed').length;

    if (postHistory.length === 0) {
      list.innerHTML = `<div class="empty-state"><p>${I18N.t('noHistory')}</p></div>`;
      return;
    }

    list.innerHTML = postHistory.slice(0, 20).map(post => `
      <div class="post-item">
        <div class="post-item-content">
          <div class="post-item-text">${this.escapeHtml(post.content)}</div>
          <div class="post-item-meta">${this.formatDate(post.timestamp)}</div>
        </div>
        <span class="post-item-status ${post.status}">${post.status === 'success' ? I18N.t('success') : I18N.t('failedStatus')}</span>
      </div>
    `).join('');
  }

  // === SETTINGS TAB ===
  bindSettings() {
    document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
    document.getElementById('languageSelect').addEventListener('change', (e) => {
      I18N.setLang(e.target.value);
      this.applyTranslations();
    });
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
      maxRetries: parseInt(document.getElementById('maxRetries').value),
      humanMode: document.getElementById('humanMode').checked,
      randomScrolling: document.getElementById('randomScrolling').checked,
      randomPause: document.getElementById('randomPause').checked,
      fingerprint: document.getElementById('fingerprint').checked,
      autoReplyEnabled: document.getElementById('autoReplyEnabled').checked,
      replyDelay: parseInt(document.getElementById('replyDelay').value),
      watermarkText: document.getElementById('watermarkText').value,
      watermarkPosition: document.getElementById('watermarkPosition').value
    };

    await chrome.storage.local.set({ settings });
    
    // Configure auto-reply
    await AutoReply.configure({
      enabled: settings.autoReplyEnabled,
      delay: settings.replyDelay,
      language: I18N.currentLang
    });

    // Configure watermark
    await Watermark.saveConfig({
      enabled: !!settings.watermarkText,
      text: settings.watermarkText,
      position: settings.watermarkPosition
    });

    this.showToast(I18N.t('settingsSaved'), 'success');
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
      document.getElementById('humanMode').checked = settings.humanMode !== false;
      document.getElementById('randomScrolling').checked = settings.randomScrolling || false;
      document.getElementById('randomPause').checked = settings.randomPause !== false;
      document.getElementById('fingerprint').checked = settings.fingerprint || false;
      document.getElementById('autoReplyEnabled').checked = settings.autoReplyEnabled || false;
      document.getElementById('replyDelay').value = settings.replyDelay || 30;
      document.getElementById('watermarkText').value = settings.watermarkText || '';
      document.getElementById('watermarkPosition').value = settings.watermarkPosition || 'bottomRight';
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
      text.textContent = I18N.t('active');
    } else {
      dot.classList.remove('active');
      text.textContent = I18N.t('inactive');
    }
  }

  // === LOAD ALL DATA ===
  async loadData() {
    this.loadScheduledPosts();
    this.loadHistory();
    this.loadTemplates();
    this.loadAccounts();
    this.loadAnalytics();
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
    div.textContent = text || '';
    return div.innerHTML;
  }

  formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString(I18N.currentLang === 'ar' ? 'ar-SA' : I18N.currentLang === 'en' ? 'en-US' : 'fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}

// Initialize
const app = new FacebookAutoPoster();

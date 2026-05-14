// Facebook Auto Poster Pro v3.0 - Ultimate Marketing Edition - Popup Script
class FacebookAutoPoster {
  constructor() { this.init(); }

  async init() {
    await I18N.loadLang();
    this.bindTabs();
    this.bindCompose();
    this.bindSchedule();
    this.bindAutoLike();
    this.bindAutoComment();
    this.bindGroups();
    this.bindMembers();
    this.bindAutoShare();
    this.bindAutoFriend();
    this.bindCampaigns();
    this.bindBulk();
    this.bindAnalytics();
    this.bindSettings();
    this.loadData();
    this.updateStatus();
  }

  // === TABS ===
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

  // === COMPOSE ===
  bindCompose() {
    const textarea = document.getElementById('postContent');
    textarea.addEventListener('input', () => {
      document.getElementById('charCount').textContent = textarea.value.length;
    });
    document.getElementById('useSpintax').addEventListener('change', e => {
      document.getElementById('spintaxHint').style.display = e.target.checked ? 'block' : 'none';
    });
    document.getElementById('postTarget').addEventListener('change', e => {
      document.getElementById('multiTargetGroup').style.display = e.target.value === 'multiple' ? 'block' : 'none';
      document.getElementById('targetUrlGroup').style.display = e.target.value === 'multiple' ? 'none' : 'block';
    });
    document.getElementById('publishNow').addEventListener('click', () => this.publishNow());
    document.getElementById('addToSchedule').addEventListener('click', () => this.addToSchedule());
  }

  async publishNow() {
    const content = document.getElementById('postContent').value.trim();
    if (!content) return this.toast('Ecrivez un contenu', 'error');
    const processed = this.processContent(content);
    try {
      const res = await chrome.runtime.sendMessage({
        action: 'publishPost',
        data: { content: processed, target: document.getElementById('postTarget').value, targetUrl: document.getElementById('targetUrl').value }
      });
      if (res?.success) { this.toast('Post publie!', 'success'); await Analytics.recordPost({ content: processed, status: 'success', target: 'post' }); }
      else { this.toast('Erreur: ' + (res?.error || ''), 'error'); await Analytics.recordPost({ content: processed, status: 'failed', target: 'post' }); }
      document.getElementById('postContent').value = '';
      document.getElementById('charCount').textContent = '0';
    } catch (e) { this.toast('Erreur de connexion', 'error'); }
  }

  processContent(content) {
    let p = content;
    if (document.getElementById('useSpintax').checked) p = Spintax.process(p);
    if (document.getElementById('addEmoji').checked) p = ContentEnhancer.addEmojisToText(p, 'marketing');
    if (document.getElementById('addHashtags').checked) {
      const tags = ContentEnhancer.generateHashtags(p, 'marketing', 5);
      p += '\n\n' + tags.join(' ');
    }
    return p;
  }

  // === SCHEDULE ===
  bindSchedule() {
    const now = new Date(); now.setHours(now.getHours() + 1);
    document.getElementById('scheduleDate').valueAsDate = now;
    document.getElementById('scheduleTime').value = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  }

  async addToSchedule() {
    const content = document.getElementById('postContent').value.trim();
    if (!content) return this.toast('Ecrivez un contenu', 'error');
    const date = document.getElementById('scheduleDate').value;
    const time = document.getElementById('scheduleTime').value;
    if (!date || !time) { document.querySelectorAll('.tab')[1].click(); return this.toast('Choisissez date/heure', 'error'); }
    const post = { id: Date.now().toString(), content: this.processContent(content), rawContent: content, date, time, repeat: document.getElementById('repeatOption').value, target: document.getElementById('postTarget').value, targetUrl: document.getElementById('targetUrl').value, status: 'pending', createdAt: new Date().toISOString() };
    const { scheduledPosts = [] } = await chrome.storage.local.get('scheduledPosts');
    scheduledPosts.push(post);
    await chrome.storage.local.set({ scheduledPosts });
    chrome.alarms.create(`post_${post.id}`, { when: new Date(`${date}T${time}`).getTime() });
    this.toast('Post programme!', 'success');
    document.getElementById('postContent').value = ''; document.getElementById('charCount').textContent = '0';
    this.loadSchedule();
  }

  async loadSchedule() {
    const { scheduledPosts = [] } = await chrome.storage.local.get('scheduledPosts');
    const pending = scheduledPosts.filter(p => p.status === 'pending');
    const list = document.getElementById('scheduleList');
    document.getElementById('emptySchedule').style.display = pending.length ? 'none' : 'block';
    list.innerHTML = pending.map(p => `<div class="post-item"><div class="post-item-content"><div class="post-item-text">${this.esc(p.rawContent)}</div><div class="post-item-meta">${p.date} ${p.time}</div></div><button class="btn-icon" onclick="app.removeSchedule('${p.id}')">✕</button></div>`).join('');
  }

  async removeSchedule(id) {
    const { scheduledPosts = [] } = await chrome.storage.local.get('scheduledPosts');
    await chrome.storage.local.set({ scheduledPosts: scheduledPosts.filter(p => p.id !== id) });
    chrome.alarms.clear(`post_${id}`);
    this.loadSchedule();
  }


  // === AUTO LIKE ===
  bindAutoLike() {
    document.getElementById('startAutoLike').addEventListener('click', () => this.startAutoLike());
    document.getElementById('stopAutoLike').addEventListener('click', () => { AutoLike.stop(); this.toggleBtn('startAutoLike', 'stopAutoLike', false); });
  }

  async startAutoLike() {
    this.toggleBtn('startAutoLike', 'stopAutoLike', true);
    document.getElementById('likeProgress').style.display = 'block';
    const res = await AutoLike.likeFeedPosts({
      targetUrl: document.getElementById('likeTargetUrl').value || null,
      maxLikes: parseInt(document.getElementById('maxLikes').value),
      delayMin: parseInt(document.getElementById('likeDelayMin').value),
      delayMax: parseInt(document.getElementById('likeDelayMax').value),
      likeType: document.getElementById('likeType').value
    });
    this.toggleBtn('startAutoLike', 'stopAutoLike', false);
    this.toast(`${res?.liked || 0} likes effectues!`, 'success');
  }

  // === AUTO COMMENT ===
  bindAutoComment() {
    document.getElementById('startAutoComment').addEventListener('click', () => this.startAutoComment());
    document.getElementById('stopAutoComment').addEventListener('click', () => { AutoComment.stop(); this.toggleBtn('startAutoComment', 'stopAutoComment', false); });
    document.getElementById('commentPromoMode').addEventListener('change', e => {
      document.getElementById('promoLinkGroup').style.display = e.target.checked ? 'block' : 'none';
    });
  }

  async startAutoComment() {
    const templates = document.getElementById('commentTemplates').value.split('\n').filter(l => l.trim());
    if (templates.length === 0) return this.toast('Ajoutez des templates', 'error');
    this.toggleBtn('startAutoComment', 'stopAutoComment', true);
    const res = await AutoComment.commentOnPosts({
      targetUrl: document.getElementById('commentTargetUrl').value || null,
      maxComments: parseInt(document.getElementById('maxComments').value),
      templates,
      promoMode: document.getElementById('commentPromoMode').checked,
      promoLink: document.getElementById('commentPromoLink').value,
      useSpintax: document.getElementById('commentSpintax').checked
    });
    this.toggleBtn('startAutoComment', 'stopAutoComment', false);
    this.toast(`${res?.commented || 0} commentaires!`, 'success');
  }

  // === GROUPS ===
  bindGroups() {
    document.getElementById('startGroupJoin').addEventListener('click', () => this.startGroupJoin());
    document.getElementById('stopGroupJoin').addEventListener('click', () => { AutoGroupJoin.stop(); this.toggleBtn('startGroupJoin', 'stopGroupJoin', false); });
  }

  async startGroupJoin() {
    const urlsText = document.getElementById('groupUrls').value.trim();
    const keywords = document.getElementById('groupKeywords').value.trim();
    
    this.toggleBtn('startGroupJoin', 'stopGroupJoin', true);
    document.getElementById('groupProgress').style.display = 'block';

    if (urlsText) {
      const urls = AutoGroupJoin.parseGroupUrls(urlsText);
      const res = await AutoGroupJoin.bulkJoin(urls, {
        maxPerSession: parseInt(document.getElementById('maxGroupJoin').value),
        answerQuestions: document.getElementById('answerGroupQuestions').checked
      });
      const joined = res.filter(r => r.success).length;
      this.toast(`${joined}/${res.length} groupes rejoints!`, 'success');
    } else if (keywords) {
      const kws = keywords.split(',').map(k => k.trim()).filter(k => k);
      const res = await AutoGroupJoin.searchAndJoin(kws, { maxGroups: parseInt(document.getElementById('maxGroupJoin').value) });
      this.toast(`${res.filter(r => r.joined).length} groupes rejoints!`, 'success');
    } else {
      this.toast('Ajoutez des URLs ou mots-cles', 'error');
    }

    this.toggleBtn('startGroupJoin', 'stopGroupJoin', false);
    this.loadJoinedGroups();
  }

  async loadJoinedGroups() {
    const groups = await AutoGroupJoin.getJoinedGroups();
    const list = document.getElementById('joinedGroupsList');
    if (groups.length === 0) { list.innerHTML = '<p style="font-size:11px;color:#65676b">Aucun groupe</p>'; return; }
    list.innerHTML = groups.slice(0, 10).map(g => `<div class="post-item"><div class="post-item-content"><div class="post-item-text">${this.esc(g.name || g.url)}</div><div class="post-item-meta">${g.joinedAt ? new Date(g.joinedAt).toLocaleDateString() : ''}</div></div></div>`).join('');
  }

  // === MEMBERS EXTRACTION ===
  bindMembers() {
    document.getElementById('startExtraction').addEventListener('click', () => this.startExtraction());
    document.getElementById('stopExtraction').addEventListener('click', () => { MemberExtractor.stop(); this.toggleBtn('startExtraction', 'stopExtraction', false); });
    document.getElementById('exportMembersCSV').addEventListener('click', () => this.exportMembers('csv'));
    document.getElementById('exportMembersJSON').addEventListener('click', () => this.exportMembers('json'));
    document.getElementById('sendFriendToExtracted').addEventListener('click', () => this.sendFriendToExtracted());
  }

  async startExtraction() {
    const url = document.getElementById('extractGroupUrl').value.trim();
    if (!url) return this.toast('Entrez l\'URL du groupe', 'error');
    this.toggleBtn('startExtraction', 'stopExtraction', true);
    document.getElementById('extractProgress').style.display = 'block';

    const type = document.getElementById('extractType').value;
    let res;
    if (type === 'active') res = await MemberExtractor.extractActiveMembers(url, { maxPosts: 20 });
    else if (type === 'admins') res = await MemberExtractor.extractAdmins(url);
    else res = await MemberExtractor.extractMembers(url, { maxMembers: parseInt(document.getElementById('maxMembers').value) });

    this.toggleBtn('startExtraction', 'stopExtraction', false);
    this.toast(`${res?.total || 0} membres extraits!`, 'success');
    this.loadExtractions();
  }

  async loadExtractions() {
    const extractions = await MemberExtractor.getExtractions();
    const list = document.getElementById('extractionsList');
    if (extractions.length === 0) { list.innerHTML = '<p style="font-size:11px;color:#65676b">Aucune extraction</p>'; return; }
    list.innerHTML = extractions.slice(0, 5).map(e => `<div class="post-item"><div class="post-item-content"><div class="post-item-text">${this.esc(e.groupName)} (${e.memberCount} membres)</div><div class="post-item-meta">${new Date(e.extractedAt).toLocaleDateString()} | ${e.type}</div></div><button class="btn-icon" onclick="app.deleteExtraction('${e.id}')">✕</button></div>`).join('');
  }

  async exportMembers(format) {
    const extractions = await MemberExtractor.getExtractions();
    if (extractions.length === 0) return this.toast('Aucune extraction', 'error');
    const data = await MemberExtractor.exportMembers(extractions[0].id, format);
    if (!data) return;
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `members.${format}`; a.click();
    URL.revokeObjectURL(url);
    this.toast('Export reussi!', 'success');
  }

  async sendFriendToExtracted() {
    const extractions = await MemberExtractor.getExtractions();
    if (extractions.length === 0) return this.toast('Aucune extraction', 'error');
    const urls = await MemberExtractor.exportProfileUrls(extractions[0].id);
    document.getElementById('friendProfileUrls').value = urls.slice(0, 20).join('\n');
    document.querySelectorAll('.tab')[7].click(); // Switch to friend tab
  }

  async deleteExtraction(id) { await MemberExtractor.deleteExtraction(id); this.loadExtractions(); }


  // === AUTO SHARE ===
  bindAutoShare() {
    document.getElementById('startAutoShare').addEventListener('click', () => this.startAutoShare());
    document.getElementById('stopAutoShare').addEventListener('click', () => { AutoShare.stop(); this.toggleBtn('startAutoShare', 'stopAutoShare', false); });
  }

  async startAutoShare() {
    const postUrl = document.getElementById('sharePostUrl').value.trim();
    if (!postUrl) return this.toast('Entrez l\'URL du post', 'error');
    const groupUrls = document.getElementById('shareGroupUrls').value.split('\n').map(l => l.trim()).filter(l => l.includes('facebook.com'));
    if (groupUrls.length === 0) return this.toast('Ajoutez des groupes', 'error');

    this.toggleBtn('startAutoShare', 'stopAutoShare', true);
    document.getElementById('shareProgress').style.display = 'block';

    const res = await AutoShare.shareToMultipleGroups(postUrl, groupUrls, {
      caption: document.getElementById('shareCaption').value,
      useSpintax: document.getElementById('shareSpintax').checked,
      addEmoji: document.getElementById('shareEmoji').checked,
      delayMin: parseInt(document.getElementById('shareDelay').value),
      delayMax: parseInt(document.getElementById('shareDelay').value) * 2
    });

    this.toggleBtn('startAutoShare', 'stopAutoShare', false);
    const shared = res.filter(r => r.success).length;
    this.toast(`${shared}/${res.length} partages reussis!`, 'success');
  }

  // === AUTO FRIEND ===
  bindAutoFriend() {
    document.getElementById('startAutoFriend').addEventListener('click', () => this.startAutoFriend());
    document.getElementById('stopAutoFriend').addEventListener('click', () => { AutoFriend.stop(); this.toggleBtn('startAutoFriend', 'stopAutoFriend', false); });
    document.getElementById('friendSource').addEventListener('change', e => {
      document.getElementById('friendUrlsGroup').style.display = (e.target.value === 'urls' || e.target.value === 'extraction') ? 'block' : 'none';
      document.getElementById('friendGroupUrlGroup').style.display = e.target.value === 'group' ? 'block' : 'none';
    });
    document.getElementById('sendIntroMessage').addEventListener('change', e => {
      document.getElementById('introMessageGroup').style.display = e.target.checked ? 'block' : 'none';
    });
  }

  async startAutoFriend() {
    const source = document.getElementById('friendSource').value;
    const max = parseInt(document.getElementById('maxFriendRequests').value);
    const sendMsg = document.getElementById('sendIntroMessage').checked;
    const msgTemplate = document.getElementById('introMessage').value;

    this.toggleBtn('startAutoFriend', 'stopAutoFriend', true);
    document.getElementById('friendProgress').style.display = 'block';

    let res;
    if (source === 'urls' || source === 'extraction') {
      const urls = document.getElementById('friendProfileUrls').value.split('\n').map(l => l.trim()).filter(l => l.includes('facebook.com'));
      if (urls.length === 0) { this.toggleBtn('startAutoFriend', 'stopAutoFriend', false); return this.toast('Ajoutez des URLs', 'error'); }
      res = await AutoFriend.bulkSendRequests(urls, { maxPerSession: max, sendMessage: sendMsg, messageTemplate: msgTemplate });
    } else if (source === 'group') {
      const groupUrl = document.getElementById('friendGroupUrl').value.trim();
      if (!groupUrl) { this.toggleBtn('startAutoFriend', 'stopAutoFriend', false); return this.toast('Entrez l\'URL du groupe', 'error'); }
      res = await AutoFriend.sendToGroupMembers(groupUrl, { maxRequests: max, sendMessage: sendMsg, messageTemplate: msgTemplate });
    } else if (source === 'suggested') {
      res = await AutoFriend.sendToSuggested({ maxRequests: max });
    }

    this.toggleBtn('startAutoFriend', 'stopAutoFriend', false);
    const sent = Array.isArray(res) ? res.filter(r => r.success).length : (res?.sent || 0);
    this.toast(`${sent} demandes envoyees!`, 'success');
  }

  // === CAMPAIGNS ===
  bindCampaigns() {
    document.getElementById('createCampaign').addEventListener('click', () => this.createCampaign());
  }

  async createCampaign() {
    const name = document.getElementById('campaignName').value.trim();
    const productName = document.getElementById('productName').value.trim();
    if (!name || !productName) return this.toast('Remplissez le nom et produit', 'error');

    const campaign = await PromotionEngine.createCampaign({
      name,
      productName,
      productUrl: document.getElementById('productUrl').value,
      productDescription: document.getElementById('productDescription').value,
      targetGroups: document.getElementById('campaignGroups').value.split('\n').map(l => l.trim()).filter(l => l),
      language: document.getElementById('campaignLang').value,
      options: {
        autoPost: document.getElementById('campAutoPost').checked,
        autoComment: document.getElementById('campAutoComment').checked,
        autoLike: document.getElementById('campAutoLike').checked,
        autoShare: document.getElementById('campAutoShare').checked,
        autoFriend: document.getElementById('campAutoFriend').checked
      }
    });

    this.toast('Campagne creee!', 'success');
    document.getElementById('campaignName').value = '';
    document.getElementById('productName').value = '';
    this.loadCampaigns();
  }

  async loadCampaigns() {
    const campaigns = await PromotionEngine.getCampaigns();
    const list = document.getElementById('campaignsList');
    if (campaigns.length === 0) { list.innerHTML = '<p style="font-size:11px;color:#65676b">Aucune campagne</p>'; return; }
    list.innerHTML = campaigns.map(c => `<div class="post-item"><div class="post-item-content"><div class="post-item-text"><strong>${this.esc(c.name)}</strong> - ${this.esc(c.productName)}</div><div class="post-item-meta">${c.status} | Posts:${c.stats.posts} Likes:${c.stats.likes} Comments:${c.stats.comments}</div></div><div class="post-item-actions"><button onclick="app.runCampaign('${c.id}')" title="Lancer">▶</button><button onclick="app.deleteCampaign('${c.id}')" title="Supprimer">✕</button></div></div>`).join('');
  }

  async runCampaign(id) {
    this.toast('Campagne en cours...', 'success');
    const res = await PromotionEngine.runCampaign(id);
    if (res.success) this.toast(`Campagne terminee! Posts:${res.results.posts} Likes:${res.results.likes}`, 'success');
    else this.toast('Erreur: ' + res.error, 'error');
    this.loadCampaigns();
  }

  async deleteCampaign(id) { await PromotionEngine.deleteCampaign(id); this.loadCampaigns(); }

  // === BULK ===
  bindBulk() {
    document.getElementById('bulkContent').addEventListener('input', e => {
      document.getElementById('bulkCount').textContent = e.target.value.split('\n').filter(l => l.trim()).length;
    });
    document.getElementById('importCSVBtn').addEventListener('click', () => { document.getElementById('fileImport').accept = '.csv'; document.getElementById('fileImport').click(); });
    document.getElementById('importTXTBtn').addEventListener('click', () => { document.getElementById('fileImport').accept = '.txt'; document.getElementById('fileImport').click(); });
    document.getElementById('fileImport').addEventListener('change', e => this.handleFileImport(e));
    document.getElementById('startBulk').addEventListener('click', () => this.startBulk());
    document.getElementById('stopBulk').addEventListener('click', () => { BulkPoster.stop(); this.toggleBtn('startBulk', 'stopBulk', false); });
  }

  handleFileImport(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const posts = file.name.endsWith('.csv') ? BulkPoster.parseCSV(ev.target.result) : BulkPoster.parseTXT(ev.target.result);
      document.getElementById('bulkContent').value = posts.join('\n');
      document.getElementById('bulkCount').textContent = posts.length;
      this.toast(`${posts.length} posts importes`, 'success');
    };
    reader.readAsText(file);
  }

  async startBulk() {
    const posts = document.getElementById('bulkContent').value.split('\n').filter(l => l.trim());
    if (posts.length === 0) return this.toast('Ajoutez des posts', 'error');
    this.toggleBtn('startBulk', 'stopBulk', true);
    document.getElementById('bulkProgress').style.display = 'block';
    await BulkPoster.start(posts, {
      intervalMin: parseInt(document.getElementById('bulkInterval').value),
      intervalMax: parseInt(document.getElementById('bulkInterval').value) * 2,
      useSpintax: document.getElementById('bulkSpintax').checked,
      addEmoji: document.getElementById('bulkEmoji').checked,
      addHashtags: document.getElementById('bulkHashtags').checked
    });
    this.toast('Bulk demarre!', 'success');
  }

  // === ANALYTICS ===
  bindAnalytics() {
    document.getElementById('exportAnalytics').addEventListener('click', async () => {
      const csv = await Analytics.exportData('csv');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'analytics.csv'; a.click();
    });
    document.getElementById('resetAnalytics').addEventListener('click', async () => { await Analytics.resetData(); this.loadAnalytics(); });
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

    // Load likes/comments/shares stats
    const likeStats = await AutoLike.getStats();
    const commentStats = await AutoComment.getStats();
    const shareStats = await AutoShare.getStats();
    document.getElementById('statLikes').textContent = likeStats.total || 0;
    document.getElementById('statComments').textContent = commentStats.total || 0;
    document.getElementById('statShares').textContent = shareStats.total || 0;

    // Chart
    const chartData = await Analytics.getActivityData(14);
    this.drawChart(chartData);

    // Insights
    const insights = await Analytics.getInsights();
    document.getElementById('insightsList').innerHTML = insights.map(i => `<div class="insight-item ${i.type}">${i.text}</div>`).join('');
  }

  drawChart(data) {
    const canvas = document.getElementById('activityChart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!data.length) return;
    const max = Math.max(...data.map(d => d.total), 1);
    const bw = (canvas.width - 10) / data.length;
    data.forEach((d, i) => {
      const h = (d.total / max) * (canvas.height - 20);
      ctx.fillStyle = d.failed > 0 ? '#ff4444' : '#4CAF50';
      ctx.fillRect(5 + i * bw + 1, canvas.height - h - 15, bw - 2, h);
      if (i % 3 === 0) { ctx.fillStyle = '#999'; ctx.font = '8px Arial'; ctx.textAlign = 'center'; ctx.fillText(d.label, 5 + i * bw + bw/2, canvas.height - 3); }
    });
  }

  // === SETTINGS ===
  bindSettings() {
    document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
    document.getElementById('languageSelect').addEventListener('change', e => { I18N.setLang(e.target.value); });
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
      fingerprint: document.getElementById('fingerprint').checked
    };
    await chrome.storage.local.set({ settings });
    this.toast('Parametres sauvegardes!', 'success');
  }

  async loadSettings() {
    const { settings } = await chrome.storage.local.get('settings');
    if (!settings) return;
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
  }

  // === STATUS ===
  async updateStatus() {
    const { isActive } = await chrome.storage.local.get('isActive');
    const dot = document.querySelector('.status-dot');
    const text = document.querySelector('.status-text');
    if (isActive) { dot.classList.add('active'); text.textContent = 'Actif'; }
    else { dot.classList.remove('active'); text.textContent = 'Inactif'; }
  }

  // === LOAD ALL ===
  async loadData() { this.loadSchedule(); this.loadJoinedGroups(); this.loadExtractions(); this.loadCampaigns(); this.loadAnalytics(); }

  // === UTILITIES ===
  toast(msg, type = 'info') {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.className = `toast ${type}`;
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  toggleBtn(showId, hideId, running) {
    document.getElementById(showId).style.display = running ? 'none' : 'flex';
    document.getElementById(hideId).style.display = running ? 'flex' : 'none';
  }

  esc(text) { const d = document.createElement('div'); d.textContent = text || ''; return d.innerHTML; }
}

const app = new FacebookAutoPoster();

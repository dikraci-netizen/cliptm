// Facebook Auto Poster Pro - Analytics Module
const Analytics = {
  
  // === DATA COLLECTION ===
  async recordPost(postData) {
    const { analyticsData = { posts: [], dailyStats: {} } } = await chrome.storage.local.get('analyticsData');
    
    const record = {
      id: Date.now().toString(),
      content: postData.content?.substring(0, 100),
      status: postData.status,
      target: postData.target,
      timestamp: new Date().toISOString(),
      dayOfWeek: new Date().getDay(),
      hour: new Date().getHours(),
      contentLength: postData.content?.length || 0,
      hasEmoji: /[\u{1F600}-\u{1F64F}]/u.test(postData.content || ''),
      hasHashtags: (postData.content || '').includes('#'),
      language: postData.language || 'fr'
    };
    
    analyticsData.posts.unshift(record);
    if (analyticsData.posts.length > 500) analyticsData.posts = analyticsData.posts.slice(0, 500);
    
    // Update daily stats
    const dateKey = new Date().toISOString().split('T')[0];
    if (!analyticsData.dailyStats[dateKey]) {
      analyticsData.dailyStats[dateKey] = { total: 0, success: 0, failed: 0 };
    }
    analyticsData.dailyStats[dateKey].total++;
    if (postData.status === 'success') analyticsData.dailyStats[dateKey].success++;
    else analyticsData.dailyStats[dateKey].failed++;
    
    // Clean old daily stats (keep 90 days)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffKey = cutoff.toISOString().split('T')[0];
    for (const key of Object.keys(analyticsData.dailyStats)) {
      if (key < cutoffKey) delete analyticsData.dailyStats[key];
    }
    
    await chrome.storage.local.set({ analyticsData });
    return record;
  },

  // === STATISTICS ===
  async getStats(period = 'all') {
    const { analyticsData = { posts: [], dailyStats: {} } } = await chrome.storage.local.get('analyticsData');
    const posts = analyticsData.posts;
    
    const now = new Date();
    let filtered;
    
    switch (period) {
      case 'today':
        filtered = posts.filter(p => new Date(p.timestamp).toDateString() === now.toDateString());
        break;
      case 'week':
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        filtered = posts.filter(p => new Date(p.timestamp) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
        filtered = posts.filter(p => new Date(p.timestamp) >= monthAgo);
        break;
      default:
        filtered = posts;
    }
    
    const total = filtered.length;
    const success = filtered.filter(p => p.status === 'success').length;
    const failed = filtered.filter(p => p.status === 'failed').length;
    const successRate = total > 0 ? Math.round((success / total) * 100) : 0;
    
    return { total, success, failed, successRate };
  },

  // === BEST TIME ANALYSIS ===
  async getBestPostingTimes() {
    const { analyticsData = { posts: [] } } = await chrome.storage.local.get('analyticsData');
    const successPosts = analyticsData.posts.filter(p => p.status === 'success');
    
    // Analyze by hour
    const hourStats = {};
    for (let h = 0; h < 24; h++) hourStats[h] = 0;
    
    successPosts.forEach(p => {
      const hour = new Date(p.timestamp).getHours();
      hourStats[hour]++;
    });
    
    // Find top 3 hours
    const sortedHours = Object.entries(hourStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));
    
    // Analyze by day of week
    const dayStats = {};
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    for (let d = 0; d < 7; d++) dayStats[d] = 0;
    
    successPosts.forEach(p => {
      const day = new Date(p.timestamp).getDay();
      dayStats[day]++;
    });
    
    const sortedDays = Object.entries(dayStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day, count]) => ({ day: dayNames[parseInt(day)], count }));
    
    return { bestHours: sortedHours, bestDays: sortedDays };
  },

  // === ACTIVITY CHART DATA ===
  async getActivityData(days = 30) {
    const { analyticsData = { dailyStats: {} } } = await chrome.storage.local.get('analyticsData');
    
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      const stats = analyticsData.dailyStats[key] || { total: 0, success: 0, failed: 0 };
      
      data.push({
        date: key,
        label: `${date.getDate()}/${date.getMonth() + 1}`,
        ...stats
      });
    }
    
    return data;
  },

  // === PERFORMANCE INSIGHTS ===
  async getInsights() {
    const { analyticsData = { posts: [] } } = await chrome.storage.local.get('analyticsData');
    const posts = analyticsData.posts;
    const insights = [];
    
    if (posts.length < 5) return [{ type: 'info', text: 'Publiez plus de posts pour obtenir des statistiques' }];
    
    const successPosts = posts.filter(p => p.status === 'success');
    const failedPosts = posts.filter(p => p.status === 'failed');
    
    // Success rate insight
    const rate = posts.length > 0 ? (successPosts.length / posts.length) * 100 : 0;
    if (rate >= 90) insights.push({ type: 'success', text: `Excellent! Taux de reussite de ${Math.round(rate)}%` });
    else if (rate >= 70) insights.push({ type: 'warning', text: `Taux de reussite: ${Math.round(rate)}%. Amelioration possible.` });
    else insights.push({ type: 'error', text: `Taux de reussite faible: ${Math.round(rate)}%. Verifiez vos parametres.` });
    
    // Content length insight
    const avgLength = successPosts.reduce((sum, p) => sum + (p.contentLength || 0), 0) / (successPosts.length || 1);
    if (avgLength > 200) insights.push({ type: 'info', text: `Longueur moyenne optimale: ${Math.round(avgLength)} caracteres` });
    
    // Emoji insight
    const emojiPosts = successPosts.filter(p => p.hasEmoji).length;
    const emojiRate = successPosts.length > 0 ? (emojiPosts / successPosts.length) * 100 : 0;
    if (emojiRate > 50) insights.push({ type: 'info', text: `${Math.round(emojiRate)}% de vos posts reussis contiennent des emojis` });
    
    return insights;
  },

  // === EXPORT DATA ===
  async exportData(format = 'json') {
    const { analyticsData = { posts: [], dailyStats: {} } } = await chrome.storage.local.get('analyticsData');
    
    if (format === 'csv') {
      let csv = 'Date,Heure,Statut,Cible,Longueur,Emojis,Hashtags\n';
      analyticsData.posts.forEach(p => {
        const date = new Date(p.timestamp);
        csv += `${date.toLocaleDateString()},${date.toLocaleTimeString()},${p.status},${p.target || ''},${p.contentLength},${p.hasEmoji},${p.hasHashtags}\n`;
      });
      return csv;
    }
    
    return JSON.stringify(analyticsData, null, 2);
  },

  // === RESET DATA ===
  async resetData() {
    await chrome.storage.local.set({ analyticsData: { posts: [], dailyStats: {} } });
  }
};

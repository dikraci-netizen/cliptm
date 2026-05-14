// Facebook Auto Poster Pro - Product Promotion Campaign Engine
const PromotionEngine = {

  // === CREATE CAMPAIGN ===
  async createCampaign(campaign) {
    const { campaigns = [] } = await chrome.storage.local.get('campaigns');

    const newCampaign = {
      id: Date.now().toString(),
      name: campaign.name,
      productName: campaign.productName,
      productUrl: campaign.productUrl || '',
      productDescription: campaign.productDescription || '',
      targetGroups: campaign.targetGroups || [],
      postTemplates: campaign.postTemplates || [],
      commentTemplates: campaign.commentTemplates || [],
      language: campaign.language || 'fr',
      status: 'draft', // draft, running, paused, completed
      schedule: campaign.schedule || { type: 'manual' },
      options: {
        autoPost: campaign.options?.autoPost || false,
        autoComment: campaign.options?.autoComment || false,
        autoLike: campaign.options?.autoLike || false,
        autoShare: campaign.options?.autoShare || false,
        autoFriend: campaign.options?.autoFriend || false,
        postsPerDay: campaign.options?.postsPerDay || 5,
        commentsPerDay: campaign.options?.commentsPerDay || 10,
        likesPerDay: campaign.options?.likesPerDay || 20,
        sharesPerDay: campaign.options?.sharesPerDay || 5,
        friendRequestsPerDay: campaign.options?.friendRequestsPerDay || 10
      },
      stats: { posts: 0, comments: 0, likes: 0, shares: 0, friendRequests: 0 },
      createdAt: new Date().toISOString(),
      lastRunAt: null
    };

    campaigns.push(newCampaign);
    await chrome.storage.local.set({ campaigns });
    return newCampaign;
  },

  // === GET CAMPAIGNS ===
  async getCampaigns() {
    const { campaigns = [] } = await chrome.storage.local.get('campaigns');
    return campaigns;
  },

  async getCampaign(id) {
    const { campaigns = [] } = await chrome.storage.local.get('campaigns');
    return campaigns.find(c => c.id === id);
  },

  // === UPDATE CAMPAIGN ===
  async updateCampaign(id, updates) {
    const { campaigns = [] } = await chrome.storage.local.get('campaigns');
    const updated = campaigns.map(c => c.id === id ? { ...c, ...updates } : c);
    await chrome.storage.local.set({ campaigns: updated });
    return updated.find(c => c.id === id);
  },

  // === DELETE CAMPAIGN ===
  async deleteCampaign(id) {
    const { campaigns = [] } = await chrome.storage.local.get('campaigns');
    await chrome.storage.local.set({ campaigns: campaigns.filter(c => c.id !== id) });
  },

  // === RUN CAMPAIGN ===
  async runCampaign(id) {
    const campaign = await this.getCampaign(id);
    if (!campaign) return { success: false, error: 'Campaign not found' };

    await this.updateCampaign(id, { status: 'running', lastRunAt: new Date().toISOString() });

    const results = { posts: 0, comments: 0, likes: 0, shares: 0, friendRequests: 0 };

    try {
      // 1. Auto Post to groups
      if (campaign.options.autoPost && campaign.targetGroups.length > 0) {
        const postContent = this.getRandomTemplate(campaign.postTemplates, campaign);
        for (const group of campaign.targetGroups.slice(0, campaign.options.postsPerDay)) {
          const res = await chrome.runtime.sendMessage({
            action: 'publishPost',
            data: { content: postContent, target: 'group', targetUrl: group }
          });
          if (res?.success) results.posts++;
          await this.randomWait(60, 180);
        }
      }

      // 2. Auto Comment
      if (campaign.options.autoComment && campaign.targetGroups.length > 0) {
        for (const group of campaign.targetGroups.slice(0, 3)) {
          if (typeof AutoComment !== 'undefined') {
            await AutoComment.commentOnPosts({
              targetUrl: group,
              maxComments: Math.ceil(campaign.options.commentsPerDay / campaign.targetGroups.length),
              promoMode: true,
              promoLink: campaign.productUrl,
              templates: campaign.commentTemplates.length > 0 ? campaign.commentTemplates : undefined,
              language: campaign.language
            });
            results.comments += Math.ceil(campaign.options.commentsPerDay / campaign.targetGroups.length);
          }
          await this.randomWait(30, 90);
        }
      }

      // 3. Auto Like
      if (campaign.options.autoLike) {
        for (const group of campaign.targetGroups.slice(0, 3)) {
          if (typeof AutoLike !== 'undefined') {
            await AutoLike.likeGroupPosts(group, {
              maxLikes: Math.ceil(campaign.options.likesPerDay / campaign.targetGroups.length)
            });
            results.likes += Math.ceil(campaign.options.likesPerDay / campaign.targetGroups.length);
          }
          await this.randomWait(20, 60);
        }
      }

      // 4. Auto Share
      if (campaign.options.autoShare && campaign.productUrl) {
        if (typeof AutoShare !== 'undefined') {
          const shareRes = await AutoShare.shareToMultipleGroups(
            campaign.productUrl,
            campaign.targetGroups.slice(0, campaign.options.sharesPerDay),
            { caption: campaign.productDescription }
          );
          results.shares = shareRes.filter(r => r.success).length;
        }
      }

      // 5. Auto Friend Requests
      if (campaign.options.autoFriend && campaign.targetGroups.length > 0) {
        if (typeof AutoFriend !== 'undefined') {
          const groupUrl = campaign.targetGroups[Math.floor(Math.random() * campaign.targetGroups.length)];
          await AutoFriend.sendToGroupMembers(groupUrl, {
            maxRequests: campaign.options.friendRequestsPerDay,
            sendMessage: true,
            messageTemplate: this.getPromoMessage(campaign)
          });
          results.friendRequests = campaign.options.friendRequestsPerDay;
        }
      }

      // Update stats
      const current = await this.getCampaign(id);
      if (current) {
        const newStats = {
          posts: (current.stats.posts || 0) + results.posts,
          comments: (current.stats.comments || 0) + results.comments,
          likes: (current.stats.likes || 0) + results.likes,
          shares: (current.stats.shares || 0) + results.shares,
          friendRequests: (current.stats.friendRequests || 0) + results.friendRequests
        };
        await this.updateCampaign(id, { stats: newStats, status: 'paused' });
      }

    } catch (error) {
      await this.updateCampaign(id, { status: 'paused' });
      return { success: false, error: error.message, results };
    }

    return { success: true, results };
  },

  // === SCHEDULE CAMPAIGN ===
  async scheduleCampaign(id, schedule) {
    await this.updateCampaign(id, { schedule, status: 'running' });

    if (schedule.type === 'daily') {
      const [hours, minutes] = schedule.time.split(':');
      const now = new Date();
      let nextRun = new Date(now);
      nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      if (nextRun <= now) nextRun.setDate(nextRun.getDate() + 1);

      chrome.alarms.create(`campaign_${id}`, {
        when: nextRun.getTime(),
        periodInMinutes: 24 * 60
      });
    }
  },

  // === GET RANDOM TEMPLATE ===
  getRandomTemplate(templates, campaign) {
    if (templates.length === 0) {
      return this.generateDefaultPost(campaign);
    }
    let template = templates[Math.floor(Math.random() * templates.length)];
    if (typeof Spintax !== 'undefined') {
      template = Spintax.process(template);
    }
    template = template.replace(/{PRODUCT}/g, campaign.productName || '');
    template = template.replace(/{LINK}/g, campaign.productUrl || '');
    template = template.replace(/{DESC}/g, campaign.productDescription || '');
    return template;
  },

  // === GENERATE DEFAULT PROMO POST ===
  generateDefaultPost(campaign) {
    const lang = campaign.language || 'fr';
    const templates = {
      fr: [
        `🔥 Decouvrez ${campaign.productName}!\n\n${campaign.productDescription}\n\n👉 ${campaign.productUrl}\n\n#${campaign.productName.replace(/\s+/g, '')} #promo`,
        `⭐ ${campaign.productName} - La solution que vous cherchez!\n\n${campaign.productDescription}\n\n🛒 Commandez maintenant: ${campaign.productUrl}`,
        `💯 Nouveau! ${campaign.productName}\n\n${campaign.productDescription}\n\n🔗 Plus d'infos: ${campaign.productUrl}`
      ],
      ar: [
        `🔥 اكتشفوا ${campaign.productName}!\n\n${campaign.productDescription}\n\n👉 ${campaign.productUrl}\n\n#${campaign.productName.replace(/\s+/g, '_')} #عرض`,
        `⭐ ${campaign.productName} - الحل الذي تبحثون عنه!\n\n${campaign.productDescription}\n\n🛒 اطلبوا الآن: ${campaign.productUrl}`,
        `💯 جديد! ${campaign.productName}\n\n${campaign.productDescription}\n\n🔗 مزيد من المعلومات: ${campaign.productUrl}`
      ],
      en: [
        `🔥 Discover ${campaign.productName}!\n\n${campaign.productDescription}\n\n👉 ${campaign.productUrl}\n\n#${campaign.productName.replace(/\s+/g, '')} #promo`,
        `⭐ ${campaign.productName} - The solution you need!\n\n${campaign.productDescription}\n\n🛒 Order now: ${campaign.productUrl}`,
        `💯 New! ${campaign.productName}\n\n${campaign.productDescription}\n\n🔗 More info: ${campaign.productUrl}`
      ]
    };
    const langTemplates = templates[lang] || templates.fr;
    return langTemplates[Math.floor(Math.random() * langTemplates.length)];
  },

  // === PROMO MESSAGE FOR FRIEND REQUESTS ===
  getPromoMessage(campaign) {
    const lang = campaign.language || 'fr';
    const msgs = {
      fr: `{Salut|Bonjour}! Je vous contacte pour vous parler de ${campaign.productName}. ${campaign.productDescription.substring(0, 50)}... {Plus d'infos|Details}: ${campaign.productUrl}`,
      ar: `{مرحباً|السلام عليكم}! أتواصل معكم لأحدثكم عن ${campaign.productName}. ${campaign.productDescription.substring(0, 50)}... {مزيد من المعلومات|التفاصيل}: ${campaign.productUrl}`,
      en: `{Hi|Hello}! I'm reaching out about ${campaign.productName}. ${campaign.productDescription.substring(0, 50)}... {More info|Details}: ${campaign.productUrl}`
    };
    return msgs[lang] || msgs.fr;
  },

  // === UTILITY ===
  randomWait(minSec, maxSec) {
    const ms = (Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec) * 1000;
    return new Promise(r => setTimeout(r, ms));
  }
};

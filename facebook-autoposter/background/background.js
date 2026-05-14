// Facebook Auto Poster Pro - Background Service Worker

// === ALARM HANDLER ===
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith('post_')) {
    const postId = alarm.name.replace('post_', '');
    await executeScheduledPost(postId);
  }
});

// === MESSAGE HANDLER ===
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'publishPost') {
    publishPost(message.data).then(sendResponse);
    return true; // Keep channel open for async response
  }
  
  if (message.action === 'getStatus') {
    getStatus().then(sendResponse);
    return true;
  }

  if (message.action === 'postResult') {
    handlePostResult(message.data).then(sendResponse);
    return true;
  }
});

// === PUBLISH POST ===
async function publishPost(data) {
  try {
    // Mark as active
    await chrome.storage.local.set({ isActive: true });

    // Get settings for delay
    const { settings = {} } = await chrome.storage.local.get('settings');
    const delay = getRandomDelay(settings.delayMin || 5, settings.delayMax || 15);

    // Find or open Facebook tab
    const tab = await getFacebookTab(data.targetUrl);
    
    if (!tab) {
      await chrome.storage.local.set({ isActive: false });
      return { success: false, error: 'Impossible d\'ouvrir Facebook. Connectez-vous d\'abord.' };
    }

    // Wait a moment for natural behavior
    await wait(2000);

    // Send content to content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'createPost',
      data: {
        content: data.content,
        target: data.target,
        targetUrl: data.targetUrl
      }
    });

    await chrome.storage.local.set({ isActive: false });

    if (response && response.success) {
      // Show notification
      const { settings: s = {} } = await chrome.storage.local.get('settings');
      if (s.notifySuccess !== false) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: '../icons/icon128.png',
          title: 'Facebook Auto Poster Pro',
          message: 'Post publie avec succes !'
        });
      }
      return { success: true };
    } else {
      const { settings: s = {} } = await chrome.storage.local.get('settings');
      if (s.notifyError !== false) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: '../icons/icon128.png',
          title: 'Facebook Auto Poster Pro',
          message: 'Erreur lors de la publication'
        });
      }
      return { success: false, error: response?.error || 'Publication echouee' };
    }
  } catch (error) {
    await chrome.storage.local.set({ isActive: false });
    return { success: false, error: error.message };
  }
}

// === SCHEDULED POST EXECUTION ===
async function executeScheduledPost(postId) {
  const { scheduledPosts = [] } = await chrome.storage.local.get('scheduledPosts');
  const post = scheduledPosts.find(p => p.id === postId);

  if (!post) return;

  // Attempt to publish
  const result = await publishPost({
    content: post.content,
    target: post.target,
    targetUrl: post.targetUrl
  });

  // Update post status
  const { scheduledPosts: current = [] } = await chrome.storage.local.get('scheduledPosts');
  const updated = current.map(p => {
    if (p.id === postId) {
      return { ...p, status: result.success ? 'completed' : 'failed' };
    }
    return p;
  });
  await chrome.storage.local.set({ scheduledPosts: updated });

  // Add to history
  const { postHistory = [] } = await chrome.storage.local.get('postHistory');
  postHistory.unshift({
    id: Date.now().toString(),
    content: post.rawContent || post.content,
    status: result.success ? 'success' : 'failed',
    timestamp: new Date().toISOString()
  });
  if (postHistory.length > 50) postHistory.pop();
  await chrome.storage.local.set({ postHistory });

  // Handle repeat
  if (result.success && post.repeat !== 'none') {
    await scheduleNextRepeat(post);
  }

  // Auto-retry on failure
  if (!result.success) {
    const { settings = {} } = await chrome.storage.local.get('settings');
    if (settings.autoRetry) {
      const retryCount = (post.retryCount || 0) + 1;
      if (retryCount < (settings.maxRetries || 3)) {
        const retryDelay = retryCount * 2 * 60 * 1000; // Exponential backoff
        chrome.alarms.create(`post_${postId}`, { when: Date.now() + retryDelay });
        
        const { scheduledPosts: sc = [] } = await chrome.storage.local.get('scheduledPosts');
        const retryUpdated = sc.map(p => {
          if (p.id === postId) {
            return { ...p, status: 'pending', retryCount };
          }
          return p;
        });
        await chrome.storage.local.set({ scheduledPosts: retryUpdated });
      }
    }
  }
}

// === REPEAT SCHEDULING ===
async function scheduleNextRepeat(post) {
  const nextDate = getNextRepeatDate(post.date, post.time, post.repeat);
  
  const newPost = {
    ...post,
    id: Date.now().toString(),
    date: nextDate.date,
    time: nextDate.time,
    status: 'pending',
    retryCount: 0
  };

  const { scheduledPosts = [] } = await chrome.storage.local.get('scheduledPosts');
  scheduledPosts.push(newPost);
  await chrome.storage.local.set({ scheduledPosts });

  const alarmTime = new Date(`${newPost.date}T${newPost.time}`).getTime();
  chrome.alarms.create(`post_${newPost.id}`, { when: alarmTime });
}

function getNextRepeatDate(dateStr, timeStr, repeat) {
  const date = new Date(`${dateStr}T${timeStr}`);
  
  switch (repeat) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
  }

  return {
    date: date.toISOString().split('T')[0],
    time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  };
}

// === TAB MANAGEMENT ===
async function getFacebookTab(targetUrl) {
  const url = targetUrl || 'https://www.facebook.com/';
  
  // Try to find existing Facebook tab
  const tabs = await chrome.tabs.query({ url: 'https://www.facebook.com/*' });
  
  if (tabs.length > 0) {
    // Navigate to target if needed
    if (targetUrl && tabs[0].url !== targetUrl) {
      await chrome.tabs.update(tabs[0].id, { url: targetUrl, active: true });
      await waitForTabLoad(tabs[0].id);
    }
    return tabs[0];
  }

  // Open new tab
  const newTab = await chrome.tabs.create({ url, active: false });
  await waitForTabLoad(newTab.id);
  return newTab;
}

function waitForTabLoad(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.onUpdated.addListener(function listener(id, changeInfo) {
      if (id === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        setTimeout(resolve, 2000); // Extra wait for dynamic content
      }
    });
  });
}

// === STATUS ===
async function getStatus() {
  const { isActive, scheduledPosts = [], postHistory = [] } = 
    await chrome.storage.local.get(['isActive', 'scheduledPosts', 'postHistory']);
  
  return {
    isActive: isActive || false,
    pendingPosts: scheduledPosts.filter(p => p.status === 'pending').length,
    totalPublished: postHistory.filter(p => p.status === 'success').length
  };
}

// === POST RESULT HANDLER ===
async function handlePostResult(data) {
  const { postHistory = [] } = await chrome.storage.local.get('postHistory');
  postHistory.unshift({
    id: Date.now().toString(),
    content: data.content,
    status: data.success ? 'success' : 'failed',
    timestamp: new Date().toISOString()
  });
  if (postHistory.length > 50) postHistory.pop();
  await chrome.storage.local.set({ postHistory });
  return { success: true };
}

// === UTILITIES ===
function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// === INSTALLATION ===
chrome.runtime.onInstalled.addListener(() => {
  // Set default settings
  chrome.storage.local.get('settings', (data) => {
    if (!data.settings) {
      chrome.storage.local.set({
        settings: {
          delayMin: 5,
          delayMax: 15,
          randomDelay: true,
          notifySuccess: true,
          notifyError: true,
          autoRetry: false,
          maxRetries: 3
        }
      });
    }
  });
});

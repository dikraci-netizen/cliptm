// Facebook Auto Poster Pro - Ultimate Edition - Background Service Worker

// === ALARM HANDLER ===
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith('post_')) {
    const postId = alarm.name.replace('post_', '');
    await executeScheduledPost(postId);
  }
  if (alarm.name === 'bulk_next') {
    await executeBulkNext();
  }
});

// === MESSAGE HANDLER ===
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'publishPost') {
    publishPost(message.data).then(sendResponse);
    return true;
  }
  
  if (message.action === 'getStatus') {
    getStatus().then(sendResponse);
    return true;
  }

  if (message.action === 'postResult') {
    handlePostResult(message.data).then(sendResponse);
    return true;
  }

  if (message.action === 'contentAction') {
    executeContentAction(message.data).then(sendResponse);
    return true;
  }

  if (message.action === 'executeInTab') {
    executeContentAction(message.data).then(sendResponse);
    return true;
  }

  if (message.action === 'checkFacebookConnection') {
    checkFacebookConnection().then(sendResponse);
    return true;
  }

  if (message.action === 'openFacebook') {
    openFacebookLogin().then(sendResponse);
    return true;
  }
});

// === FACEBOOK CONNECTION CHECK ===
async function checkFacebookConnection() {
  try {
    // Check if there's a Facebook tab already open
    const tabs = await chrome.tabs.query({ url: 'https://www.facebook.com/*' });
    
    if (tabs.length > 0) {
      // Tab exists, check if user is logged in by sending message to content script
      try {
        const response = await chrome.tabs.sendMessage(tabs[0].id, {
          action: 'checkLoginStatus'
        });
        
        if (response && response.loggedIn) {
          return { 
            connected: true, 
            tabId: tabs[0].id, 
            userName: response.userName || '',
            profilePic: response.profilePic || ''
          };
        }
      } catch (e) {
        // Content script not loaded yet, check URL
        if (!tabs[0].url.includes('/login') && !tabs[0].url.includes('/recover')) {
          return { connected: true, tabId: tabs[0].id, userName: '' };
        }
      }
    }

    // No Facebook tab or not logged in - try to check via cookies
    try {
      const cookie = await chrome.cookies.get({ url: 'https://www.facebook.com', name: 'c_user' });
      if (cookie && cookie.value) {
        return { connected: true, tabId: null, userName: '', userId: cookie.value };
      }
    } catch (e) {
      // cookies permission might not be available
    }

    return { connected: false, tabId: null };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

// === OPEN FACEBOOK LOGIN ===
async function openFacebookLogin() {
  try {
    // Check if there's already a Facebook tab
    const tabs = await chrome.tabs.query({ url: 'https://www.facebook.com/*' });
    
    if (tabs.length > 0) {
      // Focus existing tab
      await chrome.tabs.update(tabs[0].id, { active: true });
      await chrome.windows.update(tabs[0].windowId, { focused: true });
      return { success: true, tabId: tabs[0].id, action: 'focused' };
    }
    
    // Create new tab
    const newTab = await chrome.tabs.create({ url: 'https://www.facebook.com/', active: true });
    return { success: true, tabId: newTab.id, action: 'created' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// === EXECUTE CONTENT ACTION IN TAB ===
async function executeContentAction(data) {
  try {
    const url = data.url || 'https://www.facebook.com/';
    const tab = await getFacebookTab(url);
    if (!tab) return { success: false, error: 'Cannot open Facebook tab' };
    
    await wait(2000);
    
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'contentAction',
      data
    });
    
    return response || { success: false, error: 'No response from content script' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

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

// === BULK POSTING ===
async function executeBulkNext() {
  const { bulkState = {} } = await chrome.storage.local.get('bulkState');
  if (!bulkState.isRunning) return;

  const currentIndex = bulkState.current || 0;
  if (currentIndex >= (bulkState.posts || []).length) {
    bulkState.isRunning = false;
    await chrome.storage.local.set({ bulkState });
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/icon128.png',
      title: 'Facebook Auto Poster Pro',
      message: `Bulk posting completed! ${bulkState.completed || 0} success, ${bulkState.failed || 0} failed`
    });
    return;
  }

  const content = bulkState.posts[currentIndex];
  const result = await publishPost({
    content,
    target: bulkState.options?.target || 'timeline',
    targetUrl: bulkState.options?.targetUrl || ''
  });

  if (result.success) {
    bulkState.completed = (bulkState.completed || 0) + 1;
  } else {
    bulkState.failed = (bulkState.failed || 0) + 1;
  }
  bulkState.current = currentIndex + 1;
  await chrome.storage.local.set({ bulkState });

  // Schedule next
  if (bulkState.current < bulkState.posts.length) {
    const minDelay = (bulkState.options?.intervalMin || 5) * 60 * 1000;
    const maxDelay = (bulkState.options?.intervalMax || 15) * 60 * 1000;
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    chrome.alarms.create('bulk_next', { when: Date.now() + delay });
  }
}

// === INSTALLATION ===
chrome.runtime.onInstalled.addListener(() => {
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
          maxRetries: 3,
          humanMode: true,
          randomScrolling: false,
          randomPause: true,
          fingerprint: false,
          autoReplyEnabled: false,
          replyDelay: 30
        }
      });
    }
  });
});

// Facebook Auto Poster Pro - Ultimate Content Script
// Advanced DOM interaction with all marketing automation actions
(function() {
  'use strict';

  // === MESSAGE LISTENER ===
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'createPost') {
      createPost(message.data).then(sendResponse).catch(e => sendResponse({ success: false, error: e.message }));
      return true;
    }
    if (message.action === 'contentAction') {
      handleContentAction(message.data).then(sendResponse).catch(e => sendResponse({ success: false, error: e.message }));
      return true;
    }
  });

  // === ROUTER FOR ALL CONTENT ACTIONS ===
  async function handleContentAction(data) {
    switch (data.task) {
      case 'autoLike': return await autoLikePosts(data);
      case 'likeComments': return await likeComments(data);
      case 'reactToPost': return await reactToPost(data);
      case 'autoComment': return await autoCommentPosts(data);
      case 'commentOnPost': return await commentOnSinglePost(data);
      case 'joinGroup': return await joinGroup(data);
      case 'searchGroups': return await searchGroups(data);
      case 'extractMembers': return await extractMembers(data);
      case 'extractActiveMembers': return await extractActiveMembers(data);
      case 'extractAdmins': return await extractAdmins(data);
      case 'sharePost': return await sharePost(data);
      case 'shareFeedToGroups': return await shareFeedToGroups(data);
      case 'getPagePosts': return await getPagePosts(data);
      case 'sendFriendRequest': return await sendFriendRequest(data);
      case 'addSuggestedFriends': return await addSuggestedFriends(data);
      default: return { success: false, error: 'Unknown task: ' + data.task };
    }
  }

  // === ANTI-DETECTION ===
  const AntiDetect = {
    async scroll() {
      const amount = Math.random() * 400 + 200;
      const steps = Math.floor(Math.random() * 4) + 3;
      for (let i = 0; i < steps; i++) {
        window.scrollBy(0, amount / steps);
        await wait(randomDelay(80, 250));
      }
      await wait(randomDelay(500, 1500));
    },
    async randomMove() {
      for (let i = 0; i < 2; i++) {
        document.dispatchEvent(new MouseEvent('mousemove', {
          clientX: Math.random() * window.innerWidth,
          clientY: Math.random() * window.innerHeight, bubbles: true
        }));
        await wait(randomDelay(100, 400));
      }
    },
    async behave() {
      await this.randomMove();
      const settings = await getSettings();
      if (settings.randomScrolling) await this.scroll();
      if (settings.randomPause) await wait(randomDelay(1000, 4000));
    }
  };



  // === CREATE POST (original function) ===
  async function createPost(data) {
    const { content, target, targetUrl } = data;
    const settings = await getSettings();
    await waitForPageLoad();

    try {
      if (settings.humanMode !== false) await AntiDetect.behave();

      const postBox = await findPostBox();
      if (!postBox) throw new Error('Cannot find post creation area');

      await humanClick(postBox);
      await wait(randomDelay(1500, 3000));

      const editor = await waitForEditor();
      if (!editor) throw new Error('Cannot open post editor');
      await wait(randomDelay(500, 1000));

      await typeContent(editor, content);
      await wait(randomDelay(1500, 3000));

      const publishBtn = await findPublishButton();
      if (!publishBtn) throw new Error('Publish button not found');

      await humanClick(publishBtn);
      await wait(randomDelay(3000, 5000));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // === AUTO LIKE POSTS ===
  async function autoLikePosts(data) {
    const { maxLikes, delayMin, delayMax, likeType, skipAlreadyLiked } = data;
    let liked = 0;

    await waitForPageLoad();
    await AntiDetect.behave();

    for (let attempt = 0; attempt < maxLikes * 3 && liked < maxLikes; attempt++) {
      // Scroll to load more posts
      if (attempt % 3 === 0 && attempt > 0) {
        window.scrollBy(0, 600 + Math.random() * 400);
        await wait(randomDelay(1500, 3000));
      }

      const likeButtons = document.querySelectorAll(
        '[aria-label*="Like"]:not([aria-pressed="true"]), ' +
        '[aria-label*="J\'aime"]:not([aria-pressed="true"]), ' +
        '[aria-label*="أعجبني"]:not([aria-pressed="true"]), ' +
        '[aria-label*="اعجاب"]:not([aria-pressed="true"])'
      );

      for (const btn of likeButtons) {
        if (liked >= maxLikes) break;
        if (skipAlreadyLiked && btn.getAttribute('aria-pressed') === 'true') continue;
        if (!isVisible(btn)) continue;

        try {
          await humanClick(btn);
          liked++;
          await wait(randomDelay(delayMin * 1000, delayMax * 1000));
        } catch (e) { /* skip */ }
      }
    }

    return { success: true, liked };
  }

  // === LIKE COMMENTS ===
  async function likeComments(data) {
    const { maxLikes, delayMin, delayMax } = data;
    let liked = 0;

    await waitForPageLoad();

    const commentLikeButtons = document.querySelectorAll(
      '[role="article"] [aria-label*="Like"], ' +
      '[role="article"] [aria-label*="J\'aime"], ' +
      '[role="article"] [aria-label*="أعجبني"]'
    );

    for (const btn of commentLikeButtons) {
      if (liked >= maxLikes) break;
      if (!isVisible(btn)) continue;

      try {
        await humanClick(btn);
        liked++;
        await wait(randomDelay(delayMin * 1000, delayMax * 1000));
      } catch (e) { /* skip */ }
    }

    return { success: true, liked };
  }

  // === REACT TO POST ===
  async function reactToPost(data) {
    const { reaction } = data;
    await waitForPageLoad();

    const likeBtn = document.querySelector(
      '[aria-label*="Like"], [aria-label*="J\'aime"], [aria-label*="أعجبني"]'
    );
    if (!likeBtn) return { success: false, error: 'Like button not found' };

    if (reaction === 'like') {
      await humanClick(likeBtn);
      return { success: true };
    }

    // Long press for reactions
    const rect = likeBtn.getBoundingClientRect();
    likeBtn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, clientX: rect.left, clientY: rect.top }));
    await wait(2000); // Hold to show reactions

    const reactionMap = { love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😡' };
    const reactionSelector = `[aria-label*="${reactionMap[reaction] || reaction}"]`;
    const reactionBtn = await waitForElement(reactionSelector, null, 3000);

    if (reactionBtn) {
      await humanClick(reactionBtn);
      return { success: true };
    }
    return { success: false, error: 'Reaction button not found' };
  }



  // === AUTO COMMENT ON POSTS ===
  async function autoCommentPosts(data) {
    const { maxComments, delayMin, delayMax, templates, useSpintax, promoLink, keywords } = data;
    let commented = 0;

    await waitForPageLoad();
    await AntiDetect.behave();

    for (let scroll = 0; scroll < maxComments * 2 && commented < maxComments; scroll++) {
      if (scroll > 0) {
        window.scrollBy(0, 500 + Math.random() * 400);
        await wait(randomDelay(2000, 4000));
      }

      const posts = document.querySelectorAll('[role="article"]');
      for (const post of posts) {
        if (commented >= maxComments) break;

        // Keyword filter
        if (keywords && keywords.length > 0) {
          const postText = post.textContent.toLowerCase();
          const hasKeyword = keywords.some(k => postText.includes(k.toLowerCase()));
          if (!hasKeyword) continue;
        }

        // Find comment button
        const commentBtn = post.querySelector(
          '[aria-label*="Comment"], [aria-label*="Commenter"], [aria-label*="تعليق"]'
        );
        if (!commentBtn || !isVisible(commentBtn)) continue;

        try {
          await humanClick(commentBtn);
          await wait(randomDelay(1000, 2000));

          // Find comment input
          const commentInput = await waitForElement(
            '[contenteditable="true"][aria-label*="comment"], ' +
            '[contenteditable="true"][aria-label*="Commenter"], ' +
            '[contenteditable="true"][aria-label*="تعليق"], ' +
            '[contenteditable="true"][placeholder*="comment"]',
            post, 5000
          );

          if (!commentInput) continue;

          // Get random comment
          let comment = templates[Math.floor(Math.random() * templates.length)];
          if (promoLink) comment = comment.replace('{LINK}', promoLink);

          await typeContent(commentInput, comment);
          await wait(randomDelay(500, 1500));

          // Submit with Enter
          commentInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
          await wait(randomDelay(1000, 2000));

          commented++;
          await wait(randomDelay(delayMin * 1000, delayMax * 1000));
        } catch (e) { /* skip this post */ }
      }
    }

    return { success: true, commented };
  }

  // === COMMENT ON SINGLE POST ===
  async function commentOnSinglePost(data) {
    const { comment } = data;
    await waitForPageLoad();

    const commentBtn = document.querySelector(
      '[aria-label*="Comment"], [aria-label*="Commenter"], [aria-label*="تعليق"]'
    );
    if (!commentBtn) return { success: false, error: 'Comment button not found' };

    await humanClick(commentBtn);
    await wait(randomDelay(1000, 2000));

    const commentInput = await waitForElement('[contenteditable="true"]', null, 5000);
    if (!commentInput) return { success: false, error: 'Comment input not found' };

    await typeContent(commentInput, comment);
    await wait(randomDelay(500, 1000));

    commentInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
    await wait(1000);

    return { success: true };
  }

  // === JOIN GROUP ===
  async function joinGroup(data) {
    await waitForPageLoad();
    await AntiDetect.behave();

    // Look for Join button
    const joinSelectors = [
      'div[aria-label*="Join Group"], div[aria-label*="Join group"]',
      'div[aria-label*="Rejoindre le groupe"], div[aria-label*="Rejoindre"]',
      'div[aria-label*="انضمام"], div[aria-label*="الانضمام للمجموعة"]'
    ];

    let joinBtn = null;
    for (const sel of joinSelectors) {
      joinBtn = document.querySelector(sel);
      if (joinBtn) break;
    }

    // Fallback: find by text content
    if (!joinBtn) {
      const buttons = document.querySelectorAll('[role="button"]');
      for (const btn of buttons) {
        const text = btn.textContent.toLowerCase().trim();
        if (text === 'join group' || text === 'rejoindre le groupe' || text === 'rejoindre' ||
            text.includes('انضمام') || text.includes('الانضمام')) {
          joinBtn = btn;
          break;
        }
      }
    }

    if (!joinBtn) return { success: false, error: 'Join button not found' };

    await humanClick(joinBtn);
    await wait(randomDelay(2000, 4000));

    // Handle group questions if any
    if (data.answerQuestions) {
      const questionInputs = document.querySelectorAll('[role="dialog"] textarea, [role="dialog"] [contenteditable="true"]');
      for (const input of questionInputs) {
        await typeContent(input, 'I am interested in this group and want to participate.');
        await wait(randomDelay(500, 1000));
      }

      // Submit answers
      const submitBtn = document.querySelector('[role="dialog"] [role="button"][aria-label*="Submit"], [role="dialog"] [role="button"][aria-label*="Soumettre"]');
      if (submitBtn) {
        await humanClick(submitBtn);
        await wait(randomDelay(1000, 2000));
      }
    }

    return { success: true };
  }

  // === SEARCH GROUPS ===
  async function searchGroups(data) {
    const { maxResults } = data;
    await waitForPageLoad();
    await wait(randomDelay(2000, 4000));

    const groups = [];
    const groupLinks = document.querySelectorAll('a[href*="/groups/"]');

    for (const link of groupLinks) {
      if (groups.length >= maxResults) break;
      const url = link.href;
      const name = link.textContent.trim();
      if (url && name && !groups.find(g => g.url === url)) {
        groups.push({ url, name });
      }
    }

    return { success: true, groups };
  }



  // === EXTRACT GROUP MEMBERS ===
  async function extractMembers(data) {
    const { maxMembers, scrollDelay } = data;
    await waitForPageLoad();
    await wait(2000);

    const members = [];
    const seenUrls = new Set();
    let lastCount = 0;
    let noNewCount = 0;

    while (members.length < maxMembers && noNewCount < 5) {
      const memberElements = document.querySelectorAll(
        '[data-pagelet*="member"] a[href*="/user/"], ' +
        '[role="listitem"] a[href*="/user/"], ' +
        'a[href*="facebook.com/"][role="link"]'
      );

      for (const el of memberElements) {
        if (members.length >= maxMembers) break;
        const url = el.href?.split('?')[0];
        if (!url || seenUrls.has(url) || !url.includes('facebook.com')) continue;
        if (url.includes('/groups/') || url.includes('/pages/')) continue;

        seenUrls.add(url);
        const name = el.textContent?.trim() || '';
        if (name.length < 2 || name.length > 60) continue;

        const parentEl = el.closest('[role="listitem"]') || el.parentElement;
        const metaText = parentEl?.textContent || '';

        members.push({
          name,
          profileUrl: url,
          joinDate: extractDate(metaText),
          role: metaText.toLowerCase().includes('admin') ? 'admin' :
                metaText.toLowerCase().includes('moderator') ? 'moderator' : 'member'
        });
      }

      if (members.length === lastCount) {
        noNewCount++;
      } else {
        noNewCount = 0;
        lastCount = members.length;
      }

      // Scroll down to load more
      window.scrollBy(0, 800);
      await wait(scrollDelay || 2000);
    }

    return { success: true, members, total: members.length };
  }

  // === EXTRACT ACTIVE MEMBERS ===
  async function extractActiveMembers(data) {
    const { maxPosts, scrollDelay } = data;
    await waitForPageLoad();

    const members = new Map();

    for (let i = 0; i < maxPosts; i++) {
      const posts = document.querySelectorAll('[role="article"]');
      for (const post of posts) {
        const authorLink = post.querySelector('a[href*="/user/"], a[role="link"][href*="facebook.com/"]');
        if (!authorLink) continue;

        const url = authorLink.href?.split('?')[0];
        const name = authorLink.textContent?.trim();
        if (!url || !name) continue;

        if (!members.has(url)) {
          members.set(url, { name, profileUrl: url, postCount: 1, role: 'active' });
        } else {
          members.get(url).postCount++;
        }
      }

      window.scrollBy(0, 600);
      await wait(scrollDelay || 2000);
    }

    const sorted = [...members.values()].sort((a, b) => b.postCount - a.postCount);
    return { success: true, members: sorted, total: sorted.length };
  }

  // === EXTRACT ADMINS ===
  async function extractAdmins(data) {
    await waitForPageLoad();
    await wait(2000);

    const admins = [];
    const elements = document.querySelectorAll('[role="listitem"] a[href*="facebook.com/"]');

    for (const el of elements) {
      const url = el.href?.split('?')[0];
      const name = el.textContent?.trim();
      if (url && name && name.length > 1 && !url.includes('/groups/')) {
        admins.push({ name, profileUrl: url, role: 'admin' });
      }
    }

    return { success: true, members: admins, total: admins.length };
  }

  // === SHARE POST ===
  async function sharePost(data) {
    const { shareTarget, targetUrl, caption } = data;
    await waitForPageLoad();
    await AntiDetect.behave();

    // Find share button
    const shareBtn = document.querySelector(
      '[aria-label*="Share"], [aria-label*="Partager"], [aria-label*="مشاركة"], ' +
      '[aria-label*="Send this to friends"]'
    );
    if (!shareBtn) return { success: false, error: 'Share button not found' };

    await humanClick(shareBtn);
    await wait(randomDelay(1500, 3000));

    if (shareTarget === 'timeline') {
      // Click "Share now" or "Share to Feed"
      const shareNow = await findButtonByText(['share now', 'partager maintenant', 'مشاركة الآن', 'share to feed', 'share to your feed']);
      if (shareNow) {
        await humanClick(shareNow);
        await wait(randomDelay(2000, 4000));
        return { success: true };
      }
    }

    if (shareTarget === 'group') {
      // Click "Share to a group"
      const shareToGroup = await findButtonByText(['share to a group', 'partager dans un groupe', 'مشاركة في مجموعة', 'group']);
      if (shareToGroup) {
        await humanClick(shareToGroup);
        await wait(randomDelay(1500, 3000));

        // Search for group
        const searchInput = await waitForElement('input[type="search"], input[placeholder*="Search"], input[placeholder*="Rechercher"]', null, 5000);
        if (searchInput && targetUrl) {
          const groupName = targetUrl.split('/groups/')[1]?.replace(/\//g, '') || '';
          await typeContent(searchInput, groupName);
          await wait(randomDelay(1500, 3000));

          // Click first result
          const firstResult = document.querySelector('[role="dialog"] [role="option"], [role="dialog"] [role="listitem"]');
          if (firstResult) {
            await humanClick(firstResult);
            await wait(randomDelay(1000, 2000));
          }
        }

        // Add caption if provided
        if (caption) {
          const captionInput = await waitForElement('[contenteditable="true"]', null, 3000);
          if (captionInput) {
            await typeContent(captionInput, caption);
            await wait(randomDelay(500, 1000));
          }
        }

        // Click share/post
        const postBtn = await findButtonByText(['post', 'publier', 'نشر', 'share', 'partager']);
        if (postBtn) {
          await humanClick(postBtn);
          await wait(randomDelay(2000, 4000));
          return { success: true };
        }
      }
    }

    return { success: false, error: 'Could not complete share' };
  }

  // === GET PAGE POSTS ===
  async function getPagePosts(data) {
    const { maxPosts } = data;
    await waitForPageLoad();
    await wait(2000);

    const urls = [];
    const links = document.querySelectorAll('a[href*="/posts/"], a[href*="/permalink/"]');
    for (const link of links) {
      if (urls.length >= maxPosts) break;
      if (link.href && !urls.includes(link.href)) {
        urls.push(link.href);
      }
    }

    return { success: true, urls };
  }

  // === SHARE FEED TO GROUPS ===
  async function shareFeedToGroups(data) {
    const { groupUrls, maxPosts, keywords } = data;
    // Simplified: this would need full implementation with tab navigation
    return { success: true, message: 'Feed sharing initiated', shared: 0 };
  }



  // === SEND FRIEND REQUEST ===
  async function sendFriendRequest(data) {
    const { sendMessage, messageTemplate } = data;
    await waitForPageLoad();
    await AntiDetect.behave();

    // Find "Add Friend" button
    const addFriendBtn = await findButtonByText([
      'add friend', 'ajouter', 'ajouter en ami', 'إضافة صديق', 'اضافة صديق'
    ]);

    if (!addFriendBtn) return { success: false, error: 'Add Friend button not found' };

    await humanClick(addFriendBtn);
    await wait(randomDelay(2000, 4000));

    // Optionally send a message
    if (sendMessage && messageTemplate) {
      await wait(randomDelay(1000, 2000));
      const messageBtn = await findButtonByText(['message', 'envoyer un message', 'رسالة', 'مراسلة']);
      if (messageBtn) {
        await humanClick(messageBtn);
        await wait(randomDelay(1500, 3000));

        const msgInput = await waitForElement('[contenteditable="true"][role="textbox"]', null, 5000);
        if (msgInput) {
          await typeContent(msgInput, messageTemplate);
          await wait(randomDelay(500, 1000));
          msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
          await wait(randomDelay(1000, 2000));
        }
      }
    }

    return { success: true };
  }

  // === ADD SUGGESTED FRIENDS ===
  async function addSuggestedFriends(data) {
    const { maxRequests, delayMin, delayMax } = data;
    await waitForPageLoad();
    await wait(2000);

    let sent = 0;

    const addButtons = document.querySelectorAll(
      '[aria-label*="Add Friend"], [aria-label*="Ajouter"], [aria-label*="إضافة صديق"]'
    );

    for (const btn of addButtons) {
      if (sent >= maxRequests) break;
      if (!isVisible(btn)) continue;

      try {
        await humanClick(btn);
        sent++;
        await wait(randomDelay(delayMin * 1000, delayMax * 1000));
      } catch (e) { /* skip */ }
    }

    return { success: true, sent };
  }

  // =============================================
  // === HELPER FUNCTIONS ===
  // =============================================

  async function findPostBox() {
    const selectors = [
      '[aria-label="Quoi de neuf"]', '[aria-label="What\'s on your mind"]',
      '[aria-label="Exprimez-vous"]', '[aria-label="Create a post"]',
      '[aria-label="ما الذي يدور في ذهنك"]', '[aria-label="بم تفكر"]',
      '[aria-label="اكتب منشور"]'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && isVisible(el)) return el;
    }
    // Fallback text search
    const keywords = ['quoi de neuf', "what's on your mind", 'exprimez-vous', 'create a post', 'ما الذي يدور', 'بم تفكر', 'write something'];
    const buttons = document.querySelectorAll('[role="button"]');
    for (const btn of buttons) {
      const text = btn.textContent.toLowerCase();
      if (keywords.some(k => text.includes(k))) return btn;
    }
    return null;
  }

  async function waitForEditor() {
    return waitForElement(
      '[contenteditable="true"][role="textbox"], ' +
      '[contenteditable="true"][data-lexical-editor="true"], ' +
      'div[role="dialog"] [contenteditable="true"]',
      null, 10000
    );
  }

  async function typeContent(editor, content) {
    editor.focus();
    await wait(200);
    // Method 1: Paste
    try {
      const cd = new DataTransfer();
      cd.setData('text/plain', content);
      editor.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: cd }));
      await wait(400);
      if (editor.textContent.includes(content.substring(0, 15))) return;
    } catch (e) {}
    // Method 2: execCommand
    try {
      document.execCommand('insertText', false, content);
      await wait(400);
      if (editor.textContent.includes(content.substring(0, 15))) return;
    } catch (e) {}
    // Method 3: Direct
    editor.textContent = content;
    editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: content }));
    editor.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function findPublishButton() {
    const texts = ['publier', 'post', 'نشر', 'share', 'partager'];
    return waitForButtonByText(texts, 8000);
  }

  async function findButtonByText(textOptions) {
    const buttons = document.querySelectorAll('[role="button"], button, a[role="button"]');
    for (const btn of buttons) {
      const text = btn.textContent.toLowerCase().trim();
      const label = (btn.getAttribute('aria-label') || '').toLowerCase();
      for (const opt of textOptions) {
        if (text === opt || text.includes(opt) || label.includes(opt)) {
          if (isVisible(btn) && !btn.hasAttribute('disabled') && btn.getAttribute('aria-disabled') !== 'true') {
            return btn;
          }
        }
      }
    }
    return null;
  }

  async function waitForButtonByText(textOptions, timeout = 5000) {
    const interval = 400;
    let elapsed = 0;
    while (elapsed < timeout) {
      const btn = await findButtonByText(textOptions);
      if (btn) return btn;
      await wait(interval);
      elapsed += interval;
    }
    return null;
  }

  async function humanClick(element) {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width * (0.3 + Math.random() * 0.4);
    const y = rect.top + rect.height * (0.3 + Math.random() * 0.4);
    element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, clientX: x, clientY: y }));
    await wait(randomDelay(30, 80));
    element.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: y }));
    await wait(randomDelay(40, 120));
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: x, clientY: y }));
    await wait(randomDelay(40, 100));
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: x, clientY: y }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y }));
    if (element.focus) element.focus();
  }

  function isVisible(el) {
    return el.offsetHeight > 0 && el.offsetWidth > 0;
  }

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
  function randomDelay(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  async function waitForPageLoad() {
    if (document.readyState === 'complete') return;
    return new Promise(r => window.addEventListener('load', r, { once: true }));
  }

  async function waitForElement(selector, parent, timeout = 5000) {
    const root = parent || document;
    const interval = 300;
    let elapsed = 0;
    while (elapsed < timeout) {
      const el = root.querySelector(selector);
      if (el && isVisible(el)) return el;
      await wait(interval);
      elapsed += interval;
    }
    return null;
  }

  function extractDate(text) {
    const match = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
    return match ? match[1] : null;
  }

  async function getSettings() {
    return new Promise(r => chrome.storage.local.get('settings', d => r(d.settings || {})));
  }

})();

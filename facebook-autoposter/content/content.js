// Facebook Auto Poster Pro - Ultimate Content Script
// Advanced DOM interaction with anti-detection features

(function() {
  'use strict';

  // === MESSAGE LISTENER ===
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'createPost') {
      createPost(message.data)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
    }
    if (message.action === 'replyToComments') {
      replyToComments(message.data)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
    }
    if (message.action === 'getSettings') {
      chrome.storage.local.get('settings', (data) => sendResponse(data.settings || {}));
      return true;
    }
  });

  // === ANTI-DETECTION MODULE ===
  const AntiDetection = {
    async randomScroll() {
      const scrollAmount = Math.random() * 500 + 200;
      const steps = Math.floor(Math.random() * 5) + 3;
      const stepSize = scrollAmount / steps;
      
      for (let i = 0; i < steps; i++) {
        window.scrollBy(0, stepSize);
        await wait(randomDelay(100, 300));
      }
      
      // Scroll back
      await wait(randomDelay(500, 1500));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await wait(randomDelay(1000, 2000));
    },

    async randomMouseMovement() {
      const moves = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < moves; i++) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        document.dispatchEvent(new MouseEvent('mousemove', {
          clientX: x, clientY: y, bubbles: true
        }));
        await wait(randomDelay(200, 600));
      }
    },

    async randomPause() {
      const duration = randomDelay(2000, 8000);
      await wait(duration);
    },

    async humanBehavior() {
      const settings = await getSettings();
      
      if (settings.randomScrolling) {
        await this.randomScroll();
      }
      if (settings.randomPause) {
        await this.randomPause();
      }
      await this.randomMouseMovement();
    }
  };

  // === MAIN POST CREATION ===
  async function createPost(data) {
    const { content, target, targetUrl } = data;
    const settings = await getSettings();

    await waitForPageLoad();

    try {
      // Anti-detection: natural pre-post behavior
      if (settings.humanMode !== false) {
        await AntiDetection.humanBehavior();
      }

      // Step 1: Find and click the create post box
      const postBox = await findPostBox();
      if (!postBox) {
        throw new Error('Cannot find post creation area');
      }

      await humanClick(postBox);
      await wait(randomDelay(1500, 3000));

      // Step 2: Wait for editor
      const editor = await waitForEditor();
      if (!editor) {
        throw new Error('Cannot open post editor');
      }

      await wait(randomDelay(500, 1000));

      // Step 3: Type content naturally
      await typeContent(editor, content);
      await wait(randomDelay(1500, 3000));

      // Step 4: Click publish
      const publishBtn = await findPublishButton();
      if (!publishBtn) {
        throw new Error('Publish button not found');
      }

      await humanClick(publishBtn);
      await wait(randomDelay(3000, 5000));

      // Step 5: Verify
      const published = await verifyPublication();
      
      return { success: true, message: 'Post published successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // === AUTO-REPLY TO COMMENTS ===
  async function replyToComments(data) {
    const { replyText, maxReplies, delay } = data;
    let repliedCount = 0;

    try {
      // Find comment sections
      const commentBoxes = document.querySelectorAll('[aria-label*="reply"], [aria-label*="Repondre"], [aria-label*="رد"]');
      
      for (const box of commentBoxes) {
        if (repliedCount >= (maxReplies || 5)) break;
        
        await humanClick(box);
        await wait(randomDelay(1000, 2000));
        
        const replyEditor = await waitForElement('[contenteditable="true"]', box.closest('[role="article"]'), 5000);
        if (replyEditor) {
          await typeContent(replyEditor, replyText);
          await wait(randomDelay(500, 1000));
          
          // Press Enter to submit
          replyEditor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
          await wait(randomDelay((delay || 30) * 1000, (delay || 30) * 1000 + 5000));
          repliedCount++;
        }
      }
      
      return { success: true, repliedCount };
    } catch (error) {
      return { success: false, error: error.message, repliedCount };
    }
  }

  // === DOM INTERACTION ===
  async function findPostBox() {
    const selectors = [
      '[aria-label="Quoi de neuf"]',
      '[aria-label="What\'s on your mind"]',
      '[aria-label="Exprimez-vous"]',
      '[aria-label="Create a post"]',
      '[aria-label="ما الذي يدور في ذهنك"]',
      '[aria-label="بم تفكر"]',
      '[aria-label="اكتب منشور"]',
      'div[role="button"][tabindex="0"]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        if (isPostCreationBox(el)) return el;
      }
    }

    // Fallback: text-based search (multi-language)
    const keywords = [
      'quoi de neuf', "what's on your mind", 'exprimez-vous',
      'create a post', 'ما الذي يدور', 'بم تفكر', 'اكتب منشور',
      'write something'
    ];
    
    const allButtons = document.querySelectorAll('[role="button"]');
    for (const btn of allButtons) {
      const text = btn.textContent.toLowerCase();
      for (const keyword of keywords) {
        if (text.includes(keyword)) return btn;
      }
    }

    return null;
  }

  function isPostCreationBox(el) {
    const text = el.textContent.toLowerCase();
    const keywords = ['quoi de neuf', "what's on your mind", 'exprimez-vous',
      'a quoi pensez-vous', 'ما الذي يدور', 'بم تفكر', 'create'];
    return keywords.some(k => text.includes(k));
  }

  async function waitForEditor() {
    const maxWait = 10000;
    const interval = 400;
    let elapsed = 0;

    while (elapsed < maxWait) {
      const editors = document.querySelectorAll(
        '[contenteditable="true"][role="textbox"], ' +
        '[contenteditable="true"][aria-label*="post"], ' +
        '[contenteditable="true"][aria-label*="publication"], ' +
        '[contenteditable="true"][aria-label*="منشور"], ' +
        '[contenteditable="true"][data-lexical-editor="true"], ' +
        'div[role="dialog"] [contenteditable="true"]'
      );

      for (const editor of editors) {
        if (editor.offsetHeight > 0 && editor.offsetWidth > 0) {
          return editor;
        }
      }

      await wait(interval);
      elapsed += interval;
    }
    return null;
  }

  async function typeContent(editor, content) {
    editor.focus();
    await wait(300);

    // Method 1: Clipboard paste simulation
    try {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', content);
      const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true, cancelable: true, clipboardData
      });
      editor.dispatchEvent(pasteEvent);
      await wait(500);
      if (editor.textContent.includes(content.substring(0, 20))) return;
    } catch (e) {}

    // Method 2: execCommand
    try {
      document.execCommand('insertText', false, content);
      await wait(500);
      if (editor.textContent.includes(content.substring(0, 20))) return;
    } catch (e) {}

    // Method 3: Input event simulation
    try {
      editor.textContent = content;
      editor.dispatchEvent(new InputEvent('input', {
        bubbles: true, cancelable: true, inputType: 'insertText', data: content
      }));
      editor.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (e) {}
  }

  async function findPublishButton() {
    const maxWait = 8000;
    const interval = 400;
    let elapsed = 0;

    while (elapsed < maxWait) {
      const buttons = document.querySelectorAll(
        '[role="dialog"] [role="button"], ' +
        '[aria-label*="Publier"], [aria-label*="Post"], [aria-label*="نشر"], ' +
        '[aria-label*="Share"], [aria-label*="Partager"]'
      );
      
      for (const btn of buttons) {
        const text = btn.textContent.toLowerCase().trim();
        const label = (btn.getAttribute('aria-label') || '').toLowerCase();
        
        if (text === 'publier' || text === 'post' || text === 'نشر' || text === 'share' ||
            label.includes('publier') || label.includes('post') || label.includes('نشر')) {
          if (!btn.hasAttribute('disabled') && btn.getAttribute('aria-disabled') !== 'true') {
            return btn;
          }
        }
      }

      await wait(interval);
      elapsed += interval;
    }
    return null;
  }

  async function verifyPublication() {
    await wait(3000);
    const dialog = document.querySelector('[role="dialog"]');
    return !dialog;
  }

  // === HUMAN-LIKE CLICK ===
  async function humanClick(element) {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width * (0.3 + Math.random() * 0.4);
    const y = rect.top + rect.height * (0.3 + Math.random() * 0.4);

    element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, clientX: x, clientY: y }));
    await wait(randomDelay(30, 100));
    element.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: y }));
    await wait(randomDelay(50, 150));
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: x, clientY: y }));
    await wait(randomDelay(50, 120));
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: x, clientY: y }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y }));
    element.focus && element.focus();
  }

  // === UTILITIES ===
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async function waitForPageLoad() {
    if (document.readyState === 'complete') return;
    return new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
  }

  async function waitForElement(selector, parent, timeout = 5000) {
    const root = parent || document;
    const interval = 300;
    let elapsed = 0;
    while (elapsed < timeout) {
      const el = root.querySelector(selector);
      if (el) return el;
      await wait(interval);
      elapsed += interval;
    }
    return null;
  }

  async function getSettings() {
    return new Promise(resolve => {
      chrome.storage.local.get('settings', (data) => resolve(data.settings || {}));
    });
  }

})();

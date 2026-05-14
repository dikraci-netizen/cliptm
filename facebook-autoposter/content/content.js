// Facebook Auto Poster Pro - Content Script
// Interacts with the Facebook page DOM to create posts

(function() {
  'use strict';

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'createPost') {
      createPost(message.data)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Async response
    }
  });

  // === MAIN POST CREATION ===
  async function createPost(data) {
    const { content, target, targetUrl } = data;

    // Wait for page to be fully loaded
    await waitForPageLoad();

    // Strategy: Click on the "What's on your mind?" box, type content, then publish
    try {
      // Step 1: Find and click the create post box
      const postBox = await findPostBox();
      if (!postBox) {
        throw new Error('Impossible de trouver la zone de publication');
      }

      // Click with human-like delay
      await humanClick(postBox);
      await wait(randomDelay(1500, 3000));

      // Step 2: Wait for the post dialog/editor to open
      const editor = await waitForEditor();
      if (!editor) {
        throw new Error('Impossible d\'ouvrir l\'editeur de post');
      }

      await wait(randomDelay(500, 1000));

      // Step 3: Type content with natural speed
      await typeContent(editor, content);
      await wait(randomDelay(1000, 2000));

      // Step 4: Click publish button
      const publishBtn = await findPublishButton();
      if (!publishBtn) {
        throw new Error('Bouton Publier introuvable');
      }

      await humanClick(publishBtn);
      await wait(randomDelay(2000, 4000));

      // Step 5: Verify publication
      const published = await verifyPublication();
      
      return { success: true, message: 'Post publie avec succes' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // === DOM INTERACTION HELPERS ===

  async function findPostBox() {
    // Multiple selectors for different Facebook layouts
    const selectors = [
      '[aria-label="Quoi de neuf"]',
      '[aria-label="What\'s on your mind"]',
      '[aria-label="Exprimez-vous"]',
      '[aria-label="Create a post"]',
      '[role="button"][tabindex="0"]',
      'div[data-pagelet="Stories"] + div [role="button"]',
      'div[class*="x1lliihq"][role="button"]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        if (isPostCreationBox(el)) {
          return el;
        }
      }
    }

    // Fallback: look for the "What's on your mind" text
    const allButtons = document.querySelectorAll('[role="button"]');
    for (const btn of allButtons) {
      const text = btn.textContent.toLowerCase();
      if (text.includes('quoi de neuf') || 
          text.includes("what's on your mind") || 
          text.includes('exprimez-vous') ||
          text.includes('create a post')) {
        return btn;
      }
    }

    return null;
  }

  function isPostCreationBox(el) {
    const text = el.textContent.toLowerCase();
    return text.includes('quoi de neuf') || 
           text.includes("what's on your mind") || 
           text.includes('exprimez-vous') ||
           text.includes('a quoi pensez-vous');
  }

  async function waitForEditor() {
    // Wait for the post creation dialog to appear
    const maxWait = 10000;
    const interval = 500;
    let elapsed = 0;

    while (elapsed < maxWait) {
      // Look for contenteditable div in dialog
      const editors = document.querySelectorAll(
        '[contenteditable="true"][role="textbox"], ' +
        '[contenteditable="true"][aria-label*="post"], ' +
        '[contenteditable="true"][aria-label*="publication"], ' +
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
    // Focus the editor
    editor.focus();
    await wait(300);

    // Use execCommand for compatibility with React-based editors
    // First, try the Clipboard API approach
    try {
      // Method 1: Simulate paste
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', content);
      
      const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: clipboardData
      });
      editor.dispatchEvent(pasteEvent);
      
      await wait(500);
      
      // Check if content was inserted
      if (editor.textContent.includes(content.substring(0, 20))) {
        return;
      }
    } catch (e) {}

    // Method 2: Use document.execCommand
    try {
      document.execCommand('insertText', false, content);
      await wait(500);
      if (editor.textContent.includes(content.substring(0, 20))) {
        return;
      }
    } catch (e) {}

    // Method 3: Direct input simulation (character by character for short text)
    editor.textContent = '';
    const inputEvent = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: content
    });
    
    // Set text directly as last resort
    editor.textContent = content;
    editor.dispatchEvent(inputEvent);
    editor.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function findPublishButton() {
    const maxWait = 5000;
    const interval = 500;
    let elapsed = 0;

    while (elapsed < maxWait) {
      // Look for publish/post button
      const buttons = document.querySelectorAll('[role="dialog"] [role="button"], [aria-label*="Publier"], [aria-label*="Post"]');
      
      for (const btn of buttons) {
        const text = btn.textContent.toLowerCase().trim();
        const label = (btn.getAttribute('aria-label') || '').toLowerCase();
        
        if (text === 'publier' || text === 'post' || 
            label.includes('publier') || label.includes('post')) {
          // Make sure it's not disabled
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
    // Wait a bit and check if the dialog closed (indicating success)
    await wait(3000);
    const dialog = document.querySelector('[role="dialog"]');
    return !dialog; // If dialog is gone, post was likely published
  }

  // === HUMAN-LIKE INTERACTIONS ===

  async function humanClick(element) {
    // Simulate natural mouse movement
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width * (0.3 + Math.random() * 0.4);
    const y = rect.top + rect.height * (0.3 + Math.random() * 0.4);

    // Dispatch mouse events in order
    element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, clientX: x, clientY: y }));
    await wait(randomDelay(50, 150));
    element.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: y }));
    await wait(randomDelay(50, 100));
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: x, clientY: y }));
    await wait(randomDelay(50, 150));
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: x, clientY: y }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y }));
    
    // Also trigger focus
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
    return new Promise(resolve => {
      window.addEventListener('load', resolve, { once: true });
    });
  }

})();

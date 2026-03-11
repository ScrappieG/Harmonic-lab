chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url && tab.url.includes('leetcode.com/problems/')) {
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
    } catch (e) {
      // Content script never set up a listener (initial load wasn't a /problems/ page)
      // Inject it now, then it will auto-initialize on the current problems page
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['widget-html.js', 'content.js']
      });
    }
  }
});

chrome.runtime.onMessageExternal.addListener((message, _sender, sendResponse) => {
  if (message.access_token) {
    chrome.storage.local.set({ access_token: message.access_token });
    sendResponse({ ok: true });
  }
});
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('leetcode.com/problems/')) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
  }
});

chrome.runtime.onMessageExternal.addListener((message, _sender, sendResponse) => {
  if (message.access_token) {
    chrome.storage.local.set({ access_token: message.access_token });
    sendResponse({ ok: true });
  }
});
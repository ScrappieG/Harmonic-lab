chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('leetcode.com/problems/')) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
  }
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log('[articuLeet bg] External message from:', sender.origin, message)
  if (message.access_token) {
    chrome.storage.local.set({ access_token: message.access_token }, () => {
      console.log('[articuLeet bg] Token stored')
      sendResponse({ ok: true })
    })
    return true // keeps sendResponse channel open for async response
  }
})
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('leetcode.com/problems/')) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
  }
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log('[articuLeet bg] External message from:', sender.origin, message)
  if (message.access_token) {
    var data = { access_token: message.access_token };
    if (message.refresh_token) data.refresh_token = message.refresh_token;
    chrome.storage.local.set(data, () => {
      console.log('[articuLeet bg] Tokens stored')
      sendResponse({ ok: true })
    })
    return true
  }
})
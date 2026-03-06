chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('leetcode.com/problems/')) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
  }
});
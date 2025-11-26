chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['blockedCountries', 'channelCache'], (o) => {
    if (!o.blockedCountries) chrome.storage.local.set({ blockedCountries: [] });
    if (!o.channelCache) chrome.storage.local.set({ channelCache: {} });
  });
});

let blockedCountries = [];
let apiKey = "";

// Initialize
chrome.storage.local.get(['blockedCountries', 'apiKey'], (result) => {
  blockedCountries = result.blockedCountries || [];
  apiKey = result.apiKey || "";
  if (apiKey) startObserver();
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedCountries) blockedCountries = changes.blockedCountries.newValue;
  if (changes.apiKey) apiKey = changes.apiKey.newValue;
});

function startObserver() {
  const observer = new MutationObserver(() => processContent());
  observer.observe(document.body, { childList: true, subtree: true });
  processContent();
}

function processContent() {
  // Target Videos and Standard Playlists
  const selector = `
    ytd-video-renderer:not(.geo-checked), 
    ytd-playlist-renderer:not(.geo-checked), 
    ytd-rich-item-renderer:not(.geo-checked)
  `;
  
  const items = document.querySelectorAll(selector);

  items.forEach(item => {
    item.classList.add('geo-checked'); 
    const info = extractInfo(item);

    if (info && apiKey) {
      chrome.runtime.sendMessage({
        action: "checkItem",
        data: info,
        apiKey: apiKey
      }, (response) => {
        if (chrome.runtime.lastError) return;
        
        if (response && response.country && blockedCountries.includes(response.country)) {
          item.style.display = 'none';
        }
      });
    }
  });
}

function extractInfo(el) {
  const link = el.querySelector('a[href^="/@"], a[href^="/channel/"]');
  
  if (link) {
    const href = link.getAttribute('href');
    if (href.includes('/@')) return { type: 'handle', value: href.split('/@')[1].split('/')[0] };
    if (href.includes('/channel/')) return { type: 'id', value: href.split('/channel/')[1].split('/')[0] };
  }
  return null; 
}
/* content.js — lightweight content script */

const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;

// Loaded from storage
let isoSet = new Set();
let blockedNames = [];
let channelCache = {};

async function loadSettings() {
  return new Promise((res) => {
    chrome.storage.local.get(['blockedCountries', 'channelCache'], (obj) => {
      const arr = obj.blockedCountries || [];
      isoSet = new Set(arr.map(e => e.code.toUpperCase()));
      blockedNames = arr.map(e => e.nameLower);
      channelCache = obj.channelCache || {};

      const now = Date.now();
      for (const k of Object.keys(channelCache)) {
        if (!channelCache[k].ts || (now - channelCache[k].ts > CACHE_TTL_MS)) {
          delete channelCache[k];
        }
      }
      res();
    });
  });
}

async function saveCache() {
  chrome.storage.local.set({ channelCache });
}

function findChannelIdFromTile(tile) {
  const channelLink =
    tile.querySelector('ytd-channel-name a') ||
    tile.querySelector('a[href^="/channel/"], a[href^="/user/"], a[href^="/c/"]');

  if (!channelLink) return null;
  const href = channelLink.getAttribute('href');
  const match = href.match(/\/(channel|user|c)\/([^/?&]+)/);
  if (!match) return null;

  return { type: match[1], idOrName: decodeURIComponent(match[2]) };
}

async function fetchChannelCountry(ref) {
  let url;
  if (ref.type === 'channel')
    url = `https://www.youtube.com/channel/${ref.idOrName}/about`;
  else
    url = `https://www.youtube.com/${ref.type}/${ref.idOrName}/about`;

  try {
    const resp = await fetch(url, { credentials: 'include' });
    if (!resp.ok) return null;
    const text = await resp.text();

    let country = null;
    let m;

    m = text.match(/"countryText":\{"simpleText":"([^"]+)"/);
    if (m) country = m[1];

    if (!country) {
      m = text.match(/"countryText":\{"runs":\[\{"text":"([^"]+)"/);
      if (m) country = m[1];
    }

    const idMatch = text.match(/"externalId":"([^"]+)"/);
    const channelId = idMatch ? idMatch[1] : null;

    return { country, channelId };
  } catch {
    return null;
  }
}

function cacheKey(ref) {
  return `${ref.type}:${ref.idOrName}`.toLowerCase();
}

async function resolveChannelCached(ref) {
  const now = Date.now();
  const key = cacheKey(ref);

  if (channelCache[key] && now - channelCache[key].ts < CACHE_TTL_MS) {
    return channelCache[key];
  }

  const res = await fetchChannelCountry(ref);
  const country = res ? res.country : null;

  channelCache[key] = { country, ts: now };

  if (res && res.channelId) {
    const canonKey = `channel:${res.channelId.toLowerCase()}`;
    channelCache[canonKey] = { country, ts: now };
  }

  saveCache();
  return channelCache[key];
}

function hideTile(tile, reason) {
  tile.style.opacity = "0.18";
  tile.style.transition = "opacity 200ms ease";
  tile.setAttribute("data-geoblocker-hidden", "1");
  tile.setAttribute("data-geoblocker-reason", reason || "");
}

async function processTile(tile) {
  if (tile.getAttribute("data-geoblocker-hidden") === "1") return;

  const ref = findChannelIdFromTile(tile);
  if (!ref) return;

  const res = await resolveChannelCached(ref);
  if (!res.country) return;

  const c = res.country.toLowerCase();

  if (c.length === 2 && isoSet.has(c.toUpperCase())) {
    hideTile(tile, res.country);
    return;
  }

  for (const bn of blockedNames) {
    if (!bn) continue;
    if (c === bn || c.includes(bn) || bn.includes(c)) {
      hideTile(tile, res.country);
      return;
    }
  }
}

function findVideoTiles(root = document) {
  const selectors = [
    "ytd-video-renderer",
    "ytd-grid-video-renderer",
    "ytd-compact-video-renderer",
    "ytd-rich-item-renderer",
    "ytd-rich-grid-media",
    "ytd-playlist-video-renderer"
  ];

  const results = [];
  selectors.forEach(sel => {
    root.querySelectorAll(sel).forEach(n => results.push(n));
  });
  return results;
}

let processing = false;

async function scan(root = document) {
  if (processing) return;
  processing = true;
  await loadSettings();

  const tiles = findVideoTiles(root);
  for (const t of tiles) {
    processTile(t);
  }

  processing = false;
}

const observer = new MutationObserver(muts => {
  muts.forEach(m => {
    m.addedNodes.forEach(node => {
      if (node instanceof Element) scan(node);
    });
  });
});

(async () => {
  await scan();
  observer.observe(document.body, { childList: true, subtree: true });
  setInterval(scan, 5000);
})();

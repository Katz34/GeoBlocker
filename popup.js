// popup.js
// Assumes countries.js (COUNTRIES array) is loaded before this script.

document.addEventListener('DOMContentLoaded', init);

function el(id) { return document.getElementById(id); }

async function init() {
  populateCountrySelect();
  el('countryFilter').addEventListener('input', onFilter);
  el('addBtn').addEventListener('click', onAdd);
  el('addAllBtn').addEventListener('click', onAddSelected);
  el('clearCache').addEventListener('click', () => {
    chrome.storage.local.remove('channelCache', () => showToast('Channel cache cleared'));
  });
  el('resetAll').addEventListener('click', () => {
    chrome.storage.local.set({ blockedCountries: [], channelCache: {} }, () => {
      renderList([]);
      showToast('Reset done');
    });
  });
  el('countrySelect').addEventListener('dblclick', onAdd);
  loadAndRender();
}

function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.position = 'fixed';
  t.style.bottom = '10px';
  t.style.left = '10px';
  t.style.background = '#222';
  t.style.color = '#fff';
  t.style.padding = '6px 8px';
  t.style.borderRadius = '6px';
  t.style.zIndex = 9999;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1800);
}

function populateCountrySelect(filter = '') {
  const sel = el('countrySelect');
  sel.innerHTML = '';
  const f = (filter || '').trim().toLowerCase();
  const filtered = COUNTRIES.filter(c => {
    if (!f) return true;
    return c.name.toLowerCase().includes(f) || c.code.toLowerCase().includes(f);
  });
  filtered.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = `${c.name} (${c.code})`;
    sel.appendChild(opt);
  });
  if (sel.options.length > 0) sel.selectedIndex = 0;
}

function onFilter(e) {
  populateCountrySelect(e.target.value);
}

function loadAndRender() {
  chrome.storage.local.get(['blockedCountries'], (obj) => {
    const arr = obj.blockedCountries || [];
    renderList(arr);
  });
}

function renderList(arr) {
  const list = el('list');
  list.innerHTML = '';
  if (!arr || arr.length === 0) {
    list.innerHTML = '<div class="small">No blocked countries yet.</div>';
    return;
  }
  arr.forEach((entry, i) => {
    const code = entry.code.toUpperCase();
    const name = entry.name;
    const it = document.createElement('div');
    it.className = 'item';
    const left = document.createElement('div');
    left.textContent = `${name} (${code})`;
    const rem = document.createElement('button');
    rem.className = 'remove';
    rem.textContent = 'Remove';
    rem.addEventListener('click', () => {
      arr.splice(i, 1);
      chrome.storage.local.set({ blockedCountries: arr }, () => {
        renderList(arr);
      });
    });
    it.appendChild(left);
    it.appendChild(rem);
    list.appendChild(it);
  });
}

function makeCountryObj(code) {
  const up = code.toUpperCase();
  const rec = COUNTRIES.find(c => c.code === up);
  const name = rec ? rec.name : up;
  return { code: up, name, nameLower: name.toLowerCase() };
}

function onAdd() {
  const sel = el('countrySelect');
  if (!sel || sel.selectedIndex < 0) return;
  const code = sel.options[sel.selectedIndex].value;
  addCountryCode(code);
}

function onAddSelected() {
  const sel = el('countrySelect');
  const codes = Array.from(sel.options).map(o => o.value);
  chrome.storage.local.get(['blockedCountries'], (obj) => {
    const arr = obj.blockedCountries || [];
    codes.forEach(code => {
      const candidate = makeCountryObj(code);
      if (!arr.map(x => x.code).includes(candidate.code)) arr.push(candidate);
    });
    chrome.storage.local.set({ blockedCountries: arr }, () => {
      renderList(arr);
      showToast('Added visible countries');
    });
  });
}

function addCountryCode(code) {
  const objToAdd = makeCountryObj(code);
  chrome.storage.local.get(['blockedCountries'], (obj) => {
    const arr = obj.blockedCountries || [];
    if (arr.map(x => x.code).includes(objToAdd.code)) {
      showToast('Already in list');
      return;
    }
    arr.push(objToAdd);
    chrome.storage.local.set({ blockedCountries: arr }, () => {
      renderList(arr);
      showToast('Added ' + objToAdd.name);
    });
  });
}

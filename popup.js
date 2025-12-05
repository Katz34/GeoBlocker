document.addEventListener('DOMContentLoaded', () => {
  const countryInput = document.getElementById('countryInput');
  const addBtn = document.getElementById('addBtn');
  const chipContainer = document.getElementById('chipContainer');
  const saveBtn = document.getElementById('saveBtn');
  const apiKeyInput = document.getElementById('apiKey');
  const blockUnknownInput = document.getElementById('blockUnknown'); // Checkbox
  const status = document.getElementById('status');

  let blockedCountries = [];

  // Load saved settings
  chrome.storage.local.get(['blockedCountries', 'apiKey', 'blockUnknown'], (result) => {
    if (result.blockedCountries) {
      blockedCountries = result.blockedCountries;
      renderChips();
    }
    if (result.apiKey) apiKeyInput.value = result.apiKey;
    // Load checkbox state (default false)
    if (result.blockUnknown) blockUnknownInput.checked = result.blockUnknown;
  });

  addBtn.addEventListener('click', () => {
    const code = countryInput.value.trim().toUpperCase();
    if (code && code.length === 2 && !blockedCountries.includes(code)) {
      blockedCountries.push(code);
      renderChips();
      countryInput.value = '';
    }
  });

  function renderChips() {
    chipContainer.innerHTML = '';
    blockedCountries.forEach(code => {
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.innerHTML = `${code} <span data-code="${code}">x</span>`;
      chipContainer.appendChild(chip);
    });

    document.querySelectorAll('.chip span').forEach(el => {
      el.addEventListener('click', (e) => {
        blockedCountries = blockedCountries.filter(c => c !== e.target.getAttribute('data-code'));
        renderChips();
      });
    });
  }

  saveBtn.addEventListener('click', () => {
    chrome.storage.local.set({
      blockedCountries: blockedCountries,
      apiKey: apiKeyInput.value.trim(),
      blockUnknown: blockUnknownInput.checked // Save checkbox
    }, () => {
      status.textContent = 'Settings Saved';
      setTimeout(() => status.textContent = '', 2000);
    });
  });
});
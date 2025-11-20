const cache = new Map(); 

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkItem") {
    checkCountry(request.data, request.apiKey).then(country => {
      sendResponse({ country: country });
    });
    return true; 
  }
});

async function checkCountry(info, apiKey) {
  const id = info.value;
  if (cache.has(id)) return cache.get(id);

  let url = `https://www.googleapis.com/youtube/v3/channels?part=brandingSettings,snippet&key=${apiKey}`;
  url += (info.type === 'handle') ? `&forHandle=${id}` : `&id=${id}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      let country = item.brandingSettings?.channel?.country || item.snippet?.country;
      country = country ? country.toUpperCase() : "UNKNOWN";
      
      cache.set(id, country);
      return country;
    }
  } catch (error) {
    console.error("API Error", error);
  }
  
  cache.set(id, "UNKNOWN");
  return "UNKNOWN";
}
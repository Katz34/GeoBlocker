// popup.js - compact + self-contained for GeoBlocker popup
const C = [
"AF|Afghanistan","AX|Åland Islands","AL|Albania","DZ|Algeria","AS|American Samoa","AD|Andorra","AO|Angola",
"AI|Anguilla","AQ|Antarctica","AG|Antigua and Barbuda","AR|Argentina","AM|Armenia","AW|Aruba","AU|Australia",
"AT|Austria","AZ|Azerbaijan","BS|Bahamas","BH|Bahrain","BD|Bangladesh","BB|Barbados","BY|Belarus","BE|Belgium",
"BZ|Belize","BJ|Benin","BM|Bermuda","BT|Bhutan","BO|Bolivia","BA|Bosnia and Herzegovina","BW|Botswana","BR|Brazil",
"BN|Brunei","BG|Bulgaria","BF|Burkina Faso","BI|Burundi","CV|Cabo Verde","KH|Cambodia","CM|Cameroon","CA|Canada",
"KY|Cayman Islands","CF|Central African Republic","TD|Chad","CL|Chile","CN|China","CX|Christmas Island","CC|Cocos Islands",
"CO|Colombia","KM|Comoros","CG|Congo","CD|Congo (Democratic Republic)","CK|Cook Islands","CR|Costa Rica","CI|Côte d'Ivoire",
"HR|Croatia","CU|Cuba","CW|Curaçao","CY|Cyprus","CZ|Czechia","DK|Denmark","DJ|Djibouti","DM|Dominica","DO|Dominican Republic",
"EC|Ecuador","EG|Egypt","SV|El Salvador","GQ|Equatorial Guinea","ER|Eritrea","EE|Estonia","SZ|Eswatini","ET|Ethiopia",
"FK|Falkland Islands","FO|Faroe Islands","FJ|Fiji","FI|Finland","FR|France","GF|French Guiana","PF|French Polynesia",
"GA|Gabon","GM|Gambia","GE|Georgia","DE|Germany","GH|Ghana","GI|Gibraltar","GR|Greece","GL|Greenland","GD|Grenada",
"GP|Guadeloupe","GU|Guam","GT|Guatemala","GG|Guernsey","GN|Guinea","GW|Guinea-Bissau","GY|Guyana","HT|Haiti",
"HM|Heard Island and McDonald Islands","VA|Holy See","HN|Honduras","HK|Hong Kong","HU|Hungary","IS|Iceland","IN|India",
"ID|Indonesia","IR|Iran","IQ|Iraq","IE|Ireland","IM|Isle of Man","IL|Israel","IT|Italy","JM|Jamaica","JP|Japan","JE|Jersey",
"JO|Jordan","KZ|Kazakhstan","KE|Kenya","KI|Kiribati","KP|Korea (DPRK)","KR|Korea (Republic)","KW|Kuwait","KG|Kyrgyzstan",
"LA|Lao People's Democratic Republic","LV|Latvia","LB|Lebanon","LS|Lesotho","LR|Liberia","LY|Libya","LI|Liechtenstein",
"LT|Lithuania","LU|Luxembourg","MO|Macao","MG|Madagascar","MW|Malawi","MY|Malaysia","MV|Maldives","ML|Mali","MT|Malta",
"MH|Marshall Islands","MQ|Martinique","MR|Mauritania","MU|Mauritius","YT|Mayotte","MX|Mexico","FM|Micronesia","MD|Moldova",
"MC|Monaco","MN|Mongolia","ME|Montenegro","MS|Montserrat","MA|Morocco","MZ|Mozambique","MM|Myanmar","NA|Namibia","NR|Nauru",
"NP|Nepal","NL|Netherlands","NC|New Caledonia","NZ|New Zealand","NI|Nicaragua","NE|Niger","NG|Nigeria","NU|Niue","NF|Norfolk Island",
"MP|Northern Mariana Islands","NO|Norway","OM|Oman","PK|Pakistan","PW|Palau","PS|Palestine","PA|Panama","PG|Papua New Guinea",
"PY|Paraguay","PE|Peru","PH|Philippines","PN|Pitcairn","PL|Poland","PT|Portugal","PR|Puerto Rico","QA|Qatar","RE|Réunion",
"RO|Romania","RU|Russian Federation","RW|Rwanda","BL|Saint Barthélemy","SH|Saint Helena","KN|Saint Kitts and Nevis","LC|Saint Lucia",
"MF|Saint Martin","PM|Saint Pierre and Miquelon","VC|Saint Vincent and the Grenadines","WS|Samoa","SM|San Marino","ST|Sao Tome and Principe",
"SA|Saudi Arabia","SN|Senegal","RS|Serbia","SC|Seychelles","SL|Sierra Leone","SG|Singapore","SX|Sint Maarten","SK|Slovakia","SI|Slovenia",
"SB|Solomon Islands","SO|Somalia","ZA|South Africa","GS|South Georgia and the South Sandwich Islands","SS|South Sudan","ES|Spain",
"LK|Sri Lanka","SD|Sudan","SR|Suriname","SE|Sweden","CH|Switzerland","SY|Syrian Arab Republic","TW|Taiwan","TJ|Tajikistan",
"TZ|Tanzania","TH|Thailand","TL|Timor-Leste","TG|Togo","TK|Tokelau","TO|Tonga","TT|Trinidad and Tobago","TN|Tunisia","TR|Turkey",
"TM|Turkmenistan","TC|Turks and Caicos Islands","TV|Tuvalu","UG|Uganda","UA|Ukraine","AE|United Arab Emirates","GB|United Kingdom",
"US|United States of America","UM|United States Minor Outlying Islands","UY|Uruguay","UZ|Uzbekistan","VU|Vanuatu","VE|Venezuela","VN|Viet Nam",
"VG|Virgin Islands (British)","VI|Virgin Islands (U.S.)","WF|Wallis and Futuna","EH|Western Sahara","YE|Yemen","ZM|Zambia","ZW|Zimbabwe"
];

const $ = id => document.getElementById(id);

function makeList(){ return C.map(s=>{ const i=s.indexOf('|'); return {code:s.slice(0,i),name:s.slice(i+1)}; }); }

function showToast(t){
  const d=document.createElement('div'); d.textContent=t;
  Object.assign(d.style,{position:'fixed',bottom:'10px',left:'10px',background:'#222',color:'#fff',padding:'6px 8px',borderRadius:'6px',zIndex:9999});
  document.body.appendChild(d); setTimeout(()=>d.remove(),1400);
}

function populate(filter=''){
  const sel=$('countrySelect'); sel.innerHTML=''; const f=filter.trim().toLowerCase();
  const frag=document.createDocumentFragment();
  for(const c of makeList()){
    if(f && !(c.name.toLowerCase().includes(f)||c.code.toLowerCase().includes(f))) continue;
    const o=document.createElement('option'); o.value=c.code; o.textContent=`${c.name} (${c.code})`; frag.appendChild(o);
  }
  sel.appendChild(frag); if(sel.options.length) sel.selectedIndex=0;
}

function objFor(code){
  const up=code.toUpperCase(); const rec=makeList().find(r=>r.code===up); const name=rec?rec.name:up; return {code:up,name,nameLower:name.toLowerCase()};
}

function render(arr){
  const box=$('list'); box.innerHTML='';
  if(!arr||!arr.length){ box.innerHTML='<div class="small">No blocked countries yet.</div>'; return; }
  const frag=document.createDocumentFragment();
  arr.forEach((e,i)=>{ const item=document.createElement('div'); item.className='item';
    const left=document.createElement('div'); left.textContent=`${e.name} (${e.code})`;
    const rem=document.createElement('button'); rem.className='remove'; rem.textContent='Remove';
    rem.addEventListener('click',()=>{ arr.splice(i,1); chrome.storage.local.set({blockedCountries:arr},()=>render(arr)); });
    item.appendChild(left); item.appendChild(rem); frag.appendChild(item);
  });
  box.appendChild(frag);
}

function loadAndRender(){ chrome.storage.local.get(['blockedCountries'],o=>render(o.blockedCountries||[])); }

function add(code){
  const e=objFor(code);
  chrome.storage.local.get(['blockedCountries'],o=>{ const arr=o.blockedCountries||[]; if(arr.find(x=>x.code===e.code)){ showToast('Already added'); return; } arr.push(e); chrome.storage.local.set({blockedCountries:arr},()=>{ render(arr); showToast('Added '+e.name); }); });
}

document.addEventListener('DOMContentLoaded',()=>{
  populate();
  $('countryFilter').addEventListener('input',e=>populate(e.target.value));
  $('addBtn').addEventListener('click',()=>{ const s=$('countrySelect'); if(s.selectedIndex>=0) add(s.value); });
  $('addAllBtn').addEventListener('click',()=>{
    const codes=Array.from($('countrySelect').options).map(o=>o.value);
    chrome.storage.local.get(['blockedCountries'],o=>{ const arr=o.blockedCountries||[]; for(const c of codes){ const e=objFor(c); if(!arr.find(x=>x.code===e.code)) arr.push(e); } chrome.storage.local.set({blockedCountries:arr},()=>{ render(arr); showToast('Added visible'); }); });
  });
  $('clearCache').addEventListener('click',()=>{ chrome.storage.local.remove('channelCache',()=>showToast('Cache cleared')); });
  $('resetAll').addEventListener('click',()=>{ chrome.storage.local.set({blockedCountries:[],channelCache:{}},()=>{ render([]); showToast('Reset done'); }); });
  $('countrySelect').addEventListener('dblclick',()=>{ const s=$('countrySelect'); if(s.selectedIndex>=0) add(s.value); });
  loadAndRender();
});

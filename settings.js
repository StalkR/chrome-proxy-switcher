// Proxy settings are synchronized, except currently selected proxy which is local.
//
//   settings = [proxy, ...] // sync storage
//   selected = proxy // local storage
//   proxy = {
//     mode:  "", // direct/system/auto_detect/fixed_server/pac_script/pac_script_data
//     value: "", // empty for direct/system/auto_detect
//                // URL for fixed_server/pac_script
//                // friendly name for pac_script_data
//     data:  "", //  pac_script_data, set by user
//   }
//
// modes are named after https://developers.chrome.com/extensions/proxy#type-Mode
// except pac_script_data which is an addition because of crbug.com/839566
// no longer supporting file:// so we can set pacScript.data directly.
//
// Settings are saved in separate keys because sync quota is small,
// 8k bytes per key and 100k bytes total.
// See https://developer.chrome.com/apps/storage#property-sync

async function loadSettings() {
  let length = await syncGet("proxies");
  if (length === undefined) length = 0;
  let settings = [];
  for (let i = 0; i < length; i++) {
    let proxy = await syncGet("proxy-" + i);
    if (proxy !== undefined) settings.push(proxy);
  }
  return settings;
}

async function saveSettings(settings) {
  await syncClear();
  await syncSet("proxies", settings.length);
  for (let i = 0; i < settings.length; i++) {
    await syncSet("proxy-" + i, settings[i]);
  }
}

async function loadSelected() {
  return await localGet("selected");
}

async function saveSelected(proxy) {
  await localSet("selected", proxy);
}

function syncGet(key) {
  return new Promise(resolve => {
    chrome.storage.sync.get([key], function(items) {
      if (chrome.runtime.error || !(key in items)) resolve(undefined);
      else resolve(items[key]);
    });
  });
}

function syncSet(key, value) {
  return new Promise(resolve => {
    chrome.storage.sync.set({[key]: value}, function() {
      if (chrome.runtime.error) resolve(false);
      else resolve(true);
    });
  });
}

function syncClear() {
  return new Promise(resolve => {
    chrome.storage.sync.clear(function() {
      if (chrome.runtime.error) resolve(false);
      else resolve(true);
    });
  });
}

function localGet(key) {
  return new Promise(resolve => {
    chrome.storage.local.get([key], function(items) {
      if (chrome.runtime.error || !(key in items)) resolve(undefined);
      else resolve(items[key]);
    });
  });
}

function localSet(key, value) {
  return new Promise(resolve => {
    chrome.storage.local.set({[key]: value}, function() {
      if (chrome.runtime.error) resolve(false);
      else resolve(true);
    });
  });
}

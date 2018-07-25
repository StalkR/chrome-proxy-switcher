document.addEventListener('DOMContentLoaded', init, false);

var settings;

function init() {
  chrome.storage.sync.get("settings", function(items) {
    if (chrome.runtime.error) return;
    settings = [];
    if (items.settings !== undefined) settings = items.settings;
    tableFill();
  });
  var add = document.getElementById("add");
  add.onclick = addProxy;
}

// TODO: allow reordering of settings, buttons up/down

function tableFill() {
  for (var i = 0; i < settings.length; i++) {
    tableAdd(settings[i]);
  }
}

function tableAdd(proxy) {
  var tbody = document.getElementById("list");
  var tr = document.createElement("tr");

  var td = document.createElement("td");
  td.innerText = friendlyMode(proxy.mode);
  tr.appendChild(td);
  
  td = document.createElement("td");
  td.innerText = proxy.value;
  tr.appendChild(td);
  
  var input = document.createElement("input");
  input.type = "button";
  input.value = "Delete";
  input.onclick = function() {
    removeProxy(proxy);
    tbody.removeChild(tr);
  };
  td = document.createElement("td");
  td.appendChild(input);
  tr.appendChild(td);

  tbody.insertBefore(tr, document.getElementById("last"));
}

function friendlyMode(mode) {
  switch (mode) {
    case "direct":
      return "Direct";
    case "system":
      return "System";
    case "auto_detect":
      return "Auto detect";
    case "fixed_servers":
      return "Fixed";
    case "pac_script":
      return "PAC script";
  }
  return "n/a";
}

function removeProxy(proxy) {
  var o = [];
  for (var i = 0; i < settings.length; i++) {
    if (settings[i].mode == proxy.mode && settings[i].value == proxy.value) {
      continue;
    }
    o.push(settings[i]);
  }
  settings = o;
  save();
}

function addProxy() {
  var proxy = {
    mode: document.getElementById("mode").value,
    value: document.getElementById("value").value
  };
  tableAdd(proxy);
  settings.push(proxy);
  save();
}

function save() {
  chrome.storage.sync.set({"settings": settings}, function() {});
}

document.addEventListener('DOMContentLoaded', init, false);

function init() {
  chrome.storage.local.get("selected", function(items) {
    if (chrome.runtime.error) return;
    var selected = {};
    if (items.selected !== undefined) selected = items.selected;
    chrome.storage.sync.get("settings", function(items) {
      if (chrome.runtime.error) return;
      var settings = [];
      if (items.settings !== undefined) settings = items.settings;
      tableFill(settings, selected);
    });
  });
}

// TODO: get chrome proxy settings for initial selected state

function tableFill(settings, selected) {
  var base = [
    {mode: "direct"},
    {mode: "system"},
    {mode: "auto_detect"}
  ];
  var options = base.concat(settings);
  for (var i = 0; i < options.length; i++) {
    tableAdd(options[i], selected);
  }
}

function tableAdd(proxy, selected) {
  var tbody = document.getElementById("list");
  var tr = document.createElement("tr");
  var td = document.createElement("td");
  var input = document.createElement("input");
  input.type = "radio";
  input.name = "choice";  // same name so only one selected at a time
  input.id = "proxy-" + Math.random().toString(36);  // for the label
  if (proxy.mode == selected.mode && proxy.value == selected.value) {
    input.checked = true;
  }
  input.onclick = function() {
    switchProxy(proxy);
    chrome.browserAction.setTitle({title: nameProxy(proxy)});
    chrome.storage.local.set({"selected": proxy}, function() {});
  };
  td.appendChild(input);
  var label = document.createElement("label");
  label.htmlFor = input.id;
  label.innerText = nameProxy(proxy);
  td.appendChild(label);
  tr.appendChild(td);
  tbody.appendChild(tr);
}

function nameProxy(proxy) {
  switch (proxy.mode) {
    case "direct":
      return "Direct";
    case "system":
      return "System";
    case "auto_detect":
      return "Auto detect";
    case "fixed_servers":
      return "Fixed: " + proxy.value;
    case "pac_script":
      return "PAC: " + proxy.value;
  }
  return "n/a";
}

function switchProxy(proxy) {
  var config = {
    mode: proxy.mode,
  }
  switch (proxy.mode) {
    case "direct":
      break;
    case "system":
      break;
    case "auto_detect":
      // downloads a PAC script at http://wpad/wpad.dat
      break;
    case "fixed_servers":
      var a = document.createElement("a");
      a.href = proxy.value;
      config.rules = {
        singleProxy: {
          scheme: a.protocol.slice(0, -1),
          host: a.hostname,
          port: parseInt(a.port)
        }
      };
      break;
    case "pac_script":
      config.pacScript = {
        "url": proxy.value,
        mandatory: true  // do not fallback to direct if invalid PAC script
      };
      break;
  }
  switch (proxy.mode) {
    case "direct":
    case "system":
    case "auto_detect":
      chrome.browserAction.setIcon({path: "icon24-grey.png"});
      break;
    default:
      chrome.browserAction.setIcon({path: "icon24.png"});
  }
  chrome.proxy.settings.set({value: config, scope: "regular"}, function() {});
}

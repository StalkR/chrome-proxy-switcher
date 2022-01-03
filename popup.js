document.addEventListener("DOMContentLoaded", init, false);

async function init() {
  let settings = [
    {mode: "direct"},
    {mode: "system"},
    {mode: "auto_detect"}
  ].concat(await loadSettings());
  let selected = await loadSelected();
  for (let i = 0; i < settings.length; i++) {
    tableAdd(i, settings[i], selected);
  }
}

function tableAdd(i, proxy, selected) {
  let tbody = document.getElementById("list");
  let tr = document.createElement("tr");
  let td = document.createElement("td");
  let input = document.createElement("input");
  input.type = "radio";
  input.name = "choice";  // same name so only one selected at a time
  input.id = "proxy-" + i;
  if (selected
      && proxy.mode == selected.mode
      && proxy.value == selected.value) {
    input.checked = true;
  }
  input.onclick = function() {
    switchProxy(proxy);
    chrome.action.setTitle({title: nameProxy(proxy)});
    saveSelected(proxy);
  };
  td.appendChild(input);
  let label = document.createElement("label");
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
    case "pac_script_data":
      return "PAC: " + proxy.value;
  }
  return "n/a";
}

function switchProxy(proxy) {
  let config = {mode: proxy.mode};
  switch (proxy.mode) {
    case "direct":
      break;
    case "system":
      break;
    case "auto_detect":
      // downloads a PAC script at http://wpad/wpad.dat
      break;
    case "fixed_servers":
      config.rules = {
        singleProxy: parseURL(proxy.value)
      };
      break;
    case "pac_script":
      config.pacScript = {
        url: proxy.value,
        mandatory: true  // do not fallback to direct if invalid PAC script
      };
      break;
    case "pac_script_data":
      config.mode = "pac_script";
      config.pacScript = {
        data: proxy.data,
        mandatory: true  // do not fallback to direct if invalid PAC script
      };
      break;
    default:
      throw "unexpected mode: " + proxy.mode;
  }
  switch (proxy.mode) {
    case "direct":
    case "system":
    case "auto_detect":
      chrome.action.setIcon({path: "icon24-grey.png"});
      break;
    default:
      chrome.action.setIcon({path: "icon24.png"});
  }
  chrome.proxy.settings.set({value: config, scope: "regular"}, function() {});
}

const urlRE = new RegExp("^(?<scheme>[^:]+?)://(?<host>.*?):(?<port>[0-9]+)$");

function parseURL(url) {
  let m = url.match(urlRE);
  if (!m) {
    return {}
  }
  return {
    scheme: m.groups.scheme,
    host: m.groups.host,
    port: parseInt(m.groups.port)
  }
}

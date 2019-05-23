document.addEventListener("DOMContentLoaded", init, false);

async function init() {
  let settings = await loadSettings();
  for (let i = 0; i < settings.length; i++) {
    tableAdd(settings[i]);
  }
  document.getElementById("mode").onchange = changeMode;
  changeMode();
  document.getElementById("add").onclick = addProxy;
}

function changeMode() {
  let select = document.getElementById("mode");
  let mode = select[select.selectedIndex].value;
  let container = document.getElementById("container");
  while (container.firstChild) container.removeChild(container.firstChild);
  switch (mode) {
    case "fixed_servers":
    case "pac_script":
      container.appendChild(document.createTextNode("URL: "));
      let input = document.createElement("input");
      input.id = "value";
      input.type = "text";
      input.size = 40;
      container.appendChild(input);
      break;
    case "pac_script_data":
      container.appendChild(document.createTextNode("Name: "));
      let name = document.createElement("input");
      name.id = "value";
      name.type = "text";
      name.size = 32;
      container.appendChild(name);
      container.appendChild(document.createElement("br"));
      let textarea = document.createElement("textarea");
      textarea.id = "data";
      textarea.rows = 2;
      textarea.cols = 40;
      container.appendChild(textarea);
      break;
    default:
      throw "unexpected mode: " + proxy.mode;
  }
}

function addProxy(settings) {
  let mode = document.getElementById("mode");
  let value = document.getElementById("value");
  let data = document.getElementById("data");
  let proxy = {
    mode: mode.value,
    value: value.value,
  };
  value.value = "";
  if (proxy.mode === "pac_script_data") {
    proxy.data = data.value;
    data.value = "";
  }
  tableAdd(proxy);
  save();
}

function tableAdd(proxy) {
  let tbody = document.getElementById("list");
  let tr = document.createElement("tr");

  let td = document.createElement("td");
  td.innerText = friendlyMode(proxy.mode);
  td.setAttribute("data-mode", proxy.mode);
  tr.appendChild(td);
  
  td = document.createElement("td");
  td.innerText = proxy.value;
  td.setAttribute("data-value", proxy.value);
  if (proxy.mode === "pac_script_data") {
    td.setAttribute("data-pac", proxy.data);
  }
  tr.appendChild(td);
  
  td = document.createElement("td");
  let up = document.createElement("input");
  up.type = "button";
  up.value = "^";
  up.onclick = function() {
    let list = document.getElementById("list");
    let before = Array.prototype.slice.call(list.children).indexOf(tr) - 1;
    // Keep Direct/System/Auto Detect at the top.
    if (before < 3) before = 3;
    list.insertBefore(tr, list.children[before]);
    save();
  };
  td.appendChild(up);
  let del = document.createElement("input");
  del.type = "button";
  del.value = "delete";
  del.onclick = function() {
    tbody.removeChild(tr);
    save();
  };
  td.appendChild(del);
  let down = document.createElement("input");
  down.type = "button";
  down.value = "v";
  down.onclick = function() {
    let list = document.getElementById("list");
    let after = Array.prototype.slice.call(list.children).indexOf(tr) + 1;
    // Keep the form to add at the bottom.
    if (after >= list.children.length - 1) after = list.children.length - 2;
    list.insertBefore(tr, list.children[after].nextSibling);
    save();
  };
  td.appendChild(down);
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
      return "Fixed server";
    case "pac_script":
      return "PAC URL";
    case "pac_script_data":
      return "PAC script";
  }
  return "n/a";
}

function save() {
  let settings = [];
  let trs = document.getElementById("list").children;
  for (let i = 0; i < trs.length; i++) {
    let tds = trs[i].children;
    if (tds.length < 2) continue;
    let mode = tds[0].getAttribute("data-mode");
    if (!mode) continue;
    let value = tds[1].getAttribute("data-value");
    let proxy = {mode: mode, value: value};
    if (mode === "pac_script_data") {
      proxy.data = tds[1].getAttribute("data-pac");
    }
    settings.push(proxy);
  }
  saveSettings(settings);
}

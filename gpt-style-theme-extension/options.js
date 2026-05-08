const STORAGE_KEY = "gptGrayThemeSettings";

const DEFAULTS = {
  enabled: true,
  bg: "#1f2328",
  panel: "#262b31",
  text: "#cfd6dd",
  muted: "#aab4be",
  border: "#343b44",
  link: "#8fb7ff",
  codeTheme: "nord"
};

const CODE_THEME_OPTIONS = [
  { value: "github-dark", label: "GitHub Dark" },
  { value: "github-dark-dimmed", label: "GitHub Dark Dimmed" },
  { value: "github-dark-high-contrast", label: "GitHub Dark High Contrast" },
  { value: "github", label: "GitHub (Light)" },
  { value: "github-light-high-contrast", label: "GitHub Light High Contrast" },
  { value: "atom-one-dark", label: "Atom One Dark" },
  { value: "atom-one-light", label: "Atom One Light" },
  { value: "one-dark-pro", label: "One Dark Pro" },
  { value: "dracula", label: "Dracula" },
  { value: "nord", label: "Nord" },
  { value: "tokyo-night", label: "Tokyo Night" },
  { value: "tokyo-night-storm", label: "Tokyo Night Storm" },
  { value: "tokyo-night-day", label: "Tokyo Night Day" },
  { value: "gruvbox-dark", label: "Gruvbox Dark" },
  { value: "gruvbox-light", label: "Gruvbox Light" },
  { value: "gruvbox-material-dark", label: "Gruvbox Material Dark" },
  { value: "gruvbox-material-light", label: "Gruvbox Material Light" },
  { value: "solarized-dark", label: "Solarized Dark" },
  { value: "solarized-light", label: "Solarized Light" },
  { value: "solarized-osaka", label: "Solarized Osaka" },
  { value: "material-ocean", label: "Material Ocean" },
  { value: "catppuccin-mocha", label: "Catppuccin Mocha" },
  { value: "catppuccin-latte", label: "Catppuccin Latte" },
  { value: "vscode-dark", label: "VS Code Dark" },
  { value: "vscode-light", label: "VS Code Light" },
  { value: "monokai", label: "Monokai" },
  { value: "monokai-sublime", label: "Monokai Sublime" },
  { value: "night-owl", label: "Night Owl" },
  { value: "palenight", label: "Palenight" },
  { value: "ayu-dark", label: "Ayu Dark" },
  { value: "ayu-mirage", label: "Ayu Mirage" },
  { value: "ayu-light", label: "Ayu Light" },
  { value: "tomorrow-night", label: "Tomorrow Night" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "zenburn", label: "Zenburn" },
  { value: "xcode", label: "Xcode" },
  { value: "darcula", label: "Darcula" },
  { value: "cobalt", label: "Cobalt" },
  { value: "stackoverflow-dark", label: "Stack Overflow Dark" },
  { value: "stackoverflow-light", label: "Stack Overflow Light" }
];

function $(id) {
  return document.getElementById(id);
}

function setStatus(text) {
  const el = $("status");
  el.textContent = text;
  if (!text) return;
  window.clearTimeout(setStatus._t);
  setStatus._t = window.setTimeout(() => (el.textContent = ""), 1200);
}

function setDisabled(disabled) {
  for (const id of [
    "enabled",
    "bg",
    "panel",
    "text",
    "muted",
    "border",
    "link",
    "codeTheme",
    "reset"
  ]) {
    const el = $(id);
    if (el) el.disabled = disabled;
  }
}

function ensureThemeOptions() {
  const select = $("codeTheme");
  if (!select) return;
  if (select.options.length) return;
  for (const opt of CODE_THEME_OPTIONS) {
    const el = document.createElement("option");
    el.value = opt.value;
    el.textContent = opt.label;
    select.appendChild(el);
  }
}

function ensureExtensionContext() {
  const hasChromeStorage =
    typeof chrome !== "undefined" &&
    chrome &&
    chrome.storage &&
    chrome.storage.sync &&
    typeof chrome.storage.sync.get === "function";

  if (hasChromeStorage) return true;

  setDisabled(true);
  setStatus("請從 Chrome/Edge 的「擴充套件選項」開啟此頁（直接用檔案方式開會是白畫面）");
  return false;
}

async function load() {
  if (!ensureExtensionContext()) return;
  ensureThemeOptions();
  const stored = await chrome.storage.sync.get(STORAGE_KEY);
  const settings = { ...DEFAULTS, ...(stored[STORAGE_KEY] || {}) };

  $("enabled").checked = Boolean(settings.enabled);
  $("bg").value = settings.bg;
  $("panel").value = settings.panel;
  $("text").value = settings.text;
  $("muted").value = settings.muted;
  $("border").value = settings.border;
  $("link").value = settings.link;
  $("codeTheme").value = String(settings.codeTheme || DEFAULTS.codeTheme);
}

async function save(partial) {
  if (!ensureExtensionContext()) return;
  const stored = await chrome.storage.sync.get(STORAGE_KEY);
  const current = { ...DEFAULTS, ...(stored[STORAGE_KEY] || {}) };
  const next = { ...current, ...partial };
  await chrome.storage.sync.set({ [STORAGE_KEY]: next });
  setStatus("已儲存");
}

function bind() {
  if (!ensureExtensionContext()) return;
  ensureThemeOptions();
  $("enabled").addEventListener("change", (e) => save({ enabled: e.target.checked }));

  for (const id of ["bg", "panel", "text", "muted", "border", "link"]) {
    $(id).addEventListener("input", (e) => save({ [id]: e.target.value }));
  }

  $("codeTheme").addEventListener("change", (e) => save({ codeTheme: e.target.value }));

  $("reset").addEventListener("click", () => save({ ...DEFAULTS }));
}

load();
bind();

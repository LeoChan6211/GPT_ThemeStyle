(() => {
  const g = (globalThis.GPTGT = globalThis.GPTGT || {});

  g.STORAGE_KEY = "gptGrayThemeSettings";
  g.STYLE_ID = "gpt-gray-theme-style";

  g.DEFAULTS = {
    enabled: true,
    bg: "#1f2328",
    panel: "#262b31",
    text: "#cfd6dd",
    muted: "#aab4be",
    border: "#343b44",
    link: "#8fb7ff",
    codeTheme: "nord"
  };

  const clampNumber = (value, min, max, fallback) => {
    const num = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(num)) return fallback;
    return Math.min(max, Math.max(min, num));
  };

  const clampChannel = (value) => Math.max(0, Math.min(255, Math.round(value)));

  const parseColorToRgb = (value, fallback = { r: 207, g: 214, b: 221 }) => {
    const raw = String(value || "").trim();
    if (!raw) return fallback;
    const hex = raw.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
    if (hex) {
      const normalized =
        hex[1].length === 3
          ? hex[1]
              .split("")
              .map((char) => char + char)
              .join("")
          : hex[1];
      return {
        r: Number.parseInt(normalized.slice(0, 2), 16),
        g: Number.parseInt(normalized.slice(2, 4), 16),
        b: Number.parseInt(normalized.slice(4, 6), 16)
      };
    }
    const rgb = raw.match(/^rgba?\(([^)]+)\)$/i);
    if (rgb) {
      const parts = rgb[1].split(",").map((part) => Number.parseFloat(part.trim()));
      if (parts.length >= 3 && parts.slice(0, 3).every((part) => Number.isFinite(part))) {
        return {
          r: clampChannel(parts[0]),
          g: clampChannel(parts[1]),
          b: clampChannel(parts[2])
        };
      }
    }
    return fallback;
  };

  const rgbToCss = ({ r, g, b }) => `rgb(${clampChannel(r)}, ${clampChannel(g)}, ${clampChannel(b)})`;

  const complementaryColor = (color) => {
    const rgb = parseColorToRgb(color);
    return { r: 255 - rgb.r, g: 255 - rgb.g, b: 255 - rgb.b };
  };

  const mixColors = (base, target, ratio = 0.3) => {
    const from = parseColorToRgb(base);
    const to = parseColorToRgb(target);
    const weight = Math.max(0, Math.min(1, ratio));
    return {
      r: from.r + (to.r - from.r) * weight,
      g: from.g + (to.g - from.g) * weight,
      b: from.b + (to.b - from.b) * weight
    };
  };

  g.normalizeSettings = (raw) => {
    const settings = { ...g.DEFAULTS, ...(raw || {}) };
    settings.enabled = Boolean(settings.enabled);
    settings.codeTheme = String(settings.codeTheme || g.DEFAULTS.codeTheme);
    settings.chatTextComplement = rgbToCss(complementaryColor(settings.bg));
    settings.chatMutedComplement = rgbToCss(mixColors(settings.chatTextComplement, settings.bg, 0.45));
    settings.inputTextComplement = rgbToCss(complementaryColor(settings.panel));
    settings.inputMutedComplement = rgbToCss(mixColors(settings.inputTextComplement, settings.panel, 0.45));
    return settings;
  };

 g.buildCss = (settings) => `
 :root{
  --gptgt-bg: ${settings.bg};
  --gptgt-panel: ${settings.panel};
  --gptgt-text: ${settings.text};
  --gptgt-muted: ${settings.muted};
  --gptgt-border: ${settings.border};
  --gptgt-link: ${settings.link};
  --gptgt-chat-text: ${settings.chatTextComplement};
  --gptgt-chat-muted: ${settings.chatMutedComplement};
  --gptgt-input-text: ${settings.inputTextComplement};
  --gptgt-input-muted: ${settings.inputMutedComplement};
  --gptgt-chat-heading: ${settings.chatTextComplement};
  --gptgt-chat-heading-live: ${settings.chatTextComplement};
  --gptgt-input-text-live: ${settings.inputTextComplement};
  --gptgt-input-muted-live: ${settings.inputMutedComplement};
}

 html, body {
   background: var(--gptgt-bg) !important;
   color: var(--gptgt-text) !important;
 }

 /* Composer popup is managed by launcher.js via inline styles on the real composer container.
    Keep CSS here minimal to avoid fighting ChatGPT layout. */

 /* Debug overlay (toggle via Ctrl+Alt+D). */
 html.gptgt-debug::before{
   content: "GPTGT DEBUG (Ctrl+Alt+D)";
   position: fixed;
   left: 10px;
   bottom: 10px;
   z-index: 2147483646;
   padding: 6px 10px;
   font: 12px/1.2 ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
   background: rgba(0,0,0,0.6);
   color: #fff;
   border: 1px solid rgba(255,255,255,0.25);
   border-radius: 10px;
   pointer-events: none;
 }
 html.gptgt-debug :where(#thread-bottom-container, form[data-type='unified-composer'], [data-testid*="composer"], .gptgt-composer){
   outline: 2px solid rgba(255, 0, 153, 0.75) !important;
   outline-offset: 2px !important;
 }
 
:where(#thread-bottom-container, form[data-type='unified-composer'], [data-testid*="composer"]) {
  /* Avoid unintended animations/offsets from site styles when we toggle to fixed. */
  transform: none !important;
}

/* Keep viewport baseline stable across init/chat pages (avoid horizontal scrollbar lift). */
html, body {
  overflow-x: hidden !important;
}
 
/* Minimal composer popup behavior: launcher.js applies .gptgt-composer to the detected composer panel. */
html.gptgt-has-launcher .gptgt-composer {
  isolation: isolate !important;
  contain: paint !important;
  will-change: opacity, filter !important;
}
html.gptgt-has-launcher.gptgt-ready:not(.gptgt-open) .gptgt-composer {
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
  transform: none !important;
  translate: none !important;
  filter: none !important;
}
/* When open, keep it visible; position is handled via inline styles for accuracy. */
html.gptgt-has-launcher.gptgt-open .gptgt-composer {
  opacity: 1 !important;
  visibility: visible !important;
  pointer-events: auto !important;
  transform: none !important;
  translate: none !important;
  --thread-component-gap: 0px !important;
}
html.gptgt-has-launcher[data-gptgt-chat="0"] #gptgt-chat-launcher {
  display: none !important;
}
html.gptgt-has-launcher .gptgt-composer:is(#thread-bottom),
html.gptgt-has-launcher .gptgt-composer #thread-bottom {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
  min-height: 0 !important;
  max-height: none !important;
  height: auto !important;
  flex: none !important;
}
html.gptgt-has-launcher .gptgt-composer:is(form[data-type='unified-composer']),
html.gptgt-has-launcher .gptgt-composer form[data-type='unified-composer'] {
  margin-bottom: 0 !important;
  min-height: 0 !important;
  max-height: none !important;
  height: auto !important;
  flex: none !important;
}

  /* Normalize inner bottom spacing so init/chat states share the same baseline height. */
  html.gptgt-has-launcher .gptgt-composer [class*="thread-component-gap"] {
    margin-bottom: 0 !important;
  }

  html.gptgt-has-launcher .gptgt-composer :where(
    .composer-parent,
    .wcDTda_prosemirror-parent,
    [data-type='unified-composer'],
    #thread-bottom,
    #thread-bottom > div
  ) {
    align-self: auto !important;
    min-height: 0 !important;
    max-height: none !important;
  }

  /* Floating effect with width/depth while preserving original white solid composer color. */
  html.gptgt-has-launcher.gptgt-open .gptgt-composer [data-composer-surface="true"] {
    box-shadow:
      0 14px 34px rgba(0, 0, 0, 0.26),
      0 28px 72px rgba(38, 80, 180, 0.18),
      0 2px 8px rgba(0, 0, 0, 0.14) !important;
  }
  html.gptgt-has-launcher.gptgt-open .gptgt-composer [data-composer-surface="true"]::after {
    content: "" !important;
    position: absolute !important;
    left: 12% !important;
    right: 12% !important;
    bottom: -14px !important;
    height: 26px !important;
    border-radius: 999px !important;
    background: radial-gradient(ellipse at center 110%, rgba(120, 165, 255, 0.30) 0%, rgba(120, 165, 255, 0) 75%) !important;
    filter: blur(10px) !important;
    pointer-events: none !important;
    z-index: -1 !important;
  }
  /* Outer glow/shadow on the launcher-managed container (not clipped by inner overflow). */
  html.gptgt-has-launcher.gptgt-open .gptgt-composer {
    filter: drop-shadow(0 18px 36px rgba(0, 0, 0, 0.34)) drop-shadow(0 26px 68px rgba(52, 110, 255, 0.22)) !important;
  }
  html.gptgt-has-launcher.gptgt-open .gptgt-composer::after {
    content: "" !important;
    position: absolute !important;
    left: 7% !important;
    right: 7% !important;
    bottom: -18px !important;
    height: 30px !important;
    border-radius: 999px !important;
    background: radial-gradient(ellipse at center 110%, rgba(95, 145, 255, 0.30) 0%, rgba(95, 145, 255, 0) 74%) !important;
    filter: blur(12px) !important;
    pointer-events: none !important;
    z-index: -1 !important;
  }
 /* IMPORTANT: Do not hide children by assuming a specific id (ChatGPT frequently changes DOM).
    If we hide everything here, the popup can appear to "stop working" after a rerender. */
 html.gptgt-has-launcher.gptgt-open #gptgt-chat-launcher {
   opacity: 0 !important;
   visibility: hidden !important;
   pointer-events: none !important;
  }

/* Make ChatGPT's top/bottom bars transparent so they don't cover content. */
header#page-header,
footer,
[role="contentinfo"],
#thread-bottom-container,
#thread-bottom,
[data-testid*="composer"],
[data-testid*="thread-bottom"]{
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
}

:where(
  #thread-bottom-container,
  #thread-bottom,
  [data-testid*="composer"],
  [data-testid*="thread-bottom"]
)::before,
:where(
  #thread-bottom-container,
  #thread-bottom,
  [data-testid*="composer"],
  [data-testid*="thread-bottom"]
)::after{
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

/* ChatGPT sometimes adds an extra wrapper under the composer with a white/gradient fill.
   Clear only the underlay wrappers, not the actual input surface itself. */
:where(
  #thread-bottom-container,
  #thread-bottom,
  [data-testid*="composer"],
  [data-testid*="thread-bottom"]
) > :not(form):not([data-type='unified-composer']) {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

/* Re-apply visible floating depth after blanket resets above. */
html.gptgt-has-launcher.gptgt-open .gptgt-composer [data-composer-surface="true"]{
  box-shadow:
    0 22px 52px rgba(0, 0, 0, 0.55),
    0 44px 106px rgba(52, 108, 255, 0.34),
    0 6px 16px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.55) !important;
}

html.gptgt-has-launcher.gptgt-open .gptgt-composer::after{
  content: "" !important;
  position: absolute !important;
  left: 6px !important;
  right: 6px !important;
  bottom: -6px !important;
  height: 12px !important;
  background: radial-gradient(ellipse at center 110%, rgba(235, 240, 245, 0.30) 0%, rgba(235, 240, 245, 0) 32%) !important;
  filter: blur(3px) !important;
  pointer-events: none !important;
  z-index: -1 !important;
}

/* Remove ChatGPT inner composer hard cap (max-h-52 / max-h-[max(30svh,5rem)]). */
html.gptgt-has-launcher .gptgt-composer .wcDTda_prosemirror-parent{
  max-height: min(55vh, 750px) !important;
  overflow-y: auto !important;
}

main, [role="main"] {
  background: var(--gptgt-bg) !important;
  color: var(--gptgt-text) !important;
}

:where(.markdown, .prose, [data-message-author-role]) {
  color: var(--gptgt-text) !important;
}

:where(.markdown, .prose, [data-message-author-role]) :is(p, li, span, strong, b, em, h1, h2, h3, h4, h5, h6):not(pre *) {
  color: inherit !important;
}

:where(.markdown, .prose, [data-message-author-role]) :is(h1, h2, h3, h4, h5, h6, strong, b):not(pre *) {
  color: var(--gptgt-chat-heading-live, var(--gptgt-chat-heading)) !important;
}

:where(.markdown, .prose, [data-message-author-role]) :is(small, blockquote, figcaption):not(pre *) {
  color: var(--gptgt-muted) !important;
}

a { color: var(--gptgt-link) !important; }

pre, code { border-color: var(--gptgt-border) !important; }

 /* Floating launcher (bottom-right). */
 #gptgt-chat-launcher {
   position: fixed !important;
   right: -15px;
   bottom: -25px;
   transform: none;
   z-index: 2147483645;
   width: 150px;
   height: 150px;
   border-radius: 999px;
   border: 1px solid var(--gptgt-border);
   background: color-mix(in srgb, var(--gptgt-panel) 88%, #000 12%);
   color: var(--gptgt-text);
   display: grid;
   place-items: center;
   cursor: pointer;
   pointer-events: auto !important;
   transition: transform 140ms ease, border-color 140ms ease, opacity 140ms ease;
   opacity: 0.60;
 }

 /* Small status toast (used when composer cannot be found). */
 #gptgt-status{
   position: fixed;
   left: 50%;
   bottom: 18px;
   transform: translateX(-50%);
   z-index: 2147483646;
   padding: 10px 14px;
   border-radius: 14px;
   background: rgba(0, 0, 0, 0.68);
   color: #fff;
   font: 13px/1.2 system-ui, -apple-system, Segoe UI, Roboto, "Noto Sans", Arial, sans-serif;
   border: 1px solid rgba(255,255,255,0.22);
   opacity: 0;
   pointer-events: none;
   transition: opacity 140ms ease;
 }
#gptgt-chat-launcher:hover {
  opacity: 1;
  border-color: color-mix(in srgb, var(--gptgt-link) 40%, var(--gptgt-border) 60%);
  transform: translateY(-1px);
}
#gptgt-chat-launcher svg {
  width: 64px;
  height: 64px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

::selection {
  background: color-mix(in srgb, var(--gptgt-link) 35%, var(--gptgt-bg) 65%) !important;
}
`;

  g.upsertStyle = (cssText) => {
    let el = document.getElementById(g.STYLE_ID);
    if (!el) {
      el = document.createElement("style");
      el.id = g.STYLE_ID;
      document.documentElement.appendChild(el);
    }
    el.textContent = cssText;
  };

  g.removeStyle = () => {
    const el = document.getElementById(g.STYLE_ID);
    if (el) el.remove();
  };

  g.getSettings = async () => {
    const stored = await chrome.storage.sync.get(g.STORAGE_KEY);
    return g.normalizeSettings(stored[g.STORAGE_KEY]);
  };
})();

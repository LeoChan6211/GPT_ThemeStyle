(() => {
  const g = (globalThis.GPTGT = globalThis.GPTGT || {});

  const STYLE_ID = "gpt-gray-theme-cm-style";

  g.upsertCodeMirrorTheme = (themeKey) => {
    const preset =
      (g.CODE_THEME_PRESETS && g.CODE_THEME_PRESETS[String(themeKey || "").trim()]) ||
      (g.CODE_THEME_PRESETS && g.CODE_THEME_PRESETS[g.DEFAULTS?.codeTheme]) ||
      null;
    if (!preset) return;

    const cssText = `
:root{
  --gptgt-code-bg: ${preset.bg};
  --gptgt-code-fg: ${preset.fg};
  --gptgt-code-keyword: ${preset.keyword};
  --gptgt-code-func: ${preset.func};
  --gptgt-code-const: ${preset.constant};
  --gptgt-code-string: ${preset.string};
  --gptgt-code-number: ${preset.number};
  --gptgt-code-comment: ${preset.comment};
  --gptgt-code-type: ${preset.type};
}

/* ChatGPT code blocks are rendered by CodeMirror. Apply background/foreground to all relevant layers
   because ChatGPT may set background on nested wrappers (scroller/content/gutters). */
#code-block-viewer.cm-editor,
#code-block-viewer.cm-editor .cm-scroller,
#code-block-viewer.cm-editor .cm-content,
#code-block-viewer.cm-editor .cm-gutters,
#code-block-viewer.cm-editor .cm-gutter {
  background: var(--gptgt-code-bg) !important;
  background-color: var(--gptgt-code-bg) !important;
  color: var(--gptgt-code-fg) !important;
}

#code-block-viewer.cm-editor .cm-content {
  caret-color: var(--gptgt-code-fg) !important;
}

/* Token classes are generated (e.g. "ͼg"). We theme the most common ones observed on chatgpt.com. */
#code-block-viewer.cm-editor .ͼg { color: var(--gptgt-code-keyword) !important; }
#code-block-viewer.cm-editor .ͼm { color: var(--gptgt-code-func) !important; }
#code-block-viewer.cm-editor .ͼk { color: var(--gptgt-code-string) !important; }
#code-block-viewer.cm-editor .ͼj { color: var(--gptgt-code-number) !important; }
#code-block-viewer.cm-editor .ͼe { color: var(--gptgt-code-comment) !important; }
`;

    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      document.documentElement.appendChild(el);
    }
    el.textContent = cssText;
  };

  g.removeCodeMirrorTheme = () => {
    const el = document.getElementById(STYLE_ID);
    if (el) el.remove();
  };
})();

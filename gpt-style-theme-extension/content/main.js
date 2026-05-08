(() => {
  const g = (globalThis.GPTGT = globalThis.GPTGT || {});
  g.BUILD_TAG = "split-runtime-2026-05-08b";

  // Stability-first: only theming + code color overrides, plus our optional launcher/disclaimer helpers.
  const applyNow = async () => {
    const settings = await g.getSettings();
    document.documentElement.setAttribute("data-gptgt-build", g.BUILD_TAG);
    if (!settings.enabled) {
      g.removeStyle();
      g.removeCodeMirrorTheme();
      g.removeLauncher?.();
      g.stopDisclaimerHider?.();
      return;
    }
    document.documentElement.classList.add("gptgt-ready");
    g.upsertStyle(g.buildCss(settings));
    g.upsertCodeMirrorTheme(settings.codeTheme);
    g.ensureLauncher?.();
    g.startDisclaimerHider?.();
  };

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") return;
    if (!changes[g.STORAGE_KEY]) return;
    applyNow();
  });

  applyNow();
})();

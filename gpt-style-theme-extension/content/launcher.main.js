(function () {
  const g = (globalThis.GPTGT = globalThis.GPTGT || {});
  const detect = g.launcherDetect;
  const state = g.launcherState;
  const view = g.launcherView;

  if (!detect || !state || !view) {
    throw new Error("Launcher modules failed to load in the expected order.");
  }

  g.ensureLauncher = () => state.ensureLauncher();
  g.removeLauncher = () => state.removeLauncher();
  g.openComposer = () => state.open("manual");
  g.debugDump = () => {
    const launcher = document.getElementById(view.UI.launcherId);
    const panel = detect.findComposerPanel();
    const input = detect.findComposerInput();
    return {
      url: location.href,
      hasLauncher: Boolean(launcher),
      launcherRect: detect.rectStr(launcher),
      rootClasses: {
        ready: document.documentElement.classList.contains(view.UI.readyClass),
        open: document.documentElement.classList.contains(view.UI.rootOpenClass),
        hasLauncher: document.documentElement.classList.contains(view.UI.hasLauncherClass)
      },
      composer: {
        panelFound: Boolean(panel),
        panelTag: panel?.tagName || null,
        panelId: panel?.id || null,
        panelTestId: panel?.getAttribute?.("data-testid") || null,
        panelRect: detect.rectStr(panel)
      },
      input: {
        found: Boolean(input),
        tag: input?.tagName || null,
        id: input?.id || null,
        testId: input?.getAttribute?.("data-testid") || null,
        rect: detect.rectStr(input)
      },
      runtime: {
        isOpen: state.runtime.isOpen,
        reopenOnlyFromLauncher: state.runtime.reopenOnlyFromLauncher,
        missingSince: state.runtime.missingSince,
        initUnlockAfterReply: state.runtime.initUnlockAfterReply,
        launcherPointerInside: state.runtime.launcherPointerInside
      }
    };
  };
})();

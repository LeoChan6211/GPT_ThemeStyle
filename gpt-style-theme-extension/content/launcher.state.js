(function () {
  const g = (globalThis.GPTGT = globalThis.GPTGT || {});
  const detect = g.launcherDetect;
  const view = g.launcherView;

  const UI = view.UI;
  const AUTO_CLOSE_GUARD_MS = 1100;
  const AUTO_CLOSE_CONFIRMATIONS = 2;
  const AUTO_CLOSE_CONFIRM_WINDOW_MS = 1400;

  const runtime = {
    closeTimer: null,
    idleMs: 5000,
    recordingIdleMs: 5000,
    composerObserver: null,
    launcherObserver: null,
    refreshFrame: 0,
    isOpen: false,
    launcherPointerInside: false,
    reopenOnlyFromLauncher: false,
    lastComposerEl: null,
    currentUrl: "",
    syncTimer: null,
    openPromise: null,
    openToken: 0,
    launcherOpenUntil: 0,
    missingSince: 0,
    initUnlockAfterReply: false,
    recordingLockUntil: 0,
    autoCloseGuardUntil: 0,
    autoCloseVotes: 0,
    autoCloseReason: "",
    autoCloseAt: 0,
    documentBindingsAdded: false,
    handlers: {}
  };

  const refreshRecordingLock = (panel = detect.findComposerPanel()) => {
    if (detect.isRecordingActive(panel)) {
      runtime.recordingLockUntil = Date.now() + 2200;
    }
  };

  const isRecordingLocked = () => Date.now() < runtime.recordingLockUntil;
  const beginAutoCloseGuard = (ms = AUTO_CLOSE_GUARD_MS) => {
    runtime.autoCloseGuardUntil = Math.max(runtime.autoCloseGuardUntil, Date.now() + ms);
  };
  const isAutoCloseGuardActive = () => Date.now() < runtime.autoCloseGuardUntil;
  const beginLauncherOpenGuard = (ms = 1800) => {
    runtime.launcherOpenUntil = Math.max(runtime.launcherOpenUntil, Date.now() + ms);
  };
  const isLauncherOpenGuardActive = () => Date.now() < runtime.launcherOpenUntil;
  const resetAutoCloseVotes = () => {
    runtime.autoCloseVotes = 0;
    runtime.autoCloseReason = "";
    runtime.autoCloseAt = 0;
  };
  const registerAutoCloseVote = (reason) => {
    const now = Date.now();
    if (runtime.autoCloseReason === reason && now - runtime.autoCloseAt <= AUTO_CLOSE_CONFIRM_WINDOW_MS) {
      runtime.autoCloseVotes += 1;
    } else {
      runtime.autoCloseVotes = 1;
      runtime.autoCloseReason = reason;
    }
    runtime.autoCloseAt = now;
    return runtime.autoCloseVotes;
  };

  const shouldKeepComposerOpen = (panel = detect.findComposerPanel()) => {
    if (isRecordingLocked()) return true;
    if (!(panel instanceof HTMLElement)) return false;
    if (panel.matches?.(":hover")) return true;
    if (detect.hasCaretInComposer(panel)) return true;
    if (detect.hasPendingComposerDraft(panel)) return true;
    if (detect.hasComposerAttachments(panel)) return true;
    return false;
  };

  const shouldKeepComposerTransientlyOpen = () => {
    if (isAutoCloseGuardActive()) return true;
    if (isLauncherOpenGuardActive()) return true;
    if (runtime.openPromise) return true;
    if (runtime.launcherPointerInside) return true;
    const btn = document.getElementById(UI.launcherId);
    if (btn instanceof HTMLElement) {
      if (btn.matches?.(":hover")) return true;
      if (btn.matches?.(":focus-visible")) return true;
      if (document.activeElement === btn) return true;
    }
    return false;
  };

  const shouldAutoCollapse = () => {
    if (detect.isInitLanding()) return false;
    const panel = detect.findComposerPanel();
    if (!(panel instanceof HTMLElement)) return false;
    return !shouldKeepComposerOpen(panel);
  };

  const canAutoClose = (panel = detect.findComposerPanel(), options = {}) => {
    if (options.force) return true;
    if (detect.isInitLanding()) return false;
    if (isRecordingLocked()) return false;
    if (runtime.openPromise) return false;
    if (isAutoCloseGuardActive()) return false;
    if (shouldKeepComposerOpen(panel)) return false;
    const composer = detect.findComposer();
    if ((composer && composer.matches?.(":focus-within")) || (panel && panel.matches?.(":focus-within"))) return false;
    return true;
  };

  const maybeReenterReady = (root = document) => {
    let shouldRefresh = false;
    if (runtime.currentUrl !== location.href) {
      runtime.currentUrl = location.href;
      shouldRefresh = true;
    }

    const candidate =
      (root instanceof HTMLElement && root.matches?.("#thread-bottom-container,[data-testid*='composer'],#thread-bottom") && root) ||
      root.querySelector?.("#thread-bottom-container,[data-testid*='composer'],#thread-bottom") ||
      document.querySelector?.("#thread-bottom-container,[data-testid*='composer'],#thread-bottom");

    if (candidate instanceof HTMLElement) {
      const panel = detect.findComposerPanel();
      if (!(panel instanceof HTMLElement) || panel !== runtime.lastComposerEl) shouldRefresh = true;
    }

    if (shouldRefresh) {
      view.prepareComposerForReadyState(runtime);
      if (runtime.isOpen) view.setComposerVisible(true, { instant: true });
    }
  };

  const waitForComposerPanel = async (tries = 4, stepMs = 110) => {
    for (let i = 0; i < tries; i += 1) {
      const panel = detect.findComposerPanel();
      if (panel instanceof HTMLElement && !detect.hasChatMessageContent(panel) && !panel.matches?.("main,[role='main'],body,html,#__next,#root")) {
        const rect = panel.getBoundingClientRect?.();
        if (!rect || rect.width < 100 || rect.height < 16) {
          await new Promise((resolve) => window.setTimeout(resolve, stepMs));
          maybeReenterReady();
          continue;
        }
        if (!detect.isBottomRegion(panel)) {
          await new Promise((resolve) => window.setTimeout(resolve, stepMs));
          maybeReenterReady();
          continue;
        }
        return panel;
      }
      await new Promise((resolve) => window.setTimeout(resolve, stepMs));
      maybeReenterReady();
    }
    return null;
  };

  const waitForReadyComposer = async (tries = 8, stepMs = 120) => {
    for (let i = 0; i < tries; i += 1) {
      const panel = detect.findComposerPanel();
      const input = detect.findComposerInputRaw(panel);
      if (panel instanceof HTMLElement && input instanceof HTMLElement) {
        const panelRect = panel.getBoundingClientRect?.();
        if (panelRect && panelRect.width >= 120 && detect.isBottomRegion(panel)) {
          return { panel, input };
        }
      }
      await new Promise((resolve) => window.setTimeout(resolve, stepMs));
      maybeReenterReady();
      view.tagComposer();
    }
    return null;
  };

  const open = async (source = "launcher") => {
    if (source !== "launcher" && runtime.reopenOnlyFromLauncher && !detect.isInitLanding()) return false;
    if (source === "launcher") beginLauncherOpenGuard();
    if (runtime.openPromise) return runtime.openPromise;
    const token = ++runtime.openToken;
    runtime.openPromise = (async () => {
      for (const bad of document.querySelectorAll("form[data-type='unified-composer']")) {
        view.clearInjectedComposerStyles(bad);
      }
      await waitForComposerPanel(3, 90);
      if (token !== runtime.openToken) return false;
      view.prepareComposerForReadyState(runtime);
      window.clearTimeout(runtime.closeTimer);
      await waitForReadyComposer(8, 120);
      if (token !== runtime.openToken) return false;
      let ok = view.setComposerVisible(true);
      if (!ok) {
        const panel = detect.findComposerPanel();
        if (!(panel instanceof HTMLElement)) {
          view.setRootOpen(false);
          runtime.isOpen = false;
          view.showStatus("找不到輸入框（請重新整理）");
          return false;
        }
        view.normalizeComposerLayout(panel, { instant: true });
        panel.style.display = "block";
        panel.style.visibility = "visible";
        panel.style.opacity = "1";
        panel.style.pointerEvents = "auto";
        panel.style.transform = "none";
        panel.style.filter = "none";
        ok = true;
      }
      view.setRootOpen(true);
      runtime.isOpen = true;
      runtime.reopenOnlyFromLauncher = false;
      runtime.missingSince = 0;
      beginAutoCloseGuard();
      resetAutoCloseVotes();

      const panel = detect.findComposerPanel();
      if (panel instanceof HTMLElement) {
        const style = getComputedStyle(panel);
        if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
          panel.style.display = "block";
          panel.style.visibility = "visible";
          panel.style.opacity = "1";
          panel.style.pointerEvents = "auto";
          panel.style.transform = "none";
        }
      }

      const confirmPanelUsable = () => {
        const p = detect.findComposerPanel();
        if (!(p instanceof HTMLElement)) return false;
        const input = detect.findComposerInputRaw(p);
        if (!(input instanceof HTMLElement)) return false;
        const panelRect = p.getBoundingClientRect?.();
        if (!panelRect || panelRect.width < 100) return false;
        const inputRect = input.getBoundingClientRect?.();
        const inputStyle = getComputedStyle(input);
        if (!inputRect || inputRect.width < 100 || inputRect.height < 20) return false;
        if (inputStyle.display === "none" || inputStyle.visibility === "hidden" || inputStyle.opacity === "0") return false;
        return true;
      };

      if (!confirmPanelUsable()) {
        const p = detect.findComposerPanel();
        if (p instanceof HTMLElement) {
          p.style.display = "block";
          p.style.visibility = "visible";
          p.style.opacity = "1";
          p.style.pointerEvents = "auto";
        }
      }

      window.setTimeout(() => view.focusComposerInput(detect.findComposerPanel()), 30);
      return ok;
    })();
    try {
      return await runtime.openPromise;
    } finally {
      runtime.openPromise = null;
    }
  };

  const closeNow = () => {
    window.clearTimeout(runtime.closeTimer);
    view.setRootOpen(false);
    runtime.isOpen = false;
    runtime.missingSince = 0;
    resetAutoCloseVotes();
    view.setComposerVisible(false, { instant: false });
  };

  const lockClosedAfterSend = (ms = 2500) => {
    runtime.reopenOnlyFromLauncher = true;
    window.clearTimeout(runtime.closeTimer);
    runtime.closeTimer = window.setTimeout(() => closeNow(), ms);
  };

  const close = (reason = "auto", options = {}) => {
    const panel = detect.findComposerPanel();
    if (!canAutoClose(panel, options)) {
      window.clearTimeout(runtime.closeTimer);
      resetAutoCloseVotes();
      return false;
    }
    closeNow();
    return true;
  };

  const scheduleClose = (ms = runtime.idleMs, reason = "idle", options = {}) => {
    const panel = detect.findComposerPanel();
    if (!canAutoClose(panel, options)) {
      window.clearTimeout(runtime.closeTimer);
      resetAutoCloseVotes();
      return false;
    }
    const requireConfirmation = Boolean(options.requireConfirmation);
    if (requireConfirmation && registerAutoCloseVote(reason) < AUTO_CLOSE_CONFIRMATIONS) {
      window.clearTimeout(runtime.closeTimer);
      runtime.closeTimer = window.setTimeout(
        () => scheduleClose(Math.min(ms, 220), reason, options),
        Math.min(ms, 220)
      );
      return false;
    }
    const delayMs = detect.isRecordingActive(panel) ? Math.max(ms, runtime.recordingIdleMs) : ms;
    window.clearTimeout(runtime.closeTimer);
    runtime.closeTimer = window.setTimeout(() => close(reason, options), delayMs);
    return true;
  };

  const syncOpenState = () => {
    const btn = document.getElementById(UI.launcherId);
    document.documentElement.setAttribute("data-gptgt-chat", "1");
    refreshRecordingLock(detect.findComposerPanel());

    if (!runtime.initUnlockAfterReply && detect.hasAssistantReply()) {
      runtime.initUnlockAfterReply = true;
    }

    if (isRecordingLocked()) {
      view.setRootOpen(true);
      runtime.isOpen = true;
      view.setComposerVisible(true, { instant: true });
      if (btn instanceof HTMLElement) btn.style.display = "none";
      return;
    }

    if (detect.isInitLanding()) {
      const panel = detect.findComposerPanel();
      const usable = detect.hasUsableComposerPanel();
      const now = Date.now();

      if (usable) {
        runtime.missingSince = 0;
        const keepOpen = !runtime.initUnlockAfterReply || shouldKeepComposerOpen(panel) || shouldKeepComposerTransientlyOpen();
        if (keepOpen) {
          resetAutoCloseVotes();
          view.setRootOpen(true);
          runtime.isOpen = true;
          view.setComposerVisible(true, { instant: true });
          if (btn instanceof HTMLElement) btn.style.display = "none";
        } else {
          view.setRootOpen(false);
          runtime.isOpen = false;
          view.setComposerVisible(false, { instant: true });
          if (btn instanceof HTMLElement) btn.style.display = "";
        }
        return;
      }

      if (!runtime.missingSince) runtime.missingSince = now;
      const missingFor = now - runtime.missingSince;

      if (!runtime.openPromise) {
        runtime.reopenOnlyFromLauncher = false;
        void open("manual");
      }

      if (missingFor >= 1600) {
        view.setRootOpen(false);
        runtime.isOpen = false;
        if (btn instanceof HTMLElement) btn.style.display = "";
      } else if (btn instanceof HTMLElement) {
        btn.style.display = "none";
      }
      return;
    }

    if (runtime.isOpen && !detect.isPanelActuallyVisible()) {
      runtime.isOpen = false;
      view.setRootOpen(false);
      if (btn instanceof HTMLElement) btn.style.display = "";
      return;
    }

    if (btn instanceof HTMLElement) btn.style.display = "";

    if (runtime.isOpen && shouldAutoCollapse()) {
      const panel = detect.findComposerPanel();
      if (shouldKeepComposerOpen(panel)) {
        window.clearTimeout(runtime.closeTimer);
        resetAutoCloseVotes();
        return;
      }
      if (detect.isRecordingActive(panel)) {
        scheduleClose(runtime.recordingIdleMs, "recording-idle", { requireConfirmation: true });
        return;
      }
      scheduleClose(180, "sync-collapse", { requireConfirmation: true });
      return;
    }

    resetAutoCloseVotes();
    const domOpen = document.documentElement.classList.contains(UI.rootOpenClass);
    if (!domOpen && !runtime.isOpen) {
      runtime.missingSince = 0;
      return;
    }
    if (runtime.openPromise) return;
    if (detect.hasUsableComposerPanel()) {
      runtime.missingSince = 0;
      return;
    }

    const now = Date.now();
    if (!runtime.missingSince) {
      runtime.missingSince = now;
      return;
    }
    if (now - runtime.missingSince < 1800) return;

    window.clearTimeout(runtime.closeTimer);
    view.setComposerVisible(false, { instant: true });
    runtime.isOpen = false;
    runtime.reopenOnlyFromLauncher = false;
    view.setRootOpen(false);
    runtime.missingSince = 0;
  };

  const scheduleRefresh = (root = document) => {
    if (runtime.refreshFrame) return;
    runtime.refreshFrame = window.requestAnimationFrame(() => {
      runtime.refreshFrame = 0;
      maybeReenterReady(root);
      view.tagComposer();
      syncOpenState();
    });
  };

  const ensureComposerObserver = () => {
    if (runtime.composerObserver) return;
    runtime.composerObserver = new MutationObserver((muts) => {
      const root = muts?.[0]?.target instanceof HTMLElement ? muts[0].target : document;
      scheduleRefresh(root);
    });
    runtime.composerObserver.observe(document.documentElement, { subtree: true, childList: true });
  };

  const ensureLauncherObserver = () => {
    if (runtime.launcherObserver) return;
    runtime.launcherObserver = new MutationObserver(() => {
      if (!document.getElementById(UI.launcherId)) ensureLauncher();
    });
    runtime.launcherObserver.observe(document.documentElement, { subtree: true, childList: true });
  };

  const bindDocumentHandlers = () => {
    if (runtime.documentBindingsAdded) return;

    runtime.handlers.onKeydown = (e) => {
      if (e.key !== "Enter") return;
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.closest(".gptgt-composer")) return;
      if (e.shiftKey || e.isComposing) return;
      lockClosedAfterSend(1200);
    };

    runtime.handlers.onSubmit = (e) => {
      const form = e.target;
      if (!(form instanceof HTMLElement)) return;
      if (!form.closest(".gptgt-composer")) return;
      lockClosedAfterSend(1200);
    };

    runtime.handlers.onInput = (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.closest(".gptgt-composer")) return;
      if (!runtime.isOpen) return;
      if (!shouldAutoCollapse()) return;
      scheduleClose(5000, "input-idle", { requireConfirmation: true });
    };

    runtime.handlers.onMouseOut = (e) => {
      if (isRecordingLocked()) return;
      const panel = detect.findComposerPanel();
      if (!panel) return;
      if (!panel.contains(e.target)) return;
      const related = e.relatedTarget;
      if (related && panel.contains(related)) return;
      if (runtime.reopenOnlyFromLauncher) {
        closeNow();
        return;
      }
      scheduleClose(runtime.idleMs, "panel-mouseout", { requireConfirmation: true });
    };

    runtime.handlers.onMouseOver = (e) => {
      refreshRecordingLock(detect.findComposerPanel());
      const panel = detect.findComposerPanel();
      if (!panel) return;
      if (!panel.contains(e.target)) return;
      window.clearTimeout(runtime.closeTimer);
    };

    document.addEventListener("keydown", runtime.handlers.onKeydown, true);
    document.addEventListener("submit", runtime.handlers.onSubmit, true);
    document.addEventListener("input", runtime.handlers.onInput, true);
    document.addEventListener("mouseout", runtime.handlers.onMouseOut, true);
    document.addEventListener("mouseover", runtime.handlers.onMouseOver, true);

    runtime.documentBindingsAdded = true;
  };

  const unbindDocumentHandlers = () => {
    if (!runtime.documentBindingsAdded) return;
    document.removeEventListener("keydown", runtime.handlers.onKeydown, true);
    document.removeEventListener("submit", runtime.handlers.onSubmit, true);
    document.removeEventListener("input", runtime.handlers.onInput, true);
    document.removeEventListener("mouseout", runtime.handlers.onMouseOut, true);
    document.removeEventListener("mouseover", runtime.handlers.onMouseOver, true);
    runtime.documentBindingsAdded = false;
  };

  const ensureLauncher = () => {
    let btn = document.getElementById(UI.launcherId);
    if (btn) return btn;

    document.documentElement.classList.add(UI.hasLauncherClass);
    document.documentElement.setAttribute("data-gptgt-chat", "1");
    view.prepareComposerForReadyState(runtime);
    ensureComposerObserver();
    view.setRootOpen(false);

    btn = document.createElement("button");
    btn.id = UI.launcherId;
    btn.type = "button";
    btn.setAttribute("aria-label", "Open chat input");
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.5 7.5c0-2 1.7-3.5 3.7-3.5h3.6c2 0 3.7 1.5 3.7 3.5v4.2c0 2-1.7 3.5-3.7 3.5H12l-3.5 3v-3H10.2c-2 0-3.7-1.5-3.7-3.5V7.5z"></path>
        <path d="M10 10.3h.01M12 10.3h.01M14 10.3h.01"></path>
      </svg>
    `;

    btn.addEventListener("mouseenter", () => {
      runtime.launcherPointerInside = true;
      beginLauncherOpenGuard();
      open();
    });
    btn.addEventListener("focus", () => {
      beginLauncherOpenGuard();
      open();
    });
    btn.addEventListener("mouseleave", () => {
      runtime.launcherPointerInside = false;
      scheduleClose(runtime.idleMs, "launcher-leave", { requireConfirmation: true });
    });
    btn.addEventListener("click", () => {
      beginLauncherOpenGuard();
      open();
    });
    btn.addEventListener("pointerenter", () => {
      runtime.launcherPointerInside = true;
      beginLauncherOpenGuard();
      open();
    });
    btn.addEventListener("pointerleave", () => {
      runtime.launcherPointerInside = false;
      scheduleClose(runtime.idleMs, "launcher-pointerleave", { requireConfirmation: true });
    });
    btn.addEventListener("pointerdown", () => {
      beginLauncherOpenGuard();
      open();
    });

    document.documentElement.appendChild(btn);
    ensureLauncherObserver();
    bindDocumentHandlers();
    if (!runtime.syncTimer) runtime.syncTimer = window.setInterval(syncOpenState, 900);
    btn.style.display = detect.isInitLanding() ? "none" : "";
    if (detect.isInitLanding()) void open("manual");

    return btn;
  };

  const removeLauncher = () => {
    window.clearTimeout(runtime.closeTimer);
    if (runtime.syncTimer) window.clearInterval(runtime.syncTimer);
    runtime.syncTimer = null;
    if (runtime.composerObserver) runtime.composerObserver.disconnect();
    runtime.composerObserver = null;
    if (runtime.launcherObserver) runtime.launcherObserver.disconnect();
    runtime.launcherObserver = null;
    unbindDocumentHandlers();
    const el = document.getElementById(UI.launcherId);
    if (el) el.remove();
    view.setRootOpen(false);
    runtime.isOpen = false;
    runtime.launcherPointerInside = false;
  };

  g.launcherState = {
    runtime,
    open,
    close,
    closeNow,
    scheduleClose,
    syncOpenState,
    ensureLauncher,
    removeLauncher
  };
})();

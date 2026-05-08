(function () {
  const g = (globalThis.GPTGT = globalThis.GPTGT || {});

  const normalizeText = (text) => String(text || "").replace(/\s+/g, " ").trim().toLowerCase();
  const hasConversationTurns = () =>
    Boolean(
      document.querySelector?.(
        "[data-message-author-role='user'],[data-message-author-role='assistant'],[data-turn='user'],[data-turn='assistant']"
      )
    );
  const isInitLanding = () => {
    const path = location.pathname || "";
    if (/^\/c\//.test(path)) return false;
    if (hasConversationTurns()) return false;
    return true;
  };

  const rectStr = (el) => {
    if (!(el instanceof HTMLElement)) return null;
    const r = el.getBoundingClientRect();
    return { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) };
  };

  const hasChatMessageContent = (el) => {
    if (!(el instanceof HTMLElement)) return false;
    return Boolean(el.querySelector?.("[data-message-author-role],article,.markdown,.prose"));
  };

  const hasAssistantReply = () =>
    Boolean(
      document.querySelector?.(
        "[data-message-author-role='assistant'],[data-message-author-role=\"assistant\"],main article[data-message-author-role='assistant']"
      )
    );

  const isBottomRegion = (el) => {
    if (!(el instanceof HTMLElement)) return false;
    const rect = el.getBoundingClientRect?.();
    if (!rect) return false;
    return rect.bottom > window.innerHeight * 0.7;
  };

  const isLikelyComposerInput = (el) => {
    if (!el || el.nodeType !== 1) return false;
    if (el.tagName === "TEXTAREA") return true;
    if (el.getAttribute("contenteditable") === "true" && (el.getAttribute("role") || "").toLowerCase() === "textbox") return true;
    if (el.getAttribute("contenteditable") === "true" && el.matches("[data-testid*='composer'],[data-testid*='prompt']")) return true;
    return false;
  };

  const isSafeComposerContainer = (el) => {
    if (!(el instanceof HTMLElement)) return false;
    if (el.matches("main,[role='main'],body,html,#__next,#root")) return false;
    if (hasChatMessageContent(el)) return false;
    const rect = el.getBoundingClientRect?.();
    if (!rect) return false;
    if (rect.width < 120 || rect.height < 20) return false;
    if (rect.height > 360) return false;
    if (!isBottomRegion(el)) return false;
    return true;
  };

  const findComposerInput = () => {
    const allInputs = Array.from(
      document.querySelectorAll("textarea,[contenteditable='true'][role='textbox'],[contenteditable='true'][data-testid*='composer']")
    ).filter(isLikelyComposerInput);
    if (allInputs.length === 0) return null;

    const scoreInput = (el) => {
      const ph = normalizeText(el.getAttribute?.("placeholder"));
      const aria = normalizeText(el.getAttribute?.("aria-label"));
      const testid = normalizeText(el.getAttribute?.("data-testid"));
      let score = 0;
      if (ph.includes("想問") || aria.includes("想問")) score += 6;
      if (ph.includes("message") || aria.includes("message")) score += 5;
      if (ph.includes("send a message") || aria.includes("send a message")) score += 6;
      if (testid.includes("composer") || testid.includes("prompt")) score += 4;
      if (el.id === "prompt-textarea") score += 8;

      const rect = el.getBoundingClientRect?.();
      if (rect) {
        const nearBottom = rect.bottom > window.innerHeight - 220;
        if (nearBottom) score += 4;
        if (rect.width > 280) score += 2;
        if (rect.height >= 24) score += 1;
      }
      return score;
    };

    return allInputs.map((el) => ({ el, score: scoreInput(el) })).sort((a, b) => b.score - a.score)[0].el;
  };

  const findComposerShell = (input = findComposerInput()) => {
    if (!(input instanceof HTMLElement)) {
      const fallbackCandidates = [
        document.querySelector("#thread-bottom-container"),
        document.querySelector("#thread-bottom"),
        document.querySelector("form[data-type='unified-composer']"),
        document.querySelector("[data-testid='composer-footer-actions']")
      ].filter(isSafeComposerContainer);
      if (fallbackCandidates.length === 0) return null;
      return fallbackCandidates[0];
    }

    const candidates = [
      input.closest("#thread-bottom-container"),
      input.closest("form"),
      input.closest("[role='form']"),
      input.closest("footer"),
      input.closest("[data-testid*='composer']")
    ].filter(isSafeComposerContainer);

    const scoreContainer = (el) => {
      let score = 0;
      const rect = el.getBoundingClientRect?.();
      if (rect) {
        if (rect.bottom > window.innerHeight - 40) score += 6;
        if (rect.width > window.innerWidth * 0.5) score += 3;
        if (rect.height < 240) score += 1;
      }
      if (el.querySelector?.("button")) score += 1;
      if (el.querySelector?.("svg")) score += 1;
      return score;
    };

    if (candidates.length > 0) {
      return candidates.map((el) => ({ el, score: scoreContainer(el) })).sort((a, b) => b.score - a.score)[0].el;
    }

    return input;
  };

  const findComposer = () => findComposerShell(findComposerInput());

  const getCanonicalComposerPanel = () => {
    const directBottom = document.querySelector("#thread-bottom-container");
    if (directBottom instanceof HTMLElement) return directBottom;
    return null;
  };

  const findComposerPanel = () => {
    const canonical = getCanonicalComposerPanel();
    if (canonical) return canonical;

    const liveInput = document.querySelector(
      "#prompt-textarea[role='textbox'],[contenteditable='true'][role='textbox'],textarea[name='prompt-textarea']"
    );
    if (liveInput instanceof HTMLElement) {
      const fromLiveInput = liveInput.closest?.("#thread-bottom-container,form[data-type='unified-composer'],[data-testid*='composer']");
      if (fromLiveInput instanceof HTMLElement && isSafeComposerContainer(fromLiveInput)) return fromLiveInput;
    }

    const directBottom = document.querySelector("#thread-bottom-container");
    if (directBottom instanceof HTMLElement && !hasChatMessageContent(directBottom) && isSafeComposerContainer(directBottom)) {
      return directBottom;
    }

    const composer = findComposer();
    if (!(composer instanceof HTMLElement)) return null;
    const bottomContainer = composer.closest?.("#thread-bottom-container");
    if (bottomContainer instanceof HTMLElement && !hasChatMessageContent(bottomContainer) && isSafeComposerContainer(bottomContainer)) {
      return bottomContainer;
    }
    return composer;
  };

  const findFocusableComposerInput = (panel = findComposerPanel()) => {
    if (!(panel instanceof HTMLElement)) return null;

    const candidates = [
      panel.querySelector("#prompt-textarea"),
      ...panel.querySelectorAll("[contenteditable='true'][role='textbox']"),
      ...panel.querySelectorAll("[contenteditable='true']"),
      ...panel.querySelectorAll("textarea")
    ];

    for (const node of candidates) {
      if (!(node instanceof HTMLElement)) continue;
      const style = getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const rect = node.getBoundingClientRect?.();
      if (!rect || rect.width < 20 || rect.height < 20) continue;
      return node;
    }
    return null;
  };

  const findComposerInputRaw = (panel = findComposerPanel()) => {
    if (!(panel instanceof HTMLElement)) return null;
    const node =
      panel.querySelector("#prompt-textarea[role='textbox']") ||
      panel.querySelector("[contenteditable='true'][role='textbox']") ||
      panel.querySelector("textarea[name='prompt-textarea']") ||
      panel.querySelector("textarea");
    return node instanceof HTMLElement ? node : null;
  };

  const getComposerDraftText = (panel = findComposerPanel()) => {
    const input = findFocusableComposerInput(panel);
    if (!(input instanceof HTMLElement)) return "";
    if ("value" in input && typeof input.value === "string") return input.value.trim();
    return normalizeText(input.textContent || "");
  };

  const hasPendingComposerDraft = (panel = findComposerPanel()) => getComposerDraftText(panel).length > 0;

  const hasCaretInComposer = (panel = findComposerPanel()) => {
    if (!(panel instanceof HTMLElement)) return false;
    if (panel.matches?.(":focus-within")) return true;
    const active = document.activeElement;
    if (active instanceof HTMLElement && panel.contains(active)) return true;
    const sel = window.getSelection?.();
    const anchor = sel?.anchorNode;
    return Boolean(anchor && panel.contains(anchor));
  };

  const hasComposerAttachments = (panel = findComposerPanel()) => {
    if (!(panel instanceof HTMLElement)) return false;
    const fileInputs = panel.querySelectorAll("input[type='file']");
    for (const input of fileInputs) {
      if (input instanceof HTMLInputElement && input.files && input.files.length > 0) return true;
    }
    return Boolean(
      panel.querySelector(
        "[data-testid*='attachment'],[data-testid*='upload'],[data-testid*='preview'],[aria-label*='附件'],[aria-label*='attachment']"
      )
    );
  };

  const isRecordingActive = (panel = findComposerPanel()) => {
    if (!(panel instanceof HTMLElement)) return false;

    const recordingUi = panel.querySelector(
      [
        "#composer-submit-button[aria-label*='停止']",
        "#composer-submit-button[aria-label*='Stop']",
        "button[aria-label*='取消聽寫']",
        "button[aria-label*='提交聽寫']",
        "button[aria-label*='Cancel dictation']",
        "button[aria-label*='Submit dictation']"
      ].join(", ")
    );
    if (recordingUi instanceof HTMLElement) return true;

    const activeVoiceBtn = panel.querySelector("button[aria-pressed='true'][aria-label*='語音'], button[aria-pressed='true'][aria-label*='voice']");
    if (activeVoiceBtn instanceof HTMLElement) return true;

    return false;
  };

  const isPanelActuallyVisible = (panel = findComposerPanel()) => {
    if (!(panel instanceof HTMLElement)) return false;
    const style = getComputedStyle(panel);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
    const rect = panel.getBoundingClientRect?.();
    if (!rect || rect.width < 80 || rect.height < 20) return false;
    return true;
  };

  const hasUsableComposerPanel = () => {
    const panel = findComposerPanel();
    if (!(panel instanceof HTMLElement)) return false;
    if (panel.matches?.("main,[role='main'],body,html,#__next,#root")) return false;
    const rect = panel.getBoundingClientRect?.();
    if (!rect || rect.width < 120) return false;
    const input = findComposerInputRaw(panel);
    if (!(input instanceof HTMLElement)) return false;
    return true;
  };

  g.launcherDetect = {
    normalizeText,
    hasConversationTurns,
    isInitLanding,
    rectStr,
    hasChatMessageContent,
    hasAssistantReply,
    isBottomRegion,
    isLikelyComposerInput,
    isSafeComposerContainer,
    findComposerInput,
    findComposerShell,
    findComposer,
    getCanonicalComposerPanel,
    findComposerPanel,
    findFocusableComposerInput,
    findComposerInputRaw,
    getComposerDraftText,
    hasPendingComposerDraft,
    hasCaretInComposer,
    hasComposerAttachments,
    isRecordingActive,
    isPanelActuallyVisible,
    hasUsableComposerPanel
  };
})();

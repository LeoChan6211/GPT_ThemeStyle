(() => {
  const g = (globalThis.GPTGT = globalThis.GPTGT || {});

  const HIDDEN_CLASS = "gptgt-disclaimer-hidden";

  const normalizeText = (text) => String(text || "").replace(/\s+/g, " ").trim().toLowerCase();

  const shouldHide = (el) => {
    if (!(el instanceof HTMLElement)) return false;
    const rect = el.getBoundingClientRect?.();
    if (!rect) return false;

    const text = normalizeText(el.textContent);
    if (!text) return false;
    const hits =
      text.includes("chatgpt 可能會出錯") ||
      text.includes("請查核重要資訊") ||
      text.includes("請核查重要資訊") ||
      (text.includes("cookie") && text.includes("設定"));
    // Hide footer disclaimer (keep conservative: only near bottom and small).
    if (hits) {
      if (rect.height > 140) return false;
      if (rect.top < window.innerHeight - 220) return false;
      return true;
    }

    // Logged-out promo strip: hide only when we can confidently identify the standalone gate block.
    // Safety rule: never hide any element that contains composer inputs or chat history content.
    const hasComposerOrHistory = Boolean(
      el.querySelector?.(
        "#prompt-textarea,textarea,[contenteditable='true'][role='textbox'],[data-message-author-role],article,.markdown,.prose,main,[role='main']"
      )
    );
    if (hasComposerOrHistory) return false;

    const buttons = Array.from(el.querySelectorAll("button,a,[role='button']")).filter((b) => b instanceof HTMLElement);
    const hasLogin = buttons.some((b) => normalizeText(b.textContent).includes("登入"));
    const hasSignup = buttons.some((b) => normalizeText(b.textContent).includes("免費註冊"));
    const promoCopy =
      text.includes("取得更聰明的回應") &&
      (text.includes("上傳檔案") || text.includes("圖像") || text.includes("圖片")) &&
      text.includes("更多功能");
    if (promoCopy && hasLogin && hasSignup) {
      const nearBottom = rect.bottom > window.innerHeight - 40;
      const wideEnough = rect.width > window.innerWidth * 0.35;
      const sizeLooksLikePromo = rect.height >= 40 && rect.height < 260;
      const gateButtonsNearBottom = buttons.some((b) => {
        const br = b.getBoundingClientRect?.();
        if (!br) return false;
        return br.bottom > window.innerHeight - 24;
      });
      if (nearBottom && wideEnough && sizeLooksLikePromo && gateButtonsNearBottom) return true;
    }

    return false;
  };

  const hideOnce = () => {
    const candidates = document.querySelectorAll("footer, [role='contentinfo'], div, p, span");
    for (const el of candidates) {
      if (!(el instanceof HTMLElement)) continue;
      if (el.classList.contains(HIDDEN_CLASS)) continue;
      if (!shouldHide(el)) continue;
      el.classList.add(HIDDEN_CLASS);
      el.style.display = "none";
    }
  };

  let obs;
  g.startDisclaimerHider = () => {
    hideOnce();
    if (obs) return;
    obs = new MutationObserver(() => hideOnce());
    obs.observe(document.documentElement, { subtree: true, childList: true });
  };

  g.stopDisclaimerHider = () => {
    if (obs) obs.disconnect();
    obs = null;
  };
})();

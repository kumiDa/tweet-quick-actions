// Adds a button to each tweet's action bar that drives X's own
// "Not interested in this post" menu item, so the real signal reaches X.
(() => {
  "use strict";

  const MARK = "data-nib";
  // shortcut: matches the English menu label only ("…in this post" and
  // "…in this ad"). If you use X in another language, add its wording here.
  const LABEL = /not interested/i;

  const SVG =
    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">' +
    '<path fill="currentColor" d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM7 11h10v2H7z"/>' +
    "</svg>";

  const waitFor = (fn, ms = 2000) =>
    new Promise((resolve) => {
      const start = Date.now();
      const tick = () => {
        const v = fn();
        if (v) return resolve(v);
        if (Date.now() - start > ms) return resolve(null);
        requestAnimationFrame(tick);
      };
      tick();
    });

  // X leaves earlier dropdowns in the DOM, so the newly opened one is the only
  // one we may read: picking any other clicks the wrong tweet's menu item.
  const findMenuItem = (before) => {
    const menu = [...document.querySelectorAll('div[role="menu"]')].find(
      (m) => !before.has(m)
    );
    if (!menu) return null;
    return [...menu.querySelectorAll('[role="menuitem"]')].find((i) =>
      LABEL.test(i.textContent || "")
    );
  };

  async function notInterested(article, btn) {
    const caret = article.querySelector('[data-testid="caret"]');
    if (!caret) return fail(btn);
    const before = new Set(document.querySelectorAll('div[role="menu"]'));
    caret.click();
    const item = await waitFor(() => findMenuItem(before));
    if (!item) {
      caret.click(); // the dropdown only closes by toggling the caret; Escape is ignored
      return fail(btn);
    }
    item.click();
  }

  function fail(btn) {
    btn.classList.add("nib-failed");
    btn.title = '"Not interested" is not available for this post';
    setTimeout(() => btn.classList.remove("nib-failed"), 1500);
  }

  function inject(article) {
    if (article.hasAttribute(MARK)) return;
    const like = article.querySelector(
      '[data-testid="like"], [data-testid="unlike"]'
    );
    const bar = like && like.closest('div[role="group"]');
    if (!bar) return; // not a rendered tweet (ad placeholder, skeleton, …)
    article.setAttribute(MARK, "1");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nib-btn";
    btn.title = "Not interested in this post";
    btn.setAttribute("aria-label", "Not interested in this post");
    btn.innerHTML = SVG;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      notInterested(article, btn);
    });

    const slot = document.createElement("div");
    slot.className = "nib-slot";
    slot.appendChild(btn);
    bar.appendChild(slot);
  }

  const scan = () =>
    document
      .querySelectorAll('article[data-testid="tweet"]:not([' + MARK + "])")
      .forEach(inject);

  new MutationObserver(scan).observe(document.body, {
    childList: true,
    subtree: true,
  });
  scan();
})();

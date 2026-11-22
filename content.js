// Adds one-click buttons to each tweet's action bar for actions X buries
// behind its menus, driving X's own menu items so the real signals reach X.
(() => {
  "use strict";

  const MARK = "data-nib";

  // Built as real nodes rather than innerHTML strings: AMO's linter flags any
  // innerHTML assignment, and cloning a template node is just as cheap.
  const icon = (inner) =>
    new DOMParser().parseFromString(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
        'width="18" height="18" aria-hidden="true" fill="none" ' +
        'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
        'stroke-linejoin="round">' +
        inner +
        "</svg>",
      "image/svg+xml"
    ).documentElement;

  const ICONS = {
    notInterested: icon('<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>'),
    report: icon('<path d="M5 21V4h13l-3 4.5L18 13H5"/>'),
    note: icon(
      '<rect x="4" y="4" width="16" height="16" rx="2"/>' +
        '<path d="M8 9h8M8 13h8M8 17h5"/>'
    ),
    copy: icon(
      '<path d="M10 14a4 4 0 0 0 5.7 0l3-3A4 4 0 0 0 13 5.3l-1.5 1.5"/>' +
        '<path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1.5-1.5"/>'
    ),
    done: icon('<path d="M5 13l4 4L19 7"/>'),
  };

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
  const findMenuItem = (before, label) => {
    const menu = [...document.querySelectorAll('div[role="menu"]')].find(
      (m) => !before.has(m)
    );
    if (!menu) return null;
    return [...menu.querySelectorAll('[role="menuitem"]')].find((i) =>
      label.test(i.textContent || "")
    );
  };

  async function viaCaretMenu(article, btn, label) {
    const caret = article.querySelector('[data-testid="caret"]');
    if (!caret) return fail(btn);
    const before = new Set(document.querySelectorAll('div[role="menu"]'));
    caret.click();
    const item = await waitFor(() => findMenuItem(before, label));
    if (!item) {
      caret.click(); // the dropdown only closes by toggling the caret; Escape is ignored
      return fail(btn);
    }
    item.click();
  }

  // The permalink is already in the DOM, so this needs no menu at all.
  async function copyLink(article, btn) {
    // Match the /user/status/id prefix, not the whole path: some tweets only
    // expose the link via its /analytics or /photo/1 variant.
    const path = [...article.querySelectorAll('a[href*="/status/"]')]
      .map((el) => new URL(el.href).pathname.match(/^\/[^/]+\/status\/\d+/))
      .find(Boolean);
    if (!path) return fail(btn);
    if (!(await writeClipboard(location.origin + path[0]))) {
      return fail(btn);
    }
    flash(btn, "nib-ok", ICONS.done, "Link copied");
  }

  // x.com denies the async clipboard API, so execCommand is the one that
  // actually works here; it still has the click's user activation after the
  // await above.
  async function writeClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {}
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {}
    ta.remove();
    return ok;
  }

  const ACTIONS = [
    {
      cls: "nib-red",
      title: "Not interested in this post",
      svg: ICONS.notInterested,
      run: (a, b) => viaCaretMenu(a, b, /not interested/i),
    },
    {
      cls: "",
      title: "Request a Community Note",
      svg: ICONS.note,
      run: (a, b) => viaCaretMenu(a, b, /community note/i),
    },
    {
      cls: "nib-red",
      title: "Report post",
      svg: ICONS.report,
      run: (a, b) => viaCaretMenu(a, b, /report post/i),
    },
    {
      cls: "",
      title: "Copy link",
      svg: ICONS.copy,
      run: copyLink,
    },
  ];

  const STATE_CLASSES = ["nib-ok", "nib-failed"];

  // Restores from the button's own pristine icon, so a second click inside the
  // timeout cannot strand the flashed icon.
  function flash(btn, cls, svg, title) {
    clearTimeout(btn._nibTimer);
    btn.classList.remove(...STATE_CLASSES);
    btn.classList.add(cls);
    if (svg) btn.replaceChildren(svg.cloneNode(true));
    btn.title = title;
    btn._nibTimer = setTimeout(() => {
      btn.classList.remove(...STATE_CLASSES);
      btn.replaceChildren(btn._nibIcon.cloneNode(true));
      btn.title = btn._nibTitle;
    }, 1400);
  }

  const fail = (btn) =>
    flash(btn, "nib-failed", null, "That action isn't available for this post");

  function inject(article) {
    if (article.hasAttribute(MARK)) return;
    const like = article.querySelector(
      '[data-testid="like"], [data-testid="unlike"]'
    );
    const bar = like && like.closest('div[role="group"]');
    if (!bar) return; // not a rendered tweet (ad placeholder, skeleton, …)
    article.setAttribute(MARK, "1");

    const slot = document.createElement("div");
    slot.className = "nib-slot";
    for (const action of ACTIONS) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "nib-btn " + action.cls;
      btn.title = action.title;
      btn.setAttribute("aria-label", action.title);
      btn._nibIcon = action.svg;
      btn._nibTitle = action.title;
      btn.replaceChildren(action.svg.cloneNode(true));
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        action.run(article, btn);
      });
      slot.appendChild(btn);
    }
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

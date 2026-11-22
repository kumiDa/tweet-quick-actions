# AMO submission — copy/paste answers

Upload: `tweet-quick-actions-1.1.zip`

## The wizard, step by step

1. Sign in to <https://addons.mozilla.org/developers/> with a **Mozilla
   Account**. Read the Developer Agreement and Add-on Policies first.
2. **Submit a New Add-on**.
3. Distribution: choose **On this site** (listed) → Continue.
4. **Upload Version** → Select a file → `tweet-quick-actions-1.1.zip`.
   Validation runs here. Ours reports 0 errors, 0 warnings, 0 notices, so it
   should pass straight through. Errors would block you; warnings would not.
5. Select the compatible platforms. The manifest declares both Firefox 140+
   and Firefox for Android 142+, so both apply — or mark Android incompatible
   here if you'd rather not support it (it has never been tested there).
6. **Source code**: answer **No**. Source is only required for hard-to-read
   code; `content.js` is plain, unminified and unbundled.
7. **Describe Add-on**: fill in the fields below → **Submit Version**.
8. The **Version Submitted** page appears and you get a confirmation email.

Mozilla's docs do not state a review timeframe, and do not say whether human
review happens before or after the listing goes live — only that the add-on
"may be subject to further review" and that you'll be notified.

Later versions go on the add-on's own page on AMO, **not** through "Submit a
New Add-on", or AMO treats them as a separate add-on.

---

## Before you submit

- [ ] **Make the GitHub repo public.** The support/homepage URL below must be
      reachable, and listed reviewers will look at the source.
- [ ] Upload `docs/screenshot.jpg` as the listing screenshot. It shows posts
      from @X, the platform's own account, so no private individual's content
      is republished on your listing page. Alt text below.

---

## Name

```
Tweet Quick Actions
```

## Summary (max 250 characters)

```
Puts four one-click buttons on every post on X: Not interested, Request Community Note, Report, and Copy link. No more digging through the ... menu. Uses X's own menu items, so your feedback reaches X exactly as if you had clicked it yourself.
```

## Description

```
X buries its most useful per-post actions behind menus. "Not interested in this post", "Request Community Note" and "Report post" each take two clicks through the ... menu, and "Copy link" is hidden in the share menu.

Tweet Quick Actions adds four buttons to the action bar of every post, next to reply, repost and like:

- Copy link
- Not interested in this post
- Request a Community Note
- Report post

They are ordered from most-used and harmless to least-used and most serious, so Report sits at the far edge of the bar.

The last three click X's own menu items for you, so the signal reaches X exactly as if you had navigated the menu by hand. Nothing is hidden locally and nothing is faked.

Report and Request Community Note open X's own flows, which you complete yourself. Nothing is ever auto-submitted.

Copy link reads the post's permalink straight from the page and copies it, with a green tick to confirm.

If an action isn't available for a post (for example "Not interested" on your own posts), the button flashes red and does nothing.

The add-on works only on x.com and twitter.com. It collects no data, makes no network requests of its own, and has no servers, accounts or analytics.
```

## Categories (up to 2 each)

Firefox → **Social & Communication**
Firefox for Android → **Social & Communication** (or mark Android
incompatible at step 5)

## Support email / Support website

Support website:

```
https://github.com/kumiDa/tweet-quick-actions
```

Use your own address for the support email.

## Licence

MIT (matches `LICENSE` in the repo)

## Privacy policy

Leave **"This add-on has a privacy policy"** unticked. A policy is required
only when data is transmitted off the user's device; this add-on transmits
nothing and the manifest already declares
`data_collection_permissions: {required: ["none"]}`.

---

## Permission justification

If asked about `clipboardWrite`:

```
Used only by the "Copy link" button, to put the post's own URL on the clipboard when the user clicks it. Nothing is ever read from the clipboard.
```

Host access (`x.com`, `twitter.com`) comes from the content script and is the
only site access the add-on has.

---

## Notes for Reviewers

```
What it does
------------
The add-on injects four buttons into each post's action bar on x.com. Three of
them click X's own existing menu items on the user's behalf:

  - "Not interested in this post"   (X's ... menu)
  - "Request Community Note"        (X's ... menu)
  - "Report post"                   (X's ... menu)

The remaining one, "Copy link", reads the post's permalink from the page and copies it
to the clipboard without opening any menu. It takes the /user/status/id prefix
from any of the post's own links, so it also works on posts that render no
plain permalink.

All logic is in content.js (about 190 lines, unminified). There is no
background script, no remote code, no eval, no network requests, and no data
collection or storage of any kind.

How to test
-----------
A logged-in X account is required; x.com renders no posts to logged-out
visitors.

  1. Install and open https://x.com/home
  2. Four extra buttons appear at the end of each post's action bar, after
     X's reply / repost / like / share buttons, in this order: chain,
     circle-minus, note, flag.
  3. Click the chain icon (Copy link) - the icon briefly turns into a green
     tick and the post's URL is on the clipboard.
  4. Click the circle-minus icon (Not interested) - X replaces the post with
     its own "Thanks. X will use this to make your timeline better." row.
  5. Click the note icon (Request a Community Note) - X's own note request
     page opens at /i/communitynotes/noterequest/<id>. Nothing is submitted.
  6. Click the flag icon (Report) - X's own report flow opens at
     /i/safety/report_story_start. Nothing is submitted.

Implementation notes
--------------------
Two quirks of x.com the code works around, both verified against the live site:

  - X leaves closed dropdown menus in the DOM. The code records which menus
    exist before opening one and only reads the menu that appeared after, so
    it can never act on a different post's menu.
  - The dropdown closes only by toggling the caret again; a synthetic Escape
    key event is ignored. The failure path toggles the caret.

Copy link tries navigator.clipboard.writeText first and falls back to
document.execCommand("copy"), because x.com denies the async clipboard API in
the page context.

Source: https://github.com/kumiDa/tweet-quick-actions
```

---

## Screenshot alt text

For `docs/screenshot.jpg`:

```
Three posts from the @X account on x.com. Each post's action bar ends with four buttons added by the add-on, after X's own reply, repost, like, views, bookmark and share icons: a chain link for Copy link, a circle containing a minus for Not interested, a lined note for Request a Community Note, and a flag for Report.
```

Shorter, if the field is length-limited:

```
An x.com timeline with four extra buttons on each post's action bar: Copy link, Not interested, Request a Community Note, and Report.
```

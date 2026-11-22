# AMO submission — copy/paste answers

Submit at <https://addons.mozilla.org/developers/addon/submit/distribution>
and choose **"On this site"** (listed).

Upload: `tweet-quick-actions-1.1.zip`

---

## Before you submit

- [ ] **Make the GitHub repo public.** The support/homepage URL below must be
      reachable, and listed reviewers will look at the source.
- [ ] Decide whether the screenshot is OK to publish — it shows a real user's
      post from your timeline. Replace it if you'd rather not.

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

- Not interested in this post
- Request a Community Note
- Report post
- Copy link

The first three click X's own menu items for you, so the signal reaches X exactly as if you had navigated the menu by hand. Nothing is hidden locally and nothing is faked.

Report and Request Community Note open X's own flows, which you complete yourself. Nothing is ever auto-submitted.

Copy link reads the post's permalink straight from the page and copies it, with a green tick to confirm.

If an action isn't available for a post (for example "Not interested" on your own posts), the button flashes red and does nothing.

The add-on works only on x.com and twitter.com. It collects no data, makes no network requests of its own, and has no servers, accounts or analytics.
```

## Category

Firefox → **Social & Communication**

## Tags

```
twitter, x, timeline, algorithm, productivity
```

## Homepage / Support site

```
https://github.com/kumiDa/tweet-quick-actions
```

## Licence

MIT (matches `LICENSE` in the repo)

## Privacy policy

Not required — the add-on collects nothing. When AMO asks about data
collection, answer **"Does not collect data"** and leave the privacy policy
field empty.

---

## Permission justification

If asked about `clipboardWrite`:

```
Used only by the "Copy link" button, to put the post's own URL on the clipboard when the user clicks it. Nothing is ever read from the clipboard.
```

Host access (`x.com`, `twitter.com`) comes from the content script and is the
only site access the add-on has.

---

## Notes for reviewer

```
What it does
------------
The add-on injects four buttons into each post's action bar on x.com. Three of
them click X's own existing menu items on the user's behalf:

  - "Not interested in this post"   (X's ... menu)
  - "Request Community Note"        (X's ... menu)
  - "Report post"                   (X's ... menu)

The fourth, "Copy link", reads the post's permalink from the page and copies it
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
     X's reply / repost / like / share buttons.
  3. Click the chain icon (Copy link) - the icon briefly turns into a green
     tick and the post's URL is on the clipboard.
  4. Click the circle-minus icon (Not interested) - X replaces the post with
     its own "Thanks. X will use this to make your timeline better." row.
  5. Click the flag icon (Report) - X's own report flow opens at
     /i/safety/report_story_start. Nothing is submitted.
  6. Click the note icon (Request a Community Note) - X's own note request
     page opens at /i/communitynotes/noterequest/<id>. Nothing is submitted.

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

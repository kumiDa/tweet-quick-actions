# Tweet Quick Actions

A Firefox add-on that puts four one-click buttons in every tweet's action bar
for actions X buries behind its menus:

| Button | What it does | How |
|---|---|---|
| 🔗 Copy link | copies the tweet's permalink | reads the permalink directly |
| ⊖ Not interested | "Not interested in this post" | drives X's ⋯ menu |
| 🗒 Community Note | "Request Community Note" | drives X's ⋯ menu |
| ⚑ Report | "Report post" | drives X's ⋯ menu |

They run left to right from most-used and harmless to least-used and most
serious, so Report sits at the far edge where a stray click is least likely.

The three menu-driven actions click X's own menu items, so the real signal
reaches X — this is not local hiding. Report and Community Note navigate to
X's own flows, which you then complete yourself; nothing is auto-submitted.

Works on `x.com` and `twitter.com`, on any timeline (home, profile, search,
bookmarks).

## Install for daily use (temporary)

1. Open `about:debugging#/runtime/this-firefox`
2. **Load Temporary Add-on…**
3. Pick `manifest.json` from this folder

Gone on every Firefox restart. Repeat to re-add.

## Install permanently

Release Firefox only installs **signed** add-ons. Zip the sources and upload to
<https://addons.mozilla.org/developers/> as an unlisted add-on; AMO signs it
and gives you an `.xpi` you can install for good.

```sh
zip -r tweet-quick-actions.zip manifest.json content.js content.css icon.svg README.md LICENSE
```

(Alternatively run Firefox Developer Edition / Nightly with
`xpinstall.signatures.required=false` in `about:config`.)

## Notes

- Verified against live x.com. Three behaviours the implementation depends on:
  - X leaves closed dropdowns in the DOM, so the code reads only the menu that
    appeared *after* it clicked the caret — otherwise it acts on the wrong tweet.
  - The dropdown only closes by toggling the caret again; synthetic `Escape` is
    ignored.
  - x.com denies `navigator.clipboard.writeText` in the page context, so Copy
    link falls back to `document.execCommand("copy")`.
- Menu labels are matched as English text. For another UI language, edit the
  regexes in `ACTIONS` in `content.js`.
- A button flashes red when its action isn't available for that post (for
  example "Not interested" on your own tweets), green when a link is copied.
- Copy link reads the `/user/status/id` prefix from any of the post's links
  (the timestamp, a photo or the analytics link), so it works even on posts
  that render no plain permalink. Quoted posts are `div[role="link"]`, not
  anchors, so the outer post's link is always the one copied.
- The gecko add-on ID is `tweet-quick-actions@local`. Don't change it once AMO
  has signed a build, or Firefox treats it as a different add-on.

## Licence

MIT, see [LICENSE](LICENSE).

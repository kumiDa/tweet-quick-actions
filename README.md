# Not Interested Button

Adds a button to every tweet's action bar (next to reply/retweet/like) that
opens X's own ⋯ menu, clicks **"Not interested in this post"**, and closes it —
so the real signal reaches X's algorithm.

Works on `x.com` and `twitter.com`, on any timeline (home, profile, search,
bookmarks).

## Install for daily use (temporary)

1. Open `about:debugging#/runtime/this-firefox`
2. **Load Temporary Add-on…**
3. Pick `manifest.json` from this folder

Gone on every Firefox restart. Repeat to re-add.

## Install permanently

Release Firefox only installs **signed** add-ons. Upload
`not-interested-button.zip` to <https://addons.mozilla.org/developers/> as an
unlisted add-on; AMO signs it and gives you an `.xpi` you can install for good.
(Alternatively run Firefox Developer Edition / Nightly with
`xpinstall.signatures.required=false` in `about:config`.)

## Notes

- The ⋯ menu offers "Not interested" only for posts from accounts you don't
  follow, and never for your own — the button flashes red when the item isn't
  there.
- The menu label is matched as English text. For another UI language, edit the
  `LABEL` regex in `content.js`.

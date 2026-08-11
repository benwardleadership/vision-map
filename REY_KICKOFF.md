# Vision MAP: Handover to Rey

Rey, everything we discussed is built and tested. This is the handover so you can
own it directly without routing changes through Ben.

Four steps below, roughly 30 minutes total. Nothing here is urgent or breaks the
live site, so do them in whatever order suits your week.

---

## What changed since your review

- **Supabase is gone.** Removed from source completely. No accounts, no magic link
  emails, no second login. The bundle dropped from 450 KB to 247 KB as a result.
- **Your three `index.html` changes are now in the React source**, compiled rather
  than patched: the WordPress token pre-fill, the "Log Completion & Start Next Round"
  rename, and the "Import session from other device" button.
- **The `setInterval` DOM patch is gone.** `index.html` is a clean shell again.
  Nothing depends on matching button text at runtime any more, so a copy change from
  Ben can no longer silently break a rename.
- **The WordPress sync plugin is written**, with the install guide and runbook.
- Export/Import is unchanged and stays as the manual escape hatch.

The live site is untouched so far. It is still serving the previous build.

---

## Step 1: The repo (your call on how)

The GitHub repo currently contains build output only, which is why you had to work
around the minified bundle. The full source is now committed and ready to push, but
it has **separate history** from what is in the repo today, so pushing to `main`
would replace what is there.

Content-wise nothing is lost, your three changes are merged into the source. But it
is your repo, so it should be your decision.

**Suggested:** Ben pushes to a branch called `source`, you review it, and you promote
it to `main` when you are happy. That way nothing is overwritten without you looking.

Once source is on `main`, `dist/` is gitignored and Vercel builds from source, so
compiled output no longer lives in the repo at all.

---

## Step 2: Auto-deploy (this is the one that removes the bottleneck)

Right now deploys require Ben's Vercel CLI, on Ben's machine, with his login. That is
the main reason he is in the middle.

In the Vercel dashboard: **`vision-map-web` project > Settings > Git > Connect
repository**, and point it at `benwardleadership/vision-map`.

After that, every push to `main` builds and deploys automatically. No CLI, no tokens,
no Ben. Keep the same project rather than making a new one, so the
`visionmap.sellershipuniversity.com` domain stays attached.

Vercel auto-detects Vite, so no build config should be needed. For reference:
- Build command: `npm run build`
- Output directory: `dist`

Worth knowing: Vercel's Hobby plan is 1 developer seat and is documented as personal,
non-commercial use, which is why adding you failed earlier with `invites_not_allowed`.
Pro is $20/user/month. **You do not need a Vercel seat for the workflow above**, since
you would be working through GitHub. Flagging it as a business decision for Ben, not a
blocker for you.

---

## Step 3: Claude Code on your machine

This is what lets you work the way Ben has been, without going through him.

```bash
# needs Node.js 18+
npm install -g @anthropic-ai/claude-code

git clone https://github.com/benwardleadership/vision-map.git
cd vision-map
npm install
claude
```

Then just describe what you want changed. It reads the codebase, makes the change,
and you review the diff before anything ships.

**Claude Code is included on the free plan**, so you can try it on this repo for $0
before anyone pays for anything. If you hit usage limits doing real work, Pro is
$17/month annual. No need to decide up front.

Useful starting prompts for this repo:
- "Read INSTALL_AND_RUNBOOK.md and explain how the sync works"
- "Run npm run build and npm test, confirm both pass"
- "Change [button text] to [new text] and verify it in the browser"

Two things worth knowing about this codebase:
- `npm test` is a structure smoke test that **fails on em dashes** in source. Use
  plain hyphens or rephrase.
- Local dev is `npm run dev` on port 5173. Without a WordPress token the app runs
  standalone on local storage, which is the easiest way to test UI changes.

---

## Step 4: Go live (plugin and deploy together)

The new build expects the WordPress endpoints, so install the plugin first. If you
deploy first it degrades gracefully rather than breaking, students would just see
"Will retry" in the sync card, but it is cleaner in this order.

1. **Install the plugin.** Part 1 of `INSTALL_AND_RUNBOOK.md`, about 10 minutes.
   The only thing to double check is that `VISIONMAP_JWT_SECRET` in `wp-config.php`
   is the same secret your shortcode signs with. If those differ, every request 401s.
2. **Deploy the app.** Once Step 2 is done this is just a push.
3. **Smoke test.** Type something into your Why on desktop, wait a few seconds, open
   the same lesson on your phone, confirm it is there.

---

## How it works, briefly

```
Student opens lesson  ->  shortcode mints 1 hour JWT  ->  iframe loads app
                                                            |
                        app decodes token (name, email, user_id)
                                                            |
                        GET  /wp-json/visionmap/v1/state  -> merge into device
                        POST /wp-json/visionmap/v1/state  -> on change
                                                            |
                                            wp_usermeta.visionmap_state
```

Local first is the default, not a fallback. Every keystroke saves to the browser
immediately and the network is a background push, so nothing blocks typing and
offline work is normal. If a save cannot go out the app flags it and retries on the
next lesson load.

Security specifics are in Part 3 of the runbook. Short version: signature is verified
before any claim is trusted, only HS256 is accepted so the `alg: none` bypass fails,
and `user_id` comes only from the signed payload, so a student cannot address another
student's row. I tested forged `user_id`, `alg: none`, expired, and stripped
signature cases against your exact signing method. All rejected.

---

## Open items, flagged not solved

- **Vision board images** are stored inline as data URLs inside the state JSON. Fine
  at current scale, but it is the one thing that grows unbounded, and the plugin
  rejects payloads over 2 MB. If you start seeing 413s, the fix is uploading to the
  media library and storing URLs. Documented in the runbook, not worth doing
  preemptively.
- **Token expiry is 1 hour.** A student editing after sitting idle longer than that
  has their save deferred to the next lesson load. Raise `exp` in the shortcode if
  you want a wider window. Nothing in the plugin needs to change.
- **The old Supabase project** (`eucuinvoofzyagsirncb`) is now unused and can be
  deleted. It still holds Ben's test data.

---

## Division going forward

- **You own:** the repo, deploys, WordPress, the server, and whether any of the above
  is the right call. If something here conflicts with how SU is set up, your call wins.
- **Ben owns:** copy and product decisions. Wording, which exercises matter, what
  students see.
- **Claude does:** the code, on your instruction rather than through Ben.

Questions on any of it, ask Claude directly once Step 3 is done. It has the full
context of this build.

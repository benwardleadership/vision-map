# Vision MAP — Sync Approach: Technical Brief for Rey

Written by Claude (the assistant that built the original app) after reviewing
`github.com/benwardleadership/vision-map` and the Aug 10 planning call.

Rey, this is written for you to evaluate and push back on, not as a decision that's
been made. You own the maintenance, so you should get the final call.

---

## 1. First: your WordPress token work is the right instinct

The pre-boot script in `index.html` that decodes a WP JWT from `?token=` and seeds
`profile.name` / `account.email` into localStorage before React boots is a good
piece of engineering, and it points at the correct long-term architecture.

Independently of your call, the recommendation I gave Ben was "sync through
WordPress on Hostinger, not Supabase" for exactly the reasons you gave: it runs on
infrastructure you already own, back up, and understand, and enrolled students are
already authenticated.

So we agree on the destination. What follows is about closing the last 40%.

---

## 2. The core constraint you've been working around

The repo contains build output only:

```
assets/index-aVXZlqRS.js   <- minified React bundle
fonts/
index.html                 <- your changes live here
```

There is no `src/` and no `package.json`. That means every change has had to be made
*around* the app rather than *in* it, which is why the current approach uses a
`setInterval` that re-scans every button on the page once per second.

That works, but it carries costs worth naming:

- **Text-matching is brittle.** `btn.textContent.trim() === 'Restart 66'` silently
  stops working the moment that label changes in the source. Ben has been sending
  copy edits regularly (the Decision screen copy changed twice this week), so this
  will break without warning and with no error.
- **It fights React.** React owns that DOM. A re-render can revert the injected
  button or the renamed label; the interval then re-applies it. On slow devices this
  can visibly flicker.
- **It never stops.** A 1s interval running for the life of the session is a real
  battery cost on mobile, which is where a lot of the 66-day usage will happen.

None of this is a criticism of the approach — it's the correct approach *given only a
minified bundle*. The fix is to remove the constraint: work from source.

**The source exists.** Full Vite + React project, all original files. Once you have
it, "rename Restart 66" is a one-line edit that compiles, instead of a runtime patch.

---

## 3. Two issues that need a decision regardless of sync strategy

### 3a. The Supabase sign-in UI is still live in the shipped bundle

`index-aVXZlqRS.js` is the build I deployed with cloud sync compiled in. The Supabase
project URL and publishable key are baked into that file at build time, so from the
app's perspective `isCloudConfigured === true`.

Practical consequence: **More → Account still renders "Sync across devices" with a
working "Email me a sign-in link" button.** A student can click it today. Those
magic-link emails go out through Supabase's default shared mailer, which is
rate-limited and lands in spam frequently.

So the sync path you intended to remove is still reachable in production. It needs to
be either properly removed (a source change) or properly supported. Right now it's
half-on, which is the worst of both.

### 3b. localStorage is not durable storage — and the iframe makes it worse

This is the one I'd most want you to weigh, because it's easy to miss and it bites
late.

**Checked and cleared — no action needed here.** The app is embedded in SU via
`<iframe>`, and browsers partition script-writable storage by *top-level site*
(eTLD+1), so the `src` URL determines whether storage survives at all:

| iframe `src` | Relationship to `sellershipuniversity.com` | Storage behavior |
|---|---|---|
| `visionmap.sellershipuniversity.com` ← **in use** | same site (shared eTLD+1) | works normally |
| `vision-map-web.vercel.app` | cross-site / third-party | Safari blocks or isolates it |

Ben confirmed the embed uses `https://visionmap.sellershipuniversity.com`, which is
the correct choice: same root domain as the parent page, so the browser does not
treat it as a third-party embed and storage behaves normally. Had it been the raw
`*.vercel.app` URL, Safari/iOS students would have been losing state every session.
Good call on that one.

The 7-day issue below still applies, though.

Safari's Intelligent Tracking Prevention deletes script-writable storage
(localStorage included) for sites the user hasn't interacted with in **7 days** of
browser use. Chrome and Edge are more forgiving, but iOS Safari is a large share of
the audience for a daily-habit tool.

Vision MAP is a **66-day** program. A student who travels for a week, or gets busy,
returns to an empty MAP: Why gone, Core Values gone, Big 5 signature gone, streak
gone. Add normal cache clearing, "clear history," incognito, and device upgrades on
top of that.

Export/Import covers the *deliberate* device switch. It doesn't cover the silent
eviction, because the student has no idea they needed to export until the data is
already gone. And this content is personal and effortful — it's the kind of loss that
generates an unhappy email to Ben rather than a shrug.

My concern is that this converts scheduled, predictable technical maintenance into
unscheduled support and data-loss triage, which lands on you anyway and is harder
work. The maintenance doesn't disappear; it changes shape.

---

## 4. Proposed: WordPress-native sync (extends what you already built)

You're already passing an authenticated WP identity into the app. The proposal is to
use that same handshake to persist the MAP server-side.

**The app stays on Vercel exactly where it is.** Only the plugin lives on Hostinger.
No hosting migration, no change to how the lesson embeds it.

```
Student opens lesson in SU (already logged into WordPress)
        |
        v
WP page renders <iframe src=".../?token=<JWT>">        <-- you have this
        |
        v
App boots, decodes token                               <-- you have this
        |
        v
App GETs  /wp-json/visionmap/v1/state   -> loads saved MAP   <-- to build
App POSTs /wp-json/visionmap/v1/state   -> saves on change   <-- to build
        |   (JWT sent in Authorization header, not cookies)
        v
Data stored in WP user meta, on Hostinger, in your existing backups
```

**Why the header matters:** because auth rides in the `Authorization` header rather
than a cookie, this path is unaffected by the iframe storage partitioning described
in §3b. It fixes the current fragility, not just the cross-device gap.

### What the plugin is

A single-file WordPress plugin, roughly 80 lines. Two REST routes:

| Route | Method | Does |
|---|---|---|
| `/wp-json/visionmap/v1/state` | GET | Return current user's saved MAP JSON |
| `/wp-json/visionmap/v1/state` | POST | Write MAP JSON to that user's meta |

Auth is `is_user_logged_in()` / the existing nonce or token — a user can only ever
read and write their own row. Storage is `update_user_meta()` with a JSON blob.
No new tables, no schema migrations, no cron.

### Why this answers your objection directly

- **No new platform.** No Supabase account, dashboard, or scaling model to learn.
- **No second login.** Enrollment *is* authentication. This also solves "restrict to
  enrolled students" for free.
- **No email service.** Kills the magic-link and Resend dependency entirely.
- **Your existing backups cover it.** MAP data is in the WP database you already back
  up. Restore path is the one you already know.
- **Your existing skills cover it.** It's WordPress + PHP + REST, not a new stack.

### Honest tradeoffs

- The WP plugin needs to send CORS headers allowing the Vercel origin, and verify the
  JWT server-side rather than trusting `is_user_logged_in()`. That's the main added
  work versus a same-origin setup, and it's modest — but it does mean the token needs
  a real signature check, not just a base64 decode.
- Token lifetime matters. If the JWT is short-lived, a student sitting in a long
  Hour of Power session could have a save rejected. Easiest fix is a longer-lived
  token scoped only to this endpoint, or refreshing it from the parent page.
- Students must be logged into SU to sync. Correct for a course tool; it does mean it
  stops being a shareable public link.
- User meta is fine at this scale (a MAP is a few KB, tens of KB with vision board
  images). If image uploads grow, move those to the WP media library and store URLs.
  Worth planning for, not worth solving on day one.
- **Export/Import stays.** Your import button remains the manual escape hatch and the
  student-facing backup. It complements this rather than being replaced by it.

### What maintenance actually looks like

Being concrete, since this was the crux of your concern:

- **Routine:** none. No servers, no jobs, no queue. It's user meta.
- **On WP core/PHP upgrades:** the two REST routes use long-stable APIs; breakage is
  unlikely but this is the thing to smoke-test after a major upgrade.
- **If a student reports lost data:** their MAP is a row in the DB you can query and
  restore from backup — which is strictly better than today, where lost is lost.
- **Scaling:** a few thousand students is a non-event for user meta.

---

## 5. Proposed division of labor

**Claude does:**
- Merge your `index.html` changes into the real source (WP token handling, the
  "Restart 66" rename, the Import Session button) so they're compiled in, not patched
  at runtime — and the `setInterval` goes away.
- Write the WordPress plugin.
- Write the app-side sync layer (load on boot, debounced save, offline-safe, keeps
  local-first as the fallback).
- Remove or properly wire the Supabase sign-in UI, per your call in §3a.
- Rebuild, redeploy, verify on the live URL.
- Write the runbook: how it works, how to check it, how to restore a student's data.

**Rey does (things only you can):**
- Install/activate the plugin on Hostinger.
- Confirm how the lesson page issues the token and where the app should be served
  from (subdirectory on WP vs. current subdomain).
- Own the deploy path going forward and tell us if any of the above conflicts with
  how SU is structured — you have context on that we don't.

---

## 6. Questions for you

1. **Where does the `?token=` JWT come from** — a plugin you wrote, JWT Auth, or a
   snippet? I need the signing method and secret location to verify it server-side,
   plus its expiry. This is the main blocker on my side.
2. **The Supabase sign-in card in §3a — remove it, or keep cloud sync as a
   fallback?** My recommendation is remove it, so there's exactly one sync story.
3. **Anything above that conflicts with how you've set up SU?** You have context on
   the platform that isn't visible from the code, and I'd rather adjust now.

If the WordPress route is a no for reasons not covered here, the alternative is a
6-character sync code against a hosted DB — no accounts, no email, no passwords.
Happy to spec that instead.

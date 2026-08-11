# Vision MAP Sync: Install & Runbook

For Rey. Covers installing the plugin, testing it, and everything you would need
if something goes wrong later.

---

## Part 1: Install (about 10 minutes)

### Step 1. Confirm the secret is defined

The plugin reads the same secret your `vercel_sso_iframe` shortcode signs with. In
`wp-config.php`, above the "That's all, stop editing" line, you should already have:

```php
define( 'VISIONMAP_JWT_SECRET', 'your-64-char-secret' );
```

If your shortcode currently uses a differently named constant, either rename it to
`VISIONMAP_JWT_SECRET` or add this line to the plugin near the top:

```php
define( 'VISIONMAP_JWT_SECRET', YOUR_EXISTING_CONSTANT_NAME );
```

The plugin and the shortcode must read the **same** secret or every request 401s.

### Step 2. Install the plugin

Upload `visionmap-sync.php` to `/wp-content/plugins/visionmap-sync/visionmap-sync.php`
(create the folder), then activate **Vision MAP Sync** in Plugins.

Single file, no dependencies, no build step, no database migration. It creates no
tables. Data lives in `wp_usermeta` under the key `visionmap_state`.

### Step 3. Confirm the allowed origin

The plugin defaults to allowing `https://visionmap.sellershipuniversity.com`. If the
app ever moves, override it in `wp-config.php`:

```php
define( 'VISIONMAP_ALLOWED_ORIGIN', 'https://your-new-host.com' );
```

### Step 4. Smoke test

Log into SU as a test student, open the Vision MAP lesson, then in the browser
console on the **lesson page**:

```js
// Should print your MAP object (or {} on a fresh account), not a 401.
fetch('https://sellershipuniversity.com/wp-json/visionmap/v1/state', {
  headers: { Authorization: 'Bearer ' + new URLSearchParams(
    document.querySelector('iframe[src*="visionmap"]').src.split('?')[1]
  ).get('token') }
}).then(r => r.json()).then(console.log)
```

Then the real test: type something into your Why, wait a few seconds, open the same
lesson in a different browser or on your phone, and confirm it is there.

---

## Part 2: How it actually works

```
Student opens lesson  ->  shortcode mints a 1 hour JWT  ->  iframe loads app
                                                              |
                          app decodes token (name, email, user_id)
                                                              |
                          GET  /wp-json/visionmap/v1/state  -> merge into device
                          POST /wp-json/visionmap/v1/state  -> on every change
                                                              |
                                              wp_usermeta.visionmap_state
```

**Local first is not a fallback, it is the default.** Every keystroke saves to the
browser immediately. The network is a background push. This means:

- No spinner ever blocks typing.
- Offline, the student keeps working normally.
- If a save cannot go out, the app sets a `pending` flag and shows "Will retry".
  The next successful sync sends the whole current state, so nothing is lost and
  there is no queue of diffs to replay.

**Token expiry is a normal condition, not an error.** The JWT lasts 1 hour and your
shortcode mints a fresh one on every lesson page load. If a student sits in the tool
for more than an hour and then edits, that save is deferred, and it uploads the next
time they open the lesson. If you want to reduce that window, raise `exp` in the
shortcode; nothing in the plugin needs to change.

**Merge rule.** When a device pulls from the server, server content wins for authored
text, but every date array (`challenge.markedDates`, the three `rituals` arrays) is
unioned. A day marked on a phone is never erased by opening the tool on a laptop.

---

## Part 3: Security notes

- The signature is verified before **any** claim is trusted, using `hash_equals`
  (constant time, so response timing cannot leak the signature).
- Only `HS256` is accepted. An attacker cannot swap the header to `alg: none` to skip
  verification, which is the classic JWT bypass.
- `user_id` comes **only** from the signed payload, never from anything the client
  sends. A student cannot address another student's row even by editing the request.
- CORS allows exactly one origin, not `*`, and does not allow credentials, because
  auth rides in the `Authorization` header rather than a cookie.
- Payloads over 2 MB are rejected so a runaway vision board cannot fill the database.

I verified the sign/verify logic against your shortcode's exact signing method,
including forged `user_id`, `alg: none`, expired, and stripped signature cases. All
rejected as expected.

---

## Part 4: Runbook

### Routine maintenance

None. No cron, no queue, no external service, no separate dashboard. It is two REST
routes and a user meta row.

### After a WordPress or PHP major upgrade

The plugin uses long stable APIs (`register_rest_route`, `get_user_meta`,
`hash_hmac`), so breakage is unlikely. Smoke test anyway: open the lesson, change
something, reload, confirm it persisted.

### "A student says they lost their MAP"

Their data is a row you can read directly:

```sql
SELECT meta_value FROM wp_usermeta
WHERE user_id = <ID> AND meta_key = 'visionmap_state';
```

Last write time:

```sql
SELECT meta_value FROM wp_usermeta
WHERE user_id = <ID> AND meta_key = 'visionmap_state_updated';
```

To restore from a backup, pull that row out of the backup and `update_user_meta` it
back. This is strictly better than the old localStorage only setup, where lost was
genuinely lost.

### "Sync is not working for anyone"

Check in this order:

1. **401 on every request.** The secret in `wp-config.php` does not match what the
   shortcode signs with. Most likely cause after any rotation.
2. **CORS error in the browser console.** `VISIONMAP_ALLOWED_ORIGIN` does not match
   the app's actual origin.
3. **404 on `/wp-json/visionmap/v1/state`.** Plugin deactivated, or permalinks need
   flushing (Settings > Permalinks > Save).
4. **413.** A student's vision board images pushed them past 2 MB. See below.

### If vision board images become a problem

Images are currently stored inline as data URLs inside the state JSON. That is fine
at small scale but it is the one thing that grows unbounded. If you start seeing 413s,
the fix is to upload images to the WP media library and store URLs instead. Worth
planning for, not worth doing preemptively.

### Rolling back

Deactivate the plugin. The app immediately falls back to local storage only and keeps
working. No data is deleted; student rows stay in `wp_usermeta` until you remove them.

---

## Part 5: What changed in the app

- Supabase removed completely. No accounts, no magic link emails, no second login.
  The bundle dropped from 450 KB to 247 KB as a result.
- Your three `index.html` changes are now compiled into the React source: the
  WordPress token pre-fill, the "Log Completion & Start Next Round" rename, and the
  "Import session from other device" button on the welcome screen.
- The `setInterval` DOM patch is gone. `index.html` is back to a clean shell, so
  nothing depends on matching button text at runtime any more.
- Export/Import is unchanged and still the manual escape hatch.

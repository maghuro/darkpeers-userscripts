// ==UserScript==
// @name         DarkPeers BONanza Giveaway — Maghuro Fork
// @namespace    https://github.com/maghuro/darkpeers-userscripts
// @description  BON giveaways on DarkPeers with an optional direct contribution to the BON Pool
// @version      1.3.24
// @author       🤖 T.R.A.V.I.S., Maghuro & M.A.E.S.T.R.O.
// @homepageURL  https://github.com/maghuro/darkpeers-userscripts
// @supportURL   https://github.com/maghuro/darkpeers-userscripts/issues
// @updateURL    https://raw.githubusercontent.com/maghuro/darkpeers-userscripts/main/userscripts/giveaway/DarkPeers_BONanza_Giveaway.user.js
// @downloadURL  https://raw.githubusercontent.com/maghuro/darkpeers-userscripts/main/userscripts/giveaway/DarkPeers_BONanza_Giveaway.user.js
// @icon         https://darkpeers.org/img/logo.png
// @grant        GM_getValue
// @grant        GM_setValue
// @license      GPL-3.0-or-later
// @match        https://darkpeers.org/
// @run-at document-idle
// ==/UserScript==

// DarkPeers-only fork of "Blutopia BON Giveaway" v6.2.2 by Nums (GPL-3.0-or-later).
// Changes in this fork:
//   - All non-DarkPeers tracker support, the upload.cx extra commands and the
//     openuserjs update check have been removed.
//   - A host-selected percentage (0-30%, steps of 5) of the final pot is
//     contributed directly to the DarkPeers BON Pool (/bon-pool).
//   - Winning number is drawn with crypto.getRandomValues (Math.random fallback).
//   - Storage keys and panel IDs are namespaced; if the original script is also
//     installed on the page, this one stands down; its toolbar button stays but
//     fades on hover, and blinks red on click while highlighting the original.
//   - A plain-text statement of every transaction is produced at the end of each
//     giveaway (Save .txt / Copy in the panel); the last two are kept locally.
//   - Player stats share the original script's localStorage record, so a host's
//     history carries across; a pre-1.2.0 fork record is merged in once.
//   - v1.2.1 hardens reload/multi-tab safety, persists sponsor/stat cursors,
//     draws the winning number only at payout time, makes !random range-safe,
//     and strengthens payout verification against stale gift messages.
//   - v1.2.2 added an interim TLCC bridge signature and cosmetic Rigged taxes.
//   - v1.2.3 contributes the selected share directly to DarkPeers /bon-pool,
//     verifies it before announcing success, and introduces authoritative URL
//     markers so TLCC can prefer this fork over legacy heuristic classifiers.
//   - v1.2.4 removes the obsolete fund-manager debug hook after the direct-pool migration.
//   - v1.2.5 matches the verified DarkPeers BON Pool browser form encoding.
//   - v1.2.6 audit-hardens live settlement: final sponsor sync, frozen entries,
//     authenticated gift endpoint resolution, ordered critical announcements,
//     bounded chat API sends, robust gift parsing, and exact BON Pool request semantics.
//   - v1.2.7 makes the persisted sponsor cursor authoritative client-side even
//     when UNIT3D ignores after_id, and retries the final sponsor sync three times.
//   - v1.2.8 guarantees every announced winner can receive at least 1 BON by
//     validating manual winner counts and capping sponsor-driven scaling to the pot.
//   - v1.2.9 makes giveaway closure a strict temporal boundary: the final sponsor
//     sync counts only gifts created before closure and never emits a racing digest.
//     It also normalizes fractional sponsor gifts to whole BON and narrows the
//     pre-draw crash window by keeping the active snapshot until sponsor sync ends.
//   - v1.2.10 recovers recently-expired snapshots instead of silently abandoning
//     them, and uses the scheduled endTs as the cutoff when a timer fires late.
//   - v1.2.11 makes the selected BON Pool percentage exact at pot level:
//     floor(total pot * pct / 100), while preserving at least 1 BON per winner.
//   - v1.2.12 gives the userscript an unambiguous Tampermonkey display name:
//     "DarkPeers BONanza Giveaway — Maghuro Fork".
//   - v1.2.13 makes bridge markers machine-only: the semantic emoji stays plain,
//     marker anchors self-label with their URL for clean IRC conversion, and giveaway
//     starts distinguish standard, BON Pool and Rigged Taxes structurally.
//   - v1.2.14 introduced a dedicated gift marker.
//   - v1.2.15 moves that marker to the actual standalone "/gift" help response;
//     giveaway announcement/reminder continuations remain part of GIVEAWAY.
//   - v1.2.16 enriches sponsor digests with matched gift-history messages, keeps
//     multi-gift/multi-sponsor notes attached to the correct donor, aligns digest
//     accounting to whole BON, improves punctuation, and marks host pot top-ups.
//   - v1.2.17 bounds sponsor digest detail so gift notes and multi-sponsor bursts
//     stay in one logical chat/IRC message instead of provoking bridge [1/2] splits.
//   - v1.3.0 promotes the live-tested fork: sponsor gift notes, multi-gift digest
//     correlation, authoritative TLCC markers and direct BON Pool settlement are
//     now the stable 1.3 baseline. Monetary BON values use the official ฿ symbol.
//   - v1.3.2 prefixes the self-duplicate-entry rejection with 🚫 so bridge clients
//     and TLCC can classify it unambiguously like the other rejected entry states.
//   - v1.3.3 fixes UNIT3D gift-history timestamp matching so sponsor notes survive
//     timezone differences, and makes machine bridge anchors empty/invisible on the
//     DarkPeers website for every viewer, not only hosts running the userscript.
//   - v1.3.4 persists matched sponsor gift notes in the active giveaway snapshot and
//     final statement, including multiple gifts/messages per sponsor and final-poll gifts.
//   - v1.3.5 added UNIT3D notification parsing for sponsor notes.
//   - v1.3.6 makes the persistent Gift History the canonical sponsor-note source and
//     uses notifications only per-event as fallback. UNIT3D can suppress/queue BON
//     notifications, while every successful gift is stored with its message first.
//   - v1.3.7 fixes real DarkPeers Gift History parsing: BON cells include a "Points"
//     suffix, "No note" is treated as no message, and naive history timestamps are
//     matched safely using both browser-local and UTC interpretations.
//   - v1.3.8 learns the real DarkPeers Gift-History ↔ chat-API clock offset from
//     unambiguous gifts instead of assuming browser-local/UTC equivalence. This
//     survives site-timezone/DST differences and disambiguates repeated same-value gifts.
//   - v1.3.9 makes authenticated UNIT3D Gift History the primary sponsor source for
//     sender, recipient, BON, note and event discovery. Chat API/SystemBot is now
//     fallback-only (history outage/recovery and exact final-cutoff disambiguation).
//   - v1.3.10 forces fresh Gift History/notification reads and guarantees matched
//     sponsor notes are never silently dropped by digest-length trimming: notes stay
//     inline when they fit and overflow into marked sponsor-note continuations.
//   - v1.3.11 announces every newly discovered sponsor batch on the next poll instead
//     of waiting up to 60 seconds. Multiple gifts discovered in the same poll remain
//     grouped, with each matched note attached to the correct sponsor.
//   - v1.3.12 restores self-labelled machine bridge anchors so the HTML→IRC bridge
//     no longer leaves orphaned "()" after giveaway emojis; TLCC still hides the URL.
//   - v1.3.13 gives BON Pool contribution giveaways a dedicated blue visual identity
//     (💙) while leaving regular giveaways, BONanza donations and Rigged Taxes distinct.
//   - v1.3.14 replaces public URL bridge markers with invisible styled sentinels. Every
//     marker kind now survives DarkPeers -> IRC -> The Lounge without exposing a URL
//     on the website or leaving bridge-generated "()" around a hidden link.
//   - v1.3.15 adds a final sponsor-note recap from canonical Gift History, introduces
//     a dedicated sponsor-messages bridge marker, and carries BON Pool / Rigged Taxes
//     context through every authoritative marker so TLCC can keep one event identity.
//   - v1.3.16 polishes the closing sequence: sponsors get a dedicated list line,
//     Gift History notes are grouped by sponsor under "Messages from our sponsors",
//     BON Pool prize accounting is explicit (gross vs pool), and pool settlement uses
//     the blue BON Pool identity consistently.
//   - v1.3.17 follows a full-source audit: final sponsor thanks/notes now also run
//     when a giveaway ends with zero entrants, the zero-entry audit log preserves the
//     real host/sponsor split, and repeated identical Gift History notes from distinct
//     gifts are no longer collapsed a second time during presentation.
//   - v1.3.18 completes the audit hardening: sponsor digest sends are serialized so
//     summaries, note continuations and scaling notices cannot race each other; live
//     note-only continuations use the dedicated MESSAGES marker; and large final
//     sponsor lists are proactively chunked before the website/IRC bridge can split them.
//   - v1.3.19 removes proactive chunking from the final sponsor list and makes the
//     zero-entry outcome explicit: there are no winners and 100% of the final pot
//     (host funding + sponsors) is contributed directly to the BON Pool and verified.
//   - v1.3.20 makes zero-entry settlement respect the selected BON Pool mode: with
//     Pool > 0 the full pot still goes to the Pool; with Pool = 0 the host keeps only
//     their own funding and every sponsor contribution is returned in full, with
//     idempotent refund gifts, chat verification and statement/audit tracking.
//   - v1.3.21 shortens refund gift notes to "Giveaway refund" and verifies outgoing
//     sponsor refunds primarily against authenticated Gift History; the chat API is
//     retained only as a fallback when Gift History itself is unavailable.
//   - v1.3.22 hardens the chat fallback: only genuine SystemBot gift events whose
//     parsed sender is one of the host/self identities may satisfy an expected payout
//     or refund. User-written lookalike messages can never confirm a transaction.
//   - v1.3.23 full-audit hardening: serialize sponsor polls to prevent overlapping
//     Gift History/chat-fallback passes from double-counting gifts, restore the intended
//     six-reminder cap, normalize host checks, await host pot announcements, and make
//     refund verification/status labels accurately distinguish Gift History from chat.
//   - v1.3.24 closes the one-shot audit findings: restores are host-bound, cross-tab
//     ownership uses Web Locks where available, settlement remains resumable until
//     completion, sponsor opening/closing boundaries constrain Gift History and in-flight
//     polls, host top-ups are serialized, and delayed verification is statement-bound.
//// DarkPeers BONanza fork created and maintained by T.R.A.V.I.S. for the DarkPeers staff.
// Further development and maintenance by Maghuro & M.A.E.S.T.R.O.

// Original credits (Blutopia BON Giveaway)
// @Nums - original author
// Additional credits
// @TheEther - Integration with Aither + some additional features
// @Nums - added new commands, command spam detection, admin controls, multi-winners, refactored BON API polling + trying to keep the public version updated
// @ahoimate - got BON gifting API polling working + added new commands
// @ruckus612 - fixed BON gift bug
// @ZukoXZuko - added formatting to the giveaway menu

(function() {
    'use strict';

    // ───────────────────────────────────────────────────────────
    // SECTION 1: Global Constants and Configuration
    // ───────────────────────────────────────────────────────────
    const COMMAND_WINDOW_MS = 10000; // look back 10 seconds
    const MAX_COMMANDS_PER_WINDOW = 3; // allow 3 commands in that window
    const BASE_PENALTY_SECONDS = 30; // base lockout for exceeding (in seconds)

    // Spam filter tightening (keeps responses snappy but reduces chat spam):
    // - MIN_ACTION_GAP_MS blocks ultra-fast repeat triggers (usually bots/double-sends)
    // - REPEAT_COMMAND_COOLDOWNS_MS prevents the same command from being spammed for identical output
    // - strikes increase lockout length for repeat offenders (decays over time)
    const MIN_ACTION_GAP_MS = 900; // ignore triggers faster than this per user
    const ENTRY_FEEDBACK_COOLDOWN_MS = 8000; // throttle duplicate/out-of-range feedback per user
    const STRIKE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
    const MAX_STRIKE_MULTIPLIER = 8; // caps exponential backoff

    const REPEAT_COMMAND_COOLDOWNS_MS = Object.freeze({
        entry: 2000,
        time: 3000,
        entries: 5000,
        free: 7000,
        lucky: 7000,
        luckye: 7000,
        random: 7000,
        range: 5000,
        sponsors: 8000,
        stats: 8000,
        top: 8000,
        most: 8000,
        largest: 8000,
        scale: 5000
    });const RIG_DENY_COOLDOWN_MS = 10000; // 10s per-user cooldown for funny !rig/!unrig denial messages
    const MAX_WINNERS = 50; // central location to update max allowable number of winners
    const MAX_REMINDERS = 6; //maximum number of reminders allowed
    const PAYOUT_GIFT_GAP_MS = 150; // small spacing between sequential payout requests
    const SPONSOR_GIFT_HISTORY_POLL_MS = 10_000; // primary UNIT3D Gift History polling cadence

    // Persistent stats (saved in localStorage on this site)
    // GM store is per-script anyway; the v2 suffix retires the pre-1.2.0 copy so it can
    // never out-date the shared record and overwrite it (see migrateLegacyForkStats).
    const STATS_KEY_GM = `BONANZA_GIVEAWAY_STATS_v2::${location.hostname}`;
    const STATS_KEY_LS_LEGACY_FORK = `BONANZA_GIVEAWAY_STATS::${location.hostname}`;
    // Shared with the original "Blutopia BON Giveaway" script on purpose: stats are
    // additive counters with no payout logic, and the loader below picks whichever
    // copy is newer, so months of history carry across when a host switches scripts.
    const STATS_KEY_LS = `BON_GIVEAWAY_STATS::${location.hostname}`;
    const STATS_VERSION = 1;
    const STATS_DEFAULT_TOP_N = 3;
    const STATS_MAX_TOP_N = 10;

    // Default text to populate the custom giveaway message field
    const DEFAULT_CUSTOM_MESSAGE = "";
    const GIFT_HINT_COLOR = "#F3D34A";
    const SCALING_ACCENT_COLOR = "#7C4DFF";
    const BON_SYMBOL = "฿";

    const ENTRY_IGNORE_WINDOW_MS = 2000;



    // Sponsor announcement controls.
    // Live policy: flush immediately after each poll that discovers gifts. All gifts
    // found in that one poll are still grouped into a single sponsor announcement.
    // "digest" remains supported for experiments, but is not the production default:
    // a short giveaway could otherwise end before a small pending gift was announced.
    // - digest_ms: max wait when mode="digest"
    // - immediate_single_min / flush_min_total: early-flush thresholds in digest mode
    // - show_top_n / show_min_per_user: keep the line short; omit tiny sponsors from the name list (still counted in totals)
    const SPONSOR_ANNOUNCE = {
        mode: "immediate",
        digest_ms: 60_000,
        immediate_single_min: 500,
        flush_min_total: 250,
        max_pending_events: 50,
        show_top_n: Infinity,
        show_min_per_user: 0,
        max_visible_chars: 300,
        max_note_chars: 72,
        max_notes_per_sponsor: 2
    };

    const GENERAL_SETTINGS = {
        disable_random: false,
        disable_lucky: false,
        disable_free: false,
        suppress_entry_replies: false,
        silent_mode: false
    };

    const DEBUG_SETTINGS = {
        log_chat_messages: false,
        disable_chat_output: false,
        verify_extractor: false,
        verify_sendmessage: false,
        verify_cacheChatContext: false,
        suppressApiMessages: false, // new flag to suppress API message sending
        enable_self_checks: false
    };

    const PERF = false; // Debug-only perf counters (must stay false in normal use)
    const PERF_LOG_EVERY = 50;
    const perfCounters = PERF ? Object.create(null) : null;
    function perfMeasure(section, startMs) {
        if (!PERF) return;
        const elapsed = performance.now() - startMs;
        const rec = perfCounters[section] || (perfCounters[section] = { count: 0, total: 0, max: 0 });
        rec.count += 1;
        rec.total += elapsed;
        if (elapsed > rec.max) rec.max = elapsed;
        if ((rec.count % PERF_LOG_EVERY) === 0) {
            console.debug(
                `[BON Giveaway PERF] ${section}: count=${rec.count}, avg=${(rec.total / rec.count).toFixed(2)}ms, max=${rec.max.toFixed(2)}ms`
            );
        }
    }

    const SELF_CHECK_FLAG = "BONANZA_GIVEAWAY_SELF_CHECKS";
    const SELF_CHECK_QUERY_RE = /(?:^|[?&])bg_self_checks=1(?:&|$)/i;
    const SELF_CHECKS_ENABLED = !!(
        DEBUG_SETTINGS.enable_self_checks ||
        localStorage.getItem(SELF_CHECK_FLAG) === "true" ||
        SELF_CHECK_QUERY_RE.test(String(window.location.search || ""))
    );

    function selfCheck(condition, message, details) {
        if (!SELF_CHECKS_ENABLED || condition) return;
        const err = new Error(`[BON Giveaway self-check] ${message}`);
        if (details && typeof details === "object") {
            try {
                console.error(err.message, details);
            } catch {
                console.error(err.message);
            }
        } else {
            console.error(err.message);
        }
        throw err;
    }

    // ── DarkPeers site constants (this fork runs on darkpeers.org only) ──
    const DARKPEERS_CHATROOM_ID = '2';

    function getMessageContentElement(messageNode) {
        if (!messageNode || messageNode.nodeType !== 1) return null;
        return messageNode.querySelector('.chatbox-message__content');
    }

    function getGiftEndpointPath(slug) {
        const raw = String(slug || "").trim();
        if (!raw) return null;
        let decoded = raw;
        try { decoded = decodeURIComponent(raw); } catch {}
        return `/users/${encodeURIComponent(decoded)}/gifts`;
    }

    function getAuthenticatedUserSlug() {
        const navLink = document.querySelector('.top-nav__username a[href*="/users/"]');
        if (navLink) {
            try {
                const url = new URL(navLink.getAttribute("href") || navLink.href || "", location.origin);
                const parts = url.pathname.split("/").filter(Boolean);
                const idx = parts.findIndex(part => part.toLowerCase() === "users");
                if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
            } catch {}
        }

        const username = getLoggedInUsername() || giveawayData?.host || "";
        return username ? encodeURIComponent(username) : "";
    }

    // ── DarkPeers BON Pool ──────────────────────────────────────
    const BONANZA = Object.freeze({
        FUND_NAME: "BON Pool",
        POOL_PATH: "/bon-pool",
        POOL_STORE_PATH: "/bon-pool/store",
        PERCENT_OPTIONS: Object.freeze([0, 5, 10, 15, 20, 25, 30]),
        MAX_PERCENT: 30,
        ACCENT_COLOR: "#4FAFFF",
        GIVEAWAY_COLOR: "#4FAFFF",
        VERIFY_ATTEMPTS: 6,
        VERIFY_DELAY_MS: 2500,
        FETCH_TIMEOUT_MS: 8000
    });

    // Authoritative website -> DP -> IRC -> The Lounge contract.
    //
    // v1.3.14 deliberately does NOT use links for machine markers. A link is public
    // website content, and HTML -> IRC bridges commonly serialize a labelled link as
    // "label (URL)". Hiding only the <a> in TLCC then leaves orphaned parentheses.
    //
    // Instead, every marker is encoded as two U+2063 INVISIBLE SEPARATOR sentinels:
    //   1) a fixed bold+italic+underline prefix sentinel;
    //   2) an italic+underline sentinel whose colour identifies the marker kind.
    //
    // The type colours use The Lounge's IRC palette: the canonical 0..15 set plus
    // extended colour 16 for sponsor-message recaps. They are invisible on DarkPeers
    // because U+2063 has zero visual width, while the bridge preserves their formatting
    // as IRC style spans that TLCC can select.
    const BRIDGE_SENTINEL = "\u2063";
    const BRIDGE_MARKERS = Object.freeze({
        START: "start",
        START_POOL: "start-pool",
        START_TAXES: "start-taxes",
        GIFT: "gift",
        POT: "pot",
        SPONSORS: "sponsors",
        SPONSOR_MESSAGES: "sponsor-messages",
        ENTRIES: "entries",
        STATS: "stats",
        TIME: "time",
        RESULT: "result",
        TIE: "tie",
        RIGGED: "rigged",
        UNRIGGED: "unrigged",
        NAUGHTY: "naughty",
        POOL_PAID: "pool-paid",
        TAXES_PAID: "taxes-paid"
    });
    const BRIDGE_SENTINEL_COLORS = Object.freeze({
        "start":       "#FFFFFF", // IRC 00
        "start-pool":  "#000000", // IRC 01
        "start-taxes": "#001F3F", // IRC 02
        "gift":        "#2ECC40", // IRC 03
        "pot":         "#FF4136", // IRC 04
        "sponsors":         "#85144B", // IRC 05
        "sponsor-messages": "#470000", // IRC 16
        "entries":          "#B10DC9", // IRC 06
        "stats":       "#FF851B", // IRC 07
        "time":        "#FFDC00", // IRC 08
        "result":      "#01FF70", // IRC 09
        "tie":         "#39CCCC", // IRC 10
        "rigged":      "#7FDBFF", // IRC 11
        "unrigged":    "#0074D9", // IRC 12
        "naughty":     "#F012BE", // IRC 13
        "pool-paid":   "#AAAAAA", // IRC 14
        "taxes-paid":  "#DDDDDD"  // IRC 15
    });

    const BRIDGE_CONTEXT_COLORS = Object.freeze({
        pool: "#0074D9",  // IRC 12, distinguished by bold+underline (no italic)
        taxes: "#F012BE"  // IRC 13, distinguished by bold+underline (no italic)
    });

    function getActiveBridgeContext() {
        try {
            const pct = Math.max(0, Number(giveawayData?.donationPercent) || 0);
            if (!(pct > 0)) return "";
            return riggedMode ? "taxes" : "pool";
        } catch {
            return "";
        }
    }

    function bridgeMarker(kind, visible, contextOverride = null) {
        const safeKind = String(kind || "").replace(/[^a-z0-9-]/gi, "").toLowerCase();
        const markerColor = BRIDGE_SENTINEL_COLORS[safeKind];
        const safeVisible = String(visible ?? "");

        // Unknown marker kinds must fail visibly-safe: keep the human-facing emoji/text,
        // but never fall back to a public implementation URL.
        if (!markerColor) return safeVisible;

        const prefix = `[b][i][u]${BRIDGE_SENTINEL}[/u][/i][/b]`;
        const typed = `[i][u][color=${markerColor}]${BRIDGE_SENTINEL}[/color][/u][/i]`;

        // Carry the active giveaway family independently of the message type. The
        // optional override is intentionally narrow: exceptional settlement messages
        // can explicitly identify as BON Pool even if the running event was standard
        // or had Rigged Taxes enabled.
        const requestedContext = String(contextOverride || "").toLowerCase();
        const context = Object.prototype.hasOwnProperty.call(BRIDGE_CONTEXT_COLORS, requestedContext)
            ? requestedContext
            : getActiveBridgeContext();
        const contextColor = BRIDGE_CONTEXT_COLORS[context];
        const contextual = contextColor
            ? `[b][u][color=${contextColor}]${BRIDGE_SENTINEL}[/color][/u][/b]`
            : "";

        return `${safeVisible}${prefix}${typed}${contextual}`;
    }
    const LS_DONATION_PERCENT = `bonanza-giveaway-donationPercent::${location.hostname}`;
    // End-of-giveaway statements (plain text). Only the most recent few are kept.
    const LS_STATEMENTS = `bonanza-giveaway-statements::${location.hostname}`;
    const STATEMENTS_KEEP = 2;

    // Mutual exclusion with the original "Blutopia BON Giveaway" script (see injectMenu)
    const ORIGINAL_SCRIPT_SELECTOR = "#giveawayFrame";
    let conflictWatchTimer = null;

    const BUTTON_CSS = `
/* Legacy v1.2.3-v1.3.13 URL markers may still exist in already-loaded scrollback.
   Keep hiding those old anchors for hosts running the userscript. v1.3.14 emits
   invisible styled sentinels instead and therefore needs no website-side hiding. */
.chatbox-message__content a[href*="#dpgw-v1-"] {
  display: none !important;
}

/* ── Toolbar button: "Neon Edge" (fx-94), sized for the chat header ── */
#chatbox_header .bonanza-btn {
  /* Theme tokens — override these to recolour the button */
  --primary: #60FDFC;         /* neon glow */
  --secondary: #0F191E;
  --surface: #E2F1F2;
  --bink: var(--surface);     /* ink / foreground (light, for the dark chat header) */
  --bsurf: var(--secondary);  /* surface / background */
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  vertical-align: middle;
  margin: 0 6px 0 0;
  font-family: "JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 5px 10px;
  border: 1px solid var(--bink);
  border-radius: 6px;
  background: transparent;
  color: var(--bink);
  cursor: pointer;
  overflow: visible;
  white-space: nowrap;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
#chatbox_header .bonanza-btn .btn-label {
  position: relative;
  z-index: 2;
  display: inline-block;
  transition: inherit;
}
#chatbox_header .bonanza-btn .bonanza-btn__icon {
  position: relative;
  z-index: 2;
  width: 15px;
  height: 12px;
  flex: 0 0 auto;
  transition: inherit;
}
#chatbox_header .bonanza-btn.fx-94:hover,
#chatbox_header .bonanza-btn.fx-94:focus-visible {
  border-color: var(--primary);
  color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 1px var(--primary),
              0 0 10px color-mix(in srgb, var(--primary) 70%, transparent),
              inset 0 0 8px color-mix(in srgb, var(--primary) 40%, transparent);
}
#chatbox_header .bonanza-btn.fx-94:active {
  transform: translateY(1px);
}

/* ── Conflict mode (original BON Giveaway script also installed) ──
   At rest the button looks normal; on hover it fades and shrinks; on click it
   blinks red while the original script's button glows orange and shakes. */
#chatbox_header .bonanza-btn.bonanza-btn--conflict:hover,
#chatbox_header .bonanza-btn.bonanza-btn--conflict:focus-visible {
  opacity: 0.35;
  transform: scale(0.86);
  border-color: var(--bink);
  color: var(--bink);
  box-shadow: none;
  cursor: not-allowed;
}
#chatbox_header .bonanza-btn.bonanza-btn--conflict:active { transform: scale(0.86); }
#chatbox_header .bonanza-btn.bonanza-btn--conflict.bonanza-blink-red {
  animation: bonanzaBlinkRed 0.9s steps(1, end) 0s 1;
}
@keyframes bonanzaBlinkRed {
  0%, 20%, 40%, 60% { opacity: 1; transform: scale(1); color: #fff; border-color: #ff3b3b; background: #ff3b3b; box-shadow: 0 0 0 1px #ff3b3b, 0 0 12px #ff3b3b; }
  10%, 30%, 50%     { opacity: 1; transform: scale(1); color: var(--bink); border-color: var(--bink); background: transparent; box-shadow: none; }
  100%              { opacity: 0.35; transform: scale(0.86); }
}
/* The original script's button, tagged by this script when a conflict is detected */
#chatbox_header .bonanza-orig-btn {
  display: inline-block;
  border-radius: 6px;
  transition: box-shadow 0.3s ease, color 0.3s ease;
}
#chatbox_header .bonanza-orig-btn.bonanza-orig-alert {
  color: #ff9f1c !important;
  box-shadow: 0 0 0 1px #ff9f1c, 0 0 12px #ff9f1c, inset 0 0 8px rgba(255, 159, 28, 0.45);
  animation: bonanzaShake 0.9s cubic-bezier(0.36, 0.07, 0.19, 0.97) 0s 1;
}
@keyframes bonanzaShake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}
#bonanzaGiveawayConflictToast {
  position: fixed; left: 50%; top: 72px; transform: translateX(-50%);
  z-index: 10000; max-width: 460px; padding: 10px 14px; border-radius: 8px;
  background: #2a1414; color: #ffd9d9; border: 1px solid #ff3b3b;
  font-size: 13px; line-height: 1.4; box-shadow: 0 6px 20px rgba(0,0,0,0.5);
  opacity: 0; transition: opacity 0.25s ease;
}
#bonanzaGiveawayConflictToast.show { opacity: 1; }
`;

    function normalizeDonationPercent(raw) {
        const n = Math.floor(Number(raw));
        if (!Number.isFinite(n)) return 0;
        return BONANZA.PERCENT_OPTIONS.includes(n) ? n : 0;
    }


    const LS_SUPPRESS = "bonanza-giveaway-suppressEntryReplies";
    const LS_SILENT = "bonanza-giveaway-silentMode";
    const LS_SHOW_GIVEAWAY_LOG = "bonanza-giveaway-showLog";
    const LS_HOST_PANEL_OPEN = "bonanza-giveaway-hostPanelOpen";
    const LS_HOST_PANEL_POS = "bonanza-giveaway-hostPanelPos";
    const LS_MINIMIZED = "bonanza-giveaway-minimized";
    const LS_PRESETS = "bonanza-giveaway-presets";
    const LS_ACTIVE_GIVEAWAY = `bonanza-giveaway-activeState::${location.hostname}`;
    const LS_TAB_LOCK = `bonanza-giveaway-tabLock::${location.hostname}`;
    // Per-giveaway ledger of completed gift attempts. Survives reload + visible to other tabs,
    // so even if endGiveaway runs in two tabs the second one won't re-pay.
    const LS_PAID_GIFTS = `bonanza-giveaway-paidGifts::${location.hostname}`;
    const LS_POOL_CONTRIBUTIONS = `bonanza-giveaway-poolContributions::${location.hostname}`;
    // Cap retained giveaway-id entries in the ledger so it can't grow unbounded over time.
    const PAID_GIFTS_MAX_GIVEAWAYS = 50;
    const TAB_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const TAB_LOCK_HEARTBEAT_MS = 5000;   // update lock every 5s
    const TAB_LOCK_STALE_MS = 15000;      // lock is stale if no heartbeat for 15s
    const TAB_WEB_LOCK_NAME = `bonanza-giveaway-owner::${location.hostname}`;
    const EXPIRED_SNAPSHOT_SETTLEMENT_GRACE_MS = 60 * 60 * 1000; // 1h after scheduled end
    let tabLockHeartbeatTimer = null;
    let tabWebLockRelease = null;
    let tabWebLockAcquirePromise = null;
    let hostAddBonInFlight = false;

    function readStoredBooleanSetting(key, fallback = false, persistFallback = false) {
        const raw = localStorage.getItem(key);
        if (raw === "true") return true;
        if (raw === "false") return false;
        if (persistFallback) {
            localStorage.setItem(key, String(!!fallback));
        }
        return !!fallback;
    }

    // Initialize silent mode as early as possible (no page refresh needed).
    GENERAL_SETTINGS.silent_mode = readStoredBooleanSetting(LS_SILENT, false, true);
    GENERAL_SETTINGS.show_giveaway_log = readStoredBooleanSetting(LS_SHOW_GIVEAWAY_LOG, false, true);

    const chatroomId = DARKPEERS_CHATROOM_ID;
    const chatboxId = "chatbox__messages-create";

    const COMMAND_PANEL_SECTIONS = Object.freeze({
        giveaway: "General Commands",
        stats: "Stats Commands",
        entry: "Entry Commands",
        help: "Help",
        rigging: "Rigging Commands",
        pot: "BON Commands"
    });
    const HOST_PANEL_NAUGHTY_SECTION_TITLE = "Naughty List";
    const HOST_PANEL_END_COMMAND_DENYLIST = Object.freeze(["end", "endgiveaway", "giveawayend", "stop", "stopgiveaway"]);
    const HOST_PANEL_INTERNAL_COMMAND_DENYLIST = Object.freeze(["commands"]);
    const HOST_PANEL_SECTION_ORDER = Object.freeze(["giveaway", "stats", "pot", "entry", "rigging", "help"]);
    const HOST_PANEL_COMMAND_SECTION_BY_KEY = Object.freeze({
        reminder: "giveaway",
        entries: "giveaway",
        time: "giveaway",
        addtime: "giveaway",
        removetime: "giveaway",
        winners: "giveaway",
        maxwinners: "giveaway",
        scale: "giveaway",
        stats: "stats",
        top: "stats",
        most: "stats",
        largest: "stats",
        unlucky: "stats",
        sponsors: "stats",
        help: "help",
        gift: "help",
        bon: "pot",
        addbon: "pot",
        rig: "rigging",
        unrig: "rigging",
        naughty: "naughty"
    });
    const HOST_PANEL_COMMAND_ORDER_BY_SECTION = Object.freeze({
        giveaway: Object.freeze(["reminder", "entries", "time", "addtime", "removetime", "winners", "maxwinners", "scale"]),
        stats: Object.freeze(["stats", "top", "most", "largest", "unlucky", "sponsors"]),
        help: Object.freeze(["help", "gift"]),
        pot: Object.freeze(["bon", "addbon"]),
        rigging: Object.freeze(["rig", "unrig"])
    });

    // only run the cooldown/spam‑detection logic on available commands
    const baseCommands = ["time", "entries", "help", "commands", "bon", "range", "gift","random", "number", "free", "lucky", "luckye", "rig", "unrig", "stats", "top", "most", "sponsors", "unlucky", "largest", "scale"];
    const hostCommands = ["addtime", "removetime", "reminder", "addbon", "end", "winners", "maxwinners", "naughty"];
    const validCommands = new Set([
        ...baseCommands,
        ...hostCommands
    ]);
    const HOST_PANEL_COMMAND_METADATA = Object.freeze({
        time: { label: "Time", section: "giveaway", description: "Show remaining giveaway time.", usage: "!time", requiresGiveaway: true },
        entries: { label: "Entries", section: "info", description: "List current entries.", usage: "!entries", requiresGiveaway: true },
        help: { label: "Help", section: "info", description: "Show available commands in chat.", usage: "!help", requiresGiveaway: false },
        commands: { label: "Commands", section: "info", description: "Alias for !help.", usage: "!commands", requiresGiveaway: false },
        stats: { label: "Stats", section: "info", description: "Show saved stats for a user.", usage: "!stats [username]", requiresGiveaway: false,
                args: [{ name: "username", label: "User", type: "username", required: false, placeholder: "optional username" }] },
        top: { label: "Top", section: "info", description: "Top winners leaderboard.", usage: "!top [N]", requiresGiveaway: false,
              args: [{ name: "count", label: "N", type: "int", required: false, min: 1, max: STATS_MAX_TOP_N, placeholder: String(STATS_DEFAULT_TOP_N) }] },
        most: { label: "Most", section: "info", description: "Most BON won leaderboard.", usage: "!most [N]", requiresGiveaway: false,
               args: [{ name: "count", label: "N", type: "int", required: false, min: 1, max: STATS_MAX_TOP_N, placeholder: String(STATS_DEFAULT_TOP_N) }] },
        sponsors: { label: "Sponsors", section: "pot", description: "Show top sponsors.", usage: "!sponsors [N]", requiresGiveaway: false,
                   args: [{ name: "count", label: "N", type: "int", required: false, min: 1, max: STATS_MAX_TOP_N, placeholder: String(STATS_DEFAULT_TOP_N) }] },
        unlucky: { label: "Unlucky", section: "info", description: "Show most losses leaderboard.", usage: "!unlucky [N]", requiresGiveaway: false,
                  args: [{ name: "count", label: "N", type: "int", required: false, min: 1, max: STATS_MAX_TOP_N, placeholder: String(STATS_DEFAULT_TOP_N) }] },
        largest: { label: "Largest", section: "info", description: "Show largest giveaways.", usage: "!largest [N]", requiresGiveaway: false,
                  args: [{ name: "count", label: "N", type: "int", required: false, min: 1, max: STATS_MAX_TOP_N, placeholder: String(STATS_DEFAULT_TOP_N) }] },
        gift: { label: "Gift", section: "pot", description: "Show giveaway gift status.", usage: "!gift", requiresGiveaway: true },
        bon: { label: "BON", section: "pot", description: "Show current pot amount.", usage: "!bon", requiresGiveaway: true },
        range: { label: "Range", section: "entry", description: "Show valid entry range.", usage: "!range", requiresGiveaway: true },
        lucky: { label: "Lucky", section: "entry", description: "Show lucky number.", usage: "!lucky", requiresGiveaway: true },
        luckye: { label: "Lucky Enter", section: "entry", description: "Enter using lucky number.", usage: "!luckye", requiresGiveaway: true },
        rig: { label: "Rig", section: "entry", description: "Fun rig toggle command.", usage: "!rig", requiresGiveaway: true },
        unrig: { label: "Unrig", section: "entry", description: "Fun rig toggle command.", usage: "!unrig", requiresGiveaway: true },
        random: { label: "Random", section: "entry", description: "Enter with a random number.", usage: "!random", requiresGiveaway: true },
        number: { label: "Number", section: "entry", description: "Show your current entry.", usage: "!number", requiresGiveaway: true },
        free: { label: "Free", section: "entry", description: "Show available entry numbers.", usage: "!free", requiresGiveaway: true },
        addbon: { label: "Add BON", section: "pot", description: "Add BON to the pot.", usage: "!addbon <amount>", requiresGiveaway: true, hostOnly: true,
                 args: [{ name: "amount", label: "BON", type: "int", required: true, min: 1, placeholder: "amount" }] },
        reminder: { label: "Reminder", section: "giveaway", description: "Send reminder now.", usage: "!reminder", requiresGiveaway: true, hostOnly: true },
        winners: { label: "Winners", section: "giveaway", description: "Set winner count.", usage: `!winners 1-${MAX_WINNERS}`, requiresGiveaway: true, hostOnly: true,
                  args: [{ name: "count", label: "Count", type: "int", required: true, min: 1, max: MAX_WINNERS, placeholder: "winners" }] },
        maxwinners: { label: "Max Winners", section: "giveaway", description: "Set max scaled winners.", usage: `!maxwinners 1-${MAX_WINNERS}`, requiresGiveaway: true, hostOnly: true,
                     args: [{ name: "count", label: "Max", type: "int", required: true, min: 1, max: MAX_WINNERS, placeholder: "max" }] },
        scale: { label: "Scale", section: "info", description: "Show scaling progress.", usage: "!scale", requiresGiveaway: true },
        addtime: { label: "Add Time", section: "giveaway", description: "Add giveaway minutes.", usage: "!addtime <minutes>", requiresGiveaway: true, hostOnly: true,
                  args: [{ name: "minutes", label: "Min", type: "int", required: true, min: 1, placeholder: "minutes" }] },
        removetime: { label: "Remove Time", section: "giveaway", description: "Remove giveaway minutes.", usage: "!removetime <minutes>", requiresGiveaway: true, hostOnly: true,
                     args: [{ name: "minutes", label: "Min", type: "int", required: true, min: 1, placeholder: "minutes" }] },
        naughty: { label: "Naughty", section: "giveaway", description: "Manage naughty list.", usage: "!naughty (add|remove|list) [username]", requiresGiveaway: true, hostOnly: true,
                  args: [
                      { name: "action", label: "Action", type: "select", required: true, placeholder: "action", options: [{ label: "Add", value: "add" }, { label: "Remove", value: "remove" }, { label: "List", value: "list" }], validate: (v) => /^(add|remove|list)$/i.test(String(v || "").trim()), hint: "Use add, remove, or list." },
                      { name: "username", label: "User", type: "username", required: false, placeholder: "username", requiredWhen: (all) => /^(add|remove)$/i.test(String(all.action || "").trim()), hint: "Username is required for add/remove." }
                  ] },
        end: { label: "End", section: "giveaway", description: "End the active giveaway.", usage: "!end [host]", requiresGiveaway: true, hostOnly: true,
              args: [{ name: "host", label: "Host", type: "username", required: false, placeholder: "optional host" }] },
    });

    // Declared early so UI init paths can safely reference this object before command handlers are populated.
    const COMMAND_HANDLERS = Object.create(null);

    // ───────────────────────────────────────────────────────────
    // SECTION 2: Runtime State Variables
    // ───────────────────────────────────────────────────────────
    let giveawayStartTime;
    let sponsorsInterval;
    let observer;
    let giveawayData;
    let chatbox = null;
    let reminderRetryTimeout = null;
    let frameHeader;
    let OT_USER_ID = null;
    let OT_CHATROOM_ID = null;
    let OT_CSRF_TOKEN = null;
    let riggedMode = false; // fun cosmetic mode, does NOT affect fairness

    // Grouped mutable collections (keeps behavior while improving maintainability/discoverability).
    const state = {
        moderation: {
            userCooldown: new Map(), // authorKey(lower) → timestamp(ms) when lockout ends
            userCommandLog: new Map(), // authorKey(lower) → [timestamps of recent triggers]
            userLastActionAt: new Map(), // authorKey(lower) → last trigger timestamp(ms)
            userLastCommandAt: new Map(), // `${authorKey}::${command}` → last timestamp(ms)
            userSpamStrikes: new Map(), // authorKey(lower) → { count:number, lastAt:number }
            userFeedbackCooldown: new Map(), // `${authorKey}::${bucket}` → last feedback timestamp(ms)
            rigDenyCooldown: new Map() // author → timestamp(ms) when next rig/unrig deny message is allowed
        },
        entries: {
            numberEntries: new Map(),
            numberTakenBy: new Map(), // entryNumber -> author (fast duplicate checks)
            fancyNames: new Map(),
            naughtyWarned: new Set() // Users that have already been warned this giveaway
        },
        liveStats: {
            enteredThisGiveaway: new Set(), // userKey
            sponsorSeenThisGiveaway: new Set(), // sponsorKey (for sponsorCount once/giveaway)
            sponsorTotalThisGiveaway: new Map() // sponsorKey -> running total
        },
        winners: {
            winnerPayouts: new Map(), // lowercase author -> BON amount
            winnerGiftStatus: new Map() // lowercase author -> "pending" | "confirmed" | "failed"
        },
        audit: {
            giveawayLog: []
        }
    };

    const { userCooldown, userCommandLog, userLastActionAt, userLastCommandAt, userSpamStrikes, userFeedbackCooldown, rigDenyCooldown } = state.moderation;
    const { numberEntries, numberTakenBy, fancyNames, naughtyWarned } = state.entries;
    const { enteredThisGiveaway: liveEnteredThisGiveaway, sponsorSeenThisGiveaway: liveSponsorSeenThisGiveaway, sponsorTotalThisGiveaway: liveSponsorTotalThisGiveaway } = state.liveStats;
    const { winnerPayouts, winnerGiftStatus } = state.winners;
    const { giveawayLog } = state.audit;

    const normalizeLower = (value) => String(value || "").trim().toLowerCase();
    const CHAT_MESSAGE_SELECTOR = '.chatbox-message';
    const CHATROOM_MESSAGES_SELECTOR = '.chatroom__messages';
    const GIFT_AMOUNT_RE = /has gifted\s*([0-9]+(?:\.[0-9]{1,2})?)\s*BON/i;
    const giftDOMParser = new DOMParser();

    let entriesTableEl = null;
    let entriesTbodyEl = null;
    let chatMessagesListEl = null;
    const entryRowByKey = new Map();

    const regNum = /^-?\d+$/; // matches integers (including negative) for entry detection

    /* --- Naughty (exclusion) list ------------------------------------- */
    const NAUGHTY_KEY = "bonanza-giveaway-naughty-list";
    const naughtySet = new Set(
        JSON.parse(localStorage.getItem(NAUGHTY_KEY) || "[]")
        .map(normalizeLower) // store lowercase for case-insensitive match
    );
    function saveNaughty() {
        localStorage.setItem(NAUGHTY_KEY, JSON.stringify([...naughtySet]));
    }

    // Toolbar button icon: Font Awesome Free 7 "robot" (solid), CC BY 4.0, https://fontawesome.com
    // Inlined as SVG so it does not depend on the site's icon font.
    const ROBOT_SVG =
        '<svg class="bonanza-btn__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" aria-hidden="true" focusable="false">' +
        '<path fill="currentColor" d="M352 0c0-17.7-14.3-32-32-32S288-17.7 288 0l0 64-96 0c-53 0-96 43-96 96l0 224c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-224c0-53-43-96-96-96l-96 0 0-64zM160 368c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0c-13.3 0-24-10.7-24-24zm120 0c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0c-13.3 0-24-10.7-24-24zm120 0c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0c-13.3 0-24-10.7-24-24zM224 176a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm144 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM64 224c0-17.7-14.3-32-32-32S0 206.3 0 224l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96zm544-32c-17.7 0-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32z"/>' +
        '</svg>';

    const goldCoins = document.createElement("i");
    goldCoins.setAttribute("class", "fas fa-coins");
    goldCoins.style.color = "#ffc00a";
    goldCoins.style.padding = "5px";

    const giveawayBTN = document.createElement("button");
    giveawayBTN.type = "button";
    giveawayBTN.setAttribute("class", "bonanza-btn fx-94");
    giveawayBTN.id = "bonanzaGiveawayBtn";
    giveawayBTN.title = "DarkPeers BONanza Giveaway";
    giveawayBTN.innerHTML = `${ROBOT_SVG}<span class="btn-label">Giveaway</span>`;
    giveawayBTN.onclick = toggleMenu;

    // ───────────────────────────────────────────────────────────
    // SECTION 3: Script Metadata Parsing
    // ───────────────────────────────────────────────────────────
    const META = (() => {
        /* 1. Tampermonkey / Violentmonkey / classic Greasemonkey */
        if (typeof GM_info !== "undefined" && GM_info.script) {
            return GM_info.script;
        }

        /* 2. Greasemonkey 4 (GM.info) */
        if (typeof GM !== "undefined" && GM.info && GM.info.script) {
            return GM.info.script;
        }

        /* 3. Fallback: read our own source and regex the @version etc. */
        try {
            const src = document.currentScript?.textContent || "";
            const fetch = key => {
                const m = src.match(new RegExp(`@${key}\\s+([^\\n]+)`));
                return m ? m[1].trim() : "";
            };

            return {
                name:        fetch("name") || "DarkPeers BONanza Giveaway",
                version:     fetch("version") || "0.0.0"
            };
        } catch (e) {
            /* Last-ditch – never crash the script */
            return { name:"DarkPeers BONanza Giveaway", version:"0.0.0" };
        }
    })();

    const {
        name:        SCRIPT_NAME,
        version:     SCRIPT_VERSION
    } = META;

    // ───────────────────────────────────────────────────────────
    // SECTION 4: UI Template Definitions
    // ───────────────────────────────────────────────────────────
    const frameHTML = `
<section
  id="bonanzaGiveawayFrame"
  class="panelV2"
  style="width:450px;height:90%;position:fixed;z-index:9999;inset:50px 150px auto auto;overflow:auto;border:1px solid black;"
  hidden
>
  <!-- HEADER -->
  <header class="panel__heading">
    <div class="button-holder no-space giveaway-header-top-row">
      <div class="button-left">
        <h4 class="panel__heading">
          <i class="fa-solid fa-gifts" style="padding:5px;"></i>
          ${SCRIPT_NAME}
          <small style="color:#aaa;margin-left:8px;font-size:0.8em;">v${SCRIPT_VERSION}</small>
        </h4>
      </div>
      <div class="button-right giveaway-header-actions">
        <button id="minimizeButton" class="form__button form__button--text giveaway-btn" style="background-color:#4e595f;" title="Minimize panel">
          <i class="fa-solid fa-window-minimize"></i>
        </button>
        <button id="closeButton" class="form__button form__button--text giveaway-btn" style="background-color:#4e595f;">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
    <div class="giveaway-header-actions__menu-row no-drag" data-no-drag="1">
      <button id="resetButton" class="form__button form__button--text giveaway-btn no-drag" data-no-drag="1" style="background-color:#b32525;">
        <i class="fa-solid fa-rotate-right"></i> Reset
      </button>
      <button id="giveawaySettingsBtn" class="form__button form__button--text giveaway-btn no-drag" data-no-drag="1" style="background-color:#ff6400;">
        <i class="fa-solid fa-gear"></i> Settings
      </button>
      <button id="commandsButton" class="form__button form__button--text giveaway-btn no-drag" data-no-drag="1" style="background-color:#ff9600;">
        <i class="fa-solid fa-list"></i> Commands
      </button>
    </div>
  </header>

  <!-- MAIN BODY -->
  <div class="panel__body" id="giveaway_body" style="display:flex; flex-direction:column; gap:10px;">

    <!-- Presets -->
    <div class="giveaway-presets-row" style="display:flex; align-items:center; justify-content:center; gap:6px; flex-wrap:wrap; margin:0;">
      <select id="presetSelect" class="form__text" style="width:auto; min-width:120px; max-width:180px; padding:3px 6px; font-size:12px;">
        <option value="">— Presets —</option>
      </select>
      <button type="button" id="presetLoadBtn" class="form__button form__button--text giveaway-btn no-drag" style="background-color:#2a7acc; font-size:11px; padding:3px 8px;" title="Load selected preset">
        <i class="fa-solid fa-folder-open"></i> Load
      </button>
      <button type="button" id="presetSaveBtn" class="form__button form__button--text giveaway-btn no-drag" style="background-color:#02B008; font-size:11px; padding:3px 8px;" title="Save current form as a preset">
        <i class="fa-solid fa-floppy-disk"></i> Save
      </button>
      <button type="button" id="presetDeleteBtn" class="form__button form__button--text giveaway-btn no-drag" style="background-color:#b32525; font-size:11px; padding:3px 8px;" title="Delete selected preset">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>

    <h1 id="coinHeader" class="panel__heading--centered"></h1>

    <form class="form" id="giveawayForm" style="display:flex;flex-flow:column;align-items:center;">
      <p class="form__group" style="max-width:35%;">
<input
  class="form__text"
  required
  id="giveawayAmount"
  inputmode="numeric"
  type="text"
>

        <label class="form__label form__label--floating" for="giveawayAmount">
          Giveaway Amount
        </label>
      </p>

      <div class="panel__body flex-row" style="justify-content:center; gap:20px;">
        ${
    [
        ['startNum', '1'],
        ['endNum', '50']
    ]
    .map(
        ([id, val]) => `
              <p class="form__group" style="width:20%;">
                <input
                  class="form__text"
                  required
                  id="${id}"
                  pattern="-?\\d+"
                  value="${val}"
                  inputmode="numeric"
                  type="text"
                  maxlength="9"
                >
                <label class="form__label form__label--floating" for="${id}">
                  ${id === 'startNum' ? 'Start #' : 'End #'}
                </label>
              </p>`
    )
    .join('')
    }
      </div>

      <!-- Giveaway length / reminders / winners row -->
      <div class="panel__body flex-row" style="justify-content:center; flex-wrap:wrap; gap:20px;">
        <!-- giveaway length -->
        <p class="form__group" style="width:28%;">
          <input
            class="form__text"
            required
            id="timerNum"
            type="number"
            inputmode="numeric"
            min="1"
            step="1"
            value="5"
            autocomplete="off"
          >
          <label class="form__label form__label--floating" for="timerNum">Time&nbsp;(min)</label>
        </p>

        <!-- reminders -->
        <p class="form__group" style="width:28%;">
          <input class="form__text" id="reminderNum" type="number" min="0" step="1" value="0" autocomplete="off">
          <label class="form__label form__label--floating"># Reminders</label>
        </p>

        <!-- cadence label -->
        <p class="form__group" style="width:28%;">
          <input class="form__text" id="reminderEvery" readonly tabindex="-1" style="cursor:default;">
          <label class="form__label form__label--floating">Every (min)</label>
        </p>
      </div>

      <!-- winners + max winners row -->
      <div class="panel__body flex-row giveaway-number-row giveaway-winners-row">
        <p class="form__group giveaway-number-col">
          <input
            class="form__text"
            type="number"
            id="winnersNum"
            min="1"
            max="${MAX_WINNERS}"
            step="1"
            value="1"
          >
          <label class="form__label form__label--floating" for="winnersNum"># Winners</label>
        </p>
        <p class="form__group giveaway-number-col" id="maxScaledWinnersGroup" style="display:none;">
          <input
            class="form__text"
            type="number"
            id="maxScaledWinnersNum"
            title="Hard cap: ${MAX_WINNERS}. Scaling can’t exceed this."
            min="1"
            max="${MAX_WINNERS}"
            step="1"
            value="1"
            disabled
          >
          <label class="form__label form__label--floating" for="maxScaledWinnersNum" title="Hard cap: ${MAX_WINNERS}. Scaling can’t exceed this.">Max Winners</label>
          <small id="maxScaledWinnersError" class="giveaway-inline-error" aria-live="polite"></small>
        </p>
        <p class="form__group giveaway-number-col" id="scaleBonPerWinnerGroup" style="display:none;">
          <input
            class="form__text"
            type="number"
            id="scaleBonPerWinnerNum"
            title="BON sponsored per extra winner. Leave empty to auto-calculate from pot size."
            min="1"
            step="1"
            placeholder="auto"
            disabled
          >
          <label class="form__label form__label--floating" for="scaleBonPerWinnerNum" title="BON per additional winner via sponsorship.">BON/Winner</label>
        </p>
      </div>

      <div class="panel__body giveaway-custom-message-row" style="display:flex;justify-content:center;gap:20px;width:100%;">
        <p class="form__group" style="width:100%;">
          <input
            class="form__text"
            id="customMessage"
            type="text"
            maxlength="100"
            placeholder="Max 100 chars"
            value="${DEFAULT_CUSTOM_MESSAGE}"
          >
          <label class="form__label form__label--floating" for="customMessage">
            Custom Message
          </label>
        </p>
      </div>

      <!-- BON Pool contribution row -->
      <div class="panel__body giveaway-donation-row" style="display:flex;justify-content:center;align-items:center;gap:14px;width:100%;flex-wrap:wrap;">
        <p class="form__group" style="width:38%;margin:0;">
          <select class="form__select" id="donationPercent" title="Share of the final pot (host + sponsors) donated to the ${BONANZA.FUND_NAME}. 0% runs a standard giveaway.">
            ${BONANZA.PERCENT_OPTIONS.map(p => `<option value="${p}">${p}%</option>`).join('')}
          </select>
          <label class="form__label form__label--floating" for="donationPercent">${BONANZA.FUND_NAME} donation</label>
        </p>
        <small id="donationHint" style="flex:1;min-width:180px;color:#bbb;font-size:12px;line-height:1.3;"></small>
      </div>

      <p class="form__group" style="text-align:center;">
  <button
    type="button"
    id="startButton"
    class="form__button form__button--filled"
    style="background-color:#02B008;"
  >
    Start
  </button>
</p>
    </form>

    <!-- Countdown timer below the form, full width -->
    <h2 id="countdownHeader" class="panel__heading--centered" hidden
        style="display:block; width:100%; margin-top:10px; margin-bottom:10px; text-align:center;">
    </h2>

<!-- Entries table below the countdown -->
    <div id="entriesWrapper" class="data-table-wrapper" hidden
         style="width:100%; overflow-x:auto; margin-top:10px;">
      <table id="entriesTable" class="data-table" style="width:100%; border-collapse:collapse; table-layout:fixed;">
        <thead><tr><th>User</th><th>Entry #</th></tr></thead>
        <tbody></tbody>
      </table>
    </div>

    <!-- Winners / payout status -->
    <div id="winnersWrapper" class="data-table-wrapper" hidden
         style="width:100%; overflow-x:auto; margin-top:6px;">
      <table id="winnersTable" class="data-table" style="width:100%; border-collapse:collapse; table-layout:fixed;">
        <thead>
          <tr>
            <th>Winner</th>
            <th>Prize BON</th>
            <th>Gift</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>

    <div id="giveawayLogPanel" class="data-table-wrapper" style="width:100%; margin-top:10px; display:none;">
      <h3 style="margin:0 0 6px 0; color:#ddd; font-size:14px;">Giveaway Log</h3>
      <pre id="giveawayLogContent" style="margin:0; max-height:160px; overflow:auto; background:#1f1f1f; color:#cfcfcf; border:1px solid #444; border-radius:4px; padding:8px; white-space:pre-wrap; word-break:break-word;">No events yet.</pre>
      <div style="display:flex; gap:8px; margin-top:8px;">
        <button type="button" id="copyGiveawayLogButton" class="form__button form__button--filled">Copy log</button>
        <button type="button" id="clearGiveawayLogButton" class="form__button form__button--filled" style="background:#7d3333;">Clear log</button>
      </div>
    </div>
  </div>

    <!-- End-of-giveaway statements -->
    <div id="bonanzaStatementRow" class="data-table-wrapper" style="width:100%; margin-top:10px; display:none;">
      <h3 style="margin:0 0 6px 0; color:#ddd; font-size:14px;">Giveaway statements</h3>
      <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
        <select id="bonanzaStatementSelect" class="form__select" style="flex:1; min-width:200px;" title="The last ${STATEMENTS_KEEP} giveaway statements are kept on this browser."></select>
        <button type="button" id="bonanzaSaveStatementBtn" class="form__button form__button--filled" title="Download the selected statement as a .txt file">Save .txt</button>
        <button type="button" id="bonanzaCopyStatementBtn" class="form__button form__button--filled" style="background:#4e595f;" title="Copy the selected statement to the clipboard">Copy</button>
      </div>
    </div>

  <!-- SETTINGS MENU -->
  <div id="giveaway_settings_menu" class="giveaway_settings_menu" style="display:none">
    <div class="settings-menu-content">
      <div class="settings-group" aria-label="Entry Modes" data-settings-group="entry-modes" data-toggle-ids="randomToggle,luckyToggle,freeToggle">
        <div class="settings-group__header">
          <p class="settings-group__title">Entry Modes</p>
          <button type="button" class="form__button form__button--filled settings-section-toggle" data-settings-toggle="entry-modes" title="Toggle all options in Entry Modes only.">Toggle all</button>
        </div>
        ${[
            { label: 'Random', id: 'randomToggle', tip: 'Enable !random (enter with a random free number).' },
            { label: 'Lucky', id: 'luckyToggle', tip: 'Enable !lucky (show lucky #) and !luckye (enter with lucky #).' },
            { label: 'Free', id: 'freeToggle', tip: 'Enable !free (show some available numbers).' }
        ].map(({ label, id, tip }) => `
          <label class="settings-row" title="${tip}" for="${id}">
            <span class="settings-row__label">${label}</span>
            <input
              type="checkbox"
              id="${id}"
              title="${tip}"
              class="settings-row__toggle"
              checked
            >
          </label>`).join('')}
      </div>

      <div class="settings-group" aria-label="Chat and Replies" data-settings-group="chat-replies" data-toggle-ids="entryrepliesToggle,silentmodeToggle">
        <div class="settings-group__header">
          <p class="settings-group__title">Chat & Replies</p>
          <button type="button" class="form__button form__button--filled settings-section-toggle" data-settings-toggle="chat-replies" title="Toggle all options in Chat & Replies only.">Toggle all</button>
        </div>
        ${[
            { label: 'Entry Replies', id: 'entryrepliesToggle', tip: 'When enabled, the bot replies when an entry is logged. Disable to reduce chat spam.' },
            { label: 'Silent Mode', id: 'silentmodeToggle', tip: 'When enabled, command replies are sent privately via /msg instead of public chat.' }
        ].map(({ label, id, tip }) => `
          <label class="settings-row" title="${tip}" for="${id}">
            <span class="settings-row__label">${label}</span>
            <input
              type="checkbox"
              id="${id}"
              title="${tip}"
              class="settings-row__toggle"
              checked
            >
          </label>`).join('')}
      </div>

      <div class="settings-group" aria-label="Scaling and Rules" data-settings-group="scaling-rules" data-toggle-ids="scaleWinnersToggle,rigModeToggle,showgiveawaylogToggle">
        <div class="settings-group__header">
          <p class="settings-group__title">Scaling & Rules</p>
          <button type="button" class="form__button form__button--filled settings-section-toggle" data-settings-toggle="scaling-rules" title="Toggle all options in Scaling & Rules only.">Toggle all</button>
        </div>
        ${[
            { label: 'Scale Winners', id: 'scaleWinnersToggle', tip: 'When enabled, winners may increase based on sponsorship BON (up to the max set in the giveaway form).' },
            { label: 'Rigged mode (visual only)', id: 'rigModeToggle', tip: 'Rigged mode is purely cosmetic… allegedly.' },
            { label: 'Show Giveaway Log', id: 'showgiveawaylogToggle', tip: 'Only controls Giveaway Log panel visibility. Logging still continues in the background.' }
        ].map(({ label, id, tip }) => `
          <label class="settings-row" title="${tip}" for="${id}">
            <span class="settings-row__label">${label}</span>
            <input
              type="checkbox"
              id="${id}"
              title="${tip}"
              class="settings-row__toggle"
              checked
            >
          </label>`).join('')}
      </div>
    </div>
  </div>

  <!-- COMMANDS MENU -->
  <div id="giveaway_commands_menu" class="commands-menu" style="display:none">
    <ul class="commands-list">
      <li class="section-label">General&nbsp;Commands</li>
      <li><code>!time&nbsp;</code>        <span class="desc">Show remaining time</span></li>
      <li><code>!entries&nbsp;</code>     <span class="desc">List all entries</span></li>
      <li><code>!free&nbsp;</code>        <span class="desc">Show free numbers</span></li>
      <li><code>!number&nbsp;</code>      <span class="desc">Show your entry</span></li>
      <li><code>!random&nbsp;</code>      <span class="desc">Enter with a random #</span></li>
      <li><code>!lucky&nbsp;</code>       <span class="desc">Show lucky number</span></li>
      <li><code>!luckye&nbsp;</code>      <span class="desc">Enter with lucky #</span></li>
      <li><code>!bon&nbsp;</code>         <span class="desc">Show pot amount</span></li>
      <li><code>!range&nbsp;</code>       <span class="desc">Show valid range</span></li>
      <li><code>!scale&nbsp;</code>      <span class="desc">Show scaling progress</span></li>
      <li><code>!rig/!unrig&nbsp;</code>  <span class="desc">Toggle rigging (fun)</span></li>
      <li><code>!help&nbsp;</code>        <span class="desc">Show this list in chat</span></li>
      <li><code>!stats&nbsp;[user]</code>   <span class="desc">Show saved stats</span></li>
      <li><code>!top&nbsp;[N]</code>       <span class="desc">Top winners (by wins)</span></li>
      <li><code>!most&nbsp;[N]</code>      <span class="desc">Most BON won (total)</span></li>
      <li><code>!sponsors&nbsp;[N]</code>  <span class="desc">Top sponsors</span></li>
      <li><code>!unlucky&nbsp;[N]</code>   <span class="desc">Most losses</span></li>

      <li class="section-label">Host-Only&nbsp;Commands</li>
      <li class="full-span">
          <code>!time add&nbsp;N&nbsp;/&nbsp;remove&nbsp;N&nbsp;</code>
          <span class="desc">Adjust remaining minutes</span>
      </li>
      <li><code>!reminder&nbsp;</code>    <span class="desc">Send reminder msg</span></li>
      <li><code>!addbon&nbsp;</code>      <span class="desc">Add BON to pot</span></li>
      <li><code>!winners&nbsp;N</code>    <span class="desc">Set number of winners</span></li>
      <li><code>!maxwinners&nbsp;N</code> <span class="desc">Set max scaled winners</span></li>
      <li><code>!end&nbsp;</code>         <span class="desc">End the giveaway</span></li>

      <li><code>!naughty&nbsp;</code>     <span class="desc">list/add/remove a user</span></li>
      <li class="naughty-alert">
        ⚠⚠ !naughty excludes users from the giveaway entirely ⚠⚠ ************************USE RESPONSIBLY************************
      </li>
    </ul>
  </div>


  <!-- RIGGED WATERMARK (only visible in rigged mode) -->
  <div class="rigged-watermark">RIGGED</div>
</section>
`;

    const hostPanelHTML = `
<aside id="hostCommandPanel" class="host-command-panel" aria-hidden="true">
  <div id="hostCommandPanelHandle" class="host-command-panel__handle" title="Drag to move Host Panel">
    <span class="host-command-panel__handle-title">Host Panel</span>
    <button id="hostPanelCloseBtn" type="button" class="form__button form__button--text host-command-panel__close" title="Close Host Panel" aria-label="Close Host Panel">×</button>
  </div>
  <div id="hostCommandPanelBody" class="host-command-panel__body"></div>
</aside>
`;

    const baseMenuStyle = `
  background-color: #2C2C2C;
  color: #CCC;
  border-radius: 5px;
  position: absolute;
  top: 100px;
  right: 10px;
  z-index: 10020;
  padding: 15px;
  overflow: auto;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
`;

    // Settings menu CSS styles
    const settingsMenuStyle = `
.giveaway_settings_menu {
  ${baseMenuStyle}
  width: 280px;
  height: auto;
  max-height: 72vh;
}
.giveaway_settings_menu > div {
  margin: 0;
}
.giveaway_settings_menu .settings-menu-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.giveaway_settings_menu .settings-group {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 7px;
}
.giveaway_settings_menu .settings-group:last-of-type {
  border-bottom: 0;
  padding-bottom: 0;
}
.giveaway_settings_menu .settings-group__title {
  margin: 0 0 4px;
  font-size: 12px;
  color: #ffa200;
  font-weight: 700;
}
.giveaway_settings_menu .settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 0;
  padding: 3px 0;
}
.giveaway_settings_menu .settings-row__label {
  color: #d7d7d7;
  font-size: 13px;
  line-height: 1.3;
}
.giveaway_settings_menu .settings-row__toggle {
  width: 15px;
  height: 15px;
  cursor: pointer;
  flex-shrink: 0;
}
.giveaway_settings_menu .settings-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}
.giveaway_settings_menu .settings-section-toggle {
  padding: 2px 8px;
  min-height: 24px;
  font-size: 11px;
  line-height: 1;
}`;

    // Commands menu CSS styles – shrink-wrap width, 2-column grid, section labels
    const commandsMenuStyle = `
.commands-menu{
  ${baseMenuStyle}
  width:max-content;
  max-width:425px;
  max-height:70vh;
}

/* ── compact two-column grid ───────────────────────────── */
.commands-menu .commands-list{
  list-style:none;
  padding:0;
  margin:0;
  display:grid;
  grid-template-columns:max-content 1fr;   /* code | description */
  column-gap:5px;
  row-gap:4px;
}

.commands-menu .full-span{
  grid-column: 1 / -1;      /* occupy the whole row */
 }

/* left column (command keyword) */
.commands-menu code{
  font-family:inherit;
  font-weight:600;
  color:#ffb84d;
  font-size:14px;
  white-space:nowrap;
}

/* right column (description) */
.commands-menu .desc{
  color:#d0d0d0;       /* dimmer grey */
  font-size:13px;
}

/* orange section headers that span both columns */
.commands-menu .section-label{
  grid-column:1 / -1;
  margin:6px 0 2px;
  font-size:14px;
  font-weight:700;
  color:#ffa200;
  border-bottom:1px solid #555;
}

/* full-width red banner for Naughty */
.commands-menu .naughty-alert{
  grid-column:1 / -1;    /* span both columns */
  background:#dc3d1d;
  color:#fff;
  font-size:13px;
  font-weight:600;
  padding:2px 6px;
  border-radius:4px;
  margin-top:2px;
}`;

    const hostPanelStyle = `
body.host-panel-dragging,
body.host-panel-dragging * {
  user-select: none !important;
}
.host-command-panel {
  box-sizing: border-box;
  position: fixed;
  top: 50px;
  right: auto;
  left: calc(100vw - clamp(320px, 26vw, 440px) - 16px);
  width: clamp(320px, 26vw, 440px);
  max-width: calc(100vw - 16px);
  height: calc(100vh - 66px);
  max-height: calc(100vh - 66px);
  border: 1px solid #000;
  border-radius: 6px;
  background-color: #2C2C2C;
  color: #CCC;
  z-index: 10030;
  overflow: hidden;
  display: none;
  pointer-events: auto;
}
.host-command-panel.open {
  display: block;
}
.host-command-panel,
.host-command-panel * {
  box-sizing: border-box;
}
.host-command-panel__handle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.18);
  background: rgba(0, 0, 0, 0.18);
  cursor: grab;
}
.host-command-panel.dragging .host-command-panel__handle {
  cursor: grabbing;
}
.host-command-panel__handle-title {
  font-size: 12px;
  color: #ffa200;
  font-weight: 700;
  letter-spacing: 0.2px;
}
.host-command-panel__close {
  margin: 0;
  padding: 0 8px;
  min-width: 28px;
  min-height: 24px;
  line-height: 1;
  font-size: 18px;
  color: #fff;
}
.host-command-panel__body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100% - 40px);
  height: calc(100% - 40px);
  min-width: 0;
}
.host-command-panel__section {
  border-bottom: 1px solid rgba(255,255,255,0.09);
  padding-bottom: 8px;
  margin-bottom: 4px;
  min-width: 0;
}
.host-command-panel__section:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}
.host-command-panel__section-title {
  margin: 0 0 6px;
  font-size: 12px;
  color: #ffa200;
  font-weight: 700;
  white-space: normal;
  word-break: break-word;
}
.host-command-panel .host-command-panel__row {
  margin-bottom: 6px;
  min-width: 0;
}
.host-command-panel .hp-row {
  display:flex;
  flex-direction:column;
  min-width:0;
}
.host-command-panel .hp-row-main {
  display:flex;
  align-items:center;
  flex-wrap:wrap;
  column-gap:12px;
  row-gap:4px;
  min-width:0;
}
.host-command-panel .hp-row-right {
  display:flex;
  flex-direction:column;
  min-width:0;
  flex:1 1 auto;
}
.host-command-panel .hp-row-fields {
  display:flex;
  align-items:center;
  flex-wrap:wrap;
  gap:6px;
  min-width:0;
}
.host-command-panel .host-command-panel__button-wrap {
  flex: 0 0 auto;
  min-width: 120px;
  width: 120px;
}
.host-command-panel .host-command-panel__arg-wrap {
  min-width: 0;
  flex: 0 1 auto;
}
.host-command-panel .host-command-panel__arg-wrap .command-input {
  width: clamp(90px, 11vw, 140px);
  min-width: 80px;
  max-width: 100%;
  min-height: 28px;
  box-sizing: border-box;
}
.host-command-panel .host-command-panel__arg-wrap .command-input.command-input--long {
  width: clamp(140px, 16vw, 220px);
  min-width: 120px;
  max-width: 100%;
  box-sizing: border-box;
}
.host-command-panel .hp-row-error {
  font-size: 11px;
  color: #ff6f6f;
  line-height: 1.15;
  min-width: 0;
  min-height: 13px;
  visibility: hidden;
  margin-top: 3px;
}
.host-command-panel .hp-row-error.visible {
  visibility: visible;
}
.host-command-panel .host-command-panel__button-wrap .form__button {
  width: 100%;
  max-width: 100%;
  min-height: 28px;
  padding: 4px 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 0 0 auto;
}
.host-command-panel .disabled-wrap {
  display: inline-flex;
  min-width: 0;
}`;



    // ───────────────────────────────────────────────────────────
    // SECTION 5: Initialization and Bootstrapping
    // ───────────────────────────────────────────────────────────
    // Cache references for UI elements (populated in injectMenu)
    let bonanzaGiveawayFrame, coinHeader, countdownHeader,
        coinInput, startInput, endInput, timerInput, winnersInput, customMessageInput,
        scaleWinnersToggleInput, maxScaledWinnersInput, maxScaledWinnersGroup, maxScaledWinnersError,
        scaleBonPerWinnerInput, scaleBonPerWinnerGroup,
        donationPercentInput, donationHint,
        entriesWrapper, giveawayForm,
        giveawayLogPanel, giveawayLogContent,
        resetButton, closeButton, minimizeButton, startButton, settingsBtn, commandsBtn, settingsMenu, commandsMenu,
        remNumInput, reminderEvery, rigBadge, rigToggleInput,
        hostPanelToggleBtn, hostCommandPanel, hostCommandPanelBody, hostPanelCloseBtn, hostPanelHandle,
        hostPanelInitialized = false;
    const hostPanelCommandState = new Map();
    let maxScaledWinnersRawValue = "";
    let maxScaledWinnersDebounceTimer = null;
    let bonPerWinnerManuallyEdited = false;
    let pendingEffectiveWinnersDisplay = null;
    let lastKnownGiveawayHostKey = "";
    let hostPanelResizeBound = false;
    // Inject the giveaway menu into the chat UI
    injectMenu();

    // ── Mutual exclusion with the original "Blutopia BON Giveaway" script ──
    // Both scripts drive the same chat and would both try to restore and pay out
    // the same giveaway after a reload. If the original is present, this script
    // stands down and says so in the chat header.

    function originalGiveawayScriptPresent() {
        return !!document.querySelector(ORIGINAL_SCRIPT_SELECTOR);
    }

    function findOriginalGiveawayButton() {
        const header = document.querySelector("#chatbox_header");
        if (!header) return null;
        const links = header.querySelectorAll("a.form__button--text");
        for (const a of links) {
            if (a.id === "bonanzaGiveawayBtn") continue;
            const hasCoins = !!a.querySelector("i.fa-coins, i.fas.fa-coins");
            const label = (a.textContent || "").trim().toLowerCase();
            if (hasCoins && label === "giveaway") return a;
        }
        return null;
    }

    let conflictToastTimer = null;
    function showConflictToast() {
        let toast = document.getElementById("bonanzaGiveawayConflictToast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "bonanzaGiveawayConflictToast";
            toast.setAttribute("role", "alert");
            document.body.appendChild(toast);
        }
        toast.textContent = "DEACTIVATE THE ORIGINAL GIVEAWAY SCRIPT";
        requestAnimationFrame(() => toast.classList.add("show"));
        if (conflictToastTimer) clearTimeout(conflictToastTimer);
        conflictToastTimer = setTimeout(() => {
            toast.classList.remove("show");
            conflictToastTimer = setTimeout(() => toast.remove(), 300);
        }, 7000);
    }

    function onConflictButtonClick(ev) {
        try { ev.preventDefault(); ev.stopPropagation(); } catch {}

        // Ours: blink red
        giveawayBTN.classList.remove("bonanza-blink-red");
        void giveawayBTN.offsetWidth; // restart the animation
        giveawayBTN.classList.add("bonanza-blink-red");
        setTimeout(() => giveawayBTN.classList.remove("bonanza-blink-red"), 1000);

        // Theirs: glow orange and shake
        const orig = findOriginalGiveawayButton();
        if (orig) {
            orig.classList.add("bonanza-orig-btn");
            orig.classList.remove("bonanza-orig-alert");
            void orig.offsetWidth;
            orig.classList.add("bonanza-orig-alert");
            setTimeout(() => orig.classList.remove("bonanza-orig-alert"), 1000);
        }

        showConflictToast();
    }

    /**
     * Put this script into conflict mode: no panel, no giveaway logic, but the
     * toolbar button stays and looks normal until touched.
     */
    function enterConflictMode(chatboxHeader) {
        if (conflictWatchTimer) { clearInterval(conflictWatchTimer); conflictWatchTimer = null; }
        try { if (bonanzaGiveawayFrame) bonanzaGiveawayFrame.remove(); } catch {}
        try { releaseTabLock(); } catch {}

        giveawayBTN.classList.add("bonanza-btn--conflict");
        giveawayBTN.title = "Disabled: the original BON Giveaway script is also installed. Remove one of them.";
        giveawayBTN.setAttribute("aria-disabled", "true");
        giveawayBTN.onclick = onConflictButtonClick;
        if (!giveawayBTN.isConnected) {
            const host = chatboxHeader || document.querySelector("#chatbox_header div");
            if (host) {
                host.prepend(giveawayBTN);
                giveawayBTN.parentNode.insertBefore(document.createTextNode(" "), giveawayBTN.nextSibling);
            }
        }

        const orig = findOriginalGiveawayButton();
        if (orig) orig.classList.add("bonanza-orig-btn");

        console.warn("[DarkPeers BONanza Giveaway] Disabled: the original BON Giveaway script is also installed.");
    }

    async function injectMenu() {
        const chatboxHeader = document.querySelector(`#chatbox_header div`);
        if (!chatboxHeader) {
            setTimeout(injectMenu, 100);
            return;
        }

        addStyle(BUTTON_CSS, 'bonanza-giveaway-button-styles');

        if (originalGiveawayScriptPresent()) {
            enterConflictMode(chatboxHeader);
            return;
        }

        // The original may inject after us; keep watching and stand down if it appears
        // (unless a giveaway is already running here, in which case only warn).
        let conflictWarnedDuringGiveaway = false;
        conflictWatchTimer = setInterval(() => {
            if (!originalGiveawayScriptPresent()) return;
            if (giveawayData && giveawayData.timeLeft > 0) {
                if (!conflictWarnedDuringGiveaway) {
                    conflictWarnedDuringGiveaway = true;
                    logEvent("Conflict", "The original BON Giveaway script appeared while a giveaway is running. Do not reload this page until it has ended, then remove one of the scripts.");
                    showConflictToast();
                }
                return;
            }
            enterConflictMode(chatboxHeader);
        }, 2000);

        addStyle(`
/* Keep vertical spacing tight */
#bonanzaGiveawayFrame .panel__body {
  gap: 2px !important;
  row-gap: 2px !important;
  margin-top: 2px !important;
  margin-bottom: 2px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

/* Specifically restore horizontal flex layout for the input rows */
#bonanzaGiveawayFrame .panel__body.flex-row {
  display: flex !important;
  flex-wrap: wrap !important;
  flex-direction: row !important;
  justify-content: center !important;
  gap: 20px !important; /* restore horizontal spacing */
}

#bonanzaGiveawayFrame .giveaway-number-row {
  width: 100%;
  justify-content: center !important;
  align-items: flex-end;
}

#bonanzaGiveawayFrame .giveaway-header-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#bonanzaGiveawayFrame .giveaway-header-actions {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: flex-end;
}

#bonanzaGiveawayFrame .giveaway-header-actions__menu-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 0;
  margin-top: 6px;
  position: relative;
  z-index: 5;
}

#bonanzaGiveawayFrame .giveaway-btn {
  margin: 5px;
  position: relative;
  z-index: 6;
  pointer-events: auto;
}

#bonanzaGiveawayFrame .giveaway-number-col {
  width: 28%;
  min-width: 70px;
  max-width: 120px;
}

#bonanzaGiveawayFrame .giveaway-winners-row {
  margin-top: 12px;
  gap: 8px !important;
  flex-wrap: nowrap !important;
  align-self: stretch;
}

/* Custom message field should span full form width */
#bonanzaGiveawayFrame .giveaway-custom-message-row {
  align-self: stretch;
  width: 100% !important;
  padding: 0 10px;
  box-sizing: border-box;
}

/* Form groups still keep tight vertical margin */
#bonanzaGiveawayFrame .form__group {
  margin-top: 2px !important;
  margin-bottom: 2px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

#bonanzaGiveawayFrame .form__text {
  padding-top: 3px !important;
  padding-bottom: 3px !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

#bonanzaGiveawayFrame .form__text.input-invalid {
  border-color: #dc3d1d !important;
  background-color: rgba(220, 61, 29, 0.16) !important;
}

#bonanzaGiveawayFrame .giveaway-inline-error {
  display: none;
  margin-top: 4px;
  color: #ff8f7d;
  font-size: 11px;
  line-height: 1.2;
}

#bonanzaGiveawayFrame .giveaway-inline-error.visible {
  display: block;
}

#bonanzaGiveawayFrame label.form__label {
  margin-top: 0 !important;
  margin-bottom: 2px !important;
  line-height: 1.1 !important;
}

/* Countdown timer fix: force block and full width below form */
#bonanzaGiveawayFrame #countdownHeader {
  display: block !important;
  width: 100% !important;
  margin-top: 10px;
  margin-bottom: 10px;
  text-align: center;
}

/* Entries wrapper full width with horizontal scroll if needed */
#bonanzaGiveawayFrame #entriesWrapper {
  width: 100% !important;
  overflow-x: auto;
  margin-top: 10px;
}

/* Entries table: flex to content, but never shrink below wrapper width
   and allow it to grow wider (triggering horizontal scroll). */
#bonanzaGiveawayFrame #entriesTable {
  border-collapse: collapse;
  table-layout: auto !important; /* override inline table-layout:fixed */
  min-width: 100%;               /* fill the frame at minimum */
  width: auto;                   /* but can grow past it if needed */
}

/* General cell padding */
#bonanzaGiveawayFrame #entriesTable th,
#bonanzaGiveawayFrame #entriesTable td {
  padding: 4px 6px;
}

/* User column: grow with username up to a cap, then ellipsis. */
#bonanzaGiveawayFrame #entriesTable th:nth-child(1),
#bonanzaGiveawayFrame #entriesTable td:nth-child(1) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;   /* hard upper bound for username column */
}

/* Entry # column: flex to content, keep centered */
#bonanzaGiveawayFrame #entriesTable th:nth-child(2),
#bonanzaGiveawayFrame #entriesTable td:nth-child(2) {
  text-align: center;
  white-space: nowrap;
}

/* Prize BON column: flex to content, keep centered */
#bonanzaGiveawayFrame #entriesTable th:nth-child(3),
#bonanzaGiveawayFrame #entriesTable td:nth-child(3) {
  text-align: center;
  white-space: nowrap;
}

/* Gift status column: fixed-ish narrow width, centered */
#bonanzaGiveawayFrame #entriesTable th:nth-child(4),
#bonanzaGiveawayFrame #entriesTable td:nth-child(4) {
  width: 70px !important;
  text-align: center;
}

/* Gift verification row states (color only Entry # / Prize / Gift, not Username) */
#bonanzaGiveawayFrame #entriesTable tr.gift-pending > td:nth-child(2),
#bonanzaGiveawayFrame #entriesTable tr.gift-pending > td:nth-child(3),
#bonanzaGiveawayFrame #entriesTable tr.gift-pending > td:nth-child(4) {
  background-color: rgba(255, 235, 59, 0.20) !important; /* yellow-ish */
}

#bonanzaGiveawayFrame #entriesTable tr.gift-confirmed > td:nth-child(2),
#bonanzaGiveawayFrame #entriesTable tr.gift-confirmed > td:nth-child(3),
#bonanzaGiveawayFrame #entriesTable tr.gift-confirmed > td:nth-child(4) {
  background-color: rgba(76, 175, 80, 0.20) !important; /* green-ish */
}

#bonanzaGiveawayFrame #entriesTable tr.gift-self > td:nth-child(2),
#bonanzaGiveawayFrame #entriesTable tr.gift-self > td:nth-child(3),
#bonanzaGiveawayFrame #entriesTable tr.gift-self > td:nth-child(4) {
  background-color: rgba(158, 158, 158, 0.20) !important; /* grey-ish */
}

#bonanzaGiveawayFrame #entriesTable tr.gift-failed > td:nth-child(2),
#bonanzaGiveawayFrame #entriesTable tr.gift-failed > td:nth-child(3),
#bonanzaGiveawayFrame #entriesTable tr.gift-failed > td:nth-child(4) {
  background-color: rgba(244, 67, 54, 0.20) !important; /* red-ish */
}

/* Animated spinner for "checking" gift status */
#bonanzaGiveawayFrame .gift-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffeb3b; /* yellow-ish accent */
  animation: giftSpinnerSpin 0.8s linear infinite;
  box-sizing: border-box;
}

@keyframes giftSpinnerSpin {
  to {
    transform: rotate(360deg);
  }
}

/* Parent container vertical stacking with spacing */
#bonanzaGiveawayFrame #giveaway_body {
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
}

/* --- Improved vertical centering and layout for coinHeader --- */
#bonanzaGiveawayFrame #coinHeader.panel__heading--centered {
  margin-top: 14px !important;
  margin-bottom: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
  gap: 6px;
}

#bonanzaGiveawayFrame .bg-flash {
  animation: bgFlashPulse 1s ease-out;
}

@keyframes bgFlashPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 192, 10, 0.6);
    background-color: rgba(255, 192, 10, 0.26);
  }
  100% {
    box-shadow: 0 0 0 10px rgba(255, 192, 10, 0);
    background-color: rgba(255, 192, 10, 0);
  }
}

  ${settingsMenuStyle}
  ${commandsMenuStyle}
  ${hostPanelStyle}

/* Silence <h1> inside <section> console warning */
#bonanzaGiveawayFrame h1.panel__heading--centered {
  font-size: 1.5em;
  margin: 0;
}

/* ───────── Minimized state ───────── */

#bonanzaGiveawayFrame.minimized {
  height: auto !important;
  min-height: 0 !important;
  overflow: hidden !important;
}

#bonanzaGiveawayFrame.minimized #giveaway_body,
#bonanzaGiveawayFrame.minimized #giveaway_settings_menu,
#bonanzaGiveawayFrame.minimized #giveaway_commands_menu,
#bonanzaGiveawayFrame.minimized .giveaway-header-actions__menu-row,
#bonanzaGiveawayFrame.minimized .rigged-watermark {
  display: none !important;
}

/* ───────── Rigged mode theming ───────── */

#bonanzaGiveawayFrame.rigged {
  border-color: #dc3d1d !important;
  box-shadow: 0 0 14px rgba(220, 61, 29, 0.75);
}

#bonanzaGiveawayFrame.rigged header.panel__heading {
  background: linear-gradient(90deg, #dc3d1d, #4e0000);
  color: #fff;
}

/* Watermark sits behind the content */
#bonanzaGiveawayFrame .rigged-watermark {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: none;              /* default hidden */
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  font-weight: 900;
  opacity: 0.06;
  text-transform: uppercase;
  transform: rotate(-22deg);
  letter-spacing: 0.25em;
}

#bonanzaGiveawayFrame.rigged .rigged-watermark {
  display: flex;
  animation: rigWatermarkPulse 4s ease-in-out infinite;
}

/* Pulsing badge animation */
#riggedBadge.rigged-pulse {
  animation: rigPulse 1.2s ease-in-out infinite;
}

@keyframes rigPulse {
  0% {
    transform: scale(1);
    box-shadow: none;
  }
  50% {
    transform: scale(1.08);
    box-shadow: 0 0 8px rgba(220, 61, 29, 0.8);
  }
  100% {
    transform: scale(1);
    box-shadow: none;
  }
}

@keyframes rigWatermarkPulse {
  0% {
    opacity: 0.03;
    text-shadow: none;
    transform: rotate(-22deg) scale(1);
  }
  50% {
    opacity: 0.10;
    text-shadow: 0 0 10px rgba(220, 61, 29, 0.45);
    transform: rotate(-22deg) scale(1.03);
  }
  100% {
    opacity: 0.03;
    text-shadow: none;
    transform: rotate(-22deg) scale(1);
  }
}

#bonanzaGiveawayFrame.rigged #startButton {
  animation: rigStopPulse 1.5s ease-in-out infinite;
}

@keyframes rigStopPulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.03); }
  100% { transform: scale(1); }
}
`, 'bonanza-giveaway-styles');

        const existingGiveawayFrame = document.getElementById("bonanzaGiveawayFrame");
        if (existingGiveawayFrame) existingGiveawayFrame.remove();

        document.body.insertAdjacentHTML("beforeend", frameHTML);

        settingsMenu = document.getElementById('giveaway_settings_menu');
        commandsMenu = document.getElementById('giveaway_commands_menu');
        timerInput = document.getElementById("timerNum");
        remNumInput = document.getElementById("reminderNum");
        reminderEvery = document.getElementById("reminderEvery");

        // Enforce whole-number minutes in the Time field (no decimals / exponent notation)
        // (No page refresh required; prevents accidental fractional minutes.)
        (function enforceWholeMinutesOnTimerField() {
            if (!timerInput) return;

            let lastValid = String(timerInput.value || "5");
            const blockedKeys = new Set(['.', ',', 'e', 'E', '+', '-']);

            timerInput.addEventListener('keydown', (e) => {
                if (blockedKeys.has(e.key)) e.preventDefault();
            });

            timerInput.addEventListener('input', () => {
                const v = String(timerInput.value ?? "").trim();
                if (v === "") {
                    timerInput.setCustomValidity("");
                    return;
                }

                if (/^\d+$/.test(v)) {
                    const n = parseInt(v, 10);
                    if (Number.isFinite(n) && n >= 1) {
                        timerInput.setCustomValidity("");
                        lastValid = v;
                        return;
                    }
                }

                timerInput.setCustomValidity("Please enter a whole number of minutes (no decimals).");
                timerInput.value = lastValid;
            });
        })();

        bonanzaGiveawayFrame = document.getElementById('bonanzaGiveawayFrame');

        settingsBtn = bonanzaGiveawayFrame.querySelector('#giveawaySettingsBtn');
        commandsBtn = bonanzaGiveawayFrame.querySelector('#commandsButton');

        // Create / attach "RIGGED" badge next to the version
        const versionSmall = bonanzaGiveawayFrame.querySelector('header.panel__heading small');
        if (versionSmall) {
            rigBadge = document.createElement('span');
            rigBadge.id = 'riggedBadge';
            rigBadge.textContent = 'RIGGED';
            rigBadge.title = "Rigged mode is purely cosmetic… allegedly.";
            rigBadge.setAttribute("aria-label", "Rigged mode indicator");
            rigBadge.style.cssText = `

      margin-left: 8px;
      padding: 2px 6px;
      border-radius: 4px;
      background: #dc3d1d;
      color: #fff;
      font-size: 0.75em;
      font-weight: 700;
    `;
            rigBadge.hidden = true;
            versionSmall.insertAdjacentElement('afterend', rigBadge);
        }

        // Update both when either changes
        timerInput.addEventListener("input", syncReminderNumUI);
        remNumInput.addEventListener("input", syncReminderNumUI);

        // Call on init
        syncReminderNumUI();


        /* kick-start synchronisation so defaults line up on first render */
        remNumInput.dispatchEvent(new Event("input"));

        settingsBtn.addEventListener('click', e => {
            e.stopPropagation(); // don’t bubble to outside-click
            if (commandsMenu.classList.contains('open')) hardCloseCommands(); // close the other pane first

            const open = settingsMenu.classList.toggle('open');

            if (open) { // ---------- OPEN ----------
                syncSettingsFromStorage();
                settingsMenu.style.display = 'flex';
                renderGiveawayLogPanel();
                fitSettingsMenuHeight();
                document.addEventListener('click', handleOutsideClick);
            } else { // ---------- CLOSE ----------
                hardCloseSettings();
            }
        });

        chatboxHeader.prepend(giveawayBTN);
        giveawayBTN.parentNode.insertBefore(document.createTextNode(" "), giveawayBTN.nextSibling);

        resetButton = document.getElementById("resetButton");
        resetButton.onclick = function () {
            if (giveawayData && giveawayData.timeLeft > 0) {
                if (window.confirm("Are you sure you want to reset the giveaway? This will clear all entries and cannot be undone.")) {
                    resetGiveaway();
                }
            } else {
                resetGiveaway();
            }
        };

        closeButton = document.getElementById("closeButton");
        closeButton.onclick = function () {
            // Check if a giveaway is active
            if (giveawayData && giveawayData.timeLeft > 0) {
                if (window.confirm("A giveaway is currently running. Are you sure you want to close the menu? This will NOT end the giveaway, but you may lose track of its progress.")) {
                    toggleMenu();
                }
            } else {
                toggleMenu();
            }
        };

        minimizeButton = document.getElementById("minimizeButton");
        minimizeButton.onclick = function () {
            toggleMinimize();
        };
        // Restore minimized state from localStorage
        if (localStorage.getItem(LS_MINIMIZED) === "true") {
            setMinimized(true);
        }

        // Toggles
        const toggles = [
            // For these, localStorage stores "disabled/suppressed" (true), so checked means NOT stored.
            ["randomToggle", "bonanza-giveaway-disableRandom", "disable_random", false],
            ["luckyToggle", "bonanza-giveaway-disableLucky", "disable_lucky", false],
            ["freeToggle", "bonanza-giveaway-disableFree", "disable_free", false],
            ["entryrepliesToggle", LS_SUPPRESS, "suppress_entry_replies", false],

            // For silent mode / giveaway log, localStorage stores "enabled" (true), so checked mirrors stored.
            ["silentmodeToggle", LS_SILENT, "silent_mode", true],
            ["showgiveawaylogToggle", LS_SHOW_GIVEAWAY_LOG, "show_giveaway_log", true]
        ];

        function syncSettingsFromStorage() {
            for (const [id, key, setting, checkedWhenTrue = false] of toggles) {
                const el = document.getElementById(id);
                if (!el) continue;

                const fallback = checkedWhenTrue ? false : GENERAL_SETTINGS[setting] === true;
                const stored = readStoredBooleanSetting(key, fallback, true);

                // If stored=true means "disabled", checkbox should be unchecked; otherwise mirror stored.
                el.checked = checkedWhenTrue ? stored : !stored;

                // Keep GENERAL_SETTINGS value as the stored meaning (disabled/suppressed/enabled-for-silent/show-log)
                GENERAL_SETTINGS[setting] = stored;
            }
        }

        syncSettingsFromStorage();

        for (const [id, key, setting, checkedWhenTrue = false] of toggles) {
            const el = document.getElementById(id);
            if (!el) continue;

            el.addEventListener("change", () => {
                const newVal = checkedWhenTrue ? el.checked : !el.checked;
                GENERAL_SETTINGS[setting] = newVal;
                localStorage.setItem(key, String(newVal));
                if (setting === "show_giveaway_log") {
                    renderGiveawayLogPanel();
                }
                updateHostPanelUI();
            });
        }


        bindSettingsSectionToggleButtons();

        updateHostPanelUI();

        rigToggleInput = document.getElementById("rigModeToggle");
        if (rigToggleInput) {
            rigToggleInput.addEventListener("change", () => {
                const nameNode = document.getElementsByClassName("top-nav__username")[0];
                const hostName = nameNode?.children[0]?.textContent.trim() || "";

                const ctx = {
                    author: hostName,
                    fancyName: "",
                    args: [],
                    giveawayData: giveawayData || { host: hostName },
                    safeAuthor: sanitizeNick(hostName),
                    safeHost: sanitizeNick(hostName)
                };

                if (rigToggleInput.checked && !riggedMode) {
                    COMMAND_HANDLERS.rig(ctx);
                } else if (!rigToggleInput.checked && riggedMode) {
                    COMMAND_HANDLERS.unrig(ctx);
                } else {
                    updateRigToggleUI();
                }
            });
            updateRigToggleUI();
        }

        coinHeader = document.getElementById("coinHeader");
        const hostBalance = readHostBalance();
        coinHeader.textContent = `${fmtBONCurrency(hostBalance)} BON`;
        coinHeader.prepend(goldCoins.cloneNode(false));

        coinInput = document.getElementById("giveawayAmount");

        // remove formatting while editing
        coinInput.addEventListener('focus', () => {
            coinInput.value = coinInput.value.replace(/[^0-9]/g, '');
        });

        // add locale formatting on blur if it’s a valid integer
        coinInput.addEventListener('blur', () => {
            const raw = coinInput.value.replace(/[^0-9]/g, '');
            if (/^\d+$/.test(raw)) {
                coinInput.value = parseInt(raw, 10).toLocaleString();
            }
        });

        startInput = document.getElementById("startNum");
        endInput = document.getElementById("endNum");
        winnersInput = document.getElementById("winnersNum");
        if (pendingEffectiveWinnersDisplay != null) syncWinnersDisplayValue(pendingEffectiveWinnersDisplay);
        scaleWinnersToggleInput = document.getElementById("scaleWinnersToggle");
        maxScaledWinnersInput = document.getElementById("maxScaledWinnersNum");
        maxScaledWinnersGroup = document.getElementById("maxScaledWinnersGroup");
        maxScaledWinnersError = document.getElementById("maxScaledWinnersError");
        maxScaledWinnersRawValue = String(maxScaledWinnersInput?.value || "1");
        scaleBonPerWinnerInput = document.getElementById("scaleBonPerWinnerNum");
        scaleBonPerWinnerGroup = document.getElementById("scaleBonPerWinnerGroup");
        customMessageInput = document.getElementById("customMessage");
        donationPercentInput = document.getElementById("donationPercent");
        donationHint = document.getElementById("donationHint");
        if (donationPercentInput) {
            donationPercentInput.value = String(normalizeDonationPercent(localStorage.getItem(LS_DONATION_PERCENT)));
            donationPercentInput.addEventListener("change", () => {
                const pct = normalizeDonationPercent(donationPercentInput.value);
                donationPercentInput.value = String(pct);
                try { localStorage.setItem(LS_DONATION_PERCENT, String(pct)); } catch {}
                updateDonationHint();
            });
        }
        giveawayForm = document.getElementById("giveawayForm");
        startButton = document.getElementById("startButton");

        startButton.onclick = startGiveaway;
        startButton.title = "Start the giveaway";

        // Presets
        bindPresetButtons();
        refreshPresetDropdown();

        countdownHeader = document.getElementById("countdownHeader");
        entriesWrapper = document.getElementById("entriesWrapper");
        giveawayLogPanel = document.getElementById("giveawayLogPanel");
        document.getElementById("bonanzaSaveStatementBtn")?.addEventListener("click", () => downloadSelectedStatement());
        document.getElementById("bonanzaCopyStatementBtn")?.addEventListener("click", () => copySelectedStatement());
        renderStatementControls();
        giveawayLogContent = document.getElementById("giveawayLogContent");
        document.getElementById("copyGiveawayLogButton")?.addEventListener("click", copyGiveawayLogToClipboard);
        document.getElementById("clearGiveawayLogButton")?.addEventListener("click", clearGiveawayLog);
        renderGiveawayLogPanel();
        document.body.appendChild(bonanzaGiveawayFrame);

        // Draggable panel (header title row only; menu/button row is excluded)
        bindHeaderInteractions();

        window.addEventListener('resize', () => {
            if (settingsMenu?.classList.contains('open')) fitSettingsMenuHeight();
        });

        timerInput.addEventListener("input", reminderAutoScaling);
        startInput.addEventListener("input", entryRangeValidation);
        endInput.addEventListener("input", entryRangeValidation);
        winnersInput.addEventListener("input", winnersValidation);
        coinInput.addEventListener("input", syncBonPerWinnerValue);
        winnersInput.addEventListener("input", syncBonPerWinnerValue);
        coinInput.addEventListener("input", updateDonationHint);
        updateDonationHint();
        if (scaleBonPerWinnerInput) {
            scaleBonPerWinnerInput.addEventListener("input", () => { bonPerWinnerManuallyEdited = true; });
            // If user clears the field entirely, revert to auto mode
            scaleBonPerWinnerInput.addEventListener("blur", () => {
                if (!String(scaleBonPerWinnerInput.value || "").trim()) {
                    bonPerWinnerManuallyEdited = false;
                    syncBonPerWinnerValue();
                }
            });
        }
        scaleWinnersToggleInput.addEventListener("change", updateScaleWinnersControls);
        maxScaledWinnersInput.addEventListener("input", handleMaxScaledWinnersInput);
        maxScaledWinnersInput.addEventListener("blur", () => validateMaxScaledWinnersInput({ forceMessage: true }));

        updateScaleWinnersControls();
        reminderAutoScaling();
        updateHostPanelUI();

        // ── Attempt to restore a giveaway that survived a page reload ──
        const savedSnap = loadGiveawaySnapshot();
        if (savedSnap) {
            if (isLockedByAnotherTab()) {
                // Another tab is actively running this giveaway — don't duplicate it
                console.info("[BON Giveaway] Active giveaway detected in another tab, skipping restore.");
            } else {
                const restored = await restoreGiveawayFromSnapshot(savedSnap);
                if (restored) {
                    // Show the panel automatically so the host sees the restored state
                    bonanzaGiveawayFrame.hidden = false;
                    setMinimized(false);
                    console.info("[BON Giveaway] Restored active giveaway from snapshot.");
                }
            }
        }
    }

    function ensureHostPanelToggleButton() {
        if (!bonanzaGiveawayFrame) return null;
        const actionsRow = bonanzaGiveawayFrame.querySelector('.giveaway-header-actions__menu-row');
        if (!actionsRow) return null;
        let toggle = actionsRow.querySelector('#hostPanelToggle');
        if (!toggle) {
            actionsRow.insertAdjacentHTML('beforeend', `
      <button id="hostPanelToggle" class="form__button form__button--text giveaway-btn no-drag" data-no-drag="1" style="background-color:#ff9600;" title="Open/close host command panel.">
        <i class="fa-solid fa-sliders"></i> Host Panel
      </button>`);
            toggle = actionsRow.querySelector('#hostPanelToggle');
        }
        return toggle;
    }

    function toggleMenu() {
        bonanzaGiveawayFrame.hidden = !bonanzaGiveawayFrame.hidden;
        if (!bonanzaGiveawayFrame.hidden) {
            ensureHostPanelToggleButton();
            updateHostPanelUI();
        }
    }

    function setMinimized(minimized) {
        if (!bonanzaGiveawayFrame) return;
        const icon = minimizeButton?.querySelector("i");
        if (minimized) {
            bonanzaGiveawayFrame.classList.add("minimized");
            if (icon) { icon.className = "fa-solid fa-window-maximize"; }
            if (minimizeButton) minimizeButton.title = "Restore panel";
        } else {
            bonanzaGiveawayFrame.classList.remove("minimized");
            if (icon) { icon.className = "fa-solid fa-window-minimize"; }
            if (minimizeButton) minimizeButton.title = "Minimize panel";
        }
        localStorage.setItem(LS_MINIMIZED, String(minimized));
    }

    function toggleMinimize() {
        setMinimized(!bonanzaGiveawayFrame.classList.contains("minimized"));
    }

    // ───────────────────────────────────────────────────────────
    // Presets — save / load / delete form configurations
    // ───────────────────────────────────────────────────────────
    function loadPresetList() {
        try {
            return JSON.parse(localStorage.getItem(LS_PRESETS) || "[]");
        } catch { return []; }
    }

    function savePresetList(presets) {
        try { localStorage.setItem(LS_PRESETS, JSON.stringify(presets)); } catch {}
    }

    function captureFormPreset() {
        return {
            amount: coinInput?.value || "",
            startNum: startInput?.value || "1",
            endNum: endInput?.value || "50",
            timer: timerInput?.value || "5",
            reminders: remNumInput?.value || "0",
            winners: winnersInput?.value || "1",
            scaleWinners: scaleWinnersToggleInput?.checked || false,
            maxScaledWinners: maxScaledWinnersInput?.value || "1",
            scaleBonPerWinner: scaleBonPerWinnerInput?.value || "",
            scaleBonPerWinnerCustom: bonPerWinnerManuallyEdited,
            customMessage: customMessageInput?.value || "",
            donationPercent: normalizeDonationPercent(donationPercentInput?.value)
        };
    }

    function applyFormPreset(preset) {
        if (!preset) return;
        if (coinInput && preset.amount) coinInput.value = preset.amount;
        if (startInput && preset.startNum) startInput.value = preset.startNum;
        if (endInput && preset.endNum) endInput.value = preset.endNum;
        if (timerInput && preset.timer) timerInput.value = preset.timer;
        if (remNumInput && preset.reminders != null) remNumInput.value = preset.reminders;
        if (winnersInput && preset.winners) winnersInput.value = preset.winners;
        if (scaleWinnersToggleInput) {
            scaleWinnersToggleInput.checked = !!preset.scaleWinners;
            scaleWinnersToggleInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
        if (maxScaledWinnersInput && preset.maxScaledWinners) maxScaledWinnersInput.value = preset.maxScaledWinners;
        if (scaleBonPerWinnerInput) {
            const presetBonPerWinner = String(preset.scaleBonPerWinner || "").trim();
            if (preset.scaleBonPerWinnerCustom && presetBonPerWinner) {
                scaleBonPerWinnerInput.value = presetBonPerWinner;
                bonPerWinnerManuallyEdited = true;
            } else {
                bonPerWinnerManuallyEdited = false;
                syncBonPerWinnerValue();
            }
        }
        if (customMessageInput && preset.customMessage != null) customMessageInput.value = preset.customMessage;
        if (donationPercentInput && preset.donationPercent != null) {
            donationPercentInput.value = String(normalizeDonationPercent(preset.donationPercent));
            donationPercentInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // Re-sync dependent UI
        syncReminderNumUI();
        if (typeof entryRangeValidation === "function") entryRangeValidation();
        if (typeof winnersValidation === "function") winnersValidation();
        if (typeof updateScaleWinnersControls === "function") updateScaleWinnersControls();
    }

    function refreshPresetDropdown() {
        const select = document.getElementById("presetSelect");
        if (!select) return;
        const presets = loadPresetList();

        // Preserve current selection if possible
        const prevVal = select.value;
        select.innerHTML = '<option value="">— Presets —</option>';
        presets.forEach((p, i) => {
            const opt = document.createElement("option");
            opt.value = String(i);
            opt.textContent = p.name || `Preset ${i + 1}`;
            select.appendChild(opt);
        });

        // Restore selection
        if (prevVal && select.querySelector(`option[value="${prevVal}"]`)) {
            select.value = prevVal;
        }
    }

    function bindPresetButtons() {
        const saveBtn = document.getElementById("presetSaveBtn");
        const loadBtn = document.getElementById("presetLoadBtn");
        const deleteBtn = document.getElementById("presetDeleteBtn");
        const select = document.getElementById("presetSelect");

        if (saveBtn) saveBtn.addEventListener("click", () => {
            const name = window.prompt("Name this preset:");
            if (!name || !name.trim()) return;
            const presets = loadPresetList();
            presets.push({ name: name.trim(), ...captureFormPreset() });
            savePresetList(presets);
            refreshPresetDropdown();
            if (select) select.value = String(presets.length - 1);
        });

        if (loadBtn) loadBtn.addEventListener("click", () => {
            if (!select || select.value === "") return;
            const presets = loadPresetList();
            const idx = parseInt(select.value, 10);
            if (presets[idx]) applyFormPreset(presets[idx]);
        });

        if (deleteBtn) deleteBtn.addEventListener("click", () => {
            if (!select || select.value === "") return;
            const presets = loadPresetList();
            const idx = parseInt(select.value, 10);
            const preset = presets[idx];
            if (!preset) return;
            if (!window.confirm(`Delete preset "${preset.name || "Preset " + (idx + 1)}"?`)) return;
            presets.splice(idx, 1);
            savePresetList(presets);
            refreshPresetDropdown();
        });
    }

    // ───────────────────────────────────────────────────────────
    // Giveaway persistence — survive page reloads mid-giveaway
    // ───────────────────────────────────────────────────────────

    /** Read and validate the shared cross-tab lock. */
    function readTabLock() {
        try {
            const raw = localStorage.getItem(LS_TAB_LOCK);
            if (!raw) return null;
            const lock = JSON.parse(raw);
            if (!lock || typeof lock.tabId !== "string" || !Number.isFinite(Number(lock.ts))) return null;
            return { tabId: lock.tabId, ts: Number(lock.ts) };
        } catch {
            return null;
        }
    }

    function isFreshTabLock(lock, now = Date.now()) {
        return !!(lock && (now - Number(lock.ts)) < TAB_LOCK_STALE_MS);
    }

    function startTabLockHeartbeat() {
        if (tabLockHeartbeatTimer) clearInterval(tabLockHeartbeatTimer);
        tabLockHeartbeatTimer = setInterval(() => {
            try {
                const lock = readTabLock();

                // Never overwrite a lock that another live tab acquired after us.
                if (!lock || lock.tabId !== TAB_ID) {
                    clearInterval(tabLockHeartbeatTimer);
                    tabLockHeartbeatTimer = null;
                    return;
                }

                localStorage.setItem(LS_TAB_LOCK, JSON.stringify({ tabId: TAB_ID, ts: Date.now() }));
            } catch {}
        }, TAB_LOCK_HEARTBEAT_MS);
    }

    /**
     * Try to claim the tab lock without stealing a fresh lock from another tab.
     * Returns true only if our claim is visible after the write.
     */
    async function acquireTabLock() {
        // Atomic cross-tab ownership on modern browsers. Holding this Web Lock
        // for the entire giveaway removes the localStorage read/write race where
        // two tabs could both briefly believe they owned settlement.
        if (tabWebLockRelease) return true;

        if (navigator.locks && typeof navigator.locks.request === "function") {
            if (tabWebLockAcquirePromise) return tabWebLockAcquirePromise;

            tabWebLockAcquirePromise = new Promise((resolve) => {
                let settled = false;
                const settle = (value) => {
                    if (settled) return;
                    settled = true;
                    resolve(value);
                };

                navigator.locks.request(
                    TAB_WEB_LOCK_NAME,
                    { mode: "exclusive", ifAvailable: true },
                    async (lock) => {
                        if (!lock) {
                            settle(false);
                            return;
                        }

                        let releaseHold;
                        const hold = new Promise(r => { releaseHold = r; });
                        tabWebLockRelease = releaseHold;

                        try {
                            localStorage.setItem(
                                LS_TAB_LOCK,
                                JSON.stringify({ tabId: TAB_ID, ts: Date.now(), transport: "web-lock" })
                            );
                        } catch {}

                        startTabLockHeartbeat();
                        settle(true);

                        try {
                            await hold;
                        } finally {
                            tabWebLockRelease = null;
                        }
                    }
                ).catch(() => settle(false));
            }).finally(() => {
                tabWebLockAcquirePromise = null;
            });

            return tabWebLockAcquirePromise;
        }

        // Compatibility fallback for browsers without Web Locks. A stabilized
        // two-phase lease is safer than the former immediate read/write/read.
        try {
            const now = Date.now();
            const existing = readTabLock();
            if (existing && existing.tabId !== TAB_ID && isFreshTabLock(existing, now)) {
                return false;
            }

            const claim = {
                tabId: TAB_ID,
                ts: now,
                claim: `${TAB_ID}:${Math.random().toString(36).slice(2)}`,
                transport: "lease"
            };
            localStorage.setItem(LS_TAB_LOCK, JSON.stringify(claim));
            await new Promise(resolve => setTimeout(resolve, 120));

            let verified = null;
            try {
                verified = JSON.parse(localStorage.getItem(LS_TAB_LOCK) || "null");
            } catch {}

            if (!verified || verified.tabId !== TAB_ID || verified.claim !== claim.claim) {
                return false;
            }

            startTabLockHeartbeat();
            return true;
        } catch {
            return false;
        }
    }

    /** Release the tab lock and stop the heartbeat. */
    function releaseTabLock() {
        if (tabLockHeartbeatTimer) { clearInterval(tabLockHeartbeatTimer); tabLockHeartbeatTimer = null; }
        try {
            const lock = readTabLock();
            if (lock && lock.tabId === TAB_ID) localStorage.removeItem(LS_TAB_LOCK);
        } catch {}

        if (tabWebLockRelease) {
            const release = tabWebLockRelease;
            tabWebLockRelease = null;
            try { release(); } catch {}
        }
    }

    /** Check if another tab currently owns the giveaway (fresh heartbeat). */
    function isLockedByAnotherTab() {
        const lock = readTabLock();
        if (!lock || lock.tabId === TAB_ID) return false;
        return isFreshTabLock(lock);
    }

    function ownsTabLock() {
        const lock = readTabLock();
        if (!lock || lock.tabId !== TAB_ID || !isFreshTabLock(lock)) return false;
        if (navigator.locks && typeof navigator.locks.request === "function") {
            return !!tabWebLockRelease;
        }
        return true;
    }

    // Release the localStorage lock only when this document really leaves.
    // This makes a normal reload recover immediately instead of leaving the new
    // document blocked behind the previous document's fresh heartbeat.
    function handleGiveawayPageHide() {
        if (!giveawayData) return;

        const lock = readTabLock();
        if (!lock || lock.tabId !== TAB_ID) return; // never overwrite another tab's snapshot

        try {
            flushStatsNow();
            if (!giveawayData.__ending) snapshotGiveaway();
            else if (giveawayData.settlement?.committed) snapshotGiveaway({ force: true });
        } catch {}
        releaseTabLock();
    }

    // BFCache can restore the exact same JS document after pagehide. Reclaim the
    // lock on pageshow; if another tab legitimately owns it now, reload into a
    // passive page rather than running two copies of the giveaway.
    async function handleGiveawayPageShow(event) {
        if (!event || !event.persisted || !giveawayData || giveawayData.__ending) return;
        if (await acquireTabLock()) return;

        window.onbeforeunload = null;
        window.location.reload();
    }

    window.addEventListener("pagehide", handleGiveawayPageHide);
    window.addEventListener("pageshow", handleGiveawayPageShow);

    /**
     * Serialize the active giveaway state to localStorage.
     * Called at key mutation points (new entry, start, addbon, sponsor, time adjust).
     */
    function snapshotGiveaway({ force = false } = {}) {
        if (!giveawayData || (giveawayData.__ending && !force)) return;
        try {
            const snapshot = {
                giveawayData: {
                    host: giveawayData.host,
                    amount: giveawayData.amount,
                    startNum: giveawayData.startNum,
                    endNum: giveawayData.endNum,
                    totalEntries: giveawayData.totalEntries,
                    winningNumber: giveawayData.winningNumber,
                    totalSeconds: giveawayData.totalSeconds,
                    endTs: giveawayData.endTs,
                    winnersNum: giveawayData.winnersNum,
                    baseWinnersAtStart: giveawayData.baseWinnersAtStart,
                    effectiveWinnersNum: giveawayData.effectiveWinnersNum,
                    scaleWinnersWithSponsors: giveawayData.scaleWinnersWithSponsors,
                    hostMaxScaledWinners: giveawayData.hostMaxScaledWinners,
                    scaleBonPerWinner: giveawayData.scaleBonPerWinner,
                    customMessage: giveawayData.customMessage,
                    donationPercent: giveawayData.donationPercent,
                    hostAdded: giveawayData.hostAdded,
                    initialPotVerifiedAtStart: giveawayData.initialPotVerifiedAtStart,
                    reminderSchedule: giveawayData.reminderSchedule,
                    reminderNum: giveawayData.reminderNum,
                    reminderFreqSec: giveawayData.reminderFreqSec,
                    nextReminderSec: giveawayData.nextReminderSec,
                    sponsorContribs: giveawayData.sponsorContribs,
                    sponsors: giveawayData.sponsors,
                    sponsorGiftMessages: Array.isArray(giveawayData.sponsorGiftMessages)
                        ? giveawayData.sponsorGiftMessages
                        : [],
                    lastAnnouncedWinners: giveawayData.lastAnnouncedWinners,
                    settlement: giveawayData.settlement && typeof giveawayData.settlement === "object"
                        ? { ...giveawayData.settlement }
                        : null
                },
                entries: Array.from(numberEntries.entries()),
                takenBy: Array.from(numberTakenBy.entries()),
                fancyNameEntries: Array.from(fancyNames.entries()),
                liveStats: {
                    entered: Array.from(liveEnteredThisGiveaway),
                    sponsorSeen: Array.from(liveSponsorSeenThisGiveaway),
                    sponsorTotals: Array.from(liveSponsorTotalThisGiveaway.entries())
                },
                sponsorTracker: window.__activeTracker ? {
                    lastMsgId: Math.max(0, Math.floor(Number(window.__activeTracker.lastMsgId) || 0)),
                    cursorInitialized: !!window.__activeTracker.cursorInitialized,
                    giftHistoryClockOffsetMs: Number.isFinite(Number(window.__activeTracker.giftHistoryClockOffsetMs))
                        ? Number(window.__activeTracker.giftHistoryClockOffsetMs)
                        : null,
                    giftHistoryInitialized: !!window.__activeTracker.giftHistoryInitialized,
                    giftHistorySeenKeys: Array.from(window.__activeTracker.giftHistorySeenKeys || []).slice(-250),
                    historyFallbackActive: !!window.__activeTracker.historyFallbackActive,
                    maxAcceptedCreatedAtTs: Number.isFinite(Number(window.__activeTracker.maxAcceptedCreatedAtTs))
                        ? Number(window.__activeTracker.maxAcceptedCreatedAtTs)
                        : null
                } : null,
                riggedMode: riggedMode,
                startTime: giveawayStartTime ? giveawayStartTime.getTime() : null,
                savedAt: Date.now()
            };
            localStorage.setItem(LS_ACTIVE_GIVEAWAY, JSON.stringify(snapshot));
        } catch (e) {
            console.warn("Giveaway snapshot failed:", e);
        }
    }

    /** Clear the persisted giveaway state. */
    function clearGiveawaySnapshot() {
        try { localStorage.removeItem(LS_ACTIVE_GIVEAWAY); } catch {}
    }

    /** Load a saved giveaway. Recently-expired snapshots are restored and settled. */
    function loadGiveawaySnapshot() {
        try {
            const raw = localStorage.getItem(LS_ACTIVE_GIVEAWAY);
            if (!raw) return null;
            const snap = JSON.parse(raw);
            if (!snap || !snap.giveawayData) return null;

            const savedHostKey = normalizeUserKey(snap.giveawayData.host);
            const loggedInHostKey = normalizeUserKey(getLoggedInUsername());
            if (!savedHostKey || !loggedInHostKey || savedHostKey !== loggedInHostKey) {
                console.warn(
                    "[BON Giveaway] Refusing restore: the saved giveaway belongs to a different or unknown authenticated host. Snapshot left untouched for the correct account."
                );
                return null;
            }

            const endTs = Number(snap.giveawayData.endTs);
            if (!Number.isFinite(endTs) || endTs <= 0) {
                clearGiveawaySnapshot();
                return null;
            }

            const overdueMs = Date.now() - endTs;
            const committedSettlement = snap.giveawayData?.settlement?.committed === true;
            if (overdueMs > EXPIRED_SNAPSHOT_SETTLEMENT_GRACE_MS && !committedSettlement) {
                console.warn("[BON Giveaway] Discarding stale expired active snapshot; automatic settlement grace exceeded.");
                clearGiveawaySnapshot();
                return null;
            }

            // Once settlement is committed, retain it until a terminal cleanup.
            // Money/state recovery is more important than the normal one-hour
            // active-giveaway grace window.
            snap.__expiredAtLoad = overdueMs >= 0;
            return snap;
        } catch {
            clearGiveawaySnapshot();
            return null;
        }
    }

    /**
     * Restore a giveaway from a snapshot. Re-establishes entries, timers, observer, and sponsor tracker.
     * Called during injectMenu() if a valid snapshot exists.
     */
    async function restoreGiveawayFromSnapshot(snap) {
        if (!snap || !snap.giveawayData) return false;

        // Re-check and claim ownership before touching any in-memory state. The
        // caller already checks, but another tab can race us between those steps.
        if (!await acquireTabLock()) {
            console.info("[BON Giveaway] Restore cancelled: another tab owns the active giveaway lock.");
            return false;
        }

        try {
            // 1) Restore giveaway data
            giveawayData = snap.giveawayData;
            giveawayData.sponsorGiftMessages = Array.isArray(giveawayData.sponsorGiftMessages)
                ? giveawayData.sponsorGiftMessages
                : [];
            // Old active snapshots must not expose a start-time draw. A committed
            // settlement must keep its exact draw so crash/reload recovery cannot
            // select a different winner.
            const committedSettlement = giveawayData.settlement &&
                giveawayData.settlement.committed === true;
            if (!committedSettlement) {
                giveawayData.winningNumber = null;
            } else if (Number.isFinite(Number(giveawayData.settlement.winningNumber))) {
                giveawayData.winningNumber = Number(giveawayData.settlement.winningNumber);
            }
            giveawayData.donationPercent = normalizeDonationPercent(giveawayData.donationPercent);
            if (donationPercentInput) donationPercentInput.value = String(giveawayData.donationPercent);
            updateDonationHint();

            // Recalculate timeLeft from the stored endTs. If it already expired
            // within the recovery grace, rebuild state first and settle immediately.
            giveawayData.timeLeft = Math.max(Math.ceil((giveawayData.endTs - Date.now()) / 1000), 0);
            const expiredOnRestore = giveawayData.timeLeft <= 0 || snap.__expiredAtLoad === true;

            // 2) Restore entries
            numberEntries.clear();
            numberTakenBy.clear();
            fancyNames.clear();
            if (Array.isArray(snap.entries)) {
                for (const [author, num] of snap.entries) {
                    numberEntries.set(author, num);
                }
            }
            if (Array.isArray(snap.takenBy)) {
                for (const [num, author] of snap.takenBy) {
                    numberTakenBy.set(num, author);
                }
            }
            if (Array.isArray(snap.fancyNameEntries)) {
                for (const [author, html] of snap.fancyNameEntries) {
                    fancyNames.set(author, html);
                }
            }

            // Restore the live-stat bookkeeping too. Without this, a reload would
            // make recordGiveawayStats() believe entries/sponsors had never been
            // counted and could increment them again at payout time.
            liveEnteredThisGiveaway.clear();
            liveSponsorSeenThisGiveaway.clear();
            liveSponsorTotalThisGiveaway.clear();

            if (snap.liveStats && typeof snap.liveStats === "object") {
                for (const key of (Array.isArray(snap.liveStats.entered) ? snap.liveStats.entered : [])) {
                    const normalized = normalizeUserKey(key);
                    if (normalized) liveEnteredThisGiveaway.add(normalized);
                }
                for (const key of (Array.isArray(snap.liveStats.sponsorSeen) ? snap.liveStats.sponsorSeen : [])) {
                    const normalized = normalizeUserKey(key);
                    if (normalized) liveSponsorSeenThisGiveaway.add(normalized);
                }
                for (const pair of (Array.isArray(snap.liveStats.sponsorTotals) ? snap.liveStats.sponsorTotals : [])) {
                    if (!Array.isArray(pair) || pair.length < 2) continue;
                    const key = normalizeUserKey(pair[0]);
                    const amount = Math.max(0, Math.floor(Number(pair[1]) || 0));
                    if (key && amount > 0) liveSponsorTotalThisGiveaway.set(key, amount);
                }
            } else {
                // Back-compat for a pre-1.2.1 snapshot. The old script flushed live
                // stats on unload, so seed the bookkeeping from the restored state to
                // avoid the much worse failure mode: double-counting everything.
                for (const author of numberEntries.keys()) {
                    const key = normalizeUserKey(author);
                    if (key) liveEnteredThisGiveaway.add(key);
                }
                if (giveawayData.sponsorContribs && typeof giveawayData.sponsorContribs === "object") {
                    for (const [name, rawAmount] of Object.entries(giveawayData.sponsorContribs)) {
                        const key = normalizeUserKey(name);
                        const amount = Math.max(0, Math.floor(Number(rawAmount) || 0));
                        if (!key || !amount) continue;
                        liveSponsorSeenThisGiveaway.add(key);
                        liveSponsorTotalThisGiveaway.set(key, (liveSponsorTotalThisGiveaway.get(key) || 0) + amount);
                    }
                }
            }

            // 3) Restore rigged mode
            riggedMode = !!snap.riggedMode;
            if (riggedMode) {
                if (rigBadge) { rigBadge.hidden = false; rigBadge.classList.add('rigged-pulse'); }
                if (bonanzaGiveawayFrame) bonanzaGiveawayFrame.classList.add('rigged');
            }
            updateRigToggleUI();

            // 4) Restore start time
            giveawayStartTime = snap.startTime ? new Date(snap.startTime) : new Date();

            lastKnownGiveawayHostKey = normUserKey(giveawayData.host) || lastKnownGiveawayHostKey;

            // 5) Lock form fields
            startButton.disabled = false;
            coinInput.disabled = true;
            startInput.disabled = true;
            endInput.disabled = true;
            timerInput.disabled = true;
            customMessageInput.disabled = true;
            if (donationPercentInput) donationPercentInput.disabled = true;
            winnersInput.disabled = true;
            if (scaleWinnersToggleInput) scaleWinnersToggleInput.disabled = true;
            if (maxScaledWinnersInput) maxScaledWinnersInput.disabled = true;
            if (scaleBonPerWinnerInput) scaleBonPerWinnerInput.disabled = true;
            remNumInput.disabled = true;
            reminderEvery.disabled = true;
            entriesWrapper.hidden = false;

            // 6) Update UI
            coinHeader.innerHTML = `${fmtBONCurrency(cleanPotString(giveawayData.amount))} BON`;
            coinHeader.prepend(goldCoins.cloneNode(false));
            updateEntries();

            // 7) Re-establish chatbox reference
            if (chatbox == null) {
                chatbox = document.querySelector(`#${chatboxId}`);
            }
            cacheChatContext();

            // 8) Re-start observer only while entries are still open.
            if (observer) { observer.disconnect(); observer = null; }
            if (!expiredOnRestore) addObserver(giveawayData);

            // 9) Re-start sponsor tracker
            if (sponsorsInterval) { clearInterval(sponsorsInterval); sponsorsInterval = null; }
            if (window.__activeTracker) window.__activeTracker = null;
            const savedTracker = (snap.sponsorTracker && typeof snap.sponsorTracker === "object") ? snap.sponsorTracker : null;
            const tracker = new SponsorTracker({
                chatroomId,
                giveawayStartTime,
                giveawayData,
                lastMsgId: savedTracker ? savedTracker.lastMsgId : 0,
                cursorInitialized: savedTracker ? !!savedTracker.cursorInitialized : false,
                giftHistoryClockOffsetMs: savedTracker && Number.isFinite(Number(savedTracker.giftHistoryClockOffsetMs))
                    ? Number(savedTracker.giftHistoryClockOffsetMs)
                    : null,
                giftHistoryInitialized: savedTracker ? !!savedTracker.giftHistoryInitialized : false,
                giftHistorySeenKeys: savedTracker && Array.isArray(savedTracker.giftHistorySeenKeys)
                    ? savedTracker.giftHistorySeenKeys
                    : [],
                historyFallbackActive: savedTracker
                    ? (!!savedTracker.historyFallbackActive || !savedTracker.giftHistoryInitialized)
                    : true,
                maxAcceptedCreatedAtTs: Number.isFinite(Number(giveawayData?.settlement?.cutoffTs))
                    ? Number(giveawayData.settlement.cutoffTs)
                    : (savedTracker && Number.isFinite(Number(savedTracker.maxAcceptedCreatedAtTs))
                        ? Number(savedTracker.maxAcceptedCreatedAtTs)
                        : null)
            });
            window.__activeTracker = tracker;

            let expiredLegacyBootstrap = Promise.resolve();
            if (savedTracker) {
                // Current snapshots have a persisted cursor. For an expired restore,
                // endGiveaway() performs the one authoritative final poll itself.
                if (!expiredOnRestore) tracker.poll().catch(console.error);
            } else {
                // Legacy snapshots had no cursor. Bootstrap without replaying old
                // gifts; this favors under-count + manual verification over duplicates.
                const p = tracker.bootstrapCursor().catch(console.error);
                if (expiredOnRestore) expiredLegacyBootstrap = p;
            }
            if (!expiredOnRestore) {
                sponsorsInterval = setInterval(() => tracker.poll(), SPONSOR_GIFT_HISTORY_POLL_MS);
            }

            // 10) Re-start countdown timer only for a still-active giveaway.
            if (!expiredOnRestore) {
                giveawayData.countdownTimerID = countdownTimer(countdownHeader, giveawayData);
            } else {
                giveawayData.countdownTimerID = null;
                countdownHeader.hidden = false;
                countdownHeader.textContent = "00:00";
            }

            // 11) Re-start pot updater only while active.
            if (!expiredOnRestore) {
                giveawayData.potUpdater = setInterval(() => {
                    coinHeader.innerHTML = `${fmtBONCurrency(cleanPotString(giveawayData.amount))} BON`;
                    coinHeader.prepend(goldCoins.cloneNode(false));
                }, 5000);
            } else {
                giveawayData.potUpdater = null;
            }

            // 12) Set up beforeunload guard
            window.onbeforeunload = function (e) {
                try {
                    flushStatsNow();
                    if (giveawayData && !giveawayData.__ending) snapshotGiveaway();
                } catch {}
                e.preventDefault();
                e.returnValue = "";
                return "";
            };

            // 13) Wire stop button
            startButton.textContent = "Stop";
            startButton.style.backgroundColor = "#b32525";
            startButton.title = "This will end the giveaway and send gifts to the winners";
            startButton.onclick = () => {
                logEvent("Giveaway stop requested", "Requested from UI Stop button.");
                endGiveaway();
            };

            logEvent(
                expiredOnRestore ? "Expired giveaway restored for settlement" : "Giveaway restored",
                `Recovered ${numberEntries.size} entries after page reload. Time left: ${parseTime(giveawayData.timeLeft * 1000) || "expired"}`
            );
            updateHostPanelUI();

            if (expiredOnRestore) {
                Promise.resolve(expiredLegacyBootstrap).finally(() => {
                    setTimeout(() => {
                        if (giveawayData && !giveawayData.__ending) endGiveaway();
                    }, 0);
                });
            }

            return true;
        } catch (e) {
            console.error("Giveaway restore failed:", e);
            clearGiveawaySnapshot();
            releaseTabLock();
            return false;
        }
    }







    function formatLogTimestamp(date = new Date()) {
        const pad = (n) => String(n).padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    function renderGiveawayLogPanel() {
        if (!giveawayLogContent) return;
        if (giveawayLogPanel) {
            giveawayLogPanel.style.display = GENERAL_SETTINGS.show_giveaway_log ? "block" : "none";
        }
        giveawayLogContent.textContent = giveawayLog.length ? giveawayLog.join("\n") : "No events yet.";
        giveawayLogContent.scrollTop = giveawayLogContent.scrollHeight;
    }

    function clearGiveawayLog() {
        giveawayLog.length = 0;
        renderGiveawayLogPanel();
    }

    async function copyGiveawayLogToClipboard() {
        const text = giveawayLog.join("\n");
        if (!text) return;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return;
            }
        } catch {}

        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch {}
        ta.remove();
    }

    function logEvent(type, details = "") {
        const t = String(type || "Event").trim();
        const d = String(details || "").trim();
        const msg = d ? `${t}: ${d}` : t;
        giveawayLog.push(`[${formatLogTimestamp()}] ${msg}`);
        if (giveawayLog.length > 500) giveawayLog.splice(0, giveawayLog.length - 500);
        renderGiveawayLogPanel();
    }


    // ───────────────────────────────────────────────────────────
    // SECTION 6: Giveaway Lifecycle
    // ───────────────────────────────────────────────────────────

    async function startGiveaway() {
        clearWinnersStatusUI();

        const maxScaledValid = validateMaxScaledWinnersInput({ forceMessage: true });
        if (scaleWinnersToggleInput && scaleWinnersToggleInput.checked && !maxScaledValid) {
            if (maxScaledWinnersInput) maxScaledWinnersInput.focus();
            return;
        }

        if (!giveawayForm.checkValidity()) {
            giveawayForm.reportValidity();
            return;
        }

        clearGiveawayLog();

        // Normalize and validate the giveaway amount separately so we tolerate
        // locale-specific separators like ' . , non-breaking spaces, etc.
        const rawAmount = coinInput.value;
        const cleanValue = rawAmount.replace(/[^0-9]/g, '');
        if (!cleanValue) {
            window.alert("Please enter a valid numeric giveaway amount.");
            return;
        }
        const amountInt = parseInt(cleanValue, 10);
        if (!Number.isFinite(amountInt) || amountInt <= 0) {
            window.alert("Please enter a giveaway amount greater than zero.");
            return;
        }

        const requestedWinners = Math.max(1, Math.min(MAX_WINNERS, parseInt(winnersInput.value, 10) || 1));
        const minimumPotForRequestedWinners = minimumPotForWeightedWinners(requestedWinners);
        if (amountInt < minimumPotForRequestedWinners) {
            window.alert(
                `GIVEAWAY ERROR: ${fmtBON(requestedWinners)} weighted winner(s) need a pot of at least ` +
                `${fmtBONCurrency(minimumPotForRequestedWinners)} BON so every winner receives at least 1 BON.`
            );
            return;
        }

        // Claim ownership BEFORE mutating UI/state. Never steal a fresh lock from
        // another tab: that is the primary cross-tab double-payout defence.
        if (!await acquireTabLock()) {
            window.alert("Another DarkPeers tab is already running an active giveaway. End it there (or wait for its lock to expire) before starting another one.");
            return;
        }

        if (sponsorsInterval) { clearInterval(sponsorsInterval); sponsorsInterval = null; }
        if (observer) { observer.disconnect(); observer = null; }

        if (chatbox == null) {
            chatbox = document.querySelector(`#${chatboxId}`);
        }

        cacheChatContext();

        startButton.disabled = true;
        coinInput.disabled = true;
        startInput.disabled = true;
        endInput.disabled = true;
        timerInput.disabled = true;
        customMessageInput.disabled = true;
        if (donationPercentInput) donationPercentInput.disabled = true;
        winnersInput.disabled = true;
        scaleWinnersToggleInput.disabled = true;
        maxScaledWinnersInput.disabled = true;
        if (scaleBonPerWinnerInput) scaleBonPerWinnerInput.disabled = true;
        remNumInput.disabled = true;
        reminderEvery.disabled = true;

        //startButton.parentElement.hidden = true;
        entriesWrapper.hidden = false;

        let totalTimeMin = totalMinutes();
        let totalTimeMs = totalTimeMin * 60000;
        let reminderNum = Math.min(Number(remNumInput.value), getReminderLimits(totalTimeMin)[0]);
        if (isNaN(reminderNum) || reminderNum < 0) reminderNum = 0;
        const schedule = getReminderSchedule(totalTimeMin, reminderNum);
        const cadenceSec = (reminderNum > 0) ? totalTimeMin * 60 / (reminderNum + 1) : 0;
        let winnersNum = requestedWinners;
        const scaleWinnersWithSponsors = !!(scaleWinnersToggleInput && scaleWinnersToggleInput.checked);
        const hostMaxScaledWinners = scaleWinnersWithSponsors
        ? Math.floor(Number(maxScaledWinnersRawValue || maxScaledWinnersInput.value) || winnersNum)
        : getClampedMaxScaledWinnersValue(winnersNum);

        // Custom scaling threshold (null = auto-calculate from pot / base winners)
        const customBonPerWinner = scaleBonPerWinnerInput ? parseInt(scaleBonPerWinnerInput.value, 10) : NaN;
        const scaleBonPerWinner = (scaleWinnersWithSponsors && Number.isFinite(customBonPerWinner) && customBonPerWinner > 0)
            ? customBonPerWinner
            : null;

        giveawayData = {
            host: document.getElementsByClassName("top-nav__username")[0].children[0].textContent.trim(),
            amount: amountInt,
            startNum: parseInt(startInput.value, 10),
            endNum: parseInt(endInput.value, 10),
            totalEntries: parseInt(endInput.value, 10) - parseInt(startInput.value, 10) + 1,
            winningNumber: null,
            totalSeconds: totalTimeMs / 1000,
            timeLeft: totalTimeMs / 1000,
            endTs: Date.now() + (totalTimeMs),
            winnersNum,
            baseWinnersAtStart: winnersNum,
            effectiveWinnersNum: winnersNum,
            scaleWinnersWithSponsors,
            hostMaxScaledWinners,
            scaleBonPerWinner,
            customMessage: customMessageInput.value,
            donationPercent: normalizeDonationPercent(donationPercentInput ? donationPercentInput.value : 0),
            hostAdded: amountInt,
            initialPotVerifiedAtStart: amountInt,
            reminderSchedule : schedule,
            reminderNum      : schedule.length,
            reminderFreqSec  : cadenceSec, // <- kept for legacy helpers
            nextReminderSec  : cadenceSec, // <- ditto (first reminder ETA)
            sponsorContribs: {},
            sponsors: [],
            sponsorGiftMessages: [],
        };
        lastKnownGiveawayHostKey = normUserKey(giveawayData.host) || lastKnownGiveawayHostKey;

        updateRigToggleUI();
        const currentBon = await getVerifiedHostBalance({ requireServer: true, maxAgeMs: 0 });

        if (currentBon == null) {
            const startErr = "Unable to verify current BON balance.";
            logEvent("Start aborted", startErr);
            window.alert(
                "GIVEAWAY ERROR: Unable to verify your current BON balance right now. Please try again shortly."
            );
            resetGiveaway();
            return;
        }

        if (currentBon < giveawayData.amount) {
            const startErr = `Entered amount ${fmtBONCurrency(giveawayData.amount)} exceeds current BON ${fmtBONCurrency(currentBon)}.`;
            logEvent("Start aborted", startErr);
            window.alert(
                `GIVEAWAY ERROR: The amount entered (${giveawayData.amount}), is above your current BON (${currentBon}).`
            );
            resetGiveaway();
            return;
        }
        else {
            giveawayData.initialPotVerifiedAtStart = giveawayData.amount;
            recomputeEffectiveWinners(giveawayData);
            initializeScaledWinnersAnnouncementState(giveawayData);
            logEvent(
                "Giveaway started",
                `Host=${sanitizeNick(giveawayData.host)} | Host-funded=${fmtBONCurrency(giveawayData.initialPotVerifiedAtStart)} BON | Base winners=${fmtBON(giveawayData.baseWinnersAtStart)} | Time=${fmtBON(totalTimeMin)} min | ${BONANZA.FUND_NAME}=${giveawayData.donationPercent}% | Flags: silent=${GENERAL_SETTINGS.silent_mode ? "on" : "off"}, rigged=${riggedMode ? "on" : "off"}, scale=${giveawayData.scaleWinnersWithSponsors ? "on" : "off"}${giveawayData.scaleWinnersWithSponsors ? `, max winners=${fmtBON(giveawayData.hostMaxScaledWinners)}` : ""}`
            );
            // The winning number is deliberately NOT drawn here. It is generated
            // only when endGiveaway() commits to payout, so DevTools/localStorage
            // cannot reveal the result while entries are still open.

            window.onbeforeunload = function (e) {
                try {
                    flushStatsNow();
                    if (giveawayData && !giveawayData.__ending) snapshotGiveaway();
                } catch {}
                e.preventDefault();
                e.returnValue = "";
                return "";
            };

            const donationPct = normalizeDonationPercent(giveawayData.donationPercent);
            const startMarker = donationPct > 0
                ? (riggedMode ? BRIDGE_MARKERS.START_TAXES : BRIDGE_MARKERS.START_POOL)
                : BRIDGE_MARKERS.START;
            const introHeader = donationPct > 0
                ? (riggedMode
                    ? `${bridgeMarker(startMarker, "🎁")} [b][color=#FF4F9A]RIGGING TAXES: ${donationPct}% TO THE ${BONANZA.FUND_NAME.toUpperCase()}[/color][/b]\nI am hosting a giveaway for `
                    : `${bridgeMarker(startMarker, "🎁")} 💙 [b][color=${BONANZA.GIVEAWAY_COLOR}]${BONANZA.FUND_NAME.toUpperCase()} CONTRIBUTION GIVEAWAY[/color][/b] 💙\nI am hosting a giveaway for `)
                : `${bridgeMarker(startMarker, "🎁")} I am hosting a giveaway for `;
            const donationIntroLine = donationPct > 0
                ? (riggedMode
                    ? `\n[b][color=#FF4F9A]${donationPct}% rigging tax[/color][/b] will be taken from the final pot (including sponsor gifts) and paid directly into the [b]${BONANZA.FUND_NAME}[/b]. Winners keep the remaining ${100 - donationPct}%. Entirely legitimate accounting. 😈`
                    : `\n[b][color=${BONANZA.GIVEAWAY_COLOR}]${donationPct}%[/color][/b] of the final pot (including sponsor gifts) will be contributed directly to the [b]${BONANZA.FUND_NAME}[/b]. Winners receive the remaining ${100 - donationPct}%.`)
                : "";

            let introMessage = `${introHeader}[b][color=#ffc00a]${fmtBONCurrency(giveawayData.amount)} BON[/color][/b] | ` +
                `${buildWinnersAnnouncementLine(giveawayData)} | ` +
                `Open for [b][color=#1DDC5D]${parseTime(totalTimeMs)}[/color][/b]. ` +
                `Pick a number [b]between [color=#DC3D1D]${giveawayData.startNum} and ${giveawayData.endNum}[/color][/b]. ` +
                `[b][color=#5DE2E7]${giveawayData.customMessage}[/color][/b]` +
                donationIntroLine + `\n` +
                `✨[b][color=#FB4F4F]Gift the host to add to the pot! [color=${GIFT_HINT_COLOR}]/gift ${getGiftSyntaxHostName()} AMOUNT MESSAGE[/color][/color][/b]✨`;

            if (riggedMode) {
                introMessage += `\n[color=#FF4F9A][b]RIGGED MODE ENGAGED![/b][/color] ` +
                    `[i][color=#FF9AE6]Visual flair only — the math is still fair... probably.[/color][/i] 😈`;
            }

            if (GENERAL_SETTINGS.silent_mode) {
                introMessage += `\n[color=#ff3333][b]SILENT MODE ENABLED![/b][/color] ` +
                    `[i][color=#B0B0B0]Command replies will be sent privately via /msg.[/color][/i] 🤫`;
            }

            if (window.__activeTracker) window.__activeTracker = null;
            let tracker = new SponsorTracker({
                chatroomId,
                giveawayStartTime: new Date(),
                giveawayData
            });
            await tracker.bootstrapGiftHistory();

            await sendMessage(introMessage);

            // Public opening is the temporal boundary. The pre-opening Gift History
            // snapshot means every subsequently appearing received gift is new.
            giveawayStartTime = new Date();
            tracker.giveawayStartTs = giveawayStartTime.getTime();
            window.__activeTracker = tracker;

            try { await tracker.poll(); } catch (e) { console.error(e); }
            sponsorsInterval = setInterval(
                () => tracker.poll(),
                SPONSOR_GIFT_HISTORY_POLL_MS
            );

            if (observer) {
                startObserver();
            } else {
                addObserver(giveawayData);
            }

            giveawayData.countdownTimerID = countdownTimer(countdownHeader, giveawayData);

            giveawayData.potUpdater = setInterval(() => {
                coinHeader.innerHTML = `${fmtBONCurrency(cleanPotString(giveawayData.amount))} BON`;
                coinHeader.prepend(goldCoins.cloneNode(false));
            }, 5000);

            // Start button → Stop button wiring stays the same...
        }

        // ** TOGGLE BUTTON TO STOP **
        startButton.textContent = "Stop";
        startButton.style.backgroundColor = "#b32525"; // red to indicate Stop
        startButton.title = "This will end the giveaway and send gifts to the winners";
        startButton.disabled = false;
        startButton.onclick = () => {
            logEvent("Giveaway stop requested", "Requested from UI Stop button.");
            endGiveaway();
        };

        // Persist giveaway state so it can survive a page reload
        snapshotGiveaway();

        updateHostPanelUI();
    }

    function resetGiveaway() {
        entriesWrapper.hidden = true;
        clearWinnersStatusUI();

        countdownHeader.textContent = "";
        countdownHeader.hidden = true;
        startButton.parentElement.hidden = false;

        coinInput.disabled = false;
        startInput.disabled = false;
        endInput.disabled = false;
        timerInput.disabled = false;
        customMessageInput.disabled = false;
        if (donationPercentInput) donationPercentInput.disabled = false;
        winnersInput.disabled = false;
        scaleWinnersToggleInput.disabled = false;
        remNumInput.disabled = false;
        reminderEvery.disabled = false;

        giveawayForm.reset()
        if (donationPercentInput) {
            donationPercentInput.value = String(normalizeDonationPercent(localStorage.getItem(LS_DONATION_PERCENT)));
            updateDonationHint();
        }
        updateScaleWinnersControls();
        if (maxScaledWinnersDebounceTimer) {
            clearTimeout(maxScaledWinnersDebounceTimer);
            maxScaledWinnersDebounceTimer = null;
        }
        maxScaledWinnersRawValue = String(maxScaledWinnersInput?.value || winnersInput?.value || "1");
        setMaxScaledWinnersError("");
        updateStartButtonState();

        stopGiveaway();

        updateEntries();

        // ——— restore host’s balance display ———
        const hostBalance = readHostBalance();

        // update the header
        coinHeader.textContent = `${fmtBONCurrency(hostBalance)} BON`;
        coinHeader.prepend(goldCoins.cloneNode(false));


        // ** RESET BUTTON TO START **
        startButton.textContent = "Start";
        startButton.style.backgroundColor = "#02B008"; // green for Start
        startButton.title = "Start the giveaway";
        startButton.onclick = startGiveaway;
        startButton.disabled = false;

        updateHostPanelUI();
    }

    function stopGiveaway() {
        startButton.disabled = true; //prevents stop button from being clicked once giveaway has ended
        // Flush any pending stats writes before tearing down
        try { flushStatsNow(); } catch {}

        // Clear persisted giveaway state (giveaway is ending normally)
        clearGiveawaySnapshot();
        releaseTabLock();

        // ── timers ──
        if (giveawayData?.countdownTimerID) clearInterval(giveawayData.countdownTimerID);
        if (giveawayData?.potUpdater) clearInterval(giveawayData.potUpdater);
        if (sponsorsInterval) {
            clearInterval(sponsorsInterval);
            sponsorsInterval = null;
        }
        if (window.__activeTracker) window.__activeTracker = null;

        if (observer) { observer.disconnect(); observer = null; }

        if (reminderRetryTimeout) { clearTimeout(reminderRetryTimeout); reminderRetryTimeout = null; }

        // ── growing maps / sets ──
        numberEntries.clear();
        numberTakenBy.clear();
        fancyNames.clear();
        userCooldown.clear();
        userCommandLog.clear();
        userLastActionAt.clear();
        userLastCommandAt.clear();
        userSpamStrikes.clear();
        userFeedbackCooldown.clear();
        naughtyWarned.clear();
        liveEnteredThisGiveaway.clear();
        liveSponsorSeenThisGiveaway.clear();
        liveSponsorTotalThisGiveaway.clear();
        _adminCache.clear();


        // reset rigged visuals for next giveaway
        riggedMode = false;
        if (rigBadge) {
            rigBadge.hidden = true;
            rigBadge.classList.remove('rigged-pulse');
        }
        if (bonanzaGiveawayFrame) {
            bonanzaGiveawayFrame.classList.remove('rigged');
        }

        // ── global event listeners ──
        document.removeEventListener("click", handleOutsideClick);

        giveawayData = null;
        window.onbeforeunload = null;

        updateRigToggleUI();
        updateHostPanelUI();
    }

    // ───────────────────────────────────────────────────────────
    // SECTION 7: Chat Observation + Parsing
    // ───────────────────────────────────────────────────────────

    // Micro-batch parsing: coalesce all added nodes within a single MutationObserver callback
    // and parse messages immediately (no frame delay), preserving perceived responsiveness while
    // reducing redundant DOM traversals during chat bursts.
    function parseAddedNodesMicroBatch(mutations) {
        const messages = [];
        const seen = new WeakSet();

        function collect(node) {
            if (!node) return;

            // DocumentFragment
            if (node.nodeType === 11 && node.childNodes) {
                for (const child of node.childNodes) collect(child);
                return;
            }

            // Element only
            if (node.nodeType !== 1) return;

            // Direct message
            if (node.matches && node.matches(CHAT_MESSAGE_SELECTOR)) {
                if (!seen.has(node)) {
                    seen.add(node);
                    messages.push(node);
                }
                return;
            }

            // Container: collect any message descendants
            if (node.querySelectorAll) {
                const descendants = node.querySelectorAll(CHAT_MESSAGE_SELECTOR);
                if (descendants && descendants.length) {
                    for (const msg of descendants) {
                        if (!seen.has(msg)) {
                            seen.add(msg);
                            messages.push(msg);
                        }
                    }
                }
            }
        }

        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                collect(node);
            }
        }

        for (const msg of messages) {
            parseMessage(msg);
        }
    }

    function addObserver(giveawayData) {
        observer = new MutationObserver(mutations => {
            const perfStart = PERF ? performance.now() : 0;
            // Micro-batch within the same callback: no rAF delay, still immediate.
            parseAddedNodesMicroBatch(mutations);
            if (PERF) perfMeasure('observer_callback', perfStart);
        });
        startObserver();
    }

    function startObserver() {
        if (!chatMessagesListEl || !chatMessagesListEl.isConnected) {
            chatMessagesListEl = document.querySelector(CHATROOM_MESSAGES_SELECTOR);
        }
        const messageList = chatMessagesListEl;
        if (messageList) {
            observer.observe(messageList, { childList: true });
        }
    }


    // Capture a stable user-tag HTML for the entries table.
    // Some sites render the username via Alpine (x-text/x-show) after the node is inserted,
    // so grabbing userTag.outerHTML too early can produce icon-only markup.
    function escapeHTML(str) {
        try {
            return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        } catch {
            return "";
        }
    }

    // Build a user-tag that renders correctly outside of the chatbox CSS context.
    // Using raw userTag.outerHTML can produce "icon-only" output in the entries table
    // because some UNIT3D themes hide username text unless inside .chatbox-message.
    // This function inlines the important styles and always injects the username text.
    function captureFancyNameTag(messageNode, author) {
        try {
            const userTag = messageNode?.querySelector?.("address.user-tag, .user-tag");
            if (!userTag) return "";

            const userLink = userTag.querySelector("a.user-tag__link, a");
            if (!userLink) return "";

            const nameText = sanitizeNick(author || userLink.textContent || "").trim();
            if (!nameText) return "";

            // Preserve group icon / tag background
            const tagStyles = getComputedStyle(userTag);
            const bgImage = tagStyles.backgroundImage;
            const bgRepeat = tagStyles.backgroundRepeat;
            const bgPosition = tagStyles.backgroundPosition;
            const bgSize = tagStyles.backgroundSize;

            let backgroundStyle = "";
            if (bgImage && bgImage !== "none") {
                // bgImage looks like: url("...") — pull out the URL safely
                const m = /url\(["']?(.*?)["']?\)/.exec(bgImage);
                const url = m ? m[1] : "";
                if (url) {
                    backgroundStyle =
                        `background-image: url('${url}'); ` +
                        `background-repeat: ${bgRepeat}; ` +
                        `background-position: ${bgPosition}; ` +
                        `background-size: ${bgSize}; `;
                }
            }

            // Inline link color so it renders in the entries table
            const linkStyles = getComputedStyle(userLink);
            const color = linkStyles.color || "";

            const wrapperStyle = `${backgroundStyle} padding-left: 20px; display: inline-block;`;
            const linkStyle = `${color ? `color: ${color}; ` : ""}font-size: inherit;`;

            // Preserve classes & title for staff detection (isAdmin uses title)
            const extraClasses = Array.from(userLink.classList || []).filter(c => c && c !== "user-tag__link");
            const href = userLink.getAttribute("href") || userLink.href || "#";
            const title = userLink.getAttribute("title") || "";

            const safeTitle = title ? ` title="${escapeHTML(title)}"` : "";
            const safeName = escapeHTML(nameText);

            return `<address class="user-tag" style="${wrapperStyle}">` +
                `<a href="${escapeHTML(href)}"${safeTitle} class="user-tag__link ${extraClasses.join(" ")}" style="${linkStyle}">${safeName}</a>` +
                `</address>`;
        } catch (e) {
            return "";
        }
    }

    function parseMessage(messageNode) {
        const perfStart = PERF ? performance.now() : 0;
        const messageContentElement = getMessageContentElement(messageNode);
        if (!messageContentElement) return; // system/bot messages — skip

        let messageContent = "";
        try {
            messageContent = messageContentElement.textContent?.trim() || "";
        } catch (e) {
            messageContent = "";
        }

        if (!messageContent) return;

        // Fast ignore: we only care about entries (numbers) and commands (!...)
        const isEntry = regNum.test(messageContent);
        const isCommand = messageContent.startsWith("!");
        if (!isEntry && !isCommand) return;

        const author = getAuthor(messageNode);
        if (!author) return; // could not resolve username from DOM — skip silently

        // Pull fancyName only for relevant messages (entries/commands). We capture a stable tag that
        // always includes the username text (some sites hydrate it after insertion).
        const fancyName = captureFancyNameTag(messageNode, author);


        if (isEntry) {
            handleEntryMessage(parseInt(messageContent, 10), author, fancyName, giveawayData);
        } else {
            handleGiveawayCommands(author, messageContent, fancyName, giveawayData);
        }
        if (PERF) perfMeasure('message_parse', perfStart);
    }

    function getAuthor(msgNode) {
        if (!msgNode || msgNode.nodeType !== 1) return "";

        // Most reliable on UNIT3D/Alpine: parse username from the /users/<name> link in the header user tag.
        // (Some sites report offsetParent as null even when spans are visible, so avoid visibility heuristics.)
        const userLink = msgNode.querySelector('address.user-tag a.user-tag__link[href*="/users/"]');
        if (userLink) {
            const href = userLink.getAttribute("href") || "";
            const m = href.match(/\/users\/([^/?#]+)/i);
            if (m && m[1] && m[1].trim() && m[1].trim().toLowerCase() !== "unknown") {
                try { return decodeURIComponent(m[1].trim()); } catch (e) { return m[1].trim(); }
            }
        }

        // Fallback: Alpine text spans (don't rely on offsetParent for visibility).
        const alpineSpan = msgNode.querySelector('.user-tag__link span[x-text], .user-tag__link span[x-show]');
        if (alpineSpan) {
            const t = (alpineSpan.textContent || "").trim();
            if (t && t !== "Unknown") return t;
        }

        // Final fallback: any non-empty span inside the user tag.
        const spans = msgNode.querySelectorAll('.user-tag__link span');
        for (let i = 0; i < spans.length; i++) {
            const t = (spans[i].textContent || "").trim();
            if (t && t !== "Unknown") return t;
        }

        return "";
    }
    // ───────────────────────────────────────────────────────────
    // SECTION 8: Entry Management
    // ───────────────────────────────────────────────────────────
    /**
     * Shared naughty-list gate for entries and commands.
     * Returns true (and warns once per giveaway) if the user is blocked.
     * Host and staff are always allowed through.
     */
    function isNaughtyBlocked(author, fancyName, giveawayData) {
        if (!naughtySet.has(normalizeUserKey(author))) return false;
        const isHost = giveawayData && normalizeUserKey(author) === normalizeUserKey(giveawayData.host);
        if (isHost || isAdmin(fancyName)) return false;

        const naughtyKey = normalizeUserKey(author);
        if (!naughtyWarned.has(naughtyKey)) {
            sendCommandResponse(author,
                                `[color=#d85e27]${sanitizeNick(author)}[/color], ` +
                                `you are on the [b]naughty list[/b] and may not ` +
                                `enter the giveaway or use its commands.`
                               );
            naughtyWarned.add(naughtyKey);
        }
        return true;
    }

    function handleEntryMessage(number, author, fancyName, giveawayData) {
        // Safety: no active giveaway
        if (!giveawayData) return;

        // Silently ignore ultra-fast entries right after the giveaway starts.
        // This filters out auto-join scripts without punishing or warning anyone.
        if (isWithinEntryIgnoreWindow()) {
            return;
        }

        if (isNaughtyBlocked(author, fancyName, giveawayData)) return;

        // ── Spam detection: treat number entries like commands ──
        // (shares the same window + cooldown as !time / !free / etc.)
        if (applyCooldown(author, { command: "entry" })) {
            // User is in cooldown or just got locked out; ignore this entry
            return;
        }

        // sanitize the raw author names to avoid IRC pings
        const safeAuthor = sanitizeNick(author);

        // Precompute suggestion text for any duplicate cases
        const suggestion = formatFreeNumberSuggestion(giveawayData);


        // Fast duplicate checks (O(1)) using Maps instead of scanning all entries
        const existing = numberEntries.get(author);
        if (existing !== undefined) {
            const repeatMessage =
                  `🚫 Sorry [color=#d85e27]${safeAuthor}[/color], but [color=#32cd53]you[/color] already entered with number [color=#DC3D1D][b]${existing}[/b][/color]!`;
            if (canSendUserFeedback(author, "entry-repeat")) sendCommandResponse(author, repeatMessage);
            return;
        }

        const otherAuthor = numberTakenBy.get(number);
        if (otherAuthor && otherAuthor !== author) {
            const safeOther = sanitizeNick(otherAuthor);
            const repeatMessage =
                  `🚫 Sorry [color=#d85e27]${safeAuthor}[/color], but [color=#32cd53]${safeOther}[/color] already entered with number [color=#DC3D1D][b]${number}[/b][/color]!` +
                  suggestion;
            if (canSendUserFeedback(author, "entry-repeat")) sendCommandResponse(author, repeatMessage);
            return;
        }

        if (number < giveawayData.startNum || number > giveawayData.endNum) {
            const outOfBoundsMessage =
                  `🚫 Sorry [color=#d85e27]${safeAuthor}[/color], but the number [color=#DC3D1D][b]${number}[/b][/color] is outside of the given range! Enter a number between [color=#DC3D1D][b]${giveawayData.startNum}[/b] and [b]${giveawayData.endNum}[/b][/color]!`;
            if (canSendUserFeedback(author, "entry-range")) sendCommandResponse(author, outOfBoundsMessage);
            return;
        }

        if (!numberEntries.has(author)) {
            // when you actually add them, you still store the real author internally
            addNewEntry(author, fancyName, number);
        }

        if (!GENERAL_SETTINGS.suppress_entry_replies) {
            const timeLeftStr = parseTime(giveawayData.timeLeft * 1000);
            const rigHint = rigNote("(entry logged under [b]highly suspicious[/b] conditions) 😈");

            const msg =
                  `[color=#d85e27]${safeAuthor}[/color] has entered with ` +
                  `the number [color=#DC3D1D][b]${number}[/b][/color]! ` +
                  `Time remaining: [b][color=#1DDC5D]${timeLeftStr}[/color][/b].` +
                  rigHint;
            sendCommandResponse(author, msg);
        }
    }


    function addNewEntry(author, fancyName, number) {
        const existingForNumber = numberTakenBy.get(number);
        selfCheck(
            existingForNumber === undefined || existingForNumber === author,
            "entry index conflict before insert",
            { author, number, existingForNumber }
        );

        numberEntries.set(author, number);
        numberTakenBy.set(number, author);

        // Store the fancy tag captured from the triggering message (entry or command).
        // If missing (e.g., IRC bridge), we fall back to a plain sanitized name in the table.
        fancyNames.set(author, fancyName || "");

        recordLiveEntry(author); // ✅ live stats update

        selfCheck(numberEntries.get(author) === number, "author->number map mismatch after insert", {
            author,
            expectedNumber: number,
            storedNumber: numberEntries.get(author)
        });
        selfCheck(numberTakenBy.get(number) === author, "number->author map mismatch after insert", {
            author,
            number,
            mappedAuthor: numberTakenBy.get(number)
        });

        // Fast-path: update just this user's row (no full rebuild, no chat re-scan)
        upsertEntryRow(author);
        snapshotGiveaway();
    }

    function getEntryRowKey(author) {
        return encodeURIComponent(String(author || "").toLowerCase());
    }

    function getFancyNameHTML(author) {
        let html = fancyNames.get(author) || "";
        if (!html) return sanitizeNick(author);

        // Guard: if the markup is icon-only / empty text, show a safe plain name.
        const plain = String(html).replace(/<[^>]*>/g, "").trim();
        if (!plain) return sanitizeNick(author);

        return html;
    }

    function isEntriesTableBasicMode(table) {
        const row = table.querySelector("thead tr");
        return !!(row && row.children && row.children.length === 2);
    }

    function getEntriesTable() {
        if (!entriesTableEl || !entriesTableEl.isConnected) {
            entriesTableEl = document.getElementById('entriesTable');
        }
        return entriesTableEl;
    }

    function clearEntryRowCache() {
        entriesTbodyEl = null;
        entryRowByKey.clear();
    }

    function getEntriesTbody(table) {
        if (!table) return null;
        if (!entriesTbodyEl || !entriesTbodyEl.isConnected || entriesTbodyEl.parentElement !== table) {
            entriesTbodyEl = table.querySelector('tbody');
            if (!entriesTbodyEl) {
                entriesTbodyEl = document.createElement('tbody');
                table.appendChild(entriesTbodyEl);
            }
            entryRowByKey.clear();
        }
        return entriesTbodyEl;
    }

    function upsertEntryRow(author) {
        const perfStart = PERF ? performance.now() : 0;
        const table = getEntriesTable();
        if (!table) return;

        // Don't touch the table while it's in winners/status mode (4 columns)
        if (!isEntriesTableBasicMode(table)) return;

        const tbody = getEntriesTbody(table);
        if (!tbody) return;

        const key = getEntryRowKey(author);
        const esc = (window.CSS && CSS.escape) ? CSS.escape(key) : key;

        let row = entryRowByKey.get(key);
        if (!row || !row.isConnected) {
            row = tbody.querySelector(`tr[data-entry-key="${esc}"]`);
        }
        if (!row) {
            row = document.createElement("tr");
            row.setAttribute("data-entry-key", key);

            const tdUser = document.createElement("td");
            const tdEntry = document.createElement("td");
            row.appendChild(tdUser);
            row.appendChild(tdEntry);

            tbody.appendChild(row);
        }
        entryRowByKey.set(key, row);

        const cells = row.children;
        if (cells && cells.length >= 2) {
            cells[0].innerHTML = getFancyNameHTML(author);

            const entry = numberEntries.get(author);
            cells[1].textContent = (entry === undefined || entry === null) ? "" : String(entry);
        }
        updateHostPanelUI();
        if (PERF) perfMeasure('ui_render_upsert_entry', perfStart);
    }

    function updateEntries() {
        const perfStart = PERF ? performance.now() : 0;
        const table = getEntriesTable();
        if (!table) return;

        // Only rebuild in 2-column mode; winners UI manages its own rows/cells.
        if (!isEntriesTableBasicMode(table)) return;

        const tbody = getEntriesTbody(table);
        if (!tbody) return;

        clearEntryRowCache();
        entriesTbodyEl = tbody;

        // Clear body efficiently
        while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

        const frag = document.createDocumentFragment();
        numberEntries.forEach((entry, author) => {
            const row = document.createElement("tr");
            row.setAttribute("data-entry-key", getEntryRowKey(author));

            const tdUser = document.createElement("td");
            tdUser.innerHTML = getFancyNameHTML(author);

            const tdEntry = document.createElement("td");
            tdEntry.textContent = String(entry);

            row.appendChild(tdUser);
            row.appendChild(tdEntry);
            frag.appendChild(row);
            entryRowByKey.set(getEntryRowKey(author), row);
        });

        tbody.appendChild(frag);
        updateHostPanelUI();
        if (PERF) perfMeasure('ui_render_update_entries', perfStart);
    }


    // ───────────────────────────────────────────────────────────
    // SECTION 9: Sponsorhip Polling and Parsing
    // ───────────────────────────────────────────────────────────

    // Parse a BON gift chat message into { gifter, recipient, amount }
    function parseGiftMessage(html) {
        if (!html || !html.includes('has gifted')) return {};
        const perfStart = PERF ? performance.now() : 0;
        const doc = giftDOMParser.parseFromString(html, "text/html");
        const links = doc.querySelectorAll('a');
        const firstLink = links[0] || null;
        const secondLink = links[1] || null;
        const text = doc.body.textContent || "";
        const m = text.match(GIFT_AMOUNT_RE);

        const amount = m ? Number(m[1]) : NaN;

        const parsed = m && firstLink && secondLink && Number.isFinite(amount) && amount > 0
        ? {
            gifter: firstLink.textContent.trim(),
            recipient: secondLink.textContent.trim(),
            amount
        }
        : {};

        if (PERF) perfMeasure('message_parse_gift_html', perfStart);
        return parsed;
    }

    function giftHistoryUsernameFromCell(cell) {
        if (!cell) return "";
        const link = cell.querySelector('a[href*="/users/"]');
        if (link) {
            try {
                const url = new URL(link.getAttribute("href") || link.href || "", location.origin);
                const parts = url.pathname.split("/").filter(Boolean);
                const idx = parts.findIndex(part => part.toLowerCase() === "users");
                if (idx !== -1 && parts[idx + 1]) return decodeURIComponent(parts[idx + 1]);
            } catch {}
        }
        return String(cell.textContent || "").trim();
    }

    function parseUnit3dTimestamp(value) {
        const raw = String(value || "").trim();
        if (!raw) return NaN;

        // DarkPeers Gift History currently renders Carbon timestamps without a
        // timezone suffix. Preserve both browser-local and UTC-scale interpretations;
        // SponsorTracker learns the actual site-wall-clock ↔ chat-API offset from
        // unambiguous gifts instead of assuming either interpretation is canonical.
        const dbStyle = raw.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(?:\.\d+)?$/);
        if (dbStyle) return Date.parse(`${dbStyle[1]}T${dbStyle[2]}`);

        return Date.parse(raw);
    }

    function parseUnit3dTimestampUtcFallback(value) {
        const raw = String(value || "").trim();
        const dbStyle = raw.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(?:\.\d+)?$/);
        return dbStyle ? Date.parse(`${dbStyle[1]}T${dbStyle[2]}Z`) : NaN;
    }

    // Parse the logged-in user's gift-history table. UNIT3D stores the gift
    // message here, but deliberately omits it from the public SystemBot line.
    function parseGiftHistoryPage(html) {
        if (!html) return [];
        const doc = giftDOMParser.parseFromString(html, "text/html");
        return Array.from(doc.querySelectorAll("table.data-table tbody tr"))
            .map(row => {
                const cells = row.querySelectorAll("td");
                if (cells.length < 5) return null;

                const amountText = String(cells[2].textContent || "")
                    .replace(/[\s\u00A0]+/g, "")
                    .replace(/,/g, "");
                const amountMatch = amountText.match(/[0-9]+(?:\.[0-9]+)?/);
                const amount = amountMatch ? Number(amountMatch[0]) : NaN;

                const timeEl = cells[4].querySelector("time");
                const rawTimestamp = timeEl?.getAttribute("datetime") || "";
                const createdAtTs = parseUnit3dTimestamp(rawTimestamp);
                const createdAtAltTs = parseUnit3dTimestampUtcFallback(rawTimestamp);

                const rawMessage = String(cells[3].textContent || "")
                    .replace(/\s+/g, " ")
                    .trim();
                const message = /^no note$/i.test(rawMessage) ? "" : rawMessage;

                return {
                    sender: giftHistoryUsernameFromCell(cells[0]),
                    recipient: giftHistoryUsernameFromCell(cells[1]),
                    amount,
                    message,
                    rawTimestamp,
                    createdAtTs,
                    createdAtAltTs
                };
            })
            .filter(item =>
                item &&
                item.sender &&
                item.recipient &&
                Number.isFinite(item.amount) &&
                item.amount > 0
            );
    }

    function parseGiftNotificationsPage(html, hostName) {
        if (!html) return [];
        const doc = giftDOMParser.parseFromString(html, "text/html");
        const host = String(hostName || "").trim();

        return Array.from(doc.querySelectorAll("table.data-table tbody tr"))
            .map(row => {
                const cells = row.querySelectorAll("td");
                if (cells.length < 3) return null;

                const title = String(cells[0].textContent || "").replace(/\s+/g, " ").trim();
                const body = String(cells[1].textContent || "").replace(/\s+/g, " ").trim();
                const timeEl = cells[2].querySelector("time");
                const rawTimestamp = timeEl?.getAttribute("datetime") || "";
                const createdAtTs = parseUnit3dTimestamp(rawTimestamp);
                const createdAtAltTs = parseUnit3dTimestampUtcFallback(rawTimestamp);

                const titleMatch = title.match(/^(.+?)\s+Has Gifted You\s+([0-9]+(?:\.[0-9]+)?)\s+BON$/i);
                const bodyMatch = body.match(/^(.+?)\s+has gifted you\s+([0-9]+(?:\.[0-9]+)?)\s+BON\s+with the following note:\s*(.*)$/i);
                if (!titleMatch || !bodyMatch) return null;

                const sender = String(bodyMatch[1] || titleMatch[1] || "").trim();
                const titleAmount = Number(titleMatch[2]);
                const bodyAmount = Number(bodyMatch[2]);
                if (!sender || !Number.isFinite(titleAmount) || !Number.isFinite(bodyAmount)) return null;
                if (Math.abs(titleAmount - bodyAmount) > 0.001) return null;

                const rawNote = String(bodyMatch[3] || "").replace(/\s+/g, " ").trim();
                const message = /^no note$/i.test(rawNote) ? "" : rawNote;

                return {
                    sender,
                    recipient: host,
                    amount: bodyAmount,
                    message,
                    rawTimestamp,
                    createdAtTs,
                    createdAtAltTs
                };
            })
            .filter(item =>
                item &&
                item.sender &&
                Number.isFinite(item.amount) &&
                item.amount > 0
            );
    }

    function giftHistoryBaseKey(item) {
        const sender = normalizeUserKey(item?.sender);
        const recipient = normalizeUserKey(item?.recipient);
        const amount = Number(item?.amount);
        const timestamp = String(item?.rawTimestamp || "");
        const message = String(item?.message || "");
        if (!sender || !recipient || !Number.isFinite(amount)) return "";
        return [sender, recipient, amount.toFixed(2), timestamp, message].join("\u001f");
    }

    function indexGiftHistoryRows(rows) {
        const counts = new Map();
        return (Array.isArray(rows) ? rows : []).map(item => {
            const baseKey = giftHistoryBaseKey(item);
            if (!baseKey) return { ...item, historyKey: "" };
            const occurrence = (counts.get(baseKey) || 0) + 1;
            counts.set(baseKey, occurrence);
            return { ...item, historyKey: `${baseKey}\u001f${occurrence}` };
        });
    }

    function sanitizeSponsorGiftMessage(value) {
        return String(value || "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 255)
            // Gift messages are user-controlled. Neutralize BBCode delimiters
            // before echoing them into a userscript-generated chat message.
            .replace(/\[/g, "［")
            .replace(/\]/g, "］");
    }

    function truncateSponsorGiftMessage(value, maxChars = SPONSOR_ANNOUNCE.max_note_chars) {
        const clean = sanitizeSponsorGiftMessage(value);
        const limit = Math.max(8, Math.floor(Number(maxChars) || 0));
        if (!clean || clean.length <= limit) return clean;
        return clean.slice(0, Math.max(1, limit - 1)).trimEnd() + "…";
    }

    function visibleChatLength(value) {
        return String(value || "")
            .replace(/\[[^\]]+\]/g, "")
            .replace(/[\u200B\u2063]/g, "")
            .length;
    }

    function recordSponsorGiftMessage(data, event) {
        if (!data || !event) return false;
        const message = sanitizeSponsorGiftMessage(event.message);
        const sponsor = String(event.gifter || "").trim();
        const sponsorKey = normalizeUserKey(sponsor);
        const amount = Math.max(0, Math.floor(Number(event.amount) || 0));
        const createdAtTs = Number.isFinite(Number(event.createdAtTs))
            ? Number(event.createdAtTs)
            : null;

        if (!message || !sponsorKey || !(amount > 0)) return false;
        if (!Array.isArray(data.sponsorGiftMessages)) data.sponsorGiftMessages = [];

        const duplicate = data.sponsorGiftMessages.some(item =>
            normalizeUserKey(item?.sponsor) === sponsorKey &&
            Math.max(0, Math.floor(Number(item?.amount) || 0)) === amount &&
            String(item?.message || "") === message &&
            (
                createdAtTs === null ||
                item?.createdAtTs == null ||
                Math.abs(Number(item.createdAtTs) - createdAtTs) < 1000
            )
        );
        if (duplicate) return false;

        data.sponsorGiftMessages.push({
            sponsor,
            amount,
            message,
            createdAtTs
        });
        return true;
    }

    class SponsorTracker {
        /** @param {{chatroomId:string, giveawayStartTime:Date, giveawayData:Object, lastMsgId?:number, cursorInitialized?:boolean, giftHistoryClockOffsetMs?:number|null, giftHistoryInitialized?:boolean, giftHistorySeenKeys?:string[], historyFallbackActive?:boolean}} opts */
        constructor({
            chatroomId,
            giveawayStartTime,
            giveawayData,
            lastMsgId = 0,
            cursorInitialized = false,
            giftHistoryClockOffsetMs = null,
            giftHistoryInitialized = false,
            giftHistorySeenKeys = [],
            historyFallbackActive = false,
            maxAcceptedCreatedAtTs = null
        }) {
            this.chatroomId = chatroomId;
            this.giveawayStartTs = giveawayStartTime.getTime();
            this.data = giveawayData;

            this.lastMsgId = Math.max(0, Math.floor(Number(lastMsgId) || 0)); // persisted API cursor
            this.cursorInitialized = !!cursorInitialized;
            this.giftHistoryClockOffsetMs = Number.isFinite(Number(giftHistoryClockOffsetMs))
                ? Number(giftHistoryClockOffsetMs)
                : null;
            this.giftHistoryInitialized = !!giftHistoryInitialized;
            this.giftHistorySeenKeys = new Set(
                (Array.isArray(giftHistorySeenKeys) ? giftHistorySeenKeys : [])
                    .filter(key => typeof key === "string" && key)
            );
            this.historyFallbackActive = !!historyFallbackActive;
            this.maxAcceptedCreatedAtTs = Number.isFinite(Number(maxAcceptedCreatedAtTs))
                ? Number(maxAcceptedCreatedAtTs)
                : null;
            this.pollInFlight = null; // serialize/coalesce polling so the same gift cannot be applied twice
            this.processedIds = new Set(); // chat-fallback de-dupe within this page lifetime
            this.buffer = []; // gifts waiting to be announced
            this.sponsorWindowStartAt = 0; // digest window start (ms)
            this.sponsorSet = new Set(
                (Array.isArray(giveawayData.sponsors) ? giveawayData.sponsors : [])
                    .map(normalizeUserKey)
                    .filter(Boolean)
            );
        }

        /* ---- poll for any chat messages since last cursor ---- */
        async fetchNew() {
            const url = new URL(`/api/chat/messages/${this.chatroomId}`, location.origin);
            // Some UNIT3D versions ignore after_id. Send it as an optimization,
            // but poll() also enforces lastMsgId locally for correctness.
            if (this.lastMsgId) url.searchParams.set("after_id", this.lastMsgId);

            const res = await fetchWithTimeout(url, { credentials: "include" }, 7000);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const payload = await res.json();
            return Array.isArray(payload && payload.data) ? payload.data : [];
        }

        /**
         * Establish a cursor without applying messages. Used only for legacy
         * snapshots that pre-date cursor persistence, preventing sponsor replay.
         */
        async bootstrapCursor() {
            const url = new URL(`/api/chat/messages/${this.chatroomId}`, location.origin);
            const res = await fetchWithTimeout(url, { credentials: "include" }, 7000);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const payload = await res.json();
            const messages = Array.isArray(payload && payload.data) ? payload.data : [];
            for (const m of messages) {
                const id = Math.floor(Number(m && m.id));
                if (Number.isFinite(id) && id > this.lastMsgId) this.lastMsgId = id;
            }
            this.cursorInitialized = true;
            snapshotGiveaway();
        }

        trimGiftHistorySeenKeys() {
            if (this.giftHistorySeenKeys.size <= 250) return;
            this.giftHistorySeenKeys = new Set(
                Array.from(this.giftHistorySeenKeys).slice(-250)
            );
        }

        setGiftHistoryBaseline(rows) {
            for (const item of indexGiftHistoryRows(rows)) {
                if (item.historyKey) this.giftHistorySeenKeys.add(item.historyKey);
            }
            this.trimGiftHistorySeenKeys();
            this.giftHistoryInitialized = true;
        }

        async bootstrapGiftHistory() {
            try {
                const rows = await this.fetchRecentGiftHistory();
                this.setGiftHistoryBaseline(rows);
                this.historyFallbackActive = false;
                return true;
            } catch (e) {
                if (DEBUG_SETTINGS.log_chat_messages) {
                    console.warn("Gift History bootstrap failed; Chat API fallback armed:", e);
                }
                this.historyFallbackActive = true;
                return false;
            }
        }

        async fetchRecentChatGiftEvents() {
            const messages = await this.fetchNew();
            return messages
                .filter(m => !!m?.bot?.is_systembot && String(m?.message || "").includes("has gifted"))
                .map(m => {
                    const parsed = this.parseGiftMsg(m.message);
                    const createdAtTs = Date.parse(m.created_at);
                    return {
                        gifter: parsed.gifter,
                        recipient: parsed.recipient,
                        amount: Math.max(0, Math.floor(Number(parsed.amount) || 0)),
                        rawAmount: Number(parsed.amount),
                        createdAtTs
                    };
                })
                .filter(event =>
                    event.gifter &&
                    normalizeUserKey(event.recipient) === normalizeUserKey(this.data.host) &&
                    event.amount > 0
                );
        }

        async filterHistoryRowsByWindow(rows, minTs = null, maxTs = null) {
            if (!Array.isArray(rows) || !rows.length) return Array.isArray(rows) ? rows : [];

            const min = Number.isFinite(Number(minTs)) ? Number(minTs) : null;
            let max = Number.isFinite(Number(maxTs)) ? Number(maxTs) : null;
            const liveMax = Number.isFinite(Number(this.maxAcceptedCreatedAtTs))
                ? Number(this.maxAcceptedCreatedAtTs)
                : null;
            const scheduledMax = Number.isFinite(Number(this.data?.endTs))
                ? Number(this.data.endTs)
                : null;
            for (const bound of [liveMax, scheduledMax]) {
                if (bound !== null) max = max === null ? bound : Math.min(max, bound);
            }
            if (min === null && max === null) return rows;

            let offset = Number.isFinite(Number(this.giftHistoryClockOffsetMs))
                ? Number(this.giftHistoryClockOffsetMs)
                : null;

            if (offset === null) {
                try {
                    const chatEvents = await this.fetchRecentChatGiftEvents();
                    offset = this.inferGiftHistoryClockOffset(chatEvents, rows);
                } catch (e) {
                    if (DEBUG_SETTINGS.log_chat_messages) {
                        console.warn("Sponsor history boundary chat fallback failed:", e);
                    }
                }
            }

            // Re-read the closing latch after the await above. If endGiveaway()
            // closed the window while this ordinary poll was already in flight,
            // this pass must immediately inherit that cutoff.
            const latestMax = Number.isFinite(Number(this.maxAcceptedCreatedAtTs))
                ? Number(this.maxAcceptedCreatedAtTs)
                : null;
            if (latestMax !== null) max = max === null ? latestMax : Math.min(max, latestMax);

            const accepted = [];
            for (const item of rows) {
                const wallTs = Number.isFinite(Number(item?.createdAtAltTs))
                    ? Number(item.createdAtAltTs)
                    : Number(item?.createdAtTs);

                if (offset !== null && Number.isFinite(wallTs)) {
                    const eventTs = wallTs - offset;
                    if ((min === null || eventTs >= min) && (max === null || eventTs <= max)) {
                        accepted.push(item);
                    }
                    continue;
                }

                const candidates = [
                    Number(item?.createdAtTs),
                    Number(item?.createdAtAltTs)
                ].filter(Number.isFinite);
                const afterOpen = min === null || (candidates.length && candidates.every(ts => ts >= min));
                const beforeClose = max === null || (candidates.length && candidates.every(ts => ts <= max));

                if (afterOpen && beforeClose) {
                    accepted.push(item);
                } else {
                    logEvent(
                        "Sponsor time-boundary ambiguity",
                        `Skipped an unverified Gift History row from ${sanitizeNick(item?.sender || "unknown")} (${fmtBONCurrency(item?.amount || 0)} BON); verify manually.`
                    );
                }
            }
            return accepted;
        }

        async processGiftHistoryRows(rows, options = {}) {
            const optionMax = Number.isFinite(Number(options.maxCreatedAtTs))
                ? Number(options.maxCreatedAtTs)
                : null;
            const trackerMax = Number.isFinite(Number(this.maxAcceptedCreatedAtTs))
                ? Number(this.maxAcceptedCreatedAtTs)
                : null;
            const scheduledMax = Number.isFinite(Number(this.data?.endTs))
                ? Number(this.data.endTs)
                : null;
            let maxCreatedAtTs = optionMax;
            for (const bound of [trackerMax, scheduledMax]) {
                if (bound !== null) {
                    maxCreatedAtTs = maxCreatedAtTs === null ? bound : Math.min(maxCreatedAtTs, bound);
                }
            }
            const minCreatedAtTs = Number.isFinite(Number(this.giveawayStartTs))
                ? Number(this.giveawayStartTs)
                : null;
            const announce = options.announce !== false;
            const indexed = indexGiftHistoryRows(rows);
            const hostKey = normalizeUserKey(this.data.host);

            let newRows = indexed.filter(item =>
                item.historyKey &&
                !this.giftHistorySeenKeys.has(item.historyKey) &&
                normalizeUserKey(item.recipient) === hostKey
            );

            newRows.reverse();

            if (newRows.length && (minCreatedAtTs !== null || maxCreatedAtTs !== null)) {
                newRows = await this.filterHistoryRowsByWindow(newRows, minCreatedAtTs, maxCreatedAtTs);
            }

            let recordedGiftNote = false;
            for (const item of newRows) {
                const cleanAmount = Math.max(0, Math.floor(Number(item.amount) || 0));
                if (!(cleanAmount > 0)) continue;

                const event = {
                    gifter: item.sender,
                    recipient: item.recipient,
                    amount: cleanAmount,
                    rawAmount: Number(item.amount),
                    message: sanitizeSponsorGiftMessage(item.message),
                    createdAtTs: Number.isFinite(Number(item.createdAtTs))
                        ? Number(item.createdAtTs)
                        : null
                };

                this.applyGift(event.gifter, event.amount);
                if (recordSponsorGiftMessage(this.data, event)) recordedGiftNote = true;
                this.buffer.push({
                    gifter: event.gifter,
                    amount: event.amount,
                    message: event.message || ""
                });
            }

            for (const item of indexed) {
                if (item.historyKey) this.giftHistorySeenKeys.add(item.historyKey);
            }
            this.trimGiftHistorySeenKeys();
            this.giftHistoryInitialized = true;
            this.historyFallbackActive = false;

            if (recordedGiftNote || newRows.length) snapshotGiveaway();

            if (this.buffer.length) {
                if (announce) await this.maybeFlush();
                else await this.flushBuffer(Date.now(), { announce: false });
            }

            return true;
        }

        /* ---- Primary sponsor poll: UNIT3D Gift History ---- */
        async poll(options = {}) {
            const requestedCutoff = Number.isFinite(Number(options?.maxCreatedAtTs))
                ? Number(options.maxCreatedAtTs)
                : null;
            if (requestedCutoff !== null) {
                this.maxAcceptedCreatedAtTs = Number.isFinite(Number(this.maxAcceptedCreatedAtTs))
                    ? Math.min(Number(this.maxAcceptedCreatedAtTs), requestedCutoff)
                    : requestedCutoff;
            }

            const needsDedicatedPass =
                requestedCutoff !== null ||
                options?.announce === false;

            // Ordinary interval ticks coalesce onto the active poll. Settlement/final
            // passes wait for it and then run once with their own cutoff/options.
            if (this.pollInFlight) {
                if (!needsDedicatedPass) return this.pollInFlight;
                try { await this.pollInFlight; } catch {}
            }

            const run = this._pollOnce(options);
            this.pollInFlight = run;
            try {
                return await run;
            } finally {
                if (this.pollInFlight === run) this.pollInFlight = null;
            }
        }

        async _pollOnce(options = {}) {
            const perfStart = PERF ? performance.now() : 0;
            let historyRows;

            try {
                historyRows = await this.fetchRecentGiftHistory();
            } catch (e) {
                this.historyFallbackActive = true;
                if (DEBUG_SETTINGS.log_chat_messages) {
                    console.warn("Gift History unavailable; using Chat API/SystemBot fallback:", e);
                }
                const ok = await this.pollChatFallback(options);
                if (PERF) perfMeasure('sponsor_poll', perfStart);
                return ok;
            }

            if (this.historyFallbackActive) {
                const chatOk = await this.pollChatFallback(options);
                if (!chatOk) {
                    if (PERF) perfMeasure('sponsor_poll', perfStart);
                    return false;
                }
                this.setGiftHistoryBaseline(historyRows);
                this.historyFallbackActive = false;
                snapshotGiveaway();
                if (PERF) perfMeasure('sponsor_poll', perfStart);
                return true;
            }

            if (!this.giftHistoryInitialized) {
                const chatOk = await this.pollChatFallback(options);
                if (!chatOk) {
                    if (PERF) perfMeasure('sponsor_poll', perfStart);
                    return false;
                }
                this.setGiftHistoryBaseline(historyRows);
                snapshotGiveaway();
                if (PERF) perfMeasure('sponsor_poll', perfStart);
                return true;
            }

            const ok = await this.processGiftHistoryRows(historyRows, options);
            if (PERF) perfMeasure('sponsor_poll', perfStart);
            return ok;
        }

        /* ---- Chat API/SystemBot fallback only ---- */
        async pollChatFallback(options = {}) {
            const perfStart = PERF ? performance.now() : 0;
            this.historyFallbackActive = true;
            const optionMax = Number.isFinite(Number(options.maxCreatedAtTs))
                ? Number(options.maxCreatedAtTs)
                : null;
            const trackerMax = Number.isFinite(Number(this.maxAcceptedCreatedAtTs))
                ? Number(this.maxAcceptedCreatedAtTs)
                : null;
            const scheduledMax = Number.isFinite(Number(this.data?.endTs))
                ? Number(this.data.endTs)
                : null;
            let maxCreatedAtTs = optionMax;
            for (const bound of [trackerMax, scheduledMax]) {
                if (bound !== null) {
                    maxCreatedAtTs = maxCreatedAtTs === null ? bound : Math.min(maxCreatedAtTs, bound);
                }
            }
            const announce = options.announce !== false;
            let messages;
            try {
                messages = await this.fetchNew();
            } catch (e) {
                if (DEBUG_SETTINGS.log_chat_messages) console.error("Sponsor API error:", e);
                return false;
            }
            this.cursorInitialized = true;

            /* — filter new, unprocessed gift messages — */
            const gifts = [];
            const cursorAtPollStart = this.lastMsgId;
            for (const m of messages) {
                const numericId = Math.floor(Number(m && m.id));

                // Correctness boundary: never replay a message at/before the persisted
                // cursor. This protects reloads even if the server ignores after_id.
                if (this.cursorInitialized && Number.isFinite(numericId) && numericId <= cursorAtPollStart) continue;
                if (this.processedIds.has(m.id)) continue;

                const createdAtTs = Date.parse(m.created_at);
                if (Number.isFinite(createdAtTs) && createdAtTs <= this.giveawayStartTs) continue;
                if (maxCreatedAtTs !== null && Number.isFinite(createdAtTs) && createdAtTs > maxCreatedAtTs) continue;

                const msgText = m.message || "";
                const isSystemBot = !!m.bot?.is_systembot;
                if (isSystemBot && msgText.includes("has gifted")) gifts.push(m);
            }

            // Advance cursor for every message, not just gifts.
            for (const m of messages) {
                const id = Math.floor(Number(m && m.id));
                if (Number.isFinite(id) && id > this.lastMsgId) this.lastMsgId = id;
            }

            /* parse gifts and update accounting immediately */
            const sponsorEvents = [];
            for (const msg of gifts) {
                this.processedIds.add(msg.id);

                const { gifter, recipient, amount } = this.parseGiftMsg(msg.message);
                if (!gifter || normalizeUserKey(recipient) !== normalizeUserKey(this.data.host)) continue; // only gifts to this host

                const cleanAmount = Math.max(0, Math.floor(Number(amount) || 0));
                if (!(cleanAmount > 0)) continue;

                sponsorEvents.push({
                    gifter,
                    recipient,
                    amount: cleanAmount,
                    rawAmount: Number(amount),
                    createdAtTs: parseUnit3dTimestamp(msg.created_at)
                });
                this.applyGift(gifter, cleanAmount); // update totals immediately
            }

            // The SystemBot line omits the optional gift message. Enrich every new
            // sponsor event from the host's own read-only gift history, including
            // the final settlement poll. Chat announcement remains controlled by
            // `announce`, but statement/audit data should not lose a last-second note.
            const bufferedEvents = sponsorEvents.length
                ? await this.enrichGiftEventsWithMessages(sponsorEvents)
                : sponsorEvents;

            let recordedGiftNote = false;
            for (const event of bufferedEvents) {
                if (recordSponsorGiftMessage(this.data, event)) recordedGiftNote = true;
                this.buffer.push({
                    gifter: event.gifter,
                    amount: event.amount,
                    message: event.message || ""
                });
            }
            if (recordedGiftNote) snapshotGiveaway();

            /* send ONE summary line if anything new arrived */
            if (this.buffer.length) {
                if (announce) await this.maybeFlush();
                else await this.flushBuffer(Date.now(), { announce: false });
            }
            if (PERF) perfMeasure('sponsor_poll', perfStart);
            return true;
        }

        /* ---- pull gifter / recipient / amount from the HTML blob ---- */
        parseGiftMsg(html) {
            return parseGiftMessage(html);
        }

        async fetchRecentGiftNotifications() {
            const senderSlug = getAuthenticatedUserSlug();
            if (!senderSlug) return [];

            const notificationsPath = `/users/${encodeURIComponent(decodeURIComponent(senderSlug))}/notifications`;
            const notificationsUrl = new URL(notificationsPath, location.origin);
            notificationsUrl.searchParams.set("_dpgw", String(Date.now()));
            const res = await fetchWithTimeout(
                notificationsUrl,
                {
                    credentials: "same-origin",
                    cache: "no-store"
                },
                7000
            );
            if (!res.ok) throw new Error(`Gift notifications HTTP ${res.status}`);
            return parseGiftNotificationsPage(await res.text(), this.data?.host || "");
        }

        async fetchRecentGiftHistory() {
            const senderSlug = getAuthenticatedUserSlug();
            const endpointPath = getGiftEndpointPath(senderSlug);
            if (!endpointPath) return [];

            const historyUrl = new URL(endpointPath, location.origin);
            historyUrl.searchParams.set("_dpgw", String(Date.now()));
            const res = await fetchWithTimeout(
                historyUrl,
                {
                    credentials: "same-origin",
                    cache: "no-store"
                },
                7000
            );
            if (!res.ok) throw new Error(`Gift history HTTP ${res.status}`);
            return parseGiftHistoryPage(await res.text());
        }

        inferGiftHistoryClockOffset(events, rows) {
            const persisted = Number.isFinite(Number(this.giftHistoryClockOffsetMs))
                ? Number(this.giftHistoryClockOffsetMs)
                : null;
            if (!Array.isArray(events) || !events.length || !Array.isArray(rows) || !rows.length) {
                return persisted;
            }

            const MAX_PLAUSIBLE_OFFSET_MS = 12 * 60 * 60 * 1000;
            const samples = [];

            for (const event of events) {
                if (!Number.isFinite(Number(event?.createdAtTs)) || !Number.isFinite(Number(event?.rawAmount))) continue;

                const exactRows = rows.filter(item =>
                    normalizeUserKey(item?.sender) === normalizeUserKey(event.gifter) &&
                    normalizeUserKey(item?.recipient) === normalizeUserKey(event.recipient) &&
                    Math.abs(Number(item?.amount) - Number(event.rawAmount)) <= 0.001
                );

                // Only use a unique sender/recipient/amount pair as a clock anchor.
                // Repeated same-value gifts (e.g. multiple 69 BON gifts) are exactly
                // what the learned offset is meant to disambiguate later.
                if (exactRows.length !== 1) continue;

                const item = exactRows[0];
                const historyWallTs = Number.isFinite(Number(item.createdAtAltTs))
                    ? Number(item.createdAtAltTs) // naive yyyy-mm-dd HH:mm:ss interpreted as site wall-clock on a UTC scale
                    : Number(item.createdAtTs);
                if (!Number.isFinite(historyWallTs)) continue;

                const offset = historyWallTs - Number(event.createdAtTs);
                if (Math.abs(offset) <= MAX_PLAUSIBLE_OFFSET_MS) samples.push(offset);
            }

            if (!samples.length) return persisted;

            // Choose the densest 2-minute cluster, then its median. This rejects an
            // unrelated historical exact-value row without hardcoding any timezone.
            samples.sort((a, b) => a - b);
            const CLUSTER_MS = 120_000;
            let best = [];

            for (let i = 0; i < samples.length; i++) {
                const cluster = [];
                for (let j = i; j < samples.length; j++) {
                    if (samples[j] - samples[i] > CLUSTER_MS) break;
                    cluster.push(samples[j]);
                }
                if (cluster.length > best.length) best = cluster;
            }

            if (!best.length) return persisted;
            const mid = Math.floor(best.length / 2);
            const inferred = best.length % 2
                ? best[mid]
                : Math.round((best[mid - 1] + best[mid]) / 2);

            // If we already learned a clock offset, don't replace it with a lone,
            // materially different sample. Multiple agreeing anchors may update it
            // after a DST/site-timezone transition.
            if (
                persisted !== null &&
                best.length === 1 &&
                Math.abs(inferred - persisted) > CLUSTER_MS
            ) {
                return persisted;
            }

            this.giftHistoryClockOffsetMs = inferred;
            return inferred;
        }

        matchGiftEventsToRows(events, rows) {
            if (!Array.isArray(events) || !events.length) return [];
            if (!Array.isArray(rows) || !rows.length) {
                return events.map(event => ({ ...event, _noteSourceMatched: false }));
            }

            const usedRows = new Set();
            const MATCH_WINDOW_MS = 120_000;
            const learnedOffsetMs = this.inferGiftHistoryClockOffset(events, rows);

            const rowMatchesEventIdentity = (item, event) =>
                normalizeUserKey(item?.sender) === normalizeUserKey(event?.gifter) &&
                normalizeUserKey(item?.recipient) === normalizeUserKey(event?.recipient) &&
                Math.abs(Number(item?.amount) - Number(event?.rawAmount)) <= 0.001;

            const rowSiteClockTs = item => {
                if (Number.isFinite(Number(item?.createdAtAltTs))) return Number(item.createdAtAltTs);
                if (Number.isFinite(Number(item?.createdAtTs))) return Number(item.createdAtTs);
                return NaN;
            };

            return events.map(event => {
                if (!Number.isFinite(Number(event.createdAtTs)) || !Number.isFinite(Number(event.rawAmount))) {
                    return { ...event, _noteSourceMatched: false };
                }

                const exactCandidates = [];
                for (let i = 0; i < rows.length; i++) {
                    if (usedRows.has(i)) continue;
                    if (rowMatchesEventIdentity(rows[i], event)) exactCandidates.push(i);
                }

                if (!exactCandidates.length) return { ...event, _noteSourceMatched: false };

                // One exact identity match is unambiguous even if the site's displayed
                // clock and chat API disagree. This also provides an anchor for future
                // repeated-value gifts.
                let bestIndex = exactCandidates.length === 1 ? exactCandidates[0] : -1;

                if (bestIndex === -1) {
                    let bestDelta = Infinity;

                    for (const i of exactCandidates) {
                        const item = rows[i];
                        const siteTs = rowSiteClockTs(item);
                        if (!Number.isFinite(siteTs)) continue;

                        let delta = Infinity;

                        if (Number.isFinite(Number(learnedOffsetMs))) {
                            delta = Math.abs(
                                (siteTs - Number(event.createdAtTs)) - Number(learnedOffsetMs)
                            );
                        } else {
                            // Compatibility fallback for UNIT3D installs whose two
                            // timestamp sources already agree in local or UTC terms.
                            const timestampCandidates = [
                                Number(item.createdAtTs),
                                Number(item.createdAtAltTs)
                            ].filter(Number.isFinite);
                            if (timestampCandidates.length) {
                                delta = Math.min(
                                    ...timestampCandidates.map(ts =>
                                        Math.abs(ts - Number(event.createdAtTs))
                                    )
                                );
                            }
                        }

                        if (delta > MATCH_WINDOW_MS || delta >= bestDelta) continue;
                        bestDelta = delta;
                        bestIndex = i;
                    }
                }

                if (bestIndex === -1) return { ...event, _noteSourceMatched: false };
                usedRows.add(bestIndex);

                const message = sanitizeSponsorGiftMessage(rows[bestIndex].message);
                return {
                    ...event,
                    message,
                    _noteSourceMatched: true
                };
            });
        }

        async enrichGiftEventsWithMessages(events) {
            if (!Array.isArray(events) || !events.length) return [];

            // Canonical source: Gift History is backed directly by UNIT3D's Gift
            // records. The gift is persisted with its message before any notification
            // is queued/suppressed, so use history first.
            let historyRows = [];
            try {
                historyRows = await this.fetchRecentGiftHistory();
            } catch (e) {
                if (DEBUG_SETTINGS.log_chat_messages) {
                    console.warn("Sponsor gift-history lookup failed:", e);
                }
            }

            let enriched = this.matchGiftEventsToRows(events, historyRows);

            // Notifications are only a fallback for events that Gift History could
            // not match. UNIT3D notifications can be disabled by recipient settings,
            // blocked by sender group, or delayed by the queue.
            const unmatchedIndexes = [];
            const unmatchedEvents = [];
            enriched.forEach((event, index) => {
                if (!event._noteSourceMatched) {
                    unmatchedIndexes.push(index);
                    unmatchedEvents.push(events[index]);
                }
            });

            if (unmatchedEvents.length) {
                let notificationRows = [];
                try {
                    notificationRows = await this.fetchRecentGiftNotifications();
                } catch (e) {
                    if (DEBUG_SETTINGS.log_chat_messages) {
                        console.warn("Sponsor notification fallback failed:", e);
                    }
                }

                if (notificationRows.length) {
                    const fallbackMatches = this.matchGiftEventsToRows(unmatchedEvents, notificationRows);
                    fallbackMatches.forEach((event, i) => {
                        if (event._noteSourceMatched) enriched[unmatchedIndexes[i]] = event;
                    });
                }
            }

            return enriched.map(({ _noteSourceMatched, ...event }) => event);
        }

        /* ---- update pot + per-sponsor running totals ---- */
        applyGift(gifter, amount) {
            const cleanAmount = Math.max(0, Math.floor(Number(amount) || 0));
            const sponsorKey = normalizeUserKey(gifter);
            if (!sponsorKey || !(cleanAmount > 0)) return;

            this.data.amount += cleanAmount;

            // Preserve the first-seen display casing while merging later gifts from
            // the same username case-insensitively.
            const existingName = Object.keys(this.data.sponsorContribs || {})
                .find(name => normalizeUserKey(name) === sponsorKey) || gifter;
            this.data.sponsorContribs[existingName] =
                (Number(this.data.sponsorContribs[existingName]) || 0) + cleanAmount;

            recomputeEffectiveWinners(this.data);
            flashPotTotalUI();

            const totalSponsoredNow = sumSponsorContribs(this.data.sponsorContribs, this.data.host);
            logEvent("Sponsorship recorded", `${sanitizeNick(gifter)} added ${fmtBONCurrency(cleanAmount)} BON | Total sponsored=${fmtBONCurrency(totalSponsoredNow)} BON`);

            if (!this.sponsorSet.has(sponsorKey)) {
                this.sponsorSet.add(sponsorKey);
                this.data.sponsors.push(gifter);
            }

            recordLiveSponsorGift(gifter, cleanAmount); // live sponsor stats update
            snapshotGiveaway();
        }

        async announceWinnerScalingIfNeeded() {
            const data = this.data;
            if (!data || data !== giveawayData || !data.scaleWinnersWithSponsors) return;
            if (!(Number(data.timeLeft) > 0)) return;

            const baseWinners = Math.max(1, Math.min(MAX_WINNERS, Math.floor(Number(data.baseWinnersAtStart || data.winnersNum) || 1)));
            const newWinners = recomputeEffectiveWinners(data);
            const oldWinners = Math.max(1, Math.floor(Number(data.lastAnnouncedWinners ?? baseWinners) || baseWinners));

            if (newWinners <= oldWinners) return;

            const delta = newWinners - oldWinners;
            const cap = Math.min(
                Math.max(baseWinners, Math.min(Math.floor(Number(data.hostMaxScaledWinners) || baseWinners), MAX_WINNERS)),
                MAX_WINNERS
            );
            const totalContribForScaling = getTotalContribForScaling(data);
            const threshold = getScalingBonPerWinner(data);

            let message =
                `[b][color=${SCALING_ACCENT_COLOR}]Scaling:[/color][/b] [b]Winners increased[/b]: ${oldWinners} → ${newWinners} (+${delta}). ` +
                `Total scaling contributions: ${fmtBONCurrency(totalContribForScaling)} BON. ` +
                `Threshold: ${fmtBONCurrency(threshold)} BON/winner.`;

            const reachedCap = newWinners >= cap;
            if (reachedCap) {
                message += ` [b]Max winners reached[/b] (${cap}).`;
            }

            logEvent("Scaled winners increased", `${oldWinners} -> ${newWinners} (+${delta})${reachedCap ? ` | cap reached=${fmtBON(cap)}` : ""}`);
            await sendMessage(message);
            flashWinnersUI();
            data.lastAnnouncedWinners = newWinners;
        }


        /* ---- decide when to announce buffered sponsor gifts ---- */
        async maybeFlush(force = false) {
            if (!this.buffer.length) return;

            // In off mode, don't clutter chat at all (still counts + updates pot)
            if (SPONSOR_ANNOUNCE.mode === "off") {
                await this.announceWinnerScalingIfNeeded();
                this.buffer.length = 0;
                this.sponsorWindowStartAt = 0;
                return;
            }

            const now = Date.now();

            // Start (or restart) the digest window when the first pending gift arrives
            if (!this.sponsorWindowStartAt) this.sponsorWindowStartAt = now;

            // Old behavior: announce immediately whenever new gifts arrive
            if (SPONSOR_ANNOUNCE.mode === "immediate") {
                await this.flushBuffer(now);
                return;
            }

            const deltaTotalNum = this.buffer.reduce((s, g) => s + (Number(g.amount) || 0), 0);
            const hasBigSingle = this.buffer.some(g => (Number(g.amount) || 0) >= SPONSOR_ANNOUNCE.immediate_single_min);
            const tooManyEvents = this.buffer.length >= SPONSOR_ANNOUNCE.max_pending_events;
            const hitMinTotal = deltaTotalNum >= SPONSOR_ANNOUNCE.flush_min_total;
            const hitTime = (now - this.sponsorWindowStartAt) >= SPONSOR_ANNOUNCE.digest_ms;

            if (force || hasBigSingle || tooManyEvents || hitMinTotal || hitTime) {
                await this.flushBuffer(now);
            }
        }

        /* ---- build a single chat line & clear buffer ---- */
        async flushBuffer(nowTs = Date.now(), options = {}) {
            const announce = !(options && options.announce === false);
            if (!this.buffer.length) return;

            const grouped = this.buffer.reduce((acc, { gifter, amount, message }) => {
                const key = normalizeUserKey(gifter);
                if (!key) return acc;
                if (!acc[key]) acc[key] = { name: gifter, amt: 0, messages: [] };

                acc[key].amt += Number(amount) || 0;

                const cleanMessage = sanitizeSponsorGiftMessage(message);
                if (cleanMessage && !acc[key].messages.includes(cleanMessage)) {
                    acc[key].messages.push(cleanMessage);
                }
                return acc;
            }, {});

            const entries = Object.values(grouped)
            .map(entry => ({
                name: entry.name,
                amt: Number(entry.amt) || 0,
                messages: Array.isArray(entry.messages) ? entry.messages : []
            }))
            .filter(e => e.name && e.amt > 0)
            .sort((a, b) => b.amt - a.amt);

            const sponsorCount = entries.length;
            const deltaTotalNum = entries.reduce((s, e) => s + e.amt, 0);

            if (!sponsorCount || !deltaTotalNum) {
                this.buffer.length = 0;
                this.sponsorWindowStartAt = 0;
                return;
            }

            const deltaTotal = fmtBONCurrency(deltaTotalNum);
            const potTotal = fmtBONCurrency(cleanPotString(this.data.amount));

            // Keep the line short: show only the biggest contributors in this digest
            const topN = Math.max(0, Number(SPONSOR_ANNOUNCE.show_top_n) || 0);
            const minPerUser = Math.max(0, Number(SPONSOR_ANNOUNCE.show_min_per_user) || 0);

            const nextWinnerLine = getSponsorshipNextWinnerLine(this.data);
            const prefix =
                `${bridgeMarker(BRIDGE_MARKERS.SPONSORS, "✨")} Sponsors just added [color=#DC3D1D][b]${deltaTotal} BON[/b][/color] ` +
                `from [b]${sponsorCount} sponsor${sponsorCount === 1 ? "" : "s"}[/b]! `;
            const suffix =
                `Total pot is now [b][color=#ffc00a]${potTotal} BON[/color][/b].` +
                (nextWinnerLine ? ` ${nextWinnerLine}` : "");

            const maxVisible = Math.max(180, Math.floor(Number(SPONSOR_ANNOUNCE.max_visible_chars) || 300));
            const maxNotes = Math.max(0, Math.floor(Number(SPONSOR_ANNOUNCE.max_notes_per_sponsor) || 0));
            const shownParts = [];
            const overflowNotes = [];
            let shownCount = 0;

            for (const e of entries) {
                if (shownCount >= topN) {
                    if (e.messages.length) overflowNotes.push(e);
                    continue;
                }
                if (sponsorCount > 1 && e.amt < minPerUser) {
                    if (e.messages.length) overflowNotes.push(e);
                    continue;
                }

                const basePart =
                    `[color=#1DDC5D][b]${sanitizeNick(e.name)}[/b][/color] ` +
                    `([color=#DC3D1D][b]${fmtBONCurrency(e.amt)}[/b][/color])`;

                const notes = e.messages
                    .slice(0, maxNotes)
                    .map(note => truncateSponsorGiftMessage(note))
                    .filter(Boolean);

                let detailedPart = basePart;
                if (notes.length === 1) {
                    detailedPart += ` with the message [i]"${notes[0]}"[/i]`;
                } else if (notes.length > 1) {
                    detailedPart += ` with the messages ` +
                        notes.map(note => `[i]"${note}"[/i]`).join(", ");
                    if (e.messages.length > notes.length) {
                        detailedPart += ` [i](+${e.messages.length - notes.length} more)[/i]`;
                    }
                }

                const separator = shownParts.length ? ", " : "";
                const remainingAfterThis = sponsorCount - (shownCount + 1);
                const candidateTail = remainingAfterThis > 0 ? `, [i]+${remainingAfterThis} more[/i]. ` : ". ";
                const candidateDetailed =
                    prefix + shownParts.join(", ") + separator + detailedPart + candidateTail + suffix;

                if (visibleChatLength(candidateDetailed) <= maxVisible) {
                    shownParts.push(detailedPart);
                    shownCount += 1;
                    continue;
                }

                const candidateBase =
                    prefix + shownParts.join(", ") + separator + basePart + candidateTail + suffix;
                if (visibleChatLength(candidateBase) <= maxVisible) {
                    shownParts.push(basePart);
                    shownCount += 1;
                    if (notes.length) overflowNotes.push(e);
                    continue;
                }

                if (notes.length) overflowNotes.push(e);
            }

            const othersCount = Math.max(0, sponsorCount - shownCount);
            let msg = prefix;

            if (shownParts.length) {
                msg += shownParts.join(", ");
                if (othersCount > 0) msg += `, [i]+${othersCount} more[/i]`;
                msg += ". ";
            }

            msg += suffix;

            const noteContinuationMessages = [];
            if (overflowNotes.length) {
                const noteParts = [];

                for (const e of overflowNotes) {
                    const notes = e.messages
                        .slice(0, maxNotes)
                        .map(note => truncateSponsorGiftMessage(note))
                        .filter(Boolean);
                    if (!notes.length) continue;

                    const noteText = notes.length === 1
                        ? `[color=#1DDC5D][b]${sanitizeNick(e.name)}[/b][/color]: [i]"${notes[0]}"[/i]`
                        : `[color=#1DDC5D][b]${sanitizeNick(e.name)}[/b][/color]: ` +
                            notes.map(note => `[i]"${note}"[/i]`).join(", ");

                    noteParts.push(noteText);
                }

                const continuationPrefix = `${bridgeMarker(BRIDGE_MARKERS.SPONSOR_MESSAGES, "💬")} Sponsor message`;
                let currentParts = [];

                const flushNoteChunk = () => {
                    if (!currentParts.length) return;
                    noteContinuationMessages.push(
                        `${continuationPrefix}${currentParts.length === 1 ? "" : "s"}: ` +
                        currentParts.join(" | ") + "."
                    );
                    currentParts = [];
                };

                for (const part of noteParts) {
                    const candidateParts = currentParts.concat(part);
                    const candidate =
                        `${continuationPrefix}${candidateParts.length === 1 ? "" : "s"}: ` +
                        candidateParts.join(" | ") + ".";

                    if (currentParts.length && visibleChatLength(candidate) > maxVisible) {
                        flushNoteChunk();
                    }
                    currentParts.push(part);
                }
                flushNoteChunk();
            }

            if (announce) {
                await sendMessage(msg);
                for (const noteMessage of noteContinuationMessages) {
                    await sendMessage(noteMessage);
                }
                flashPotTotalUI();
                await this.announceWinnerScalingIfNeeded();
            }
            this.buffer.length = 0; // clear the batch/digest
            this.sponsorWindowStartAt = 0; // reset digest window
        }
    }

    // ───────────────────────────────────────────────────────────
    // SECTION 10: Command Handling
    // ───────────────────────────────────────────────────────────
    function handleGiveawayCommands(author, messageContent, fancyName, giveawayData) {
        // Fast-exit when it’s not a command
        if (!messageContent.startsWith("!")) return;

        // Parse command + args first
        const args = messageContent.slice(1).trim().split(/\s+/);
        const command = (args.shift() || "").toLowerCase();

        // Early-ignore window for *entry* commands right after giveaway starts.
        // This ensures auto-join scripts are dropped before naughty/cooldown logic.
        const isEntryCommand =
              command === "random" || command === "luckye"; // add more here later if you introduce other entry commands

        if (isEntryCommand && isWithinEntryIgnoreWindow()) {
            return;
        }

        if (isNaughtyBlocked(author, fancyName, giveawayData)) return;

        if (!validCommands.has(command)) return; // Unsupported

        if (applyCooldown(author, { command })) return; // Spammer – ignored

        executeCommand({
            name: command,
            args,
            author,
            fancyName,
            giveawayData,
            source: "chat",
            reply: (msg) => sendCommandResponse(author, msg)
        });
    }

    function executeCommand({ name, args = [], author = "", fancyName = "", giveawayData: dataOverride, reply, source = "chat" } = {}) {
        const data = dataOverride || giveawayData || null;
        const resolvedAuthor = author || getLoggedInUsername() || (data ? data.host : "") || "";
        const resolvedFancyName = fancyName || "";
        const replyFn = typeof reply === "function"
        ? reply
        : (msg) => sendCommandResponse(resolvedAuthor, msg);

        const handler = COMMAND_HANDLERS[name];
        if (!handler) return;

        const maybePromise = handler({
            author: resolvedAuthor,
            fancyName: resolvedFancyName,
            args,
            giveawayData: data,
            reply: replyFn,
            say: (msg) => sendMessage(msg),
            pm: (to, msg) => sendPrivateMessage(to, msg),
            source,
            safeAuthor: sanitizeNick(resolvedAuthor),
            safeHost: sanitizeNick(data ? data.host : "")
        });

        if (maybePromise && typeof maybePromise.then === "function") {
            maybePromise.catch(err => console.error("Giveaway command handler error:", err));
        }
    }



    /**
     * Throttle per-user feedback messages (duplicate entry / out-of-range / spam lockout notices)
     * to avoid the script spamming chat with repeated error responses.
     *
     * @param {string} author
     * @param {string} bucket - feedback category key, e.g. "entry-repeat", "entry-range", "spam-lockout"
     * @param {number} cooldownMs - override cooldown in ms (default ENTRY_FEEDBACK_COOLDOWN_MS)
     * @returns {boolean} true if feedback may be sent now
     */
    function canSendUserFeedback(author, bucket, cooldownMs = ENTRY_FEEDBACK_COOLDOWN_MS) {
        const now = Date.now();
        const authorKey = String(author || "").toLowerCase();
        if (!authorKey) return true;

        const b = String(bucket || "default");
        const key = `${authorKey}::${b}`;
        const last = userFeedbackCooldown.get(key) || 0;

        if (now - last < cooldownMs) return false;

        userFeedbackCooldown.set(key, now);
        return true;
    }

    /** Rate‑limit users – returns `true` when the caller must be ignored. */
    function applyCooldown(author, opts = {}) {
        const now = Date.now();
        const rawAuthor = String(author || "");
        const authorKey = rawAuthor.toLowerCase();
        if (!authorKey) return false;

        const lockoutExpires = userCooldown.get(authorKey) || 0;
        if (now < lockoutExpires) return true;

        // Track this trigger in the rolling window (we count triggers even if we suppress output)
        const log = (userCommandLog.get(authorKey) || []).filter(ts => now - ts < COMMAND_WINDOW_MS);
        log.push(now);
        userCommandLog.set(authorKey, log);
        selfCheck(log.length >= 1, "command log should contain at least the current trigger", {
            author: rawAuthor,
            logLength: log.length
        });

        // Block ultra-fast repeats (bots / accidental double-send)
        const lastAny = userLastActionAt.get(authorKey) || 0;
        const tooFast = (now - lastAny) < MIN_ACTION_GAP_MS;
        userLastActionAt.set(authorKey, now);

        // Per-command cooldown (prevents identical output spam)
        let repeatBlocked = false;
        const cmd = (opts && typeof opts === "object" && opts.command != null)
        ? String(opts.command).trim().toLowerCase()
        : "";

        if (cmd) {
            const cd = Number(REPEAT_COMMAND_COOLDOWNS_MS[cmd]) || 0;
            if (cd > 0) {
                const k = `${authorKey}::${cmd}`;
                const lastCmd = userLastCommandAt.get(k) || 0;
                repeatBlocked = (now - lastCmd) < cd;
                userLastCommandAt.set(k, now);
            }
        }

        // Hard limit in the rolling window → lockout (with escalating penalties for repeat offenders)
        if (log.length > MAX_COMMANDS_PER_WINDOW) {
            const excess = log.length - MAX_COMMANDS_PER_WINDOW;

            const prev = userSpamStrikes.get(authorKey) || { count: 0, lastAt: 0 };
            if (now - (prev.lastAt || 0) < STRIKE_WINDOW_MS) {
                prev.count = (prev.count || 0) + 1;
            } else {
                prev.count = 1;
            }
            prev.lastAt = now;
            userSpamStrikes.set(authorKey, prev);

            const multiplier = Math.min(MAX_STRIKE_MULTIPLIER, Math.pow(2, Math.max(0, (prev.count || 1) - 1)));
            const penaltySec = Math.max(1, Math.round(BASE_PENALTY_SECONDS * excess * multiplier));

            userCooldown.set(authorKey, now + penaltySec * 1000);
            userCommandLog.delete(authorKey);

            if (canSendUserFeedback(rawAuthor, "spam-lockout", 60_000)) {
                sendCommandResponse(rawAuthor, `[color=red][b]Spamming detected! ${sanitizeNick(rawAuthor)} locked out for ${penaltySec} seconds.[/b][/color]`);
            }
            return true;
        }

        // If we didn't lock them out, we may still suppress output for too-fast / repeat cases
        return tooFast || repeatBlocked;
    }

    const _adminCache = new Map(); // fancyName HTML → boolean (cleared per giveaway in stopGiveaway)

    function isAdmin(fancyName) {
        if (!fancyName) return false;
        const cached = _adminCache.get(fancyName);
        if (cached !== undefined) return cached;

        let result = false;
        try {
            const div = document.createElement('div');
            div.innerHTML = fancyName;
            const a = div.querySelector('a.user-tag__link');
            if (a) {
                const title = a.getAttribute('title')?.toLowerCase() || '';
                const roleTokens = title.split(/[^a-z0-9]+/).filter(Boolean);
                const privilegedRoles = new Set([
                    'leader', 'administrator', 'admin', 'moderator', 'mod', 'developer', 'operator'
                ]);
                const collapsedTitle = title.replace(/[^a-z0-9]+/g, '');
                result = roleTokens.some(token => privilegedRoles.has(token)) ||
                    collapsedTitle.includes('onlyguardians');
            }
        } catch {
            result = false;
        }
        _adminCache.set(fancyName, result);
        return result;
    }

    /** Factory for leaderboard commands — eliminates boilerplate across top/most/sponsors/unlucky. */
    function makeLeaderboardCommand({ emoji, label, emptyMsg, sort, filter, format }) {
        return function leaderboardHandler(ctx) {
            const { reply } = ctx;
            const n = Math.min(STATS_MAX_TOP_N, Math.max(1, parseInt(ctx.args[0] || STATS_DEFAULT_TOP_N, 10) || STATS_DEFAULT_TOP_N));
            const rows = getLeaderboardRows(sort, n, filter);
            if (!rows.length) {
                reply(emptyMsg);
                return;
            }
            const out = rows.map((u, i) => format(u, i, ctx));
            reply(`[b]${bridgeMarker(BRIDGE_MARKERS.STATS, "📊")} ${emoji} ${label}: ${out.join(" | ")}[/b]`);
        };
    }

    Object.assign(COMMAND_HANDLERS, {
        /* Public commands */
        time(ctx) {
            const { args, author, fancyName, giveawayData, reply } = ctx;

            const addMinutes = hostAdjustTime(+1);
            const removeMinutes = hostAdjustTime(-1);

            // no args  → show countdown
            if (args.length === 0) {
                reply(
                    `Time left: [b][color=#1DDC5D]${parseTime(
                        giveawayData.timeLeft * 1000
                    )}[/color][/b] ${bridgeMarker(BRIDGE_MARKERS.TIME, "⏳")}`
                );
                return;
            }

            const action = (args[0] || "").toLowerCase(); // "add" / "remove"
            const minutes = parseFloat(args[1]);
            const isPriv = normalizeUserKey(author) === normalizeUserKey(giveawayData.host) || isAdmin(fancyName);

            if (!isPriv) return; // silently ignore non-host/non-admin

            if (action !== "add" && action !== "remove") {
                reply("[color=red]Usage:[/color] !time add|remove <minutes>");
                return;
            }

            if (isNaN(minutes) || minutes <= 0) {
                reply("[color=red]Usage:[/color] !time add|remove <minutes>");
                return;
            }

            // Pass only the minutes to the shared adjuster
            const ctxWithArg = { ...ctx, args: [String(minutes)] };

            if (action === "add") {
                addMinutes(ctxWithArg);
            } else {
                removeMinutes(ctxWithArg);
            }
        },

        entries({ giveawayData , reply}) {
            const taken = numberEntries.size;
            const total = giveawayData.totalEntries;
            const free = total - taken;

            if (taken === 0) {
                reply(`[b]No entries yet! ${total} numbers available.[/b]`);
                return;
            }

            // Sort by entry number (ascending)
            const list = Array.from(numberEntries.entries())
            .sort(([, numA], [, numB]) => numA - numB)
            .map(([user, num]) =>
                 `[color=#d85e27][b]${sanitizeNick(user)}[/b][/color]: [b]${num}[/b]`
                );

            reply(
                `${bridgeMarker(BRIDGE_MARKERS.ENTRIES, "📋")} Entries – ${taken}/${total} ` +
                `[b]([color=#1DDC5D]${free} free[/color][/b]): ${list.join(", ")}`
            );
        },

        help: showHelp,
        commands: showHelp,

        stats(ctx) {
            const { reply } = ctx;
            const target = (ctx.args[0] || ctx.author || "").trim();
            const stats = getStatsCached();
            const key = normUserKey(target);
            const rec = key && stats.users ? stats.users[key] : null;

            if (!rec) {
                reply(`[b]No saved stats yet for ${safeNameForChat(target)}.[/b]`);
                return;
            }

            const enteredAll = rec.entered || 0;
            const wins = rec.wins || 0;
            const losses = rec.losses || 0;

            // Winrate should be based on completed giveaways only.
            let enteredForWr = enteredAll;
            if (ctx.giveawayData && liveEnteredThisGiveaway.has(key)) {
                enteredForWr = Math.max(0, enteredAll - 1);
            }
            const wr = enteredForWr ? ((wins / enteredForWr) * 100).toFixed(1) : "0.0";

            // If the giveaway host calls !stats (for themselves), also show how much they've given away (host pot only; excludes sponsors).
            const isHostCaller = !!(ctx.giveawayData && normUserKey(ctx.author) === normUserKey(ctx.giveawayData.host));
            const isSelfQuery = !ctx.args[0] || normUserKey(target) === normUserKey(ctx.author);

            const parts = [
                `Entered [color=#ffc00a]${fmtBON(enteredAll)}[/color]`,
                `Wins [color=#1DDC5D]${fmtBON(wins)}[/color]`,
                `Losses [color=#CE2E30]${fmtBON(losses)}[/color]`,
                `WR [color=#1DDC5D]${wr}%[/color]`
            ];

            if (rec.totalWon) parts.push(`Won [color=#ffc00a]${fmtBONCurrency(rec.totalWon)} BON[/color]`);
            if (rec.biggestWin) parts.push(`Best [color=#ffc00a]${fmtBONCurrency(rec.biggestWin)} BON[/color]`);
            if (rec.sponsoredTotal) parts.push(`Sponsored [color=#00abff]${fmtBONCurrency(rec.sponsoredTotal)} BON[/color]`);
            if (rec.hosted) parts.push(`Hosted ${fmtBON(rec.hosted)}`);

            if (isHostCaller && isSelfQuery) {
                parts.push(`Given [color=#ffc00a]${fmtBONCurrency(rec.hostedTotal || 0)} BON[/color]`);
                parts.push(`Sponsors received [color=#00abff]${fmtBONCurrency(rec.sponsorReceivedTotal || 0)} BON[/color]`);
                const thisSponsor = sumSponsorContribs(ctx.giveawayData?.sponsorContribs, ctx.giveawayData?.host);
                if (thisSponsor > 0) {
                    parts.push(`Current sponsors [color=#00abff]${fmtBONCurrency(thisSponsor)} BON[/color]`);
                }
            }

            reply(`[b]${bridgeMarker(BRIDGE_MARKERS.STATS, "📊")} Stats: [color=#d85e27]${safeNameForChat(rec.name || target)}[/color] - ${parts.join(" • ")}[/b]`);
        },

        // Leaderboards — table-driven to reduce repetition
        top:      makeLeaderboardCommand({
            emoji: "🏆", label: "Top winners", emptyMsg: "[b]No winner stats saved yet.[/b]",
            sort:   (a, b) => (b.wins - a.wins) || (b.totalWon - a.totalWon) || (b.entered - a.entered),
            filter: u => (u.wins || 0) > 0,
            format: (u, i) =>
                `${i + 1}) [color=#d85e27]${safeNameForChat(u.name)}[/color] - ` +
                `[color=#1DDC5D]${fmtBON(u.wins)}W[/color] • ` +
                `[color=#ffc00a]${fmtBONCurrency(u.totalWon)} BON[/color]`
        }),

        most:     makeLeaderboardCommand({
            emoji: "💰", label: "Most BON won", emptyMsg: "[b]No winner stats saved yet.[/b]",
            sort:   (a, b) => (b.totalWon - a.totalWon) || (b.wins - a.wins) || (b.entered - a.entered),
            filter: u => (u.totalWon || 0) > 0,
            format: (u, i) =>
                `${i + 1}) [color=#d85e27]${safeNameForChat(u.name)}[/color] - ` +
                `[color=#ffc00a]${fmtBONCurrency(u.totalWon)} BON[/color] • ` +
                `[color=#1DDC5D]${fmtBON(u.wins)}W[/color]`
        }),

        sponsors: makeLeaderboardCommand({
            emoji: "💸", label: "Top all-time sponsors", emptyMsg: "[b]No sponsor stats saved yet.[/b]",
            sort:   (a, b) => (b.sponsoredTotal - a.sponsoredTotal) || (b.sponsorCount - a.sponsorCount),
            filter: u => (u.sponsoredTotal || 0) > 0,
            format: (u, i) =>
                `${i + 1}) [color=#d85e27]${safeNameForChat(u.name)}[/color] - ` +
                `[color=#ffc00a]${fmtBONCurrency(u.sponsoredTotal)} BON[/color] • ` +
                `[color=#1DDC5D]${fmtBON(u.sponsorCount)}x[/color]`
        }),

        unlucky:  makeLeaderboardCommand({
            emoji: "😵", label: "Unlucky", emptyMsg: "[b]No unlucky stats saved yet.[/b]",
            sort:   (a, b) => (b.losses - a.losses) || (b.entered - a.entered) || (a.wins - b.wins),
            filter: u => (u.losses || 0) > 0,
            format: (u, i, ctx) => {
                const key = normUserKey(u.name);
                let entered = u.entered || 0;
                const wins = u.wins || 0;
                const losses = u.losses || 0;

                // Winrate should be based on completed giveaways only.
                if (ctx.giveawayData && key && liveEnteredThisGiveaway.has(key)) {
                    entered = Math.max(0, entered - 1);
                }

                const wr = entered ? ((wins / entered) * 100).toFixed(1) : "0.0";

                return `${i + 1}) [color=#d85e27]${safeNameForChat(u.name)}[/color] - ` +
                    `[color=#CE2E30]${fmtBON(losses)} L[/color] ` +
                    `/ [color=#ffc00a]${fmtBON(entered)} entered[/color] ` +
                    `• [color=#1DDC5D]WR ${wr}%[/color]`;
            }
        }),


        largest(ctx) {
            const { reply } = ctx;
            const n = Math.min(STATS_MAX_TOP_N, Math.max(1, parseInt(ctx.args[0] || STATS_DEFAULT_TOP_N, 10) || STATS_DEFAULT_TOP_N));
            const stats = getStatsForRead();
            const all = Array.isArray(stats.giveaways) ? stats.giveaways.slice() : [];

            if (!all.length) {
                reply("[b]No giveaway history saved yet.[/b]");
                return;
            }

            const getAmt = (g) => (typeof g === "number" ? g : (g && typeof g === "object" ? Number(g.amount) : 0)) || 0;
            const getEndedAt = (g) => (g && typeof g === "object" ? Number(g.endedAt) : 0) || 0;
            const getEndedDate = (g) => (g && typeof g === "object" && g.endedDate) ? String(g.endedDate) : "";
            const fmtEndedDate = (g) => {
                const d = getEndedDate(g);
                if (d) return d;
                const t = getEndedAt(g);
                if (t) {
                    try { return new Date(t).toLocaleDateString("en-CA"); } catch (e) { /* ignore */ }
                }
                return "unknown date";
            };


            const top = all
            .filter(g => getAmt(g) > 0)
            .sort((a, b) => (getAmt(b) - getAmt(a)) || (getEndedAt(b) - getEndedAt(a)))
            .slice(0, n);

            if (!top.length) {
                reply("[b]No giveaway history saved yet.[/b]");
                return;
            }

            const out = top.map((g, i) => {
                const amt = fmtBONCurrency(getAmt(g));
                const d = fmtEndedDate(g);
                return `${i + 1}) [color=#ffc00a]${amt} BON[/color] [color=#9aa0a6](${d})[/color]`;
            });

            reply(`[b]📈 Largest giveaways: ${out.join(" | ")}[/b]`);

        },

        gift({ giveawayData, reply }) {
            const giftHost = getGiftSyntaxHostName();
            reply(`${bridgeMarker(BRIDGE_MARKERS.GIFT, "✨")} To send a gift type: /gift ${giftHost} amount message`);
        },

        bon({ giveawayData , reply}) {
            const rigTag = rigNote("(pot size [b]carefully curated[/b] by our rigging department)");
            reply(
                `Giveaway Amount: [b][color=#FFB700]${fmtBONCurrency(giveawayData.amount)} BON[/color][/b]` +
                rigTag
            );
        },

        range({ giveawayData , reply}) {
            const rigTag = rigNote("(this range has been [b]pre-approved[/b] for maximum riggability)");
            reply(
                `Numbers between [color=#DC3D1D]${giveawayData.startNum} and ${giveawayData.endNum}[/color] inclusive are valid.` +
                rigTag
            );
        },

        lucky({ safeAuthor, giveawayData , reply}) {
            // Safety: no active giveaway
            if (!giveawayData) {
                reply("There is no active giveaway right now.");
                return;
            }

            if (GENERAL_SETTINGS.disable_lucky) {
                reply(
                    `🚫 Sorry [color=#d85e27]${safeAuthor}[/color], ` +
                    `[color=#999999]!lucky[/color] has been disabled for this giveaway.`
                );
                return;
            }

            const luckyNum = getLuckyNumber(giveawayData);
            if (luckyNum === null || luckyNum === undefined) {
                reply("All numbers are taken — no free numbers left!");
                return;
            }
            const rigHint = rigNote("(approved by the Official Rigging Committee™) ✅");

            reply(
                `The current giveaway lucky number is: ` +
                `[b][color=#1DDC5D]${luckyNum}[/color][/b].` +
                rigHint
            );
        },

        luckye(ctx) {
            const { author, safeAuthor, fancyName, giveawayData, reply } = ctx;

            // Safety: no active giveaway
            if (!giveawayData) {
                reply("There is no active giveaway right now.");
                return;
            }

            if (GENERAL_SETTINGS.disable_lucky) {
                reply(
                    `🚫 Sorry [color=#d85e27]${safeAuthor}[/color], ` +
                    `[color=#999999]!lucky[/color] has been disabled for this giveaway.`
                );
                return;
            }

            const userNumber = numberEntries.get(author);
            if (userNumber !== undefined) {
                reply(
                    `🚫 Sorry [color=#d85e27]${safeAuthor}[/color], but [color=#32cd53]you[/color] already entered with number ` +
                    `[color=#DC3D1D][b]${userNumber}[/b][/color]!`
                );
                return;
            }

            const luckyNum = getLuckyNumber(giveawayData);
            if (luckyNum === null || luckyNum === undefined) {
                reply("All numbers are taken — no free numbers left!");
                return;
            }

            addNewEntry(author, fancyName, luckyNum);

            const timeLeftStr = parseTime(giveawayData.timeLeft * 1000);
            const rigHint = rigNote("(approved by the Official Rigging Committee™) ✅");

            reply(
                `[color=#d85e27]${safeAuthor}[/color] used [color=#999999]!luckye[/color] and entered with ` +
                `lucky number [color=#1DDC5D][b]${luckyNum}[/b][/color]! ` +
                `Time remaining: [b][color=#1DDC5D]${timeLeftStr}[/color][/b].` +
                rigHint
            );
        },


        rig(ctx) {
            const { author, safeAuthor, fancyName, giveawayData: ctxGiveawayData, reply } = ctx;
            if (!ctxGiveawayData) return;
            if (!isHostOrAdmin(author, fancyName, ctxGiveawayData.host)) {
                maybeSendRigDeny(author, safeAuthor, "rig");
                return;
            }

            // Only treat as "active giveaway" if the real global giveawayData is set
            const hasActiveGiveaway = !!giveawayData;

            if (!riggedMode) {
                riggedMode = true;
                if (rigBadge) {
                    rigBadge.hidden = false;
                    rigBadge.classList.add('rigged-pulse');
                }
                if (bonanzaGiveawayFrame) {
                    bonanzaGiveawayFrame.classList.add('rigged');
                }

                updateRigToggleUI();

                // Only announce in chat if a giveaway is actually running
                if (hasActiveGiveaway) {
                    reply(
                        `${bridgeMarker(BRIDGE_MARKERS.RIGGED, "😈")} [color=#FF4F9A][b]RIGGED MODE ENGAGED![/b][/color] ` +
                        `[i][color=#FF9AE6]Visual flair only — the math is still fair... probably.[/color][/i]`
                    );
                }
            } else {
                if (hasActiveGiveaway) {
                    reply(
                        `[color=#FF4F9A][b]RIGGED MODE is already active![/b][/color]`
                    );
                }
            }
        },

        unrig(ctx) {
            const { author, safeAuthor, fancyName, giveawayData: ctxGiveawayData, reply } = ctx;
            if (!ctxGiveawayData) return;
            if (!isHostOrAdmin(author, fancyName, ctxGiveawayData.host)) {
                maybeSendRigDeny(author, safeAuthor, "unrig");
                return;
            }

            const hasActiveGiveaway = !!giveawayData;

            if (riggedMode) {
                riggedMode = false;
                if (rigBadge) {
                    rigBadge.hidden = true;
                    rigBadge.classList.remove('rigged-pulse');
                }
                if (bonanzaGiveawayFrame) {
                    bonanzaGiveawayFrame.classList.remove('rigged');
                }

                updateRigToggleUI();

                if (hasActiveGiveaway) {
                    reply(
                        `${bridgeMarker(BRIDGE_MARKERS.UNRIGGED, "😒")} [color=#32cd53][b]Rigged mode disabled.[/b][/color] ` +
                        `[i][color=#A0E7AF]Back to boring, fully transparent fairness.[/color][/i]`
                    );
                }
            } else {
                if (hasActiveGiveaway) {
                    reply(
                        `[color=#32cd53][b]Rigged mode isn&#39;t enabled.[/b][/color]`
                    );
                }
            }
        },

        random(ctx) {
            const { author, safeAuthor, fancyName, giveawayData, reply } = ctx;

            if (GENERAL_SETTINGS.disable_random) {
                reply(`🚫 Sorry [color=#d85e27]${safeAuthor}[/color], but [color=#999999]!random[/color] has been disabled for this giveaway.`);
                return;
            }
            const userNumber = numberEntries.get(author);
            if (userNumber !== undefined) {
                reply(`🚫 Sorry [color=#d85e27]${safeAuthor}[/color], but [color=#32cd53]you[/color] already entered with number [color=#DC3D1D][b]${userNumber}[/b][/color]!`);
                return;
            }

            const randomNum = pickRandomFreeNumber(giveawayData);
            if (randomNum === null) {
                reply("All numbers are taken — no free numbers left!");
                return;
            }

            addNewEntry(author, fancyName, randomNum);
            const timeLeftStr = parseTime(giveawayData.timeLeft * 1000);
            const rigHint = rigNote("(chosen by our [b]totally unbiased[/b] chaos engine)");
            reply(
                `[color=#d85e27]${safeAuthor}[/color] has entered with the number ` +
                `[color=#DC3D1D][b]${randomNum}[/b][/color]! Time remaining: ` +
                `[b][color=#1DDC5D]${timeLeftStr}[/color][/b].` +
                rigHint
            );
        },

        number({ author, safeAuthor , reply}) {
            const userNumber = numberEntries.get(author);
            if (userNumber !== undefined) {
                reply(`[color=#d85e27]${safeAuthor}[/color] your number is [color=#DC3D1D][b]${userNumber}[/b][/color]`);
            } else {
                reply(`[color=#d85e27]${safeAuthor}[/color] you are not currently in the giveaway.`);
            }
        },

        free({ safeAuthor, giveawayData , reply}) {
            if (GENERAL_SETTINGS.disable_free) {
                reply(`🚫 Sorry [color=#d85e27]${safeAuthor}[/color], !free disabled`);
                return;
            }

            const sample = getFreeNumberSample(giveawayData, 5);

            if (!sample.length) {
                reply("There are no free numbers left!");
                return;
            }

            const rigHint = rigNote("(these are some [b]suspiciously good[/b] numbers, trust me...) 😏");
            reply(`Free numbers: ${sample.join(", ")}.` + rigHint);
        },


        /* Host + Admin commands */
        addbon: hostAddBon,

        reminder(ctx) {
            if (normalizeUserKey(ctx.author) === normalizeUserKey(ctx.giveawayData.host)) {
                sendReminder();
            }
        },

        winners(ctx) {
            const { author, fancyName, args, giveawayData, reply } = ctx;
            if (!isHostOrAdmin(author, fancyName, giveawayData.host)) return;
            const newCount = parseInt(ctx.args[0], 10);
            if (isNaN(newCount) || newCount < 1 || newCount > MAX_WINNERS) {
                reply(`[color=red]Usage:[/color] !winners 1‑${MAX_WINNERS}`);
                return;
            }

            const minimumPot = minimumPotForWeightedWinners(newCount);
            if (Math.floor(Number(giveawayData.amount) || 0) < minimumPot) {
                reply(
                    `[color=red]Cannot set ${fmtBON(newCount)} winners with the current ${fmtBONCurrency(giveawayData.amount)} BON pot. ` +
                    `Weighted payouts require at least ${fmtBONCurrency(minimumPot)} BON.[/color]`
                );
                return;
            }

            // Snapshot previous effective so we can announce the change in chat
            // (host-driven adjustment, symmetric to the scaling-increase announcement).
            const prevEffective = Math.max(
                1,
                Math.floor(Number(giveawayData.effectiveWinnersNum || giveawayData.baseWinnersAtStart || giveawayData.winnersNum) || 1)
            );

            giveawayData.winnersNum = newCount;
            giveawayData.baseWinnersAtStart = newCount;
            giveawayData.effectiveWinnersNum = newCount;
            winnersInput.value = newCount;

            // Host's explicit !winners overrides scaling: drop the cap to N as well,
            // so effective resets to exactly N. Scaling can resume from this new base
            // if more sponsor BON arrives, up to N until the host raises the cap via !maxwinners.
            let capWasReset = false;
            if (giveawayData.scaleWinnersWithSponsors) {
                const prevCap = Math.floor(Number(giveawayData.hostMaxScaledWinners) || newCount);
                giveawayData.hostMaxScaledWinners = newCount;
                capWasReset = prevCap !== newCount;
                if (maxScaledWinnersInput) {
                    maxScaledWinnersInput.min = String(newCount);
                    maxScaledWinnersInput.value = String(newCount);
                }
                // Recompute is a no-op for effective (base === cap === N) but keeps
                // derived state consistent (e.g. syncs the winners display).
                recomputeEffectiveWinners(giveawayData);
            }

            // Update the announcement baseline so future scaling-increase messages
            // count from N, not from the pre-override effective value.
            giveawayData.lastAnnouncedWinners = newCount;
            initializeScaledWinnersAnnouncementState(giveawayData);

            // Public chat announcement when the effective winner count actually changed.
            // Symmetric to the "Winners increased" message scaling sends on its own.
            if (newCount !== prevEffective) {
                const direction = newCount > prevEffective ? "increased" : "decreased";
                const delta = Math.abs(newCount - prevEffective);
                const sign = newCount > prevEffective ? "+" : "−";
                const announcement =
                    `[b][color=${SCALING_ACCENT_COLOR}]Host adjustment:[/color][/b] ` +
                    `[b]Winners ${direction}[/b]: [b][color=#5DE2E7]${prevEffective} → ${newCount} (${sign}${delta})[/color][/b].`;
                sendMessage(announcement);
                flashWinnersUI();
                logEvent("Host adjusted winners", `${prevEffective} -> ${newCount} (${sign}${delta})`);
            }

            const capNote = capWasReset
                ? ` [i][color=#9aa0a6]Scaling cap also reset to ${newCount} — use !maxwinners to raise.[/color][/i]`
                : "";
            reply(`Number of winners set to [color=#1DDC5D][b]${newCount}[/b][/color].${capNote}`);
            snapshotGiveaway();
        },

        maxwinners(ctx) {
            const { author, fancyName, args, giveawayData, reply } = ctx;
            if (!isHostOrAdmin(author, fancyName, giveawayData.host)) return;
            if (!giveawayData.scaleWinnersWithSponsors) {
                reply(`[color=red]Scaling is not enabled for this giveaway.[/color]`);
                return;
            }
            const newMax = parseInt(args[0], 10);
            const baseWinners = Math.max(1, Math.floor(Number(giveawayData.baseWinnersAtStart || giveawayData.winnersNum) || 1));
            if (isNaN(newMax) || newMax < baseWinners || newMax > MAX_WINNERS) {
                reply(`[color=red]Usage:[/color] !maxwinners ${baseWinners}‑${MAX_WINNERS}`);
                return;
            }
            giveawayData.hostMaxScaledWinners = newMax;
            if (maxScaledWinnersInput) maxScaledWinnersInput.value = String(newMax);
            const effective = recomputeEffectiveWinners(giveawayData);
            initializeScaledWinnersAnnouncementState(giveawayData);
            reply(
                `Max scaled winners set to [color=#1DDC5D][b]${newMax}[/b][/color]. ` +
                `Current effective winners: [b][color=#5DE2E7]${effective}[/color][/b].`
            );
            snapshotGiveaway();
        },

        scale(ctx) {
            const { giveawayData, reply } = ctx;
            if (!giveawayData) {
                reply("There is no active giveaway right now.");
                return;
            }
            if (!giveawayData.scaleWinnersWithSponsors) {
                reply("Winner scaling is not enabled for this giveaway.");
                return;
            }

            const baseWinners = Math.max(1, Math.floor(Number(giveawayData.baseWinnersAtStart || giveawayData.winnersNum) || 1));
            const effective = Math.max(1, Math.floor(Number(giveawayData.effectiveWinnersNum) || baseWinners));
            const cap = Math.max(baseWinners, Math.min(Math.floor(Number(giveawayData.hostMaxScaledWinners) || baseWinners), MAX_WINNERS));
            const threshold = getScalingBonPerWinner(giveawayData);
            const totalContrib = Math.max(0, Math.floor(getTotalContribForScaling(giveawayData)));
            const progress = totalContrib % threshold;
            const remaining = progress === 0 ? threshold : threshold - progress;
            const extraWinners = effective - baseWinners;
            const isCustomThreshold = !!(giveawayData.scaleBonPerWinner && giveawayData.scaleBonPerWinner > 0);

            let msg = `[b][color=${SCALING_ACCENT_COLOR}]Scaling Status:[/color][/b] ` +
                `Winners: [b][color=#5DE2E7]${effective}[/color][/b] (base ${baseWinners}` +
                (extraWinners > 0 ? ` + ${extraWinners} from sponsorships` : ``) + `). ` +
                `Threshold: [b]${fmtBONCurrency(threshold)} BON[/b]/winner` +
                (isCustomThreshold ? ` (custom)` : ``) + `. ` +
                `Total contributions: [b][color=#ffc00a]${fmtBONCurrency(totalContrib)} BON[/color][/b]. `;

            if (effective >= cap) {
                msg += `[b]Max winners reached[/b] (${cap}).`;
            } else {
                msg += `[b]${fmtBONCurrency(remaining)} BON[/b] needed for next winner (${fmtBONCurrency(progress)}/${fmtBONCurrency(threshold)}). Max: [b]${cap}[/b].`;
            }

            reply(msg);
        },

        addtime: hostAdjustTime(+1),
        removetime: hostAdjustTime(-1),

        naughty(ctx) {
            const { author, fancyName, args, giveawayData, reply } = ctx;
            if (!isHostOrAdmin(author, fancyName, giveawayData.host)) return;

            const sub = (args.shift() || "").toLowerCase();
            const target = (args.shift() || "");

            const key = normalizeUserKey(target); // canonical key we store/match on

            switch (sub) {
                case "add": {
                    if (!key) { reply("[color=red]Usage:[/color] !naughty add username"); return; }

                    if (key === normalizeUserKey(giveawayData.host)) {
                        reply(
                            `[color=red][b]The host can't be added to the naughty list![/b][/color]`
                        );
                        return;
                    }
                    naughtySet.add(key); // save in LS
                    saveNaughty();

                    // remove any existing entry (try exact, then case-insensitive fallback)
                    let removed = false;
                    let removedUser = null;

                    // exact-case fast path (if the host typed the exact casing)
                    if (target && numberEntries.has(target)) {
                        removedUser = target;
                    } else {
                        for (const user of numberEntries.keys()) {
                            if (normalizeUserKey(user) === key) {
                                removedUser = user;
                                break;
                            }
                        }
                    }

                    if (removedUser) {
                        const prevNum = numberEntries.get(removedUser);
                        numberEntries.delete(removedUser);
                        fancyNames.delete(removedUser);
                        if (prevNum !== undefined) numberTakenBy.delete(prevNum);
                        removed = true;
                    }

                    if (removed) { updateEntries(); snapshotGiveaway(); }

                    reply(`${bridgeMarker(BRIDGE_MARKERS.NAUGHTY, "👮")} [color=#FFDE59]${fmtUserList([target])} added to the naughty list and removed from the giveaway.[/color]`);
                    break;
                }


                case "remove":
                    if (!key) { reply("[color=red]Usage:[/color] !naughty remove username"); return; }
                    naughtySet.delete(key); saveNaughty();
                    reply(`🥳 [color=#7DDA58]${fmtUserList([target])} removed from the naughty list![/color]`);
                    break;

                case "list":
                    reply(naughtySet.size
                          ? `[color=#FFDE59]Naughty list: [b]${fmtUserList([...naughtySet])}[/b][/color]`
                          : "Naughty list is empty.");
                    break;

                default:
                    reply("[color=red]Usage:[/color] !naughty (add|remove|list) username");
            }
        },


        end(ctx) {
            const { author, fancyName, args, giveawayData, reply } = ctx;
            // If host, always allow
            if (normalizeUserKey(author) === normalizeUserKey(giveawayData.host)) {
                logEvent("Giveaway stop requested", `Requested by host ${sanitizeNick(author)} via !end.`);
                endGiveaway();
                return;
            }
            // If admin (not host), must specify whose to end
            if (isAdmin(fancyName)) {
                if (!args.length || normalizeUserKey(args[0]) !== normalizeUserKey(giveawayData.host)) {
                    reply(`[color=red]Admins must specify whose giveaway to end. Example: !end ${sanitizeNick(giveawayData.host)}[/color]`);
                    return;
                }
                logEvent("Giveaway stop requested", `Requested by admin ${sanitizeNick(author)} via !end ${sanitizeNick(giveawayData.host)}.`);
                endGiveaway();
            }
        }
    });

    function isHostOrAdmin(author, fancyName, host) {
        return normalizeUserKey(author) === normalizeUserKey(host) || isAdmin(fancyName);
    }

    function showHelp(ctx) {
        const reply = (ctx && typeof ctx.reply === "function") ? ctx.reply : sendMessage;

        const COMMANDS = [
            // Toggleable commands (reflect Settings toggles)
            { name: "random", setting: "disable_random" },
            { name: "lucky", setting: "disable_lucky" },
            { name: "luckye", setting: "disable_lucky" },
            { name: "free", setting: "disable_free" },

            // Always-available commands
            { name: "time", setting: null },
            { name: "entries", setting: null },
            { name: "number", setting: null },
            { name: "bon", setting: null },
            { name: "range", setting: null },
            { name: "scale", setting: null },
            { name: "stats", setting: null },
            { name: "top", setting: null },
            { name: "most", setting: null },
            { name: "sponsors", setting: null },
            { name: "unlucky", setting: null },
            { name: "largest", setting: null },
            { name: "help", setting: null },
            { name: "commands", setting: null },
        ];

        function fmt(cmd, isDisabled) {
            if (isDisabled) {
                // Use strikethrough and gray
                return `![color=#888888][s][b]${cmd}[/b][/s][/color]`;
            }
            // Enabled formatting
            return `![color=#E50E68][b]${cmd}[/b][/color]`;
        }

        const helpText = "Commands are " + COMMANDS.map(({ name, setting }) =>
                                                        fmt(name, setting && GENERAL_SETTINGS[setting])
                                                       ).join(" - ") + ".";
        reply(helpText);
    }


    async function hostAddBon(ctx) {
        const { author, args, giveawayData, reply } = ctx;
        if (normalizeUserKey(author) !== normalizeUserKey(giveawayData.host)) return;

        if (hostAddBonInFlight) {
            reply("[b][color=#FFDE59]A host BON top-up is already being verified. Please wait a moment.[/color][/b]");
            return;
        }

        const raw = args[0];
        const clean = String(raw ?? "").replace(/[^0-9]/g, "");
        const amount = parseInt(clean, 10);

        if (!Number.isFinite(amount) || amount <= 0) {
            reply("[b][color=red]Invalid usage.[/color] Example: !addbon 100[/b]");
            return;
        }

        // Serialize the balance check and mutation as one host transaction.
        hostAddBonInFlight = true;
        try {
            const currentBon = await getVerifiedHostBalance({ requireServer: true, maxAgeMs: 0 });
            const currentPot = Math.max(0, Math.floor(Number(giveawayData.amount) || 0));
            const newTotal = currentPot + amount;
    
            if (!Number.isFinite(currentBon) || currentBon == null || currentBon < 0) {
                reply(
                    `[b][color=red]Unable to verify your current BON balance right now. ` +
                    `Please try !addbon again shortly.[/color][/b]`
                );
                return;
            }
    
            if (currentBon < newTotal) {
                reply(
                    `[b][color=red]You only have ${fmtBONCurrency(currentBon)} BON right now, so you can't increase the pot to ${fmtBONCurrency(newTotal)} BON. ` +
                    `Wait for more BON (or sponsor gifts) and try again.[/color][/b]`
                );
                return;
            }
    
            const prevEffectiveWinners = Math.max(
                1,
                Math.floor(Number(giveawayData.effectiveWinnersNum || giveawayData.baseWinnersAtStart || giveawayData.winnersNum) || 1)
            );

            giveawayData.amount = newTotal;

            // ✅ host-only tracking (excludes sponsors)
            giveawayData.hostAdded = (giveawayData.hostAdded || 0) + amount;
    
            const newEffectiveWinners = recomputeEffectiveWinners(giveawayData);
            const winnersDelta = Math.max(0, newEffectiveWinners - prevEffectiveWinners);
            if (winnersDelta > 0) {
                giveawayData.lastAnnouncedWinners = Math.max(
                    newEffectiveWinners,
                    Math.floor(Number(giveawayData.lastAnnouncedWinners || giveawayData.baseWinnersAtStart || 1) || 1)
                );
                flashWinnersUI();
            }
    
            const addedPart = `Host added [color=#DC3D1D][b]${fmtBONCurrency(amount)} BON[/b][/color].`;
            const totalPart = `Total pot: [b][color=#ffc00a]${fmtBONCurrency(Number(cleanPotString(giveawayData.amount)))} BON[/color][/b].`;
    
            let scalingPart = "";
            if (giveawayData.scaleWinnersWithSponsors) {
                if (winnersDelta > 0) {
                    scalingPart = `[b][color=${SCALING_ACCENT_COLOR}]Scaling:[/color][/b] [b]Winners increased[/b]: [b][color=#5DE2E7]${prevEffectiveWinners} → ${newEffectiveWinners} (+${winnersDelta})[/color][/b].`;
                } else {
                    scalingPart = getSponsorshipNextWinnerLine(giveawayData, { plain: true });
                }
            }
    
            await sendMessage(
                `${bridgeMarker(BRIDGE_MARKERS.POT, "💰")} ` +
                [addedPart, totalPart, scalingPart].filter(Boolean).join(" ")
            );
            snapshotGiveaway();
        } finally {
            hostAddBonInFlight = false;
        }
    }

    function rebuildSchedule() {
        const totalMin = (giveawayData.endTs - Date.now()) / 60000;
        // Use the UI value for number of reminders (clamp if needed)
        let reminderNum = Math.min(Number(remNumInput.value), getReminderLimits(totalMin)[0]);
        if (isNaN(reminderNum) || reminderNum < 0) reminderNum = 0;
        giveawayData.reminderSchedule = getReminderSchedule(totalMin, reminderNum);
        giveawayData.reminderNum = reminderNum;
        // Frequency fields (legacy helpers)
        giveawayData.reminderFreqSec = (reminderNum > 0) ? totalMin * 60 / (reminderNum + 1) : 0;
        giveawayData.nextReminderSec = giveawayData.reminderFreqSec;
        remNumInput.value = reminderNum;
    }

    function hostAdjustTime(sign) {
        // sign = +1 for !addtime / !time add, -1 for !removetime / !time remove
        return ({ author, fancyName, args, giveawayData, reply }) => {
            if (!isHostOrAdmin(author, fancyName, giveawayData.host)) return;

            const mins = parseFloat(args[0]);
            if (isNaN(mins) || mins <= 0) {
                reply(
                    "[color=red]Usage:[/color] !time add|remove <minutes> or !addtime|!removetime <minutes>"
                );
                return;
            }

            const deltaMs = sign * mins * 60_000;
            giveawayData.endTs += deltaMs; // move the deadline

            rebuildSchedule(); // rebuild reminder schedule

            giveawayData.timeLeft = Math.max(
                Math.ceil((giveawayData.endTs - Date.now()) / 1000),
                0
            );
            countdownHeader.textContent = parseTime(giveawayData.endTs - Date.now());

            const verb = sign > 0 ? "Added" : "Removed";
            const prep = sign > 0 ? "to" : "from";

            reply(
                `${verb} [color=#DC3D1D][b]${mins}[/b][/color] minute${mins === 1 ? "" : "s"} ${prep} the giveaway. ` +
                `New time left: [b][color=#1DDC5D]${parseTime(
                    giveawayData.endTs - Date.now()
                )}[/color][/b].`
            );
            snapshotGiveaway();
        };
    }

    // ───────────────────────────────────────────────────────────
    // SECTION 11: Winner Selection and Payouts
    // ───────────────────────────────────────────────────────────
    async function endGiveaway() {
        // ---- re-entry guard (prevents double gifting) ----
        if (!giveawayData) return;
        if (giveawayData.__ending) return;
        giveawayData.__ending = true;
        const nowAtSettlement = Date.now();
        const scheduledEndTs = Number(giveawayData.endTs);
        const committedCutoffTs = Number(giveawayData?.settlement?.cutoffTs);
        const settlementCutoffTs = Number.isFinite(committedCutoffTs)
            ? committedCutoffTs
            : (Number.isFinite(scheduledEndTs)
                ? Math.min(nowAtSettlement, scheduledEndTs)
                : nowAtSettlement);

        // ---- cross-tab guard ----
        // If another tab currently owns the giveaway (fresh heartbeat in the last
        // TAB_LOCK_STALE_MS), do NOT proceed with payout. Without this, a tab that
        // restored from snapshot while the original tab was alive could end up
        // paying every winner twice.
        if (!ownsTabLock()) {
            logEvent(
                "End aborted (this tab does not own the giveaway)",
                "Refusing to send gifts because this tab cannot prove exclusive ownership. Reload the owning tab to resume safely."
            );
            // Don't tear down state here — the verified owning tab is the source of truth.
            // Just back off and let it run.
            giveawayData.__ending = false;
            return;
        }

        // Stop additional triggers ASAP (but don't clear entries/state yet)
        try {
            startButton.disabled = true;
            startButton.onclick = null; // prevent double-click / queued clicks from re-ending
        } catch {}

        if (giveawayData.countdownTimerID) {
            clearInterval(giveawayData.countdownTimerID);
            giveawayData.countdownTimerID = null;
        }
        if (giveawayData.potUpdater) {
            clearInterval(giveawayData.potUpdater);
            giveawayData.potUpdater = null;
        }
        if (sponsorsInterval) {
            clearInterval(sponsorsInterval);
            sponsorsInterval = null;
        }

        // Freeze participant input before any payout computation. A queued/late
        // entry must never alter stats or UI after the winner set is committed.
        if (observer) {
            observer.disconnect();
            observer = null;
        }

        // Close the sponsor accounting window with one final synchronous API poll.
        // The regular tracker runs every 10s, so without this a gift in the final
        // seconds could be omitted from the pot. snapshotGiveaway() is suppressed
        // while __ending is true, so this cannot resurrect the active snapshot.
        if (window.__activeTracker && typeof window.__activeTracker.poll === "function") {
            let finalSponsorSyncOk = false;
            for (let attempt = 1; attempt <= 3 && !finalSponsorSyncOk; attempt++) {
                try {
                    finalSponsorSyncOk = (await window.__activeTracker.poll({
                        maxCreatedAtTs: settlementCutoffTs,
                        announce: false
                    })) === true;
                } catch (e) {
                    finalSponsorSyncOk = false;
                    logEvent("Final sponsor sync retry", `Attempt ${attempt}/3: ${String(e?.message || e)}`);
                }
                if (!finalSponsorSyncOk && attempt < 3) {
                    await new Promise(resolve => setTimeout(resolve, 1200));
                }
            }
            if (!finalSponsorSyncOk) {
                logEvent(
                    "Final sponsor sync warning",
                    "Could not refresh the chat API after 3 attempts; settling with the last confirmed sponsor state."
                );
                try {
                    window.alert(
                        "Giveaway warning: final sponsor sync failed after 3 attempts. " +
                        "Settlement will use the last confirmed sponsor total; verify any very recent gifts manually."
                    );
                } catch {}
            }
        }

        // Sponsor accounting is frozen. Commit and persist the outcome BEFORE
        // any closing output or transfer. The active snapshot remains until the
        // settlement reaches a terminal state; gift/pool ledgers retain the
        // per-transfer attempt state, so a crash can resume without double-paying.
        if (!giveawayData.settlement || giveawayData.settlement.committed !== true) {
            const committedWinningNumber = numberEntries.size > 0
                ? getRandomInt(giveawayData.startNum, giveawayData.endNum)
                : null;
            giveawayData.winningNumber = committedWinningNumber;
            giveawayData.settlement = {
                committed: true,
                phase: "settling",
                cutoffTs: settlementCutoffTs,
                winningNumber: committedWinningNumber,
                committedAt: Date.now(),
                giveawayId: getActiveGiveawayId()
            };
            logEvent(
                "Settlement committed",
                numberEntries.size > 0
                    ? `Cutoff=${new Date(settlementCutoffTs).toISOString()} | Winning number=${committedWinningNumber}`
                    : `Cutoff=${new Date(settlementCutoffTs).toISOString()} | No entrants`
            );
        } else {
            giveawayData.winningNumber = Number.isFinite(Number(giveawayData.settlement.winningNumber))
                ? Number(giveawayData.settlement.winningNumber)
                : null;
            giveawayData.settlement.phase = "settling";
        }
        snapshotGiveaway({ force: true });

        // Sponsor acknowledgement is independent of whether anyone entered. Gifts
        // were already received and the final sync above has frozen the authoritative
        // sponsor state, so thank sponsors (and preserve their notes) in either path.
        const finalSponsoredTotal = Math.max(
            0,
            Math.floor(sumSponsorContribs(giveawayData.sponsorContribs, giveawayData.host) || 0)
        );
        if (finalSponsoredTotal > 0) {
            const sponsorsMessage = buildSponsorsSummaryMessage(giveawayData);
            if (sponsorsMessage) await sendMessage(sponsorsMessage);

            // Gift History is already the canonical sponsor-note source and the
            // final sponsor sync above has just refreshed it. Reuse the persisted
            // matched notes here instead of performing a second network scrape.
            const sponsorMessageRecap = buildFinalSponsorMessageRecap(giveawayData);
            for (const sponsorNoteMessage of sponsorMessageRecap) {
                await sendMessage(sponsorNoteMessage);
            }
        }

        // No entries → no winners. Settlement follows the selected BON Pool mode:
        //   - Pool > 0: 100% of the final pot goes to BON Pool.
        //   - Pool = 0: host funding stays with the host and sponsors are refunded in full.
        if (numberEntries.size === 0) {
            const noEntryTotal = Math.max(0, Math.floor(Number(giveawayData.amount) || 0));
            const noEntryHostFunded = Math.max(0, noEntryTotal - finalSponsoredTotal);
            const noEntryPoolPct = normalizeDonationPercent(giveawayData.donationPercent);

            if (noEntryPoolPct > 0) {
                await sendMessage(
                    `Unfortunately, no one has entered the giveaway, so there are no winners.\n` +
                    `💙 The full pot of [b][color=${BONANZA.GIVEAWAY_COLOR}]${fmtBONCurrency(noEntryTotal)} BON[/color][/b] will be contributed directly to the [b]${BONANZA.FUND_NAME}[/b].`
                );

                let noEntryPoolResult = { attempted: false, confirmed: noEntryTotal <= 0, reason: noEntryTotal <= 0 ? "empty-pot" : "not-attempted" };
                if (noEntryTotal > 0) {
                    noEntryPoolResult = await contributeBonPool(noEntryTotal);

                    if (noEntryPoolResult.confirmed) {
                        await sendMessage(
                            `${bridgeMarker(BRIDGE_MARKERS.POOL_PAID, "💙", "pool")} ` +
                            `[b][color=${BONANZA.GIVEAWAY_COLOR}]${BONANZA.FUND_NAME} contribution confirmed:[/color][/b] ` +
                            `[b][color=${BONANZA.GIVEAWAY_COLOR}]${fmtBONCurrency(noEntryTotal)} BON[/color][/b] paid directly into the pool.\n` +
                            `No entrants — 100% of the pot was contributed. ✨`
                        );
                    } else {
                        logEvent(
                            "BON Pool verification warning",
                            `Zero-entry full-pot contribution of ${fmtBONCurrency(noEntryTotal)} BON could not be confirmed. No automatic retry was attempted.`
                        );
                        try {
                            window.alert(
                                `BON Pool warning: the zero-entry full-pot contribution of ${fmtBONCurrency(noEntryTotal)} BON could not be confirmed. ` +
                                `Check /bon-pool manually before retrying anything.`
                            );
                        } catch {}
                    }
                }

                logEvent(
                    "Giveaway ended",
                    `Entrants=0 | Winners=0 | Host-funded=${fmtBONCurrency(noEntryHostFunded)} BON | Sponsored=${fmtBONCurrency(finalSponsoredTotal)} BON | Total=${fmtBONCurrency(noEntryTotal)} BON | BON Pool=${fmtBONCurrency(noEntryTotal)} BON (100%, ${noEntryPoolResult.confirmed ? "confirmed" : "NOT CONFIRMED"})`
                );

                const noEntryDonationInfo = {
                    total: noEntryTotal,
                    percent: noEntryTotal > 0 ? 100 : 0,
                    confirmed: !!noEntryPoolResult.confirmed
                };
                try {
                    if (!giveawayData.settlement?.statsRecorded) {
                        recordGiveawayStats(giveawayData, [], [], numberEntries, noEntryDonationInfo);
                        giveawayData.settlement.statsRecorded = true;
                        snapshotGiveaway({ force: true });
                    }
                } catch (e) { /* ignore stats errors */ }

                try {
                    const noEntrySplit = {
                        percent: noEntryDonationInfo.percent,
                        net: [],
                        donations: [],
                        total: noEntryTotal
                    };
                    currentStatement = createStatementRecord({
                        winners: [],
                        gross: [],
                        net: [],
                        donations: [],
                        split: noEntrySplit,
                        poolStatus: noEntryPoolResult.confirmed
                            ? "confirmed directly in BON Pool (zero entrants, 100% of pot)"
                            : "NOT CONFIRMED, zero-entry full pot requires manual /bon-pool check",
                        entrants: 0,
                        refunds: []
                    });
                    if (currentStatement) {
                        currentStatement.verification = noEntryPoolResult.confirmed
                            ? "nothing to verify"
                            : "BON Pool contribution requires manual verification";
                        persistCurrentStatement();
                    }
                } catch (e) { /* statements are best-effort */ }
            } else {
                const sponsorRefunds = getNonHostSponsorContributions(giveawayData);
                const refundTotal = sponsorRefunds.reduce((sum, item) => sum + item.amount, 0);
                const refundList = sponsorRefunds
                    .map(item =>
                        `[color=#1DDC5D][b]${sanitizeNick(item.name)}[/b][/color] ([color=#ffc00a][b]${fmtBONCurrency(item.amount)} BON[/b][/color])`
                    )
                    .join(" · ");

                await sendMessage(
                    `Unfortunately, no one has entered the giveaway, so there are no winners.\n` +
                    `${bridgeMarker(BRIDGE_MARKERS.SPONSORS, "↩️")} BON Pool is [b]0%[/b]: ` +
                    `the host-funded [b][color=#ffc00a]${fmtBONCurrency(noEntryHostFunded)} BON[/color][/b] remains with the host.` +
                    (refundList
                        ? ` Sponsor contributions will be returned in full: ${refundList}.`
                        : ` There are no sponsor contributions to return.`)
                );

                const refundExpectedGifts = [];
                const refundRecords = sponsorRefunds.map(item => ({
                    user: item.name,
                    amount: item.amount,
                    status: "pending"
                }));
                let refundGiftHistoryBaseline = null;
                try {
                    refundGiftHistoryBaseline = sponsorRefunds.length && window.__activeTracker && typeof window.__activeTracker.fetchRecentGiftHistory === "function"
                        ? await window.__activeTracker.fetchRecentGiftHistory()
                        : [];
                } catch (e) {
                    refundGiftHistoryBaseline = null;
                    logEvent("Sponsor refund Gift History preflight", String(e?.message || e));
                }

                // Chat cursor/timestamp are only needed if Gift History is unavailable.
                const refundNotBeforeTs = Date.now();
                const refundAfterMessageId = refundGiftHistoryBaseline === null && sponsorRefunds.length
                    ? await getLatestChatMessageId()
                    : null;

                for (const refund of sponsorRefunds) {
                    const result = await giftBon(
                        refund.name,
                        refund.amount,
                        SPONSOR_REFUND_NOTE,
                        GIFT_PURPOSE.SPONSOR_REFUND
                    );

                    const record = refundRecords.find(item =>
                        normalizeUserKey(item.user) === normalizeUserKey(refund.name)
                    );
                    if (record) {
                        record.status = result?.attempted
                            ? "sent, awaiting confirmation"
                            : (result?.reason === "duplicate"
                                ? "already attempted, check verification"
                                : `NOT SENT (${result?.reason || "unknown error"})`);
                    }

                    if (result?.attempted || result?.reason === "duplicate") {
                        refundExpectedGifts.push({
                            recipient: refund.name,
                            amount: refund.amount,
                            purpose: GIFT_PURPOSE.SPONSOR_REFUND
                        });
                    }

                    if (PAYOUT_GIFT_GAP_MS > 0) {
                        await new Promise(resolve => setTimeout(resolve, PAYOUT_GIFT_GAP_MS));
                    }
                }

                logEvent(
                    "Giveaway ended",
                    `Entrants=0 | Winners=0 | Pool=0% | Host retained=${fmtBONCurrency(noEntryHostFunded)} BON | Sponsor refunds=${fmtBONCurrency(refundTotal)} BON | Total=${fmtBONCurrency(noEntryTotal)} BON`
                );

                try {
                    if (!giveawayData.settlement?.statsRecorded) {
                        recordGiveawayStats(
                            giveawayData,
                            [],
                            [],
                            numberEntries,
                            null,
                            { sponsorRefundedTotal: refundTotal }
                        );
                        giveawayData.settlement.statsRecorded = true;
                        snapshotGiveaway({ force: true });
                    }
                } catch (e) { /* ignore stats errors */ }

                try {
                    currentStatement = createStatementRecord({
                        winners: [],
                        gross: [],
                        net: [],
                        donations: [],
                        split: null,
                        poolStatus: "none (0% BON Pool; sponsor contributions returned)",
                        entrants: 0,
                        refunds: refundRecords
                    });
                    if (currentStatement) {
                        currentStatement.verification = refundExpectedGifts.length
                            ? "sponsor refunds awaiting verification"
                            : (refundRecords.length ? "refund attempts require manual verification" : "nothing to verify");
                        persistCurrentStatement();
                    }
                } catch (e) { /* statements are best-effort */ }

                if (refundExpectedGifts.length) {
                    await verifySponsorRefundGifts(
                        refundExpectedGifts,
                        giveawayData.host,
                        refundGiftHistoryBaseline,
                        {
                            afterId: refundAfterMessageId,
                            notBeforeTs: refundNotBeforeTs,
                            statementId: currentStatement?.id ?? null
                        }
                    );
                }
            }
        } else {
            // The draw was committed before any settlement side effect. A resumed
            // settlement must reuse this exact number.
            if (!Number.isFinite(Number(giveawayData.winningNumber))) {
                throw new Error("Committed settlement is missing its winning number.");
            }
            logEvent("Winning number committed", `Winning number=${giveawayData.winningNumber}`);

            // 1) build and sort entries by closeness to winningNumber
            const entries = Array.from(numberEntries.entries())
            .map(([author, guess], idx) => ({
                author,
                guess,
                gap:   Math.abs(guess - giveawayData.winningNumber),
                order: idx
            }))
            .sort((a, b) => a.gap - b.gap || a.order - b.order);

            // Detect and announce ties
            const ties = entries.filter(e => e.gap === entries[0].gap);
            if (ties.length > 1) {
                const tieMessage = ties.map(e => `[b][color=#DC3D1D]${e.author}[/color][/b]`).join(", ");
                await sendMessage(`${bridgeMarker(BRIDGE_MARKERS.TIE, "⚠️")} We have a tie between ${tieMessage}! [b][color=#DC3D1D]${entries[0].author}[/color][/b] wins the tie-breaker as their entry was submitted first!`);
            }

            // 3) pick top N winners
            const effectiveWinners = recomputeEffectiveWinners(giveawayData);
            const N = Math.min(effectiveWinners, entries.length);
            const winners = entries.slice(0, N);

            // 4) compute weight-based payouts
            //    weight for rank i (0-based) is (N - i)
            const weights = winners.map((_, i) => N - i);
            const totalWeight = weights.reduce((sum, w) => sum + w, 0);

            // raw amounts, floored to integers
            let allocated = winners.map((_, i) =>
                                        Math.floor(giveawayData.amount * weights[i] / totalWeight)
                                       );
            // fix any rounding‐leftover by giving it to 1st place
            const sumAllocated = allocated.reduce((s, x) => s + x, 0);
            const leftover = giveawayData.amount - sumAllocated;
            if (leftover > 0) {
                allocated[0] += leftover;
            }

            // 4b) BON Pool split. `allocated` keeps the gross prize per winner;
            //     `net` is what each winner is actually gifted; the floored remainder
            //     is pooled into one donation. Host outlay never changes.
            const split = computeDonationSplit(allocated, giveawayData.donationPercent);
            const net = split.net;
            const donationActive = split.total > 0;
            const donationInfo = donationActive
                ? { total: split.total, percent: split.percent, confirmed: false }
                : null;

            // Initialize winners / payout status UI so we can tick boxes as gifts are confirmed
            initWinnersStatusUI(winners, net, giveawayData.host, donationInfo);

            // 5) announce winners summary
            const winNum = giveawayData.winningNumber;
            const potTotal = Math.max(0, Math.floor(Number(giveawayData.amount) || 0));
            const sponsoredTotal = Math.max(0, Math.floor(sumSponsorContribs(giveawayData.sponsorContribs, giveawayData.host) || 0));
            const hostFundedTotal = Math.max(0, potTotal - sponsoredTotal);
            const entrantsTotal = numberEntries.size;
            const scaleIncrease = Math.max(0, N - Math.max(1, Math.floor(Number(giveawayData.baseWinnersAtStart || giveawayData.winnersNum) || 1)));

            //hard-coded emoji “podium”
            const podium = ["🥇", "🥈", "🥉", "🏅", "🎖️"];

            //build the tail: 6th, 7th, … up to the larger of N or MAX_WINNERS
            const need = Math.max(N, MAX_WINNERS) - podium.length;
            const tail = Array.from({ length: need }, (_, i) => {
                const n = i + podium.length + 1;
                const s = (n % 10 === 1 && n % 100 !== 11) ? "st" :
                (n % 10 === 2 && n % 100 !== 12) ? "nd" :
                (n % 10 === 3 && n % 100 !== 13) ? "rd" : "th";
                return `${n}${s}`; // "6th" … "15th"
            });

            //final list
            const medals = podium.concat(tail);

            // Rig note (rigNote() already checks riggedMode)
            const rigTag = rigNote(" (Rigged mode was active, but winners were still chosen [b]fairly[/b]… allegedly.) 👀");

            const summaryLine =
                  `🏆 ${bridgeMarker(BRIDGE_MARKERS.RESULT, "🎯")} Winning number: [b][color=#1DDC5D]${fmtBON(winNum)}[/color][/b]. ` +
                  `Winners drawn: [b][color=#5DE2E7]${fmtBON(N)}[/color][/b]. ` +
                  `Total entrants: [b][color=#5DE2E7]${fmtBON(entrantsTotal)}[/color][/b].`;
            const fundingLine =
                  `Funding - Host-funded: [b][color=#ffc00a]${fmtBONCurrency(hostFundedTotal)} BON[/color][/b] | ` +
                  `Sponsored: [b][color=#00abff]${fmtBONCurrency(sponsoredTotal)} BON[/color][/b] | ` +
                  `Total pot: [b][color=#FFC00A]${fmtBONCurrency(potTotal)} BON[/color][/b].`;
            const scalingLine = (giveawayData.scaleWinnersWithSponsors && scaleIncrease > 0)
            ? `[b][color=${SCALING_ACCENT_COLOR}]Scaling:[/color][/b] [b]Winners increased[/b] by [b][color=#5DE2E7]+${fmtBON(scaleIncrease)}[/color][/b] due to sponsorships.`
            : "";
            const donationLine = donationActive
                ? (riggedMode
                    ? `🧾 [b][color=#FF4F9A]Taxes due:[/color][/b] [b][color=#FFC00A]${fmtBONCurrency(split.total)} BON[/color][/b] (${split.percent}% of the pot) reserved for direct payment into the [b]${BONANZA.FUND_NAME}[/b]. Confirmation follows after settlement.`
                    : `💙 [b][color=${BONANZA.GIVEAWAY_COLOR}]${BONANZA.FUND_NAME} allocation:[/color][/b] [b][color=${BONANZA.GIVEAWAY_COLOR}]${fmtBONCurrency(split.total)} BON[/color][/b] (${split.percent}% of the pot) reserved for direct contribution.`)
                : "";

            if (winners.length === 1) {
                // single‐winner public message
                const w = winners[0];
                const diff = Math.abs(w.guess - winNum);
                const prize = fmtBONCurrency(net[0]);
                const donatedNote = donationActive
                    ? (riggedMode
                        ? `\n[color=#aaaaaa](Gross prize: ${fmtBONCurrency(allocated[0])} BON · Taxes: ${fmtBONCurrency(split.donations[0])} BON)[/color]`
                        : `\n[color=#aaaaaa](Gross prize: ${fmtBONCurrency(allocated[0])} BON · ${BONANZA.FUND_NAME}: ${fmtBONCurrency(split.donations[0])} BON)[/color]`)
                    : "";

                const winnerLine =
                      `Congrats [b][color=#DC3D1D]${w.author}[/color][/b]! ` +
                      `Guess [color=#1DDC5D][b]${fmtBON(w.guess)}[/b][/color] ` +
                      `[color=#FB4F4F](off by ${fmtBON(diff)})[/color] ` +
                      `wins [b][color=#FFC00A]${prize} BON[/color][/b].${donatedNote}`;

                await sendMessage([summaryLine, fundingLine, scalingLine, donationLine, winnerLine].filter(Boolean).join("\n") + rigTag);
            } else {
                // multi‐winner public message
                const lines = winners.map((w, i) => {
                    const diff = Math.abs(w.guess - winNum);
                    const prize = fmtBONCurrency(net[i]);
                    const medal = medals[i] || `${i + 1}.`;
                    return `${medal} [b][color=#DC3D1D]${w.author}[/color][/b]: ` +
                        `[color=#1DDC5D][b]${fmtBON(w.guess)}[/b][/color] ([color=#FB4F4F]${fmtBON(diff)}[/color]) ` +
                        `[color=#FFC00A][b]${prize} BON[/b][/color]`;
                });
                const multiDonatedNote = donationActive ? `\n[color=#aaaaaa]Amounts shown are after the ${split.percent}% ${BONANZA.FUND_NAME} donation.[/color]` : "";

                await sendMessage([summaryLine, fundingLine, scalingLine, donationLine, lines.join(', ')].filter(Boolean).join("\n") + multiDonatedNote + rigTag);
            }

            const winnerNames = winners.map(w => sanitizeNick(w.author)).join(", ") || "none";
            const payoutPerWinner = net.map((amt, i) => `${sanitizeNick(winners[i]?.author || "unknown")}: ${fmtBONCurrency(amt)} BON`).join(", ");
            const donationLog = donationActive
                ? ` | ${BONANZA.FUND_NAME}=${fmtBONCurrency(split.total)} BON (${split.percent}%, direct contribution pending)`
                : " | Contribution=0%";
            logEvent(
                "Giveaway ended",
                `Entrants=${fmtBON(entrantsTotal)} | Winners=${fmtBON(N)} | Host-funded=${fmtBONCurrency(hostFundedTotal)} BON | Sponsored=${fmtBONCurrency(sponsoredTotal)} BON | Total=${fmtBONCurrency(potTotal)} BON${donationLog} | Winners list=${winnerNames}${payoutPerWinner ? ` | Payouts=${payoutPerWinner}` : ""}`
            );

            // 6) Send gifts sequentially. Capture a chat cursor immediately before
            // payout so verification cannot accidentally match an older identical gift.
            const selfKeys = resolveSelfKeys(giveawayData.host);
            const expectedGifts = [];
            const payoutNotBeforeTs = Date.now();
            const payoutAfterMessageId = await getLatestChatMessageId();

            for (let i = 0; i < winners.length; i++) {
                const w = winners[i];
                const amt = net[i];
                if (!amt || amt <= 0) {
                    // Possible only if a tiny prize was entirely consumed by the donation floor;
                    // computeDonationSplit guarantees net >= 1 whenever gross >= 1, so this is defensive.
                    continue;
                }
                if (selfKeys.size && selfKeys.has(normalizeUserKey(w.author))) {
                    // Host winner — cannot gift to self
                    markWinnerGiftSelf(w.author);
                    continue;
                }

                const msg = (winners.length === 1)
                    ? `🎉 You won! Enjoy your ${amt} BON!`
                    : `🎉 Congratulations on placing ${ordinal(i + 1)}!`;

                await giftBon(w.author, amt, msg, GIFT_PURPOSE.WINNER);
                expectedGifts.push({ recipient: w.author, amount: amt, purpose: GIFT_PURPOSE.WINNER });

                if (PAYOUT_GIFT_GAP_MS > 0) {
                    await new Promise(resolve => setTimeout(resolve, PAYOUT_GIFT_GAP_MS));
                }
            }

            // 6a) Direct BON Pool contribution. Success is announced publicly only
            //     after both the host's own contribution counter and the global pool
            //     total confirm the expected increase.
            let poolResult = { confirmed: false, attempted: false, reason: "not-active" };
            if (donationActive) {
                poolResult = await contributeBonPool(split.total);
                donationInfo.confirmed = !!poolResult.confirmed;
                if (poolResult.confirmed) {
                    markFundGiftStatus("confirmed");
                    const paidMessage = riggedMode
                        ? `${bridgeMarker(BRIDGE_MARKERS.TAXES_PAID, "🧾")} [b][color=#FF4F9A]TAXES PAID:[/color][/b] [b][color=#FFC00A]${fmtBONCurrency(split.total)} BON[/color][/b] successfully paid directly into the [b]${BONANZA.FUND_NAME}[/b]. The taxman is satisfied. 😈`
                        : `${bridgeMarker(BRIDGE_MARKERS.POOL_PAID, "💙")} [b][color=${BONANZA.GIVEAWAY_COLOR}]${BONANZA.FUND_NAME} contribution confirmed:[/color][/b] [b][color=${BONANZA.GIVEAWAY_COLOR}]${fmtBONCurrency(split.total)} BON[/color][/b] paid directly into the pool.\nThank you for supporting the event! ✨`;
                    await sendMessage(paidMessage);
                } else {
                    markFundGiftStatus("failed");
                    logEvent("BON Pool verification warning", `Direct contribution of ${fmtBONCurrency(split.total)} BON could not be confirmed. No automatic retry was attempted.`);
                    try {
                        window.alert(`BON Pool warning: the ${fmtBONCurrency(split.total)} BON contribution could not be confirmed. Check /bon-pool manually before retrying anything.`);
                    } catch {}
                }
            }
            try {
                if (!giveawayData.settlement?.statsRecorded) {
                    recordGiveawayStats(giveawayData, winners, net, numberEntries, donationInfo);
                    giveawayData.settlement.statsRecorded = true;
                    snapshotGiveaway({ force: true });
                }
            } catch (e) { /* ignore stats errors */ }
            try {
                currentStatement = createStatementRecord({
                    winners, gross: allocated, net, donations: split.donations, split,
                    poolStatus: donationActive
                        ? (poolResult.confirmed ? "confirmed directly in BON Pool" : "NOT CONFIRMED, check /bon-pool manually")
                        : "none",
                    entrants: entrantsTotal
                });
                if (currentStatement && !expectedGifts.length) currentStatement.verification = "nothing to verify";
                persistCurrentStatement();
            } catch (e) { /* statements are best-effort */ }

            // 6b) Verify that the gifts actually show up in chat via the API
            verifyWinnerGifts(expectedGifts, giveawayData.host, {
                afterId: payoutAfterMessageId,
                notBeforeTs: payoutNotBeforeTs,
                statementId: currentStatement?.id ?? null
            });
        }

        // 7) Settlement is terminal only now. Persist completion once, then
        // stopGiveaway() may safely retire the active snapshot.
        if (giveawayData?.settlement?.committed) {
            giveawayData.settlement.phase = "complete";
            giveawayData.settlement.completedAt = Date.now();
            snapshotGiveaway({ force: true });
        }
        stopGiveaway();
    }

    function clearWinnersStatusUI() {
        winnerPayouts.clear();
        winnerGiftStatus.clear();
        clearEntryRowCache();

        const table = getEntriesTable();
        if (!table) return;

        // Reset back to the basic two-column header.
        // Body will be repopulated by updateEntries() as entries arrive.
        table.innerHTML =
            "<thead><tr><th>User</th><th>Entry #</th></tr></thead><tbody></tbody>";
    }

    /**
     * @param {Array} winners
     * @param {number[]} allocated   net amounts actually gifted to each winner
     * @param {string} hostName
     * @param {{total:number, percent:number, retained:boolean}|null} donation
     */
    function initWinnersStatusUI(winners, allocated, hostName, donation = null) {
        winnerPayouts.clear();
        winnerGiftStatus.clear();

        const selfKeys = resolveSelfKeys(hostName);

        if (!Array.isArray(winners) || !Array.isArray(allocated) || !winners.length) {
            return;
        }

        const table = document.getElementById("entriesTable");
        if (!table) return;

        const thead = table.querySelector("thead");
        const tbody = table.querySelector("tbody");
        if (!thead || !tbody) return;

        const headerRow = thead.querySelector("tr");
        if (!headerRow) return;

        // If we're still in the plain 2-column mode, extend the header
        if (headerRow.children.length === 2) {
            const thPrize = document.createElement("th");
            thPrize.textContent = "Prize";
            const thGift = document.createElement("th");
            thGift.textContent = "Gift Status";
            headerRow.appendChild(thPrize);
            headerRow.appendChild(thGift);
        }

        // Build a lookup from entry number -> { author, prize }
        const byGuess = new Map();
        winners.forEach((w, idx) => {
            if (!w || typeof w.author !== "string") return;
            const prize = allocated[idx];
            if (!prize || prize <= 0) return;
            byGuess.set(w.guess, { author: w.author, prize });
        });

        Array.from(tbody.rows).forEach(row => {
            const cells = row.children;
            if (cells.length < 2) return;

            const entryNum = parseInt(cells[1].textContent, 10);
            const info = byGuess.get(entryNum);

            const prizeCell = document.createElement("td");
            const giftCell = document.createElement("td");
            giftCell.style.textAlign = "center";

            if (info) {
                const key = normalizeUserKey(info.author);
                winnerPayouts.set(key, info.prize);

                prizeCell.textContent = info.prize.toLocaleString();
                row.dataset.winnerKey = encodeURIComponent(key);

                if (selfKeys.size && selfKeys.has(key)) {
                    // Host winner — can't gift to self, so skip gifting/verification UI
                    winnerGiftStatus.set(key, "self");
                    giftCell.textContent = "Self";
                    giftCell.title = "Host winner (no self-gift)";
                    row.classList.add("gift-self");
                } else {
                    winnerGiftStatus.set(key, "pending");
                    giftCell.innerHTML = `<span class="gift-spinner" title="Checking gift status…"></span>`;
                    row.classList.add("gift-pending");
                }

            } else {
                // Non-winners still get empty cells so the table stays aligned
                prizeCell.textContent = "";
                giftCell.textContent = "";
            }

            row.appendChild(prizeCell);
            row.appendChild(giftCell);
        });

        // BON Pool row (only when a donation is in play)
        if (donation && donation.total > 0) {
            const fundRow = document.createElement("tr");
            fundRow.dataset.fundRow = "1";
            fundRow.style.borderTop = `2px solid ${BONANZA.ACCENT_COLOR}`;

            const userCell = document.createElement("td");
            userCell.innerHTML = `<span style="color:${BONANZA.ACCENT_COLOR};font-weight:600;">${BONANZA.FUND_NAME}</span> <small style="color:#aaa;">(direct)</small>`;
            const entryCell = document.createElement("td");
            entryCell.textContent = `${donation.percent}%`;
            const prizeCell = document.createElement("td");
            prizeCell.textContent = donation.total.toLocaleString();
            const giftCell = document.createElement("td");
            giftCell.style.textAlign = "center";

            giftCell.innerHTML = `<span class="gift-spinner" title="Checking BON Pool contribution…"></span>`;
            fundRow.classList.add("gift-pending");

            fundRow.append(userCell, entryCell, prizeCell, giftCell);
            tbody.appendChild(fundRow);
        }
    }

    function getFundRow() {
        const table = document.getElementById("entriesTable");
        return table ? table.querySelector('tbody tr[data-fund-row="1"]') : null;
    }

    function markFundGiftStatus(status) {
        const row = getFundRow();
        if (!row) return;
        row.classList.remove("gift-pending", "gift-failed", "gift-confirmed");
        const cell = row.children[3];
        if (status === "confirmed") {
            row.classList.add("gift-confirmed");
            if (cell) cell.textContent = "✓";
        } else {
            row.classList.add("gift-failed");
            if (cell) cell.textContent = "⚠";
        }
    }

    function getWinnerRowByRecipient(recipientName) {
        if (!recipientName) return null;
        const key = encodeURIComponent(normalizeUserKey(recipientName));

        const table = document.getElementById("entriesTable");
        if (!table) return null;

        return table.querySelector(`tbody tr[data-winner-key="${key}"]`);
    }

    function markWinnerGiftConfirmed(recipientName) {
        const row = getWinnerRowByRecipient(recipientName);
        if (!row) return;

        row.classList.remove("gift-pending", "gift-failed");
        row.classList.add("gift-confirmed");

        const key = normalizeUserKey(recipientName);
        winnerGiftStatus.set(key, "confirmed");

        const cells = row.children;
        if (cells.length >= 4) {
            cells[3].textContent = "✓";
        }
    }

    function markWinnerGiftSelf(recipientName) {
        const row = getWinnerRowByRecipient(recipientName);
        if (!row) return;

        row.classList.remove("gift-pending", "gift-failed", "gift-confirmed");
        row.classList.add("gift-self");

        const key = normalizeUserKey(recipientName);
        if (key) winnerGiftStatus.set(key, "self");

        const cells = row.children;
        if (cells.length >= 4) {
            // "No gift" indicator (host winner can't gift to self)
            cells[3].textContent = "Self";
            cells[3].title = "Host winner (no self-gift)";
        }
    }


    function markWinnerGiftFailed(recipientName) {
        const row = getWinnerRowByRecipient(recipientName);
        if (!row) return;

        row.classList.remove("gift-pending", "gift-confirmed");
        row.classList.add("gift-failed");

        const key = normalizeUserKey(recipientName);
        winnerGiftStatus.set(key, "failed");

        const cells = row.children;
        if (cells.length >= 4) {
            cells[3].textContent = "⚠";
        }
    }

    function markAllPendingWinnerGiftsFailed() {
        const table = document.getElementById("entriesTable");
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr.gift-pending[data-winner-key]');
        rows.forEach(row => {
            const keyEnc = row.dataset.winnerKey || "";
            let key = "";
            try { key = decodeURIComponent(keyEnc); } catch (_) { key = keyEnc; }

            const normKey = normalizeUserKey(key);
            if (normKey) winnerGiftStatus.set(normKey, "failed");

            row.classList.remove("gift-pending", "gift-confirmed");
            row.classList.add("gift-failed");

            const cells = row.children;
            if (cells.length >= 4) {
                cells[3].textContent = "⚠";
            }
        });

        const fundRow = getFundRow();
        if (fundRow && fundRow.classList.contains("gift-pending")) markFundGiftStatus("failed");
    }

    // Fetch wrapper that *cannot* hang forever
    async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), timeoutMs);

        try {
            return await fetch(url, { ...options, signal: controller.signal });
        } finally {
            clearTimeout(t);
        }
    }

    async function getLatestChatMessageId() {
        try {
            const url = new URL(`/api/chat/messages/${chatroomId}`, location.origin);
            const res = await fetchWithTimeout(url, { credentials: "include" }, 5000);
            if (!res || !res.ok) return null;
            const payload = await res.json();
            const messages = Array.isArray(payload && payload.data) ? payload.data : [];
            let maxId = null;
            for (const m of messages) {
                const id = Math.floor(Number(m && m.id));
                if (!Number.isFinite(id)) continue;
                if (maxId === null || id > maxId) maxId = id;
            }
            return maxId;
        } catch {
            return null;
        }
    }

    /**
     * After gifts are sent, poll the chat API a few times to confirm that the
     * expected host→recipient gift messages appeared. If we can't confirm them,
     * warn in chat that gifting may have failed.
     *
     * Expected gifts are a list rather than a per-recipient map because the fund
     * manager may legitimately receive two gifts (winnings + donation), possibly
     * for identical amounts. Each chat message may satisfy at most one entry.
     *
     * @param {Array<{recipient:string, amount:number, purpose:string}>} expectedGifts
     * @param {string} hostName
     * @param {{afterId?:number|null, notBeforeTs?:number|null}} verificationContext
     */
    async function verifySponsorRefundGifts(expectedGifts, hostName, baselineRows, fallbackContext = {}) {
        const statementId = fallbackContext?.statementId ?? currentStatement?.id ?? null;
        fallbackContext = { ...fallbackContext, statementId };
        const expected = (Array.isArray(expectedGifts) ? expectedGifts : [])
            .map(g => ({
                recipient: String(g?.recipient || "").trim(),
                key: normalizeUserKey(g?.recipient),
                amount: Math.max(0, Math.floor(Number(g?.amount) || 0)),
                purpose: GIFT_PURPOSE.SPONSOR_REFUND,
                done: false
            }))
            .filter(g => g.recipient && g.key && g.amount > 0);

        if (!expected.length) return true;

        const tracker = window.__activeTracker;
        const canUseHistory = Array.isArray(baselineRows) && tracker && typeof tracker.fetchRecentGiftHistory === "function";
        const selfKeys = resolveSelfKeys(hostName);

        if (!canUseHistory || !selfKeys.size) {
            logEvent("Sponsor refund verification fallback", "Gift History baseline unavailable; using chat API verification.");
            verifyWinnerGifts(expected, hostName, fallbackContext);
            return null;
        }

        const baselineCounts = new Map();
        for (const row of baselineRows) {
            const key = giftHistoryBaseKey(row);
            if (!key) continue;
            baselineCounts.set(key, (baselineCounts.get(key) || 0) + 1);
        }

        const maxAttempts = 6;
        const delayMs = 2500;
        let successfulReads = 0;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            if (attempt > 1) await new Promise(resolve => setTimeout(resolve, delayMs));

            let rows;
            try {
                rows = await tracker.fetchRecentGiftHistory();
                successfulReads += 1;
            } catch (e) {
                logEvent("Sponsor refund Gift History retry", `Attempt ${attempt}/${maxAttempts}: ${String(e?.message || e)}`);
                continue;
            }

            const currentCounts = new Map();
            const freshRows = [];
            for (const row of rows) {
                const key = giftHistoryBaseKey(row);
                if (!key) continue;
                const occurrence = (currentCounts.get(key) || 0) + 1;
                currentCounts.set(key, occurrence);
                if (occurrence > (baselineCounts.get(key) || 0)) freshRows.push(row);
            }

            const consumed = new Set();
            for (const gift of expected) {
                if (gift.done) continue;
                const index = freshRows.findIndex((row, idx) =>
                    !consumed.has(idx) &&
                    selfKeys.has(normalizeUserKey(row?.sender)) &&
                    normalizeUserKey(row?.recipient) === gift.key &&
                    Math.max(0, Math.floor(Number(row?.amount) || 0)) === gift.amount &&
                    sanitizeSponsorGiftMessage(row?.message) === SPONSOR_REFUND_NOTE
                );
                if (index < 0) continue;
                consumed.add(index);
                gift.done = true;
                updateStatementGiftStatus(gift.recipient, gift.purpose, "confirmed-history", statementId);
            }

            if (expected.every(g => g.done)) {
                const targetStatement = getStatementRecordById(statementId);
                if (targetStatement) {
                    targetStatement.verification = "all sponsor refunds confirmed in Gift History";
                    persistStatementRecord(targetStatement);
                }
                return true;
            }
        }

        if (successfulReads === 0) {
            logEvent("Sponsor refund verification fallback", "Gift History became unavailable; using chat API verification.");
            verifyWinnerGifts(expected, hostName, fallbackContext);
            return null;
        }

        const missing = expected.filter(g => !g.done);
        missing.forEach(g => updateStatementGiftStatus(g.recipient, g.purpose, "failed", statementId));
        const targetStatement = getStatementRecordById(statementId);
        if (targetStatement) {
            targetStatement.verification = `${missing.length} sponsor refund(s) could not be confirmed in Gift History`;
            persistStatementRecord(targetStatement);
        }

        const missingList = missing
            .map(g => `${sanitizeNick(g.recipient)} (${fmtBONCurrency(g.amount)} BON)`)
            .join(", ");
        logEvent("Sponsor refund verification warning", `Gift History could not confirm: ${missingList}`);
        await sendMessage(
            `[color=#ff4f4f][b]Warning:[/b][/color] Some sponsor refunds could not be confirmed. ` +
            `Please verify manually: ${missingList}.`
        );
        return false;
    }

    function verifyWinnerGifts(expectedGifts, hostName, verificationContext = {}) {
        try {
            const statementId = verificationContext?.statementId ?? currentStatement?.id ?? null;
            const afterId = Number.isFinite(Number(verificationContext && verificationContext.afterId))
                ? Math.floor(Number(verificationContext.afterId))
                : null;
            const notBeforeTs = Number.isFinite(Number(verificationContext && verificationContext.notBeforeTs))
                ? Number(verificationContext.notBeforeTs)
                : null;
            const selfKeys = resolveSelfKeys(hostName);
            if (!selfKeys.size) {
                // If UI is showing pending spinners, don’t leave them stuck
                markAllPendingWinnerGiftsFailed();
                const targetStatement = getStatementRecordById(statementId);
                if (targetStatement) {
                    targetStatement.verification = "could not verify (host name unknown)";
                    persistStatementRecord(targetStatement);
                }
                return;
            }

            const expected = (Array.isArray(expectedGifts) ? expectedGifts : [])
                .map(g => ({
                    recipient: String(g && g.recipient || "").trim(),
                    key: normalizeUserKey(g && g.recipient),
                    amount: Math.round(Number(g && g.amount) || 0),
                    purpose: (g && g.purpose) || GIFT_PURPOSE.WINNER,
                    done: false
                }))
                .filter(g => g.recipient && g.amount > 0 && !selfKeys.has(g.key));

            if (!expected.length) return;

            const maxAttempts = 5;
            const delayMs = 5000;
            const fetchTimeoutMs = 5000;
            const hardDeadlineMs = (maxAttempts * (delayMs + fetchTimeoutMs)) + 4000;
            const consumedMessageIds = new Set();

            let attempts = 0;
            let done = false;

            const describe = g => `${sanitizeNick(g.recipient)} (${fmtBONCurrency(g.amount)} BON)`;

            function markConfirmed(g) {
                markWinnerGiftConfirmed(g.recipient);
                updateStatementGiftStatus(g.recipient, g.purpose, "confirmed", statementId);
            }
            function markFailed(g) {
                markWinnerGiftFailed(g.recipient);
                updateStatementGiftStatus(g.recipient, g.purpose, "failed", statementId);
            }

            function finalizeFail() {
                if (done) return;
                done = true;
                clearTimeout(hardTimer);

                const missing = expected.filter(g => !g.done);
                finalizeStatementVerification(missing.length === 0, missing.length, statementId);
                if (missing.length) {
                    missing.forEach(markFailed);
                    const missingList = missing.map(describe).join(", ");
                    logEvent("Payout verification warning", `Could not confirm gifts for: ${missingList}`);
                    sendMessage(
                        `[color=#ff4f4f][b]Warning:[/b][/color] ` +
                        `Some giveaway gifts could not be confirmed. ` +
                        `Please manually verify BON for: ${missingList}.`
                    );
                } else {
                    markAllPendingWinnerGiftsFailed();
                }
            }

            function finalizeSuccess() {
                if (done) return;
                done = true;
                clearTimeout(hardTimer);
                finalizeStatementVerification(true, 0, statementId);
            }

            const hardTimer = setTimeout(finalizeFail, hardDeadlineMs);

            async function checkOnce() {
                attempts++;

                try {
                    const url = new URL(`/api/chat/messages/${chatroomId}`, location.origin);
                    if (afterId !== null) url.searchParams.set("after_id", String(afterId));
                    const res = await fetchWithTimeout(url, { credentials: "include" }, fetchTimeoutMs);

                    if (res && res.ok) {
                        const payload = await res.json();
                        const messages = Array.isArray(payload.data) ? payload.data : [];

                        for (const m of messages) {
                            const numericMsgId = Math.floor(Number(m && m.id));
                            if (afterId !== null && Number.isFinite(numericMsgId) && numericMsgId <= afterId) continue;

                            const createdAt = Date.parse(m && m.created_at);
                            if (notBeforeTs !== null && Number.isFinite(createdAt) && createdAt < (notBeforeTs - 5000)) continue;

                            const msgId = m && m.id != null ? String(m.id) : null;
                            if (msgId && consumedMessageIds.has(msgId)) continue;

                            // Chat verification is a fallback only. Accept exclusively
                            // site-generated SystemBot gift events, never ordinary user
                            // messages that merely imitate the visible gift wording.
                            if (!m?.bot?.is_systembot) continue;

                            const gift = parseGiftMessage(m.message);
                            if (!gift || !gift.gifter || !gift.recipient) continue;

                            // Even a genuine gift event only counts if the sender is
                            // the giveaway host / authenticated self identity.
                            if (!selfKeys.has(normalizeUserKey(gift.gifter))) continue;

                            const recKey = normalizeUserKey(gift.recipient);
                            const amt = Math.round(gift.amount);
                            // First unmatched expectation with this recipient + amount wins
                            const match = expected.find(g => !g.done && g.key === recKey && g.amount === amt);
                            if (!match) continue;

                            match.done = true;
                            if (msgId) consumedMessageIds.add(msgId);
                            markConfirmed(match);
                        }
                    }
                } catch (e) {
                    // swallow – we'll just warn at the end if we never see the messages
                }

                if (expected.every(g => g.done)) {
                    finalizeSuccess();
                    return;
                }

                if (attempts >= maxAttempts) {
                    finalizeFail();
                    return;
                }

                setTimeout(checkOnce, delayMs);
            }

            // Give the server a moment to emit the gift messages before first check
            setTimeout(checkOnce, 2000);
        } catch (e) {
            logEvent("Payout verification error", "Unexpected error while confirming gift messages.");
            markAllPendingWinnerGiftsFailed();
            const targetStatement = getStatementRecordById(verificationContext?.statementId ?? null);
            if (targetStatement) {
                targetStatement.verification = "verification error, check manually";
                persistStatementRecord(targetStatement);
            }
        }
    }

    // ───────────────────────────────────────────────────────────
    // SECTION 12: Utility Functions
    // ───────────────────────────────────────────────────────────
    // Returns true when we're in the "just started" window where entry attempts
    // should be silently ignored (to catch ultra-fast auto-joiners).
    function isWithinEntryIgnoreWindow() {
        if (!giveawayStartTime) return false;
        const elapsed = Date.now() - giveawayStartTime.getTime();
        return elapsed >= 0 && elapsed < ENTRY_IGNORE_WINDOW_MS;
    }

    /**
     * Uniformly pick one FREE number without materialising the entire numeric range.
     * Complexity depends on the number of existing entries, not on end-start.
     */
    function pickRandomFreeNumber(data) {
        if (!data) return null;
        const start = Math.ceil(Number(data.startNum));
        const end = Math.floor(Number(data.endNum));
        if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;

        const taken = Array.from(new Set(numberEntries.values()))
            .map(Number)
            .filter(n => Number.isInteger(n) && n >= start && n <= end)
            .sort((a, b) => a - b);

        const totalSlots = end - start + 1;
        const freeCount = totalSlots - taken.length;
        if (freeCount <= 0) return null;

        // Pick a zero-based rank among free numbers, then map that rank back into
        // the full interval by skipping occupied values. This is exactly uniform.
        const freeRank = getRandomInt(0, freeCount - 1);
        let candidate = start + freeRank;
        for (const occupied of taken) {
            if (occupied <= candidate) candidate++;
            else break;
        }

        return candidate <= end ? candidate : null;
    }

    // Return a small random sample of free numbers in the current range
    // (used by both !free and the "number already taken" messages)
    function getFreeNumberSample(giveawayData, sampleSize = 5) {
        if (!giveawayData) return [];

        const taken = new Set(numberEntries.values());
        const startNum = giveawayData.startNum;
        const endNum = giveawayData.endNum;
        const totalSlots = endNum - startNum + 1;

        if (totalSlots <= 0) return [];

        // Same optimization as !free: for huge ranges with very few taken numbers
        if (totalSlots > 100000 && taken.size / totalSlots < 0.01) {
            const sample = new Set();
            let attempts = 0, maxAttempts = 1000;

            while (sample.size < sampleSize && attempts < maxAttempts) {
                attempts++;
                const candidate = getRandomInt(startNum, endNum);
                if (!taken.has(candidate)) sample.add(candidate);
            }

            const result = [...sample];
            result.sort((a, b) => a - b);
            return result;
        }

        // Normal case: build an array of all free numbers and shuffle a subset
        const freeNumbers = [];
        for (let k = startNum; k <= endNum; k++) {
            if (!taken.has(k)) freeNumbers.push(k);
        }
        if (!freeNumbers.length) return [];

        const actualSampleSize = Math.min(sampleSize, freeNumbers.length);
        // Fisher–Yates style partial shuffle
        for (let i = 0; i < actualSampleSize; i++) {
            const j = i + Math.floor(Math.random() * (freeNumbers.length - i));
            [freeNumbers[i], freeNumbers[j]] = [freeNumbers[j], freeNumbers[i]];
        }

        const result = freeNumbers.slice(0, actualSampleSize);
        result.sort((a, b) => a - b);
        return result;
    }

    // Nicely format "here are some free numbers you can try…" text.
    // Respects the "Free" toggle: if !free is disabled, this returns an empty string.
    function formatFreeNumberSuggestion(giveawayData) {
        if (!giveawayData || GENERAL_SETTINGS.disable_free) return "";

        const sample = getFreeNumberSample(giveawayData, 5);
        if (!sample.length) {
            return " There are no free numbers left!";
        }

        const rigHint = rigNote("(these are some [b]suspiciously good[/b] numbers, trust me...) 😏");
        return ` Here are some free numbers you can try: [b][color=#1DDC5D]${sample.join(", ")}[/color][/b].` + rigHint;
    }

    /**
     * Uniform random integer in [min, max]. Uses the browser's cryptographic
     * source (crypto.getRandomValues) with rejection sampling so every value in
     * the range is equally likely; falls back to Math.random only if the crypto
     * API is unavailable.
     */
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        if (!(max >= min)) return min;
        const range = max - min + 1;

        const c = (typeof crypto !== "undefined" && crypto && typeof crypto.getRandomValues === "function") ? crypto : null;
        if (c && range <= 0x100000000) {
            const buf = new Uint32Array(1);
            const limit = 0x100000000 - (0x100000000 % range); // reject values above this to avoid modulo bias
            for (let i = 0; i < 64; i++) {
                c.getRandomValues(buf);
                if (buf[0] < limit) return min + (buf[0] % range);
            }
            // Statistically unreachable (each rejection has probability < 0.5); fall through.
        }
        return Math.floor(Math.random() * range) + min;
    }

    /**
     * Minimum gross pot needed for the weighted N..1 payout scheme to give every
     * announced winner at least 1 BON. The last rank has weight 1, so the exact
     * threshold is the triangular number N(N+1)/2.
     */
    function minimumPotForWeightedWinners(count) {
        const n = Math.max(1, Math.min(MAX_WINNERS, Math.floor(Number(count) || 1)));
        return (n * (n + 1)) / 2;
    }

    function maxWeightedWinnersForPot(pot) {
        const available = Math.max(0, Math.floor(Number(pot) || 0));
        let max = 0;
        for (let n = 1; n <= MAX_WINNERS; n++) {
            if (minimumPotForWeightedWinners(n) > available) break;
            max = n;
        }
        return Math.max(1, max);
    }

    // ───────────── BON Pool helpers ─────────────

    /**
     * Split gross prizes into winner net prizes plus one exact BON Pool share.
     *
     * The public percentage applies to the whole pot:
     *   poolTarget = floor(sum(gross) * pct / 100)
     *
     * We first floor each proportional per-winner deduction, then distribute the
     * small rounding remainder by largest fractional remainder. A deduction is
     * never allowed to reduce a positive gross prize below 1 BON.
     *
     * @param {number[]} allocated gross prizes
     * @param {number} percent 0..30 in steps of 5
     * @returns {{percent:number, net:number[], donations:number[], total:number}}
     */
    function computeDonationSplit(allocated, percent) {
        const pct = normalizeDonationPercent(percent);
        const gross = (Array.isArray(allocated) ? allocated : [])
            .map(a => Math.max(0, Math.floor(Number(a) || 0)));

        if (pct <= 0 || !gross.length) {
            return { percent: 0, net: gross.slice(), donations: gross.map(() => 0), total: 0 };
        }

        const grossTotal = gross.reduce((sum, g) => sum + g, 0);
        const target = Math.floor(grossTotal * pct / 100);
        const donations = gross.map(g => Math.floor(g * pct / 100));
        let remaining = target - donations.reduce((sum, d) => sum + d, 0);

        if (remaining > 0) {
            const order = gross.map((g, i) => ({
                i,
                remainder: (g * pct) % 100,
                gross: g
            })).sort((a, b) =>
                (b.remainder - a.remainder) ||
                (b.gross - a.gross) ||
                (a.i - b.i)
            );

            for (const item of order) {
                if (remaining <= 0) break;
                const i = item.i;
                if (donations[i] < Math.max(0, gross[i] - 1)) {
                    donations[i] += 1;
                    remaining -= 1;
                }
            }

            // Defensive fallback. With pct <= 30 and funded weighted prizes the
            // first pass is sufficient, but never return an under-target pool.
            if (remaining > 0) {
                for (let i = 0; i < gross.length && remaining > 0; i++) {
                    while (remaining > 0 && donations[i] < Math.max(0, gross[i] - 1)) {
                        donations[i] += 1;
                        remaining -= 1;
                    }
                }
            }
        }

        const net = gross.map((g, i) => g - donations[i]);
        const total = donations.reduce((sum, d) => sum + d, 0);

        selfCheck(total === target, "BON Pool split did not reach exact target", {
            grossTotal, pct, target, total, remaining
        });
        selfCheck(net.every((n, i) => gross[i] === 0 ? n === 0 : n >= 1), "BON Pool split produced zero/negative winner payout", {
            gross, donations, net
        });

        return { percent: pct, net, donations, total };
    }

    // ───────────── End-of-giveaway statements ─────────────
    // A plain-text record of every transaction in a giveaway, built when the
    // giveaway ends and updated as gift confirmations arrive. The last few are
    // kept in localStorage so the host (or the BON Pool) can save them later.

    let currentStatement = null; // record for the giveaway that just ended

    function readStatements() {
        try {
            const raw = localStorage.getItem(LS_STATEMENTS);
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch { return []; }
    }

    function writeStatements(list) {
        try { localStorage.setItem(LS_STATEMENTS, JSON.stringify(list.slice(0, STATEMENTS_KEEP))); } catch {}
    }

    function persistStatementRecord(record, { selectLatest = false } = {}) {
        if (!record || record.id == null) return;
        const list = readStatements();
        const index = list.findIndex(r => r && String(r.id) === String(record.id));
        if (index >= 0) {
            list[index] = record;
        } else {
            list.unshift(record);
        }
        writeStatements(list);
        if (currentStatement && String(currentStatement.id) === String(record.id)) {
            currentStatement = record;
        }
        renderStatementControls({ selectLatest });
    }

    function persistCurrentStatement() {
        if (!currentStatement) return;
        persistStatementRecord(currentStatement, { selectLatest: true });
    }

    function getStatementRecordById(statementId) {
        if (statementId == null) return currentStatement;
        if (currentStatement && String(currentStatement.id) === String(statementId)) {
            return currentStatement;
        }
        return readStatements().find(r => r && String(r.id) === String(statementId)) || null;
    }

    function statementTimestamp(ms) {
        const d = new Date(ms);
        const pad = n => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    function statementFilename(rec) {
        const d = new Date(rec.endedAt);
        const pad = n => String(n).padStart(2, "0");
        const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
        const host = String(rec.host || "host").replace(/[^A-Za-z0-9_-]/g, "");
        return `BONanza-statement_${stamp}_${host}.txt`;
    }

    /**
     * Create the statement record at the end of a giveaway.
     * @param {object} p  { winners, gross, net, donations, split, poolStatus, entrants, refunds? }
     */
    function createStatementRecord(p) {
        const data = giveawayData;
        if (!data) return null;
        const hostKey = normalizeUserKey(data.host);
        const potTotal = Math.max(0, Math.floor(Number(data.amount) || 0));
        const sponsorGiftMessages = Array.isArray(data.sponsorGiftMessages)
            ? data.sponsorGiftMessages
            : [];
        const sponsors = Object.entries(data.sponsorContribs || {})
            .map(([name, amt]) => ({
                name,
                amount: Math.max(0, Math.floor(Number(amt) || 0)),
                isHost: normalizeUserKey(name) === hostKey,
                messages: sponsorGiftMessages
                    .filter(item => normalizeUserKey(item?.sponsor) === normalizeUserKey(name))
                    .map(item => ({
                        amount: Math.max(0, Math.floor(Number(item?.amount) || 0)),
                        message: sanitizeSponsorGiftMessage(item?.message),
                        createdAtTs: Number.isFinite(Number(item?.createdAtTs))
                            ? Number(item.createdAtTs)
                            : null
                    }))
                    .filter(item => item.message)
            }))
            .filter(x => x.amount > 0)
            .sort((a, b) => b.amount - a.amount);
        const sponsoredTotal = sponsors.filter(x => !x.isHost).reduce((s, x) => s + x.amount, 0);
        const hostTopUps = sponsors.filter(x => x.isHost).reduce((s, x) => s + x.amount, 0);

        const winners = (p.winners || []).map((w, i) => ({
            place: i + 1,
            user: w.author,
            guess: w.guess,
            gap: w.gap,
            gross: p.gross[i],
            donation: p.donations[i],
            net: p.net[i],
            status: (normalizeUserKey(w.author) === hostKey) ? "self (host, no gift sent)" : "sent, awaiting confirmation"
        }));

        const pct = p.split ? p.split.percent : 0;
        const donationTotal = p.split ? p.split.total : 0;
        const refunds = (Array.isArray(p.refunds) ? p.refunds : [])
            .map(item => ({
                user: String(item?.user || item?.recipient || "").trim(),
                amount: Math.max(0, Math.floor(Number(item?.amount) || 0)),
                status: String(item?.status || "sent, awaiting confirmation")
            }))
            .filter(item => item.user && item.amount > 0);

        return {
            id: getActiveGiveawayId() || Date.now(),
            scriptVersion: SCRIPT_VERSION,
            site: location.hostname,
            host: data.host,
            startedAt: giveawayStartTime ? giveawayStartTime.getTime() : null,
            endedAt: Date.now(),
            range: [data.startNum, data.endNum],
            winningNumber: data.winningNumber,
            entrants: p.entrants,
            winnersDrawn: winners.length,
            baseWinners: data.baseWinnersAtStart || data.winnersNum,
            potTotal,
            hostFunded: Math.max(0, potTotal - sponsoredTotal),
            hostTopUps,
            sponsoredTotal,
            sponsors,
            donationPercent: pct,
            donationTotal,
            donationRecipient: "DarkPeers /bon-pool",
            donationStatus: donationTotal <= 0 ? "none" : (p.poolStatus || "contribution pending verification"),
            refunds,
            winners,
            verification: "in progress",
            notes: []
        };
    }

    /** Update a gift line in the statement captured by the verifier. */
    function updateStatementGiftStatus(recipient, purpose, status, statementId = null) {
        const targetStatement = getStatementRecordById(statementId);
        if (!targetStatement) return;
        const label = ({
            confirmed: "confirmed in chat",
            "confirmed-history": "confirmed in Gift History",
            failed: "NOT CONFIRMED, check manually",
            self: "self (host, no gift sent)"
        })[status] || status;
        const key = normalizeUserKey(recipient);

        if (purpose === GIFT_PURPOSE.SPONSOR_REFUND) {
            (targetStatement.refunds || []).forEach(refund => {
                if (normalizeUserKey(refund.user) === key) refund.status = label;
            });
        } else {
            (targetStatement.winners || []).forEach(w => {
                if (normalizeUserKey(w.user) === key) w.status = label;
            });
        }
        persistStatementRecord(targetStatement);
    }

    function finalizeStatementVerification(ok, missingCount, statementId = null) {
        const targetStatement = getStatementRecordById(statementId);
        if (!targetStatement) return;
        targetStatement.verification = ok
            ? "all gifts confirmed in chat"
            : `${missingCount} gift(s) could not be confirmed`;
        persistStatementRecord(targetStatement);
    }

    function buildStatementText(rec) {
        if (!rec) return "";
        const L = [];
        const line = (ch = "=") => ch.repeat(72);
        const money = n => `${fmtBONCurrency(n)} BON`;
        const padR = (t, n) => String(t).padEnd(n);
        const padL = (t, n) => String(t).padStart(n);

        L.push(line());
        L.push("DARKPEERS BONanza GIVEAWAY STATEMENT");
        L.push(line());
        L.push(`Giveaway ID     : ${rec.id}`);
        L.push(`Site            : ${rec.site}`);
        L.push(`Host            : ${rec.host}`);
        L.push(`Started         : ${rec.startedAt ? statementTimestamp(rec.startedAt) : "n/a"}`);
        L.push(`Ended           : ${statementTimestamp(rec.endedAt)}`);
        L.push(`Number range    : ${rec.range[0]} - ${rec.range[1]}`);
        L.push(`Winning number  : ${rec.winningNumber}`);
        L.push(`Entrants        : ${rec.entrants}`);
        L.push(`Winners drawn   : ${rec.winnersDrawn} (base ${rec.baseWinners})`);
        L.push(`Script version  : ${rec.scriptVersion}`);
        L.push("");
        L.push(line("-"));
        L.push("POT");
        L.push(line("-"));
        L.push(`Host funded     : ${money(rec.hostFunded)}${rec.hostTopUps > 0 ? ` (includes ${money(rec.hostTopUps)} added by host during the giveaway)` : ""}`);
        L.push(`Sponsored       : ${money(rec.sponsoredTotal)}`);
        rec.sponsors.filter(x => !x.isHost).forEach(x => {
            L.push(`  ${padR(x.name, 28)} ${padL(money(x.amount), 16)}`);
            const messages = Array.isArray(x.messages) ? x.messages : [];
            messages.forEach(item => {
                const giftAmount = Number(item?.amount) > 0 ? ` [${money(item.amount)}]` : "";
                L.push(`    Message${giftAmount}: "${String(item?.message || "")}"`);
            });
        });
        L.push(`TOTAL POT       : ${money(rec.potTotal)}`);
        L.push("");
        L.push(line("-"));
        L.push(`BON POOL CONTRIBUTION`);
        L.push(line("-"));
        if (rec.donationTotal > 0) {
            L.push(`Percentage      : ${rec.donationPercent}% of the total pot (host + sponsors)`);
            L.push(`Amount          : ${money(rec.donationTotal)}`);
            L.push(`Recipient       : ${rec.donationRecipient}`);
            L.push(`Status          : ${rec.donationStatus}`);
        } else {
            L.push("None (0%). Standard giveaway.");
        }
        const refunds = Array.isArray(rec.refunds) ? rec.refunds : [];
        if (refunds.length) {
            L.push("");
            L.push(line("-"));
            L.push("SPONSOR REFUNDS");
            L.push(line("-"));
            refunds.forEach(refund => {
                L.push(`  ${padR(refund.user, 28)} ${padL(money(refund.amount), 16)}  ${refund.status}`);
            });
            const refundTotal = refunds.reduce((sum, refund) => sum + Math.max(0, Number(refund.amount) || 0), 0);
            L.push(line("-"));
            L.push(`Refunded total  : ${money(refundTotal)}`);
            L.push(`Check           : host keeps ${money(rec.hostFunded)} + refunds ${money(refundTotal)} = ${money(rec.hostFunded + refundTotal)} (pot ${money(rec.potTotal)})${rec.hostFunded + refundTotal === rec.potTotal ? " OK" : " MISMATCH"}`);
        }

        L.push("");
        L.push(line("-"));
        L.push("WINNERS AND TRANSACTIONS");
        L.push(line("-"));
        if (!rec.winners.length) {
            L.push("No entrants, no winners. No winner payout was made.");
        } else {
            L.push(`${padR("#", 3)} ${padR("User", 22)} ${padL("Guess", 6)} ${padL("Off", 5)} ${padL("Prize", 12)} ${padL("Donated", 12)} ${padL("Received", 12)}  Status`);
            rec.winners.forEach(w => {
                L.push(`${padR(w.place, 3)} ${padR(w.user, 22)} ${padL(w.guess, 6)} ${padL(w.gap, 5)} ${padL(money(w.gross), 12)} ${padL(money(w.donation), 12)} ${padL(money(w.net), 12)}  ${w.status}`);
            });
            const sumGross = rec.winners.reduce((s, w) => s + w.gross, 0);
            const sumNet = rec.winners.reduce((s, w) => s + w.net, 0);
            L.push(line("-"));
            L.push(`${padR("", 3)} ${padR("Totals", 22)} ${padL("", 6)} ${padL("", 5)} ${padL(money(sumGross), 12)} ${padL(money(rec.donationTotal), 12)} ${padL(money(sumNet), 12)}`);
            L.push("");
            L.push(`Check: winners received ${money(sumNet)} + fund ${money(rec.donationTotal)} = ${money(sumNet + rec.donationTotal)} (pot ${money(rec.potTotal)})${sumNet + rec.donationTotal === rec.potTotal ? " OK" : " MISMATCH"}`);
        }
        L.push("");
        L.push(`Gift verification: ${rec.verification}`);
        if (rec.notes && rec.notes.length) { L.push(""); rec.notes.forEach(n => L.push(`Note: ${n}`)); }
        L.push("");
        L.push(`Generated ${statementTimestamp(Date.now())} by DarkPeers BONanza Giveaway v${rec.scriptVersion}`);
        L.push(line());
        return L.join("\n");
    }

    function renderStatementControls({ selectLatest = false } = {}) {
        const row = document.getElementById("bonanzaStatementRow");
        const select = document.getElementById("bonanzaStatementSelect");
        if (!row || !select) return;
        const list = readStatements();
        if (!list.length) { row.style.display = "none"; return; }
        const previous = select.value;
        select.innerHTML = "";
        list.forEach((rec, i) => {
            const opt = document.createElement("option");
            opt.value = String(rec.id);
            const fund = rec.donationTotal > 0 ? ` | ${BONANZA.FUND_NAME} ${fmtBONCurrency(rec.donationTotal)} BON (${rec.donationPercent}%)` : " | no donation";
            opt.textContent = `${i === 0 ? "Latest: " : ""}${statementTimestamp(rec.endedAt)} | ${rec.host} | pot ${fmtBONCurrency(rec.potTotal)} BON${fund}`;
            select.appendChild(opt);
        });
        if (!selectLatest && previous && Array.from(select.options).some(o => o.value === previous)) select.value = previous;
        row.style.display = "block";
    }

    function getSelectedStatement() {
        const select = document.getElementById("bonanzaStatementSelect");
        const list = readStatements();
        if (!list.length) return null;
        const id = select ? select.value : null;
        return list.find(r => String(r.id) === String(id)) || list[0];
    }

    function downloadSelectedStatement() {
        const rec = getSelectedStatement();
        if (!rec) return;
        const text = buildStatementText(rec);
        try {
            const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = statementFilename(rec);
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            logEvent("Statement saved", statementFilename(rec));
        } catch (e) {
            logEvent("Statement save failed", String(e && e.message || e));
        }
    }

    async function copySelectedStatement() {
        const rec = getSelectedStatement();
        if (!rec) return;
        const text = buildStatementText(rec);
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                logEvent("Statement copied", "Copied to clipboard.");
                return;
            }
        } catch {}
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); logEvent("Statement copied", "Copied to clipboard."); } catch {}
        ta.remove();
    }

    function updateDonationHint() {
        if (!donationHint) return;
        const pct = normalizeDonationPercent(donationPercentInput ? donationPercentInput.value : 0);
        if (pct <= 0) {
            donationHint.innerHTML = riggedMode
                ? `Rigged mode is active, but the tax rate is <b>0%</b>. Suspiciously generous. No ${BONANZA.FUND_NAME} contribution.`
                : `Standard giveaway. No ${BONANZA.FUND_NAME} contribution.`;
            return;
        }
        const potRaw = coinInput ? String(coinInput.value || "").replace(/[^0-9]/g, "") : "";
        const pot = potRaw ? parseInt(potRaw, 10) : 0;
        const est = pot > 0 ? Math.floor(pot * pct / 100) : 0;
        const estText = pot > 0 ? ` About <b>${fmtBONCurrency(est)} BON</b> of a ${fmtBONCurrency(pot)} BON pot (more if sponsored).` : "";
        donationHint.innerHTML = riggedMode
            ? `🧾 <b style="color:#FF4F9A;">${pct}% rigging taxes</b> will be taken from the final pot (host + sponsors) and paid <b>directly</b> into the ${BONANZA.FUND_NAME}. Your outlay is unchanged.${estText}`
            : `<b style="color:${BONANZA.ACCENT_COLOR};">${pct}%</b> of the final pot (host + sponsors) will be contributed <b>directly</b> to the ${BONANZA.FUND_NAME}. Comes out of winnings; your outlay is unchanged.${estText}`;
    }

    function sendReminder(options = {}) {
        const force = !!(options && options.force);
        if (!force && !shouldSendReminder(giveawayData)) {
            // Try again in 15 seconds if still eligible
            if (!reminderRetryTimeout) {
                reminderRetryTimeout = setTimeout(() => {
                    reminderRetryTimeout = null;
                    sendReminder();
                }, 15000);
            }
            return;
        }
        // Clear retry timer if any
        if (reminderRetryTimeout) {
            clearTimeout(reminderRetryTimeout);
            reminderRetryTimeout = null;
        }

        const silentLine = silentNote("(Silent mode is enabled — command replies are sent via /msg.) 🤫");
        const rigLine = rigNote("(Rigged mode is currently enabled, but the math is [b]definitely[/b] still legit) 😉");
        const reminderPct = normalizeDonationPercent(giveawayData.donationPercent);
        const reminderPrefix = reminderPct > 0
            ? (riggedMode
                ? `🧾 [b][color=#FF4F9A]Rigging taxes: ${reminderPct}% to the ${BONANZA.FUND_NAME}[/color][/b] 🧾\n`
                : `💙 [b][color=${BONANZA.GIVEAWAY_COLOR}]${BONANZA.FUND_NAME} contribution giveaway (${reminderPct}% to the pool)[/color][/b] 💙\n`)
            : "";
        const reminderStartMarker = reminderPct > 0
            ? (riggedMode ? BRIDGE_MARKERS.START_TAXES : BRIDGE_MARKERS.START_POOL)
            : BRIDGE_MARKERS.START;
        const msg = reminderPrefix +
              `${bridgeMarker(reminderStartMarker, "🎁")} Ongoing giveaway for [b][color=#ffc00a]${fmtBONCurrency(cleanPotString(giveawayData.amount))} BON[/color][/b] | ` +
              `${buildWinnersAnnouncementLine(giveawayData)} | ` +
              `Time left: [b][color=#1DDC5D]${parseTime(giveawayData.timeLeft*1000)}[/color][/b]. ` +
              `Pick a number [b]between [color=#DC3D1D]${giveawayData.startNum} and ${giveawayData.endNum}[/color][/b]. ` +
              `[b][color=#5DE2E7]${giveawayData.customMessage}[/color][/b]\n` +
              `✨[b][color=#FB4F4F]Gift the host to add to the pot! [color=${GIFT_HINT_COLOR}]/gift ${getGiftSyntaxHostName()} AMOUNT MESSAGE[/color][/color][/b]✨` +
              silentLine +
              rigLine;
        sendMessage(msg);
    }

    // ───────────── HTTP-based BON gifting helper ─────────────

    /**
     * Per-giveaway ledger of (recipient, amount) tuples that have already been
     * attempted in this payout. Persisted to localStorage so:
     *   - A crash + restore can't replay payouts
     *   - A second tab that somehow ends the same giveaway can't double-pay
     * Keyed by giveawayId (millisecond start timestamp) + lowercase recipient + amount.
     */
    function getActiveGiveawayId() {
        // Prefer the start time of the currently-active giveaway. Falls back to
        // the snapshot's startTime field if needed. Returns null if neither exists,
        // in which case idempotency is best-effort (we still send, just don't track).
        if (giveawayStartTime) return giveawayStartTime.getTime();
        try {
            const raw = localStorage.getItem(LS_ACTIVE_GIVEAWAY);
            if (!raw) return null;
            const snap = JSON.parse(raw);
            return snap && snap.startTime ? snap.startTime : null;
        } catch { return null; }
    }

    function readPaidGiftsLedger() {
        try {
            const raw = localStorage.getItem(LS_PAID_GIFTS);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return (parsed && typeof parsed === "object") ? parsed : {};
        } catch { return {}; }
    }

    function writePaidGiftsLedger(ledger) {
        try {
            // Cap size by dropping oldest giveaway-id entries (numeric, ms timestamps)
            const ids = Object.keys(ledger).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
            while (ids.length > PAID_GIFTS_MAX_GIVEAWAYS) {
                const oldest = ids.shift();
                delete ledger[oldest];
            }
            localStorage.setItem(LS_PAID_GIFTS, JSON.stringify(ledger));
        } catch {}
    }

    function readPoolContributionLedger() {
        try {
            const raw = localStorage.getItem(LS_POOL_CONTRIBUTIONS);
            const parsed = raw ? JSON.parse(raw) : {};
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch { return {}; }
    }

    function writePoolContributionLedger(ledger) {
        try {
            const ids = Object.keys(ledger).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
            while (ids.length > PAID_GIFTS_MAX_GIVEAWAYS) delete ledger[ids.shift()];
            localStorage.setItem(LS_POOL_CONTRIBUTIONS, JSON.stringify(ledger));
        } catch {}
    }

    function savePoolContributionAttempt(giveawayId, record) {
        if (!giveawayId) return;
        const ledger = readPoolContributionLedger();
        ledger[String(giveawayId)] = { ...(ledger[String(giveawayId)] || {}), ...record };
        writePoolContributionLedger(ledger);
    }

    function getPoolContributionAttempt(giveawayId) {
        if (!giveawayId) return null;
        return readPoolContributionLedger()[String(giveawayId)] || null;
    }

    function parsePoolCounter(text, label) {
        const source = String(text || "");
        const needle = String(label || "");
        const pos = source.toLowerCase().indexOf(needle.toLowerCase());
        if (pos < 0) return null;
        const tail = source.slice(pos + needle.length);
        const m = tail.match(/[0-9][0-9.,\s]*/);
        if (!m) return null;
        const digits = m[0].replace(/[^0-9]/g, "");
        const n = parseInt(digits, 10);
        return Number.isFinite(n) ? n : null;
    }

    async function fetchBonPoolPage() {
        const url = new URL(BONANZA.POOL_PATH, location.origin);
        const res = await fetchWithTimeout(url, {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: { "Accept": "text/html" }
        }, BONANZA.FETCH_TIMEOUT_MS);
        if (!res.ok) throw new Error(`BON Pool GET failed: HTTP ${res.status}`);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        const text = (doc.body?.textContent || "").replace(/\u00a0/g, " ");
        const total = parsePoolCounter(text, "Total contributions:");
        const mine = parsePoolCounter(text, "Your contribution:");
        const form = Array.from(doc.querySelectorAll("form")).find(el => {
            try {
                const u = new URL(el.getAttribute("action") || "", location.origin);
                return u.origin === location.origin && u.pathname === BONANZA.POOL_STORE_PATH;
            } catch { return false; }
        });
        if (!form || total == null || mine == null) throw new Error("Could not parse BON Pool form/counters.");
        const action = new URL(form.getAttribute("action") || BONANZA.POOL_STORE_PATH, location.origin);
        return { form, action: action.href, total, mine };
    }

    function urlEncodedDataFromParsedForm(form) {
        const data = new URLSearchParams();
        form.querySelectorAll("input, select, textarea").forEach(el => {
            if (!el.name || el.disabled) return;
            const type = String(el.type || "").toLowerCase();
            if ((type === "radio" || type === "checkbox") && !el.checked) return;
            data.append(el.name, el.value ?? "");
        });
        return data;
    }

    async function verifyBonPoolContribution(record) {
        const targetMine = Number(record.beforeMine) + Number(record.amount);
        const targetTotal = Number(record.beforeTotal) + Number(record.amount);
        let last = null;
        for (let i = 0; i < BONANZA.VERIFY_ATTEMPTS; i++) {
            if (i > 0) await new Promise(resolve => setTimeout(resolve, BONANZA.VERIFY_DELAY_MS));
            try {
                last = await fetchBonPoolPage();
                if (last.mine >= targetMine && last.total >= targetTotal) return { confirmed: true, snapshot: last };
            } catch (e) {
                logEvent("BON Pool verify retry", String(e?.message || e));
            }
        }
        return { confirmed: false, snapshot: last };
    }

    async function contributeBonPool(amount) {
        const safeAmount = Math.floor(Number(amount));
        if (!Number.isFinite(safeAmount) || safeAmount <= 0) return { attempted: false, confirmed: false, reason: "invalid" };
        const giveawayId = getActiveGiveawayId();
        if (!giveawayId) return { attempted: false, confirmed: false, reason: "missing-giveaway-id" };
    
        const existing = getPoolContributionAttempt(giveawayId);
        if (existing) {
            if (existing.amount !== safeAmount) return { attempted: false, confirmed: false, reason: "amount-conflict" };
            if (existing.status === "confirmed") return { attempted: false, confirmed: true, reason: "already-confirmed", reused: true };
            const checked = await verifyBonPoolContribution(existing);
            if (checked.confirmed) {
                savePoolContributionAttempt(giveawayId, {
                    status: "confirmed",
                    confirmedAt: Date.now(),
                    afterMine: checked.snapshot.mine,
                    afterTotal: checked.snapshot.total
                });
                return { attempted: false, confirmed: true, reason: "verified-existing", reused: true };
            }
            return { attempted: false, confirmed: false, reason: "existing-unconfirmed", reused: true };
        }
    
        let before;
        try {
            before = await fetchBonPoolPage();
        } catch (e) {
            logEvent("BON Pool contribution aborted", String(e?.message || e));
            return { attempted: false, confirmed: false, reason: "preflight-failed" };
        }
    
        const record = {
            amount: safeAmount,
            beforeMine: before.mine,
            beforeTotal: before.total,
            attemptedAt: Date.now(),
            status: "attempted"
        };
        savePoolContributionAttempt(giveawayId, record);
    
        const data = urlEncodedDataFromParsedForm(before.form);
        data.set("type", "bon");
        data.set("contribution", String(safeAmount));
        data.set("contributionTokens", "");
        data.set("anon", "0");
    
        try {
            const res = await fetchWithTimeout(before.action, {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                redirect: "follow",
                headers: {
                    "Accept": "text/html",
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                },
                body: data.toString()
            }, BONANZA.FETCH_TIMEOUT_MS);
            savePoolContributionAttempt(giveawayId, {
                httpStatus: res.status,
                postFinishedAt: Date.now(),
                status: res.ok ? "posted" : "posted-http-error"
            });
        } catch (e) {
            savePoolContributionAttempt(giveawayId, {
                postError: String(e?.message || e),
                status: "post-uncertain"
            });
        }
    
        const checked = await verifyBonPoolContribution(record);
        if (checked.confirmed) {
            savePoolContributionAttempt(giveawayId, {
                status: "confirmed",
                confirmedAt: Date.now(),
                afterMine: checked.snapshot.mine,
                afterTotal: checked.snapshot.total
            });
            logEvent(
                "BON Pool contribution confirmed",
                `${fmtBONCurrency(safeAmount)} BON | Mine ${fmtBONCurrency(before.mine)} -> ${fmtBONCurrency(checked.snapshot.mine)} | Total ${fmtBONCurrency(before.total)} -> ${fmtBONCurrency(checked.snapshot.total)}`
            );
            return { attempted: true, confirmed: true, before, after: checked.snapshot };
        }
    
        savePoolContributionAttempt(giveawayId, { status: "unconfirmed", verifyFinishedAt: Date.now() });
        return { attempted: true, confirmed: false, reason: "not-confirmed", before, after: checked.snapshot };
    }

    // Winner gifts use the gift ledger. BON Pool contributions have their own
    // persisted ledger and are verified against /bon-pool counters.
    const GIFT_PURPOSE = Object.freeze({
        WINNER: "winner",
        SPONSOR_REFUND: "sponsor-refund"
    });
    const SPONSOR_REFUND_NOTE = "Giveaway refund";

    function paidGiftKey(recipient, amount, purpose = GIFT_PURPOSE.WINNER) {
        return `${String(recipient || "").trim().toLowerCase()}::${Math.floor(Number(amount) || 0)}::${purpose}`;
    }

    /** Returns true if this (recipient, amount, purpose) was already attempted for this giveaway. */
    function hasGiftBeenAttempted(giveawayId, recipient, amount, purpose) {
        if (!giveawayId) return false;
        const ledger = readPaidGiftsLedger();
        const bucket = ledger[giveawayId];
        if (!bucket) return false;
        return !!bucket[paidGiftKey(recipient, amount, purpose)];
    }

    /** Record a (recipient, amount, purpose) attempt before actually sending. */
    function recordGiftAttempt(giveawayId, recipient, amount, purpose) {
        if (!giveawayId) return;
        const ledger = readPaidGiftsLedger();
        if (!ledger[giveawayId]) ledger[giveawayId] = {};
        ledger[giveawayId][paidGiftKey(recipient, amount, purpose)] = Date.now();
        writePaidGiftsLedger(ledger);
    }

    /**
     * Try to send BON using the site's HTTP gift endpoint.
     *
     * Idempotency: if this exact (recipient, amount) has already been attempted
     * for the current giveaway (in this tab, another tab, or a previous session),
     * the call is a no-op. The host can verify in the gift-status column / chat.
     *
     * Fallback policy: we ONLY fall back to /gift when we have strong evidence
     * the server rejected the request without processing it (specific 4xx codes
     * that mean "input/auth was bad"). We do NOT fall back on:
     *   - network errors / aborted requests (server may have processed it)
     *   - 5xx server errors (server may have processed it then failed to respond)
     *   - 408 / 429 (timeout / rate-limit — request may or may not have landed)
     * In those cases we leave it to verifyWinnerGifts to confirm; if verification
     * fails the host gets a warning and can resend manually. Better to under-pay
     * and warn than to over-pay silently.
     */
    async function giftBon(recipient, amount, messageText, purpose = GIFT_PURPOSE.WINNER) {
        const safeRecipient = (recipient || "").trim();
        const numericAmount = Math.floor(Number(amount));
        const safeMessage = (messageText || "").trim();

        if (!safeRecipient || !Number.isFinite(numericAmount) || numericAmount <= 0) {
            return { attempted: false, reason: "invalid" };
        }
        const safeAmount = numericAmount;

        // ── Idempotency check ─────────────────────────────────────────────
        const giveawayId = getActiveGiveawayId();
        if (hasGiftBeenAttempted(giveawayId, safeRecipient, safeAmount, purpose)) {
            logEvent(
                "Gift skipped (duplicate)",
                `Already attempted: ${sanitizeNick(safeRecipient)} for ${fmtBONCurrency(safeAmount)} BON (${purpose}) in this giveaway.`
            );
            return { attempted: false, reason: "duplicate" };
        }
        // Record BEFORE sending — if the send half-completes we still want
        // future calls (this tab, another tab, post-restore) to skip.
        recordGiftAttempt(giveawayId, safeRecipient, safeAmount, purpose);

        async function fallbackToChat() {
            const cmd = safeMessage
                ? `/gift ${safeRecipient} ${safeAmount} ${safeMessage}`
                : `/gift ${safeRecipient} ${safeAmount}`;
            await sendMessage(cmd);
        }

        const csrfMeta = document.querySelector('meta[name="csrf-token"]');
        const csrfToken = csrfMeta && csrfMeta.content ? csrfMeta.content : null;

        // Resolve UNIT3D's sender-scoped gift route:
        // /users/{authenticated-user}/gifts. The recipient itself is carried in
        // recipient_username, so never derive this URL from an arbitrary visible user.
        let giftUrl = null;
        const senderSlug = getAuthenticatedUserSlug();
        if (senderSlug) {
            const endpointPath = getGiftEndpointPath(senderSlug);
            giftUrl = endpointPath ? (location.origin + endpointPath) : null;
        }

        // If we can't resolve the HTTP endpoint or token, fall back immediately.
        // This is safe: we haven't sent anything yet, so /gift is the first attempt.
        if (!csrfToken || !giftUrl) {
            await fallbackToChat();
            return { attempted: true, transport: "chat" };
        }

        const formData = new FormData();
        formData.append("_token", csrfToken);
        formData.append("recipient_username", safeRecipient);

        formData.append("type", "bon");

        formData.append("bon", String(safeAmount));
        formData.append("message", safeMessage);

        // Codes that mean "server definitely did not process this gift":
        //   400 bad request, 401 unauthorized, 403 forbidden, 404 not found,
        //   422 unprocessable entity. Safe to fall back to /gift.
        // Notably NOT in this list: 408 (timeout), 429 (rate limit), 5xx,
        // and network errors — for those we trust verifyWinnerGifts to flag
        // any actually-missing gifts.
        const SAFE_FALLBACK_STATUSES = new Set([400, 401, 403, 404, 422]);

        try {
            const resp = await fetchWithTimeout(giftUrl, {
                method: "POST",
                credentials: "same-origin",
                body: formData
            }, 10_000);

            if (resp && SAFE_FALLBACK_STATUSES.has(resp.status)) {
                logEvent(
                    "Gift HTTP rejected, falling back",
                    `${sanitizeNick(safeRecipient)} ${fmtBONCurrency(safeAmount)} BON | status=${resp.status}`
                );
                await fallbackToChat();
                return { attempted: true, transport: "chat-fallback", httpStatus: resp.status };
            }

            if (!resp || resp.status >= 400) {
                // Ambiguous failure — server may or may not have processed it.
                // Do NOT fall back. verifyWinnerGifts will confirm via chat API.
                logEvent(
                    "Gift HTTP ambiguous (no fallback)",
                    `${sanitizeNick(safeRecipient)} ${fmtBONCurrency(safeAmount)} BON | status=${resp ? resp.status : "no-response"} | will verify via chat poll`
                );
                return { attempted: true, transport: "http-ambiguous", httpStatus: resp ? resp.status : null };
            }

            return { attempted: true, transport: "http", httpStatus: resp.status };
        } catch (e) {
            // A thrown fetch/network error is ambiguous: the server may have received
            // the request. Do NOT replay it via /gift; let verification decide.
            logEvent(
                "Gift HTTP network error (no fallback)",
                `${sanitizeNick(safeRecipient)} ${fmtBONCurrency(safeAmount)} BON | ${e && e.message ? e.message : "unknown error"} | will verify via chat poll`
            );
            return { attempted: true, transport: "http-ambiguous", error: e && e.message ? e.message : "unknown" };
        }
    }

    // Chat formatting: use spaces as thousands separators in outgoing messages.
    // (Menu/UI formatting is intentionally left alone.)
    function formatChatNumbersWithSpaces(str) {
        try {
            if (!str) return str;

            const raw = String(str);
            // Quick bailout: nothing that looks like a 4+ digit number or grouped digits.
            if (!/\d{4}/.test(raw) && !/\d{1,3}[,\s'’]\d{3}/.test(raw)) return raw;

            // Protect URL segments and BBCode tags/attributes from numeric formatting.
            // This keeps [tag=...], [url=...], and color hexes untouched.
            const protectedParts = [];
            const protectedText = raw.replace(/\[[^\]]*\]|https?:\/\/[^\s\]]+|#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g, (segment) => {
                const idx = protectedParts.push(segment) - 1;
                return `__BG_PROTECTED_${idx}__`;
            });

            const formatted = protectedText.replace(/\b\d[\d,\s'’]*\d\b/g, (match) => {
                const digits = match.replace(/[^\d]/g, "");
                if (digits.length < 4) return match;
                return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            });

            return formatted.replace(/__BG_PROTECTED_(\d+)__/g, (_, i) => protectedParts[Number(i)] ?? "");
        } catch {
            return str;
        }
    }
    async function sendPrivateMessage(username, messageStr) {
        const to = String(username || "").trim();
        if (!to) {
            // No target → fall back to normal chat output
            return sendMessage(messageStr);
        }

        let body = String(messageStr ?? "");

        // Preserve the "spaces for thousands separators" behavior in silent mode by applying the
        // formatter to the message body BEFORE we wrap it in /msg (sendMessage skips formatting for slash commands).
        try {
            body = formatChatNumbersWithSpaces(body);
        } catch { /* ignore */ }

        // Avoid newlines which can confuse slash-command parsers
        body = body.replace(/[\r\n]+/g, " ").trim();

        return sendMessage(`/msg ${to} ${body}`);
    }

    async function sendCommandResponse(username, messageStr) {
        if (GENERAL_SETTINGS.silent_mode) {
            return sendPrivateMessage(username, messageStr);
        }
        return sendMessage(messageStr);
    }

    /** Prepare a message for sending: obfuscate "giveaway" and apply number formatting. */
    function prepareOutgoingMessage(messageStr) {
        // Obfuscate "giveaway" in all messages except the intro announcement
        if (!(messageStr.includes("I am hosting a giveaway for") &&
              messageStr.includes("Pick a number between"))) {
            messageStr = obfuscateGiveaway(messageStr);
        }

        // Apply chat-only number formatting (spaces for thousands separators).
        // Never touch slash-commands (e.g., /gift) since the site expects raw digits.
        try {
            const trimmed = String(messageStr || "").trimStart();
            if (!trimmed.startsWith("/")) {
                messageStr = formatChatNumbersWithSpaces(messageStr);
            }
        } catch { /* ignore */ }

        return messageStr;
    }

    /** Try to send via API POST. Returns true on success, false otherwise. */
    async function trySendViaApi(messageStr) {
        if (!OT_USER_ID || !OT_CHATROOM_ID || !OT_CSRF_TOKEN) return false;

        const payload = {
            bot_id: null,
            chatroom_id: Number(OT_CHATROOM_ID),
            message: messageStr,
            receiver_id: null,
            save: true,
            targeted: 0,
            user_id: Number(OT_USER_ID)
        };

        const resp = await fetchWithTimeout(`/api/chat/messages`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": OT_CSRF_TOKEN,
                "X-Requested-With": "XMLHttpRequest"
            },
            body: JSON.stringify(payload)
        }, 7000);

        const respText = await resp.text();
        if (resp.ok) {
            if (DEBUG_SETTINGS.log_chat_messages) console.log(`API send: ${messageStr}`);
            if (DEBUG_SETTINGS.verify_sendmessage) console.debug("sendMessage: API message sent successfully");
            return true;
        }

        try { console.error("API error", JSON.parse(respText)); }
        catch (e) { console.error("API error (raw):", respText); }
        return false;
    }

    /** Legacy fallback: inject message into the chatbox input and simulate Enter. */
    function sendViaChatbox(messageStr) {
        if (!chatbox) return;
        if (DEBUG_SETTINGS.log_chat_messages) console.log(`Fallback send (chatbox): ${messageStr}`);
        if (DEBUG_SETTINGS.verify_sendmessage) console.debug("sendMessage: sending message via chatbox fallback");

        const originalValue = chatbox.value;
        chatbox.value = messageStr;
        chatbox.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

        setTimeout(() => {
            chatbox.value = originalValue;
            if (DEBUG_SETTINGS.verify_sendmessage) console.debug("sendMessage: restored chatbox original value");
        }, 50);
    }

    async function sendMessage(messageStr) {
        messageStr = prepareOutgoingMessage(messageStr);

        if (DEBUG_SETTINGS.disable_chat_output) return;

        if (DEBUG_SETTINGS.verify_sendmessage) console.debug("sendMessage: caching chat context if needed");

        // If cache is missing, try to refresh
        if (!OT_USER_ID || !OT_CHATROOM_ID || !OT_CSRF_TOKEN) cacheChatContext();

        // --- Attempt API POST, fall back to chatbox on failure ---
        if (!DEBUG_SETTINGS.suppressApiMessages) {
            try {
                if (await trySendViaApi(messageStr)) return;
            } catch (e) {
                if (DEBUG_SETTINGS.log_chat_messages) console.warn("API send failed, falling back to chatbox method:", e);
                if (DEBUG_SETTINGS.verify_sendmessage) console.debug("sendMessage: API send failed, falling back to chatbox method");
            }
        }

        sendViaChatbox(messageStr);
    }

    function countdownTimer (display, giveawayData) {
        display.hidden = false;

        const timerID = setInterval(() => {
            const now = Date.now();
            const msLeft = giveawayData.endTs - now;
            giveawayData.timeLeft = Math.max(Math.ceil(msLeft / 1000), 0);

            // update MM:SS
            const m = Math.floor(giveawayData.timeLeft / 60);
            const s = giveawayData.timeLeft % 60;
            display.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");

            // finish conditions
            if (giveawayData.timeLeft === 0) return endGiveaway();
            if (numberEntries.size === giveawayData.totalEntries) {
                sendMessage(`All [b][color=#ffc00a]${giveawayData.totalEntries}[/color][/b] slot(s) filled! Ending early with ` +
                            `[b][color=#1DDC5D]${parseTime(msLeft)}[/color][/b] remaining!`);
                return endGiveaway();
            }

            // automatic reminders (based on time *remaining* until end)
            const msToNext = nextReminderMs(giveawayData.reminderSchedule, msLeft);
            if (msToNext !== null && msToNext <= 1000) {
                // Consume this slot so retries (if any) don't double-send.
                if (giveawayData.reminderSchedule && giveawayData.reminderSchedule.length) {
                    giveawayData.reminderSchedule.shift();
                }
                sendReminder();
            }
        }, 1000);

        return timerID;
    }


    // Inserts a zero-width space after the first character
    function sanitizeNick(nick) {
        if (typeof nick !== "string" || nick.length < 2) return nick;
        return nick[0] + "\u200B" + nick.slice(1);
    }

    // Normalize usernames to a stable, case-insensitive key used for comparisons and map keys.
    // - trims whitespace
    // - strips a leading @ (common in mentions)
    // - lowercases
    function normalizeUserKey(name) {
        return String(name || "")
            .trim()
            .replace(/^@+/, "")
            .toLowerCase();
    }

    // Best-effort: derive the logged-in username from the navbar /users/<name> link
    // so it matches what getAuthor() extracts from chat messages.
    function getLoggedInUsername() {
        const navLink = document.querySelector('.top-nav__username a[href*="/users/"]');
        if (navLink) {
            const href = navLink.getAttribute("href") || navLink.href || "";
            const m = href.match(/\/users\/([^/?#]+)/i);
            if (m && m[1]) {
                try { return decodeURIComponent(m[1]); } catch (_) { return m[1]; }
            }
        }

        const t = document.querySelector('.top-nav__username a')?.textContent || "";
        return String(t || "").trim();
    }

    // Returns a set of possible "self" keys (host + logged-in user).
    // We use a set because some sites display a different name than they use in /users/<...> links.
    function resolveSelfKeys(hostName) {
        const keys = new Set();
        const a = normalizeUserKey(hostName);
        if (a) keys.add(a);
        const b = normalizeUserKey(getLoggedInUsername());
        if (b) keys.add(b);
        return keys;
    }

    function obfuscateGiveaway(text) {
        return text.replace(/giveaway/gi, match => {
            return match[0] + "\u200B" + match.slice(1); // g + zero-width + iveaway
        });
    }

    // ───────────────────────────────
    // Persistent stats (localStorage)
    // ───────────────────────────────

    function defaultGiveawayStats() {
        return { version: 1, users: {}, giveaways: [], updatedAt: 0 };
    }


    // Write-behind stats cache (reduces GM/localStorage churn during busy giveaways)
    // - Commands prefer the in-memory cache so results reflect live updates immediately.
    // - Flush happens automatically after a short delay, and is forced on giveaway end/unload.
    const STATS_WRITE_BEHIND_MS = 1500;
    let _statsCache = null;
    let _statsDirty = false;
    let _statsFlushTimer = null;

    function getStatsCached() {
        if (_statsCache) return _statsCache;
        _statsCache = loadGiveawayStats();
        return _statsCache;
    }

    function getStatsForRead() {
        // Prefer in-memory cache so commands reflect latest live updates
        return _statsCache || loadGiveawayStats();
    }

    function scheduleStatsFlush(ms = STATS_WRITE_BEHIND_MS) {
        if (_statsFlushTimer) return;
        _statsFlushTimer = setTimeout(() => {
            _statsFlushTimer = null;
            flushStatsNow();
        }, ms);
    }

    function markStatsDirty() {
        _statsDirty = true;
        scheduleStatsFlush();
    }

    function flushStatsNow() {
        try {
            if (_statsFlushTimer) {
                clearTimeout(_statsFlushTimer);
                _statsFlushTimer = null;
            }
            if (!_statsDirty) return;
            const stats = _statsCache || loadGiveawayStats();
            _statsCache = stats;
            saveGiveawayStats(stats);
            _statsDirty = false;
        } catch {
            // If something goes wrong (or during early init), fail closed.
        }
    }

    function normalizeGiveawayStatsShape(stats) {
        if (!stats || typeof stats !== "object") return defaultGiveawayStats();

        if (!stats.users || typeof stats.users !== "object") stats.users = {};
        if (!Array.isArray(stats.giveaways)) stats.giveaways = [];

        if (typeof stats.version !== "number") stats.version = STATS_VERSION;
        if (typeof stats.updatedAt !== "number") stats.updatedAt = 0;

        return stats;
    }

    function safeParseLocalStorage(key) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const obj = JSON.parse(raw);
            return obj && typeof obj === "object" ? obj : null;
        } catch {
            return null;
        }
    }

    function safeGetUpdatedAt(obj) {
        const n = obj && typeof obj.updatedAt === "number" ? obj.updatedAt : 0;
        return Number.isFinite(n) ? n : 0;
    }

    /**
     * One-time migration for hosts who ran fork versions 1.0.1 - 1.1.0, which kept
     * stats under a private key. Folds that record into the shared one (counters
     * added, giveaways de-duplicated by end time) and removes the private key.
     */
    function migrateLegacyForkStats() {
        let legacy = null;
        try { legacy = safeParseLocalStorage(STATS_KEY_LS_LEGACY_FORK); } catch {}
        if (!legacy) return;
        try {
            const shared = safeParseLocalStorage(STATS_KEY_LS);
            if (!shared) {
                // Nothing to merge into: the private record simply becomes the shared one.
                localStorage.setItem(STATS_KEY_LS, JSON.stringify(normalizeGiveawayStatsShape(legacy)));
            } else {
                const target = normalizeGiveawayStatsShape(shared);
                const source = normalizeGiveawayStatsShape(legacy);

                const seen = new Set((target.giveaways || []).map(g => `${g.endedAt}|${g.host}|${g.amount}`));
                for (const g of (source.giveaways || [])) {
                    const k = `${g.endedAt}|${g.host}|${g.amount}`;
                    if (!seen.has(k)) { target.giveaways.push(g); seen.add(k); }
                }
                target.giveaways.sort((a, b) => (a.endedAt || 0) - (b.endedAt || 0));

                const MAX_FIELDS = new Set(["biggestWin", "biggestSponsor", "lastSeenAt"]);
                for (const [key, srcRec] of Object.entries(source.users || {})) {
                    if (!srcRec || typeof srcRec !== "object") continue;
                    const dst = target.users[key];
                    if (!dst) { target.users[key] = srcRec; continue; }
                    for (const [field, val] of Object.entries(srcRec)) {
                        if (typeof val !== "number") continue;
                        if (MAX_FIELDS.has(field)) dst[field] = Math.max(Number(dst[field]) || 0, val);
                        else dst[field] = (Number(dst[field]) || 0) + val;
                    }
                    if (srcRec.name && (srcRec.lastSeenAt || 0) >= (dst.lastSeenAt || 0)) dst.name = srcRec.name;
                }
                target.updatedAt = Date.now();
                localStorage.setItem(STATS_KEY_LS, JSON.stringify(target));
            }
            localStorage.removeItem(STATS_KEY_LS_LEGACY_FORK);
            console.info("[DarkPeers BONanza Giveaway] Merged pre-1.2.0 fork stats into the shared stats record.");
        } catch (e) {
            console.warn("[DarkPeers BONanza Giveaway] Legacy stats merge failed; leaving both records untouched.", e);
        }
    }

    function loadGiveawayStats() {
        migrateLegacyForkStats();

        // Read both locations
        const gmVal = (typeof GM_getValue === "function") ? GM_getValue(STATS_KEY_GM, null) : null;
        const gmObj = (gmVal && typeof gmVal === "object") ? normalizeGiveawayStatsShape(gmVal) : null;

        const lsRaw = safeParseLocalStorage(STATS_KEY_LS);
        const lsObj = lsRaw ? normalizeGiveawayStatsShape(lsRaw) : null;

        // If both missing/corrupt
        if (!gmObj && !lsObj) {
            const fresh = defaultGiveawayStats();
            // Seed both so they stay in sync from day 1
            if (typeof GM_setValue === "function") GM_setValue(STATS_KEY_GM, fresh);
            try { localStorage.setItem(STATS_KEY_LS, JSON.stringify(fresh)); } catch {}
            return fresh;
        }

        // Choose the newest
        const gmUpdated = safeGetUpdatedAt(gmObj);
        const lsUpdated = safeGetUpdatedAt(lsObj);
        const best = (gmUpdated >= lsUpdated) ? (gmObj || lsObj) : (lsObj || gmObj);

        // Heal the other side if needed
        if (best) {
            if (!gmObj || gmUpdated < safeGetUpdatedAt(best)) {
                if (typeof GM_setValue === "function") GM_setValue(STATS_KEY_GM, best);
            }
            if (!lsObj || lsUpdated < safeGetUpdatedAt(best)) {
                try { localStorage.setItem(STATS_KEY_LS, JSON.stringify(best)); } catch {}
            }
            return best;
        }

        // Absolute fallback
        return defaultGiveawayStats();
    }

    function saveGiveawayStats(stats) {
        if (!stats || typeof stats !== "object") return;
        stats.updatedAt = Date.now();

        // Write GM
        if (typeof GM_setValue === "function") {
            GM_setValue(STATS_KEY_GM, stats);
        }

        // Write localStorage
        try {
            localStorage.setItem(STATS_KEY_LS, JSON.stringify(stats));
        } catch {
            // If LS quota is exceeded or blocked, we still at least have GM storage.
        }
    }

    function getNonHostSponsorContributions(data) {
        if (!data || !data.sponsorContribs || typeof data.sponsorContribs !== "object") return [];

        const hostKey = normalizeUserKey(data.host);
        const grouped = new Map();

        for (const [rawName, rawAmount] of Object.entries(data.sponsorContribs)) {
            const name = String(rawName || "").trim();
            const key = normalizeUserKey(name);
            const amount = Math.max(0, Math.floor(Number(rawAmount) || 0));
            if (!key || key === hostKey || amount <= 0) continue;

            if (!grouped.has(key)) grouped.set(key, { name, amount: 0 });
            grouped.get(key).amount += amount;
        }

        return Array.from(grouped.values()).sort((a, b) =>
            (b.amount - a.amount) ||
            a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        );
    }

    function sumSponsorContribs(contribs, hostName) {
        if (!contribs || typeof contribs !== "object") return 0;
        const hostKey = hostName ? normUserKey(hostName) : null;

        let sum = 0;
        for (const [name, v] of Object.entries(contribs)) {
            if (hostKey && normUserKey(name) === hostKey) continue; // ignore host self-gifting
            sum += Math.max(0, Math.floor(Number(v) || 0));
        }
        return sum;
    }

    function normUserKey(name) {
        // Back-compat alias used throughout the script. Keep behavior consistent with normalizeUserKey().
        return normalizeUserKey(name);
    }

    function getOrCreateUserStats(stats, username) {
        const key = normUserKey(username);
        if (!key) return null;

        if (!stats.users[key]) {
            stats.users[key] = {
                name: String(username || "").trim() || key,
                entered: 0,
                wins: 0,
                losses: 0,
                totalWon: 0,
                biggestWin: 0,
                sponsoredTotal: 0,
                sponsorCount: 0,
                biggestSponsor: 0,
                hosted: 0,
                hostedTotal: 0,
                lastSeenAt: 0,
                sponsorReceivedTotal: 0
            };
        } else if (username) {
            // keep most recently seen casing
            stats.users[key].name = String(username).trim() || stats.users[key].name;
        }
        return stats.users[key];
    }
    function recordLiveEntry(username) {
        const key = normUserKey(username);
        if (!key) return;
        if (liveEnteredThisGiveaway.has(key)) return;

        liveEnteredThisGiveaway.add(key);

        const stats = getStatsCached();
        const rec = getOrCreateUserStats(stats, username);
        if (!rec) return;

        rec.entered = (rec.entered || 0) + 1;
        rec.lastSeenAt = Date.now();

        markStatsDirty();
    }

    function recordLiveSponsorGift(gifter, amount) {
        const key = normUserKey(gifter);
        const delta = Math.max(0, Math.floor(Number(amount) || 0));
        if (!key || !delta) return;

        // track running total for "biggestSponsor" per giveaway
        const prevTotal = liveSponsorTotalThisGiveaway.get(key) || 0;
        const nowTotal = prevTotal + delta;
        liveSponsorTotalThisGiveaway.set(key, nowTotal);

        const stats = getStatsCached();
        const rec = getOrCreateUserStats(stats, gifter);
        if (!rec) return;

        rec.sponsoredTotal = (rec.sponsoredTotal || 0) + delta;

        // Count “how many giveaways they sponsored” once per giveaway
        if (!liveSponsorSeenThisGiveaway.has(key)) {
            liveSponsorSeenThisGiveaway.add(key);
            rec.sponsorCount = (rec.sponsorCount || 0) + 1;
        }

        // biggestSponsor = biggest total they added in any single giveaway
        rec.biggestSponsor = Math.max(rec.biggestSponsor || 0, nowTotal);

        rec.lastSeenAt = Date.now();
        markStatsDirty();
    }

    function recordGiveawayStats(giveawayData, winners, allocated, entriesMap, donation = null, settlement = {}) {
        if (!giveawayData) return;
        const donatedTotal = donation && donation.total > 0 && donation.confirmed ? Math.floor(donation.total) : 0;
        const donationPercent = donation && donation.total > 0 ? donation.percent : 0;
        const sponsorRefundedTotal = Math.max(0, Math.floor(Number(settlement?.sponsorRefundedTotal) || 0));

        const stats = getStatsCached();
        const now = Date.now();

        // Giveaway totals (for host stats + !largest)
        const potTotal = Math.max(0, Math.floor(Number(giveawayData.amount) || 0));

        // Total non-host sponsor BON for this giveaway (exclude host self-gifting)
        const sponsorTotal = sumSponsorContribs(giveawayData.sponsorContribs, giveawayData.host);

        // Prefer explicit hostAdded (new behavior)
        let hostOnly = giveawayData.hostAdded;
        hostOnly = Number.isFinite(hostOnly) ? Math.max(0, Math.floor(hostOnly)) : null;

        // Back-compat fallback for older giveaways that don’t have hostAdded saved
        if (hostOnly === null) {
            hostOnly = Math.max(0, potTotal - sponsorTotal);
        }

        // Record giveaway history (per-site) for !largest
        try {
            if (!Array.isArray(stats.giveaways)) stats.giveaways = [];
            stats.giveaways.push({
                amount: potTotal,
                host: String(giveawayData.host || "").trim(),
                hostOnly,
                sponsorTotal,
                sponsorRefundedTotal,
                winners: Array.isArray(winners) ? winners.length : 0,
                entries: entriesMap ? entriesMap.size : 0,
                donationPercent,
                donatedTotal,
                poolConfirmed: !!(donation && donation.confirmed),
                endedAt: now,
                endedDate: (new Date(now)).toLocaleDateString("en-CA")
            });

            const MAX_HISTORY = 250;
            if (stats.giveaways.length > MAX_HISTORY) {
                stats.giveaways = stats.giveaways.slice(-MAX_HISTORY);
            }
        } catch (e) { /* ignore */ }

        // Host tracking
        const hostRec = getOrCreateUserStats(stats, giveawayData.host);
        if (hostRec) {
            hostRec.hosted = (hostRec.hosted || 0) + 1;

            // Host pot only (excludes sponsors)
            hostRec.hostedTotal = (hostRec.hostedTotal || 0) + hostOnly;

            // Total sponsor BON the host actually retained across hosted giveaways.
            // A zero-entry / 0%-Pool settlement can return sponsor gifts in full.
            const sponsorRetainedTotal = Math.max(0, sponsorTotal - sponsorRefundedTotal);
            if (sponsorRetainedTotal > 0) {
                hostRec.sponsorReceivedTotal = (hostRec.sponsorReceivedTotal || 0) + sponsorRetainedTotal;
            }

            // BON Pool contributions generated by this host's giveaways
            if (donatedTotal > 0) {
                hostRec.fundDonatedTotal = (hostRec.fundDonatedTotal || 0) + donatedTotal;
                hostRec.fundDonationCount = (hostRec.fundDonationCount || 0) + 1;
            }

            hostRec.lastSeenAt = now;
        }

        // Sponsors (per giveaway; uses sponsorContribs totals)
        if (giveawayData.sponsorContribs && typeof giveawayData.sponsorContribs === "object") {
            for (const [sponsor, amt] of Object.entries(giveawayData.sponsorContribs)) {
                const finalTotal = Math.max(0, Math.floor(Number(amt) || 0));
                if (!sponsor || !finalTotal) continue;

                const sKey = normUserKey(sponsor);
                const alreadyCounted = liveSponsorTotalThisGiveaway.get(sKey) || 0;
                const delta = Math.max(0, finalTotal - alreadyCounted);

                const rec = getOrCreateUserStats(stats, sponsor);
                if (!rec) continue;

                if (delta > 0) rec.sponsoredTotal += delta;

                if (!liveSponsorSeenThisGiveaway.has(sKey)) {
                    rec.sponsorCount += 1;
                }

                rec.biggestSponsor = Math.max(rec.biggestSponsor || 0, finalTotal);
                rec.lastSeenAt = now;
            }
        }

        // Winners + payouts
        const winKeySet = new Set((winners || []).map(w => normUserKey(w.author)));
        const payoutByKey = new Map();

        (winners || []).forEach((w, i) => {
            const key = normUserKey(w.author);
            const pay = Math.max(0, Math.floor(Number((allocated || [])[i]) || 0));
            if (!key) return;
            payoutByKey.set(key, (payoutByKey.get(key) || 0) + pay);
        });

        // Participants
        const participants = entriesMap ? Array.from(entriesMap.keys()) : [];
        participants.forEach(name => {
            const rec = getOrCreateUserStats(stats, name);
            if (!rec) return;

            const uKey = normUserKey(name);

            if (!liveEnteredThisGiveaway.has(uKey)) {
                rec.entered += 1;
            }

            if (winKeySet.has(uKey)) {
                rec.wins += 1;
                const pay = payoutByKey.get(uKey) || 0;
                rec.totalWon += pay;
                rec.biggestWin = Math.max(rec.biggestWin || 0, pay);
            } else {
                rec.losses += 1;
            }
            rec.lastSeenAt = now;
        });

        markStatsDirty();
        flushStatsNow();

    }

    function getLeaderboardRows(sorter, topN, filterFn) {
        const stats = getStatsForRead();
        const users = Object.values(stats.users || {})
        .filter(u => u && typeof u === "object")
        .filter(u => (filterFn ? filterFn(u) : true))
        .sort(sorter);

        return users.slice(0, topN);
    }

    function fmtBON(value) {
        let n;
        if (typeof value === "number") {
            n = Math.max(0, Math.floor(value));
        } else {
            const digitsOnly = String(value ?? "").replace(/[^\d]/g, "");
            n = Number.isNaN(parseInt(digitsOnly || "0", 10)) ? 0 : parseInt(digitsOnly || "0", 10);
        }
        return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    // Monetary display only. Counts, ranges and winning numbers still use fmtBON().
    // DarkPeers' official BON symbol is ฿; money uses PT-style thousands dots.
    function fmtBONCurrency(value) {
        return BON_SYMBOL + fmtBON(value).replace(/ /g, ".");
    }

    function safeNameForChat(name) {
        return sanitizeNick(String(name || "").trim());
    }


    // Small helper for rig-mode suffixes
    function rigNote(inner) {
        if (!riggedMode) return "";

        // Extract trailing emoji(s) or punctuation like "😈", "👀", "😏"
        // This catches anything NOT in parentheses.
        const match = inner.match(/^(.*?)(\s*[^\w\s\)\(]+)?$/);
        const text = match[1].trim(); // "(entry logged ... conditions)"
        const trailing = (match[2] || "").trim(); // "😈" or "👀" or empty

        return ` [i][color=#FF4F9A]${text}[/color][/i]${trailing ? " " + trailing : ""}`;
    }




    // Small helper for silent-mode suffixes (only for public announcements)
    function silentNote(inner) {
        if (!GENERAL_SETTINGS.silent_mode) return "";

        // Extract trailing emoji(s) or punctuation like "🤫"
        const match = inner.match(/^(.*?)(\s*[^\w\s\)\(]+)?$/);
        const text = match[1].trim();
        const trailing = (match[2] || "").trim();

        return ` [i][color=#999999]${text}[/color][/i]${trailing ? " " + trailing : ""}`;
    }

    // Fun denial message when non-hosts try to use !rig / !unrig (rate-limited per user)
    function maybeSendRigDeny(author, safeAuthor, action) {
        const now = Date.now();
        const nextOk = rigDenyCooldown.get(author) || 0;
        if (now < nextOk) return;
        rigDenyCooldown.set(author, now + RIG_DENY_COOLDOWN_MS);

        const who = `[color=#d85e27]${safeAuthor}[/color]`;

        const linesRig = [
            `🛑 Nice try ${who}. The Rigging Lever™ is behind host-only glass.`,
            `🚨 Unauthorized rig attempt by ${who}. Deploying the Fairness Police…`,
            `${who} tried to rig the giveaway. The universe said: “lol, no.”`,
            `Sorry ${who} — only the host has a license to operate the Rig-O-Matic™.`
        ];

        const linesUnrig = [
            `Hold up ${who}… you can’t unrig what you never rigged.`,
            `🚫 Access denied, ${who}. The “Unrig” button is guarded by a tiny, angry moderator.`,
            `Nice try ${who}. Only the host can turn off the Chaos Generator™.`,
            `${who} reached for the unrig switch… and touched nothing but air.`
        ];

        const pool = (action === "unrig") ? linesUnrig : linesRig;
        const msg = pool[Math.floor(Math.random() * pool.length)];
        sendCommandResponse(author, msg);
    }

    function updateRigToggleUI() {
        if (!rigToggleInput) return;

        rigToggleInput.disabled = false;
        rigToggleInput.checked = !!riggedMode;
        rigToggleInput.title = riggedMode
            ? "Rigged mode is ON (cosmetic only). Click to disable."
        : "Rigged mode is OFF (cosmetic only). Click to enable.";

        // Keep the donation/tax hint in sync when Rigged Mode is toggled.
        updateDonationHint();
    }

    function fmtUserList(arr) {
        return arr.map(n => `[b]${sanitizeNick(n)}[/b]`).join(", ");
    }

    // Safely read the host's BON balance from the page, regardless of locale separators
    function readHostBalance() {
        try {
            const points = document.getElementsByClassName("ratio-bar__points")[0];
            if (!points || !points.firstElementChild) return 0;
            const raw = points.firstElementChild.textContent || "";
            // remove everything that isn't a digit: spaces, commas, dots, apostrophes, etc.
            const digitsOnly = raw.replace(/[^\d]/g, "");
            const n = parseInt(digitsOnly, 10);
            return Number.isNaN(n) ? 0 : n;
        } catch {
            return 0;
        }
    }
    // ---- Live BON balance refresh (no page reload) ----
    // Some UNIT3D pages don't live-update the ratio bar when BON changes.
    // For host-only funding checks (start / !addbon), we pull a fresh snapshot via background fetch.
    const BON_BALANCE_FETCH_MAX_AGE_MS = 1200; // cache window to avoid spam-click bursts
    const BON_BALANCE_FETCH_TIMEOUT_MS = 7000;

    let bonBalanceFetchCache = {
        value: null,     // number | null
        fetchedAt: 0,    // ms
        inFlight: null   // Promise<number|null> | null
    };

    function parseBonBalanceFromDocument(doc) {
        try {
            const points = doc?.querySelector?.(".ratio-bar__points");
            if (!points) return null;

            // use full textContent (covers sites/themes that don't have a single child)
            const raw = (points.textContent || "").trim();
            const digitsOnly = raw.replace(/[^\d]/g, "");
            if (!digitsOnly) return null;

            const n = parseInt(digitsOnly, 10);
            return Number.isNaN(n) ? null : n;
        } catch {
            return null;
        }
    }

    async function fetchFreshBonBalance({ maxAgeMs = BON_BALANCE_FETCH_MAX_AGE_MS, timeoutMs = BON_BALANCE_FETCH_TIMEOUT_MS } = {}) {
        const now = Date.now();

        // Reuse a recent value
        if (bonBalanceFetchCache.value != null && (now - bonBalanceFetchCache.fetchedAt) <= maxAgeMs) {
            return bonBalanceFetchCache.value;
        }

        // Reuse an in-flight request
        if (bonBalanceFetchCache.inFlight) return bonBalanceFetchCache.inFlight;

        bonBalanceFetchCache.inFlight = (async () => {
            try {
                // Home page usually includes the top nav ratio bar on UNIT3D installs.
                // If a particular theme/routeset doesn't, fall back to the current page.
                const tryUrls = [
                    new URL("/", location.origin),
                    new URL(location.pathname, location.origin)
                ];

                let n = null;

                for (const url of tryUrls) {
                    const res = await fetchWithTimeout(url, {
                        credentials: "include",
                        cache: "no-store",
                        headers: { "Accept": "text/html" }
                    }, timeoutMs);

                    if (!res.ok) continue;

                    const html = await res.text();
                    const doc = new DOMParser().parseFromString(html, "text/html");
                    n = parseBonBalanceFromDocument(doc);

                    if (n != null) break;
                }

                if (n != null) {
                    bonBalanceFetchCache.value = n;
                    bonBalanceFetchCache.fetchedAt = Date.now();
                }

                return n;
            } catch {
                return null;
            } finally {
                bonBalanceFetchCache.inFlight = null;
            }
        })();

        return bonBalanceFetchCache.inFlight;
    }

    /**
     * Get the host BON balance.
     * - requireServer=true: only return a value if we successfully fetched/parsing server HTML (safest for funding checks).
     * - requireServer=false: fallback to DOM if fetch fails.
     */
    async function getVerifiedHostBalance({ requireServer = false, maxAgeMs = BON_BALANCE_FETCH_MAX_AGE_MS } = {}) {
        const fresh = await fetchFreshBonBalance({ maxAgeMs });

        if (typeof fresh === "number" && Number.isFinite(fresh) && fresh >= 0) return fresh;

        if (requireServer) return null;

        const dom = readHostBalance();
        return (typeof dom === "number" && Number.isFinite(dom)) ? dom : 0;
    }



    function ordinal(n){
        const rem100 = n % 100;
        if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
        switch (n % 10){
            case 1: return `${n}st`;
            case 2: return `${n}nd`;
            case 3: return `${n}rd`;
            default: return `${n}th`;
        }
    }

    function getLuckyNumber(giveawayData) {
        // Returns a FREE number centered in the largest gap (or null if none left).
        const start = giveawayData.startNum;
        const end = giveawayData.endNum;

        // Unique + sorted taken list
        const taken = Array.from(new Set(numberEntries.values()))
        .filter(n => Number.isFinite(n))
        .sort((a, b) => a - b);

        let bestLen = 0;
        let bestPick = null;

        // Sentinel at the end so the final gap is considered
        const boundaries = taken.concat([end + 1]);

        let prev = start - 1;
        for (const current of boundaries) {
            // Free interval: (prev, current) => [prev+1 .. current-1]
            const freeLen = current - prev - 1;
            if (freeLen > bestLen) {
                // Pick the center-left number of the free interval
                bestLen = freeLen;
                bestPick = prev + 1 + Math.floor((freeLen - 1) / 2);
            }
            prev = current;
        }

        if (bestPick === null || bestLen <= 0) return null;

        // Clamp just in case
        if (bestPick < start) bestPick = start;
        if (bestPick > end) bestPick = end;

        return bestPick;
    }




    function cleanPotString(giveawayPotAmount) {
        // Always returns a number. Rounds to integer if whole, otherwise keeps 2 decimals.
        const n = Number(giveawayPotAmount) || 0;
        return Number.isInteger(n) ? n : Math.round(n * 100) / 100;
    }

    function parseTime(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const parts = [];
        if (hours) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
        if (minutes) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
        if (seconds) parts.push(`${seconds} second${seconds > 1 ? 's' : ''}`);
        return parts.join(", ");
    }
    function getChatMsgText(msgNode) {
        const raw = (getMessageContentElement(msgNode)?.textContent || "");
        // Remove zero-width obfuscation chars so regex/includes work reliably
        return raw.replace(/[\u200B\u200C\u200D\uFEFF]/g, "").trim();
    }


    function totalMinutes () {
        const t = parseInt(String(timerInput?.value ?? ""), 10);
        return (Number.isFinite(t) && t > 0) ? t : 0;
    }

    function nextReminderMs(schedule, msLeft) {
        if (!schedule || !schedule.length) return null;

        // Drop reminders we've clearly passed (more than ~1s behind us)
        // e.g. if the tab was suspended or the host adjusted the end time.
        while (schedule.length && msLeft < schedule[0] - 1000) {
            schedule.shift();
        }
        if (!schedule.length) return null;

        // Next upcoming reminder triggers when msLeft shrinks down to schedule[0].
        // msToNext is positive before we reach it, ~0 around the tick it fires,
        // and negative if we're a little bit late.
        return msLeft - schedule[0];
    }

    // Returns [maxReminders, minInterval (in min)]
    function getReminderLimits(totalMinutes) {
        const MIN_INTERVAL = 5; // 5 min between reminders
        if (totalMinutes < MIN_INTERVAL) return [0, null];
        const max = Math.min(MAX_REMINDERS, Math.floor(totalMinutes / MIN_INTERVAL));
        return [max, MIN_INTERVAL];
    }

    // Returns [N reminders] timestamps (ms before end) evenly spaced
    function getReminderSchedule(totalMinutes, numReminders) {
        if (numReminders < 1) return [];
        const interval = totalMinutes / (numReminders + 1);
        return Array.from({length: numReminders}, (_,i) =>
                          Math.round((totalMinutes - (i + 1) * interval) * 60_000)
                         );
    }

    function shouldSendReminder(giveawayData) {
        // Look at a small recent window to avoid duplicate reminders.
        const messages = Array.from(document.querySelectorAll('.chatbox-message'));

        for (let i = messages.length - 1; i >= Math.max(messages.length - 7, 0); i--) {
            const msgNode = messages[i];
            const author = getAuthor(msgNode);
            const text = getChatMsgText(msgNode);

            if (
                normalizeUserKey(author) === normalizeUserKey(giveawayData.host) &&
                text.includes("Gift the host to add to the pot")
            ) {
                return false; // Recent visible reminder by host exists
            }
        }
        return true;
    }

    // Live sync reminder number field with allowed max/min and show interval
    function syncReminderNumUI() {
        if (!giveawayForm) return;
        const totMin = totalMinutes();
        const [maxRem, minInterval] = getReminderLimits(totMin);

        remNumInput.max = maxRem;
        remNumInput.min = 0;

        // Clamp to allowed range
        if (Number(remNumInput.value) > maxRem) remNumInput.value = maxRem;
        if (Number(remNumInput.value) < 0) remNumInput.value = 0;

        // Show interval in "Every" field
        if (Number(remNumInput.value) > 0) {
            const interval = totMin / (Number(remNumInput.value) + 1);
            reminderEvery.value = interval.toFixed(2).replace(/\.00$/,"") + " min";
        } else {
            reminderEvery.value = "–";
        }
        const label = giveawayForm.querySelector('label[for="reminderNum"]');
        if (label) {
            label.textContent = "# Reminders" + (maxRem ? ` (max ${maxRem})` : '');
        }
    }

    function cacheChatContext() {
        OT_USER_ID = null;
        OT_CHATROOM_ID = null;
        OT_CSRF_TOKEN = null;

        if (DEBUG_SETTINGS.verify_cacheChatContext) {
            console.debug("cacheChatContext: starting cache refresh");
        }

        // Try the Unit3D chatbox x-data payload first
        const section = document.querySelector('section#chatbody[x-data]');
        if (section) {
            try {
                const raw = section.getAttribute('x-data');
                if (DEBUG_SETTINGS.verify_cacheChatContext) {
                    console.debug("cacheChatContext: found x-data attribute:", raw);
                }
                // Extract the substring 'JSON.parse(...)' from raw
                const jsonParseMatch = raw.match(/JSON\.parse\((['"])([\s\S]*?)\1\)/);
                if (jsonParseMatch) {
                    let jsonContent = jsonParseMatch[2]; // the JSON string inside the quotes
                    if (DEBUG_SETTINGS.verify_cacheChatContext) {
                        console.debug("cacheChatContext: extracted JSON content:", jsonContent);
                    }
                    try {
                        // The x-data attribute contains JavaScript-escaped strings (\x7B, \x22, \\, \/, etc.)
                        // that JSON.parse can't handle directly. Decode JS escapes in a single pass so that
                        // \\ is consumed before \uNNNN — matching how JS string literal parsing works.
                        jsonContent = jsonContent.replace(
                            /\\(u[0-9A-Fa-f]{4}|x[0-9A-Fa-f]{2}|\\|'|\/|n|r|t|b|f)/g,
                            (_, esc) => {
                                if (esc[0] === 'u') return String.fromCharCode(parseInt(esc.slice(1), 16));
                                if (esc[0] === 'x') return String.fromCharCode(parseInt(esc.slice(1), 16));
                                const simple = { '\\': '\\', "'": "'", '/': '/', 'n': '\n', 'r': '\r', 't': '\t', 'b': '\b', 'f': '\f' };
                                return simple[esc] || esc;
                            }
                        );

                        const jsonData = JSON.parse(jsonContent);
                        if (jsonData) {
                            OT_USER_ID = Number(jsonData.id);
                            OT_CHATROOM_ID = Number(jsonData.chatroom_id);
                        }
                    } catch (e) {
                        if (DEBUG_SETTINGS.verify_cacheChatContext) {
                            console.debug("cacheChatContext: error parsing JSON content", e);
                        }
                    }
                } else {
                    if (DEBUG_SETTINGS.verify_cacheChatContext) {
                        console.debug("cacheChatContext: JSON.parse(...) pattern not found in x-data");
                    }
                }
            } catch (e) {
                if (DEBUG_SETTINGS.verify_cacheChatContext) {
                    console.debug("cacheChatContext: error reading x-data attribute", e);
                }
            }
        }

        // CSRF token
        const xsrfToken = document.querySelector('meta[name=csrf-token]')?.content ||
              window?.CSRF_TOKEN ||
              (document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || "");
        OT_CSRF_TOKEN = xsrfToken ? decodeURIComponent(xsrfToken) : "";

        if (DEBUG_SETTINGS.verify_cacheChatContext) {
            console.debug("cacheChatContext: final OT_CSRF_TOKEN =", OT_CSRF_TOKEN ? "[token present]" : "[token missing]");
        }
    }

    // ───────────────────────────────────────────────────────────
    // SECTION 13: Menu Field Scaling and Validation
    // ───────────────────────────────────────────────────────────
    function reminderAutoScaling() {
        const totMin = totalMinutes();
        const [maxRem] = getReminderLimits(totMin);

        // Only auto-set if the reminders field isn't focused or is empty/zero
        // (so we don't overwrite intentional user edits)
        if (
            document.activeElement !== remNumInput ||
            remNumInput.value === "" ||
            remNumInput.value === "0"
        ) {
            remNumInput.value = maxRem;
        }

        syncReminderNumUI();
    }

    function entryRangeValidation() {
        const startVal = startInput.value.trim();
        const endVal = endInput.value.trim();

        // Allow optional negative sign followed by digits (no letters)
        const integerRegex = /^-?\d+$/;

        // Clear previous custom validity messages
        startInput.setCustomValidity("");
        endInput.setCustomValidity("");

        // Check for any letters in the inputs
        const lettersRegex = /[A-Za-z]/;

        if (lettersRegex.test(startVal) || lettersRegex.test(endVal)) {
            startInput.setCustomValidity("Letters are not allowed—please enter valid integers.");
            endInput.setCustomValidity("Letters are not allowed—please enter valid integers.");
            return false;
        }

        // Ensure the inputs match the integer pattern
        if (
            !integerRegex.test(startVal) ||
            !integerRegex.test(endVal)
        ) {
            startInput.setCustomValidity("Please enter valid integers (e.g., -5, 0, 10).");
            endInput.setCustomValidity("Please enter valid integers (e.g., -5, 0, 10).");
            return false;
        }

        const startNum = parseInt(startVal, 10);
        const endNum = parseInt(endVal, 10);

        // Check for NaN just in case
        if (isNaN(startNum) || isNaN(endNum)) {
            startInput.setCustomValidity("Please enter numbers only.");
            endInput.setCustomValidity("Please enter numbers only.");
            return false;
        }

        // Ensure start is not greater than end
        if (startNum > endNum) {
            endInput.setCustomValidity("End # should be greater than or equal to Start #.");
            return false;
        }

        return true;
    }

    function winnersValidation() {
        winnersInput.setCustomValidity("");
        const val = parseInt(winnersInput.value, 10);
        if (isNaN(val) || val < 1 || val > MAX_WINNERS) {
            winnersInput.setCustomValidity(`Please choose between 1 and ${MAX_WINNERS} winners.`);
            winnersInput.reportValidity();
            updateStartButtonState();
            return false;
        }
        validateMaxScaledWinnersInput({ forceMessage: !!(scaleWinnersToggleInput && scaleWinnersToggleInput.checked) });
        return true;
    }

    function getClampedMaxScaledWinnersValue(baseWinners) {
        const safeBase = Math.max(1, Math.min(MAX_WINNERS, Math.floor(Number(baseWinners) || 1)));
        const raw = Number(maxScaledWinnersInput && maxScaledWinnersInput.value);
        const parsed = Number.isFinite(raw) ? Math.floor(raw) : safeBase;
        return Math.max(safeBase, Math.min(parsed, MAX_WINNERS));
    }

    function setMaxScaledWinnersError(message = "") {
        if (maxScaledWinnersError) {
            maxScaledWinnersError.textContent = message;
            maxScaledWinnersError.classList.toggle("visible", !!message);
        }

        if (maxScaledWinnersInput) {
            maxScaledWinnersInput.classList.toggle("input-invalid", !!message);
            maxScaledWinnersInput.setCustomValidity(message ? "Invalid max winners." : "");
        }
    }

    function getMaxScaledWinnersValidation(baseWinners, rawValue) {
        const raw = String(rawValue ?? "").trim();
        const rangeMsg = `Must be between ${fmtBON(baseWinners)} and ${fmtBON(MAX_WINNERS)}.`;

        if (!raw) return { valid: false, message: rangeMsg };
        if (!/^-?\d+$/.test(raw)) return { valid: false, message: `Enter an integer. ${rangeMsg}` };

        const parsed = Number(raw);
        if (!Number.isSafeInteger(parsed)) return { valid: false, message: rangeMsg };
        if (parsed < baseWinners || parsed > MAX_WINNERS) return { valid: false, message: rangeMsg };

        return { valid: true, value: parsed, message: "" };
    }

    function updateStartButtonState() {
        if (!startButton || !scaleWinnersToggleInput || !maxScaledWinnersInput) return;
        if (startButton.textContent !== "Start") return;

        const requiresValidMax = !!scaleWinnersToggleInput.checked;
        const invalidMax = requiresValidMax && maxScaledWinnersInput.classList.contains("input-invalid");
        startButton.disabled = invalidMax;
    }

    function validateMaxScaledWinnersInput(options = {}) {
        if (!maxScaledWinnersInput || !winnersInput) return true;

        const { forceMessage = false } = options;
        const baseWinners = Math.max(1, Math.min(MAX_WINNERS, Math.floor(Number(winnersInput.value) || 1)));
        maxScaledWinnersInput.min = String(baseWinners);

        if (scaleWinnersToggleInput && !scaleWinnersToggleInput.checked) {
            setMaxScaledWinnersError("");
            updateStartButtonState();
            return true;
        }

        const raw = String(maxScaledWinnersInput.value ?? "");
        const validation = getMaxScaledWinnersValidation(baseWinners, raw);
        if (!validation.valid) {
            setMaxScaledWinnersError(forceMessage ? validation.message : "");
            updateStartButtonState();
            return false;
        }

        maxScaledWinnersRawValue = String(validation.value);
        if (String(maxScaledWinnersInput.value) !== maxScaledWinnersRawValue) {
            maxScaledWinnersInput.value = maxScaledWinnersRawValue;
        }

        setMaxScaledWinnersError("");
        updateStartButtonState();
        return true;
    }

    function handleMaxScaledWinnersInput() {
        if (!maxScaledWinnersInput) return;
        maxScaledWinnersRawValue = String(maxScaledWinnersInput.value ?? "");

        validateMaxScaledWinnersInput({ forceMessage: false });

        if (maxScaledWinnersDebounceTimer) clearTimeout(maxScaledWinnersDebounceTimer);
        maxScaledWinnersDebounceTimer = setTimeout(() => {
            validateMaxScaledWinnersInput({ forceMessage: true });
        }, 350);
    }

    function updateScaleWinnersControls() {
        if (!scaleWinnersToggleInput || !maxScaledWinnersInput || !winnersInput) return;
        const baseWinners = Math.max(1, Math.min(MAX_WINNERS, Math.floor(Number(winnersInput.value) || 1)));
        maxScaledWinnersInput.min = String(baseWinners);
        if (!maxScaledWinnersInput.value) {
            maxScaledWinnersInput.value = String(baseWinners);
            maxScaledWinnersRawValue = String(baseWinners);
        }

        const showMaxScaled = !!scaleWinnersToggleInput.checked;
        if (maxScaledWinnersGroup) {
            maxScaledWinnersGroup.style.display = showMaxScaled ? "block" : "none";
        }
        if (scaleBonPerWinnerGroup) {
            scaleBonPerWinnerGroup.style.display = showMaxScaled ? "block" : "none";
        }
        if (scaleBonPerWinnerInput) {
            scaleBonPerWinnerInput.disabled = !showMaxScaled || !!scaleWinnersToggleInput.disabled;
        }

        maxScaledWinnersInput.disabled = !showMaxScaled || !!scaleWinnersToggleInput.disabled;
        validateMaxScaledWinnersInput({ forceMessage: showMaxScaled });
        bonPerWinnerManuallyEdited = false;
        syncBonPerWinnerValue();
        fitSettingsMenuHeight();
    }

    /** Auto-populate the BON/Winner field with the calculated threshold (unless manually edited). */
    function syncBonPerWinnerValue() {
        if (!scaleBonPerWinnerInput || !coinInput || !winnersInput) return;
        if (bonPerWinnerManuallyEdited) return;

        const rawAmount = String(coinInput.value || "").replace(/[^0-9]/g, "");
        const amount = parseInt(rawAmount, 10);
        const winners = parseInt(winnersInput.value, 10);

        if (Number.isFinite(amount) && amount > 0 && Number.isFinite(winners) && winners > 0) {
            const auto = Math.max(1, Math.floor(amount / winners));
            scaleBonPerWinnerInput.value = String(auto);
        } else {
            scaleBonPerWinnerInput.value = "";
        }
    }

    function getGiftSyntaxHostName() {
        const activeHost = giveawayData && giveawayData.host ? String(giveawayData.host).trim() : "";
        if (activeHost) return activeHost;
        const loggedIn = String(getLoggedInUsername() || "").trim();
        return loggedIn || "HOSTNAME";
    }

    function syncWinnersDisplayValue(effective) {
        const safe = Math.max(1, Math.min(MAX_WINNERS, Math.floor(Number(effective) || 1)));
        pendingEffectiveWinnersDisplay = safe;
        if (winnersInput) {
            winnersInput.value = String(safe);
            winnersInput.dataset.displayMode = "effective";
        }
    }

    function recomputeEffectiveWinners(data) {
        if (!data) return 1;

        const baseWinners = Math.max(1, Math.min(MAX_WINNERS, Math.floor(Number(data.baseWinnersAtStart || data.winnersNum) || 1)));
        data.baseWinnersAtStart = baseWinners;

        const hardMax = MAX_WINNERS;
        const configuredMax = Math.max(baseWinners, Math.min(Math.floor(Number(data.hostMaxScaledWinners) || baseWinners), hardMax));
        data.hostMaxScaledWinners = configuredMax;

        const fundableMax = maxWeightedWinnersForPot(data.amount);

        let effective = Math.min(baseWinners, fundableMax);
        if (data.scaleWinnersWithSponsors) {
            const baseBonPerWinner = getScalingBonPerWinner(data);
            const totalContribForScaling = getTotalContribForScaling(data);
            const extraWinnersFromSponsors = Math.floor(totalContribForScaling / baseBonPerWinner);
            const scaledWinners = baseWinners + extraWinnersFromSponsors;
            effective = Math.max(1, Math.min(scaledWinners, configuredMax, hardMax, fundableMax));
        }

        data.effectiveWinnersNum = effective;
        if (data === giveawayData) syncWinnersDisplayValue(effective);
        return effective;
    }

    function getHostAddedDuringGiveaway(data) {
        if (!data) return 0;
        const hostAddedTotal = Math.max(0, Math.floor(Number(data.hostAdded) || 0));
        const initialPotVerified = Math.max(0, Math.floor(Number(data.initialPotVerifiedAtStart) || 0));
        return Math.max(0, hostAddedTotal - initialPotVerified);
    }

    function getTotalContribForScaling(data) {
        if (!data) return 0;
        const totalSponsored = Math.max(0, Math.floor(sumSponsorContribs(data.sponsorContribs, data.host) || 0));
        return totalSponsored + getHostAddedDuringGiveaway(data);
    }

    /** Returns the effective BON-per-extra-winner threshold, using custom value if set. */
    function getScalingBonPerWinner(data) {
        if (!data) return 1;
        // Use custom threshold if explicitly set
        if (data.scaleBonPerWinner && Number.isFinite(data.scaleBonPerWinner) && data.scaleBonPerWinner > 0) {
            return Math.max(1, Math.floor(data.scaleBonPerWinner));
        }
        // Auto-calculate from initial pot / base winners
        const baseWinners = Math.max(1, Math.floor(Number(data.baseWinnersAtStart || data.winnersNum) || 1));
        const initialPotVerified = Math.max(0, Math.floor(Number(data.initialPotVerifiedAtStart) || 0));
        return Math.max(1, Math.floor(initialPotVerified / baseWinners));
    }

    function initializeScaledWinnersAnnouncementState(data) {
        if (!data) return;
        const baseWinners = Math.max(1, Math.min(MAX_WINNERS, Math.floor(Number(data.baseWinnersAtStart || data.winnersNum) || 1)));
        data.lastAnnouncedWinners = Math.max(
            baseWinners,
            Math.floor(Number(data.effectiveWinnersNum || baseWinners) || baseWinners)
        );
    }

    function buildWinnersAnnouncementLine(data, options = {}) {
        const winnersBase = Math.max(1, Math.floor(Number(data?.baseWinnersAtStart || data?.winnersNum) || 1));
        // Show the effective winner count (accounts for scaling) — never capped by current entrants
        const winnersNow = Math.max(1, Math.floor(Number(data?.effectiveWinnersNum) || winnersBase));
        let line = `[b][color=#5DE2E7]${winnersNow} possible ${winnersNow === 1 ? 'winner' : 'winners'}[/color][/b]`;

        if (data && data.scaleWinnersWithSponsors) {
            const maxWinners = Math.max(winnersBase, Math.min(Math.floor(Number(data.hostMaxScaledWinners) || winnersBase), MAX_WINNERS));
            line += ` (up to [b][color=#5DE2E7]${maxWinners}[/color][/b])`;
        }

        return line;
    }

    function isCurrentUserGiveawayHost() {
        const navDisplayName = document.getElementsByClassName("top-nav__username")[0]?.children?.[0]?.textContent || "";
        const selfNames = [getLoggedInUsername(), navDisplayName].map((name) => normUserKey(name)).filter(Boolean);
        if (!selfNames.length) return false;

        const hostKey = normUserKey(giveawayData?.host) || lastKnownGiveawayHostKey;
        if (hostKey) return selfNames.some((name) => name === hostKey);
        // No active/known host yet: default to showing host controls for the logged-in user.
        // Actions still remain gated by giveaway activity + host checks elsewhere.
        return true;
    }

    function isGiveawayCurrentlyActive(data) {
        if (!data) return false;
        const secondsLeft = Math.floor(Number(data.timeLeft) || 0);
        return secondsLeft > 0;
    }

    function getSponsorshipNextWinnerLine(data, options = {}) {
        if (!data || !data.scaleWinnersWithSponsors) return "";

        const baseWinners = Math.max(1, Math.min(MAX_WINNERS, Math.floor(Number(data.baseWinnersAtStart || data.winnersNum) || 1)));
        const effectiveWinners = Math.max(1, Math.floor(Number(data.effectiveWinnersNum || recomputeEffectiveWinners(data)) || baseWinners));
        const cap = Math.min(
            Math.max(baseWinners, Math.min(Math.floor(Number(data.hostMaxScaledWinners) || baseWinners), MAX_WINNERS)),
            MAX_WINNERS
        );

        if (effectiveWinners >= cap) {
            return options.plain
                ? `[b][color=${SCALING_ACCENT_COLOR}]Scaling:[/color][/b] [b]Max winners reached[/b] (${fmtBON(cap)}).`
            : `[b][color=${SCALING_ACCENT_COLOR}]Scaling:[/color][/b] [i][color=#9aa0a6][b]Max winners reached[/b] (${fmtBON(cap)}).[/color][/i]`;
        }

        const thresholdBonPerWinner = getScalingBonPerWinner(data);
        const totalContribForScaling = Math.max(0, Math.floor(getTotalContribForScaling(data)));
        const progress = totalContribForScaling % thresholdBonPerWinner;
        const remaining = progress === 0 ? thresholdBonPerWinner : thresholdBonPerWinner - progress;

        if (progress === 0) {
            if (totalContribForScaling > 0 && effectiveWinners < cap) {
                return options.plain
                    ? `[b][color=${SCALING_ACCENT_COLOR}]Scaling:[/color][/b] [b]BON needed to increase # of winners[/b]: reached.`
                : `[b][color=${SCALING_ACCENT_COLOR}]Scaling:[/color][/b] [i][color=#9aa0a6][b]Next threshold[/b]: reached.[/color][/i]`;
            }
            return "";
        }

        return options.plain
            ? `[b][color=${SCALING_ACCENT_COLOR}]Scaling:[/color][/b] [b]BON needed to increase # of winners[/b]: ${fmtBONCurrency(remaining)} BON.`
        : `[b][color=${SCALING_ACCENT_COLOR}]Scaling:[/color][/b] [i][color=#9aa0a6][b]BON needed to increase # of winners[/b]: ${fmtBONCurrency(remaining)} BON.[/color][/i]`;
    }

    function flashUIElement(el, durationMs = 950) {
        if (!el) return;
        el.classList.remove("bg-flash");
        void el.offsetWidth;
        el.classList.add("bg-flash");
        setTimeout(() => {
            if (el) el.classList.remove("bg-flash");
        }, durationMs);
    }

    function flashPotTotalUI() {
        flashUIElement(coinHeader, 900);
    }

    function flashWinnersUI() {
        const target = maxScaledWinnersGroup?.parentElement || winnersInput?.closest('.giveaway-winners-row') || winnersInput;
        flashUIElement(target, 1050);
    }

    function buildSponsorsSummaryMessage(data) {
        if (!data) return "";

        const safe = getNonHostSponsorContributions(data)
            .map(({ name, amount }) =>
                `[color=#1DDC5D][b]${sanitizeNick(name)}[/b][/color] ([color=#ffc00a][b]${fmtBONCurrency(amount)} BON[/b][/color])`
            );

        if (!safe.length) return "";

        const sponsorTotal = sumSponsorContribs(data.sponsorContribs, data.host);
        return `${bridgeMarker(BRIDGE_MARKERS.SPONSORS, "🥳")} Thank you to all the sponsors! Total sponsored: ` +
            `[color=#ffc00a][b]${fmtBONCurrency(sponsorTotal)} BON[/b][/color].\n` +
            `[b]Sponsors:[/b] ${safe.join(" · ")}`;
    }

    function buildFinalSponsorMessageRecap(data) {
        if (!data || !Array.isArray(data.sponsorGiftMessages) || !data.sponsorGiftMessages.length) return [];

        const hostKey = normalizeUserKey(data.host);
        const contribEntries = Object.entries(data.sponsorContribs || {});
        const grouped = new Map();

        for (const item of data.sponsorGiftMessages) {
            const sponsor = String(item?.sponsor || "").trim();
            const sponsorKey = normalizeUserKey(sponsor);
            const message = sanitizeSponsorGiftMessage(item?.message);
            const createdAtTs = Number.isFinite(Number(item?.createdAtTs))
                ? Number(item.createdAtTs)
                : 0;

            // Host self-top-ups are host funding, not sponsorships.
            if (!sponsorKey || sponsorKey === hostKey || !message) continue;

            if (!grouped.has(sponsorKey)) {
                const matching = contribEntries.find(([name]) => normalizeUserKey(name) === sponsorKey);
                grouped.set(sponsorKey, {
                    name: matching?.[0] || sponsor,
                    total: matching ? Math.max(0, Math.floor(Number(matching[1]) || 0)) : 0,
                    notes: []
                });
            }

            const entry = grouped.get(sponsorKey);
            entry.notes.push({ message, createdAtTs });
        }

        const sponsors = Array.from(grouped.values())
            .filter(entry => entry.notes.length)
            .sort((a, b) =>
                (b.total - a.total) ||
                a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
            );

        if (!sponsors.length) return [];

        const maxVisible = Math.max(180, Math.floor(Number(SPONSOR_ANNOUNCE.max_visible_chars) || 300));
        const marker = bridgeMarker(BRIDGE_MARKERS.SPONSOR_MESSAGES, "💬");
        const heading = `${marker} [b]Messages from our sponsors:[/b]`;
        const messages = [];
        let currentLines = [];

        const flush = () => {
            if (!currentLines.length) return;
            messages.push(heading + "\n" + currentLines.join("\n"));
            currentLines = [];
        };

        for (const sponsor of sponsors) {
            sponsor.notes.sort((a, b) => (a.createdAtTs || 0) - (b.createdAtTs || 0));

            // Keep several messages from the same sponsor on one line where possible:
            //   GRiMM: "for the pot" · "Another message"
            const prefix = `[color=#1DDC5D][b]${sanitizeNick(sponsor.name)}[/b][/color]: `;
            let noteGroup = [];

            const flushSponsorLine = () => {
                if (!noteGroup.length) return;
                const line = prefix + noteGroup.map(note => `[i]"${note}"[/i]`).join(" · ");
                const candidate = heading + "\n" + currentLines.concat(line).join("\n");
                if (currentLines.length && visibleChatLength(candidate) > maxVisible) flush();
                currentLines.push(line);
                noteGroup = [];
            };

            for (const note of sponsor.notes) {
                const clean = truncateSponsorGiftMessage(note.message);
                if (!clean) continue;

                const candidateNotes = noteGroup.concat(clean);
                const candidateLine = prefix + candidateNotes.map(value => `[i]"${value}"[/i]`).join(" · ");
                const candidateBlock = heading + "\n" + currentLines.concat(candidateLine).join("\n");

                if (noteGroup.length && visibleChatLength(candidateBlock) > maxVisible) {
                    flushSponsorLine();
                }
                noteGroup.push(clean);
            }
            flushSponsorLine();
        }

        flush();
        return messages;
    }

    function bindSettingsSectionToggleButtons() {
        const buttons = settingsMenu ? settingsMenu.querySelectorAll("[data-settings-toggle]") : [];
        buttons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const key = btn.getAttribute("data-settings-toggle");
                const group = settingsMenu.querySelector(`[data-settings-group="${key}"]`);
                if (!group) return;

                const ids = String(group.getAttribute("data-toggle-ids") || "").split(",").map((v) => v.trim()).filter(Boolean);
                const toggles = ids.map((id) => document.getElementById(id)).filter(Boolean);
                if (!toggles.length) return;

                const enforceOne = group.getAttribute("data-enforce-one") === "true";
                const enabledCount = toggles.filter((el) => el.checked).length;
                const turnOn = enabledCount !== 0;
                const keepEnabledEl = turnOn && enforceOne ? (toggles.find((el) => el.checked) || toggles[0]) : null;

                toggles.forEach((el) => {
                    const nextChecked = turnOn ? (el === keepEnabledEl ? true : false) : true;
                    if (el.checked !== nextChecked) {
                        el.checked = nextChecked;
                        el.dispatchEvent(new Event("change", { bubbles: true }));
                    }
                });
            });
        });
    }

    function normalizePanelCommandName(name) {
        return String(name || "").trim().toLowerCase();
    }

    function isEndCommandExcludedFromHostPanel(name) {
        const normalized = normalizePanelCommandName(name);
        return HOST_PANEL_END_COMMAND_DENYLIST.includes(normalized);
    }


    function getPanelCommandList() {
        if (!COMMAND_HANDLERS || typeof COMMAND_HANDLERS !== "object") {
            return {
                commands: [],
                registryName: "COMMAND_HANDLERS",
                reason: "COMMAND_HANDLERS unavailable"
            };
        }

        const commands = Object.keys(COMMAND_HANDLERS)
        .filter((name) => typeof COMMAND_HANDLERS[name] === "function")
        .filter((name) => !isEndCommandExcludedFromHostPanel(name))
        .filter((name) => !HOST_PANEL_INTERNAL_COMMAND_DENYLIST.includes(normalizePanelCommandName(name)))
        .sort((a, b) => a.localeCompare(b));

        return {
            commands,
            registryName: "COMMAND_HANDLERS",
            reason: `COMMAND_HANDLERS has ${commands.length} entr${commands.length === 1 ? "y" : "ies"}`
        };
    }

    function getCommandMeta(name) {
        const fallback = {
            label: name,
            section: "info",
            description: `Execute !${name}.`,
            usage: `!${name}`,
            requiresGiveaway: true
        };
        return { ...fallback, ...(HOST_PANEL_COMMAND_METADATA[name] || {}) };
    }

    function setButtonDisabledWithTooltip(button, disabled, reason, enabledTip) {
        if (!button) return;
        let wrap = button.closest('.disabled-wrap');
        if (!wrap) {
            wrap = document.createElement('span');
            wrap.className = 'disabled-wrap';
            button.parentNode.insertBefore(wrap, button);
            wrap.appendChild(button);
        }
        button.disabled = !!disabled;
        button.title = disabled ? "" : (enabledTip || button.title || "");
        wrap.title = disabled ? reason : "";
    }

    function withButtonDebounce(button, fn, done) {
        if (!button || button.dataset.busy === "1") return;
        button.dataset.busy = "1";
        button.disabled = true;
        const finish = () => {
            setTimeout(() => {
                button.dataset.busy = "0";
                if (typeof done === "function") done();
            }, 450);
        };
        try {
            const out = fn();
            if (out && typeof out.then === "function") out.finally(finish);
            else finish();
        } catch {
            finish();
        }
    }

    function getPanelCommandDisableReason(name) {
        const meta = getCommandMeta(name);
        const active = !!(giveawayData && isGiveawayCurrentlyActive(giveawayData));
        if (meta.requiresGiveaway && !active) return "Requires an active giveaway.";

        if (meta.hostOnly && !isCurrentUserGiveawayHost()) return "Only the host can use this.";

        if (name === "reminder" && active && !shouldSendReminder(giveawayData)) return "No reminder is due right now.";

        return "";
    }

    function validatePanelCommand(name) {
        const state = hostPanelCommandState.get(name);
        if (!state) return { valid: false, args: [], errors: [] };
        const meta = state.meta || getCommandMeta(name);
        const allRaw = {};
        state.inputs.forEach((item) => {
            allRaw[item.arg.name] = String(item.input.value || "").trim();
        });

        const args = [];
        const errors = [];
        state.inputs.forEach((item) => {
            const { arg, input } = item;
            const raw = allRaw[arg.name];
            const requiredNow = !!(arg.required || (typeof arg.requiredWhen === "function" && arg.requiredWhen(allRaw)));
            let error = "";

            if (!raw) {
                if (requiredNow) error = arg.hint || "Required.";
            } else if (arg.type === "int") {
                const n = Number(raw);
                if (!Number.isSafeInteger(n)) {
                    error = "Enter an integer.";
                } else if (Number.isFinite(arg.min) && n < arg.min) {
                    error = `Minimum: ${arg.min}.`;
                } else if (Number.isFinite(arg.max) && n > arg.max) {
                    error = `Maximum: ${arg.max}.`;
                }
            } else if (typeof arg.validate === "function" && !arg.validate(raw, allRaw)) {
                error = arg.hint || "Invalid value.";
            }

            input.classList.toggle("input-invalid", !!error);
            if (error) errors.push(error);
            if (raw) args.push(raw);
        });

        if (state.errorNode) {
            state.errorNode.textContent = errors[0] || "";
            state.errorNode.classList.toggle("visible", errors.length > 0);
        }

        return { valid: errors.length === 0, args, errors, meta };
    }

    function runHostPanelAction(name) {
        const state = hostPanelCommandState.get(name);
        if (!state) return;
        const disabledReason = getPanelCommandDisableReason(name);
        const validation = validatePanelCommand(name);
        const canRun = !disabledReason && validation.valid;

        setButtonDisabledWithTooltip(state.button, !canRun, disabledReason || "Fix invalid arguments.", `${validation.meta.description} Example: ${validation.meta.usage}`);
        if (!canRun) return;

        executeCommand({
            name,
            args: validation.args,
            author: giveawayData?.host || getLoggedInUsername() || "",
            giveawayData,
            source: "panel"
        });
    }

    function renderHostPanelCommands() {
        if (!hostCommandPanelBody) return;
        hostPanelCommandState.clear();
        hostCommandPanelBody.innerHTML = "";

        const panelList = getPanelCommandList();
        if (!panelList || !Array.isArray(panelList.commands)) {
            const placeholder = document.createElement("p");
            placeholder.className = "host-command-panel__empty";
            placeholder.textContent = "Host Panel commands unavailable (init error).";
            hostCommandPanelBody.appendChild(placeholder);
            return;
        }

        const { commands, registryName, reason } = panelList;
        if (commands.length === 0) {
            const placeholder = document.createElement("p");
            placeholder.className = "host-command-panel__empty";
            placeholder.textContent = `No commands found (registry empty). ${registryName} has 0 entries.`;
            hostCommandPanelBody.appendChild(placeholder);
            return;
        }

        const grouped = new Map();
        let naughtyItem = null;

        commands.forEach((name) => {
            const key = normalizePanelCommandName(name);
            const meta = getCommandMeta(name);


            const mappedSection = HOST_PANEL_COMMAND_SECTION_BY_KEY[key];
            if (mappedSection === "naughty") {
                naughtyItem = { name, meta, key };
                return;
            }

            const sectionKey = mappedSection || meta.section || "unknown";
            if (!grouped.has(sectionKey)) grouped.set(sectionKey, []);
            grouped.get(sectionKey).push({ name, meta, key });
        });

        const buildCommandRow = (name, meta) => {
            const commandKey = normalizePanelCommandName(name);
            const row = document.createElement("div");
            row.className = "host-command-panel__row";
            row.title = `${meta.description} Example: ${meta.usage}`;
            row.dataset.command = name;

            const inline = document.createElement("div");
            inline.className = "hp-row";
            const mainLine = document.createElement("div");
            mainLine.className = "hp-row-main";
            const rightColumn = document.createElement("div");
            rightColumn.className = "hp-row-right";
            const fieldsWrap = document.createElement("div");
            fieldsWrap.className = "hp-row-fields";
            const errorLine = document.createElement("small");
            errorLine.className = "hp-row-error";

            const argInputs = [];
            const buttonWrap = document.createElement("span");
            buttonWrap.className = "disabled-wrap host-command-panel__button-wrap";
            const button = document.createElement("button");
            button.type = "button";
            button.className = "form__button form__button--filled";
            button.textContent = meta.label;
            button.title = `${meta.description} Example: ${meta.usage}`;
            button.dataset.command = name;
            buttonWrap.appendChild(button);
            mainLine.appendChild(buttonWrap);

            (meta.args || []).forEach((arg) => {
                const argWrap = document.createElement("div");
                argWrap.className = "host-command-panel__arg-wrap";

                let input;
                if (arg.type === "select") {
                    input = document.createElement("select");
                    input.className = "form__text command-input";
                    const options = Array.isArray(arg.options) ? arg.options : [];
                    options.forEach((opt) => {
                        const optionEl = document.createElement("option");
                        optionEl.value = String(opt.value || "");
                        optionEl.textContent = String(opt.label || opt.value || "");
                        input.appendChild(optionEl);
                    });
                } else {
                    input = document.createElement("input");
                    input.className = "form__text command-input";
                    if (arg.type === "text" || arg.type === "username") {
                        input.classList.add("command-input--long");
                    }
                    if (arg.type === "int") {
                        input.type = "number";
                        input.step = "1";
                        if (Number.isFinite(arg.min)) input.min = String(arg.min);
                        if (Number.isFinite(arg.max)) input.max = String(arg.max);
                    } else {
                        input.type = "text";
                    }
                    input.placeholder = arg.placeholder || arg.label || arg.name;
                }

                input.title = `${arg.label || arg.name}${arg.required ? " (required)" : " (optional)"}`;
                input.dataset.argName = arg.name;

                argWrap.appendChild(input);
                fieldsWrap.appendChild(argWrap);
                argInputs.push({ arg, input });
            });

            rightColumn.appendChild(fieldsWrap);
            rightColumn.appendChild(errorLine);
            mainLine.appendChild(rightColumn);
            inline.appendChild(mainLine);

            if (commandKey === "naughty") {
                const actionInput = argInputs.find((item) => item.arg.name === "action")?.input;
                const userInput = argInputs.find((item) => item.arg.name === "username")?.input;
                const syncNaughtyInputs = () => {
                    if (!(actionInput instanceof HTMLSelectElement) || !(userInput instanceof HTMLInputElement)) return;
                    const action = String(actionInput.value || "").toLowerCase();
                    const isList = action === "list";
                    userInput.disabled = isList;
                    if (isList) {
                        userInput.value = "";
                        userInput.classList.remove("input-invalid");
                        errorLine.textContent = "";
                        errorLine.classList.remove("visible");
                    }
                };
                if (actionInput instanceof HTMLSelectElement) {
                    actionInput.addEventListener("change", () => {
                        syncNaughtyInputs();
                        updateHostPanelUI();
                    });
                    syncNaughtyInputs();
                }
            }

            row.appendChild(inline);
            hostPanelCommandState.set(name, { button, inputs: argInputs, meta, errorNode: errorLine });
            return row;
        };

        const orderSectionItems = (sectionKey, items) => {
            const expectedOrder = HOST_PANEL_COMMAND_ORDER_BY_SECTION[sectionKey];
            if (!expectedOrder) {
                return [...items].sort((a, b) => a.key.localeCompare(b.key));
            }
            const rank = new Map(expectedOrder.map((key, idx) => [key, idx]));
            return [...items].sort((a, b) => {
                const aRank = rank.has(a.key) ? rank.get(a.key) : 999;
                const bRank = rank.has(b.key) ? rank.get(b.key) : 999;
                if (aRank !== bRank) return aRank - bRank;
                return a.key.localeCompare(b.key);
            });
        };

        const appendSection = (sectionKey, sectionLabel, items) => {
            if (!items.length) return;
            const section = document.createElement("section");
            section.className = "host-command-panel__section";
            const title = document.createElement("h5");
            title.className = "host-command-panel__section-title";
            title.textContent = sectionLabel;
            section.appendChild(title);
            orderSectionItems(sectionKey, items).forEach(({ name, meta }) => section.appendChild(buildCommandRow(name, meta)));
            hostCommandPanelBody.appendChild(section);
        };

        HOST_PANEL_SECTION_ORDER.forEach((sectionKey) => {
            const items = grouped.get(sectionKey) || [];
            grouped.delete(sectionKey);
            appendSection(sectionKey, COMMAND_PANEL_SECTIONS[sectionKey] || sectionKey, items);
        });

        grouped.delete("naughty");
        const unknownSections = [...grouped.entries()]
        .filter(([, items]) => Array.isArray(items) && items.length)
        .sort((a, b) => String(a[0]).localeCompare(String(b[0])));
        unknownSections.forEach(([sectionKey, items]) => {
            const fallbackLabel = COMMAND_PANEL_SECTIONS[sectionKey] || sectionKey;
            appendSection(sectionKey, fallbackLabel, items);
        });

        if (naughtyItem) {
            appendSection("naughty", HOST_PANEL_NAUGHTY_SECTION_TITLE, [naughtyItem]);
        }

        if (!hostPanelCommandState.size) {
            const placeholder = document.createElement("p");
            placeholder.className = "host-command-panel__empty";
            placeholder.textContent = `No commands found (registry empty). ${reason || `${registryName} has 0 entries.`}`;
            hostCommandPanelBody.appendChild(placeholder);
        }
    }

    function bindHostPanelEvents() {
        if (!hostCommandPanelBody || hostCommandPanelBody.dataset.bound === "1") return;
        hostCommandPanelBody.dataset.bound = "1";

        hostCommandPanelBody.addEventListener("input", (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement) || !target.classList.contains("command-input")) return;
            updateHostPanelUI();
        });

        hostCommandPanelBody.addEventListener("change", (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement) || !target.classList.contains("command-input")) return;
            updateHostPanelUI();
        });

        hostCommandPanelBody.addEventListener("click", (event) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            const button = target.closest("button[data-command]");
            if (!(button instanceof HTMLButtonElement)) return;
            const commandName = button.dataset.command || "";
            if (!commandName || !hostPanelCommandState.has(commandName)) return;

            withButtonDebounce(button, () => runHostPanelAction(commandName), updateHostPanelUI);
        });
    }

    function toggleCommandsMenu() {
        if (!commandsMenu) return;

        // close Settings before toggling Commands
        if (settingsMenu?.classList.contains('open')) hardCloseSettings();

        const open = commandsMenu.classList.toggle('open');
        if (open) {
            updateHostPanelUI();
            openCommandsMenu();
            document.addEventListener('click', handleOutsideClick);
            return;
        }
        hardCloseCommands();
        const anyOpen = settingsMenu?.classList.contains('open');
        if (!anyOpen) document.removeEventListener('click', handleOutsideClick);
    }

    function bindHeaderMenuDelegation() {
        if (!frameHeader) return;
        if (frameHeader.dataset.menuDelegationBound === "1") return;
        frameHeader.dataset.menuDelegationBound = "1";

        frameHeader.addEventListener('click', (event) => {
            const target = event.target;
            if (!(target instanceof Element)) return;

            const commandsToggle = target.closest('#commandsButton');
            if (commandsToggle) {
                event.preventDefault();
                event.stopPropagation();
                toggleCommandsMenu();
                return;
            }

            const hostToggle = target.closest('#hostPanelToggle');
            if (hostToggle) {
                event.preventDefault();
                event.stopPropagation();
                const shouldOpen = !(hostCommandPanel && hostCommandPanel.classList.contains('open'));
                setHostPanelOpen(shouldOpen);
                updateHostPanelUI();
            }
        });
    }

    function bindFrameDrag() {
        if (!frameHeader || frameHeader.dataset.dragBound === "1") return;
        frameHeader.dataset.dragBound = "1";

        frameHeader.style.cursor = 'move';
        frameHeader.style.userSelect = 'none';

        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        const stopDrag = () => {
            isDragging = false;
        };

        frameHeader.addEventListener('mousedown', (event) => {
            const target = event.target;
            if (target instanceof Element && target.closest('.no-drag, button, input, textarea, select, a, [data-no-drag="1"]')) {
                return;
            }

            const rect = bonanzaGiveawayFrame.getBoundingClientRect();
            isDragging = true;
            dragOffsetX = event.clientX - rect.left;
            dragOffsetY = event.clientY - rect.top;
            bonanzaGiveawayFrame.style.left = rect.left + 'px';
            bonanzaGiveawayFrame.style.top = rect.top + 'px';
            bonanzaGiveawayFrame.style.right = 'auto';
            bonanzaGiveawayFrame.style.bottom = 'auto';
        });

        document.addEventListener('mousemove', (event) => {
            if (!isDragging) return;
            const maxX = window.innerWidth - bonanzaGiveawayFrame.offsetWidth;
            const maxY = window.innerHeight - bonanzaGiveawayFrame.offsetHeight;
            bonanzaGiveawayFrame.style.left = Math.max(0, Math.min(maxX, event.clientX - dragOffsetX)) + 'px';
            bonanzaGiveawayFrame.style.top = Math.max(0, Math.min(maxY, event.clientY - dragOffsetY)) + 'px';
        });

        document.addEventListener('mouseup', stopDrag);
    }

    function bindHeaderInteractions() {
        frameHeader = bonanzaGiveawayFrame?.querySelector('header.panel__heading');
        if (!frameHeader) return;
        bindHeaderMenuDelegation();
        bindFrameDrag();
    }

    function clampHostPanelPosition(left, top) {
        if (!hostCommandPanel) return { left: 8, top: 8 };
        const panelWidth = hostCommandPanel.offsetWidth || hostCommandPanel.getBoundingClientRect().width || 0;
        const panelHeight = hostCommandPanel.offsetHeight || hostCommandPanel.getBoundingClientRect().height || 0;
        const minLeft = 8;
        const minTop = 8;
        const maxLeft = Math.max(minLeft, window.innerWidth - panelWidth - 8);
        const maxTop = Math.max(minTop, window.innerHeight - panelHeight - 8);
        return {
            left: Math.max(minLeft, Math.min(maxLeft, Number(left) || 0)),
            top: Math.max(minTop, Math.min(maxTop, Number(top) || 0))
        };
    }

    function applyHostPanelPosition(left, top) {
        if (!hostCommandPanel) return;
        const next = clampHostPanelPosition(left, top);
        hostCommandPanel.style.left = `${next.left}px`;
        hostCommandPanel.style.top = `${next.top}px`;
        hostCommandPanel.style.right = "auto";
    }

    function readStoredHostPanelPos() {
        try {
            const raw = localStorage.getItem(LS_HOST_PANEL_POS);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object") return null;
            if (!Number.isFinite(parsed.left) || !Number.isFinite(parsed.top)) return null;
            return { left: parsed.left, top: parsed.top };
        } catch {
            return null;
        }
    }

    function saveHostPanelPosition() {
        if (!hostCommandPanel) return;
        const rect = hostCommandPanel.getBoundingClientRect();
        const clamped = clampHostPanelPosition(rect.left, rect.top);
        localStorage.setItem(LS_HOST_PANEL_POS, JSON.stringify(clamped));
    }

    function positionHostPanelOnOpen() {
        if (!hostCommandPanel) return;
        const stored = readStoredHostPanelPos();
        if (stored) {
            applyHostPanelPosition(stored.left, stored.top);
            return;
        }
        const defaultLeft = window.innerWidth - hostCommandPanel.offsetWidth - 16;
        const defaultTop = 50;
        applyHostPanelPosition(defaultLeft, defaultTop);
    }

    function clampHostPanelCurrentPosition() {
        if (!hostCommandPanel) return;
        const rect = hostCommandPanel.getBoundingClientRect();
        applyHostPanelPosition(rect.left, rect.top);
        saveHostPanelPosition();
    }

    function bindHostPanelDrag() {
        if (!hostPanelHandle || !hostCommandPanel || hostPanelHandle.dataset.dragBound === "1") return;
        hostPanelHandle.dataset.dragBound = "1";

        let pointerDown = false;
        let dragStarted = false;
        let pointerStartX = 0;
        let pointerStartY = 0;
        let startLeft = 0;
        let startTop = 0;

        const stopDrag = () => {
            if (!pointerDown) return;
            pointerDown = false;
            if (dragStarted) {
                hostCommandPanel.classList.remove("dragging");
                document.body.classList.remove("host-panel-dragging");
                saveHostPanelPosition();
            }
            dragStarted = false;
        };

        hostPanelHandle.addEventListener("mousedown", (event) => {
            if (event.button !== 0) return;
            const target = event.target;
            if (target instanceof Element && target.closest("button, input, textarea, select, a, [data-no-drag='1']")) return;

            pointerDown = true;
            dragStarted = false;
            pointerStartX = event.clientX;
            pointerStartY = event.clientY;
            const rect = hostCommandPanel.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            event.preventDefault();
        });

        document.addEventListener("mousemove", (event) => {
            if (!pointerDown || !hostCommandPanel.classList.contains("open")) return;

            const deltaX = event.clientX - pointerStartX;
            const deltaY = event.clientY - pointerStartY;
            if (!dragStarted && Math.hypot(deltaX, deltaY) < 4) return;

            if (!dragStarted) {
                dragStarted = true;
                hostCommandPanel.classList.add("dragging");
                document.body.classList.add("host-panel-dragging");
            }

            applyHostPanelPosition(startLeft + deltaX, startTop + deltaY);
        });

        document.addEventListener("mouseup", stopDrag);
        window.addEventListener("blur", stopDrag);
    }

    function bindHostPanelResizeClamp() {
        if (hostPanelResizeBound) return;
        hostPanelResizeBound = true;
        window.addEventListener("resize", () => {
            if (!hostCommandPanel) return;
            clampHostPanelCurrentPosition();
        });
    }

    function ensureHostPanelInitialized() {
        if (hostPanelInitialized) return;
        ensureHostPanelToggleButton();

        if (!document.getElementById("hostCommandPanel")) {
            document.body.insertAdjacentHTML("beforeend", hostPanelHTML);
        }

        bindHostPanelButtons();
        hostPanelInitialized = true;
    }

    function bindHostPanelButtons() {
        hostPanelToggleBtn = document.getElementById("hostPanelToggle");
        hostCommandPanel = document.getElementById("hostCommandPanel");
        hostCommandPanelBody = document.getElementById("hostCommandPanelBody");
        hostPanelCloseBtn = document.getElementById("hostPanelCloseBtn");
        hostPanelHandle = document.getElementById("hostCommandPanelHandle");

        if (hostCommandPanel && hostCommandPanel.parentElement !== document.body) {
            document.body.appendChild(hostCommandPanel);
        }

        renderHostPanelCommands();
        bindHostPanelEvents();
        bindHostPanelDrag();
        bindHostPanelResizeClamp();

        if (hostPanelCloseBtn && hostPanelCloseBtn.dataset.bound !== "1") {
            hostPanelCloseBtn.dataset.bound = "1";
            hostPanelCloseBtn.addEventListener("click", () => {
                setHostPanelOpen(false);
                updateHostPanelUI();
            });
        }
    }

    function setHostPanelOpen(open) {
        const shouldOpen = !!open;
        if (shouldOpen) ensureHostPanelInitialized();
        if (!hostCommandPanel) return;
        if (shouldOpen) {
            renderHostPanelCommands();
            hostCommandPanel.style.zIndex = "10030";
            hostCommandPanel.classList.add("open");
            hostCommandPanel.setAttribute("aria-hidden", "false");
            positionHostPanelOnOpen();
            clampHostPanelCurrentPosition();
            if (hostCommandPanelBody) hostCommandPanelBody.scrollLeft = 0;
        } else {
            hostCommandPanel.classList.remove("open", "dragging");
            hostCommandPanel.setAttribute("aria-hidden", "true");
            document.body.classList.remove("host-panel-dragging");
        }
        localStorage.setItem(LS_HOST_PANEL_OPEN, shouldOpen ? "true" : "false");
    }

    function updateHostPanelUI() {
        const visible = true;

        if (hostPanelToggleBtn) hostPanelToggleBtn.style.display = visible ? "inline-flex" : "none";
        if (hostCommandPanel && !visible) setHostPanelOpen(false);

        hostPanelCommandState.forEach((state, name) => {
            const reason = getPanelCommandDisableReason(name);
            const validation = validatePanelCommand(name);
            const disabled = !!reason || !validation.valid;
            setButtonDisabledWithTooltip(
                state.button,
                disabled,
                reason || "Fix invalid arguments.",
                `${state.meta.description} Example: ${state.meta.usage}`
            );
            state.inputs.forEach(({ input, arg }) => {
                let shouldDisable = !!reason;
                if (!shouldDisable && normalizePanelCommandName(name) === "naughty" && arg.name === "username") {
                    const actionInput = state.inputs.find((item) => item.arg.name === "action")?.input;
                    const actionValue = actionInput ? String(actionInput.value || "").toLowerCase() : "";
                    shouldDisable = actionValue === "list";
                }
                input.disabled = shouldDisable;
            });
        });

        fitSettingsMenuHeight();
    }

    // Outside-click only affects Settings / Commands menus (Host Panel stays open).
    function handleOutsideClick(event) {
        const settingsButton = document.getElementById('giveawaySettingsBtn') || settingsBtn;
        const commandsButton = document.getElementById('commandsButton') || commandsBtn;

        const insideSettings = !!(settingsMenu && (settingsMenu.contains(event.target) || settingsButton?.contains(event.target)));
        const insideCommands = !!(commandsMenu && (commandsMenu.contains(event.target) || commandsButton?.contains(event.target)));

        if (!insideSettings && !insideCommands) {
            settingsMenu.classList.remove('open');
            settingsMenu.style.display = 'none';
            hardCloseCommands();
            document.removeEventListener('click', handleOutsideClick);
        }
    }


    function fitSettingsMenuHeight() {
        if (!settingsMenu || settingsMenu.style.display === 'none') return;

        settingsMenu.style.height = 'auto';
        const viewportMax = Math.max(220, window.innerHeight - 90);
        const neededHeight = settingsMenu.scrollHeight;
        const cappedHeight = Math.min(neededHeight, viewportMax);

        settingsMenu.style.maxHeight = `${cappedHeight}px`;
        settingsMenu.style.overflowY = neededHeight > viewportMax ? 'auto' : 'visible';
    }

    function hardCloseCommands() {
        commandsMenu.classList.remove('open');
        commandsMenu.style.display = 'none'; // keep it hidden
    }

    function openCommandsMenu() {
        commandsMenu.style.display = 'block';
    }

    function hardCloseSettings () {
        settingsMenu.classList.remove('open');
        settingsMenu.style.display = 'none';
        document.removeEventListener('click', handleOutsideClick);
    }

    // ───────────────────────────────────────────────────────────
    // SECTION 14: Internal Namespaces (refactor-only; no behavior change)
    // Provides a single place to find related functionality by area.
    // ───────────────────────────────────────────────────────────
    // Optional debug hook: set DEBUG_SETTINGS.expose_modules = true in code if you want this on window.
    if (DEBUG_SETTINGS && DEBUG_SETTINGS.expose_modules === true) {
        window.BON_GIVEAWAY = Object.freeze({
            BONANZA,
            Pool: Object.freeze({
                computeDonationSplit,
                normalizeDonationPercent,
                fetchBonPoolPage,
                urlEncodedDataFromParsedForm,
                contributeBonPool,
            }),
            Chat: Object.freeze({
                parseMessage,
                getAuthor,
                getChatMsgText,
            }),
            Giveaway: Object.freeze({
                startGiveaway,
                stopGiveaway,
                endGiveaway,
            }),
            Commands: Object.freeze({
                handleGiveawayCommands,
            }),
            Sponsors: Object.freeze({
                SponsorTracker,
                parseGiftMessage,
                parseGiftHistoryPage,
                parseGiftNotificationsPage,
                parseUnit3dTimestamp,
                parseUnit3dTimestampUtcFallback,
            }),
            Stats: Object.freeze({
                loadGiveawayStats,
                saveGiveawayStats,
                recordLiveEntry,
                recordGiveawayStats,
                recordLiveSponsorGift,
            }),
            Util: Object.freeze({
                normalizeUserKey,
                normUserKey,
                cleanPotString,
                fmtBON,
                parseTime,
            }),
        });
    }

    function addStyle(css, id) {
        const style = document.createElement("style");
        style.id = id;
        style.textContent = css;
        document.head.appendChild(style);
    }
})();
// ==UserScript==
// @name         BONanza Giveaway — Maghuro Fork
// @namespace    https://github.com/maghuro/unit3d-userscripts
// @description  UNIT3D BON giveaways for DarkPeers and Portugas with verified prizes, sponsorships and BON Pool contributions
// @version      1.4.2
// @author       🤖 T.R.A.V.I.S., Maghuro & M.A.E.S.T.R.O.
// @homepageURL  https://github.com/maghuro/unit3d-userscripts
// @supportURL   https://github.com/maghuro/unit3d-userscripts/issues
// @updateURL    https://raw.githubusercontent.com/maghuro/unit3d-userscripts/main/userscripts/giveaway/BONanza_Giveaway.user.js
// @downloadURL  https://raw.githubusercontent.com/maghuro/unit3d-userscripts/main/userscripts/giveaway/BONanza_Giveaway.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @license      GPL-3.0-or-later
// @match        https://darkpeers.org/
// @match        https://*.portugas.org/
// @run-at document-idle
// ==/UserScript==

// Generic UNIT3D fork of "Blutopia BON Giveaway" v6.2.2 by Nums (GPL-3.0-or-later).
// Canonical release path: userscripts/giveaway/BONanza_Giveaway.user.js.
// The legacy DarkPeers filename may mirror this release temporarily so existing
// installations can migrate to the canonical update URL without interruption.
//
// Changes in this fork:
//   - Site-specific behavior is isolated behind adapters. Current profiles:
//     DarkPeers (English) and Portugas (Portuguese, Portugal).
//   - Gifts use the tracker's real Send Gift form and are verified against
//     authenticated Gift History before any chat/SystemBot fallback.
//   - BON Pool contributions use the site's real page contract and require
//     independent post-transfer confirmation before success is announced.
//   - Portugas entry intake uses the authenticated chat API because its live
//     WebSocket/DOM can lag; DarkPeers keeps the mature DOM observer path.
//   - All user-visible text is centralized in a bilingual EN / PT-PT catalogue.
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
//   - v1.3.24 closes the one-shot audit findings: restores are host-bound and active
//     snapshots are namespaced per authenticated account; atomic cross-tab ownership
//     requires the browser Web Locks API; settlement remains resumable through transfer
//     verification; sponsor opening/closing boundaries constrain Gift History and both
//     in-flight Gift History/chat-fallback polls; host top-ups are serialized; delayed
//     verification is statement-bound with persisted pre-transfer verification boundaries;
//     BFCache documents quarantine all giveaway mutations/snapshots from pagehide and
//     persisted pageshow always reloads authoritative saved state instead of resuming stale
//     memory, pagehide quarantines even pre-data queued ownership work, quarantined
//     documents cannot acquire/reacquire ownership even from queued Web Lock callbacks,
//     and settlement resumes
//     must also reacquire exclusive ownership before transfers;
//     cross-tab gift attempts stay pending until their originating request resolves; a
//     new exclusive owner converts foreign orphaned pendings to ambiguous terminal work,
//     while superseded fallbacks abort before sending; rejected attempts remain retryable;
//     unknown Gift History clock offsets accept either timestamp interpretation when it
//     overlaps the window, while coarse closing-second rows require one-to-one precise
//     chat proof reserved across polling passes and the chat-only fallback applies the
//     same timestamp intervals; ambiguous cutoff rows remain unseen/retryable until
//     evidence resolves, and authoritative settlement output rechecks ownership before
//     and after every awaited closing send while its internal chatbox fallback also
//     fails closed after an ownership/quarantine handoff; closing outputs persist
//     pending/sent checkpoints, preserve null replay cursors, wait out the unresolved
//     POST window and require at least one authoritative cursor/time-bounded chat read
//     before replay; payout/refund verifiers
//     abort stale writes after ownership handoff; committed settlements freeze their
//     complete financial/payout/refund plan and never rediscover sponsors on resume;
//     optional sponsor cutoffs/clock offsets
//     preserve null instead of coercing it to epoch zero; and Gift
//     History opening bounds honor the source timestamp precision (including fractions).
//   - v1.3.25 promotes the completed v1.3.24 full-audit hardening to the stable
//     post-audit release. No new settlement logic is introduced in this bump.
//   - v1.3.26 fixes sponsor-scaling status semantics, keeps auto thresholds auto
//     unless explicitly edited, centralizes next-winner progress math, raises the
//     final sponsor-note recap limit to 900 visible characters, improves the bridge
//     marker used by sponsor-message recaps, and uses "spot on!" for exact guesses.
//     Follow-up: scaling status now distinguishes auto vs custom thresholds correctly,
//     uses one canonical next-winner progress calculation, and reports explicit
//     "progress" / "still needed" values at zero and exact-threshold boundaries.
//     Live-result polish: final sponsor-message recaps use a 900-visible-character
//     website-first limit, exact guesses say "spot on!", and the MESSAGES sentinel
//     uses canonical IRC 05 + bold instead of extended colour 16 for bridge reliability.
//   - v1.4.0 generalizes BONanza into a single UNIT3D userscript for DarkPeers
//     and Portugas, with site adapters, bilingual EN/PT-PT output, page-first gifts,
//     verified Livewire/form BON Pool contributions, Portugas API-based entry polling,
//     locale-safe usernames/amounts, and compact podium + remaining-winners results.
//     The experimental probes and the one-off 1000 BON Pool write test are removed
//     from the production release.
//   - v1.4.1 polishes the production generalization: Portugas uses one wildcard
//     host match, UNIT3D Gift History parses both decimal and locale-grouped BON
//     amounts safely, and the latest PT-PT wording/result presentation refinements
//     remain in the stable release.
//   - v1.4.2 compacts PT-PT configuration labels and donation guidance so the
//     450 px control panel stays readable without overflowing narrow controls.
//     The winner-scaling fields also use the available row width more efficiently.
//
//// Originally created as the DarkPeers BONanza fork by T.R.A.V.I.S. for the DarkPeers staff.
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
        final_recap_max_visible_chars: 900,
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

    // ── UNIT3D site profiles / adapters ─────────────────────────────
    // The giveaway engine below is site-agnostic. Tracker/version differences live
    // here and in the narrow transport helpers (chat, gifts, pool).
    const SITE_PROFILES = Object.freeze({
        "darkpeers.org": Object.freeze({
            id: "darkpeers",
            locale: "en",
            bridgeMarkers: true,
            chat: Object.freeze({
                fallbackRoomId: 2,
                entrySource: "dom",
                entryPollMs: 0,
                obfuscateDisplayNames: true
            }),
            gifts: Object.freeze({ allowChatFallback: true }),
            pool: Object.freeze({
                mode: "form",
                path: "/bon-pool",
                storePath: "/bon-pool/store",
                totalLabel: "Total contributions:",
                mineLabel: "Your contribution:"
            })
        }),
        "portugas.org": Object.freeze({
            id: "portugas",
            locale: "pt-PT",
            bridgeMarkers: false,
            chat: Object.freeze({
                fallbackRoomId: null,
                entrySource: "api",
                entryPollMs: 2000,
                obfuscateDisplayNames: false
            }),
            gifts: Object.freeze({ allowChatFallback: false }),
            pool: Object.freeze({
                mode: "livewire",
                path: "/pool",
                storePath: null,
                totalLabel: "Atual:",
                balanceLabel: "Tens:"
            })
        })
    });

    const SITE_HOST = String(location.hostname || "").toLowerCase().replace(/^www\./, "");
    const SITE = SITE_PROFILES[SITE_HOST] || null;
    if (!SITE) {
        console.warn(`[BONanza] Unsupported tracker host: ${location.hostname}`);
        return;
    }

    // Central message catalogue starts here. During the adapter refactor existing
    // English strings are moved here incrementally; Portugas is not enabled in
    // metadata until the catalogue/adapter pass is complete.
    const I18N = Object.freeze({
        en: Object.freeze({
            giftRefundNote: "Giveaway refund",
            giftWinnerSingle: "🎉 You won! Enjoy your {amount} BON!",
            giftWinnerRanked: "🎉 Congratulations on placing {rank}!",
            poolManualCheck: "Check the BON Pool manually before retrying anything.",

            durationHourOne: "{n} hour",
            durationHourMany: "{n} hours",
            durationMinuteOne: "{n} minute",
            durationMinuteMany: "{n} minutes",
            durationSecondOne: "{n} second",
            durationSecondMany: "{n} seconds",

            winnerWordOne: "winner",
            winnerWordMany: "winners",
            possibleWinners: "[b][color=#5DE2E7]{count} possible {word}[/color][/b]",
            upToWinners: " (up to [b][color=#5DE2E7]{max}[/color][/b])",

            introStandard: "{marker} I am hosting a giveaway for ",
            introPool: "{marker} 💙 [b][color={poolColor}]{poolNameUpper} CONTRIBUTION GIVEAWAY[/color][/b] 💙\nI am hosting a giveaway for ",
            introTaxes: "{marker} [b][color=#FF4F9A]RIGGING TAXES: {percent}% TO THE {poolNameUpper}[/color][/b]\nI am hosting a giveaway for ",
            introOpenFor: "Open for [b][color=#1DDC5D]{duration}[/color][/b]. ",
            pickNumber: "Pick a number [b]between [color=#DC3D1D]{start} and {end}[/color][/b]. ",
            giftHostHint: "✨[b][color=#FB4F4F]Gift the host to add to the pot! [color={hintColor}]/gift {host} AMOUNT MESSAGE[/color][/color][/b]✨",
            introPoolAllocation: "\n[b][color={poolColor}]{percent}%[/color][/b] of the final pot (including sponsor gifts) will be contributed directly to the [b]{poolName}[/b]. Winners receive the remaining {remaining}%.",
            introTaxAllocation: "\n[b][color=#FF4F9A]{percent}% rigging tax[/color][/b] will be taken from the final pot (including sponsor gifts) and paid directly into the [b]{poolName}[/b]. Winners keep the remaining {remaining}%. Entirely legitimate accounting. 😈",
            riggedModeIntro: "\n[color=#FF4F9A][b]RIGGED MODE ENGAGED![/b][/color] [i][color=#FF9AE6]Visual flair only — the math is still fair... probably.[/color][/i] 😈",
            silentModeIntro: "\n[color=#ff3333][b]SILENT MODE ENABLED![/b][/color] [i][color=#B0B0B0]Command replies will be sent privately via /msg.[/color][/i] 🤫",

            reminderTaxes: "🧾 [b][color=#FF4F9A]Rigging taxes: {percent}% to the {poolName}[/color][/b] 🧾\n",
            reminderPool: "💙 [b][color={poolColor}]{poolName} contribution giveaway ({percent}% to the pool)[/color][/b] 💙\n",
            reminderMain: "{marker} Ongoing giveaway for [b][color=#ffc00a]{amount} BON[/color][/b] | {winners} | Time left: [b][color=#1DDC5D]{duration}[/color][/b]. Pick a number [b]between [color=#DC3D1D]{start} and {end}[/color][/b]. [b][color=#5DE2E7]{custom}[/color][/b]\n{giftHint}",
            reminderSilent: "(Silent mode is enabled — command replies are sent via /msg.) 🤫",
            reminderRigged: "(Rigged mode is currently enabled, but the math is [b]definitely[/b] still legit) 😉",

            sponsorsAddedOne: "{marker} Sponsors just added [color=#DC3D1D][b]{amount} BON[/b][/color] from [b]1 sponsor[/b]! ",
            sponsorsAddedMany: "{marker} Sponsors just added [color=#DC3D1D][b]{amount} BON[/b][/color] from [b]{count} sponsors[/b]! ",
            totalPotNow: "Total pot is now [b][color=#ffc00a]{amount} BON[/color][/b].",
            withMessage: " with the message [i]\"{message}\"[/i]",
            withMessages: " with the messages {messages}",
            moreCount: " [i](+{count} more)[/i]",
            sponsorMessageHeadingOne: "{marker} Sponsor message",
            sponsorMessageHeadingMany: "{marker} Sponsor messages",
            finalSponsorThanks: "{marker} Thank you to all the sponsors! Total sponsored: [color=#ffc00a][b]{amount} BON[/b][/color].\n[b]Sponsors:[/b] {sponsors}",
            finalSponsorMessagesHeading: "{marker} [b]Messages from our sponsors:[/b]",

            scalingIncreased: "[b][color={accent}]Scaling:[/color][/b] [b]Winners increased[/b]: {old} → {new} (+{delta}). Total scaling contributions: {total} BON. Threshold: {threshold} BON/winner.",
            scalingMaxReached: " [b]Max winners reached[/b] ({cap}).",
            scalingMaxReachedPlain: "[b][color={accent}]Scaling:[/color][/b] [b]Max winners reached[/b] ({cap}).",
            scalingMaxReachedSoft: "[b][color={accent}]Scaling:[/color][/b] [i][color=#9aa0a6][b]Max winners reached[/b] ({cap}).[/color][/i]",
            scalingProgressDetail: "{remaining} BON still needed for winner #{next} (progress: {progress}/{threshold} BON).",
            scalingProgressPlain: "[b][color={accent}]Scaling:[/color][/b] [b]{detail}[/b]",
            scalingProgressSoft: "[b][color={accent}]Scaling:[/color][/b] [i][color=#9aa0a6][b]{detail}[/b][/color][/i]",

            winnerSummary: "🏆 {marker} Winning number: [b][color=#1DDC5D]{number}[/color][/b]. Winners drawn: [b][color=#5DE2E7]{winners}[/color][/b]. Total entrants: [b][color=#5DE2E7]{entrants}[/color][/b].",
            fundingSummary: "Funding - Host-funded: [b][color=#ffc00a]{hostFunded} BON[/color][/b] | Sponsored: [b][color=#00abff]{sponsored} BON[/color][/b] | Total pot: [b][color=#FFC00A]{total} BON[/color][/b].",
            exactGuess: "[color=#1DDC5D][b]SPOT ON[/b][/color]",
            offBy: "[color=#FB4F4F]{diff} away from the result[/color]",
            offByOne: "[color=#FB4F4F]1 number away from the result[/color]",
            offByMany: "[color=#FB4F4F]{diff} numbers away from the result[/color]",
            singleWinnerLine: "🥇 Congrats [b][color=#DC3D1D]{user}[/color][/b]! Guess [color=#1DDC5D][b]{guess}[/b][/color] was {accuracy} and wins [b][color=#FFC00A]{prize} BON[/color][/b].{note}",
            podiumWinnerLine: "{medal} [b][color=#DC3D1D]{user}[/color][/b] — {place} — guess [color=#1DDC5D][b]{guess}[/b][/color], {accuracy} — [color=#FFC00A][b]{prize} BON[/b][/color]",
            podiumWinnerPlace: "Winner",
            podiumRankPlace: "{rank} place",
            remainingWinnersLine: "Remaining winners: {winners}",
            remainingWinnerItem: "{rank} {user} ({prize})",
            tieResult: "{marker} We have a tie between {users}! [b][color=#DC3D1D]{winner}[/color][/b] wins the tie-breaker as their entry was submitted first!",
            amountsAfterPool: "\n[color=#aaaaaa]Amounts shown are after the {percent}% {poolName} donation.[/color]",

            poolConfirmed: "{marker} [b][color={poolColor}]{poolName} contribution confirmed:[/color][/b] [b][color={poolColor}]{amount} BON[/color][/b] paid directly into the pool.\nThank you for supporting the event! ✨",
            taxesConfirmed: "{marker} [b][color=#FF4F9A]TAXES PAID:[/color][/b] [b][color=#FFC00A]{amount} BON[/color][/b] successfully paid directly into the [b]{poolName}[/b]. The taxman is satisfied. 😈",
            warningRefunds: "[color=#ff4f4f][b]Warning:[/b][/color] Some sponsor refunds could not be confirmed. Please verify manually: {missing}.",
            warningWinnerGifts: "[color=#ff4f4f][b]Warning:[/b][/color] Some giveaway gifts could not be confirmed. Please manually verify BON for: {missing}.",
            allSlotsFilled: "All [b][color=#ffc00a]{count}[/color][/b] slot(s) filled! Ending early with [b][color=#1DDC5D]{remaining}[/color][/b] remaining!",
            alertInvalidAmount: "Please enter a valid numeric giveaway amount.",
            alertPositiveAmount: "Please enter a giveaway amount greater than zero.",
            alertMinimumPot: "GIVEAWAY ERROR: {winners} weighted winner(s) need a pot of at least {minimum} BON so every winner receives at least 1 BON.",
            alertOwnership: "Could not acquire exclusive giveaway ownership. Another tracker tab may already be running a giveaway, or this browser does not provide the Web Locks safety API.",
            alertChatroom: "GIVEAWAY ERROR: Unable to determine the active UNIT3D chat room.",
            alertBalanceUnavailable: "GIVEAWAY ERROR: Unable to verify your current BON balance right now. Please try again shortly.",
            alertBalanceLow: "GIVEAWAY ERROR: The amount entered ({amount}) is above your current BON ({balance}).",
            alertFinalSponsorSync: "Giveaway warning: final sponsor sync failed after 3 attempts. Settlement will use the last confirmed sponsor total; verify any very recent gifts manually.",
            alertPoolUnconfirmed: "BON Pool warning: the {amount} BON contribution could not be confirmed. Check {path} manually before retrying anything.",
            alertPoolZeroUnconfirmed: "BON Pool warning: the zero-entry full-pot contribution of {amount} BON could not be confirmed. Check {path} manually before retrying anything.",

            entryNaughtyBlocked: "[color=#d85e27]{user}[/color], you are on the [b]naughty list[/b] and may not enter the giveaway or use its commands.",
            entryAlreadyEntered: "🚫 Sorry [color=#d85e27]{user}[/color], but [color=#32cd53]you[/color] already entered with number [color=#DC3D1D][b]{number}[/b][/color]!",
            entryNumberTaken: "🚫 Sorry [color=#d85e27]{user}[/color], but [color=#32cd53]{other}[/color] already entered with number [color=#DC3D1D][b]{number}[/b][/color]!",
            entryOutOfRange: "🚫 Sorry [color=#d85e27]{user}[/color], but the number [color=#DC3D1D][b]{number}[/b][/color] is outside of the given range! Enter a number between [color=#DC3D1D][b]{start}[/b] and [b]{end}[/b][/color]!",
            entryConfirmed: "[color=#d85e27]{user}[/color] has entered with the number [color=#DC3D1D][b]{number}[/b][/color]! Time remaining: [b][color=#1DDC5D]{remaining}[/color][/b].",
            rigHintEntry: "(entry logged under [b]highly suspicious[/b] conditions) 😈",
            spamLockout: "[color=red][b]Spamming detected! {user} locked out for {seconds} seconds.[/b][/color]",

            timeLeftReply: "Time left: [b][color=#1DDC5D]{remaining}[/color][/b] {marker}",
            timeUsage: "[color=red]Usage:[/color] !time add|remove <minutes>",
            timeUsageExtended: "[color=red]Usage:[/color] !time add|remove <minutes> or !addtime|!removetime <minutes>",
            timeAdjusted: "{verb} [color=#DC3D1D][b]{minutes}[/b][/color] {minuteWord} {prep} the giveaway. New time left: [b][color=#1DDC5D]{remaining}[/color][/b].",
            timeAddedOne: "Added [color=#DC3D1D][b]1[/b][/color] minute to the giveaway. New time left: [b][color=#1DDC5D]{remaining}[/color][/b].",
            timeAddedMany: "Added [color=#DC3D1D][b]{minutes}[/b][/color] minutes to the giveaway. New time left: [b][color=#1DDC5D]{remaining}[/color][/b].",
            timeRemovedOne: "Removed [color=#DC3D1D][b]1[/b][/color] minute from the giveaway. New time left: [b][color=#1DDC5D]{remaining}[/color][/b].",
            timeRemovedMany: "Removed [color=#DC3D1D][b]{minutes}[/b][/color] minutes from the giveaway. New time left: [b][color=#1DDC5D]{remaining}[/color][/b].",
            wordAdded: "Added",
            wordRemoved: "Removed",
            wordTo: "to",
            wordFrom: "from",

            noEntriesYet: "[b]No entries yet! {total} numbers available.[/b]",
            entriesSummary: "{marker} Entries – {taken}/{total} [b]([color=#1DDC5D]{free} free[/color][/b]): {list}",
            noSavedStats: "[b]No saved stats yet for {user}.[/b]",
            noHistory: "[b]No giveaway history saved yet.[/b]",
            largestGiveaways: "[b]📈 Largest giveaways: {list}[/b]",
            giftUsage: "{marker} To send a gift type: /gift {host} amount message",
            giveawayAmount: "Giveaway Amount: [b][color=#FFB700]{amount} BON[/color][/b]",
            rangeValid: "Numbers between [color=#DC3D1D]{start} and {end}[/color] inclusive are valid.",
            noActiveGiveaway: "There is no active giveaway right now.",
            luckyDisabled: "🚫 Sorry [color=#d85e27]{user}[/color], but [color=#999999]!lucky[/color] has been disabled for this giveaway.",
            randomDisabled: "🚫 Sorry [color=#d85e27]{user}[/color], but [color=#999999]!random[/color] has been disabled for this giveaway.",
            noFreeNumbers: "All numbers are taken — no free numbers left!",
            noFreeNumbersAlt: "There are no free numbers left!",
            luckyNumber: "The current giveaway lucky number is: [b][color=#1DDC5D]{number}[/color][/b].",
            luckyeEntered: "[color=#d85e27]{user}[/color] used [color=#999999]!luckye[/color] and entered with lucky number [color=#1DDC5D][b]{number}[/b][/color]! Time remaining: [b][color=#1DDC5D]{remaining}[/color][/b].",
            randomEntered: "[color=#d85e27]{user}[/color] has entered with the number [color=#DC3D1D][b]{number}[/b][/color]! Time remaining: [b][color=#1DDC5D]{remaining}[/color][/b].",
            yourNumber: "[color=#d85e27]{user}[/color] your number is [color=#DC3D1D][b]{number}[/b][/color]",
            notEntered: "[color=#d85e27]{user}[/color] you are not currently in the giveaway.",
            freeDisabled: "🚫 Sorry [color=#d85e27]{user}[/color], !free disabled",
            freeNumbers: "Free numbers: {numbers}.",
            rigHintLucky: "(approved by the Official Rigging Committee™) ✅",
            rigHintRandom: "(chosen by our [b]totally unbiased[/b] chaos engine)",
            rigHintFree: "(these are some [b]suspiciously good[/b] numbers, trust me...) 😏",
            rigHintPot: "(pot size [b]carefully curated[/b] by our rigging department)",
            rigHintRange: "(this range has been [b]pre-approved[/b] for maximum riggability)",

            rigEnabled: "{marker} [color=#FF4F9A][b]RIGGED MODE ENGAGED![/b][/color] [i][color=#FF9AE6]Visual flair only — the math is still fair... probably.[/color][/i]",
            rigAlready: "[color=#FF4F9A][b]RIGGED MODE is already active![/b][/color]",
            rigDisabled: "{marker} [color=#32cd53][b]Rigged mode disabled.[/b][/color] [i][color=#A0E7AF]Back to boring, fully transparent fairness.[/color][/i]",
            rigNotEnabled: "[color=#32cd53][b]Rigged mode isn&#39;t enabled.[/b][/color]",
            rigDenyRig: [
                "🛑 Nice try {user}. The Rigging Lever™ is behind host-only glass.",
                "🚨 Unauthorized rig attempt by {user}. Deploying the Fairness Police…",
                "{user} tried to rig the giveaway. The universe said: “lol, no.”",
                "Sorry {user} — only the host has a license to operate the Rig-O-Matic™."
            ],
            rigDenyUnrig: [
                "Hold up {user}… you can’t unrig what you never rigged.",
                "🚫 Access denied, {user}. The “Unrig” button is guarded by a tiny, angry moderator.",
                "Nice try {user}. Only the host can turn off the Chaos Generator™.",
                "{user} reached for the unrig switch… and touched nothing but air."
            ],

            winnersUsage: "[color=red]Usage:[/color] !winners 1‑{max}",
            winnersInsufficientPot: "[color=red]Cannot set {winners} winners with the current {pot} BON pot. Weighted payouts require at least {minimum} BON.[/color]",
            hostWinnerAdjustment: "[b][color={accent}]Host adjustment:[/color][/b] [b]Winners {direction}[/b]: [b][color=#5DE2E7]{old} → {new} ({sign}{delta})[/color][/b].",
            wordIncreased: "increased",
            wordDecreased: "decreased",
            scalingCapReset: " [i][color=#9aa0a6]Scaling cap also reset to {count} — use !maxwinners to raise.[/color][/i]",
            winnersSet: "Number of winners set to [color=#1DDC5D][b]{count}[/b][/color].{capNote}",
            scalingDisabled: "[color=red]Scaling is not enabled for this giveaway.[/color]",
            maxWinnersUsage: "[color=red]Usage:[/color] !maxwinners {base}‑{max}",
            maxWinnersSet: "Max scaled winners set to [color=#1DDC5D][b]{max}[/b][/color]. Current effective winners: [b][color=#5DE2E7]{effective}[/color][/b].",
            scalingUnavailable: "Winner scaling is not available for this giveaway.",

            naughtyAddUsage: "[color=red]Usage:[/color] !naughty add username",
            naughtyRemoveUsage: "[color=red]Usage:[/color] !naughty remove username",
            naughtyUsage: "[color=red]Usage:[/color] !naughty (add|remove|list) username",
            naughtyHostDenied: "[color=red][b]The host can't be added to the naughty list![/b][/color]",
            naughtyAdded: "{marker} [color=#FFDE59]{user} added to the naughty list and removed from the giveaway.[/color]",
            naughtyRemoved: "🥳 [color=#7DDA58]{user} removed from the naughty list![/color]",
            naughtyList: "[color=#FFDE59]Naughty list: [b]{users}[/b][/color]",
            naughtyEmpty: "Naughty list is empty.",
            adminEndUsage: "[color=red]Admins must specify whose giveaway to end. Example: !end {host}[/color]",
            helpCommands: "Commands are {commands}.",

            hostTopupBusy: "[b][color=#FFDE59]A host BON top-up is already being verified. Please wait a moment.[/color][/b]",
            hostTopupUsage: "[b][color=red]Invalid usage.[/color] Example: !addbon 100[/b]",
            hostTopupBalanceUnavailable: "[b][color=red]Unable to verify your current BON balance right now. Please try !addbon again shortly.[/color][/b]",
            hostTopupInsufficient: "[b][color=red]You only have {balance} BON right now, so you can't increase the pot to {total} BON. Wait for more BON (or sponsor gifts) and try again.[/color][/b]",

            zeroEntryPoolOutcome: "Unfortunately, no one has entered the giveaway, so there are no winners.\n💙 The full pot of [b][color={poolColor}]{amount} BON[/color][/b] will be contributed directly to the [b]{poolName}[/b].",
            zeroEntryPoolConfirmed: "{marker} [b][color={poolColor}]{poolName} contribution confirmed:[/color][/b] [b][color={poolColor}]{amount} BON[/color][/b] paid directly into the pool.\nNo entrants — 100% of the pot was contributed. ✨",
            statsHeader: "[b]{marker} Stats: [color=#d85e27]{user}[/color] - {parts}[/b]",
            statEntered: "Entered [color=#ffc00a]{value}[/color]",
            statWins: "Wins [color=#1DDC5D]{value}[/color]",
            statLosses: "Losses [color=#CE2E30]{value}[/color]",
            statWR: "WR [color=#1DDC5D]{value}%[/color]",
            statWon: "Won [color=#ffc00a]{value} BON[/color]",
            statBest: "Best [color=#ffc00a]{value} BON[/color]",
            statSponsored: "Sponsored [color=#00abff]{value} BON[/color]",
            statHosted: "Hosted {value}",
            statGiven: "Given [color=#ffc00a]{value} BON[/color]",
            statSponsorsReceived: "Sponsors received [color=#00abff]{value} BON[/color]",
            statCurrentSponsors: "Current sponsors [color=#00abff]{value} BON[/color]",
            leaderboardHeader: "[b]{marker} {emoji} {label}: {list}[/b]",
            leaderboardTopWinners: "Top winners",
            leaderboardMostBon: "Most BON won",
            leaderboardTopSponsors: "Top all-time sponsors",
            leaderboardUnlucky: "Unlucky",
            noWinnerStats: "[b]No winner stats saved yet.[/b]",
            noSponsorStats: "[b]No sponsor stats saved yet.[/b]",
            noUnluckyStats: "[b]No unlucky stats saved yet.[/b]",
            unluckyEntered: "entered",
            unknownDate: "unknown date",

            scaleStatus: "[b][color={accent}]Scaling Status:[/color][/b] Winners: [b][color=#5DE2E7]{effective}[/color][/b] (base {base}{extra}, max {cap}). Extra-winner threshold: [b]{threshold} BON[/b] ({mode}). Scaling contributions: [b][color=#ffc00a]{total} BON[/color][/b]. ",
            scaleExtra: " + {count} from scaling",
            scaleModeCustom: "custom",
            scaleModeAuto: "auto",
            scaleReached: "[b]Max winners reached[/b].",
            scaleProgress: "Progress to winner #{next}: [b]{progress} / {threshold} BON[/b]. Still needed: [b][color=#FFDE59]{remaining} BON[/color][/b].",

            freeSuggestionNone: " There are no free numbers left!",
            freeSuggestionList: " Here are some free numbers you can try: [b][color=#1DDC5D]{numbers}[/color][/b].",

            hostTopupAdded: "Host added [color=#DC3D1D][b]{amount} BON[/b][/color].",
            hostTopupTotal: "Total pot: [b][color=#ffc00a]{amount} BON[/color][/b].",
            hostTopupScaling: "[b][color={accent}]Scaling:[/color][/b] [b]Winners increased[/b]: [b][color=#5DE2E7]{old} → {new} (+{delta})[/color][/b].",

            rigFinalNote: " (Rigged mode was active, but winners were still chosen [b]fairly[/b]… allegedly.) 👀",
            settlementScalingIncrease: "[b][color={accent}]Scaling:[/color][/b] [b]Winners increased[/b] by [b][color=#5DE2E7]+{count}[/color][/b] due to sponsorships.",
            taxesDue: "🧾 [b][color=#FF4F9A]Taxes due:[/color][/b] [b][color=#FFC00A]{amount} BON[/color][/b] ({percent}% of the pot) reserved for direct payment into the [b]{poolName}[/b]. Confirmation follows after settlement.",
            poolAllocation: "💙 [b][color={poolColor}]{poolName} allocation:[/color][/b] [b][color={poolColor}]{amount} BON[/color][/b] ({percent}% of the pot) reserved for direct contribution.",
            grossPrizeTaxes: "\n[color=#aaaaaa](Gross prize: {gross} BON · Taxes: {tax} BON)[/color]",
            grossPrizePool: "\n[color=#aaaaaa](Gross prize: {gross} BON · {poolName}: {pool} BON)[/color]",

            zeroEntryRefundBase: "Unfortunately, no one has entered the giveaway, so there are no winners.\n{marker} BON Pool is [b]0%[/b]: the host-funded [b][color=#ffc00a]{hostFunded} BON[/color][/b] remains with the host.",
            zeroEntryRefunds: " Sponsor contributions will be returned in full: {refunds}.",
            zeroEntryNoRefunds: " There are no sponsor contributions to return.",
            uiAppTitle: "BONanza Giveaway",
            uiToolbarLabel: "Giveaway",
            uiConflictTitle: "Disabled: the original BON Giveaway script is also installed. Remove one of them.",
            uiConflictToast: "DEACTIVATE THE ORIGINAL GIVEAWAY SCRIPT",
            uiMinimizePanel: "Minimize panel",
            uiReset: "Reset",
            uiSettings: "Settings",
            uiCommands: "Commands",
            uiPresets: "— Presets —",
            uiLoad: "Load",
            uiSave: "Save",
            uiLoadPresetTitle: "Load selected preset",
            uiSavePresetTitle: "Save current form as a preset",
            uiDeletePresetTitle: "Delete selected preset",
            uiGiveawayAmount: "Giveaway Amount",
            uiStartNumber: "Start #",
            uiEndNumber: "End #",
            uiTimeMin: "Time (min)",
            uiReminders: "# Reminders",
            uiEveryMin: "Every (min)",
            uiWinners: "# Winners",
            uiMaxWinners: "Max Winners",
            uiMaxWinnersTitle: "Hard cap: {max}. Scaling can’t exceed this.",
            uiScaleBonTitle: "Additional BON required to unlock each extra winner. Leave empty to auto-calculate from the starting pot.",
            uiScaleBonShortTitle: "Additional BON required to unlock each extra winner.",
            uiBonPerWinner: "BON/+Winner",
            uiAuto: "auto",
            uiMaxChars: "Max 100 chars",
            uiCustomMessage: "Custom Message",
            uiPoolDonation: "{poolName} donation",
            uiPoolDonationTitle: "Share of the final pot (host + sponsors) donated to the {poolName}. 0% runs a standard giveaway.",
            uiStart: "Start",
            uiStop: "Stop",
            uiStopTitle: "This will end the giveaway and send gifts to the winners",
            uiUser: "User",
            uiEntryNumber: "Entry #",
            uiWinner: "Winner",
            uiPrizeBon: "Prize BON",
            uiGift: "Gift",
            uiGiveawayLog: "Giveaway Log",
            uiNoEvents: "No events yet.",
            uiCopyLog: "Copy log",
            uiClearLog: "Clear log",
            uiStatements: "Giveaway statements",
            uiStatementsTitle: "The last {count} giveaway statements are kept on this browser.",
            uiSaveTxt: "Save .txt",
            uiSaveTxtTitle: "Download the selected statement as a .txt file",
            uiCopy: "Copy",
            uiCopyStatementTitle: "Copy the selected statement to the clipboard",

            uiEntryModes: "Entry Modes",
            uiChatReplies: "Chat & Replies",
            uiScalingRules: "Scaling & Rules",
            uiToggleAll: "Toggle all",
            uiToggleEntryModes: "Toggle all options in Entry Modes only.",
            uiToggleChatReplies: "Toggle all options in Chat & Replies only.",
            uiToggleScalingRules: "Toggle all options in Scaling & Rules only.",
            uiRandom: "Random",
            uiRandomTip: "Enable !random (enter with a random free number).",
            uiLucky: "Lucky",
            uiLuckyTip: "Enable !lucky (show lucky #) and !luckye (enter with lucky #).",
            uiFree: "Free",
            uiFreeTip: "Enable !free (show some available numbers).",
            uiEntryReplies: "Entry Replies",
            uiEntryRepliesTip: "When enabled, the bot replies when an entry is logged. Disable to reduce chat spam.",
            uiSilentMode: "Silent Mode",
            uiSilentModeTip: "When enabled, command replies are sent privately via /msg instead of public chat.",
            uiScaleWinners: "Scale Winners",
            uiScaleWinnersTip: "When enabled, winners may increase based on sponsorship BON (up to the max set in the giveaway form).",
            uiRiggedMode: "Rigged mode (visual only)",
            uiRiggedModeTip: "Rigged mode is purely cosmetic… allegedly.",
            uiShowLog: "Show Giveaway Log",
            uiShowLogTip: "Only controls Giveaway Log panel visibility. Logging still continues in the background.",
            uiRiggedWatermark: "RIGGED",
            uiRigOnTitle: "Rigged mode is ON (cosmetic only). Click to disable.",
            uiRigOffTitle: "Rigged mode is OFF (cosmetic only). Click to enable.",

            uiGeneralCommands: "General Commands",
            uiStatsCommands: "Stats Commands",
            uiEntryCommands: "Entry Commands",
            uiHelp: "Help",
            uiRiggingCommands: "Rigging Commands",
            uiBonCommands: "BON Commands",
            uiHostOnlyCommands: "Host-Only Commands",
            uiNaughtyList: "Naughty List",
            uiNaughtyAlert: "⚠⚠ !naughty excludes users from the giveaway entirely ⚠⚠ ************************USE RESPONSIBLY************************",
            uiHostPanel: "Host Panel",
            uiDragHostPanel: "Drag to move Host Panel",
            uiCloseHostPanel: "Close Host Panel",

            uiRequiresGiveaway: "Requires an active giveaway.",
            uiHostOnly: "Only the host can use this.",
            uiReminderNotDue: "No reminder is due right now.",
            uiRequired: "Required.",
            uiInteger: "Enter an integer.",
            uiMinimum: "Minimum: {value}.",
            uiMaximum: "Maximum: {value}.",
            uiInvalidValue: "Invalid value.",
            uiFixArguments: "Fix invalid arguments.",
            uiExample: "Example: {usage}",
            uiRequiredSuffix: "required",
            uiOptionalSuffix: "optional",
            uiPanelInitError: "Host Panel commands unavailable (init error).",
            uiNoCommands: "No commands found (registry empty). {detail}",
            uiRegistryEmpty: "{registry} has 0 entries.",

            uiDonationZeroRigged: "Rigged mode is active, but the tax rate is <b>0%</b>. Suspiciously generous. No {poolName} contribution.",
            uiDonationZeroStandard: "Standard giveaway. No {poolName} contribution.",
            uiDonationEstimate: " About <b>{estimate} BON</b> of a {pot} BON pot (more if sponsored).",
            uiDonationRigged: "🧾 <b style=\"color:#FF4F9A;\">{percent}% rigging taxes</b> will be taken from the final pot (host + sponsors) and paid <b>directly</b> into the {poolName}. Your outlay is unchanged.{estimate}",
            uiDonationStandard: "<b style=\"color:{color};\">{percent}%</b> of the final pot (host + sponsors) will be contributed <b>directly</b> to the {poolName}. Comes out of winnings; your outlay is unchanged.{estimate}",

            cmdTime: "Time",
            cmdTimeDesc: "Show remaining giveaway time.",
            cmdEntries: "Entries",
            cmdEntriesDesc: "List current entries.",
            cmdHelp: "Help",
            cmdHelpDesc: "Show available commands in chat.",
            cmdCommands: "Commands",
            cmdCommandsDesc: "Alias for !help.",
            cmdStats: "Stats",
            cmdStatsDesc: "Show saved stats for a user.",
            cmdTop: "Top",
            cmdTopDesc: "Top winners leaderboard.",
            cmdMost: "Most",
            cmdMostDesc: "Most BON won leaderboard.",
            cmdSponsors: "Sponsors",
            cmdSponsorsDesc: "Show top sponsors.",
            cmdUnlucky: "Unlucky",
            cmdUnluckyDesc: "Show most losses leaderboard.",
            cmdLargest: "Largest",
            cmdLargestDesc: "Show largest giveaways.",
            cmdGift: "Gift",
            cmdGiftDesc: "Show giveaway gift status.",
            cmdBon: "BON",
            cmdBonDesc: "Show current pot amount.",
            cmdRange: "Range",
            cmdRangeDesc: "Show valid entry range.",
            cmdLucky: "Lucky",
            cmdLuckyDesc: "Show lucky number.",
            cmdLuckyEnter: "Lucky Enter",
            cmdLuckyEnterDesc: "Enter using lucky number.",
            cmdRig: "Rig",
            cmdRigDesc: "Fun rig toggle command.",
            cmdUnrig: "Unrig",
            cmdUnrigDesc: "Fun rig toggle command.",
            cmdRandom: "Random",
            cmdRandomDesc: "Enter with a random number.",
            cmdNumber: "Number",
            cmdNumberDesc: "Show your current entry.",
            cmdFree: "Free",
            cmdFreeDesc: "Show available entry numbers.",
            cmdAddBon: "Add BON",
            cmdAddBonDesc: "Add BON to the pot.",
            cmdReminder: "Reminder",
            cmdReminderDesc: "Send reminder now.",
            cmdWinners: "Winners",
            cmdWinnersDesc: "Set winner count.",
            cmdMaxWinners: "Max Winners",
            cmdMaxWinnersDesc: "Set max scaled winners.",
            cmdScale: "Scale",
            cmdScaleDesc: "Show scaling progress.",
            cmdAddTime: "Add Time",
            cmdAddTimeDesc: "Add giveaway minutes.",
            cmdRemoveTime: "Remove Time",
            cmdRemoveTimeDesc: "Remove giveaway minutes.",
            cmdNaughty: "Naughty",
            cmdNaughtyDesc: "Manage naughty list.",
            cmdEnd: "End",
            cmdEndDesc: "End the active giveaway.",
            cmdUser: "User",
            cmdOptionalUser: "optional username",
            cmdAmount: "amount",
            cmdCount: "Count",
            cmdWinnersPlaceholder: "winners",
            cmdMax: "Max",
            cmdMaxPlaceholder: "max",
            cmdMinutes: "Min",
            cmdMinutesPlaceholder: "minutes",
            cmdAction: "Action",
            cmdActionPlaceholder: "action",
            cmdActionAdd: "Add",
            cmdActionRemove: "Remove",
            cmdActionList: "List",
            cmdActionHint: "Use add, remove, or list.",
            cmdUsername: "username",
            cmdUsernameHint: "Username is required for add/remove.",
            cmdHost: "Host",
            cmdOptionalHost: "optional host",
            uiTimerWholeMinutes: "Please enter a whole number of minutes (no decimals).",
            uiRigIndicatorAria: "Rigged mode indicator",
            uiConfirmReset: "Are you sure you want to reset the giveaway? This will clear all entries and cannot be undone.",
            uiConfirmClose: "A giveaway is currently running. Are you sure you want to close the menu? This will NOT end the giveaway, but you may lose track of its progress.",
            uiStartTitle: "Start the giveaway",
            uiRestorePanel: "Restore panel",
            uiHostPanelToggleTitle: "Open/close host command panel.",
            uiPresetPrompt: "Name this preset:",
            uiPresetDefault: "Preset {number}",
            uiPresetDeleteConfirm: "Delete preset \"{name}\"?",
            uiPrize: "Prize",
            uiGiftStatus: "Gift Status",
            uiSelf: "Self",
            uiHostSelfGift: "Host winner (no self-gift)",
            uiCheckingGift: "Checking gift status…",
            uiDirect: "direct",
            uiCheckingPool: "Checking BON Pool contribution…",
            uiRemindersMax: "# Reminders (max {max})",
            validationLetters: "Letters are not allowed—please enter valid integers.",
            validationIntegers: "Please enter valid integers (e.g., -5, 0, 10).",
            validationNumbersOnly: "Please enter numbers only.",
            validationEndAfterStart: "End # should be greater than or equal to Start #.",
            validationWinnersRange: "Please choose between 1 and {max} winners.",
            validationInvalidMaxWinners: "Invalid max winners.",
            validationMaxRange: "Must be between {min} and {max}.",
            validationIntegerWithRange: "Enter an integer. {range}",
            preflightChat: "active chat room could not be resolved",
            preflightIdentity: "authenticated chat user ID could not be resolved",
            preflightCsrf: "CSRF token is unavailable",
            preflightUser: "authenticated user page could not be resolved",
            preflightGift: "the real Send Gift form could not be validated",
            preflightPool: "the BON Pool page/contract could not be validated",
            alertPreflightFailed: "GIVEAWAY ERROR: Tracker compatibility preflight failed: {reason}."



        }),
        "pt-PT": Object.freeze({
            giftRefundNote: "Reembolso do passatempo",
            giftWinnerSingle: "🎉 Ganhaste! Aproveita os teus {amount} BON!",
            giftWinnerRanked: "🎉 Parabéns pelo {rank} lugar!",
            poolManualCheck: "Confirma manualmente a BON Pool antes de tentares novamente.",

            durationHourOne: "{n} hora",
            durationHourMany: "{n} horas",
            durationMinuteOne: "{n} minuto",
            durationMinuteMany: "{n} minutos",
            durationSecondOne: "{n} segundo",
            durationSecondMany: "{n} segundos",

            winnerWordOne: "vencedor",
            winnerWordMany: "vencedores",
            possibleWinners: "[b][color=#5DE2E7]{count} {word}[/color][/b]",
            upToWinners: " (até um máximo de [b][color=#5DE2E7]{max}[/color][/b])",

            introStandard: "{marker} Estou a organizar um passatempo de ",
            introPool: "{marker} 💙 [b][color={poolColor}]PASSATEMPO COM CONTRIBUIÇÃO PARA A {poolNameUpper}[/color][/b] 💙\nEstou a organizar um passatempo de ",
            introTaxes: "{marker} [b][color=#FF4F9A]IMPOSTO DO MODO VICIADO: {percent}% PARA A {poolNameUpper}[/color][/b]\nEstou a organizar um passatempo de ",
            introOpenFor: "Aberto durante [b][color=#1DDC5D]{duration}[/color][/b]. ",
            pickNumber: "Escolhe um número [b]entre [color=#DC3D1D]{start} e {end}[/color][/b]. ",
            giftHostHint: "✨[b][color=#FB4F4F]Envia uma oferta ao organizador para aumentar o prémio! [color={hintColor}]/gift {host} VALOR MENSAGEM[/color][/color][/b]✨",
            introPoolAllocation: "\n[b][color={poolColor}]{percent}%[/color][/b] do prémio final (incluindo as ofertas dos patrocinadores) será contribuído diretamente para a [b]{poolName}[/b]. Os vencedores recebem os restantes {remaining}%.",
            introTaxAllocation: "\n[b][color=#FF4F9A]{percent}% de imposto do Modo Viciado[/color][/b] será retirado do prémio final (incluindo as ofertas dos patrocinadores) e enviado diretamente para a [b]{poolName}[/b]. Os vencedores ficam com os restantes {remaining}%. Contabilidade totalmente legítima. 😈",
            riggedModeIntro: "\n[color=#FF4F9A][b]MODO VICIADO ATIVADO![/b][/color] [i][color=#FF9AE6]É só espetáculo — as contas continuam certas... provavelmente.[/color][/i] 😈",
            silentModeIntro: "\n[color=#ff3333][b]MODO SILENCIOSO ATIVADO![/b][/color] [i][color=#B0B0B0]As respostas aos comandos serão enviadas em privado por /msg.[/color][/i] 🤫",

            reminderTaxes: "🧾 [b][color=#FF4F9A]Imposto do Modo Viciado: {percent}% para a {poolName}[/color][/b] 🧾\n",
            reminderPool: "💙 [b][color={poolColor}]Passatempo com contribuição para a {poolName} ({percent}% do prémio)[/color][/b] 💙\n",
            reminderMain: "{marker} Passatempo a decorrer com [b][color=#ffc00a]{amount} BON[/color][/b] | {winners} | Tempo restante: [b][color=#1DDC5D]{duration}[/color][/b]. Escolhe um número [b]entre [color=#DC3D1D]{start} e {end}[/color][/b]. [b][color=#5DE2E7]{custom}[/color][/b]\n{giftHint}",
            reminderSilent: "(Modo silencioso ativo — as respostas aos comandos são enviadas por /msg.) 🤫",
            reminderRigged: "(Modo Viciado ativo — mas as contas continuam [b]certinhas[/b]... alegadamente.) 😉",

            sponsorsAddedOne: "{marker} Um patrocinador acabou de adicionar [color=#DC3D1D][b]{amount} BON[/b][/color]! ",
            sponsorsAddedMany: "{marker} [b]{count} patrocinadores[/b] acabaram de adicionar [color=#DC3D1D][b]{amount} BON[/b][/color]! ",
            totalPotNow: "O prémio total é agora [b][color=#ffc00a]{amount} BON[/color][/b].",
            withMessage: " com a mensagem [i]\"{message}\"[/i]",
            withMessages: " com as mensagens {messages}",
            moreCount: " [i](+{count} mais)[/i]",
            sponsorMessageHeadingOne: "{marker} Mensagem do patrocinador",
            sponsorMessageHeadingMany: "{marker} Mensagens dos patrocinadores",
            finalSponsorThanks: "{marker} Obrigado a todos os patrocinadores! Total patrocinado: [color=#ffc00a][b]{amount} BON[/b][/color].\n[b]Patrocinadores:[/b] {sponsors}",
            finalSponsorMessagesHeading: "{marker} [b]Mensagens dos patrocinadores:[/b]",

            scalingIncreased: "[b][color={accent}]Vencedores adicionais:[/color][/b] [b]Número de vencedores aumentado[/b]: {old} → {new} (+{delta}). Total contabilizado: {total} BON. Limite: {threshold} BON por vencedor extra.",
            scalingMaxReached: " [b]Máximo de vencedores atingido[/b] ({cap}).",
            scalingMaxReachedPlain: "[b][color={accent}]Vencedores adicionais:[/color][/b] [b]Limite máximo atingido[/b] ({cap}).",
            scalingMaxReachedSoft: "[b][color={accent}]Vencedores adicionais:[/color][/b] [i][color=#9aa0a6][b]Limite máximo atingido[/b] ({cap}).[/color][/i]",
            scalingProgressDetail: "Faltam {remaining} BON para o vencedor #{next} (progresso: {progress}/{threshold} BON).",
            scalingProgressPlain: "[b][color={accent}]Vencedores adicionais:[/color][/b] [b]{detail}[/b]",
            scalingProgressSoft: "[b][color={accent}]Vencedores adicionais:[/color][/b] [i][color=#9aa0a6][b]{detail}[/b][/color][/i]",

            winnerSummary: "🏆 {marker} Número vencedor: [b][color=#1DDC5D]{number}[/color][/b]. Vencedores apurados: [b][color=#5DE2E7]{winners}[/color][/b]. Total de participantes: [b][color=#5DE2E7]{entrants}[/color][/b].",
            fundingSummary: "Financiamento — Organizador: [b][color=#ffc00a]{hostFunded} BON[/color][/b] | Patrocínios: [b][color=#00abff]{sponsored} BON[/color][/b] | Prémio total: [b][color=#FFC00A]{total} BON[/color][/b].",
            exactGuess: "[color=#1DDC5D][b]acertou EM CHEIO[/b][/color]",
            offBy: "[color=#FB4F4F]ficou a {diff} números do resultado[/color]",
            offByOne: "[color=#FB4F4F]ficou a 1 número do resultado[/color]",
            offByMany: "[color=#FB4F4F]ficou a {diff} números do resultado[/color]",
            singleWinnerLine: "🥇 Parabéns [b][color=#DC3D1D]{user}[/color][/b]! O palpite [color=#1DDC5D][b]{guess}[/b][/color] {accuracy} e ganha [b][color=#FFC00A]{prize} BON[/color][/b].{note}",
            podiumWinnerLine: "{medal} [b][color=#DC3D1D]{user}[/color][/b] — {place} — palpite [color=#1DDC5D][b]{guess}[/b][/color], {accuracy} — [color=#FFC00A][b]{prize} BON[/b][/color]",
            podiumWinnerPlace: "Vencedor",
            podiumRankPlace: "{rank} lugar",
            remainingWinnersLine: "Restantes vencedores: {winners}",
            remainingWinnerItem: "{rank} {user} ({prize})",
            tieResult: "{marker} Temos um empate entre {users}! [b][color=#DC3D1D]{winner}[/color][/b] vence o desempate porque submeteu a entrada primeiro!",
            amountsAfterPool: "\n[color=#aaaaaa]Os valores apresentados já são após a contribuição de {percent}% para a {poolName}.[/color]",

            poolConfirmed: "{marker} [b][color={poolColor}]Contribuição para a {poolName} confirmada:[/color][/b] [b][color={poolColor}]{amount} BON[/color][/b] transferidos diretamente.\nObrigado por apoiares o passatempo! ✨",
            taxesConfirmed: "{marker} [b][color=#FF4F9A]IMPOSTO PAGO:[/color][/b] [b][color=#FFC00A]{amount} BON[/color][/b] transferidos diretamente para a [b]{poolName}[/b]. O cobrador está satisfeito. 😈",
            warningRefunds: "[color=#ff4f4f][b]Aviso:[/b][/color] Não foi possível confirmar alguns reembolsos a patrocinadores. Confirma manualmente: {missing}.",
            warningWinnerGifts: "[color=#ff4f4f][b]Aviso:[/b][/color] Não foi possível confirmar alguns prémios. Confirma manualmente os BON enviados a: {missing}.",
            allSlotsFilled: "Todos os [b][color=#ffc00a]{count}[/color][/b] números foram preenchidos! A terminar mais cedo, ainda com [b][color=#1DDC5D]{remaining}[/color][/b]!",
            alertInvalidAmount: "Introduz um valor numérico válido para o passatempo.",
            alertPositiveAmount: "Introduz um valor de BON superior a zero.",
            alertMinimumPot: "ERRO DO PASSATEMPO: {winners} vencedor(es) ponderados precisam de um prémio mínimo de {minimum} BON para que todos recebam pelo menos 1 BON.",
            alertOwnership: "Não foi possível obter controlo exclusivo do passatempo. Outra aba do tracker pode já estar a executar um passatempo, ou este navegador não disponibiliza a API Web Locks.",
            alertChatroom: "ERRO DO PASSATEMPO: não foi possível determinar a sala de chat UNIT3D ativa.",
            alertBalanceUnavailable: "ERRO DO PASSATEMPO: não foi possível confirmar o teu saldo BON atual. Tenta novamente dentro de instantes.",
            alertBalanceLow: "ERRO DO PASSATEMPO: o valor introduzido ({amount}) é superior ao teu saldo BON atual ({balance}).",
            alertFinalSponsorSync: "Aviso do passatempo: a sincronização final dos patrocínios falhou após 3 tentativas. O encerramento usará o último total confirmado; confirma manualmente ofertas muito recentes.",
            alertPoolUnconfirmed: "Aviso BON Pool: não foi possível confirmar a contribuição de {amount} BON. Confirma {path} manualmente antes de tentares novamente.",
            alertPoolZeroUnconfirmed: "Aviso BON Pool: não foi possível confirmar a contribuição integral de {amount} BON sem participantes. Confirma {path} manualmente antes de tentares novamente.",

            entryNaughtyBlocked: "[color=#d85e27]{user}[/color], estás na [b]lista de excluídos[/b] e não podes participar no passatempo nem usar os seus comandos.",
            entryAlreadyEntered: "🚫 Desculpa [color=#d85e27]{user}[/color], mas [color=#32cd53]já[/color] participaste com o número [color=#DC3D1D][b]{number}[/b][/color]!",
            entryNumberTaken: "🚫 Desculpa [color=#d85e27]{user}[/color], mas [color=#32cd53]{other}[/color] já escolheu o número [color=#DC3D1D][b]{number}[/b][/color]!",
            entryOutOfRange: "🚫 Desculpa [color=#d85e27]{user}[/color], mas o número [color=#DC3D1D][b]{number}[/b][/color] está fora do intervalo! Escolhe um número entre [color=#DC3D1D][b]{start}[/b] e [b]{end}[/b][/color]!",
            entryConfirmed: "[color=#d85e27]{user}[/color] entrou com o número [color=#DC3D1D][b]{number}[/b][/color]! Tempo restante: [b][color=#1DDC5D]{remaining}[/color][/b].",
            rigHintEntry: "(entrada registada em condições [b]altamente suspeitas[/b]) 😈",
            spamLockout: "[color=red][b]Spam detetado! {user} bloqueado durante {seconds} segundos.[/b][/color]",

            timeLeftReply: "Tempo restante: [b][color=#1DDC5D]{remaining}[/color][/b] {marker}",
            timeUsage: "[color=red]Utilização:[/color] !time add|remove <minutos>",
            timeUsageExtended: "[color=red]Utilização:[/color] !time add|remove <minutos> ou !addtime|!removetime <minutos>",
            timeAdjusted: "{verb} [color=#DC3D1D][b]{minutes}[/b][/color] {minuteWord} {prep} o passatempo. Novo tempo restante: [b][color=#1DDC5D]{remaining}[/color][/b].",
            timeAddedOne: "Adicionado [color=#DC3D1D][b]1[/b][/color] minuto ao passatempo. Novo tempo restante: [b][color=#1DDC5D]{remaining}[/color][/b].",
            timeAddedMany: "Adicionados [color=#DC3D1D][b]{minutes}[/b][/color] minutos ao passatempo. Novo tempo restante: [b][color=#1DDC5D]{remaining}[/color][/b].",
            timeRemovedOne: "Retirado [color=#DC3D1D][b]1[/b][/color] minuto ao passatempo. Novo tempo restante: [b][color=#1DDC5D]{remaining}[/color][/b].",
            timeRemovedMany: "Retirados [color=#DC3D1D][b]{minutes}[/b][/color] minutos ao passatempo. Novo tempo restante: [b][color=#1DDC5D]{remaining}[/color][/b].",
            wordAdded: "Adicionados",
            wordRemoved: "Removidos",
            wordTo: "ao",
            wordFrom: "do",

            noEntriesYet: "[b]Ainda não há entradas! {total} números disponíveis.[/b]",
            entriesSummary: "{marker} Entradas – {taken}/{total} [b]([color=#1DDC5D]{free} livres[/color][/b]): {list}",
            noSavedStats: "[b]Ainda não existem estatísticas guardadas para {user}.[/b]",
            noHistory: "[b]Ainda não existe histórico de passatempos guardado.[/b]",
            largestGiveaways: "[b]📈 Maiores passatempos: {list}[/b]",
            giftUsage: "{marker} Para patrocinar o passatempo, escreve: /gift {host} valor mensagem",
            giveawayAmount: "Valor do passatempo: [b][color=#FFB700]{amount} BON[/color][/b]",
            rangeValid: "São válidos os números entre [color=#DC3D1D]{start} e {end}[/color], inclusive.",
            noActiveGiveaway: "Não existe nenhum passatempo ativo neste momento.",
            luckyDisabled: "🚫 Desculpa [color=#d85e27]{user}[/color], mas o [color=#999999]!lucky[/color] está desativado neste passatempo.",
            randomDisabled: "🚫 Desculpa [color=#d85e27]{user}[/color], mas o [color=#999999]!random[/color] está desativado neste passatempo.",
            noFreeNumbers: "Todos os números estão ocupados — não há números livres!",
            noFreeNumbersAlt: "Não há números livres!",
            luckyNumber: "O número da sorte deste passatempo é [b][color=#1DDC5D]{number}[/color][/b].",
            luckyeEntered: "[color=#d85e27]{user}[/color] usou [color=#999999]!luckye[/color] e entrou com o número da sorte [color=#1DDC5D][b]{number}[/b][/color]! Tempo restante: [b][color=#1DDC5D]{remaining}[/color][/b].",
            randomEntered: "[color=#d85e27]{user}[/color] entrou com o número [color=#DC3D1D][b]{number}[/b][/color]! Tempo restante: [b][color=#1DDC5D]{remaining}[/color][/b].",
            yourNumber: "[color=#d85e27]{user}[/color], o teu número é [color=#DC3D1D][b]{number}[/b][/color]",
            notEntered: "[color=#d85e27]{user}[/color], não estás atualmente no passatempo.",
            freeDisabled: "🚫 Desculpa [color=#d85e27]{user}[/color], !free desativado",
            freeNumbers: "Números livres: {numbers}.",
            rigHintLucky: "(aprovado pelo Comité Oficial do Modo Viciado™) ✅",
            rigHintRandom: "(escolhido pelo nosso motor de caos [b]totalmente imparcial[/b])",
            rigHintFree: "(estes são números [b]suspeitosamente bons[/b], confia...) 😏",
            rigHintPot: "(prémio [b]cuidadosamente afinado[/b] pelo departamento do Modo Viciado)",
            rigHintRange: "(este intervalo foi [b]pré-aprovado[/b] para máxima suspeição)",

            rigEnabled: "{marker} [color=#FF4F9A][b]MODO VICIADO ATIVADO![/b][/color] [i][color=#FF9AE6]É só espetáculo — as contas continuam certas... provavelmente.[/color][/i]",
            rigAlready: "[color=#FF4F9A][b]O Modo Viciado já está ativo![/b][/color]",
            rigDisabled: "{marker} [color=#32cd53][b]Modo Viciado desativado.[/b][/color] [i][color=#A0E7AF]De volta à aborrecida e completamente transparente justiça.[/color][/i]",
            rigNotEnabled: "[color=#32cd53][b]O Modo Viciado não está ativo.[/b][/color]",
            rigDenyRig: [
                "🛑 Boa tentativa, {user}. A Alavanca do Modo Viciado™ está reservada ao organizador.",
                "🚨 Tentativa de viciar o passatempo por {user}. A chamar a Polícia da Justiça…",
                "{user} tentou viciar o passatempo. O universo respondeu: “lol, não.”",
                "Desculpa {user} — só o organizador tem licença para operar o Vicia-O-Matic™."
            ],
            rigDenyUnrig: [
                "Calma, {user}… não podes des-viciar aquilo que nunca viciaste.",
                "🚫 Acesso negado, {user}. O botão de emergência é guardado por um moderador minúsculo e zangado.",
                "Boa tentativa, {user}. Só o organizador pode desligar o Gerador de Caos™.",
                "{user} tentou chegar ao interruptor… e apanhou apenas ar."
            ],

            winnersUsage: "[color=red]Utilização:[/color] !winners 1‑{max}",
            winnersInsufficientPot: "[color=red]Não é possível definir {winners} vencedores com o prémio atual de {pot} BON. Os pagamentos ponderados exigem pelo menos {minimum} BON.[/color]",
            hostWinnerAdjustment: "[b][color={accent}]Ajuste do organizador:[/color][/b] [b]Vencedores {direction}[/b]: [b][color=#5DE2E7]{old} → {new} ({sign}{delta})[/color][/b].",
            wordIncreased: "aumentados",
            wordDecreased: "reduzidos",
            scalingCapReset: " [i][color=#9aa0a6]O limite de vencedores também foi reposto para {count} — usa !maxwinners para o aumentar.[/color][/i]",
            winnersSet: "Número de vencedores definido para [color=#1DDC5D][b]{count}[/b][/color].{capNote}",
            scalingDisabled: "[color=red]Os vencedores adicionais não estão ativos neste passatempo.[/color]",
            maxWinnersUsage: "[color=red]Utilização:[/color] !maxwinners {base}‑{max}",
            maxWinnersSet: "Limite máximo de vencedores definido para [color=#1DDC5D][b]{max}[/b][/color]. Vencedores atuais: [b][color=#5DE2E7]{effective}[/color][/b].",
            scalingUnavailable: "A opção de vencedores adicionais não está disponível neste passatempo.",

            naughtyAddUsage: "[color=red]Utilização:[/color] !naughty add utilizador",
            naughtyRemoveUsage: "[color=red]Utilização:[/color] !naughty remove utilizador",
            naughtyUsage: "[color=red]Utilização:[/color] !naughty (add|remove|list) utilizador",
            naughtyHostDenied: "[color=red][b]O organizador não pode ser adicionado à lista de excluídos![/b][/color]",
            naughtyAdded: "{marker} [color=#FFDE59]{user} foi adicionado à lista de excluídos e removido do passatempo.[/color]",
            naughtyRemoved: "🥳 [color=#7DDA58]{user} foi removido da lista de excluídos![/color]",
            naughtyList: "[color=#FFDE59]Lista de excluídos: [b]{users}[/b][/color]",
            naughtyEmpty: "A lista de excluídos está vazia.",
            adminEndUsage: "[color=red]Os administradores têm de indicar o organizador do passatempo que querem terminar. Exemplo: !end {host}[/color]",
            helpCommands: "Os comandos são {commands}.",

            hostTopupBusy: "[b][color=#FFDE59]Já está a ser verificado um reforço de BON do organizador. Aguarda um momento.[/color][/b]",
            hostTopupUsage: "[b][color=red]Utilização inválida.[/color] Exemplo: !addbon 100[/b]",
            hostTopupBalanceUnavailable: "[b][color=red]Não foi possível confirmar o teu saldo BON atual. Tenta !addbon novamente dentro de instantes.[/color][/b]",
            hostTopupInsufficient: "[b][color=red]Neste momento só tens {balance} BON, por isso não podes aumentar o prémio para {total} BON. Espera por mais BON (ou por novos patrocínios) e tenta novamente.[/color][/b]",

            zeroEntryPoolOutcome: "Infelizmente, ninguém participou no passatempo, por isso não há vencedores.\n💙 O prémio total de [b][color={poolColor}]{amount} BON[/color][/b] será contribuído diretamente para a [b]{poolName}[/b].",
            zeroEntryPoolConfirmed: "{marker} [b][color={poolColor}]Contribuição para a {poolName} confirmada:[/color][/b] [b][color={poolColor}]{amount} BON[/color][/b] transferidos diretamente.\nSem participantes — 100% do prémio foi contribuído. ✨",
            statsHeader: "[b]{marker} Estatísticas: [color=#d85e27]{user}[/color] - {parts}[/b]",
            statEntered: "Participações [color=#ffc00a]{value}[/color]",
            statWins: "Vitórias [color=#1DDC5D]{value}[/color]",
            statLosses: "Derrotas [color=#CE2E30]{value}[/color]",
            statWR: "Taxa de vitória [color=#1DDC5D]{value}%[/color]",
            statWon: "Ganhou [color=#ffc00a]{value} BON[/color]",
            statBest: "Melhor [color=#ffc00a]{value} BON[/color]",
            statSponsored: "Patrocinou [color=#00abff]{value} BON[/color]",
            statHosted: "Passatempos organizados {value}",
            statGiven: "BON distribuídos [color=#ffc00a]{value}[/color]",
            statSponsorsReceived: "Patrocínios recebidos [color=#00abff]{value} BON[/color]",
            statCurrentSponsors: "Patrocínios neste passatempo [color=#00abff]{value} BON[/color]",
            leaderboardHeader: "[b]{marker} {emoji} {label}: {list}[/b]",
            leaderboardTopWinners: "Mais vitórias",
            leaderboardMostBon: "Mais BON ganhos",
            leaderboardTopSponsors: "Maiores patrocinadores de sempre",
            leaderboardUnlucky: "Mais azarados",
            noWinnerStats: "[b]Ainda não existem estatísticas de vencedores.[/b]",
            noSponsorStats: "[b]Ainda não existem estatísticas de patrocinadores.[/b]",
            noUnluckyStats: "[b]Ainda não existem estatísticas de azarados.[/b]",
            unluckyEntered: "entradas",
            unknownDate: "data desconhecida",

            scaleStatus: "[b][color={accent}]Vencedores adicionais:[/color][/b] Total atual: [b][color=#5DE2E7]{effective}[/color][/b] (base {base}{extra}, limite {cap}). São necessários [b]{threshold} BON[/b] por vencedor extra ({mode}). Contribuições contabilizadas: [b][color=#ffc00a]{total} BON[/color][/b]. ",
            scaleExtra: " + {count} adicionais",
            scaleModeCustom: "definido manualmente",
            scaleModeAuto: "automático",
            scaleReached: "[b]Máximo de vencedores atingido[/b].",
            scaleProgress: "Progresso para o vencedor #{next}: [b]{progress} / {threshold} BON[/b]. Ainda faltam: [b][color=#FFDE59]{remaining} BON[/color][/b].",

            freeSuggestionNone: " Não há números livres!",
            freeSuggestionList: " Podes tentar estes números livres: [b][color=#1DDC5D]{numbers}[/color][/b].",

            hostTopupAdded: "O organizador adicionou [color=#DC3D1D][b]{amount} BON[/b][/color].",
            hostTopupTotal: "Prémio total: [b][color=#ffc00a]{amount} BON[/color][/b].",
            hostTopupScaling: "[b][color={accent}]Vencedores adicionais:[/color][/b] [b]Número de vencedores aumentado[/b]: [b][color=#5DE2E7]{old} → {new} (+{delta})[/color][/b].",

            rigFinalNote: " (O Modo Viciado esteve ativo, mas os vencedores continuaram a ser escolhidos [b]de forma justa[/b]… alegadamente.) 👀",
            settlementScalingIncrease: "[b][color={accent}]Vencedores adicionais:[/color][/b] [b]Número de vencedores aumentado[/b] em [b][color=#5DE2E7]+{count}[/color][/b] graças aos patrocínios.",
            taxesDue: "🧾 [b][color=#FF4F9A]Imposto do Modo Viciado:[/color][/b] [b][color=#FFC00A]{amount} BON[/color][/b] ({percent}% do prémio) reservados para envio direto para a [b]{poolName}[/b]. A contribuição será confirmada no fim dos pagamentos.",
            poolAllocation: "💙 [b][color={poolColor}]Contribuição para a {poolName}:[/color][/b] [b][color={poolColor}]{amount} BON[/color][/b] ({percent}% do prémio) reservados para transferência direta.",
            grossPrizeTaxes: "\n[color=#aaaaaa](Prémio bruto: {gross} BON · Imposto: {tax} BON)[/color]",
            grossPrizePool: "\n[color=#aaaaaa](Prémio bruto: {gross} BON · {poolName}: {pool} BON)[/color]",

            zeroEntryRefundBase: "Infelizmente, ninguém participou no passatempo, por isso não há vencedores.\n{marker} A contribuição para a BON Pool é [b]0%[/b]: os [b][color=#ffc00a]{hostFunded} BON[/color][/b] do organizador permanecem com ele.",
            zeroEntryRefunds: " Os patrocínios serão devolvidos na totalidade: {refunds}.",
            zeroEntryNoRefunds: " Não existem patrocínios para devolver.",
            uiAppTitle: "BONanza Giveaway",
            uiToolbarLabel: "Passatempo",
            uiConflictTitle: "Desativado: o script BON Giveaway original também está instalado. Remove um deles.",
            uiConflictToast: "DESATIVA O SCRIPT GIVEAWAY ORIGINAL",
            uiMinimizePanel: "Minimizar painel",
            uiReset: "Repor",
            uiSettings: "Definições",
            uiCommands: "Comandos",
            uiPresets: "— Predefinições —",
            uiLoad: "Carregar",
            uiSave: "Guardar",
            uiLoadPresetTitle: "Carregar a predefinição selecionada",
            uiSavePresetTitle: "Guardar o formulário atual como predefinição",
            uiDeletePresetTitle: "Eliminar a predefinição selecionada",
            uiGiveawayAmount: "Prémio",
            uiStartNumber: "N.º inicial",
            uiEndNumber: "N.º final",
            uiTimeMin: "Tempo (min)",
            uiReminders: "Lembretes",
            uiEveryMin: "Intervalo (min)",
            uiWinners: "Vencedores",
            uiMaxWinners: "Máx. vencedores",
            uiMaxWinnersTitle: "Limite absoluto: {max}. O número de vencedores nunca pode ultrapassá-lo.",
            uiScaleBonTitle: "BON adicionais necessários para desbloquear cada vencedor extra. Deixa vazio para calcular automaticamente a partir do prémio inicial.",
            uiScaleBonShortTitle: "BON adicionais necessários para desbloquear cada vencedor extra.",
            uiBonPerWinner: "BON/+vencedor",
            uiAuto: "automático",
            uiMaxChars: "Máx. 100 caracteres",
            uiCustomMessage: "Mensagem",
            uiPoolDonation: "{poolName} (%)",
            uiPoolDonationTitle: "Percentagem do prémio final (organizador + patrocínios) contribuída para a {poolName}. Com 0%, não há contribuição.",
            uiStart: "Iniciar",
            uiStop: "Terminar",
            uiStopTitle: "Isto termina o passatempo e envia os prémios aos vencedores",
            uiUser: "Utilizador",
            uiEntryNumber: "Número",
            uiWinner: "Vencedor",
            uiPrizeBon: "Prémio BON",
            uiGift: "Envio",
            uiGiveawayLog: "Registo do passatempo",
            uiNoEvents: "Ainda não há eventos.",
            uiCopyLog: "Copiar registo",
            uiClearLog: "Limpar registo",
            uiStatements: "Relatórios do passatempo",
            uiStatementsTitle: "Os últimos {count} relatórios do passatempo são guardados neste navegador.",
            uiSaveTxt: "Guardar .txt",
            uiSaveTxtTitle: "Descarregar o relatório selecionado como ficheiro .txt",
            uiCopy: "Copiar",
            uiCopyStatementTitle: "Copiar o relatório selecionado para a área de transferência",

            uiEntryModes: "Participação",
            uiChatReplies: "Chat e respostas",
            uiScalingRules: "Vencedores e regras",
            uiToggleAll: "Alternar",
            uiToggleEntryModes: "Ativar/desativar todas as opções de participação.",
            uiToggleChatReplies: "Ativar/desativar todas as opções de chat e respostas.",
            uiToggleScalingRules: "Ativar/desativar todas as opções de vencedores e regras.",
            uiRandom: "Aleatório",
            uiRandomTip: "Ativar !random (entrar com um número livre aleatório).",
            uiLucky: "Sorte",
            uiLuckyTip: "Ativar !lucky (mostrar o número da sorte) e !luckye (entrar com esse número).",
            uiFree: "Livres",
            uiFreeTip: "Ativar !free (mostrar alguns números disponíveis).",
            uiEntryReplies: "Respostas",
            uiEntryRepliesTip: "Quando ativo, o bot responde quando uma entrada é registada. Desativa para reduzir spam no chat.",
            uiSilentMode: "Modo silencioso",
            uiSilentModeTip: "Quando ativo, as respostas aos comandos são enviadas em privado por /msg em vez do chat público.",
            uiScaleWinners: "Vencedores extra",
            uiScaleWinnersTip: "Quando ativo, os patrocínios podem aumentar o número de vencedores, até ao limite definido no formulário.",
            uiRiggedMode: "Modo Viciado",
            uiRiggedModeTip: "O Modo Viciado é apenas visual… alegadamente.",
            uiShowLog: "Mostrar registo",
            uiShowLogTip: "Controla apenas a visibilidade do painel de registo. O registo continua em segundo plano.",
            uiRiggedWatermark: "VICIADO",
            uiRigOnTitle: "Modo Viciado ATIVO (apenas visual). Clica para desativar.",
            uiRigOffTitle: "Modo Viciado DESATIVADO (apenas visual). Clica para ativar.",

            uiGeneralCommands: "Comandos gerais",
            uiStatsCommands: "Comandos de estatísticas",
            uiEntryCommands: "Comandos de participação",
            uiHelp: "Ajuda",
            uiRiggingCommands: "Comandos do Modo Viciado",
            uiBonCommands: "Comandos do prémio",
            uiHostOnlyCommands: "Comandos do organizador",
            uiNaughtyList: "Lista de excluídos",
            uiNaughtyAlert: "⚠⚠ !naughty exclui totalmente utilizadores do passatempo ⚠⚠ ************************USA COM RESPONSABILIDADE************************",
            uiHostPanel: "Painel do organizador",
            uiDragHostPanel: "Arrasta para mover o painel do organizador",
            uiCloseHostPanel: "Fechar painel do organizador",

            uiRequiresGiveaway: "Requer um passatempo ativo.",
            uiHostOnly: "Apenas o organizador pode usar isto.",
            uiReminderNotDue: "Ainda não é altura de enviar um lembrete.",
            uiRequired: "Obrigatório.",
            uiInteger: "Introduz um número inteiro.",
            uiMinimum: "Mínimo: {value}.",
            uiMaximum: "Máximo: {value}.",
            uiInvalidValue: "Valor inválido.",
            uiFixArguments: "Corrige os argumentos inválidos.",
            uiExample: "Exemplo: {usage}",
            uiRequiredSuffix: "obrigatório",
            uiOptionalSuffix: "opcional",
            uiPanelInitError: "Comandos do painel do organizador indisponíveis (erro de inicialização).",
            uiNoCommands: "Não foram encontrados comandos (registo vazio). {detail}",
            uiRegistryEmpty: "{registry} tem 0 entradas.",

            uiDonationZeroRigged: "O Modo Viciado está ativo, mas o imposto é <b>0%</b>. Suspeitosamente generoso. Sem contribuição para a {poolName}.",
            uiDonationZeroStandard: "Passatempo normal. Sem contribuição para a {poolName}.",
            uiDonationEstimate: " ≈ <b>{estimate} BON</b> num prémio de {pot} BON (mais com patrocínios).",
            uiDonationRigged: "🧾 <b style=\"color:#FF4F9A;\">{percent}% de imposto</b> do prémio final (organizador + patrocínios) vai para a {poolName}. O teu custo não muda.{estimate}",
            uiDonationStandard: "<b style=\"color:{color};\">{percent}%</b> do prémio final (organizador + patrocínios) vai para a {poolName}. Sai dos prémios; o teu custo não muda.{estimate}",

            cmdTime: "Tempo",
            cmdTimeDesc: "Mostrar o tempo restante do passatempo.",
            cmdEntries: "Entradas",
            cmdEntriesDesc: "Listar as entradas atuais.",
            cmdHelp: "Ajuda",
            cmdHelpDesc: "Mostrar os comandos disponíveis no chat.",
            cmdCommands: "Comandos",
            cmdCommandsDesc: "Equivale a !help.",
            cmdStats: "Estatísticas",
            cmdStatsDesc: "Mostrar estatísticas guardadas de um utilizador.",
            cmdTop: "Mais vitórias",
            cmdTopDesc: "Mostrar quem tem mais vitórias.",
            cmdMost: "Mais BON ganhos",
            cmdMostDesc: "Mostrar quem ganhou mais BON.",
            cmdSponsors: "Patrocinadores",
            cmdSponsorsDesc: "Mostrar os maiores patrocinadores.",
            cmdUnlucky: "Mais azarados",
            cmdUnluckyDesc: "Mostrar quem acumulou mais derrotas.",
            cmdLargest: "Maiores prémios",
            cmdLargestDesc: "Mostrar os passatempos com os maiores prémios.",
            cmdGift: "Patrocinar",
            cmdGiftDesc: "Mostrar como patrocinar o passatempo.",
            cmdBon: "BON",
            cmdBonDesc: "Mostrar o valor atual do prémio.",
            cmdRange: "Intervalo",
            cmdRangeDesc: "Mostrar o intervalo válido de entradas.",
            cmdLucky: "Número da sorte",
            cmdLuckyDesc: "Mostrar o número da sorte.",
            cmdLuckyEnter: "Entrar com nº da sorte",
            cmdLuckyEnterDesc: "Entrar usando o número da sorte.",
            cmdRig: "Ativar Modo Viciado",
            cmdRigDesc: "Ativar o Modo Viciado.",
            cmdUnrig: "Desativar Modo Viciado",
            cmdUnrigDesc: "Desativar o Modo Viciado.",
            cmdRandom: "Aleatório",
            cmdRandomDesc: "Entrar com um número aleatório.",
            cmdNumber: "Número",
            cmdNumberDesc: "Mostrar a tua entrada atual.",
            cmdFree: "Livres",
            cmdFreeDesc: "Mostrar números disponíveis.",
            cmdAddBon: "Adicionar BON",
            cmdAddBonDesc: "Adicionar BON ao prémio.",
            cmdReminder: "Lembrete",
            cmdReminderDesc: "Enviar um lembrete agora.",
            cmdWinners: "Vencedores",
            cmdWinnersDesc: "Definir o número de vencedores.",
            cmdMaxWinners: "Limite de vencedores",
            cmdMaxWinnersDesc: "Definir o número máximo de vencedores.",
            cmdScale: "Vencedores adicionais",
            cmdScaleDesc: "Mostrar o progresso para desbloquear vencedores adicionais.",
            cmdAddTime: "Adicionar tempo",
            cmdAddTimeDesc: "Adicionar minutos ao passatempo.",
            cmdRemoveTime: "Remover tempo",
            cmdRemoveTimeDesc: "Remover minutos ao passatempo.",
            cmdNaughty: "Excluídos",
            cmdNaughtyDesc: "Gerir a lista de excluídos.",
            cmdEnd: "Terminar",
            cmdEndDesc: "Terminar o passatempo ativo.",
            cmdUser: "Utilizador",
            cmdOptionalUser: "utilizador opcional",
            cmdAmount: "valor",
            cmdCount: "N.º",
            cmdWinnersPlaceholder: "vencedores",
            cmdMax: "Limite",
            cmdMaxPlaceholder: "máx.",
            cmdMinutes: "Min",
            cmdMinutesPlaceholder: "minutos",
            cmdAction: "Ação",
            cmdActionPlaceholder: "ação",
            cmdActionAdd: "Adicionar",
            cmdActionRemove: "Remover",
            cmdActionList: "Listar",
            cmdActionHint: "Usa adicionar, remover ou listar.",
            cmdUsername: "utilizador",
            cmdUsernameHint: "É necessário indicar o utilizador para adicionar/remover.",
            cmdHost: "Organizador",
            cmdOptionalHost: "organizador opcional",
            uiTimerWholeMinutes: "Introduz um número inteiro de minutos (sem casas decimais).",
            uiRigIndicatorAria: "Indicador do Modo Viciado",
            uiConfirmReset: "Tens a certeza de que queres repor o passatempo? Isto apaga todas as entradas e não pode ser desfeito.",
            uiConfirmClose: "Está a decorrer um passatempo. Tens a certeza de que queres fechar o menu? Isto NÃO termina o passatempo, mas podes deixar de acompanhar o progresso.",
            uiStartTitle: "Iniciar o passatempo",
            uiRestorePanel: "Restaurar painel",
            uiHostPanelToggleTitle: "Abrir/fechar o painel de comandos do organizador.",
            uiPresetPrompt: "Nome desta predefinição:",
            uiPresetDefault: "Predefinição {number}",
            uiPresetDeleteConfirm: "Eliminar a predefinição \"{name}\"?",
            uiPrize: "Prémio",
            uiGiftStatus: "Estado do envio",
            uiSelf: "Próprio",
            uiHostSelfGift: "Organizador vencedor (sem envio para si próprio)",
            uiCheckingGift: "A confirmar o envio do prémio…",
            uiDirect: "direto",
            uiCheckingPool: "A verificar a contribuição para a BON Pool…",
            uiRemindersMax: "# Lembretes (máx. {max})",
            validationLetters: "Não são permitidas letras — introduz números inteiros válidos.",
            validationIntegers: "Introduz números inteiros válidos (ex.: -5, 0, 10).",
            validationNumbersOnly: "Introduz apenas números.",
            validationEndAfterStart: "O n.º final deve ser maior ou igual ao n.º inicial.",
            validationWinnersRange: "Escolhe entre 1 e {max} vencedores.",
            validationInvalidMaxWinners: "Máximo de vencedores inválido.",
            validationMaxRange: "Tem de estar entre {min} e {max}.",
            validationIntegerWithRange: "Introduz um número inteiro. {range}",
            preflightChat: "não foi possível determinar a sala de chat ativa",
            preflightIdentity: "não foi possível determinar o ID do utilizador autenticado no chat",
            preflightCsrf: "o token CSRF não está disponível",
            preflightUser: "não foi possível determinar a página do utilizador autenticado",
            preflightGift: "não foi possível validar o formulário de envio de BON",
            preflightPool: "não foi possível validar a página/contrato da BON Pool",
            alertPreflightFailed: "ERRO DO PASSATEMPO: a verificação de compatibilidade do tracker falhou: {reason}."



        })
    });

    function t(key, vars = {}, locale = SITE.locale) {
        const table = I18N[locale] || I18N.en;
        const template = String(table?.[key] ?? I18N.en?.[key] ?? key);
        return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, name) =>
            Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
        );
    }

    function tp(oneKey, manyKey, count, vars = {}, locale = SITE.locale) {
        return t(Number(count) === 1 ? oneKey : manyKey, { ...vars, count }, locale);
    }

    function formatRank(n, locale = SITE.locale) {
        const value = Math.max(1, Math.floor(Number(n) || 1));
        if (locale === "pt-PT") return `${value}.º`;
        const rem100 = value % 100;
        if (rem100 >= 11 && rem100 <= 13) return `${value}th`;
        switch (value % 10) {
            case 1: return `${value}st`;
            case 2: return `${value}nd`;
            case 3: return `${value}rd`;
            default: return `${value}th`;
        }
    }

    function ta(key, locale = SITE.locale) {
        const table = I18N[locale] || I18N.en;
        const value = table?.[key] ?? I18N.en?.[key];
        return Array.isArray(value) ? value : [];
    }

    function validateI18nCatalog() {
        const base = new Set(Object.keys(I18N.en));
        const localized = new Set(Object.keys(I18N["pt-PT"]));
        const missingPt = [...base].filter(key => !localized.has(key));
        const extraPt = [...localized].filter(key => !base.has(key));
        if (missingPt.length || extraPt.length) {
            console.error("[BONanza] I18N catalogue mismatch", { missingPt, extraPt });
            return false;
        }
        return true;
    }
    validateI18nCatalog();

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

    function formDataFromParsedForm(form) {
        const data = new FormData();
        if (!form) return data;
        form.querySelectorAll("input, select, textarea").forEach(el => {
            if (!el.name || el.disabled) return;
            const type = String(el.type || "").toLowerCase();
            if ((type === "checkbox" || type === "radio") && !el.checked) return;
            if (type === "submit" || type === "button" || type === "reset" || type === "file") return;
            data.append(el.name, el.value ?? "");
        });
        return data;
    }

    function findGiftFormContract(doc, pageUrl) {
        const forms = Array.from(doc?.querySelectorAll?.("form") || []);
        for (const form of forms) {
            const names = new Set(
                Array.from(form.querySelectorAll("input[name], textarea[name], select[name]"))
                    .map(el => String(el.name || ""))
            );
            if (!names.has("recipient_username") || !names.has("bon") || !names.has("message")) continue;
            let action;
            try {
                action = new URL(form.getAttribute("action") || pageUrl || location.href, location.origin);
            } catch {
                continue;
            }
            if (action.origin !== location.origin) continue;
            const method = String(form.getAttribute("method") || "GET").toUpperCase();
            if (method !== "POST") continue;
            return {
                action: action.href,
                method,
                formData: formDataFromParsedForm(form),
                sourceUrl: String(pageUrl || "")
            };
        }
        return null;
    }

    async function fetchGiftFormContract(senderSlug) {
        const endpointPath = getGiftEndpointPath(senderSlug);
        if (!endpointPath) return null;

        // Page-first policy on every tracker: use the form the tracker itself
        // exposes instead of guessing endpoint fields.
        const candidates = [
            `${endpointPath}/create`,
            endpointPath
        ];

        for (const candidate of candidates) {
            try {
                const url = new URL(candidate, location.origin);
                url.searchParams.set("_bonanza", String(Date.now()));
                const res = await fetchWithTimeout(url, {
                    method: "GET",
                    credentials: "same-origin",
                    cache: "no-store",
                    headers: { "Accept": "text/html" }
                }, 7000);
                if (!res.ok) continue;
                const html = await res.text();
                const doc = new DOMParser().parseFromString(html, "text/html");
                const contract = findGiftFormContract(doc, res.url || url.href);
                if (contract) return contract;
            } catch {
                // Try the next real page before considering the emergency chat path.
            }
        }
        return null;
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

    // ── BON Pool adapter configuration ─────────────────────────────
    const BONANZA = Object.freeze({
        FUND_NAME: "BON Pool",
        POOL_PATH: SITE.pool.path,
        POOL_STORE_PATH: SITE.pool.storePath,
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
    // The type markers stay inside the canonical IRC 0..15 palette. Most kinds are
    // identified by colour alone; sponsor-message recaps intentionally reuse IRC 05
    // but add bold to the typed sentinel so they remain distinct without relying on an
    // extended colour that some bridge/client paths do not preserve reliably. They are
    // invisible on DarkPeers because U+2063 has zero visual width, while the bridge
    // preserves their formatting as IRC style spans that TLCC can select.
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
        "sponsor-messages": "#85144B", // IRC 05 + bold typed sentinel
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

        // The DP->IRC->The Lounge sentinel contract is DarkPeers-specific.
        if (!SITE.bridgeMarkers) return safeVisible;

        // Unknown marker kinds must fail visibly-safe: keep the human-facing emoji/text,
        // but never fall back to a public implementation URL.
        if (!markerColor) return safeVisible;

        const prefix = `[b][i][u]${BRIDGE_SENTINEL}[/u][/i][/b]`;
        const typed = safeKind === BRIDGE_MARKERS.SPONSOR_MESSAGES
            ? `[b][i][u][color=${markerColor}]${BRIDGE_SENTINEL}[/color][/u][/i][/b]`
            : `[i][u][color=${markerColor}]${BRIDGE_SENTINEL}[/color][/u][/i]`;

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
    const LS_ACTIVE_GIVEAWAY_LEGACY = `bonanza-giveaway-activeState::${location.hostname}`;
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
    let giveawayMutationQuarantined = false;
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

    let chatroomId = Number(SITE.chat.fallbackRoomId || 0) || null;
    const chatboxId = "chatbox__messages-create";

    function getActiveChatroomNameFromDom() {
        const active = document.querySelector("#chatbox_tabs .chatbox__tab.panel__tab--active, #chatbox_tabs .panel__tab--active");
        return String(active?.textContent || "").replace(/\s+/g, " ").trim();
    }

    async function fetchChatroomsReadOnly() {
        try {
            const res = await fetchWithTimeout("/api/chat/rooms", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: { "Accept": "application/json" }
            }, 7000);
            if (!res.ok) return [];
            const payload = await res.json();
            return Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
        } catch {
            return [];
        }
    }

    async function refreshChatContextFromPage() {
        try {
            const res = await fetchWithTimeout(new URL("/", location.origin), {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: { "Accept": "text/html" }
            }, 7000);
            if (!res.ok) return null;
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, "text/html");
            const mount = doc.querySelector("chatbox");
            const raw = mount?.getAttribute(":user") || mount?.getAttribute("user") || "";
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (Number.isFinite(Number(parsed?.id))) OT_USER_ID = Number(parsed.id);
            if (Number.isFinite(Number(parsed?.chatroom?.id))) OT_CHATROOM_ID = Number(parsed.chatroom.id);
            return parsed;
        } catch {
            return null;
        }
    }

    async function resolveActiveChatroomId({ allowFallback = true } = {}) {
        // Vue-based UNIT3D exposes the authenticated user in the server-rendered
        // <chatbox :user> mount. Resolve it before selecting the live DOM room so
        // the chat API never receives user_id=0.
        if (!OT_USER_ID) await refreshChatContextFromPage();

        // Prefer the room the user actually has selected in the rendered chat.
        const activeName = getActiveChatroomNameFromDom();
        const rooms = await fetchChatroomsReadOnly();
        if (activeName && rooms.length) {
            const match = rooms.find(room =>
                String(room?.name || "").trim().toLocaleLowerCase() === activeName.toLocaleLowerCase()
            );
            if (Number.isFinite(Number(match?.id))) {
                chatroomId = Number(match.id);
                OT_CHATROOM_ID = chatroomId;
                return chatroomId;
            }
        }

        // Then use the authenticated chat state exposed by the page.
        if (!OT_CHATROOM_ID) await refreshChatContextFromPage();
        if (Number.isFinite(Number(OT_CHATROOM_ID)) && Number(OT_CHATROOM_ID) > 0) {
            chatroomId = Number(OT_CHATROOM_ID);
            return chatroomId;
        }

        if (
            allowFallback &&
            Number.isFinite(Number(SITE.chat.fallbackRoomId)) &&
            Number(SITE.chat.fallbackRoomId) > 0
        ) {
            chatroomId = Number(SITE.chat.fallbackRoomId);
            OT_CHATROOM_ID = chatroomId;
            return chatroomId;
        }
        return null;
    }

    async function preflightSiteCapabilitiesForStart({ donationPercent = 0 } = {}) {
        cacheChatContext();

        const roomId = await resolveActiveChatroomId({
            allowFallback: SITE.id === "darkpeers"
        });
        if (!roomId) return { ok: false, reason: t("preflightChat") };

        if (!OT_USER_ID) await refreshChatContextFromPage();
        if (!Number.isFinite(Number(OT_USER_ID)) || Number(OT_USER_ID) <= 0) {
            return { ok: false, reason: t("preflightIdentity") };
        }

        if (!OT_CSRF_TOKEN) cacheChatContext();
        if (!OT_CSRF_TOKEN) return { ok: false, reason: t("preflightCsrf") };

        const senderSlug = getAuthenticatedUserSlug();
        if (!senderSlug) return { ok: false, reason: t("preflightUser") };

        const giftContract = await fetchGiftFormContract(senderSlug);
        if (!giftContract?.action || !giftContract?.formData) {
            return { ok: false, reason: t("preflightGift") };
        }

        if (normalizeDonationPercent(donationPercent) > 0) {
            try {
                await fetchBonPoolPage();
            } catch (e) {
                logEvent("BON Pool preflight failed", String(e?.message || e));
                return { ok: false, reason: t("preflightPool") };
            }
        }

        return {
            ok: true,
            roomId,
            userId: Number(OT_USER_ID),
            giftAction: (() => {
                try { return new URL(giftContract.action, location.origin).pathname; }
                catch { return ""; }
            })(),
            poolChecked: normalizeDonationPercent(donationPercent) > 0,
            poolMode: SITE.pool.mode
        };
    }

    const COMMAND_PANEL_SECTIONS = Object.freeze({
        giveaway: t("uiGeneralCommands"),
        stats: t("uiStatsCommands"),
        entry: t("uiEntryCommands"),
        help: t("uiHelp"),
        rigging: t("uiRiggingCommands"),
        pot: t("uiBonCommands")
    });
    const HOST_PANEL_NAUGHTY_SECTION_TITLE = t("uiNaughtyList");
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

    const baseCommands = ["time", "entries", "help", "commands", "bon", "range", "gift","random", "number", "free", "lucky", "luckye", "rig", "unrig", "stats", "top", "most", "sponsors", "unlucky", "largest", "scale"];
    const hostCommands = ["addtime", "removetime", "reminder", "addbon", "end", "winners", "maxwinners", "naughty"];
    const validCommands = new Set([...baseCommands, ...hostCommands]);

    const HOST_PANEL_COMMAND_METADATA = Object.freeze({
        time: { label: t("cmdTime"), section: "giveaway", description: t("cmdTimeDesc"), usage: "!time", requiresGiveaway: true },
        entries: { label: t("cmdEntries"), section: "info", description: t("cmdEntriesDesc"), usage: "!entries", requiresGiveaway: true },
        help: { label: t("cmdHelp"), section: "info", description: t("cmdHelpDesc"), usage: "!help", requiresGiveaway: false },
        commands: { label: t("cmdCommands"), section: "info", description: t("cmdCommandsDesc"), usage: "!commands", requiresGiveaway: false },
        stats: {
            label: t("cmdStats"), section: "info", description: t("cmdStatsDesc"),
            usage: "!stats [username]", requiresGiveaway: false,
            args: [{ name: "username", label: t("cmdUser"), type: "username", required: false, placeholder: t("cmdOptionalUser") }]
        },
        top: {
            label: t("cmdTop"), section: "info", description: t("cmdTopDesc"),
            usage: "!top [N]", requiresGiveaway: false,
            args: [{ name: "count", label: "N", type: "int", required: false, min: 1, max: STATS_MAX_TOP_N, placeholder: String(STATS_DEFAULT_TOP_N) }]
        },
        most: {
            label: t("cmdMost"), section: "info", description: t("cmdMostDesc"),
            usage: "!most [N]", requiresGiveaway: false,
            args: [{ name: "count", label: "N", type: "int", required: false, min: 1, max: STATS_MAX_TOP_N, placeholder: String(STATS_DEFAULT_TOP_N) }]
        },
        sponsors: {
            label: t("cmdSponsors"), section: "pot", description: t("cmdSponsorsDesc"),
            usage: "!sponsors [N]", requiresGiveaway: false,
            args: [{ name: "count", label: "N", type: "int", required: false, min: 1, max: STATS_MAX_TOP_N, placeholder: String(STATS_DEFAULT_TOP_N) }]
        },
        unlucky: {
            label: t("cmdUnlucky"), section: "info", description: t("cmdUnluckyDesc"),
            usage: "!unlucky [N]", requiresGiveaway: false,
            args: [{ name: "count", label: "N", type: "int", required: false, min: 1, max: STATS_MAX_TOP_N, placeholder: String(STATS_DEFAULT_TOP_N) }]
        },
        largest: {
            label: t("cmdLargest"), section: "info", description: t("cmdLargestDesc"),
            usage: "!largest [N]", requiresGiveaway: false,
            args: [{ name: "count", label: "N", type: "int", required: false, min: 1, max: STATS_MAX_TOP_N, placeholder: String(STATS_DEFAULT_TOP_N) }]
        },
        gift: { label: t("cmdGift"), section: "pot", description: t("cmdGiftDesc"), usage: "!gift", requiresGiveaway: true },
        bon: { label: t("cmdBon"), section: "pot", description: t("cmdBonDesc"), usage: "!bon", requiresGiveaway: true },
        range: { label: t("cmdRange"), section: "entry", description: t("cmdRangeDesc"), usage: "!range", requiresGiveaway: true },
        lucky: { label: t("cmdLucky"), section: "entry", description: t("cmdLuckyDesc"), usage: "!lucky", requiresGiveaway: true },
        luckye: { label: t("cmdLuckyEnter"), section: "entry", description: t("cmdLuckyEnterDesc"), usage: "!luckye", requiresGiveaway: true },
        rig: { label: t("cmdRig"), section: "entry", description: t("cmdRigDesc"), usage: "!rig", requiresGiveaway: true },
        unrig: { label: t("cmdUnrig"), section: "entry", description: t("cmdUnrigDesc"), usage: "!unrig", requiresGiveaway: true },
        random: { label: t("cmdRandom"), section: "entry", description: t("cmdRandomDesc"), usage: "!random", requiresGiveaway: true },
        number: { label: t("cmdNumber"), section: "entry", description: t("cmdNumberDesc"), usage: "!number", requiresGiveaway: true },
        free: { label: t("cmdFree"), section: "entry", description: t("cmdFreeDesc"), usage: "!free", requiresGiveaway: true },
        addbon: {
            label: t("cmdAddBon"), section: "pot", description: t("cmdAddBonDesc"),
            usage: "!addbon <amount>", requiresGiveaway: true, hostOnly: true,
            args: [{ name: "amount", label: "BON", type: "int", required: true, min: 1, placeholder: t("cmdAmount") }]
        },
        reminder: { label: t("cmdReminder"), section: "giveaway", description: t("cmdReminderDesc"), usage: "!reminder", requiresGiveaway: true, hostOnly: true },
        winners: {
            label: t("cmdWinners"), section: "giveaway", description: t("cmdWinnersDesc"),
            usage: `!winners 1-${MAX_WINNERS}`, requiresGiveaway: true, hostOnly: true,
            args: [{ name: "count", label: t("cmdCount"), type: "int", required: true, min: 1, max: MAX_WINNERS, placeholder: t("cmdWinnersPlaceholder") }]
        },
        maxwinners: {
            label: t("cmdMaxWinners"), section: "giveaway", description: t("cmdMaxWinnersDesc"),
            usage: `!maxwinners 1-${MAX_WINNERS}`, requiresGiveaway: true, hostOnly: true,
            args: [{ name: "count", label: t("cmdMax"), type: "int", required: true, min: 1, max: MAX_WINNERS, placeholder: t("cmdMaxPlaceholder") }]
        },
        scale: { label: t("cmdScale"), section: "info", description: t("cmdScaleDesc"), usage: "!scale", requiresGiveaway: true },
        addtime: {
            label: t("cmdAddTime"), section: "giveaway", description: t("cmdAddTimeDesc"),
            usage: "!addtime <minutes>", requiresGiveaway: true, hostOnly: true,
            args: [{ name: "minutes", label: t("cmdMinutes"), type: "int", required: true, min: 1, placeholder: t("cmdMinutesPlaceholder") }]
        },
        removetime: {
            label: t("cmdRemoveTime"), section: "giveaway", description: t("cmdRemoveTimeDesc"),
            usage: "!removetime <minutes>", requiresGiveaway: true, hostOnly: true,
            args: [{ name: "minutes", label: t("cmdMinutes"), type: "int", required: true, min: 1, placeholder: t("cmdMinutesPlaceholder") }]
        },
        naughty: {
            label: t("cmdNaughty"), section: "giveaway", description: t("cmdNaughtyDesc"),
            usage: "!naughty (add|remove|list) [username]", requiresGiveaway: true, hostOnly: true,
            args: [
                {
                    name: "action", label: t("cmdAction"), type: "select", required: true,
                    placeholder: t("cmdActionPlaceholder"),
                    options: [
                        { label: t("cmdActionAdd"), value: "add" },
                        { label: t("cmdActionRemove"), value: "remove" },
                        { label: t("cmdActionList"), value: "list" }
                    ],
                    validate: (v) => /^(add|remove|list)$/i.test(String(v || "").trim()),
                    hint: t("cmdActionHint")
                },
                {
                    name: "username", label: t("cmdUser"), type: "username", required: false,
                    placeholder: t("cmdUsername"),
                    requiredWhen: (all) => /^(add|remove)$/i.test(String(all.action || "").trim()),
                    hint: t("cmdUsernameHint")
                }
            ]
        },
        end: {
            label: t("cmdEnd"), section: "giveaway", description: t("cmdEndDesc"),
            usage: "!end [host]", requiresGiveaway: true, hostOnly: true,
            args: [{ name: "host", label: t("cmdHost"), type: "username", required: false, placeholder: t("cmdOptionalHost") }]
        }
    });

    // Declared early so UI init paths can safely reference this object before command handlers are populated.
    const COMMAND_HANDLERS = Object.create(null);

    // ───────────────────────────────────────────────────────────
    // SECTION 2: Runtime State Variables
    // ───────────────────────────────────────────────────────────
    let giveawayStartTime;
    let sponsorsInterval;
    let observer;
    let entryChatPollInterval = null;
    let entryChatPollInFlight = null;
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
    giveawayBTN.title = t("uiAppTitle");
    giveawayBTN.innerHTML = `${ROBOT_SVG}<span class="btn-label">${t("uiToolbarLabel")}</span>`;
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
                name:        fetch("name") || "BONanza Giveaway",
                version:     fetch("version") || "0.0.0"
            };
        } catch (e) {
            /* Last-ditch – never crash the script */
            return { name:"BONanza Giveaway", version:"0.0.0" };
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
        <button id="minimizeButton" class="form__button form__button--text giveaway-btn" style="background-color:#4e595f;" title="${t("uiMinimizePanel")}">
          <i class="fa-solid fa-window-minimize"></i>
        </button>
        <button id="closeButton" class="form__button form__button--text giveaway-btn" style="background-color:#4e595f;">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
    <div class="giveaway-header-actions__menu-row no-drag" data-no-drag="1">
      <button id="resetButton" class="form__button form__button--text giveaway-btn no-drag" data-no-drag="1" style="background-color:#b32525;">
        <i class="fa-solid fa-rotate-right"></i> ${t("uiReset")} 
      </button>
      <button id="giveawaySettingsBtn" class="form__button form__button--text giveaway-btn no-drag" data-no-drag="1" style="background-color:#ff6400;">
        <i class="fa-solid fa-gear"></i> ${t("uiSettings")} 
      </button>
      <button id="commandsButton" class="form__button form__button--text giveaway-btn no-drag" data-no-drag="1" style="background-color:#ff9600;">
        <i class="fa-solid fa-list"></i> ${t("uiCommands")} 
      </button>
    </div>
  </header>

  <!-- MAIN BODY -->
  <div class="panel__body" id="giveaway_body" style="display:flex; flex-direction:column; gap:10px;">

    <!-- Presets -->
    <div class="giveaway-presets-row" style="display:flex; align-items:center; justify-content:center; gap:6px; flex-wrap:wrap; margin:0;">
      <select id="presetSelect" class="form__text" style="width:auto; min-width:120px; max-width:180px; padding:3px 6px; font-size:12px;">
        <option value="">${t("uiPresets")}</option>
      </select>
      <button type="button" id="presetLoadBtn" class="form__button form__button--text giveaway-btn no-drag" style="background-color:#2a7acc; font-size:11px; padding:3px 8px;" title="${t("uiLoadPresetTitle")}">
        <i class="fa-solid fa-folder-open"></i> ${t("uiLoad")} 
      </button>
      <button type="button" id="presetSaveBtn" class="form__button form__button--text giveaway-btn no-drag" style="background-color:#02B008; font-size:11px; padding:3px 8px;" title="${t("uiSavePresetTitle")}">
        <i class="fa-solid fa-floppy-disk"></i> ${t("uiSave")} 
      </button>
      <button type="button" id="presetDeleteBtn" class="form__button form__button--text giveaway-btn no-drag" style="background-color:#b32525; font-size:11px; padding:3px 8px;" title="${t("uiDeletePresetTitle")}">
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
          ${t("uiGiveawayAmount")}
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
                  ${id === 'startNum' ? t("uiStartNumber") : t("uiEndNumber")}
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
          <label class="form__label form__label--floating" for="timerNum">${t("uiTimeMin")}</label>
        </p>

        <!-- reminders -->
        <p class="form__group" style="width:28%;">
          <input class="form__text" id="reminderNum" type="number" min="0" step="1" value="0" autocomplete="off">
          <label class="form__label form__label--floating">${t("uiReminders")}</label>
        </p>

        <!-- cadence label -->
        <p class="form__group" style="width:28%;">
          <input class="form__text" id="reminderEvery" readonly tabindex="-1" style="cursor:default;">
          <label class="form__label form__label--floating">${t("uiEveryMin")}</label>
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
          <label class="form__label form__label--floating" for="winnersNum">${t("uiWinners")}</label>
        </p>
        <p class="form__group giveaway-number-col" id="maxScaledWinnersGroup" style="display:none;">
          <input
            class="form__text"
            type="number"
            id="maxScaledWinnersNum"
            title="${t("uiMaxWinnersTitle", { max: MAX_WINNERS })}"
            min="1"
            max="${MAX_WINNERS}"
            step="1"
            value="1"
            disabled
          >
          <label class="form__label form__label--floating" for="maxScaledWinnersNum" title="${t("uiMaxWinnersTitle", { max: MAX_WINNERS })}">${t("uiMaxWinners")}</label>
          <small id="maxScaledWinnersError" class="giveaway-inline-error" aria-live="polite"></small>
        </p>
        <p class="form__group giveaway-number-col" id="scaleBonPerWinnerGroup" style="display:none;">
          <input
            class="form__text"
            type="number"
            id="scaleBonPerWinnerNum"
            title="${t("uiScaleBonTitle")}"
            min="1"
            step="1"
            placeholder="${t("uiAuto")}"
            disabled
          >
          <label class="form__label form__label--floating" for="scaleBonPerWinnerNum" title="${t("uiScaleBonShortTitle")}">${t("uiBonPerWinner")}</label>
        </p>
      </div>

      <div class="panel__body giveaway-custom-message-row" style="display:flex;justify-content:center;gap:20px;width:100%;">
        <p class="form__group" style="width:100%;">
          <input
            class="form__text"
            id="customMessage"
            type="text"
            maxlength="100"
            placeholder="${t("uiMaxChars")}"
            value="${DEFAULT_CUSTOM_MESSAGE}"
          >
          <label class="form__label form__label--floating" for="customMessage">
            ${t("uiCustomMessage")}
          </label>
        </p>
      </div>

      <!-- BON Pool contribution row -->
      <div class="panel__body giveaway-donation-row" style="display:flex;justify-content:center;align-items:center;gap:14px;width:100%;flex-wrap:wrap;">
        <p class="form__group" style="width:38%;margin:0;">
          <select class="form__select" id="donationPercent" title="${t("uiPoolDonationTitle", { poolName: BONANZA.FUND_NAME })}">
            ${BONANZA.PERCENT_OPTIONS.map(p => `<option value="${p}">${p}%</option>`).join('')}
          </select>
          <label class="form__label form__label--floating" for="donationPercent">${t("uiPoolDonation", { poolName: BONANZA.FUND_NAME })}</label>
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
    ${t("uiStart")}
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
        <thead><tr><th>${t("uiUser")}</th><th>${t("uiEntryNumber")}</th></tr></thead>
        <tbody></tbody>
      </table>
    </div>

    <!-- Winners / payout status -->
    <div id="winnersWrapper" class="data-table-wrapper" hidden
         style="width:100%; overflow-x:auto; margin-top:6px;">
      <table id="winnersTable" class="data-table" style="width:100%; border-collapse:collapse; table-layout:fixed;">
        <thead>
          <tr>
            <th>${t("uiWinner")}</th>
            <th>${t("uiPrizeBon")}</th>
            <th>${t("uiGift")}</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>

    <div id="giveawayLogPanel" class="data-table-wrapper" style="width:100%; margin-top:10px; display:none;">
      <h3 style="margin:0 0 6px 0; color:#ddd; font-size:14px;">${t("uiGiveawayLog")}</h3>
      <pre id="giveawayLogContent" style="margin:0; max-height:160px; overflow:auto; background:#1f1f1f; color:#cfcfcf; border:1px solid #444; border-radius:4px; padding:8px; white-space:pre-wrap; word-break:break-word;">${t("uiNoEvents")}</pre>
      <div style="display:flex; gap:8px; margin-top:8px;">
        <button type="button" id="copyGiveawayLogButton" class="form__button form__button--filled">${t("uiCopyLog")}</button>
        <button type="button" id="clearGiveawayLogButton" class="form__button form__button--filled" style="background:#7d3333;">${t("uiClearLog")}</button>
      </div>
    </div>
  </div>

    <!-- End-of-giveaway statements -->
    <div id="bonanzaStatementRow" class="data-table-wrapper" style="width:100%; margin-top:10px; display:none;">
      <h3 style="margin:0 0 6px 0; color:#ddd; font-size:14px;">${t("uiStatements")}</h3>
      <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
        <select id="bonanzaStatementSelect" class="form__select" style="flex:1; min-width:200px;" title="${t("uiStatementsTitle", { count: STATEMENTS_KEEP })}"></select>
        <button type="button" id="bonanzaSaveStatementBtn" class="form__button form__button--filled" title="${t("uiSaveTxtTitle")}">${t("uiSaveTxt")}</button>
        <button type="button" id="bonanzaCopyStatementBtn" class="form__button form__button--filled" style="background:#4e595f;" title="${t("uiCopyStatementTitle")}">${t("uiCopy")}</button>
      </div>
    </div>

  <!-- SETTINGS MENU -->
  <div id="giveaway_settings_menu" class="giveaway_settings_menu" style="display:none">
    <div class="settings-menu-content">
      <div class="settings-group" aria-label="${t("uiEntryModes")}" data-settings-group="entry-modes" data-toggle-ids="randomToggle,luckyToggle,freeToggle">
        <div class="settings-group__header">
          <p class="settings-group__title">${t("uiEntryModes")}</p>
          <button type="button" class="form__button form__button--filled settings-section-toggle" data-settings-toggle="entry-modes" title="${t("uiToggleEntryModes")}">${t("uiToggleAll")}</button>
        </div>
        ${[
            { label: t('uiRandom'), id: 'randomToggle', tip: t('uiRandomTip') },
            { label: t('uiLucky'), id: 'luckyToggle', tip: t('uiLuckyTip') },
            { label: t('uiFree'), id: 'freeToggle', tip: t('uiFreeTip') }
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

      <div class="settings-group" aria-label="${t("uiChatReplies")}" data-settings-group="chat-replies" data-toggle-ids="entryrepliesToggle,silentmodeToggle">
        <div class="settings-group__header">
          <p class="settings-group__title">${t("uiChatReplies")}</p>
          <button type="button" class="form__button form__button--filled settings-section-toggle" data-settings-toggle="chat-replies" title="${t("uiToggleChatReplies")}">${t("uiToggleAll")}</button>
        </div>
        ${[
            { label: t('uiEntryReplies'), id: 'entryrepliesToggle', tip: t('uiEntryRepliesTip') },
            { label: t('uiSilentMode'), id: 'silentmodeToggle', tip: t('uiSilentModeTip') }
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

      <div class="settings-group" aria-label="${t("uiScalingRules")}" data-settings-group="scaling-rules" data-toggle-ids="scaleWinnersToggle,rigModeToggle,showgiveawaylogToggle">
        <div class="settings-group__header">
          <p class="settings-group__title">${t("uiScalingRules")}</p>
          <button type="button" class="form__button form__button--filled settings-section-toggle" data-settings-toggle="scaling-rules" title="${t("uiToggleScalingRules")}">${t("uiToggleAll")}</button>
        </div>
        ${[
            { label: t('uiScaleWinners'), id: 'scaleWinnersToggle', tip: t('uiScaleWinnersTip') },
            { label: t('uiRiggedMode'), id: 'rigModeToggle', tip: t('uiRiggedModeTip') },
            { label: t('uiShowLog'), id: 'showgiveawaylogToggle', tip: t('uiShowLogTip') }
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
      <li class="section-label">${t("uiGeneralCommands")}</li>
      <li><code>!time&nbsp;</code>        <span class="desc">${t("cmdTimeDesc")}</span></li>
      <li><code>!entries&nbsp;</code>     <span class="desc">${t("cmdEntriesDesc")}</span></li>
      <li><code>!free&nbsp;</code>        <span class="desc">${t("cmdFreeDesc")}</span></li>
      <li><code>!number&nbsp;</code>      <span class="desc">${t("cmdNumberDesc")}</span></li>
      <li><code>!random&nbsp;</code>      <span class="desc">${t("cmdRandomDesc")}</span></li>
      <li><code>!lucky&nbsp;</code>       <span class="desc">${t("cmdLuckyDesc")}</span></li>
      <li><code>!luckye&nbsp;</code>      <span class="desc">${t("cmdLuckyEnterDesc")}</span></li>
      <li><code>!bon&nbsp;</code>         <span class="desc">${t("cmdBonDesc")}</span></li>
      <li><code>!range&nbsp;</code>       <span class="desc">${t("cmdRangeDesc")}</span></li>
      <li><code>!scale&nbsp;</code>      <span class="desc">${t("cmdScaleDesc")}</span></li>
      <li><code>!rig/!unrig&nbsp;</code>  <span class="desc">${t("cmdRigDesc")}</span></li>
      <li><code>!help&nbsp;</code>        <span class="desc">${t("cmdHelpDesc")}</span></li>
      <li><code>!stats&nbsp;[user]</code>   <span class="desc">${t("cmdStatsDesc")}</span></li>
      <li><code>!top&nbsp;[N]</code>       <span class="desc">${t("cmdTopDesc")}</span></li>
      <li><code>!most&nbsp;[N]</code>      <span class="desc">${t("cmdMostDesc")}</span></li>
      <li><code>!sponsors&nbsp;[N]</code>  <span class="desc">${t("cmdSponsorsDesc")}</span></li>
      <li><code>!unlucky&nbsp;[N]</code>   <span class="desc">${t("cmdUnluckyDesc")}</span></li>

      <li class="section-label">${t("uiHostOnlyCommands")}</li>
      <li class="full-span">
          <code>!time add&nbsp;N&nbsp;/&nbsp;remove&nbsp;N&nbsp;</code>
          <span class="desc">${t("cmdAddTimeDesc")}</span>
      </li>
      <li><code>!reminder&nbsp;</code>    <span class="desc">${t("cmdReminderDesc")}</span></li>
      <li><code>!addbon&nbsp;</code>      <span class="desc">${t("cmdAddBonDesc")}</span></li>
      <li><code>!winners&nbsp;N</code>    <span class="desc">${t("cmdWinnersDesc")}</span></li>
      <li><code>!maxwinners&nbsp;N</code> <span class="desc">${t("cmdMaxWinnersDesc")}</span></li>
      <li><code>!end&nbsp;</code>         <span class="desc">${t("cmdEndDesc")}</span></li>

      <li><code>!naughty&nbsp;</code>     <span class="desc">${t("cmdNaughtyDesc")}</span></li>
      <li class="naughty-alert">
        ${t("uiNaughtyAlert")}
      </li>
    </ul>
  </div>


  <!-- RIGGED WATERMARK (only visible in rigged mode) -->
  <div class="rigged-watermark">${t("uiRiggedWatermark")}</div>
</section>
`;

    const hostPanelHTML = `
<aside id="hostCommandPanel" class="host-command-panel" aria-hidden="true">
  <div id="hostCommandPanelHandle" class="host-command-panel__handle" title="${t("uiDragHostPanel")}">
    <span class="host-command-panel__handle-title">${t("uiHostPanel")}</span>
    <button id="hostPanelCloseBtn" type="button" class="form__button form__button--text host-command-panel__close" title="${t("uiCloseHostPanel")}" aria-label="${t("uiCloseHostPanel")}">×</button>
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
        toast.textContent = t("uiConflictToast");
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
        giveawayBTN.title = t("uiConflictTitle");
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

        console.warn("[BONanza Giveaway] Disabled: the original BON Giveaway script is also installed.");
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
  flex: 1 1 0;
  width: auto;
  min-width: 0;
  max-width: 135px;
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

                timerInput.setCustomValidity(t("uiTimerWholeMinutes"));
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
            rigBadge.textContent = t("uiRiggedWatermark");
            rigBadge.title = t("uiRiggedModeTip");
            rigBadge.setAttribute("aria-label", t("uiRigIndicatorAria"));
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
                if (window.confirm(t("uiConfirmReset"))) {
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
                if (window.confirm(t("uiConfirmClose"))) {
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
        startButton.title = t("uiStartTitle");
        startButton.dataset.mode = "start";

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
      <button id="hostPanelToggle" class="form__button form__button--text giveaway-btn no-drag" data-no-drag="1" style="background-color:#ff9600;" title="${t("uiHostPanelToggleTitle")}">
        <i class="fa-solid fa-sliders"></i> ${t("uiHostPanel")}
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
            if (minimizeButton) minimizeButton.title = t("uiRestorePanel");
        } else {
            bonanzaGiveawayFrame.classList.remove("minimized");
            if (icon) { icon.className = "fa-solid fa-window-minimize"; }
            if (minimizeButton) minimizeButton.title = t("uiMinimizePanel");
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
        select.innerHTML = `<option value="">${t("uiPresets")}</option>`;
        presets.forEach((p, i) => {
            const opt = document.createElement("option");
            opt.value = String(i);
            opt.textContent = p.name || t("uiPresetDefault", { number: i + 1 });
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
            const name = window.prompt(t("uiPresetPrompt"));
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
            if (!window.confirm(t("uiPresetDeleteConfirm", { name: preset.name || t("uiPresetDefault", { number: idx + 1 }) }))) return;
            presets.splice(idx, 1);
            savePresetList(presets);
            refreshPresetDropdown();
        });
    }

    // ───────────────────────────────────────────────────────────
    // Giveaway persistence — survive page reloads mid-giveaway
    // ───────────────────────────────────────────────────────────

    function getActiveGiveawayStorageKey(hostName = "") {
        const hostKey = normalizeUserKey(hostName || getLoggedInUsername());
        return hostKey
            ? `${LS_ACTIVE_GIVEAWAY_LEGACY}::${encodeURIComponent(hostKey)}`
            : null;
    }

    function readActiveGiveawayRawForHost(hostName = "", { migrateLegacy = false } = {}) {
        const requestedHostKey = normalizeUserKey(hostName || getLoggedInUsername());
        const storageKey = getActiveGiveawayStorageKey(requestedHostKey);
        if (!requestedHostKey || !storageKey) return { storageKey, raw: null, migratedLegacy: false };

        try {
            const namespacedRaw = localStorage.getItem(storageKey);
            if (namespacedRaw) return { storageKey, raw: namespacedRaw, migratedLegacy: false };

            // Backwards-compatible migration from pre-v1.3.24 hostname-wide storage.
            // A legacy snapshot belonging to another account is deliberately left
            // untouched; the current account now has its own namespace and cannot
            // overwrite that foreign recovery state.
            const legacyRaw = localStorage.getItem(LS_ACTIVE_GIVEAWAY_LEGACY);
            if (!legacyRaw) return { storageKey, raw: null, migratedLegacy: false };

            const legacy = JSON.parse(legacyRaw);
            const legacyHostKey = normalizeUserKey(legacy?.giveawayData?.host);
            if (!legacyHostKey || legacyHostKey !== requestedHostKey) {
                return { storageKey, raw: null, migratedLegacy: false };
            }

            if (migrateLegacy) {
                localStorage.setItem(storageKey, legacyRaw);
                localStorage.removeItem(LS_ACTIVE_GIVEAWAY_LEGACY);
            }
            return { storageKey, raw: legacyRaw, migratedLegacy: !!migrateLegacy };
        } catch {
            return { storageKey, raw: null, migratedLegacy: false };
        }
    }

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
        if (giveawayMutationQuarantined) return false;

        // Web Locks provides the atomic cross-tab mutex required for money/state
        // safety. A localStorage-only fallback cannot make compare-and-set atomic,
        // so unsupported browsers fail closed instead of risking double settlement.
        if (tabWebLockRelease) return true;

        if (!navigator.locks || typeof navigator.locks.request !== "function") {
            console.warn("[BON Giveaway] Web Locks API unavailable; refusing to start/restore because exclusive cross-tab ownership cannot be guaranteed.");
            return false;
        }

        if (tabWebLockAcquirePromise) {
            const acquired = await tabWebLockAcquirePromise;
            return !giveawayMutationQuarantined && !!acquired && ownsTabLock();
        }

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
                    if (!lock || giveawayMutationQuarantined) {
                        settle(false);
                        return;
                    }

                    let releaseHold;
                    const hold = new Promise(r => { releaseHold = r; });
                    tabWebLockRelease = releaseHold;

                    let leasePersisted = false;
                    try {
                        localStorage.setItem(
                            LS_TAB_LOCK,
                            JSON.stringify({ tabId: TAB_ID, ts: Date.now(), transport: "web-lock" })
                        );
                        const lease = readTabLock();
                        leasePersisted = !!(lease && lease.tabId === TAB_ID);
                    } catch {}

                    if (!leasePersisted || giveawayMutationQuarantined) {
                        try {
                            const lease = readTabLock();
                            if (lease && lease.tabId === TAB_ID) {
                                localStorage.removeItem(LS_TAB_LOCK);
                            }
                        } catch {}
                        tabWebLockRelease = null;
                        try { releaseHold(); } catch {}
                        settle(false);
                        return;
                    }

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

        const acquired = await tabWebLockAcquirePromise;
        return !giveawayMutationQuarantined && !!acquired && ownsTabLock();
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
        if (giveawayMutationQuarantined) return false;
        const lock = readTabLock();
        if (!lock || lock.tabId !== TAB_ID || !isFreshTabLock(lock)) return false;
        if (navigator.locks && typeof navigator.locks.request === "function") {
            return !!tabWebLockRelease;
        }
        return true;
    }

    async function ensureExclusiveTabOwnership() {
        if (giveawayMutationQuarantined) return false;
        if (ownsTabLock()) return true;
        try {
            const acquired = await acquireTabLock();
            if (giveawayMutationQuarantined) return false;
            return !!acquired && ownsTabLock();
        } catch {
            return false;
        }
    }

    function canMutateActiveGiveaway() {
        return !giveawayMutationQuarantined && (!giveawayData || ownsTabLock());
    }

    // Release the localStorage lock only when this document really leaves.
    // This makes a normal reload recover immediately instead of leaving the new
    // document blocked behind the previous document's fresh heartbeat.
    function handleGiveawayPageHide() {
        if (!giveawayData) {
            // start/restore may still be awaiting the Web Lock before giveawayData
            // is assigned. Quarantine that document now so a queued callback
            // cannot complete successfully after BFCache handoff.
            if (tabWebLockAcquirePromise || tabWebLockRelease) {
                giveawayMutationQuarantined = true;
            }
            return;
        }

        const lock = readTabLock();
        if (!lock || lock.tabId !== TAB_ID) {
            giveawayMutationQuarantined = true;
            return; // never overwrite another tab's snapshot
        }

        try {
            flushStatsNow();
            if (!giveawayData.__ending) snapshotGiveaway();
            else if (giveawayData.settlement?.committed) snapshotGiveaway({ force: true });
        } catch {}

        // From this point until a persisted pageshow proves ownership again, every
        // async continuation from this document must be read-only.
        giveawayMutationQuarantined = true;
        releaseTabLock();
    }

    // BFCache can restore the exact same JS document after pagehide. Because
    // ownership was released, another tab may have restored and persisted newer
    // giveaway state in the meantime. Never resume this document's stale memory:
    // quarantine synchronously and reload from the authoritative persisted state.
    function handleGiveawayPageShow(event) {
        if (!event || !event.persisted) return;
        if (!giveawayData && !tabWebLockAcquirePromise && !tabWebLockRelease) return;

        giveawayMutationQuarantined = true;
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
        if (!giveawayData || !canMutateActiveGiveaway() || (giveawayData.__ending && !force)) return;
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
                    chatroomId: giveawayData.chatroomId,
                    entryChatCursor: Number.isFinite(Number(giveawayData.entryChatCursor))
                        ? Math.max(0, Math.floor(Number(giveawayData.entryChatCursor)))
                        : null,
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
                    giftHistoryClockOffsetMs: optionalFiniteNumber(window.__activeTracker.giftHistoryClockOffsetMs),
                    giftHistoryInitialized: !!window.__activeTracker.giftHistoryInitialized,
                    giftHistorySeenKeys: Array.from(window.__activeTracker.giftHistorySeenKeys || []).slice(-250),
                    historyFallbackActive: !!window.__activeTracker.historyFallbackActive,
                    maxAcceptedCreatedAtTs: optionalFiniteNumber(window.__activeTracker.maxAcceptedCreatedAtTs)
                } : null,
                riggedMode: riggedMode,
                startTime: giveawayStartTime ? giveawayStartTime.getTime() : null,
                savedAt: Date.now()
            };
            const storageKey = getActiveGiveawayStorageKey(giveawayData.host);
            if (!storageKey) throw new Error("Cannot persist giveaway without an authenticated host namespace.");
            localStorage.setItem(storageKey, JSON.stringify(snapshot));

            // Remove only a matching legacy snapshot after the namespaced write
            // succeeds. Never delete another account's retained recovery state.
            try {
                const legacyRaw = localStorage.getItem(LS_ACTIVE_GIVEAWAY_LEGACY);
                if (legacyRaw) {
                    const legacy = JSON.parse(legacyRaw);
                    if (normalizeUserKey(legacy?.giveawayData?.host) === normalizeUserKey(giveawayData.host)) {
                        localStorage.removeItem(LS_ACTIVE_GIVEAWAY_LEGACY);
                    }
                }
            } catch {}
        } catch (e) {
            console.warn("Giveaway snapshot failed:", e);
        }
    }

    /** Clear only the persisted giveaway state that belongs to this host. */
    function clearGiveawaySnapshot(hostName = "") {
        const resolvedHost = hostName || giveawayData?.host || getLoggedInUsername();
        const hostKey = normalizeUserKey(resolvedHost);
        const storageKey = getActiveGiveawayStorageKey(hostKey);

        try {
            if (storageKey) localStorage.removeItem(storageKey);

            // Backwards-compatible cleanup: remove the old hostname-wide key only
            // when it belongs to the same host. A foreign account's recovery state
            // must survive logout/login switches.
            const legacyRaw = localStorage.getItem(LS_ACTIVE_GIVEAWAY_LEGACY);
            if (legacyRaw) {
                const legacy = JSON.parse(legacyRaw);
                if (hostKey && normalizeUserKey(legacy?.giveawayData?.host) === hostKey) {
                    localStorage.removeItem(LS_ACTIVE_GIVEAWAY_LEGACY);
                }
            }
        } catch {}
    }

    /** Load a saved giveaway. Recently-expired snapshots are restored and settled. */
    function loadGiveawaySnapshot() {
        try {
            const loggedInHostKey = normalizeUserKey(getLoggedInUsername());
            if (!loggedInHostKey) return null;

            const stored = readActiveGiveawayRawForHost(loggedInHostKey, { migrateLegacy: true });
            if (!stored.raw) return null;
            const snap = JSON.parse(stored.raw);
            if (!snap || !snap.giveawayData) return null;

            const savedHostKey = normalizeUserKey(snap.giveawayData.host);
            if (!savedHostKey || savedHostKey !== loggedInHostKey) {
                console.warn(
                    "[BON Giveaway] Refusing restore: the saved giveaway belongs to a different authenticated host namespace."
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
            // A committed settlement is permanently closed even when it came
            // from an early/manual !end before the original scheduled endTs.
            // Never reopen entries/timers after a crash in that state.
            const expiredOnRestore =
                committedSettlement ||
                giveawayData.timeLeft <= 0 ||
                snap.__expiredAtLoad === true;

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
            chatroomId = Number(giveawayData.chatroomId) || await resolveActiveChatroomId();
            if (!chatroomId) {
                console.error("[BONanza] Restore aborted: active chatroom could not be resolved.");
                return false;
            }
            giveawayData.chatroomId = chatroomId;
            OT_CHATROOM_ID = chatroomId;

            // 8) Re-start the site's participant input source while entries are open.
            stopEntryInputSource();
            if (!expiredOnRestore) {
                if (
                    SITE.chat.entrySource === "api" &&
                    (
                        giveawayData.entryChatCursor === null ||
                        giveawayData.entryChatCursor === undefined ||
                        !Number.isFinite(Number(giveawayData.entryChatCursor))
                    )
                ) {
                    await bootstrapEntryChatCursor();
                }
                startEntryInputSource();
            }

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
                giftHistoryClockOffsetMs: savedTracker
                    ? optionalFiniteNumber(savedTracker.giftHistoryClockOffsetMs)
                    : null,
                giftHistoryInitialized: savedTracker ? !!savedTracker.giftHistoryInitialized : false,
                giftHistorySeenKeys: savedTracker && Array.isArray(savedTracker.giftHistorySeenKeys)
                    ? savedTracker.giftHistorySeenKeys
                    : [],
                historyFallbackActive: savedTracker
                    ? (!!savedTracker.historyFallbackActive || !savedTracker.giftHistoryInitialized)
                    : true,
                maxAcceptedCreatedAtTs:
                    optionalFiniteNumber(giveawayData?.settlement?.cutoffTs) ??
                    (savedTracker ? optionalFiniteNumber(savedTracker.maxAcceptedCreatedAtTs) : null)
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
            startButton.textContent = t("uiStop");
            startButton.dataset.mode = "stop";
            startButton.style.backgroundColor = "#b32525";
            startButton.title = t("uiStopTitle");
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
            const committedSettlement = snap?.giveawayData?.settlement?.committed === true;
            if (!committedSettlement) {
                clearGiveawaySnapshot();
            } else {
                console.warn("[BON Giveaway] Committed settlement snapshot retained after restore failure for a later recovery attempt.");
            }
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
            window.alert(t("alertInvalidAmount"));
            return;
        }
        const amountInt = parseInt(cleanValue, 10);
        if (!Number.isFinite(amountInt) || amountInt <= 0) {
            window.alert(t("alertPositiveAmount"));
            return;
        }

        const requestedWinners = Math.max(1, Math.min(MAX_WINNERS, parseInt(winnersInput.value, 10) || 1));
        const minimumPotForRequestedWinners = minimumPotForWeightedWinners(requestedWinners);
        if (amountInt < minimumPotForRequestedWinners) {
            window.alert(t("alertMinimumPot", {
                winners: fmtBON(requestedWinners),
                minimum: fmtBONCurrency(minimumPotForRequestedWinners)
            }));
            return;
        }

        // Claim ownership BEFORE mutating UI/state. Never steal a fresh lock from
        // another tab: that is the primary cross-tab double-payout defence.
        if (!await acquireTabLock()) {
            window.alert(t("alertOwnership"));
            return;
        }

        if (sponsorsInterval) { clearInterval(sponsorsInterval); sponsorsInterval = null; }
        stopEntryInputSource();

        if (chatbox == null) {
            chatbox = document.querySelector(`#${chatboxId}`);
        }

        const sitePreflight = await preflightSiteCapabilitiesForStart({
            donationPercent: donationPercentInput ? donationPercentInput.value : 0
        });
        if (!sitePreflight.ok) {
            logEvent("Start aborted (site preflight)", sitePreflight.reason);
            window.alert(t("alertPreflightFailed", { reason: sitePreflight.reason }));
            return;
        }
        chatroomId = sitePreflight.roomId;
        OT_CHATROOM_ID = chatroomId;

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

        // Custom scaling threshold (null = auto-calculate from starting pot / base winners).
        // The UI is auto-populated for convenience, so the numeric field having a value
        // does NOT by itself mean the host chose a custom threshold.
        const customBonPerWinner = scaleBonPerWinnerInput ? parseInt(scaleBonPerWinnerInput.value, 10) : NaN;
        const scaleBonPerWinner = (
            scaleWinnersWithSponsors &&
            bonPerWinnerManuallyEdited &&
            Number.isFinite(customBonPerWinner) &&
            customBonPerWinner > 0
        )
            ? customBonPerWinner
            : null;

        giveawayData = {
            host: document.getElementsByClassName("top-nav__username")[0].children[0].textContent.trim(),
            chatroomId,
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
            window.alert(t("alertBalanceUnavailable"));
            resetGiveaway();
            return;
        }

        if (currentBon < giveawayData.amount) {
            const startErr = `Entered amount ${fmtBONCurrency(giveawayData.amount)} exceeds current BON ${fmtBONCurrency(currentBon)}.`;
            logEvent("Start aborted", startErr);
            window.alert(t("alertBalanceLow", { amount: giveawayData.amount, balance: currentBon }));
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
            const introVars = {
                marker: bridgeMarker(startMarker, "🎁"),
                percent: donationPct,
                remaining: 100 - donationPct,
                poolName: BONANZA.FUND_NAME,
                poolNameUpper: BONANZA.FUND_NAME.toUpperCase(),
                poolColor: BONANZA.GIVEAWAY_COLOR
            };
            const introHeader = donationPct > 0
                ? (riggedMode ? t("introTaxes", introVars) : t("introPool", introVars))
                : t("introStandard", introVars);
            const donationIntroLine = donationPct > 0
                ? (riggedMode ? t("introTaxAllocation", introVars) : t("introPoolAllocation", introVars))
                : "";

            let introMessage =
                `${introHeader}[b][color=#ffc00a]${fmtBONCurrency(giveawayData.amount)} BON[/color][/b] | ` +
                `${buildWinnersAnnouncementLine(giveawayData)} | ` +
                t("introOpenFor", { duration: parseTime(totalTimeMs) }) +
                t("pickNumber", { start: giveawayData.startNum, end: giveawayData.endNum }) +
                `[b][color=#5DE2E7]${giveawayData.customMessage}[/color][/b]` +
                donationIntroLine + "\n" +
                t("giftHostHint", { hintColor: GIFT_HINT_COLOR, host: getGiftSyntaxHostName() });

            if (riggedMode) introMessage += t("riggedModeIntro");
            if (GENERAL_SETTINGS.silent_mode) introMessage += t("silentModeIntro");

            if (window.__activeTracker) window.__activeTracker = null;
            let tracker = new SponsorTracker({
                chatroomId,
                giveawayStartTime: new Date(),
                giveawayData
            });
            await tracker.bootstrapGiftHistory();

            // Establish the API-entry cursor before the public opening message.
            // Timestamp filtering below prevents pre-opening chat from becoming
            // entries, while this avoids losing a very fast post-intro entry.
            if (SITE.chat.entrySource === "api") {
                await bootstrapEntryChatCursor();
            }

            await sendMessage(introMessage, { kind: "intro" });

            // Public opening is the temporal boundary. The pre-opening Gift History
            // snapshot means every subsequently appearing received gift is new.
            giveawayStartTime = new Date();
            tracker.giveawayStartTs = giveawayStartTime.getTime();
            // The advertised duration begins at the same public-opening boundary,
            // not while balance/history preflight or chat delivery is still running.
            giveawayData.endTs = giveawayStartTime.getTime() + totalTimeMs;
            giveawayData.timeLeft = totalTimeMs / 1000;
            window.__activeTracker = tracker;

            try { await tracker.poll(); } catch (e) { console.error(e); }
            sponsorsInterval = setInterval(
                () => tracker.poll(),
                SPONSOR_GIFT_HISTORY_POLL_MS
            );

            startEntryInputSource();

            giveawayData.countdownTimerID = countdownTimer(countdownHeader, giveawayData);

            giveawayData.potUpdater = setInterval(() => {
                coinHeader.innerHTML = `${fmtBONCurrency(cleanPotString(giveawayData.amount))} BON`;
                coinHeader.prepend(goldCoins.cloneNode(false));
            }, 5000);

            // Start button → Stop button wiring stays the same...
        }

        // ** TOGGLE BUTTON TO STOP **
        startButton.textContent = t("uiStop");
            startButton.dataset.mode = "stop";
        startButton.style.backgroundColor = "#b32525"; // red to indicate Stop
        startButton.title = t("uiStopTitle");
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
        startButton.textContent = t("uiStart");
        startButton.dataset.mode = "start";
        startButton.style.backgroundColor = "#02B008"; // green for Start
        startButton.title = t("uiStartTitle");
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

        stopEntryInputSource();

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

    function chatApiUserRoleText(user) {
        const group = user?.group || {};
        return [
            group?.name,
            group?.slug,
            group?.title,
            user?.title
        ].map(v => String(v || "").trim()).filter(Boolean).join(" ");
    }

    function buildFancyNameFromChatApiUser(user) {
        const username = String(user?.username || "").trim();
        if (!username) return "";

        const role = chatApiUserRoleText(user);
        const rawColor = String(user?.group?.color || "").trim();
        const color = /^#?[0-9a-f]{6}$/i.test(rawColor)
            ? (rawColor.startsWith("#") ? rawColor : `#${rawColor}`)
            : "";
        const style = color ? ` style="color:${escapeHTML(color)};"` : "";
        const title = role ? ` title="${escapeHTML(role)}"` : "";

        return `<address class="user-tag"><a href="/users/${encodeURIComponent(username)}"${title} class="user-tag__link"${style}>${escapeHTML(username)}</a></address>`;
    }

    async function fetchEntryChatApiMessages(roomId) {
        const url = new URL(`/api/chat/messages/${roomId}`, location.origin);
        const cursor = Math.max(0, Math.floor(Number(giveawayData?.entryChatCursor) || 0));
        if (cursor) url.searchParams.set("after_id", String(cursor));

        const res = await fetchWithTimeout(url, {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: { "Accept": "application/json" }
        }, 7000);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const payload = await res.json();
        return sortChatMessagesChronologically(
            Array.isArray(payload?.data) ? payload.data : []
        );
    }

    async function _pollEntryChatApi(options = {}) {
        if (!giveawayData) return false;

        const allowEnding = !!options.allowEnding;
        if (allowEnding) {
            if (!ownsTabLock()) return false;
        } else {
            if (giveawayData.__ending || !canMutateActiveGiveaway()) return false;
        }

        const roomId = Number(giveawayData.chatroomId || chatroomId);
        if (!Number.isFinite(roomId) || roomId <= 0) return false;

        const cursorAtStart = Math.max(
            0,
            Math.floor(Number(giveawayData.entryChatCursor) || 0)
        );
        let maxCreatedAtTs = optionalFiniteNumber(options.maxCreatedAtTs);
        const scheduledEndTs = optionalFiniteNumber(giveawayData?.endTs);
        if (scheduledEndTs !== null) {
            maxCreatedAtTs = maxCreatedAtTs === null
                ? scheduledEndTs
                : Math.min(maxCreatedAtTs, scheduledEndTs);
        }

        const startTs = Number(giveawayStartTime?.getTime?.()) ||
            Number(giveawayData?.startedAt) ||
            0;

        let messages;
        try {
            messages = await fetchEntryChatApiMessages(roomId);
        } catch (e) {
            logEvent("Entry chat API poll failed", String(e?.message || e));
            return false;
        }

        if (!giveawayData) return false;
        if (!allowEnding && (giveawayData.__ending || !canMutateActiveGiveaway())) return false;
        if (allowEnding && !ownsTabLock()) return false;

        let maxSeenId = cursorAtStart;
        let processedRelevant = 0;

        for (const m of messages) {
            const id = Math.floor(Number(m?.id));
            if (!Number.isFinite(id) || id <= cursorAtStart) continue;

            // Always advance over every ordinary API row we inspected. If the
            // endpoint ignores after_id, local cursor correctness still holds.
            if (id > maxSeenId) maxSeenId = id;

            if (m?.bot) continue;

            const createdAtTs = Date.parse(m?.created_at || "");
            const resolutionMs = unit3dTimestampResolutionMs(m?.created_at);

            if (
                startTs > 0 &&
                Number.isFinite(createdAtTs) &&
                (createdAtTs + resolutionMs) <= startTs
            ) continue;

            if (
                maxCreatedAtTs !== null &&
                Number.isFinite(createdAtTs) &&
                (createdAtTs + resolutionMs) > (maxCreatedAtTs + 1)
            ) {
                if (options.allowEnding && DEBUG_SETTINGS.log_chat_messages) {
                    console.debug(
                        `[BONanza] Deferred/rejected boundary chat message id=${id}: timestamp interval does not fit before cutoff.`
                    );
                }
                continue;
            }

            const author = String(m?.user?.username || "").trim();
            if (!author) continue;

            const text = normalizeChatApiText(m?.message);
            if (!text) continue;

            const fancyName = buildFancyNameFromChatApiUser(m?.user);
            if (processSemanticChatMessage(author, text, fancyName, {
                entriesOnly: !!options.entriesOnly,
                suppressReply: !!options.suppressReply
            })) {
                processedRelevant += 1;
            }
        }

        if (maxSeenId > cursorAtStart) {
            giveawayData.entryChatCursor = maxSeenId;
            if (!allowEnding) snapshotGiveaway();
        }

        if (processedRelevant && DEBUG_SETTINGS.log_chat_messages) {
            console.debug(
                `[BONanza] Entry API poll processed ${processedRelevant} relevant message(s); cursor=${maxSeenId}`
            );
        }

        return true;
    }

    async function pollEntryChatApi(options = {}) {
        const dedicated = !!(
            options.allowEnding ||
            options.entriesOnly ||
            optionalFiniteNumber(options.maxCreatedAtTs) !== null
        );

        if (entryChatPollInFlight) {
            if (!dedicated) return entryChatPollInFlight;
            try { await entryChatPollInFlight; } catch {}
        }

        const run = _pollEntryChatApi(options);
        entryChatPollInFlight = run;
        try {
            return await run;
        } finally {
            if (entryChatPollInFlight === run) entryChatPollInFlight = null;
        }
    }

    async function bootstrapEntryChatCursor() {
        const latest = await getLatestChatMessageId();
        const cursor = Number.isFinite(Number(latest))
            ? Math.max(0, Math.floor(Number(latest)))
            : 0;
        if (giveawayData) giveawayData.entryChatCursor = cursor;
        return cursor;
    }

    function stopEntryInputSource() {
        if (entryChatPollInterval) {
            clearInterval(entryChatPollInterval);
            entryChatPollInterval = null;
        }
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }

    function startEntryInputSource() {
        stopEntryInputSource();

        if (SITE.chat.entrySource === "api") {
            const pollMs = Math.max(1000, Number(SITE.chat.entryPollMs) || 2000);
            entryChatPollInterval = setInterval(
                () => { void pollEntryChatApi(); },
                pollMs
            );
            void pollEntryChatApi();
            return;
        }

        addObserver(giveawayData);
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

    function processSemanticChatMessage(author, messageContent, fancyName = "", options = {}) {
        const text = String(messageContent || "").trim();
        const user = String(author || "")
            .replace(/[\u200B\u200C\u200D\u2063\uFEFF]/g, "")
            .trim();
        if (!text || !user || !giveawayData) return false;

        const isEntry = regNum.test(text);
        const isCommand = text.startsWith("!");
        if (!isEntry && !isCommand) return false;
        if (options.entriesOnly && !isEntry) return false;

        if (isEntry) {
            handleEntryMessage(
                parseInt(text, 10),
                user,
                fancyName,
                giveawayData,
                { suppressReply: !!options.suppressReply }
            );
        } else {
            handleGiveawayCommands(user, text, fancyName, giveawayData);
        }
        return true;
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

        const author = getAuthor(messageNode);
        if (!author) return;

        // Avoid expensive style extraction for irrelevant chat lines.
        const isRelevant = regNum.test(messageContent) || messageContent.startsWith("!");
        if (!isRelevant) return;

        const fancyName = captureFancyNameTag(messageNode, author);
        processSemanticChatMessage(author, messageContent, fancyName);

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
            sendCommandResponse(author, t("entryNaughtyBlocked", {
                user: sanitizeNick(author)
            }));
            naughtyWarned.add(naughtyKey);
        }
        return true;
    }

    function handleEntryMessage(number, author, fancyName, giveawayData, options = {}) {
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
            const repeatMessage = t("entryAlreadyEntered", {
                user: safeAuthor,
                number: existing
            });
            if (canSendUserFeedback(author, "entry-repeat")) sendCommandResponse(author, repeatMessage);
            return;
        }

        const otherAuthor = numberTakenBy.get(number);
        if (otherAuthor && otherAuthor !== author) {
            const safeOther = sanitizeNick(otherAuthor);
            const repeatMessage = t("entryNumberTaken", {
                user: safeAuthor,
                other: safeOther,
                number
            }) + suggestion;
            if (canSendUserFeedback(author, "entry-repeat")) sendCommandResponse(author, repeatMessage);
            return;
        }

        if (number < giveawayData.startNum || number > giveawayData.endNum) {
            const outOfBoundsMessage = t("entryOutOfRange", {
                user: safeAuthor,
                number,
                start: giveawayData.startNum,
                end: giveawayData.endNum
            });
            if (canSendUserFeedback(author, "entry-range")) sendCommandResponse(author, outOfBoundsMessage);
            return;
        }

        if (!numberEntries.has(author)) {
            // when you actually add them, you still store the real author internally
            addNewEntry(author, fancyName, number);
        }

        if (!GENERAL_SETTINGS.suppress_entry_replies && !options.suppressReply) {
            const timeLeftStr = parseTime(giveawayData.timeLeft * 1000);
            const rigHint = rigNote(t("rigHintEntry"));
            const msg = t("entryConfirmed", {
                user: safeAuthor,
                number,
                remaining: timeLeftStr
            }) + rigHint;
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

    function parseUnit3dBonAmount(value) {
        const raw = String(value || "")
            .replace(/\u00a0/g, " ")
            .trim();
        if (!raw) return NaN;

        // UNIT3D installations use a mixture of raw decimal currency
        // ("140000.00", "999.00") and locale/grouped formatting
        // ("1,500,000.00", "1.500.000,00", "1 500 000,00").
        // A final separator followed by exactly two digits is treated as the
        // decimal separator. Everything else is grouping and is discarded.
        const compact = raw.replace(/\s+/g, "");
        const decimalMatch = compact.match(/([.,])(\d{2})$/);

        let integerPart = compact;
        let fractionalPart = "";
        if (decimalMatch) {
            integerPart = compact.slice(0, -3);
            fractionalPart = decimalMatch[2];
        }

        const integerDigits = integerPart.replace(/[^0-9]/g, "");
        if (!integerDigits) return NaN;

        const whole = Number(integerDigits);
        if (!Number.isFinite(whole)) return NaN;

        if (!fractionalPart) return whole;
        const fraction = Number(fractionalPart) / 100;
        return Number.isFinite(fraction) ? whole + fraction : whole;
    }

    function parseUnit3dTimestamp(value) {
        const raw = String(value || "").trim();
        if (!raw) return NaN;

        // DarkPeers Gift History currently renders Carbon timestamps without a
        // timezone suffix. Preserve both browser-local and UTC-scale interpretations;
        // SponsorTracker learns the actual site-wall-clock ↔ chat-API offset from
        // unambiguous gifts instead of assuming either interpretation is canonical.
        const dbStyle = raw.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(\.\d+)?$/);
        if (dbStyle) return Date.parse(`${dbStyle[1]}T${dbStyle[2]}${dbStyle[3] || ""}`);

        return Date.parse(raw);
    }

    function parseUnit3dTimestampUtcFallback(value) {
        const raw = String(value || "").trim();
        const dbStyle = raw.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(\.\d+)?$/);
        return dbStyle ? Date.parse(`${dbStyle[1]}T${dbStyle[2]}${dbStyle[3] || ""}Z`) : NaN;
    }

    function unit3dTimestampResolutionMs(value) {
        const raw = String(value || "").trim();
        const timestamp = raw.match(
            /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.(\d+))?(?:Z|[+-]\d{2}:?\d{2})?$/
        );
        if (!timestamp) return 1;
        if (!timestamp[1]) return 1000;
        const fractionalDigits = Math.min(timestamp[1].length, 3);
        return Math.max(1, 1000 / (10 ** fractionalDigits));
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

                const amount = parseUnit3dBonAmount(cells[2].textContent);

                const timeEl = cells[4].querySelector("time");
                const rawTimestamp = timeEl?.getAttribute("datetime") || "";
                const createdAtTs = parseUnit3dTimestamp(rawTimestamp);
                const createdAtAltTs = parseUnit3dTimestampUtcFallback(rawTimestamp);
                const timestampResolutionMs = unit3dTimestampResolutionMs(rawTimestamp);

                const rawMessage = String(cells[3].textContent || "")
                    .replace(/\s+/g, " ")
                    .trim();
                const message = /^(?:no note|sem nota|sem mensagem)$/i.test(rawMessage) ? "" : rawMessage;

                return {
                    sender: giftHistoryUsernameFromCell(cells[0]),
                    recipient: giftHistoryUsernameFromCell(cells[1]),
                    amount,
                    message,
                    rawTimestamp,
                    createdAtTs,
                    createdAtAltTs,
                    timestampResolutionMs
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
                const message = /^(?:no note|sem nota|sem mensagem)$/i.test(rawNote) ? "" : rawNote;

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

    function optionalFiniteNumber(value) {
        if (value === null || value === undefined || value === "") return null;
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : null;
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
            this.giftHistoryClockOffsetMs = optionalFiniteNumber(giftHistoryClockOffsetMs);
            this.giftHistoryInitialized = !!giftHistoryInitialized;
            this.giftHistorySeenKeys = new Set(
                (Array.isArray(giftHistorySeenKeys) ? giftHistorySeenKeys : [])
                    .filter(key => typeof key === "string" && key)
            );
            this.historyFallbackActive = !!historyFallbackActive;
            this.maxAcceptedCreatedAtTs = optionalFiniteNumber(maxAcceptedCreatedAtTs);
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
                        messageId: Math.floor(Number(m?.id)),
                        gifter: parsed.gifter,
                        recipient: parsed.recipient,
                        amount: Math.max(0, Math.floor(Number(parsed.amount) || 0)),
                        rawAmount: Number(parsed.amount),
                        createdAtTs,
                        timestampResolutionMs: unit3dTimestampResolutionMs(m.created_at)
                    };
                })
                .filter(event =>
                    event.gifter &&
                    normalizeUserKey(event.recipient) === normalizeUserKey(this.data.host) &&
                    event.amount > 0
                );
        }

        async filterHistoryRowsByWindow(rows, minTs = null, maxTs = null, evidenceRows = null) {
            if (!Array.isArray(rows) || !rows.length) {
                return {
                    accepted: Array.isArray(rows) ? rows : [],
                    retryableKeys: new Set()
                };
            }

            const min = optionalFiniteNumber(minTs);
            let max = optionalFiniteNumber(maxTs);
            const liveMax = optionalFiniteNumber(this.maxAcceptedCreatedAtTs);
            const scheduledMax = optionalFiniteNumber(this.data?.endTs);
            for (const bound of [liveMax, scheduledMax]) {
                if (bound !== null) max = max === null ? bound : Math.min(max, bound);
            }
            if (min === null && max === null) {
                return { accepted: rows, retryableKeys: new Set() };
            }

            let offset = optionalFiniteNumber(this.giftHistoryClockOffsetMs);
            let chatEvents = null;

            const loadChatEvents = async () => {
                if (chatEvents !== null) return chatEvents;
                try {
                    chatEvents = await this.fetchRecentChatGiftEvents();
                } catch (e) {
                    chatEvents = [];
                    if (DEBUG_SETTINGS.log_chat_messages) {
                        console.warn("Sponsor history boundary chat fallback failed:", e);
                    }
                }
                return chatEvents;
            };

            if (offset === null) {
                const events = await loadChatEvents();
                offset = this.inferGiftHistoryClockOffset(events, rows);
            }

            // Re-read the closing latch after the await above. If endGiveaway()
            // closed the window while this ordinary poll was already in flight,
            // this pass must immediately inherit that cutoff.
            const latestMax = optionalFiniteNumber(this.maxAcceptedCreatedAtTs);
            if (latestMax !== null) max = max === null ? latestMax : Math.min(max, latestMax);

            // Coarse Gift History timestamps can straddle an exact manual closing
            // instant. Fetch chat evidence even when the site-clock offset is known.
            if (
                max !== null &&
                chatEvents === null &&
                rows.some(item => unit3dTimestampResolutionMs(item?.rawTimestamp) > 1)
            ) {
                await loadChatEvents();
            }

            const rowMatchesChatEvent = (item, event) =>
                normalizeUserKey(item?.sender) === normalizeUserKey(event?.gifter) &&
                normalizeUserKey(item?.recipient) === normalizeUserKey(event?.recipient) &&
                Math.abs(Number(item?.amount) - Number(event?.rawAmount)) <= 0.001;

            const intervalsOverlap = (aStart, aResolution, bStart, bResolution) =>
                aStart < (bStart + bResolution) &&
                bStart < (aStart + aResolution);

            const consumedBoundaryChatEvents = new Set();
            const boundaryEvidenceKey = (event, index) => {
                const id = Math.floor(Number(event?.messageId));
                return Number.isFinite(id) ? "id:" + id : "idx:" + index;
            };

            const historyStartsForBoundary = (item, resolutionMs) => {
                const wallTs = Number.isFinite(Number(item?.createdAtAltTs))
                    ? Number(item.createdAtAltTs)
                    : Number(item?.createdAtTs);

                if (offset !== null && Number.isFinite(wallTs)) {
                    const start = wallTs - offset;
                    return (min === null || (start + resolutionMs) > min) ? [start] : [];
                }

                return [
                    Number(item?.createdAtTs),
                    Number(item?.createdAtAltTs)
                ].filter(ts =>
                    Number.isFinite(ts) &&
                    (min === null || (ts + resolutionMs) > min)
                );
            };

            const chatProvesBeforeClose = (item, historyStarts, historyResolutionMs) => {
                if (max === null || !Array.isArray(chatEvents) || !chatEvents.length) return false;

                for (let index = 0; index < chatEvents.length; index++) {
                    const event = chatEvents[index];
                    const evidenceKey = boundaryEvidenceKey(event, index);
                    if (consumedBoundaryChatEvents.has(evidenceKey)) continue;
                    if (!rowMatchesChatEvent(item, event)) continue;

                    const chatStart = Number(event?.createdAtTs);
                    const chatResolution = Math.max(
                        1,
                        Number.isFinite(Number(event?.timestampResolutionMs))
                            ? Number(event.timestampResolutionMs)
                            : 1
                    );
                    if (!Number.isFinite(chatStart)) continue;

                    // A chat event only proves pre-cutoff timing when its entire
                    // source-time interval finishes by the inclusive close instant.
                    if ((chatStart + chatResolution) > (max + 1)) continue;

                    const overlaps = historyStarts.some(historyStart =>
                        Number.isFinite(historyStart) &&
                        intervalsOverlap(
                            historyStart,
                            historyResolutionMs,
                            chatStart,
                            chatResolution
                        )
                    );
                    if (!overlaps) continue;

                    consumedBoundaryChatEvents.add(evidenceKey);
                    return true;
                }
                return false;
            };

            // Reserve evidence for matching occurrences already seen in earlier
            // polls. This prevents a later identical post-cutoff history row from
            // reusing an older pre-cutoff SystemBot event.
            if (max !== null && Array.isArray(evidenceRows) && chatEvents?.length) {
                for (const priorItem of evidenceRows) {
                    if (!priorItem?.historyKey || !this.giftHistorySeenKeys.has(priorItem.historyKey)) {
                        continue;
                    }
                    const priorResolution = Math.max(
                        1,
                        Number.isFinite(Number(priorItem?.timestampResolutionMs))
                            ? Number(priorItem.timestampResolutionMs)
                            : 1
                    );
                    const priorStarts = historyStartsForBoundary(priorItem, priorResolution)
                        .filter(ts => ts <= max);
                    if (!priorStarts.length) continue;

                    chatProvesBeforeClose(priorItem, priorStarts, priorResolution);
                }
            }

            const accepted = [];
            const retryableKeys = new Set();
            for (const item of rows) {
                const resolutionMs = Math.max(
                    1,
                    Number.isFinite(Number(item?.timestampResolutionMs))
                        ? Number(item.timestampResolutionMs)
                        : 1
                );
                const wallTs = Number.isFinite(Number(item?.createdAtAltTs))
                    ? Number(item.createdAtAltTs)
                    : Number(item?.createdAtTs);

                if (offset !== null && Number.isFinite(wallTs)) {
                    const eventTs = wallTs - offset;
                    const afterOpen = min === null || (eventTs + resolutionMs) > min;
                    if (!afterOpen) continue;

                    if (max === null) {
                        accepted.push(item);
                        continue;
                    }

                    if (eventTs > max) continue;

                    if ((eventTs + resolutionMs) <= (max + 1)) {
                        accepted.push(item);
                        continue;
                    }

                    if (chatProvesBeforeClose(item, [eventTs], resolutionMs)) {
                        accepted.push(item);
                    } else {
                        if (item?.historyKey) retryableKeys.add(item.historyKey);
                        logEvent(
                            "Sponsor closing-boundary ambiguity",
                            `Deferred ${sanitizeNick(item?.sender || "unknown")} (${fmtBONCurrency(item?.amount || 0)} BON): source timestamp straddles the exact closing instant and chat timing could not yet prove it was pre-cutoff.`
                        );
                    }
                    continue;
                }

                const candidates = [
                    Number(item?.createdAtTs),
                    Number(item?.createdAtAltTs)
                ].filter(Number.isFinite);

                const openingCandidates = candidates.filter(ts =>
                    min === null || (ts + resolutionMs) > min
                );
                if (!openingCandidates.length) continue;

                if (max === null) {
                    accepted.push(item);
                    continue;
                }

                const notAfterClose = openingCandidates.filter(ts => ts <= max);
                if (!notAfterClose.length) continue;

                if (notAfterClose.some(ts => (ts + resolutionMs) <= (max + 1))) {
                    accepted.push(item);
                    continue;
                }

                if (chatProvesBeforeClose(item, notAfterClose, resolutionMs)) {
                    accepted.push(item);
                } else {
                    if (item?.historyKey) retryableKeys.add(item.historyKey);
                    logEvent(
                        "Sponsor closing-boundary ambiguity",
                        `Deferred ${sanitizeNick(item?.sender || "unknown")} (${fmtBONCurrency(item?.amount || 0)} BON): no timestamp interpretation yet proves a pre-cutoff gift.`
                    );
                }
            }
            return { accepted, retryableKeys };
        }

        async processGiftHistoryRows(rows, options = {}) {
            const optionMax = optionalFiniteNumber(options.maxCreatedAtTs);
            const trackerMax = optionalFiniteNumber(this.maxAcceptedCreatedAtTs);
            const scheduledMax = optionalFiniteNumber(this.data?.endTs);
            let maxCreatedAtTs = optionMax;
            for (const bound of [trackerMax, scheduledMax]) {
                if (bound !== null) {
                    maxCreatedAtTs = maxCreatedAtTs === null ? bound : Math.min(maxCreatedAtTs, bound);
                }
            }
            const minCreatedAtTs = optionalFiniteNumber(this.giveawayStartTs);
            const announce = options.announce !== false;
            const indexed = indexGiftHistoryRows(rows);
            const hostKey = normalizeUserKey(this.data.host);

            let newRows = indexed.filter(item =>
                item.historyKey &&
                !this.giftHistorySeenKeys.has(item.historyKey) &&
                normalizeUserKey(item.recipient) === hostKey
            );

            newRows.reverse();

            let retryableBoundaryKeys = new Set();
            if (newRows.length && (minCreatedAtTs !== null || maxCreatedAtTs !== null)) {
                const filtered = await this.filterHistoryRowsByWindow(
                    newRows,
                    minCreatedAtTs,
                    maxCreatedAtTs,
                    indexed
                );
                newRows = filtered.accepted;
                retryableBoundaryKeys = filtered.retryableKeys;
            }

            if (!canMutateActiveGiveaway()) return false;

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

            let seenStateChanged = false;
            for (const item of indexed) {
                if (!item.historyKey || retryableBoundaryKeys.has(item.historyKey)) continue;
                if (!this.giftHistorySeenKeys.has(item.historyKey)) {
                    this.giftHistorySeenKeys.add(item.historyKey);
                    seenStateChanged = true;
                }
            }
            this.trimGiftHistorySeenKeys();
            this.giftHistoryInitialized = true;
            this.historyFallbackActive = false;

            if (recordedGiftNote || newRows.length || seenStateChanged) snapshotGiveaway();

            if (this.buffer.length) {
                if (announce) await this.maybeFlush();
                else await this.flushBuffer(Date.now(), { announce: false });
            }

            return retryableBoundaryKeys.size === 0;
        }

        /* ---- Primary sponsor poll: UNIT3D Gift History ---- */
        async poll(options = {}) {
            const requestedCutoff = optionalFiniteNumber(options?.maxCreatedAtTs);
            if (requestedCutoff !== null) {
                const existingCutoff = optionalFiniteNumber(this.maxAcceptedCreatedAtTs);
                this.maxAcceptedCreatedAtTs = existingCutoff !== null
                    ? Math.min(existingCutoff, requestedCutoff)
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
            const optionMax = optionalFiniteNumber(options.maxCreatedAtTs);
            const trackerMax = optionalFiniteNumber(this.maxAcceptedCreatedAtTs);
            const scheduledMax = optionalFiniteNumber(this.data?.endTs);
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

            if (!canMutateActiveGiveaway()) return false;

            // fetchNew() can overlap endGiveaway(). Rebuild the upper boundary
            // after the await so a manual close that latches an earlier cutoff is
            // immediately inherited by this already-running fallback pass.
            const latestTrackerMax = optionalFiniteNumber(this.maxAcceptedCreatedAtTs);
            const latestScheduledMax = optionalFiniteNumber(this.data?.endTs);
            maxCreatedAtTs = optionMax;
            for (const bound of [latestTrackerMax, latestScheduledMax]) {
                if (bound !== null) {
                    maxCreatedAtTs = maxCreatedAtTs === null ? bound : Math.min(maxCreatedAtTs, bound);
                }
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
                const timestampResolutionMs = unit3dTimestampResolutionMs(m.created_at);
                if (
                    Number.isFinite(createdAtTs) &&
                    (createdAtTs + timestampResolutionMs) <= this.giveawayStartTs
                ) continue;
                if (
                    maxCreatedAtTs !== null &&
                    Number.isFinite(createdAtTs) &&
                    (createdAtTs + timestampResolutionMs) > (maxCreatedAtTs + 1)
                ) continue;

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
                    createdAtTs: parseUnit3dTimestamp(msg.created_at),
                    timestampResolutionMs: unit3dTimestampResolutionMs(msg.created_at)
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

            if (!canMutateActiveGiveaway()) return false;

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
            const persisted = optionalFiniteNumber(this.giftHistoryClockOffsetMs);
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
            if (!canMutateActiveGiveaway()) return false;
            const cleanAmount = Math.max(0, Math.floor(Number(amount) || 0));
            const sponsorKey = normalizeUserKey(gifter);
            if (!sponsorKey || !(cleanAmount > 0)) return false;

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
            return true;
        }

        async announceWinnerScalingIfNeeded() {
            if (!canMutateActiveGiveaway()) return;
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

            let message = t("scalingIncreased", {
                accent: SCALING_ACCENT_COLOR,
                old: oldWinners,
                new: newWinners,
                delta,
                total: fmtBONCurrency(totalContribForScaling),
                threshold: fmtBONCurrency(threshold)
            });

            const reachedCap = newWinners >= cap;
            if (reachedCap) {
                message += t("scalingMaxReached", { cap });
            }

            logEvent("Scaled winners increased", `${oldWinners} -> ${newWinners} (+${delta})${reachedCap ? ` | cap reached=${fmtBON(cap)}` : ""}`);
            if (!canMutateActiveGiveaway()) return;
            await sendMessage(message);
            if (!canMutateActiveGiveaway()) return;
            flashWinnersUI();
            data.lastAnnouncedWinners = newWinners;
        }


        /* ---- decide when to announce buffered sponsor gifts ---- */
        async maybeFlush(force = false) {
            if (!this.buffer.length) return;

            // In off mode, don't clutter chat at all (still counts + updates pot)
            if (SPONSOR_ANNOUNCE.mode === "off") {
                await this.announceWinnerScalingIfNeeded();
                if (!canMutateActiveGiveaway()) return;
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
            if (!canMutateActiveGiveaway()) return;
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
            const prefix = tp("sponsorsAddedOne", "sponsorsAddedMany", sponsorCount, {
                marker: bridgeMarker(BRIDGE_MARKERS.SPONSORS, "✨"),
                amount: deltaTotal
            });
            const suffix = t("totalPotNow", { amount: potTotal }) +
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
                    detailedPart += t("withMessage", { message: notes[0] });
                } else if (notes.length > 1) {
                    detailedPart += t("withMessages", { messages: notes.map(note => `[i]"${note}"[/i]`).join(", ") });
                    if (e.messages.length > notes.length) {
                        detailedPart += t("moreCount", { count: e.messages.length - notes.length });
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

                const continuationMarker = bridgeMarker(BRIDGE_MARKERS.SPONSOR_MESSAGES, "💬");
                let currentParts = [];

                const flushNoteChunk = () => {
                    if (!currentParts.length) return;
                    noteContinuationMessages.push(
                        tp("sponsorMessageHeadingOne", "sponsorMessageHeadingMany", currentParts.length, { marker: continuationMarker }) + ": " +
                        currentParts.join(" | ") + "."
                    );
                    currentParts = [];
                };

                for (const part of noteParts) {
                    const candidateParts = currentParts.concat(part);
                    const candidate =
                        tp("sponsorMessageHeadingOne", "sponsorMessageHeadingMany", candidateParts.length, { marker: continuationMarker }) + ": " +
                        candidateParts.join(" | ") + ".";

                    if (currentParts.length && visibleChatLength(candidate) > maxVisible) {
                        flushNoteChunk();
                    }
                    currentParts.push(part);
                }
                flushNoteChunk();
            }

            if (announce) {
                if (!canMutateActiveGiveaway()) return;
                await sendMessage(msg);
                if (!canMutateActiveGiveaway()) return;

                for (const noteMessage of noteContinuationMessages) {
                    if (!canMutateActiveGiveaway()) return;
                    await sendMessage(noteMessage);
                    if (!canMutateActiveGiveaway()) return;
                }

                if (!canMutateActiveGiveaway()) return;
                flashPotTotalUI();

                if (!canMutateActiveGiveaway()) return;
                await this.announceWinnerScalingIfNeeded();
                if (!canMutateActiveGiveaway()) return;
            }

            if (!canMutateActiveGiveaway()) return;
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
                sendCommandResponse(rawAuthor, t("spamLockout", { user: sanitizeNick(rawAuthor), seconds: penaltySec }));
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
            reply(t("leaderboardHeader", { marker: bridgeMarker(BRIDGE_MARKERS.STATS, "📊"), emoji, label, list: out.join(" | ") }));
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
                    t("timeLeftReply", { remaining: parseTime(giveawayData.timeLeft * 1000), marker: bridgeMarker(BRIDGE_MARKERS.TIME, "⏳") })
                );
                return;
            }

            const action = (args[0] || "").toLowerCase(); // "add" / "remove"
            const minutes = parseFloat(args[1]);
            const isPriv = normalizeUserKey(author) === normalizeUserKey(giveawayData.host) || isAdmin(fancyName);

            if (!isPriv) return; // silently ignore non-host/non-admin

            if (action !== "add" && action !== "remove") {
                reply(t("timeUsage"));
                return;
            }

            if (isNaN(minutes) || minutes <= 0) {
                reply(t("timeUsage"));
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
                reply(t("noEntriesYet", { total }));
                return;
            }

            // Sort by entry number (ascending)
            const list = Array.from(numberEntries.entries())
            .sort(([, numA], [, numB]) => numA - numB)
            .map(([user, num]) =>
                 `[color=#d85e27][b]${sanitizeNick(user)}[/b][/color]: [b]${num}[/b]`
                );

            reply(
                t("entriesSummary", { marker: bridgeMarker(BRIDGE_MARKERS.ENTRIES, "📋"), taken, total, free, list: list.join(", ") })
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
                reply(t("noSavedStats", { user: safeNameForChat(target) }));
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
                t("statEntered", { value: fmtBON(enteredAll) }),
                t("statWins", { value: fmtBON(wins) }),
                t("statLosses", { value: fmtBON(losses) }),
                t("statWR", { value: wr })
            ];

            if (rec.totalWon) parts.push(t("statWon", { value: fmtBONCurrency(rec.totalWon) }));
            if (rec.biggestWin) parts.push(t("statBest", { value: fmtBONCurrency(rec.biggestWin) }));
            if (rec.sponsoredTotal) parts.push(t("statSponsored", { value: fmtBONCurrency(rec.sponsoredTotal) }));
            if (rec.hosted) parts.push(t("statHosted", { value: fmtBON(rec.hosted) }));

            if (isHostCaller && isSelfQuery) {
                parts.push(t("statGiven", { value: fmtBONCurrency(rec.hostedTotal || 0) }));
                parts.push(t("statSponsorsReceived", { value: fmtBONCurrency(rec.sponsorReceivedTotal || 0) }));
                const thisSponsor = sumSponsorContribs(ctx.giveawayData?.sponsorContribs, ctx.giveawayData?.host);
                if (thisSponsor > 0) {
                    parts.push(t("statCurrentSponsors", { value: fmtBONCurrency(thisSponsor) }));
                }
            }

            reply(t("statsHeader", { marker: bridgeMarker(BRIDGE_MARKERS.STATS, "📊"), user: safeNameForChat(rec.name || target), parts: parts.join(" • ") }));
        },

        // Leaderboards — table-driven to reduce repetition
        top:      makeLeaderboardCommand({
            emoji: "🏆", label: t("leaderboardTopWinners"), emptyMsg: t("noWinnerStats"),
            sort:   (a, b) => (b.wins - a.wins) || (b.totalWon - a.totalWon) || (b.entered - a.entered),
            filter: u => (u.wins || 0) > 0,
            format: (u, i) =>
                `${i + 1}) [color=#d85e27]${safeNameForChat(u.name)}[/color] - ` +
                `[color=#1DDC5D]${fmtBON(u.wins)}W[/color] • ` +
                `[color=#ffc00a]${fmtBONCurrency(u.totalWon)} BON[/color]`
        }),

        most:     makeLeaderboardCommand({
            emoji: "💰", label: t("leaderboardMostBon"), emptyMsg: t("noWinnerStats"),
            sort:   (a, b) => (b.totalWon - a.totalWon) || (b.wins - a.wins) || (b.entered - a.entered),
            filter: u => (u.totalWon || 0) > 0,
            format: (u, i) =>
                `${i + 1}) [color=#d85e27]${safeNameForChat(u.name)}[/color] - ` +
                `[color=#ffc00a]${fmtBONCurrency(u.totalWon)} BON[/color] • ` +
                `[color=#1DDC5D]${fmtBON(u.wins)}W[/color]`
        }),

        sponsors: makeLeaderboardCommand({
            emoji: "💸", label: t("leaderboardTopSponsors"), emptyMsg: t("noSponsorStats"),
            sort:   (a, b) => (b.sponsoredTotal - a.sponsoredTotal) || (b.sponsorCount - a.sponsorCount),
            filter: u => (u.sponsoredTotal || 0) > 0,
            format: (u, i) =>
                `${i + 1}) [color=#d85e27]${safeNameForChat(u.name)}[/color] - ` +
                `[color=#ffc00a]${fmtBONCurrency(u.sponsoredTotal)} BON[/color] • ` +
                `[color=#1DDC5D]${fmtBON(u.sponsorCount)}x[/color]`
        }),

        unlucky:  makeLeaderboardCommand({
            emoji: "😵", label: t("leaderboardUnlucky"), emptyMsg: t("noUnluckyStats"),
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
                    `/ [color=#ffc00a]${fmtBON(entered)} ${t("unluckyEntered")}[/color] ` +
                    `• [color=#1DDC5D]WR ${wr}%[/color]`;
            }
        }),


        largest(ctx) {
            const { reply } = ctx;
            const n = Math.min(STATS_MAX_TOP_N, Math.max(1, parseInt(ctx.args[0] || STATS_DEFAULT_TOP_N, 10) || STATS_DEFAULT_TOP_N));
            const stats = getStatsForRead();
            const all = Array.isArray(stats.giveaways) ? stats.giveaways.slice() : [];

            if (!all.length) {
                reply(t("noHistory"));
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
                return t("unknownDate");
            };


            const top = all
            .filter(g => getAmt(g) > 0)
            .sort((a, b) => (getAmt(b) - getAmt(a)) || (getEndedAt(b) - getEndedAt(a)))
            .slice(0, n);

            if (!top.length) {
                reply(t("noHistory"));
                return;
            }

            const out = top.map((g, i) => {
                const amt = fmtBONCurrency(getAmt(g));
                const d = fmtEndedDate(g);
                return `${i + 1}) [color=#ffc00a]${amt} BON[/color] [color=#9aa0a6](${d})[/color]`;
            });

            reply(t("largestGiveaways", { list: out.join(" | ") }));

        },

        gift({ giveawayData, reply }) {
            const giftHost = getGiftSyntaxHostName();
            reply(t("giftUsage", { marker: bridgeMarker(BRIDGE_MARKERS.GIFT, "✨"), host: giftHost }));
        },

        bon({ giveawayData , reply}) {
            const rigTag = rigNote(t("rigHintPot"));
            reply(
                t("giveawayAmount", { amount: fmtBONCurrency(giveawayData.amount) }) +
                rigTag
            );
        },

        range({ giveawayData , reply}) {
            const rigTag = rigNote(t("rigHintRange"));
            reply(
                t("rangeValid", { start: giveawayData.startNum, end: giveawayData.endNum }) +
                rigTag
            );
        },

        lucky({ safeAuthor, giveawayData , reply}) {
            // Safety: no active giveaway
            if (!giveawayData) {
                reply(t("noActiveGiveaway"));
                return;
            }

            if (GENERAL_SETTINGS.disable_lucky) {
                reply(
                    t("luckyDisabled", { user: safeAuthor })
                );
                return;
            }

            const luckyNum = getLuckyNumber(giveawayData);
            if (luckyNum === null || luckyNum === undefined) {
                reply(t("noFreeNumbers"));
                return;
            }
            const rigHint = rigNote(t("rigHintLucky"));

            reply(
                t("luckyNumber", { number: luckyNum }) + rigHint
            );
        },

        luckye(ctx) {
            const { author, safeAuthor, fancyName, giveawayData, reply } = ctx;

            // Safety: no active giveaway
            if (!giveawayData) {
                reply(t("noActiveGiveaway"));
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
                    t("entryAlreadyEntered", { user: safeAuthor, number: userNumber })
                );
                return;
            }

            const luckyNum = getLuckyNumber(giveawayData);
            if (luckyNum === null || luckyNum === undefined) {
                reply(t("noFreeNumbers"));
                return;
            }

            addNewEntry(author, fancyName, luckyNum);

            const timeLeftStr = parseTime(giveawayData.timeLeft * 1000);
            const rigHint = rigNote(t("rigHintLucky"));

            reply(
                t("luckyeEntered", { user: safeAuthor, number: luckyNum, remaining: timeLeftStr }) + rigHint
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
                        t("rigEnabled", { marker: bridgeMarker(BRIDGE_MARKERS.RIGGED, "😈") })
                    );
                }
            } else {
                if (hasActiveGiveaway) {
                    reply(
                        t("rigAlready")
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
                        t("rigDisabled", { marker: bridgeMarker(BRIDGE_MARKERS.UNRIGGED, "😒") })
                    );
                }
            } else {
                if (hasActiveGiveaway) {
                    reply(
                        t("rigNotEnabled")
                    );
                }
            }
        },

        random(ctx) {
            const { author, safeAuthor, fancyName, giveawayData, reply } = ctx;

            if (GENERAL_SETTINGS.disable_random) {
                reply(t("randomDisabled", { user: safeAuthor }));
                return;
            }
            const userNumber = numberEntries.get(author);
            if (userNumber !== undefined) {
                reply(t("entryAlreadyEntered", { user: safeAuthor, number: userNumber }));
                return;
            }

            const randomNum = pickRandomFreeNumber(giveawayData);
            if (randomNum === null) {
                reply(t("noFreeNumbers"));
                return;
            }

            addNewEntry(author, fancyName, randomNum);
            const timeLeftStr = parseTime(giveawayData.timeLeft * 1000);
            const rigHint = rigNote(t("rigHintRandom"));
            reply(
                t("randomEntered", { user: safeAuthor, number: randomNum, remaining: timeLeftStr }) + rigHint
            );
        },

        number({ author, safeAuthor , reply}) {
            const userNumber = numberEntries.get(author);
            if (userNumber !== undefined) {
                reply(t("yourNumber", { user: safeAuthor, number: userNumber }));
            } else {
                reply(t("notEntered", { user: safeAuthor }));
            }
        },

        free({ safeAuthor, giveawayData , reply}) {
            if (GENERAL_SETTINGS.disable_free) {
                reply(t("freeDisabled", { user: safeAuthor }));
                return;
            }

            const sample = getFreeNumberSample(giveawayData, 5);

            if (!sample.length) {
                reply(t("noFreeNumbersAlt"));
                return;
            }

            const rigHint = rigNote(t("rigHintFree"));
            reply(t("freeNumbers", { numbers: sample.join(", ") }) + rigHint);
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
                reply(t("winnersUsage", { max: MAX_WINNERS }));
                return;
            }

            const minimumPot = minimumPotForWeightedWinners(newCount);
            if (Math.floor(Number(giveawayData.amount) || 0) < minimumPot) {
                reply(t("winnersInsufficientPot", {
                    winners: fmtBON(newCount),
                    pot: fmtBONCurrency(giveawayData.amount),
                    minimum: fmtBONCurrency(minimumPot)
                }));
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
                const direction = t(newCount > prevEffective ? "wordIncreased" : "wordDecreased");
                const delta = Math.abs(newCount - prevEffective);
                const sign = newCount > prevEffective ? "+" : "−";
                const announcement = t("hostWinnerAdjustment", {
                    accent: SCALING_ACCENT_COLOR,
                    direction,
                    old: prevEffective,
                    new: newCount,
                    sign,
                    delta
                });
                sendMessage(announcement);
                flashWinnersUI();
                logEvent("Host adjusted winners", `${prevEffective} -> ${newCount} (${sign}${delta})`);
            }

            const capNote = capWasReset
                ? t("scalingCapReset", { count: newCount })
                : "";
            reply(t("winnersSet", { count: newCount, capNote }));
            snapshotGiveaway();
        },

        maxwinners(ctx) {
            const { author, fancyName, args, giveawayData, reply } = ctx;
            if (!isHostOrAdmin(author, fancyName, giveawayData.host)) return;
            if (!giveawayData.scaleWinnersWithSponsors) {
                reply(t("scalingDisabled"));
                return;
            }
            const newMax = parseInt(args[0], 10);
            const baseWinners = Math.max(1, Math.floor(Number(giveawayData.baseWinnersAtStart || giveawayData.winnersNum) || 1));
            if (isNaN(newMax) || newMax < baseWinners || newMax > MAX_WINNERS) {
                reply(t("maxWinnersUsage", { base: baseWinners, max: MAX_WINNERS }));
                return;
            }
            giveawayData.hostMaxScaledWinners = newMax;
            if (maxScaledWinnersInput) maxScaledWinnersInput.value = String(newMax);
            const effective = recomputeEffectiveWinners(giveawayData);
            initializeScaledWinnersAnnouncementState(giveawayData);
            reply(t("maxWinnersSet", { max: newMax, effective }));
            snapshotGiveaway();
        },

        scale(ctx) {
            const { giveawayData, reply } = ctx;
            if (!giveawayData) {
                reply(t("noActiveGiveaway"));
                return;
            }
            if (!giveawayData.scaleWinnersWithSponsors) {
                reply(t("scalingDisabled"));
                return;
            }

            const state = getScalingProgressState(giveawayData);
            if (!state) {
                reply(t("scalingUnavailable"));
                return;
            }

            const extraWinners = state.effectiveWinners - state.baseWinners;
            let msg = t("scaleStatus", {
                accent: SCALING_ACCENT_COLOR,
                effective: state.effectiveWinners,
                base: state.baseWinners,
                extra: extraWinners > 0 ? t("scaleExtra", { count: extraWinners }) : "",
                cap: state.cap,
                threshold: fmtBONCurrency(state.threshold),
                mode: t(state.isCustomThreshold ? "scaleModeCustom" : "scaleModeAuto"),
                total: fmtBONCurrency(state.totalContrib)
            });

            if (state.effectiveWinners >= state.cap) {
                msg += t("scaleReached");
            } else {
                msg += t("scaleProgress", {
                    next: state.nextWinner,
                    progress: fmtBONCurrency(state.progress),
                    threshold: fmtBONCurrency(state.threshold),
                    remaining: fmtBONCurrency(state.remaining)
                });
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
                    if (!key) { reply(t("naughtyAddUsage")); return; }

                    if (key === normalizeUserKey(giveawayData.host)) {
                        reply(t("naughtyHostDenied"));
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

                    reply(t("naughtyAdded", { marker: bridgeMarker(BRIDGE_MARKERS.NAUGHTY, "👮"), user: fmtUserList([target]) }));
                    break;
                }


                case "remove":
                    if (!key) { reply(t("naughtyRemoveUsage")); return; }
                    naughtySet.delete(key); saveNaughty();
                    reply(t("naughtyRemoved", { user: fmtUserList([target]) }));
                    break;

                case "list":
                    reply(naughtySet.size ? t("naughtyList", { users: fmtUserList([...naughtySet]) }) : t("naughtyEmpty"));
                    break;

                default:
                    reply(t("naughtyUsage"));
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
                    reply(t("adminEndUsage", { host: sanitizeNick(giveawayData.host) }));
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

        const helpText = t("helpCommands", {
            commands: COMMANDS.map(({ name, setting }) =>
                fmt(name, setting && GENERAL_SETTINGS[setting])
            ).join(" - ")
        });
        reply(helpText);
    }


    async function hostAddBon(ctx) {
        const { author, args, giveawayData, reply } = ctx;
        if (normalizeUserKey(author) !== normalizeUserKey(giveawayData.host)) return;

        if (hostAddBonInFlight) {
            reply(t("hostTopupBusy"));
            return;
        }

        const raw = args[0];
        const clean = String(raw ?? "").replace(/[^0-9]/g, "");
        const amount = parseInt(clean, 10);

        if (!Number.isFinite(amount) || amount <= 0) {
            reply(t("hostTopupUsage"));
            return;
        }

        // Serialize the balance check and mutation as one host transaction.
        hostAddBonInFlight = true;
        try {
            const currentBon = await getVerifiedHostBalance({ requireServer: true, maxAgeMs: 0 });
            if (!canMutateActiveGiveaway()) {
                logEvent(
                    "Host BON top-up aborted",
                    "The page lost exclusive giveaway ownership while the balance check was in flight."
                );
                return;
            }
            const currentPot = Math.max(0, Math.floor(Number(giveawayData.amount) || 0));
            const newTotal = currentPot + amount;
    
            if (!Number.isFinite(currentBon) || currentBon == null || currentBon < 0) {
                reply(t("hostTopupBalanceUnavailable"));
                return;
            }
    
            if (currentBon < newTotal) {
                reply(t("hostTopupInsufficient", { balance: fmtBONCurrency(currentBon), total: fmtBONCurrency(newTotal) }));
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
    
            const addedPart = t("hostTopupAdded", { amount: fmtBONCurrency(amount) });
            const totalPart = t("hostTopupTotal", { amount: fmtBONCurrency(Number(cleanPotString(giveawayData.amount))) });
    
            let scalingPart = "";
            if (giveawayData.scaleWinnersWithSponsors) {
                if (winnersDelta > 0) {
                    scalingPart = t("hostTopupScaling", { accent: SCALING_ACCENT_COLOR, old: prevEffectiveWinners, new: newEffectiveWinners, delta: winnersDelta });
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
                    t("timeUsageExtended")
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

            const oneKey = sign > 0 ? "timeAddedOne" : "timeRemovedOne";
            const manyKey = sign > 0 ? "timeAddedMany" : "timeRemovedMany";
            reply(tp(oneKey, manyKey, mins, {
                minutes: mins,
                remaining: parseTime(giveawayData.endTs - Date.now())
            }));
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

        const reconcileSettlementOutput = async (checkpoint, preparedMessage) => {
            const rawAfterMessageId = checkpoint?.afterMessageId;
            const afterId =
                rawAfterMessageId !== null &&
                rawAfterMessageId !== undefined &&
                Number.isFinite(Number(rawAfterMessageId))
                    ? Math.floor(Number(rawAfterMessageId))
                    : null;
            const startedAt = Number.isFinite(Number(checkpoint?.startedAt))
                ? Number(checkpoint.startedAt)
                : Date.now();
            const unresolvedSendUntil = startedAt + 9000;

            // The previous owner's POST may still be alive for the full 7-second
            // API timeout. Never replay while that original send can still commit.
            const waitMs = Math.max(0, unresolvedSendUntil - Date.now());
            if (waitMs > 0) {
                await new Promise(resolve => setTimeout(resolve, waitMs));
                if (!canMutateActiveGiveaway()) return { owned: false, found: false };
            }

            // A prior owner may have successfully posted even if its API response
            // was lost during BFCache/pagehide. Check a few times for that exact
            // prepared message before allowing a replay. A replay is permitted only
            // after at least one authoritative chat read succeeds.
            let authoritativeReads = 0;
            for (let attempt = 1; attempt <= 3; attempt++) {
                if (!canMutateActiveGiveaway()) return { owned: false, found: false };

                try {
                    const url = new URL(`/api/chat/messages/${chatroomId}`, location.origin);
                    if (afterId !== null) url.searchParams.set("after_id", String(afterId));
                    const res = await fetchWithTimeout(url, { credentials: "include" }, 5000);
                    if (!canMutateActiveGiveaway()) return { owned: false, found: false };

                    if (res?.ok) {
                        const payload = await res.json();
                        if (!canMutateActiveGiveaway()) return { owned: false, found: false };
                        if (!Array.isArray(payload?.data)) throw new Error("Malformed chat reconciliation payload");

                        authoritativeReads += 1;
                        const messages = payload.data;
                        const ownUserId = Number(OT_USER_ID);
                        const match = messages.find(m => {
                            const id = Math.floor(Number(m?.id));
                            if (afterId !== null && Number.isFinite(id) && id <= afterId) return false;

                            if (afterId === null) {
                                const createdAtTs = Date.parse(m?.created_at);
                                const resolutionMs = unit3dTimestampResolutionMs(m?.created_at);
                                if (
                                    !Number.isFinite(createdAtTs) ||
                                    (createdAtTs + resolutionMs) <= startedAt
                                ) return false;
                            }

                            const senderId = Number(m?.user_id ?? m?.user?.id);
                            if (
                                Number.isFinite(ownUserId) &&
                                Number.isFinite(senderId) &&
                                senderId !== ownUserId
                            ) return false;

                            return String(m?.message ?? "") === preparedMessage;
                        });
                        if (match) {
                            return {
                                owned: true,
                                found: true,
                                conclusive: true,
                                messageId: Number.isFinite(Number(match?.id))
                                    ? Math.floor(Number(match.id))
                                    : null
                            };
                        }
                    }
                } catch {
                    // Bounded reconciliation retry below.
                }

                if (attempt < 3) {
                    await new Promise(resolve => setTimeout(resolve, 700));
                    if (!canMutateActiveGiveaway()) return { owned: false, found: false };
                }
            }

            return {
                owned: canMutateActiveGiveaway(),
                found: false,
                conclusive: authoritativeReads > 0
            };
        };

        const sendSettlementMessage = async (message, label = "closing output", stepKey = null) => {
            if (!(await ensureExclusiveTabOwnership())) {
                logEvent(
                    "Settlement output paused (ownership lost)",
                    `Refusing ${label}: this tab no longer has exclusive giveaway ownership.`
                );
                giveawayData.__ending = false;
                return false;
            }

            const settlement = giveawayData?.settlement;
            if (!settlement?.committed) {
                logEvent("Settlement output paused", `Refusing ${label}: settlement is not committed.`);
                giveawayData.__ending = false;
                return false;
            }

            const preparedMessage = prepareOutgoingMessage(message);
            const outputKey = String(stepKey || label || "closing-output");
            settlement.outputProgress =
                settlement.outputProgress && typeof settlement.outputProgress === "object"
                    ? settlement.outputProgress
                    : {};

            let checkpoint = settlement.outputProgress[outputKey];
            if (checkpoint?.status === "sent") return true;

            if (checkpoint?.status === "pending") {
                const reconciled = await reconcileSettlementOutput(checkpoint, preparedMessage);
                if (!reconciled.owned) {
                    giveawayData.__ending = false;
                    return false;
                }
                if (reconciled.found) {
                    checkpoint.status = "sent";
                    checkpoint.messageId = reconciled.messageId;
                    checkpoint.confirmedAt = Date.now();
                    snapshotGiveaway({ force: true });
                    return true;
                }
                if (!reconciled.conclusive) {
                    logEvent(
                        "Settlement output reconciliation deferred",
                        `Preserving pending checkpoint for ${label}: chat could not be read authoritatively, so replay is unsafe.`
                    );
                    giveawayData.__ending = false;
                    return false;
                }
            } else {
                const afterMessageId = await getLatestChatMessageId();
                if (!(await ensureExclusiveTabOwnership())) {
                    giveawayData.__ending = false;
                    return false;
                }

                checkpoint = {
                    status: "pending",
                    afterMessageId,
                    preparedMessage,
                    startedAt: Date.now()
                };
                settlement.outputProgress[outputKey] = checkpoint;
                snapshotGiveaway({ force: true });
            }

            if (!(await ensureExclusiveTabOwnership())) {
                giveawayData.__ending = false;
                return false;
            }

            const sent = await sendMessage(message, {
                requireExclusiveGiveawayOwnership: true
            });
            if (sent === false) {
                giveawayData.__ending = false;
                return false;
            }

            if (!(await ensureExclusiveTabOwnership())) {
                // Leave the persisted checkpoint pending. The next owner will
                // reconcile the chat before deciding whether a replay is needed.
                giveawayData.__ending = false;
                return false;
            }

            checkpoint.status = "sent";
            checkpoint.sentAt = Date.now();
            snapshotGiveaway({ force: true });
            return true;
        };

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

        // Freeze the live participant source before payout computation.
        stopEntryInputSource();

        // Portugas can have a dead websocket while its REST chat API remains
        // authoritative. One final cursor pass captures numeric entries posted
        // at/before the exact settlement cutoff, without executing late commands
        // or emitting entry replies during settlement.
        if (SITE.chat.entrySource === "api") {
            try {
                await pollEntryChatApi({
                    allowEnding: true,
                    entriesOnly: true,
                    suppressReply: true,
                    maxCreatedAtTs: settlementCutoffTs
                });
            } catch (e) {
                logEvent("Final entry API catch-up failed", String(e?.message || e));
            }
        }

        const buildSettlementFinancialPlan = () => {
            const potTotal = Math.max(0, Math.floor(Number(giveawayData.amount) || 0));
            const sponsoredTotal = Math.max(
                0,
                Math.floor(sumSponsorContribs(giveawayData.sponsorContribs, giveawayData.host) || 0)
            );
            const hostFundedTotal = Math.max(0, potTotal - sponsoredTotal);
            const donationPercent = normalizeDonationPercent(giveawayData.donationPercent);
            const baseWinners = Math.max(
                1,
                Math.floor(Number(giveawayData.baseWinnersAtStart || giveawayData.winnersNum) || 1)
            );
            const rawState = {
                amount: potTotal,
                sponsorContribs: { ...(giveawayData.sponsorContribs || {}) },
                sponsors: Array.isArray(giveawayData.sponsors) ? [...giveawayData.sponsors] : [],
                sponsorGiftMessages: Array.isArray(giveawayData.sponsorGiftMessages)
                    ? giveawayData.sponsorGiftMessages.map(item => ({ ...item }))
                    : [],
                donationPercent,
                scaleWinnersWithSponsors: !!giveawayData.scaleWinnersWithSponsors,
                baseWinnersAtStart: baseWinners,
                winnersNum: Math.max(1, Math.floor(Number(giveawayData.winnersNum) || 1)),
                riggedMode: !!riggedMode
            };

            if (numberEntries.size === 0) {
                return {
                    version: 1,
                    mode: donationPercent > 0 ? "no-entries-pool" : "no-entries-refund",
                    potTotal,
                    sponsoredTotal,
                    hostFundedTotal,
                    donationPercent,
                    refunds: getNonHostSponsorContributions(giveawayData)
                        .map(item => ({ name: item.name, amount: item.amount })),
                    rawState
                };
            }

            const winNum = Number(giveawayData.winningNumber);
            const sortedEntries = Array.from(numberEntries.entries())
                .map(([author, guess], idx) => ({
                    author,
                    guess,
                    gap: Math.abs(guess - winNum),
                    order: idx
                }))
                .sort((a, b) => a.gap - b.gap || a.order - b.order);
            const effectiveWinners = recomputeEffectiveWinners(giveawayData);
            const winnersCount = Math.min(effectiveWinners, sortedEntries.length);
            const winners = sortedEntries.slice(0, winnersCount).map(item => ({ ...item }));
            const ties = sortedEntries
                .filter(item => item.gap === sortedEntries[0].gap)
                .map(item => ({ ...item }));
            const weights = winners.map((_, i) => winnersCount - i);
            const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
            const gross = winners.map((_, i) =>
                Math.floor(potTotal * weights[i] / totalWeight)
            );
            const allocated = gross.reduce((sum, amount) => sum + amount, 0);
            if (gross.length && allocated < potTotal) {
                gross[0] += potTotal - allocated;
            }
            const split = computeDonationSplit(gross, donationPercent);

            return {
                version: 1,
                mode: "winners",
                potTotal,
                sponsoredTotal,
                hostFundedTotal,
                donationPercent,
                entrantsTotal: numberEntries.size,
                baseWinners,
                winnersCount,
                scaleIncrease: Math.max(0, winnersCount - baseWinners),
                sortedEntries,
                ties,
                winners,
                gross: [...gross],
                net: [...split.net],
                donations: [...split.donations],
                split: {
                    percent: split.percent,
                    total: split.total,
                    net: [...split.net],
                    donations: [...split.donations]
                },
                rawState
            };
        };

        const applySettlementFinancialPlan = (plan) => {
            if (!plan || typeof plan !== "object" || !plan.rawState) {
                throw new Error("Committed settlement is missing its immutable financial plan.");
            }
            const raw = plan.rawState;
            giveawayData.amount = Math.max(0, Math.floor(Number(raw.amount) || 0));
            giveawayData.sponsorContribs = { ...(raw.sponsorContribs || {}) };
            giveawayData.sponsors = Array.isArray(raw.sponsors) ? [...raw.sponsors] : [];
            giveawayData.sponsorGiftMessages = Array.isArray(raw.sponsorGiftMessages)
                ? raw.sponsorGiftMessages.map(item => ({ ...item }))
                : [];
            giveawayData.donationPercent = normalizeDonationPercent(raw.donationPercent);
            giveawayData.scaleWinnersWithSponsors = !!raw.scaleWinnersWithSponsors;
            giveawayData.baseWinnersAtStart = Math.max(1, Math.floor(Number(raw.baseWinnersAtStart) || 1));
            giveawayData.winnersNum = Math.max(1, Math.floor(Number(raw.winnersNum) || 1));
            riggedMode = !!raw.riggedMode;
        };

        // Close the sponsor accounting window with one final synchronous API poll.
        // The regular tracker runs every 10s, so without this a gift in the final
        // seconds could be omitted from the pot. snapshotGiveaway() is suppressed
        // while __ending is true, so this cannot resurrect the active snapshot.
        if (
            giveawayData?.settlement?.committed !== true &&
            window.__activeTracker &&
            typeof window.__activeTracker.poll === "function"
        ) {
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
                    window.alert(t("alertFinalSponsorSync"));
                } catch {}
            }
        }

        // A BFCache pagehide may have released our Web Lock while the final sponsor
        // poll above was awaiting network I/O. Reclaim ownership before committing
        // a draw or producing any settlement output.
        if (!(await ensureExclusiveTabOwnership())) {
            logEvent(
                "Settlement paused (ownership lost)",
                "Exclusive giveaway ownership could not be reacquired after the final sponsor sync. Reload the owning tab to resume safely."
            );
            giveawayData.__ending = false;
            return;
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
            giveawayData.settlement.financialPlan = buildSettlementFinancialPlan();
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

            // Backward-compatible recovery for a committed snapshot created by an
            // earlier v1.3.24 audit build: freeze the persisted committed state once,
            // but never run sponsor discovery again after side effects may have begun.
            if (!giveawayData.settlement.financialPlan) {
                giveawayData.settlement.financialPlan = buildSettlementFinancialPlan();
            }
        }
        applySettlementFinancialPlan(giveawayData.settlement.financialPlan);
        snapshotGiveaway({ force: true });

        // Sponsor acknowledgement is independent of whether anyone entered. Gifts
        // were already received and the final sync above has frozen the authoritative
        // sponsor state, so thank sponsors (and preserve their notes) in either path.
        const settlementPlan = giveawayData.settlement.financialPlan;
        const finalSponsoredTotal = Math.max(0, Math.floor(Number(settlementPlan.sponsoredTotal) || 0));
        if (finalSponsoredTotal > 0) {
            const sponsorsMessage = buildSponsorsSummaryMessage(giveawayData);
            if (
                sponsorsMessage &&
                !(await sendSettlementMessage(sponsorsMessage, "final sponsor summary", "sponsor-summary"))
            ) return;

            // Gift History is already the canonical sponsor-note source and the
            // final sponsor sync above has just refreshed it. Reuse the persisted
            // matched notes here instead of performing a second network scrape.
            const sponsorMessageRecap = buildFinalSponsorMessageRecap(giveawayData);
            for (let i = 0; i < sponsorMessageRecap.length; i++) {
                const sponsorNoteMessage = sponsorMessageRecap[i];
                if (!(await sendSettlementMessage(
                    sponsorNoteMessage,
                    "final sponsor note",
                    `sponsor-note-${i}`
                ))) return;
            }
        }

        // No entries → no winners. Settlement follows the selected BON Pool mode:
        //   - Pool > 0: 100% of the final pot goes to BON Pool.
        //   - Pool = 0: host funding stays with the host and sponsors are refunded in full.
        if (numberEntries.size === 0) {
            const noEntryTotal = Math.max(0, Math.floor(Number(settlementPlan.potTotal) || 0));
            const noEntryHostFunded = Math.max(0, Math.floor(Number(settlementPlan.hostFundedTotal) || 0));
            const noEntryPoolPct = normalizeDonationPercent(settlementPlan.donationPercent);

            if (noEntryPoolPct > 0) {
                if (!(await sendSettlementMessage(
                    t("zeroEntryPoolOutcome", { poolColor: BONANZA.GIVEAWAY_COLOR, amount: fmtBONCurrency(noEntryTotal), poolName: BONANZA.FUND_NAME }),
                    "zero-entry BON Pool outcome",
                    "zero-entry-pool-outcome"
                ))) return;

                let noEntryPoolResult = { attempted: false, confirmed: noEntryTotal <= 0, reason: noEntryTotal <= 0 ? "empty-pot" : "not-attempted" };
                if (noEntryTotal > 0) {
                    noEntryPoolResult = await contributeBonPool(noEntryTotal);

                    if (noEntryPoolResult.confirmed) {
                        if (!(await sendSettlementMessage(
                            t("zeroEntryPoolConfirmed", { marker: bridgeMarker(BRIDGE_MARKERS.POOL_PAID, "💙", "pool"), poolColor: BONANZA.GIVEAWAY_COLOR, amount: fmtBONCurrency(noEntryTotal), poolName: BONANZA.FUND_NAME }),
                            "zero-entry BON Pool confirmation",
                            "zero-entry-pool-confirmation"
                        ))) return;
                    } else {
                        logEvent(
                            "BON Pool verification warning",
                            `Zero-entry full-pot contribution of ${fmtBONCurrency(noEntryTotal)} BON could not be confirmed. No automatic retry was attempted.`
                        );
                        try {
                            window.alert(t("alertPoolZeroUnconfirmed", { amount: fmtBONCurrency(noEntryTotal), path: BONANZA.POOL_PATH }));
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
                            : `NOT CONFIRMED, zero-entry full pot requires manual ${BONANZA.POOL_PATH} check`,
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
                const sponsorRefunds = Array.isArray(settlementPlan.refunds)
                    ? settlementPlan.refunds.map(item => ({ ...item }))
                    : [];
                const refundTotal = sponsorRefunds.reduce((sum, item) => sum + item.amount, 0);
                const refundList = sponsorRefunds
                    .map(item =>
                        `[color=#1DDC5D][b]${sanitizeNick(item.name)}[/b][/color] ([color=#ffc00a][b]${fmtBONCurrency(item.amount)} BON[/b][/color])`
                    )
                    .join(" · ");

                if (!(await sendSettlementMessage(
                    t("zeroEntryRefundBase", {
                        marker: bridgeMarker(BRIDGE_MARKERS.SPONSORS, "↩️"),
                        hostFunded: fmtBONCurrency(noEntryHostFunded)
                    }) +
                    (refundList
                        ? t("zeroEntryRefunds", { refunds: refundList })
                        : t("zeroEntryNoRefunds")),
                    "zero-entry refund outcome",
                    "zero-entry-refund-outcome"
                ))) return;

                const refundExpectedGifts = [];
                const refundDeferredGifts = [];
                const refundRecords = sponsorRefunds.map(item => ({
                    user: item.name,
                    amount: item.amount,
                    status: "pending"
                }));
                // Freeze verification boundaries before the first refund. A resumed
                // settlement must reuse these original boundaries; taking a fresh
                // baseline/cursor after a crash would make already-sent refunds look old.
                const settlement = giveawayData.settlement;
                const hasSavedRefundBaseline = Object.prototype.hasOwnProperty.call(
                    settlement,
                    "refundGiftHistoryBaseline"
                );
                let refundGiftHistoryBaseline = hasSavedRefundBaseline
                    ? settlement.refundGiftHistoryBaseline
                    : null;

                if (!hasSavedRefundBaseline) {
                    try {
                        refundGiftHistoryBaseline = sponsorRefunds.length &&
                            window.__activeTracker &&
                            typeof window.__activeTracker.fetchRecentGiftHistory === "function"
                            ? await window.__activeTracker.fetchRecentGiftHistory()
                            : [];
                    } catch (e) {
                        refundGiftHistoryBaseline = null;
                        logEvent("Sponsor refund Gift History preflight", String(e?.message || e));
                    }
                    settlement.refundGiftHistoryBaseline = refundGiftHistoryBaseline;
                }

                const refundNotBeforeTs = Number.isFinite(settlement.refundNotBeforeTs)
                    ? settlement.refundNotBeforeTs
                    : Date.now();

                const hasSavedRefundCursor = Object.prototype.hasOwnProperty.call(
                    settlement,
                    "refundAfterMessageId"
                );
                const refundAfterMessageId = hasSavedRefundCursor
                    ? settlement.refundAfterMessageId
                    : (sponsorRefunds.length ? await getLatestChatMessageId() : null);

                settlement.refundNotBeforeTs = refundNotBeforeTs;
                settlement.refundAfterMessageId = refundAfterMessageId;
                snapshotGiveaway({ force: true });

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

                    if (
                        result?.attempted ||
                        result?.reason === "duplicate" ||
                        result?.reason === "pending" ||
                        result?.reason === "ownership-lost"
                    ) {
                        const expectedRefund = {
                            recipient: refund.name,
                            amount: refund.amount,
                            purpose: GIFT_PURPOSE.SPONSOR_REFUND
                        };
                        refundExpectedGifts.push(expectedRefund);
                        if (
                            result?.reason === "pending" ||
                            result?.reason === "ownership-lost"
                        ) {
                            refundDeferredGifts.push(expectedRefund);
                        }
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
                    const refundsVerified = await verifySponsorRefundGifts(
                        refundExpectedGifts,
                        giveawayData.host,
                        refundGiftHistoryBaseline,
                        {
                            afterId: refundAfterMessageId,
                            notBeforeTs: refundNotBeforeTs,
                            statementId: currentStatement?.id ?? null
                        }
                    );

                    if (
                        !refundsVerified &&
                        refundDeferredGifts.some(gift =>
                            giftAttemptStillNeedsResolution(
                                getActiveGiveawayId(),
                                gift
                            )
                        )
                    ) {
                        logEvent(
                            "Settlement paused (refund attempt unresolved)",
                            "A sponsor refund is still pending/retryable after ownership handoff; preserving the active settlement for a safe retry."
                        );
                        snapshotGiveaway({ force: true });
                        giveawayData.__ending = false;
                        return;
                    }
                }
            }
        } else {
            // The draw was committed before any settlement side effect. A resumed
            // settlement must reuse this exact number.
            if (!Number.isFinite(Number(giveawayData.winningNumber))) {
                throw new Error("Committed settlement is missing its winning number.");
            }
            logEvent("Winning number committed", `Winning number=${giveawayData.winningNumber}`);

            const plan = settlementPlan;
            if (plan.mode !== "winners") {
                throw new Error("Committed settlement financial plan mode mismatch.");
            }

            const entries = Array.isArray(plan.sortedEntries)
                ? plan.sortedEntries.map(item => ({ ...item }))
                : [];
            const ties = Array.isArray(plan.ties) ? plan.ties.map(item => ({ ...item })) : [];
            if (ties.length > 1) {
                const tieMessage = ties.map(e => `[b][color=#DC3D1D]${sanitizeNick(e.author)}[/color][/b]`).join(", ");
                if (!(await sendSettlementMessage(
                    t("tieResult", { marker: bridgeMarker(BRIDGE_MARKERS.TIE, "⚠️"), users: tieMessage, winner: sanitizeNick(entries[0].author) }),
                    "tie result",
                    "tie-result"
                ))) return;
            }

            const winners = Array.isArray(plan.winners)
                ? plan.winners.map(item => ({ ...item }))
                : [];
            const N = Math.max(0, Math.floor(Number(plan.winnersCount) || winners.length));
            const allocated = Array.isArray(plan.gross) ? [...plan.gross] : [];
            const net = Array.isArray(plan.net) ? [...plan.net] : [];
            const split = {
                percent: normalizeDonationPercent(plan.split?.percent),
                total: Math.max(0, Math.floor(Number(plan.split?.total) || 0)),
                net: Array.isArray(plan.split?.net) ? [...plan.split.net] : [...net],
                donations: Array.isArray(plan.split?.donations) ? [...plan.split.donations] : []
            };
            const donationActive = split.total > 0;
            const donationInfo = donationActive
                ? { total: split.total, percent: split.percent, confirmed: false }
                : null;

            // Initialize winners / payout status UI so we can tick boxes as gifts are confirmed
            initWinnersStatusUI(winners, net, giveawayData.host, donationInfo);

            // 5) announce winners summary
            const winNum = giveawayData.winningNumber;
            const potTotal = Math.max(0, Math.floor(Number(plan.potTotal) || 0));
            const sponsoredTotal = Math.max(0, Math.floor(Number(plan.sponsoredTotal) || 0));
            const hostFundedTotal = Math.max(0, Math.floor(Number(plan.hostFundedTotal) || 0));
            const entrantsTotal = Math.max(0, Math.floor(Number(plan.entrantsTotal) || 0));
            const scaleIncrease = Math.max(0, Math.floor(Number(plan.scaleIncrease) || 0));

            const podium = ["🥇", "🥈", "🥉"];

            // Rig note (rigNote() already checks riggedMode)
            const rigTag = rigNote(t("rigFinalNote"));

            const summaryLine = t("winnerSummary", {
                marker: bridgeMarker(BRIDGE_MARKERS.RESULT, "🎯"),
                number: fmtBON(winNum),
                winners: fmtBON(N),
                entrants: fmtBON(entrantsTotal)
            });
            const fundingLine = t("fundingSummary", {
                hostFunded: fmtBONCurrency(hostFundedTotal),
                sponsored: fmtBONCurrency(sponsoredTotal),
                total: fmtBONCurrency(potTotal)
            });
            const scalingLine = (giveawayData.scaleWinnersWithSponsors && scaleIncrease > 0)
            ? t("settlementScalingIncrease", { accent: SCALING_ACCENT_COLOR, count: fmtBON(scaleIncrease) })
            : "";
            const donationLine = donationActive
                ? (riggedMode
                    ? t("taxesDue", { amount: fmtBONCurrency(split.total), percent: split.percent, poolName: BONANZA.FUND_NAME })
                    : t("poolAllocation", { poolColor: BONANZA.GIVEAWAY_COLOR, poolName: BONANZA.FUND_NAME, amount: fmtBONCurrency(split.total), percent: split.percent }))
                : "";

            if (winners.length === 1) {
                // single‐winner public message
                const w = winners[0];
                const diff = Math.abs(w.guess - winNum);
                const prize = fmtBONCurrency(net[0]);
                const donatedNote = donationActive
                    ? (riggedMode
                        ? t("grossPrizeTaxes", { gross: fmtBONCurrency(allocated[0]), tax: fmtBONCurrency(split.donations[0]) })
                        : t("grossPrizePool", { gross: fmtBONCurrency(allocated[0]), poolName: BONANZA.FUND_NAME, pool: fmtBONCurrency(split.donations[0]) }))
                    : "";

                const accuracyText = diff === 0
                    ? t("exactGuess")
                    : tp("offByOne", "offByMany", diff, { diff: fmtBON(diff) });

                const winnerLine = t("singleWinnerLine", {
                    user: sanitizeNick(w.author),
                    guess: fmtBON(w.guess),
                    accuracy: accuracyText,
                    prize,
                    note: donatedNote
                });

                if (!(await sendSettlementMessage(
                    [summaryLine, fundingLine, scalingLine, donationLine, winnerLine].filter(Boolean).join("\n") + rigTag,
                    "winner result",
                    "winner-result"
                ))) return;
            } else {
                // Keep the podium detailed; winners from 4th place onward are
                // intentionally compact so large scaled giveaways stay readable.
                const podiumLines = winners.slice(0, 3).map((w, i) => {
                    const diff = Math.abs(w.guess - winNum);
                    const prize = fmtBONCurrency(net[i]);
                    const accuracyText = diff === 0
                        ? t("exactGuess")
                        : tp("offByOne", "offByMany", diff, { diff: fmtBON(diff) });
                    const place = i === 0
                        ? t("podiumWinnerPlace")
                        : t("podiumRankPlace", { rank: formatRank(i + 1) });
                    return t("podiumWinnerLine", {
                        medal: podium[i],
                        user: sanitizeNick(w.author),
                        place,
                        guess: fmtBON(w.guess),
                        accuracy: accuracyText,
                        prize
                    });
                });

                const remainingItems = winners.slice(3).map((w, offset) => {
                    const i = offset + 3;
                    return t("remainingWinnerItem", {
                        rank: formatRank(i + 1),
                        user: sanitizeNick(w.author),
                        prize: fmtBONCurrency(net[i])
                    });
                });
                const remainingLine = remainingItems.length
                    ? t("remainingWinnersLine", { winners: remainingItems.join(" · ") })
                    : "";

                const multiDonatedNote = donationActive
                    ? t("amountsAfterPool", { percent: split.percent, poolName: BONANZA.FUND_NAME })
                    : "";

                if (!(await sendSettlementMessage(
                    [summaryLine, fundingLine, scalingLine, donationLine, ...podiumLines, remainingLine]
                        .filter(Boolean)
                        .join("\n") + multiDonatedNote + rigTag,
                    "winner results",
                    "winner-result"
                ))) return;
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
            const deferredWinnerGifts = [];
            const settlement = giveawayData.settlement;
            const payoutNotBeforeTs = Number.isFinite(settlement.payoutNotBeforeTs)
                ? settlement.payoutNotBeforeTs
                : Date.now();
            const hasSavedPayoutCursor = Object.prototype.hasOwnProperty.call(
                settlement,
                "payoutAfterMessageId"
            );
            const payoutAfterMessageId = hasSavedPayoutCursor
                ? settlement.payoutAfterMessageId
                : await getLatestChatMessageId();

            settlement.payoutNotBeforeTs = payoutNotBeforeTs;
            settlement.payoutAfterMessageId = payoutAfterMessageId;

            // Gift History is the canonical payout confirmation source. Freeze a
            // pre-payout baseline so repeated recipient/amount combinations cannot
            // accidentally match older transfers after a reload or concurrent tab.
            const hasSavedPayoutHistoryBaseline = Object.prototype.hasOwnProperty.call(
                settlement,
                "payoutGiftHistoryBaseline"
            );
            let payoutGiftHistoryBaseline = hasSavedPayoutHistoryBaseline
                ? settlement.payoutGiftHistoryBaseline
                : null;
            if (!hasSavedPayoutHistoryBaseline) {
                try {
                    payoutGiftHistoryBaseline =
                        window.__activeTracker &&
                        typeof window.__activeTracker.fetchRecentGiftHistory === "function"
                            ? await window.__activeTracker.fetchRecentGiftHistory()
                            : null;
                } catch (e) {
                    payoutGiftHistoryBaseline = null;
                    logEvent("Winner Gift History preflight", String(e?.message || e));
                }
                settlement.payoutGiftHistoryBaseline = payoutGiftHistoryBaseline;
            }

            snapshotGiveaway({ force: true });

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
                    ? t("giftWinnerSingle", { amount: amt })
                    : t("giftWinnerRanked", { rank: formatRank(i + 1) });

                const giftResult = await giftBon(w.author, amt, msg, GIFT_PURPOSE.WINNER);
                const expectedGift = {
                    recipient: w.author,
                    amount: amt,
                    purpose: GIFT_PURPOSE.WINNER
                };
                expectedGifts.push(expectedGift);
                if (
                    giftResult?.reason === "pending" ||
                    giftResult?.reason === "ownership-lost"
                ) {
                    deferredWinnerGifts.push(expectedGift);
                }

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
                        ? t("taxesConfirmed", {
                            marker: bridgeMarker(BRIDGE_MARKERS.TAXES_PAID, "🧾"),
                            amount: fmtBONCurrency(split.total),
                            poolName: BONANZA.FUND_NAME
                        })
                        : t("poolConfirmed", {
                            marker: bridgeMarker(BRIDGE_MARKERS.POOL_PAID, "💙"),
                            poolColor: BONANZA.GIVEAWAY_COLOR,
                            amount: fmtBONCurrency(split.total),
                            poolName: BONANZA.FUND_NAME
                        });
                    if (!(await sendSettlementMessage(
                        paidMessage,
                        "BON Pool confirmation",
                        "bon-pool-confirmation"
                    ))) return;
                } else {
                    markFundGiftStatus("failed");
                    logEvent("BON Pool verification warning", `Direct contribution of ${fmtBONCurrency(split.total)} BON could not be confirmed. No automatic retry was attempted.`);
                    try {
                        window.alert(t("alertPoolUnconfirmed", { amount: fmtBONCurrency(split.total), path: BONANZA.POOL_PATH }));
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
                        ? (poolResult.confirmed
                            ? "confirmed directly in BON Pool"
                            : `NOT CONFIRMED, check ${BONANZA.POOL_PATH} manually`)
                        : "none",
                    entrants: entrantsTotal
                });
                if (currentStatement && !expectedGifts.length) currentStatement.verification = "nothing to verify";
                persistCurrentStatement();
            } catch (e) { /* statements are best-effort */ }

            // 6b) Verify payouts against authenticated Gift History first.
            // SystemBot/chat is retained only as a final fallback for rows that
            // could not be confirmed through the persistent history page.
            const winnersVerified = await verifyWinnerGifts(expectedGifts, giveawayData.host, {
                giftHistoryBaseline: payoutGiftHistoryBaseline,
                afterId: payoutAfterMessageId,
                notBeforeTs: payoutNotBeforeTs,
                statementId: currentStatement?.id ?? null
            });

            if (
                !winnersVerified &&
                deferredWinnerGifts.some(gift =>
                    giftAttemptStillNeedsResolution(
                        getActiveGiveawayId(),
                        gift
                    )
                )
            ) {
                logEvent(
                    "Settlement paused (winner attempt unresolved)",
                    "A winner gift is still pending/retryable after ownership handoff; preserving the active settlement for a safe retry."
                );
                snapshotGiveaway({ force: true });
                giveawayData.__ending = false;
                return;
            }
        }

        // 7) Settlement is terminal only now. A BFCache transition can happen
        // during any verification await above, so prove ownership once more before
        // retiring the recoverable active snapshot.
        if (!(await ensureExclusiveTabOwnership())) {
            logEvent(
                "Settlement completion paused (ownership lost)",
                "The active settlement snapshot was preserved because this tab no longer owns the giveaway."
            );
            giveawayData.__ending = false;
            return;
        }

        // Persist completion once, then stopGiveaway() may safely retire the snapshot.
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
            `<thead><tr><th>${t("uiUser")}</th><th>${t("uiEntryNumber")}</th></tr></thead><tbody></tbody>`;
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
            thPrize.textContent = t("uiPrize");
            const thGift = document.createElement("th");
            thGift.textContent = t("uiGiftStatus");
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
                    giftCell.textContent = t("uiSelf");
                    giftCell.title = t("uiHostSelfGift");
                    row.classList.add("gift-self");
                } else {
                    winnerGiftStatus.set(key, "pending");
                    giftCell.innerHTML = `<span class="gift-spinner" title="${t("uiCheckingGift")}"></span>`;
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
            userCell.innerHTML = `<span style="color:${BONANZA.ACCENT_COLOR};font-weight:600;">${BONANZA.FUND_NAME}</span> <small style="color:#aaa;">(${t("uiDirect")})</small>`;
            const entryCell = document.createElement("td");
            entryCell.textContent = `${donation.percent}%`;
            const prizeCell = document.createElement("td");
            prizeCell.textContent = donation.total.toLocaleString();
            const giftCell = document.createElement("td");
            giftCell.style.textAlign = "center";

            giftCell.innerHTML = `<span class="gift-spinner" title="${t("uiCheckingPool")}"></span>`;
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
            cells[3].textContent = t("uiSelf");
            cells[3].title = t("uiHostSelfGift");
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
        const verificationStillOwned = () => canMutateActiveGiveaway();
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
            return await verifyWinnerGifts(expected, hostName, fallbackContext);
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
            if (attempt > 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
                if (!verificationStillOwned()) return false;
            }

            let rows;
            try {
                rows = await tracker.fetchRecentGiftHistory();
                if (!verificationStillOwned()) return false;
                successfulReads += 1;
            } catch (e) {
                if (!verificationStillOwned()) return false;
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
                if (!verificationStillOwned()) return false;
                const targetStatement = getStatementRecordById(statementId);
                if (targetStatement) {
                    targetStatement.verification = "all sponsor refunds confirmed in Gift History";
                    persistStatementRecord(targetStatement);
                }
                return true;
            }
        }

        if (successfulReads === 0) {
            if (!verificationStillOwned()) return false;
            logEvent("Sponsor refund verification fallback", "Gift History became unavailable; using chat API verification.");
            return await verifyWinnerGifts(expected, hostName, fallbackContext);
        }

        if (!verificationStillOwned()) return false;
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
        if (!verificationStillOwned()) return false;
        await sendMessage(
            t("warningRefunds", { missing: missingList }),
            { requireExclusiveGiveawayOwnership: true }
        );
        if (!verificationStillOwned()) return false;
        return false;
    }

    async function verifyWinnerGifts(expectedGifts, hostName, verificationContext = {}) {
        const statementId = verificationContext?.statementId ?? currentStatement?.id ?? null;
        const verificationStillOwned = () => canMutateActiveGiveaway();
        try {
            const afterId = Number.isFinite(Number(verificationContext && verificationContext.afterId))
                ? Math.floor(Number(verificationContext.afterId))
                : null;
            const notBeforeTs = Number.isFinite(Number(verificationContext && verificationContext.notBeforeTs))
                ? Number(verificationContext.notBeforeTs)
                : null;
            const selfKeys = resolveSelfKeys(hostName);

            if (!selfKeys.size) {
                if (currentStatement && statementId != null && String(currentStatement.id) === String(statementId)) {
                    markAllPendingWinnerGiftsFailed();
                }
                const targetStatement = getStatementRecordById(statementId);
                if (targetStatement) {
                    targetStatement.verification = "could not verify (host name unknown)";
                    persistStatementRecord(targetStatement);
                }
                return false;
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

            if (!expected.length) return true;

            const maxAttempts = 5;
            const delayMs = 5000;
            const fetchTimeoutMs = 5000;
            const consumedMessageIds = new Set();
            const describe = g => `${sanitizeNick(g.recipient)} (${fmtBONCurrency(g.amount)} BON)`;
            const canTouchLiveUI = () =>
                currentStatement &&
                statementId != null &&
                String(currentStatement.id) === String(statementId);

            function markConfirmed(g) {
                if (canTouchLiveUI()) markWinnerGiftConfirmed(g.recipient);
                updateStatementGiftStatus(g.recipient, g.purpose, "confirmed", statementId);
            }

            function markFailed(g) {
                if (canTouchLiveUI()) markWinnerGiftFailed(g.recipient);
                updateStatementGiftStatus(g.recipient, g.purpose, "failed", statementId);
            }

            // Canonical verification: authenticated Gift History page.
            const tracker = window.__activeTracker;
            const baselineRows = verificationContext?.giftHistoryBaseline;
            if (
                Array.isArray(baselineRows) &&
                tracker &&
                typeof tracker.fetchRecentGiftHistory === "function"
            ) {
                const baselineCounts = new Map();
                for (const row of baselineRows) {
                    const key = giftHistoryBaseKey(row);
                    if (!key) continue;
                    baselineCounts.set(key, (baselineCounts.get(key) || 0) + 1);
                }

                let successfulHistoryReads = 0;
                for (let attempt = 1; attempt <= 6; attempt++) {
                    if (attempt > 1) {
                        await new Promise(resolve => setTimeout(resolve, 2500));
                        if (!verificationStillOwned()) return false;
                    }

                    let rows;
                    try {
                        rows = await tracker.fetchRecentGiftHistory();
                        if (!verificationStillOwned()) return false;
                        successfulHistoryReads += 1;
                    } catch (e) {
                        logEvent(
                            "Winner Gift History retry",
                            `Attempt ${attempt}/6: ${String(e?.message || e)}`
                        );
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
                            Math.round(Number(row?.amount) || 0) === gift.amount
                        );
                        if (index < 0) continue;

                        const row = freshRows[index];
                        // The baseline-delta is authoritative even on trackers whose
                        // Gift History wall clock has no timezone. Timestamp is kept
                        // as supporting evidence, not guessed into a false rejection.
                        consumed.add(index);
                        gift.done = true;
                        if (canTouchLiveUI()) markWinnerGiftConfirmed(gift.recipient);
                        updateStatementGiftStatus(
                            gift.recipient,
                            gift.purpose,
                            "confirmed-history",
                            statementId
                        );
                        logEvent(
                            "Winner gift confirmed in Gift History",
                            `${sanitizeNick(gift.recipient)} ${fmtBONCurrency(gift.amount)} BON | ${row.rawTimestamp || "timestamp unavailable"}`
                        );
                    }

                    if (expected.every(g => g.done)) {
                        const targetStatement = getStatementRecordById(statementId);
                        if (targetStatement) {
                            targetStatement.verification = "all gifts confirmed in Gift History";
                            persistStatementRecord(targetStatement);
                        }
                        return true;
                    }
                }

                if (successfulHistoryReads > 0) {
                    const remaining = expected.filter(g => !g.done).map(describe).join(", ");
                    logEvent(
                        "Winner Gift History fallback",
                        `Persistent Gift History could not confirm: ${remaining}. Falling back to SystemBot/chat verification only for these transfers.`
                    );
                } else {
                    logEvent(
                        "Winner Gift History unavailable",
                        "Persistent Gift History could not be read; falling back to SystemBot/chat verification."
                    );
                }
            }

            // Last-resort verification only: inspect genuine SystemBot gift events.
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (!verificationStillOwned()) return false;

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    const url = new URL(`/api/chat/messages/${chatroomId}`, location.origin);
                    if (afterId !== null) url.searchParams.set("after_id", String(afterId));
                    const res = await fetchWithTimeout(url, { credentials: "include" }, fetchTimeoutMs);
                    if (!verificationStillOwned()) return false;

                    if (res && res.ok) {
                        const payload = await res.json();
                        if (!verificationStillOwned()) return false;
                        const messages = Array.isArray(payload.data) ? payload.data : [];

                        for (const m of messages) {
                            const numericMsgId = Math.floor(Number(m && m.id));
                            if (afterId !== null && Number.isFinite(numericMsgId) && numericMsgId <= afterId) continue;

                            const createdAt = Date.parse(m && m.created_at);
                            if (notBeforeTs !== null && Number.isFinite(createdAt) && createdAt < (notBeforeTs - 5000)) continue;

                            const msgId = m && m.id != null ? String(m.id) : null;
                            if (msgId && consumedMessageIds.has(msgId)) continue;

                            // Chat verification is fallback/confirmation only:
                            // accept genuine SystemBot gifts from host/self, never
                            // arbitrary user-written text that imitates a gift.
                            if (!m?.bot?.is_systembot) continue;

                            const gift = parseGiftMessage(m.message);
                            if (!gift || !gift.gifter || !gift.recipient) continue;
                            if (!selfKeys.has(normalizeUserKey(gift.gifter))) continue;

                            const recKey = normalizeUserKey(gift.recipient);
                            const amt = Math.round(gift.amount);
                            const match = expected.find(g => !g.done && g.key === recKey && g.amount === amt);
                            if (!match) continue;

                            match.done = true;
                            if (msgId) consumedMessageIds.add(msgId);
                            markConfirmed(match);
                        }
                    }
                } catch {
                    if (!verificationStillOwned()) return false;
                    // Retry below. Each fetch is independently bounded by timeout.
                }

                if (!verificationStillOwned()) return false;
                if (expected.every(g => g.done)) {
                    finalizeStatementVerification(true, 0, statementId);
                    return true;
                }

                if (attempt < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    if (!verificationStillOwned()) return false;
                }
            }

            if (!verificationStillOwned()) return false;
            const missing = expected.filter(g => !g.done);
            missing.forEach(markFailed);
            finalizeStatementVerification(false, missing.length, statementId);

            const missingList = missing.map(describe).join(", ");
            logEvent("Payout verification warning", `Could not confirm gifts for: ${missingList}`);
            if (!verificationStillOwned()) return false;
            await sendMessage(
                t("warningWinnerGifts", { missing: missingList }),
                { requireExclusiveGiveawayOwnership: true }
            );
            if (!verificationStillOwned()) return false;
            return false;
        } catch (e) {
            if (!verificationStillOwned()) return false;
            logEvent("Payout verification error", "Unexpected error while confirming gift messages.");
            if (currentStatement && statementId != null && String(currentStatement.id) === String(statementId)) {
                markAllPendingWinnerGiftsFailed();
            }
            const targetStatement = getStatementRecordById(statementId);
            if (targetStatement) {
                targetStatement.verification = "verification error, check manually";
                persistStatementRecord(targetStatement);
            }
            return false;
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
            return t("freeSuggestionNone");
        }

        const rigHint = rigNote(t("rigHintFree"));
        return t("freeSuggestionList", { numbers: sample.join(", ") }) + rigHint;
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
            donationRecipient: `${location.hostname} ${BONANZA.POOL_PATH}`,
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
            ? "all gifts confirmed"
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
        L.push(`Generated ${statementTimestamp(Date.now())} by BONanza Giveaway v${rec.scriptVersion}`);
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
            donationHint.innerHTML = t(
                riggedMode ? "uiDonationZeroRigged" : "uiDonationZeroStandard",
                { poolName: BONANZA.FUND_NAME }
            );
            return;
        }
        const potRaw = coinInput ? String(coinInput.value || "").replace(/[^0-9]/g, "") : "";
        const pot = potRaw ? parseInt(potRaw, 10) : 0;
        const est = pot > 0 ? Math.floor(pot * pct / 100) : 0;
        const estText = pot > 0
            ? t("uiDonationEstimate", { estimate: fmtBONCurrency(est), pot: fmtBONCurrency(pot) })
            : "";
        donationHint.innerHTML = t(riggedMode ? "uiDonationRigged" : "uiDonationStandard", {
            percent: pct,
            poolName: BONANZA.FUND_NAME,
            color: BONANZA.ACCENT_COLOR,
            estimate: estText
        });
    }

    function sendReminder(options = {}) {
        const force = !!(options && options.force);
        if (!force && !shouldSendReminder(giveawayData)) {
            if (!reminderRetryTimeout) {
                reminderRetryTimeout = setTimeout(() => {
                    reminderRetryTimeout = null;
                    sendReminder();
                }, 15000);
            }
            return;
        }
        if (reminderRetryTimeout) {
            clearTimeout(reminderRetryTimeout);
            reminderRetryTimeout = null;
        }

        const silentLine = silentNote(t("reminderSilent"));
        const rigLine = rigNote(t("reminderRigged"));
        const reminderPct = normalizeDonationPercent(giveawayData.donationPercent);
        const reminderVars = {
            percent: reminderPct,
            poolName: BONANZA.FUND_NAME,
            poolColor: BONANZA.GIVEAWAY_COLOR
        };
        const reminderPrefix = reminderPct > 0
            ? (riggedMode ? t("reminderTaxes", reminderVars) : t("reminderPool", reminderVars))
            : "";
        const reminderStartMarker = reminderPct > 0
            ? (riggedMode ? BRIDGE_MARKERS.START_TAXES : BRIDGE_MARKERS.START_POOL)
            : BRIDGE_MARKERS.START;
        const msg = reminderPrefix + t("reminderMain", {
            marker: bridgeMarker(reminderStartMarker, "🎁"),
            amount: fmtBONCurrency(cleanPotString(giveawayData.amount)),
            winners: buildWinnersAnnouncementLine(giveawayData),
            duration: parseTime(giveawayData.timeLeft * 1000),
            start: giveawayData.startNum,
            end: giveawayData.endNum,
            custom: giveawayData.customMessage,
            giftHint: t("giftHostHint", {
                hintColor: GIFT_HINT_COLOR,
                host: getGiftSyntaxHostName()
            })
        }) + silentLine + rigLine;

        // Language-independent duplicate suppression. Persist before sending so a
        // concurrent timer/retry cannot infer state from translated chat text.
        giveawayData.lastReminderSentAt = Date.now();
        snapshotGiveaway();
        sendMessage(msg, { kind: "reminder" });
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
            const hostName = giveawayData?.host || getLoggedInUsername();
            const stored = readActiveGiveawayRawForHost(hostName, { migrateLegacy: false });
            if (!stored.raw) return null;
            const snap = JSON.parse(stored.raw);
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

    function parseLivewireScriptConfigFromHtml(html) {
        const source = String(html || "");
        const match = source.match(/window\.livewireScriptConfig\s*=\s*(\{[\s\S]*?\})\s*;?/i);
        if (!match) return {};
        try {
            return JSON.parse(match[1]);
        } catch {
            return {};
        }
    }

    function normalizeLivewireUri(raw) {
        let value = String(raw || "").trim();
        if (!value) return "";
        value = value.replace(/\\\//g, "/");
        if (/^\/{2,}/.test(value)) value = value.replace(/^\/+/, "/");
        try {
            return new URL(value, location.origin).href;
        } catch {
            return "";
        }
    }

    function inspectLivewirePoolDocument(doc, html) {
        const text = (doc.body?.textContent || "").replace(/\u00a0/g, " ");
        const total = parsePoolCounter(text, SITE.pool.totalLabel);

        // UNIT3D exposes the current BON balance in the navbar. Prefer the
        // dedicated DOM value because localized Pool copy such as "Tens"
        // may omit punctuation or change wording between trackers.
        const balanceNode = doc.querySelector(".ratio-bar__points");
        const balanceDigits = String(balanceNode?.textContent || "").replace(/[^0-9]/g, "");
        const balanceFromDom = balanceDigits ? parseInt(balanceDigits, 10) : null;
        const balance = Number.isFinite(balanceFromDom)
            ? balanceFromDom
            : parsePoolCounter(text, SITE.pool.balanceLabel);

        const component = Array.from(doc.querySelectorAll("[wire\\:snapshot]")).find(el =>
            el.querySelector('[wire\\:click="contribute"]')
        );
        const snapshotRaw = component?.getAttribute("wire:snapshot") || "";
        let snapshot = null;
        try { snapshot = snapshotRaw ? JSON.parse(snapshotRaw) : null; } catch {}

        const amountControl = component?.querySelector('[wire\\:model\\.live="amount"], [wire\\:model="amount"]');
        const anonControl = component?.querySelector('[wire\\:model\\.live="anon"], [wire\\:model="anon"]');
        const contributeControl = component?.querySelector('[wire\\:click="contribute"]');

        const config = parseLivewireScriptConfigFromHtml(html);
        const runtimeNode = doc.querySelector("script[data-update-uri], [data-update-uri], script[data-csrf], [data-csrf]");

        const csrf =
            doc.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ||
            runtimeNode?.getAttribute("data-csrf") ||
            String(config?.csrf || "");

        let updateUri = normalizeLivewireUri(
            runtimeNode?.getAttribute("data-update-uri") ||
            config?.uri ||
            ""
        );

        if (!updateUri) {
            const rawMatch =
                String(html || "").match(/data-update-uri=["']([^"']+)["']/i) ||
                String(html || "").match(/["']uri["']\s*:\s*["']([^"']*livewire[^"']*)["']/i) ||
                String(html || "").match(/(?:https?:\\?\/\\?\/[^"'<>\s]+)?\\?\/livewire\\?\/update/i);
            updateUri = normalizeLivewireUri(rawMatch?.[1] || rawMatch?.[0] || "");
        }

        const rawContributed = snapshot?.data?.contributed;
        const contributed = Number.isFinite(Number(rawContributed))
            ? Number(rawContributed)
            : null;

        const missing = [];
        if (total == null) missing.push("total");
        // Balance is useful corroborating evidence, but not part of the
        // transaction contract itself. Do not fail the Livewire adapter merely
        // because a theme/version stops rendering it on this page.
        if (!component) missing.push("component");
        if (!snapshotRaw) missing.push("snapshot");
        if (!snapshot?.memo?.name) missing.push("snapshot.memo.name");
        if (!amountControl) missing.push("amount");
        if (!anonControl) missing.push("anon");
        if (!contributeControl) missing.push("contribute");
        if (!csrf) missing.push("csrf");
        if (!updateUri) missing.push("updateUri");

        return {
            ok: missing.length === 0,
            missing,
            total,
            balance,
            contributed,
            component,
            snapshotRaw,
            snapshot,
            amountControl,
            anonControl,
            contributeControl,
            csrf,
            updateUri
        };
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

        if (SITE.pool.mode === "form") {
            const total = parsePoolCounter(text, SITE.pool.totalLabel);
            const mine = parsePoolCounter(text, SITE.pool.mineLabel);
            const form = Array.from(doc.querySelectorAll("form")).find(el => {
                try {
                    const u = new URL(el.getAttribute("action") || "", location.origin);
                    return u.origin === location.origin && u.pathname === BONANZA.POOL_STORE_PATH;
                } catch { return false; }
            });
            if (!form || total == null || mine == null) {
                throw new Error("Could not parse BON Pool form/counters.");
            }
            const action = new URL(form.getAttribute("action") || BONANZA.POOL_STORE_PATH, location.origin);
            return {
                mode: "form",
                form,
                action: action.href,
                total,
                mine,
                balance: null,
                contributorRows: []
            };
        }

        if (SITE.pool.mode === "livewire") {
            const inspected = inspectLivewirePoolDocument(doc, html);
            const {
                total,
                balance,
                component,
                snapshotRaw,
                snapshot,
                amountControl,
                anonControl,
                contributeControl,
                csrf,
                updateUri,
                contributed
            } = inspected;

            const contributorRows = [];
            for (const row of doc.querySelectorAll("table.data-table tbody tr")) {
                const cells = Array.from(row.querySelectorAll("td"));
                const userCellIndex = cells.findIndex(cell => !!cell.querySelector('a[href*="/users/"]'));
                if (userCellIndex < 0) continue;
                const userCell = cells[userCellIndex];
                const user = giftHistoryUsernameFromCell(userCell);
                if (!user) continue;

                const amountCell = cells[userCellIndex + 1] || null;
                const rawAmount = String(amountCell?.textContent || "");
                const digits = rawAmount.replace(/[^0-9]/g, "");
                const amount = digits ? parseInt(digits, 10) : NaN;
                if (!Number.isFinite(amount)) continue;

                const timeEl = row.querySelector("time");
                const rawTimestamp = timeEl?.getAttribute("datetime") || "";
                contributorRows.push({
                    user,
                    amount,
                    rawTimestamp,
                    signature: rawTimestamp
                        ? [
                            normalizeUserKey(user),
                            String(amount),
                            String(rawTimestamp)
                        ].join("\u001f")
                        : ""
                });
            }

            if (!inspected.ok) {
                throw new Error(
                    `Could not parse Portugas Livewire BON Pool contract. Missing: ${inspected.missing.join(", ")}`
                );
            }

            return {
                mode: "livewire",
                total,
                mine: contributed,
                balance,
                contributorRows,
                snapshotRaw,
                snapshotName: snapshot.memo.name,
                componentId: component.getAttribute("wire:id") || snapshot.memo.id || "",
                updateUri,
                csrf
            };
        }

        throw new Error(`Unsupported BON Pool adapter mode: ${SITE.pool.mode}`);
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

    function portugasPoolOwnContributionEvidence(snapshot, record) {
        const hostKeys = resolveSelfKeys(giveawayData?.host || getLoggedInUsername());
        const baseline = new Set(Array.isArray(record.beforeContributorKeys) ? record.beforeContributorKeys : []);
        const rows = Array.isArray(snapshot?.contributorRows) ? snapshot.contributorRows : [];
        const rowMatch = rows.some(row =>
            hostKeys.has(normalizeUserKey(row?.user)) &&
            Math.floor(Number(row?.amount) || 0) === Math.floor(Number(record.amount) || 0) &&
            row?.signature &&
            !baseline.has(row.signature)
        );

        const mineBefore = Number(record.beforeMine);
        const mineAfter = Number(snapshot?.mine);
        const mineMatch =
            Number.isFinite(mineBefore) &&
            Number.isFinite(mineAfter) &&
            mineAfter >= mineBefore + Number(record.amount);

        const balanceBefore = Number(record.beforeBalance);
        const balanceAfter = Number(snapshot?.balance);
        const balanceMatch =
            Number.isFinite(balanceBefore) &&
            Number.isFinite(balanceAfter) &&
            balanceAfter <= balanceBefore - Number(record.amount);

        return { rowMatch, mineMatch, balanceMatch };
    }

    async function verifyBonPoolContribution(record) {
        const targetTotal = Number(record.beforeTotal) + Number(record.amount);
        const targetMine = Number(record.beforeMine) + Number(record.amount);
        let last = null;

        for (let i = 0; i < BONANZA.VERIFY_ATTEMPTS; i++) {
            if (i > 0) await new Promise(resolve => setTimeout(resolve, BONANZA.VERIFY_DELAY_MS));
            try {
                last = await fetchBonPoolPage();

                if ((record.siteMode || "form") === "livewire") {
                    const totalMatch = Number.isFinite(Number(last.total)) && Number(last.total) >= targetTotal;
                    const own = portugasPoolOwnContributionEvidence(last, record);
                    // A global total increase alone is insufficient because another
                    // user may contribute concurrently. Require independent evidence
                    // attributable to this host: a new exact contributor row or the
                    // component's own contributed counter increasing by our amount.
                    if (totalMatch && (own.rowMatch || own.mineMatch || own.balanceMatch)) {
                        return { confirmed: true, snapshot: last, evidence: own };
                    }
                } else if (
                    Number.isFinite(Number(last.mine)) &&
                    Number.isFinite(Number(last.total)) &&
                    Number(last.mine) >= targetMine &&
                    Number(last.total) >= targetTotal
                ) {
                    return { confirmed: true, snapshot: last };
                }
            } catch (e) {
                logEvent("BON Pool verify retry", String(e?.message || e));
            }
        }
        return { confirmed: false, snapshot: last };
    }

    async function contributeBonPool(amount) {
        const safeAmount = Math.floor(Number(amount));
        if (!Number.isFinite(safeAmount) || safeAmount <= 0) {
            return { attempted: false, confirmed: false, reason: "invalid" };
        }
        const giveawayId = getActiveGiveawayId();
        if (!giveawayId) return { attempted: false, confirmed: false, reason: "missing-giveaway-id" };
        if (!(await ensureExclusiveTabOwnership())) {
            return { attempted: false, confirmed: false, reason: "ownership-lost" };
        }

        const existing = getPoolContributionAttempt(giveawayId);
        if (existing) {
            if (existing.amount !== safeAmount) {
                return { attempted: false, confirmed: false, reason: "amount-conflict" };
            }
            if (existing.status === "confirmed") {
                return { attempted: false, confirmed: true, reason: "already-confirmed", reused: true };
            }
            const checked = await verifyBonPoolContribution(existing);
            if (checked.confirmed) {
                savePoolContributionAttempt(giveawayId, {
                    status: "confirmed",
                    confirmedAt: Date.now(),
                    afterMine: checked.snapshot?.mine ?? null,
                    afterTotal: checked.snapshot?.total ?? null,
                    afterBalance: checked.snapshot?.balance ?? null
                });
                return { attempted: false, confirmed: true, reason: "verified-existing", reused: true };
            }
            // Ambiguous existing attempts are never replayed automatically.
            return { attempted: false, confirmed: false, reason: "existing-unconfirmed", reused: true };
        }

        let before;
        try {
            before = await fetchBonPoolPage();
        } catch (e) {
            logEvent("BON Pool contribution aborted", String(e?.message || e));
            return { attempted: false, confirmed: false, reason: "preflight-failed" };
        }

        if (!(await ensureExclusiveTabOwnership())) {
            return { attempted: false, confirmed: false, reason: "ownership-lost" };
        }

        const record = {
            siteMode: before.mode || SITE.pool.mode,
            amount: safeAmount,
            beforeMine: before.mine ?? null,
            beforeTotal: before.total,
            beforeBalance: before.balance ?? null,
            beforeContributorKeys: Array.isArray(before.contributorRows)
                ? before.contributorRows.map(row => row.signature).filter(Boolean)
                : [],
            attemptedAt: Date.now(),
            status: "attempted"
        };
        savePoolContributionAttempt(giveawayId, record);

        try {
            let res;
            if (before.mode === "livewire") {
                const payload = {
                    _token: before.csrf,
                    components: [{
                        snapshot: before.snapshotRaw,
                        updates: {
                            amount: safeAmount,
                            anon: false
                        },
                        calls: [{
                            path: "",
                            method: "contribute",
                            params: []
                        }]
                    }]
                };
                res = await fetchWithTimeout(before.updateUri, {
                    method: "POST",
                    credentials: "include",
                    cache: "no-store",
                    redirect: "follow",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": before.csrf,
                        "X-Livewire": "",
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    body: JSON.stringify(payload)
                }, BONANZA.FETCH_TIMEOUT_MS);
            } else {
                const data = urlEncodedDataFromParsedForm(before.form);
                data.set("type", "bon");
                data.set("contribution", String(safeAmount));
                data.set("contributionTokens", "");
                data.set("anon", "0");

                res = await fetchWithTimeout(before.action, {
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
            }

            savePoolContributionAttempt(giveawayId, {
                httpStatus: res.status,
                postFinishedAt: Date.now(),
                status: res.ok ? "posted" : "posted-http-error"
            });
        } catch (e) {
            // Network/5xx ambiguity follows the same rule as gifts: never retry the
            // money movement automatically; verify the real page instead.
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
                afterMine: checked.snapshot?.mine ?? null,
                afterTotal: checked.snapshot?.total ?? null,
                afterBalance: checked.snapshot?.balance ?? null
            });

            const evidenceText = before.mode === "livewire"
                ? `Total ${fmtBONCurrency(before.total)} -> ${fmtBONCurrency(checked.snapshot.total)} | own evidence=${
                    checked.evidence?.rowMatch
                        ? "new contributor row"
                        : (checked.evidence?.mineMatch ? "contributed counter" : "BON balance delta")
                }`
                : `Mine ${fmtBONCurrency(before.mine)} -> ${fmtBONCurrency(checked.snapshot.mine)} | Total ${fmtBONCurrency(before.total)} -> ${fmtBONCurrency(checked.snapshot.total)}`;
            logEvent(
                "BON Pool contribution confirmed",
                `${fmtBONCurrency(safeAmount)} BON | ${evidenceText}`
            );
            return { attempted: true, confirmed: true, before, after: checked.snapshot };
        }

        savePoolContributionAttempt(giveawayId, {
            status: "unconfirmed",
            verifyFinishedAt: Date.now()
        });
        return {
            attempted: true,
            confirmed: false,
            reason: "not-confirmed",
            before,
            after: checked.snapshot
        };
    }

    // Winner gifts use the gift ledger. BON Pool contributions have their own
    // persisted ledger and are verified against the active site's BON Pool page.
    const GIFT_PURPOSE = Object.freeze({
        WINNER: "winner",
        SPONSOR_REFUND: "sponsor-refund"
    });
    const SPONSOR_REFUND_NOTE = t("giftRefundNote");

    function paidGiftKey(recipient, amount, purpose = GIFT_PURPOSE.WINNER) {
        return `${String(recipient || "").trim().toLowerCase()}::${Math.floor(Number(amount) || 0)}::${purpose}`;
    }

    function paidGiftRetryableKey(giveawayId, recipient, amount, purpose = GIFT_PURPOSE.WINNER) {
        const giftKey = paidGiftKey(recipient, amount, purpose);
        return `${LS_PAID_GIFTS}::retryable::${encodeURIComponent(String(giveawayId || ""))}::${encodeURIComponent(giftKey)}`;
    }

    function giftAttemptTokenOwner(attemptToken) {
        if (typeof attemptToken !== "string") return "";
        const separator = attemptToken.indexOf(":");
        return separator > 0 ? attemptToken.slice(0, separator) : "";
    }

    function getGiftAttemptState(giveawayId, recipient, amount, purpose) {
        if (!giveawayId) return { state: "none", token: null };
        const ledger = readPaidGiftsLedger();
        const bucket = ledger[giveawayId];
        if (!bucket) return { state: "none", token: null };

        const giftKey = paidGiftKey(recipient, amount, purpose);
        const stored = bucket[giftKey];
        if (!stored) return { state: "none", token: null };

        // Current-format string tokens are pending until the originating request
        // resolves. A matching retryable marker means a proven-rejected attempt
        // can be replaced by the next exclusive owner. Numeric/other legacy values
        // are terminal attempted entries and retain their original semantics.
        if (typeof stored === "string") {
            try {
                const retryableToken = localStorage.getItem(
                    paidGiftRetryableKey(giveawayId, recipient, amount, purpose)
                );
                if (retryableToken === stored) {
                    return { state: "retryable", token: stored };
                }
            } catch {}
            return { state: "pending", token: stored };
        }

        return { state: "attempted", token: null };
    }

    /** Returns true for a pending or terminal non-retryable attempt. */
    function hasGiftBeenAttempted(giveawayId, recipient, amount, purpose) {
        const { state } = getGiftAttemptState(giveawayId, recipient, amount, purpose);
        return state === "pending" || state === "attempted";
    }

    /** Record a unique attempt token before an ambiguous send can happen. */
    function recordGiftAttempt(giveawayId, recipient, amount, purpose) {
        if (!giveawayId) return null;
        const ledger = readPaidGiftsLedger();
        if (!ledger[giveawayId]) ledger[giveawayId] = {};
        const giftKey = paidGiftKey(recipient, amount, purpose);
        const attemptToken = `${TAB_ID}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
        ledger[giveawayId][giftKey] = attemptToken;
        writePaidGiftsLedger(ledger);
        try {
            localStorage.removeItem(paidGiftRetryableKey(giveawayId, recipient, amount, purpose));
        } catch {}
        return attemptToken;
    }

    function markGiftAttemptRetryable(giveawayId, recipient, amount, purpose, attemptToken) {
        if (!giveawayId || !attemptToken) return false;
        const ledger = readPaidGiftsLedger();
        const current = ledger[giveawayId]?.[paidGiftKey(recipient, amount, purpose)];
        if (current !== attemptToken) return false;
        try {
            localStorage.setItem(
                paidGiftRetryableKey(giveawayId, recipient, amount, purpose),
                attemptToken
            );
            return true;
        } catch {
            return false;
        }
    }

    function clearGiftAttemptRetryable(giveawayId, recipient, amount, purpose, attemptToken) {
        if (!giveawayId || !attemptToken) return;
        try {
            const key = paidGiftRetryableKey(giveawayId, recipient, amount, purpose);
            if (localStorage.getItem(key) === attemptToken) localStorage.removeItem(key);
        } catch {}
    }

    function markGiftAttemptTerminal(giveawayId, recipient, amount, purpose, attemptToken) {
        if (!giveawayId || !attemptToken) return false;
        const ledger = readPaidGiftsLedger();
        const giftKey = paidGiftKey(recipient, amount, purpose);
        const current = ledger[giveawayId]?.[giftKey];
        if (current !== attemptToken) return false;

        // A numeric value is the established terminal-attempt representation and
        // remains compatible with ledgers written by older stable versions.
        ledger[giveawayId][giftKey] = Date.now();
        writePaidGiftsLedger(ledger);
        clearGiftAttemptRetryable(giveawayId, recipient, amount, purpose, attemptToken);
        return true;
    }

    function recoverOrphanedPendingGiftAttempt(giveawayId, recipient, amount, purpose, attemptState) {
        if (!ownsTabLock()) return false;
        if (!attemptState || attemptState.state !== "pending" || !attemptState.token) return false;

        const originTabId = giftAttemptTokenOwner(attemptState.token);
        if (!originTabId || originTabId === TAB_ID) return false;

        // This document now owns the exclusive Web Lock, so the originating
        // document can no longer safely continue settlement. Its unresolved HTTP
        // request is treated as ambiguous terminal work: never auto-retry it,
        // but do verify whether the transfer landed before settlement completes.
        return markGiftAttemptTerminal(
            giveawayId,
            recipient,
            amount,
            purpose,
            attemptState.token
        );
    }

    function giftAttemptStillNeedsResolution(giveawayId, gift) {
        const state = getGiftAttemptState(
            giveawayId,
            gift?.recipient,
            gift?.amount,
            gift?.purpose
        ).state;
        return state === "none" || state === "pending" || state === "retryable";
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

        if (!(await ensureExclusiveTabOwnership())) {
            logEvent(
                "Gift paused (ownership lost)",
                `Refusing to send ${fmtBONCurrency(safeAmount)} BON to ${sanitizeNick(safeRecipient)} because this tab cannot prove exclusive giveaway ownership.`
            );
            return { attempted: false, reason: "ownership-lost" };
        }

        // ── Idempotency check ─────────────────────────────────────────────
        const giveawayId = getActiveGiveawayId();
        const existingAttempt = getGiftAttemptState(
            giveawayId,
            safeRecipient,
            safeAmount,
            purpose
        );
        if (existingAttempt.state === "pending") {
            if (
                recoverOrphanedPendingGiftAttempt(
                    giveawayId,
                    safeRecipient,
                    safeAmount,
                    purpose,
                    existingAttempt
                )
            ) {
                logEvent(
                    "Gift recovered as ambiguous",
                    `Recovered an orphaned pending attempt for ${sanitizeNick(safeRecipient)} (${fmtBONCurrency(safeAmount)} BON, ${purpose}); no automatic resend will occur until verification determines whether the original request landed.`
                );
                return { attempted: false, reason: "duplicate", orphanedPending: true };
            }

            logEvent(
                "Gift deferred (attempt still pending)",
                `This tab still has an unresolved transfer attempt for ${sanitizeNick(safeRecipient)} (${fmtBONCurrency(safeAmount)} BON, ${purpose}). Settlement will verify it before deciding whether to resume.`
            );
            return { attempted: false, reason: "pending" };
        }
        if (existingAttempt.state === "attempted") {
            logEvent(
                "Gift skipped (duplicate)",
                `Already attempted: ${sanitizeNick(safeRecipient)} for ${fmtBONCurrency(safeAmount)} BON (${purpose}) in this giveaway.`
            );
            return { attempted: false, reason: "duplicate" };
        }
        // Record BEFORE sending — if the send half-completes we still want
        // future calls (this tab, another tab, post-restore) to skip. Current
        // entries carry a unique token so a proven-rejected request can make only
        // its own attempt retryable without clearing a newer owner's attempt.
        const attemptToken = recordGiftAttempt(
            giveawayId,
            safeRecipient,
            safeAmount,
            purpose
        );

        async function fallbackToChat() {
            // No chat fallback has been sent yet, and a safe HTTP 4xx (when this
            // helper is reached after POST) proves the HTTP transfer did not land.
            // Publish retryability before trying to reclaim ownership so a new
            // owner can resume instead of treating this rejected attempt as paid.
            if (!markGiftAttemptRetryable(
                giveawayId,
                safeRecipient,
                safeAmount,
                purpose,
                attemptToken
            )) {
                logEvent(
                    "Gift fallback aborted (attempt superseded)",
                    `The transfer token for ${sanitizeNick(safeRecipient)} was replaced by a newer owner before fallback could run.`
                );
                return false;
            }

            if (!(await ensureExclusiveTabOwnership())) {
                logEvent(
                    "Gift fallback paused (ownership lost)",
                    `Refusing chat fallback for ${sanitizeNick(safeRecipient)} because this tab cannot prove exclusive giveaway ownership; the rejected attempt remains retryable.`
                );
                return false;
            }

            // We own the giveaway again and are about to make the fallback send
            // ambiguous. Make this exact attempt terminal before sending.
            if (!markGiftAttemptTerminal(
                giveawayId,
                safeRecipient,
                safeAmount,
                purpose,
                attemptToken
            )) {
                logEvent(
                    "Gift fallback aborted (attempt superseded)",
                    `The transfer token for ${sanitizeNick(safeRecipient)} changed before the chat fallback send; refusing to risk a duplicate payment.`
                );
                return false;
            }

            const cmd = safeMessage
                ? `/gift ${safeRecipient} ${safeAmount} ${safeMessage}`
                : `/gift ${safeRecipient} ${safeAmount}`;
            await sendMessage(cmd);
            return true;
        }

        // Page-first contract: GET the site's real Send Gift page and submit the
        // exact POST form it exposes. Hidden tracker/version-specific fields are
        // preserved automatically. /gift remains emergency fallback only.
        const senderSlug = getAuthenticatedUserSlug();
        const giftContract = senderSlug ? await fetchGiftFormContract(senderSlug) : null;

        if (!giftContract?.action || !giftContract?.formData) {
            logEvent(
                "Gift page contract unavailable",
                `Could not obtain the site's real Send Gift form for ${sanitizeNick(safeRecipient)}; chat fallback is the last resort.`
            );
            if (!SITE.gifts.allowChatFallback || !(await fallbackToChat())) {
                return { attempted: false, reason: "gift-form-unavailable" };
            }
            return { attempted: true, transport: "chat-last-resort" };
        }

        const giftUrl = giftContract.action;
        const formData = giftContract.formData;
        const csrfMeta = document.querySelector('meta[name="csrf-token"]');
        const csrfToken = csrfMeta && csrfMeta.content ? csrfMeta.content : null;
        if (!formData.has("_token") && csrfToken) formData.set("_token", csrfToken);
        formData.set("recipient_username", safeRecipient);
        formData.set("bon", String(safeAmount));
        formData.set("message", safeMessage);

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
                if (!(await fallbackToChat())) {
                    return { attempted: false, reason: "ownership-lost", httpStatus: resp.status };
                }
                return { attempted: true, transport: "chat-fallback", httpStatus: resp.status };
            }

            if (!resp || resp.status >= 400) {
                // Ambiguous failure — server may or may not have processed it.
                // Do NOT fall back. The request is now terminal/ambiguous rather
                // than pending; verification decides whether it actually landed.
                markGiftAttemptTerminal(
                    giveawayId,
                    safeRecipient,
                    safeAmount,
                    purpose,
                    attemptToken
                );
                logEvent(
                    "Gift HTTP ambiguous (no fallback)",
                    `${sanitizeNick(safeRecipient)} ${fmtBONCurrency(safeAmount)} BON | status=${resp ? resp.status : "no-response"} | will verify via chat poll`
                );
                return { attempted: true, transport: "http-ambiguous", httpStatus: resp ? resp.status : null };
            }

            markGiftAttemptTerminal(
                giveawayId,
                safeRecipient,
                safeAmount,
                purpose,
                attemptToken
            );
            return { attempted: true, transport: "http", httpStatus: resp.status };
        } catch (e) {
            // A thrown fetch/network error is ambiguous: the server may have received
            // the request. Do NOT replay it via /gift; let verification decide.
            markGiftAttemptTerminal(
                giveawayId,
                safeRecipient,
                safeAmount,
                purpose,
                attemptToken
            );
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
    function prepareOutgoingMessage(messageStr, options = {}) {
        // Message semantics are explicit; never infer them from localized text.
        if (options?.kind !== "intro") {
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
        if (!OT_CHATROOM_ID || !OT_CSRF_TOKEN) return false;

        const payload = {
            bot_id: null,
            chatroom_id: Number(OT_CHATROOM_ID),
            message: messageStr,
            receiver_id: null,
            save: true,
            targeted: 0,
            user_id: Number(OT_USER_ID || 0)
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

    async function sendMessage(messageStr, options = {}) {
        messageStr = prepareOutgoingMessage(messageStr, options);
        const requireExclusiveGiveawayOwnership =
            options?.requireExclusiveGiveawayOwnership === true;

        if (DEBUG_SETTINGS.disable_chat_output) return true;

        if (DEBUG_SETTINGS.verify_sendmessage) console.debug("sendMessage: caching chat context if needed");

        // If cache is missing, try to refresh
        if (!OT_USER_ID || !OT_CHATROOM_ID || !OT_CSRF_TOKEN) cacheChatContext();

        // --- Attempt API POST, fall back to chatbox on failure ---
        if (!DEBUG_SETTINGS.suppressApiMessages) {
            try {
                if (await trySendViaApi(messageStr)) return true;
            } catch (e) {
                if (DEBUG_SETTINGS.log_chat_messages) console.warn("API send failed, falling back to chatbox method:", e);
                if (DEBUG_SETTINGS.verify_sendmessage) console.debug("sendMessage: API send failed, falling back to chatbox method");
            }
        }

        // Settlement output is authoritative. If the API attempt yielded while a
        // BFCache/pagehide handoff quarantined this document, never let the stale
        // continuation escape through the synchronous chatbox fallback.
        if (
            requireExclusiveGiveawayOwnership &&
            !canMutateActiveGiveaway()
        ) {
            logEvent(
                "Chatbox fallback blocked (ownership lost)",
                "Authoritative settlement output was not retried through the chatbox because this tab no longer owns the giveaway."
            );
            return false;
        }

        sendViaChatbox(messageStr);
        return true;
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
                sendMessage(t("allSlotsFilled", { count: giveawayData.totalEntries, remaining: parseTime(msLeft) }));
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


    // Clean any inherited/site-provided invisible separators first. DarkPeers
    // then re-inserts its historical compatibility ZWSP; Portugas displays the
    // literal username with no invisible character.
    function sanitizeNick(nick) {
        if (typeof nick !== "string") return nick;
        const clean = nick.replace(/[\u200B\u200C\u200D\u2063\uFEFF]/g, "").trim();
        if (clean.length < 2 || SITE?.chat?.obfuscateDisplayNames === false) return clean;
        return clean[0] + "\u200B" + clean.slice(1);
    }

    // Normalize usernames to a stable, case-insensitive key used for comparisons and map keys.
    // - trims whitespace
    // - strips a leading @ (common in mentions)
    // - lowercases
    function normalizeUserKey(name) {
        return String(name || "")
            .replace(/[\u200B\u200C\u200D\u2063\uFEFF]/g, "")
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
            console.info("[BONanza Giveaway] Merged pre-1.2.0 fork stats into the shared stats record.");
        } catch (e) {
            console.warn("[BONanza Giveaway] Legacy stats merge failed; leaving both records untouched.", e);
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

        const pool = ta(action === "unrig" ? "rigDenyUnrig" : "rigDenyRig");
        const template = pool[Math.floor(Math.random() * pool.length)] || "{user}";
        const msg = String(template).replace(/\{user\}/g, who);
        sendCommandResponse(author, msg);
    }

    function updateRigToggleUI() {
        if (!rigToggleInput) return;

        rigToggleInput.disabled = false;
        rigToggleInput.checked = !!riggedMode;
        rigToggleInput.title = t(riggedMode ? "uiRigOnTitle" : "uiRigOffTitle");

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



    function ordinal(n){ return formatRank(n); }

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
        if (hours) parts.push(tp("durationHourOne", "durationHourMany", hours, { n: hours }));
        if (minutes) parts.push(tp("durationMinuteOne", "durationMinuteMany", minutes, { n: minutes }));
        if (seconds) parts.push(tp("durationSecondOne", "durationSecondMany", seconds, { n: seconds }));
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
        if (!giveawayData) return false;
        const last = Number(giveawayData.lastReminderSentAt) || 0;
        // Automatic reminders are at least five minutes apart. A 60-second guard
        // is enough to absorb reload/timer races without relying on message text.
        return !last || (Date.now() - last) >= 60_000;
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
            label.textContent = maxRem ? t("uiRemindersMax", { max: maxRem }) : t("uiReminders");
        }
    }

    function cacheChatContext() {
        const previousUserId = OT_USER_ID;
        const previousRoomId = OT_CHATROOM_ID || chatroomId;
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

        // Vue-based UNIT3D chat versions don't expose Alpine x-data in the live
        // DOM. Preserve context already resolved from the real page/API.
        if (!OT_USER_ID && previousUserId) OT_USER_ID = previousUserId;
        if (!OT_CHATROOM_ID && previousRoomId) OT_CHATROOM_ID = Number(previousRoomId);

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
            startInput.setCustomValidity(t("validationLetters"));
            endInput.setCustomValidity(t("validationLetters"));
            return false;
        }

        // Ensure the inputs match the integer pattern
        if (
            !integerRegex.test(startVal) ||
            !integerRegex.test(endVal)
        ) {
            startInput.setCustomValidity(t("validationIntegers"));
            endInput.setCustomValidity(t("validationIntegers"));
            return false;
        }

        const startNum = parseInt(startVal, 10);
        const endNum = parseInt(endVal, 10);

        // Check for NaN just in case
        if (isNaN(startNum) || isNaN(endNum)) {
            startInput.setCustomValidity(t("validationNumbersOnly"));
            endInput.setCustomValidity(t("validationNumbersOnly"));
            return false;
        }

        // Ensure start is not greater than end
        if (startNum > endNum) {
            endInput.setCustomValidity(t("validationEndAfterStart"));
            return false;
        }

        return true;
    }

    function winnersValidation() {
        winnersInput.setCustomValidity("");
        const val = parseInt(winnersInput.value, 10);
        if (isNaN(val) || val < 1 || val > MAX_WINNERS) {
            winnersInput.setCustomValidity(t("validationWinnersRange", { max: MAX_WINNERS }));
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
            maxScaledWinnersInput.setCustomValidity(message ? t("validationInvalidMaxWinners") : "");
        }
    }

    function getMaxScaledWinnersValidation(baseWinners, rawValue) {
        const raw = String(rawValue ?? "").trim();
        const rangeMsg = t("validationMaxRange", { min: fmtBON(baseWinners), max: fmtBON(MAX_WINNERS) });

        if (!raw) return { valid: false, message: rangeMsg };
        if (!/^-?\d+$/.test(raw)) return { valid: false, message: t("validationIntegerWithRange", { range: rangeMsg }) };

        const parsed = Number(raw);
        if (!Number.isSafeInteger(parsed)) return { valid: false, message: rangeMsg };
        if (parsed < baseWinners || parsed > MAX_WINNERS) return { valid: false, message: rangeMsg };

        return { valid: true, value: parsed, message: "" };
    }

    function updateStartButtonState() {
        if (!startButton || !scaleWinnersToggleInput || !maxScaledWinnersInput) return;
        if (startButton.dataset.mode !== "start") return;

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

    /** Auto-populate the BON/+Winner field with the calculated threshold (unless manually edited). */
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

    function getScalingProgressState(data) {
        if (!data || !data.scaleWinnersWithSponsors) return null;

        const baseWinners = Math.max(
            1,
            Math.min(MAX_WINNERS, Math.floor(Number(data.baseWinnersAtStart || data.winnersNum) || 1))
        );
        const cap = Math.max(
            baseWinners,
            Math.min(Math.floor(Number(data.hostMaxScaledWinners) || baseWinners), MAX_WINNERS)
        );
        const effectiveWinners = recomputeEffectiveWinners(data);
        const threshold = getScalingBonPerWinner(data);
        const totalContrib = Math.max(0, Math.floor(getTotalContribForScaling(data)));
        const isCustomThreshold = Number.isFinite(Number(data.scaleBonPerWinner)) &&
            Number(data.scaleBonPerWinner) > 0;

        if (effectiveWinners >= cap) {
            return {
                baseWinners,
                effectiveWinners,
                cap,
                threshold,
                totalContrib,
                isCustomThreshold,
                nextWinner: null,
                progress: threshold,
                thresholdRemaining: 0,
                fundingRemaining: 0,
                remaining: 0
            };
        }

        const nextWinner = effectiveWinners + 1;

        // Progress is relative to the CURRENT winner tier, not simply total % threshold.
        // Example: base=1, threshold=350k, contributions=350k => winner #2 is unlocked,
        // so progress toward winner #3 must restart at 0/350k rather than "threshold reached".
        const currentTierStart = Math.max(0, (effectiveWinners - baseWinners) * threshold);
        const progress = Math.max(
            0,
            Math.min(threshold, totalContrib - currentTierStart)
        );
        const thresholdRemaining = Math.max(0, threshold - progress);

        // A very small custom threshold can reach the scaling gate before the weighted
        // prize scheme has enough BON to give every announced winner at least 1 BON.
        // Any new sponsor/host contribution also grows the pot, so the true requirement
        // is whichever is larger: the scaling threshold remainder or the funding floor.
        const potTotal = Math.max(0, Math.floor(Number(data.amount) || 0));
        const fundingRemaining = Math.max(
            0,
            minimumPotForWeightedWinners(nextWinner) - potTotal
        );
        const remaining = Math.max(thresholdRemaining, fundingRemaining);

        return {
            baseWinners,
            effectiveWinners,
            cap,
            threshold,
            totalContrib,
            isCustomThreshold,
            nextWinner,
            progress,
            thresholdRemaining,
            fundingRemaining,
            remaining
        };
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
        const winnersNow = Math.max(1, Math.floor(Number(data?.effectiveWinnersNum) || winnersBase));
        const word = t(winnersNow === 1 ? "winnerWordOne" : "winnerWordMany");
        let line = t("possibleWinners", { count: winnersNow, word });

        if (data && data.scaleWinnersWithSponsors) {
            const maxWinners = Math.max(winnersBase, Math.min(Math.floor(Number(data.hostMaxScaledWinners) || winnersBase), MAX_WINNERS));
            if (maxWinners > winnersNow) {
                line += t("upToWinners", { max: maxWinners });
            }
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
        const state = getScalingProgressState(data);
        if (!state) return "";

        if (state.effectiveWinners >= state.cap) {
            return t(options.plain ? "scalingMaxReachedPlain" : "scalingMaxReachedSoft", {
                accent: SCALING_ACCENT_COLOR,
                cap: fmtBON(state.cap)
            });
        }

        const detail = t("scalingProgressDetail", {
            remaining: fmtBONCurrency(state.remaining),
            next: fmtBON(state.nextWinner),
            progress: fmtBONCurrency(state.progress),
            threshold: fmtBONCurrency(state.threshold)
        });

        return t(options.plain ? "scalingProgressPlain" : "scalingProgressSoft", {
            accent: SCALING_ACCENT_COLOR,
            detail
        });
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
        return t("finalSponsorThanks", {
            marker: bridgeMarker(BRIDGE_MARKERS.SPONSORS, "🥳"),
            amount: fmtBONCurrency(sponsorTotal),
            sponsors: safe.join(" · ")
        });
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

        const maxVisible = Math.max(
            300,
            Math.floor(Number(SPONSOR_ANNOUNCE.final_recap_max_visible_chars) || 900)
        );
        const marker = bridgeMarker(BRIDGE_MARKERS.SPONSOR_MESSAGES, "💬");
        const heading = t("finalSponsorMessagesHeading", { marker });
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
            description: `!${name}`,
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
        if (meta.requiresGiveaway && !active) return t("uiRequiresGiveaway");

        if (meta.hostOnly && !isCurrentUserGiveawayHost()) return t("uiHostOnly");

        if (name === "reminder" && active && !shouldSendReminder(giveawayData)) return t("uiReminderNotDue");

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
                if (requiredNow) error = arg.hint || t("uiRequired");
            } else if (arg.type === "int") {
                const n = Number(raw);
                if (!Number.isSafeInteger(n)) {
                    error = t("uiInteger");
                } else if (Number.isFinite(arg.min) && n < arg.min) {
                    error = t("uiMinimum", { value: arg.min });
                } else if (Number.isFinite(arg.max) && n > arg.max) {
                    error = t("uiMaximum", { value: arg.max });
                }
            } else if (typeof arg.validate === "function" && !arg.validate(raw, allRaw)) {
                error = arg.hint || t("uiInvalidValue");
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

        setButtonDisabledWithTooltip(state.button, !canRun, disabledReason || t("uiFixArguments"), `${validation.meta.description} ${t("uiExample", { usage: validation.meta.usage })}`);
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
            placeholder.textContent = t("uiPanelInitError");
            hostCommandPanelBody.appendChild(placeholder);
            return;
        }

        const { commands, registryName, reason } = panelList;
        if (commands.length === 0) {
            const placeholder = document.createElement("p");
            placeholder.className = "host-command-panel__empty";
            placeholder.textContent = t("uiNoCommands", { detail: t("uiRegistryEmpty", { registry: registryName }) });
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
            row.title = `${meta.description} ${t("uiExample", { usage: meta.usage })}`;
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
            button.title = `${meta.description} ${t("uiExample", { usage: meta.usage })}`;
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

                input.title = `${arg.label || arg.name} (${t(arg.required ? "uiRequiredSuffix" : "uiOptionalSuffix")})`;
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
            placeholder.textContent = t("uiNoCommands", { detail: reason || t("uiRegistryEmpty", { registry: registryName }) });
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
                reason || t("uiFixArguments"),
                `${state.meta.description} ${t("uiExample", { usage: state.meta.usage })}`
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
            SITE,
            SITE_PROFILES,
            I18N,
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

    function normalizeChatApiText(rawHtml) {
        try {
            const doc = new DOMParser().parseFromString(String(rawHtml || ""), "text/html");
            return String(doc.body?.textContent || "")
                .replace(/\u00a0/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        } catch {
            return String(rawHtml || "").replace(/\s+/g, " ").trim();
        }
    }

    function sortChatMessagesChronologically(messages) {
        return (Array.isArray(messages) ? messages.slice() : []).sort((a, b) => {
            const aId = Number(a?.id);
            const bId = Number(b?.id);
            if (Number.isFinite(aId) && Number.isFinite(bId) && aId !== bId) return aId - bId;

            const aTs = Date.parse(a?.created_at || "");
            const bTs = Date.parse(b?.created_at || "");
            if (Number.isFinite(aTs) && Number.isFinite(bTs) && aTs !== bTs) return aTs - bTs;
            return 0;
        });
    }

    function addStyle(css, id) {
        const style = document.createElement("style");
        style.id = id;
        style.textContent = css;
        document.head.appendChild(style);
    }
})();
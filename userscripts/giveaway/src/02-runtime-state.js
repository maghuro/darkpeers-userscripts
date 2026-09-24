    // SECTION 2: Runtime State Variables
    // ───────────────────────────────────────────────────────────
    let giveawayStartTime;
    let sponsorsInterval;
    let sponsorRecoveryInterval;
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
    let chatReplayIgnoreBeforeTs = null;
    const entryRowByKey = new Map();

    const regNum = /^-?\d+$/; // matches integers (including negative) for entry detection

    /* --- Naughty (exclusion) list ------------------------------------- */
    const NAUGHTY_KEY =
        `bonanza-giveaway-naughty-list${REHEARSAL_STORAGE_SUFFIX}`;
    const naughtySet = new Set(
        JSON.parse(localStorage.getItem(NAUGHTY_KEY) || "[]")
        .map(normalizeLower) // store lowercase for case-insensitive match
    );
    function saveNaughty() {
        localStorage.setItem(NAUGHTY_KEY, JSON.stringify([...naughtySet]));
    }

    function setHostSafetyBanner(key, message, tone = "warning") {
        const frame = bonanzaGiveawayFrame || document.getElementById("bonanzaGiveawayFrame");
        if (!frame) return;

        let container = frame.querySelector("#bonanzaSafetyBanners");
        if (!container) {
            container = document.createElement("div");
            container.id = "bonanzaSafetyBanners";
            container.style.cssText =
                "display:flex;flex-direction:column;gap:6px;padding:8px 10px 0 10px;";

            const header = frame.querySelector("header.panel__heading");
            if (header && header.parentNode) {
                header.parentNode.insertBefore(container, header.nextSibling);
            } else {
                frame.prepend(container);
            }
        }

        const id = `bonanzaSafetyBanner-${String(key || "general").replace(/[^a-z0-9_-]/gi, "-")}`;
        let banner = container.querySelector(`#${id}`);
        if (!banner) {
            banner = document.createElement("div");
            banner.id = id;
            banner.setAttribute("role", "status");
            banner.style.cssText =
                "padding:8px 10px;border-radius:5px;font-size:12px;font-weight:700;line-height:1.35;";
            container.appendChild(banner);
        }

        if (tone === "danger") {
            banner.style.background = "rgba(179,37,37,.25)";
            banner.style.border = "1px solid #ff6f6f";
            banner.style.color = "#ffd7d7";
        } else {
            banner.style.background = "rgba(255,192,10,.16)";
            banner.style.border = "1px solid #ffc00a";
            banner.style.color = "#fff0b3";
        }
        banner.textContent = String(message || "");
    }

    function clearHostSafetyBanner(key) {
        const id = `bonanzaSafetyBanner-${String(key || "general").replace(/[^a-z0-9_-]/gi, "-")}`;
        const banner = document.getElementById(id);
        if (banner) banner.remove();
        const container = document.getElementById("bonanzaSafetyBanners");
        if (container && !container.children.length) container.remove();
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

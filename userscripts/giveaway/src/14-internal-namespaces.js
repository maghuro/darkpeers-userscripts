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
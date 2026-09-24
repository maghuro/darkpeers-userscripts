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
        // Safety: no active giveaway. During settlement we intentionally keep the
        // chat observer alive for status commands, but entries are frozen.
        if (!giveawayData) return;
        if (isGiveawaySettling(giveawayData) || getGiveawayRemainingMs(giveawayData) <= 0) return;

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
            const timeLeftStr = parseTime(getGiveawayRemainingMs(giveawayData));
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

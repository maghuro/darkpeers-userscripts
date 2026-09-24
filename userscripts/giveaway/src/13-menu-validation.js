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
            startInput.setCustomValidity("Letters are not allowed. Please enter valid integers.");
            endInput.setCustomValidity("Letters are not allowed. Please enter valid integers.");
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
        // Show the effective winner count (accounts for scaling). Never capped by current entrants
        const winnersNow = Math.max(1, Math.floor(Number(data?.effectiveWinnersNum) || winnersBase));
        let line = `[b][color=#5DE2E7]${winnersNow} possible ${winnersNow === 1 ? 'winner' : 'winners'}[/color][/b]`;

        if (data && data.scaleWinnersWithSponsors) {
            const maxWinners = Math.max(winnersBase, Math.min(Math.floor(Number(data.hostMaxScaledWinners) || winnersBase), MAX_WINNERS));
            line += ` (up to [b][color=#5DE2E7]${maxWinners}[/color][/b])`;
        }

        return line;
    }

    function isCurrentUserGiveawayHost() {
        const navDisplayName = getTopNavUserLink()?.textContent || "";
        const selfNames = [getLoggedInUsername(), navDisplayName].map((name) => normUserKey(name)).filter(Boolean);
        if (!selfNames.length) return false;

        const hostKey = normUserKey(giveawayData?.host) || lastKnownGiveawayHostKey;
        if (hostKey) return selfNames.some((name) => name === hostKey);
        // No active/known host yet: default to showing host controls for the logged-in user.
        // Actions still remain gated by giveaway activity + host checks elsewhere.
        return true;
    }

    function isGiveawayCurrentlyActive(data) {
        if (!data || isGiveawaySettling(data)) return false;
        return getGiveawayRemainingMs(data) > 0;
    }

    function getSponsorshipNextWinnerLine(data, options = {}) {
        const state = getScalingProgressState(data);
        if (!state) return "";

        if (state.effectiveWinners >= state.cap) {
            return options.plain
                ? `[b][color=${SCALING_ACCENT_COLOR}]Scaling:[/color][/b] [b]Max winners reached[/b] (${fmtBON(state.cap)}).`
                : `[b][color=${SCALING_ACCENT_COLOR}]Scaling:[/color][/b] [i][color=#9aa0a6][b]Max winners reached[/b] (${fmtBON(state.cap)}).[/color][/i]`;
        }

        const detail =
            `${fmtBONCurrency(state.remaining)} BON still needed for winner #${fmtBON(state.nextWinner)} ` +
            `(progress: ${fmtBONCurrency(state.progress)}/${fmtBONCurrency(state.threshold)} BON).`;

        return options.plain
            ? `[b][color=${SCALING_ACCENT_COLOR}]Scaling:[/color][/b] [b]${detail}[/b]`
            : `[b][color=${SCALING_ACCENT_COLOR}]Scaling:[/color][/b] [i][color=#9aa0a6][b]${detail}[/b][/color][/i]`;
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

        const maxVisible = Math.max(
            300,
            Math.floor(Number(SPONSOR_ANNOUNCE.final_recap_max_visible_chars) || 900)
        );
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

        return executeCommand({
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

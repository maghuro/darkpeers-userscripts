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
                // bgImage looks like: url("..."); pull out the URL safely
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

    function getChatMessageCreatedAtTs(messageNode) {
        try {
            const timeEl = messageNode?.querySelector?.("time.chatbox-message__time, time[datetime]");
            const raw = timeEl?.getAttribute?.("datetime") || timeEl?.getAttribute?.("title") || "";
            const parsed = Date.parse(raw);
            return Number.isFinite(parsed) ? parsed : null;
        } catch {
            return null;
        }
    }

    function parseMessage(messageNode) {
        const perfStart = PERF ? performance.now() : 0;

        const createdAtTs = getChatMessageCreatedAtTs(messageNode);
        // If UNIT3D ever inserts a relevant node without a parseable datetime,
        // deliberately fail open. A possible duplicate reply is safer than silently
        // discarding a real entry.
        if (
            Number.isFinite(chatReplayIgnoreBeforeTs) &&
            Number.isFinite(createdAtTs) &&
            createdAtTs <= chatReplayIgnoreBeforeTs
        ) {
            return;
        }

        const messageContentElement = getMessageContentElement(messageNode);
        if (!messageContentElement) return; // system/bot messages. Skip

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
        if (!author) return; // could not resolve username from DOM. Skip silently

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

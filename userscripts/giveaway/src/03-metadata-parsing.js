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

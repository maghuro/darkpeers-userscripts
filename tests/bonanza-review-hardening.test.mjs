import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const sourcePath = new URL(
  "../userscripts/giveaway/DarkPeers_BONanza_Giveaway.user.js",
  import.meta.url
);
const source = readFileSync(sourcePath, "utf8");

test("review hardening invariants stay present", () => {
  assert.match(source, /^\/\/ @version\s+1\.5\.6$/m);
  assert.doesNotMatch(source, /pollChatFallback/);
  assert.doesNotMatch(source, /onlyguardians/i);
  assert.match(source, /async function getLatestMainChatReplayBoundary\(\)/);
  assert.match(source, /replayBoundary\.ts - Math\.max/);
  assert.match(source, /const REHEARSAL_MODE = !!\(/);
  assert.match(source, /Rehearsal gift suppressed/);
  assert.match(source, /Rehearsal BON Pool contribution suppressed/);
  assert.equal(
    (source.match(/getLatestChatMessageId\(DARKPEERS_MAIN_CHATROOM_ID\)/g) || []).length,
    4
  );
  assert.equal(
    (source.match(/getLatestChatMessageId\(DARKPEERS_CHATROOM_ID\)/g) || []).length,
    2
  );
});

test("winner-count commands are host-only", () => {
  const winners = source.match(/winners\(ctx\) \{[\s\S]*?\n\s*\},\n\n\s*maxwinners\(ctx\)/)?.[0] || "";
  const maxWinners = source.match(/maxwinners\(ctx\) \{[\s\S]*?\n\s*\},\n\n\s*scale\(ctx\)/)?.[0] || "";

  assert.match(winners, /normalizeUserKey\(author\) !== normalizeUserKey\(giveawayData\.host\)/);
  assert.doesNotMatch(winners, /isHostOrAdmin/);

  assert.match(maxWinners, /normalizeUserKey\(author\) !== normalizeUserKey\(giveawayData\.host\)/);
  assert.doesNotMatch(maxWinners, /isHostOrAdmin/);
});

test("staff emergency controls remain available", () => {
  const required = [
    /rig\(ctx\)[\s\S]*?isHostOrAdmin/,
    /unrig\(ctx\)[\s\S]*?isHostOrAdmin/,
    /const isPriv = normalizeUserKey\(author\) === normalizeUserKey\(giveawayData\.host\) \|\| isAdmin\(fancyName\)/,
    /naughty\(ctx\)[\s\S]*?isHostOrAdmin/,
    /end\(ctx\)[\s\S]*?isAdmin\(fancyName\)/
  ];

  for (const pattern of required) assert.match(source, pattern);
});

test("staff emergency actions are publicly attributed and cooldown-exempt", () => {
  assert.match(source, /function makeStaffAttributedReply\(ctx\)/);
  assert.match(source, /Staff action by \$\{sanitizeNick\(ctx\.author\)\}/);
  assert.match(source, /const actionReply = makeStaffAttributedReply\(ctx\)/);
  assert.match(source, /Requested by staff \$\{sanitizeNick\(author\)\} via !end/);
  assert.match(source, /isEmergencyOperator[\s\S]*?isAdmin\(fancyName\)/);
});

test("public winner names use anti-ping sanitization", () => {
  assert.doesNotMatch(source, /\[color=#DC3D1D\]\$\{w\.author\}\[\/color\]/);
  assert.match(source, /\[color=#DC3D1D\]\$\{sanitizeNick\(w\.author\)\}\[\/color\]/);
});

test("degraded restore keeps a settlement gate", () => {
  assert.match(source, /__sponsorAccountingVerified === false/);
  assert.match(source, /scheduleSponsorAccountingRecovery/);
  assert.match(source, /ACCOUNTING NOT VERIFIED/);
  assert.match(source, /repairStats: false/);
});


test("rehearsal guards precede every money/chat POST path", () => {
  const poolStart = source.indexOf("async function contributeBonPool");
  const poolDryRun = source.indexOf("if (REHEARSAL_MODE)", poolStart);
  const poolPost = source.indexOf('method: "POST"', poolStart);
  assert.ok(poolStart >= 0 && poolDryRun > poolStart && poolPost > poolDryRun);

  const giftStart = source.indexOf("async function giftBon");
  const giftDryRun = source.indexOf("if (REHEARSAL_MODE)", giftStart);
  const giftPost = source.indexOf('method: "POST"', giftStart);
  assert.ok(giftStart >= 0 && giftDryRun > giftStart && giftPost > giftDryRun);

  const sendStart = source.indexOf("async function sendMessage");
  const sendDryRun = source.indexOf("if (REHEARSAL_MODE)", sendStart);
  const sendApiCall = source.indexOf("trySendViaApi(messageStr)", sendStart);
  assert.ok(sendStart >= 0 && sendDryRun > sendStart && sendApiCall > sendDryRun);

  assert.equal((source.match(/trySendViaApi\(/g) || []).length, 2);
});

test("staff detection uses exact role-title allow-list matching", () => {
  assert.match(source, /DARKPEERS_STAFF_ROLE_NAMES\.has\(title\)/);
  assert.doesNotMatch(source, /roleTokens\.some/);
  assert.doesNotMatch(source, /includes\(['"]onlyguardians['"]\)/i);
});


test("rehearsal persistent state is isolated from live giveaway state", () => {
  assert.match(source, /const REHEARSAL_STORAGE_SUFFIX = REHEARSAL_MODE \? "::rehearsal" : ""/);
  assert.match(source, /BONANZA_GIVEAWAY_STATS_v2::\$\{location\.hostname\}\$\{REHEARSAL_STORAGE_SUFFIX\}/);
  assert.match(source, /bonanza-giveaway-statements::\$\{location\.hostname\}\$\{REHEARSAL_STORAGE_SUFFIX\}/);
  assert.match(source, /LS_ACTIVE_GIVEAWAY_LEGACY\}\$\{REHEARSAL_STORAGE_SUFFIX\}::/);
  assert.match(source, /savedRehearsalMode !== REHEARSAL_MODE/);
  assert.match(source, /rehearsalMode: REHEARSAL_MODE/);

  // Ownership stays shared deliberately so a live giveaway and rehearsal cannot
  // operate concurrently in separate tabs.
  assert.match(source, /const LS_TAB_LOCK = `bonanza-giveaway-tabLock::\$\{location\.hostname\}`/);
  assert.match(source, /const TAB_WEB_LOCK_NAME = `bonanza-giveaway-owner::\$\{location\.hostname\}`/);
});

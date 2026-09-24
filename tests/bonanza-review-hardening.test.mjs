import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const sourcePath = new URL(
  "../userscripts/giveaway/DarkPeers_BONanza_Giveaway.user.js",
  import.meta.url
);
const source = readFileSync(sourcePath, "utf8");

test("review hardening invariants stay present", () => {
  assert.match(source, /^\/\/ @version\s+1\.5\.5$/m);
  assert.doesNotMatch(source, /pollChatFallback/);
  assert.doesNotMatch(source, /onlyguardians/i);
  assert.match(source, /async function getLatestMainChatReplayBoundary\(\)/);
  assert.match(source, /replayBoundary\.ts - Math\.max/);
  assert.match(source, /const REHEARSAL_MODE = !!\(/);
  assert.match(source, /Rehearsal gift suppressed/);
  assert.match(source, /Rehearsal BON Pool contribution suppressed/);
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

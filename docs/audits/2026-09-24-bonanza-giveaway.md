# DarkPeers BONanza Giveaway Audit - 2026-09-24

## Conclusion

The final giveaway settlement is verified.

The live sponsor counter was temporarily inflated by a replay bug, but the active giveaway was reconciled against DarkPeers Gift History before the draw. The final pot, winner selection, winner payouts and BON Pool contribution all match the persistent DarkPeers records.

No winner payout and no BON Pool contribution was made while the inflated pot was active.

## Giveaway

| Field | Verified value |
| --- | ---: |
| Giveaway ID | 1790270166602 |
| Host | maghuro |
| Script at settlement | 1.5.1 |
| Started | 2026-09-24 17:16:06 UTC |
| Entries closed | 2026-09-24 18:01:06 UTC |
| Statement finalized | 2026-09-24 18:01:14 UTC |
| Number range | 11 to 111 |
| Entrants | 23 |
| Base winners | 1 |
| Final winners | 3 |
| Winning number | 42 |
| BON Pool | 10% |

## Final funding

The host opened the giveaway with 10,111 BON and later added 1 BON with `!addbon 1`.

| Source | BON |
| --- | ---: |
| Opening host funding | 10,111 |
| Host top-up | 1 |
| Sponsor gifts | 1,129,005 |
| **Final pot** | **1,139,117** |

Check:

```text
10,111 + 1 + 1,129,005 = 1,139,117
```

## Sponsors

DarkPeers persistent Gift History and gift notifications show exactly these six sponsor gifts for this giveaway:

| UTC | Sponsor | BON | Note |
| --- | --- | ---: | --- |
| 17:16:32 | Chungus | 69 | |
| 17:17:23 | Jeditwo | 381,994 | |
| 17:18:45 | RAINMAN | 500,000 | Happy Birthday Trzy |
| 17:24:39 | samisd | 77,522 | MESSAGE |
| 17:25:36 | TheRazgriz | 100,000 | Because why not? |
| 17:26:11 | demonkadar | 69,420 | keep this warm for me, its coming back cuz I win :D |
| | **Total** | **1,129,005** | |

No additional sponsor gift was recorded after demonkadar's gift and before settlement.

## Sponsor replay incident

At 17:31:24 UTC the userscript announced another sponsor batch totaling 1,129,005 BON.

That amount is exactly equal to the complete set of six real sponsor gifts above. It was not a new set of gifts. The script had replayed the already counted sponsorships through its old System/DPBot fallback path.

The displayed pot therefore changed incorrectly from:

```text
1,139,116 BON
```

to:

```text
2,268,121 BON
```

The excess was exactly:

```text
2,268,121 - 1,139,116 = 1,129,005 BON
```

The giveaway was extended and settlement was prevented while this was investigated.

Version 1.5.1 changed sponsor accounting so only persistent Gift History can mutate the sponsor total. On restore, the active giveaway was rebuilt from the persistent Gift History and returned to 1,139,116 BON.

At 17:56:40 UTC the host deliberately tested `!addbon 1`, producing the final valid pot of 1,139,117 BON.

## Entrants

The final entry set contained 23 unique users and 23 unique numbers:

| Number | User |
| ---: | --- |
| 11 | maghuro |
| 13 | TheRazgriz |
| 23 | Startling |
| 34 | NeoByte |
| 38 | DarkPeers |
| 40 | Crow |
| 41 | samisd |
| 42 | weedsmoke |
| 46 | jarre |
| 55 | Jeditwo |
| 56 | neuczarny |
| 59 | RAINMAN |
| 62 | Frosty |
| 63 | susumo |
| 67 | demonkadar |
| 69 | Chungus |
| 82 | affluentostrich |
| 83 | meindp |
| 85 | sadarena3 |
| 88 | Sch2021 |
| 95 | bleakCage |
| 103 | things_are_great |
| 111 | mrkmrtns |

A final `!entries` state in the captured chat also reported 23/101 entries with the same mapping.

## Result

The winning number was 42.

The three closest valid entries were unambiguous:

| Place | User | Guess | Difference |
| ---: | --- | ---: | ---: |
| 1 | weedsmoke | 42 | 0 |
| 2 | samisd | 41 | 1 |
| 3 | Crow | 40 | 2 |

The next closest guesses were 38 and 46, both four numbers away, so they did not affect the podium.

## Prize and BON Pool accounting

| Place | User | Gross prize | BON Pool allocation | Paid to winner |
| ---: | --- | ---: | ---: | ---: |
| 1 | weedsmoke | 569,560 | 56,956 | 512,604 |
| 2 | samisd | 379,705 | 37,970 | 341,735 |
| 3 | Crow | 189,852 | 18,985 | 170,867 |
| | **Totals** | **1,139,117** | **113,911** | **1,025,206** |

Checks:

```text
569,560 + 379,705 + 189,852 = 1,139,117
56,956 + 37,970 + 18,985 = 113,911
512,604 + 341,735 + 170,867 = 1,025,206
113,911 + 1,025,206 = 1,139,117
```

The 10% mode operates in whole BON, so the verified pool allocation is 113,911 BON.

## Winner payout verification

The local payout ledger recorded the three transfers at:

| UTC | Recipient | BON |
| --- | --- | ---: |
| 18:01:10.994 | weedsmoke | 512,604 |
| 18:01:11.859 | samisd | 341,735 |
| 18:01:12.824 | Crow | 170,867 |

DarkPeers Gift History independently contains all three outgoing transfers with the same recipients and amounts.

The final statement records every winner gift as confirmed in Gift History.

## BON Pool verification

The direct BON Pool contribution was attempted at 18:01:13.392 UTC and confirmed at 18:01:13.822 UTC with HTTP 200.

Persistent pool counters changed as follows:

| Counter | Before | After | Difference |
| --- | ---: | ---: | ---: |
| maghuro contribution | 339,358 | 453,269 | 113,911 |
| Total BON Pool | 21,936,933 | 22,050,844 | 113,911 |

A fresh server read at 18:18:40 UTC returned the same final counters:

```text
maghuro contribution: 453,269 BON
Total BON Pool:       22,050,844 BON
```

This independently confirms the 113,911 BON pool contribution.

## Giveaway-relevant chat timeline

All times below are UTC.

| Time | Event |
| --- | --- |
| 17:16:06 | Giveaway started |
| 17:16:32 | Chungus sponsored 69 BON |
| 17:17:23 | Jeditwo sponsored 381,994 BON |
| 17:18:45 | RAINMAN sponsored 500,000 BON |
| 17:19:17 | Host used `!sponsors` |
| 17:19:32 | TheRazgriz used `!random` and received 13 |
| 17:20:04 | RAINMAN entered 59 |
| 17:21:00 | Crow used `!random` and received 40 |
| 17:21:25 | jarre entered 46 |
| 17:22:38 | samisd entered 41 |
| 17:23:13 | demonkadar entered 67 |
| 17:23:55 | `!entries` showed 14 entrants |
| 17:24:05 | bleakCage entered 95 |
| 17:24:39 | samisd sponsored 77,522 BON |
| 17:25:36 | TheRazgriz sponsored 100,000 BON |
| 17:26:11 | demonkadar sponsored 69,420 BON |
| 17:26:28 | DarkPeers used `!random` and received 38 |
| 17:27:15 | Startling tried 69 and was correctly rejected because Chungus already had it |
| 17:27:19 | Frosty used `!random` and received 62 |
| 17:27:28 | `!entries` showed 17 entrants |
| 17:28:24 | affluentostrich used `!random` and received 82 |
| 17:28:46 | Startling used `!luckye` and received 23 |
| 17:30:36 | things_are_great used `!luckye` and received 103 |
| 17:31:24 | Sponsor replay bug duplicated the six already counted gifts in the displayed pot |
| 17:33:56 | weedsmoke entered 42 |
| 17:34:07 | neuczarny entered 56 |
| 17:37:06 | meindp entered 83 |
| 17:37:17 | Host used `!addtime 5` successfully |
| 17:40:00 | Host used `!reminder`; no immediate reminder was sent due to the manual-reminder suppression bug |
| 17:42:55 | Host added 5 minutes |
| 17:43:05 | Reminder posted |
| 17:45:26 | things_are_great used `!time` |
| 17:47:06 | Host added 15 minutes to allow investigation |
| 17:47:22 | Public accounting notice posted |
| 17:52:01 | Host added another 15 minutes |
| 17:52:44 | Reload hydration replayed old entry/command DOM messages, causing false duplicate-entry replies and a host spam lockout; no entry state changed |
| 17:54:15 | Host used `!time`; 26m50s remained |
| 17:55:55 | Public correction notice posted after Gift History reconciliation |
| 17:56:40 | Host used `!addbon 1`; final pot became 1,139,117 BON |
| 17:57:34 | Host used `!removetime 20`; 3m31s remained |
| 18:01:06 | Entries closed |
| 18:01:08 | Final sponsors, sponsor messages and result announced |
| 18:01:10 to 18:01:12 | Three winner payouts sent |
| 18:01:13 | BON Pool contribution confirmed |
| 18:01:14 | Statement finalized |

## Bugs found during the live audit

### 1. Sponsor replay could inflate the pot

Status: fixed in v1.5.1.

The old chat fallback could replay System/DPBot gift messages after Gift History had already counted the same gifts.

Persistent Gift History is now the only source allowed to mutate sponsor accounting.

### 2. Manual `!reminder` could be suppressed

Status: fixed in v1.5.1.

An explicit host `!reminder` previously passed through the automatic duplicate-reminder suppression logic.

Manual `!reminder` now forces an immediate reminder.

### 3. Reload could replay historical entries and commands

Status: fixed in v1.5.3.

UNIT3D hydrates its recent chat window into the DOM after a reload. The observer could interpret those historical DOM nodes as new messages.

This caused the false duplicate-entry replies visible at 17:52:44 and also triggered the host spam limiter.

Restored giveaways now ignore chat DOM messages timestamped at or before the restore boundary.

### 4. Statement `hostTopUps` field was wrong

Status: fixed in v1.5.3.

The final statement correctly showed 10,112 BON of host funding, but its separate `hostTopUps` field incorrectly showed 0.

The field is now derived as cumulative host funding minus the verified opening host contribution. For this giveaway it would correctly report 1 BON.

This reporting bug did not affect the pot or payouts.

### 5. Winner gift wording

Status: changed in v1.5.2.

Future winner gift notes are:

```text
Single winner:
🥇 YOU WON!! Congratulations!

Multiple winners:
🥇 1st place! Congratulations!
🥈 2nd place! Congratulations!
🥉 3rd place! Congratulations!
🎉 4th place! Congratulations!
...
```

## Evidence coverage and limitations

Two independent evidence captures were made after settlement:

1. Browser state captured at 18:18:01 UTC, including the final statement, payout ledger, BON Pool ledger and retained chat DOM.
2. Read-only DarkPeers server evidence captured from persistent Gift History, notifications, BON Pool counters and current chat API windows.

The retained browser chat starts at 17:18:39 UTC, while the giveaway started at 17:16:06 UTC. Therefore the first approximately 2 minutes and 33 seconds of chat are not preserved line by line in the browser snapshot.

That gap does not affect the financial verification:

- sponsor gifts in the gap are present in persistent Gift History and notifications;
- the first retained `!entries` summary records the initial entry state;
- the final 23-entry mapping is preserved later in the chat;
- winner payments and BON Pool settlement are independently persisted.

The public audit intentionally excludes unrelated casual chat and historical DarkPeers transactions outside this giveaway.

Historical BONanza leaderboard counters such as all-time sponsor totals and `biggestSponsor` are not used in pot, winner or settlement calculations. The browser evidence export did not include the separate persistent stats store, so those historical counters are outside the independently verified scope of this settlement audit. The transient `!sponsors` output replayed during the 17:52 restore is therefore not treated as evidence of the final historical-stats state.

## Final reconciliation

```text
Final pot                         1,139,117 BON

Paid to weedsmoke                  512,604 BON
Paid to samisd                     341,735 BON
Paid to Crow                       170,867 BON
BON Pool                           113,911 BON
                                  -------------
Total distributed                1,139,117 BON
```

**Result: VERIFIED. No unexplained BON remains and no winner was overpaid or underpaid.**

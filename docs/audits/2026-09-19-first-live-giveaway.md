# DarkPeers BONanza Giveaway — First Live Settlement Audit

**Date:** 2026-09-19  
**Host:** maghuro  
**Live userscript version:** v1.2.12  
**Live source commit:** [`d2ce149474b3e4f30420ad342fd7dbb06dab4518`](https://github.com/maghuro/darkpeers-userscripts/commit/d2ce149474b3e4f30420ad342fd7dbb06dab4518)  
**Source file used by the live run:** [DarkPeers_BONanza_Giveaway.user.js @ v1.2.12](https://github.com/maghuro/darkpeers-userscripts/blob/d2ce149474b3e4f30420ad342fd7dbb06dab4518/userscripts/giveaway/DarkPeers_BONanza_Giveaway.user.js)

This document is a straightforward reconciliation of the first real end-to-end giveaway settlement using the Maghuro fork.

It is intentionally based on arithmetic that can be checked independently from the userscript's own success message.

---

## 1. Final giveaway funding

| Source | BON |
|---|---:|
| Host-funded | 111,111 |
| Sponsored | 107,670 |
| **Final pot** | **218,781** |

Check:

```text
111,111 + 107,670 = 218,781 BON
```

### Sponsor breakdown

| Sponsor | BON |
|---|---:|
| trzykaksien | 100,000 |
| Chungus | 6,969 |
| PowerrrrPeer | 701 |
| **Total sponsored** | **107,670** |

Check:

```text
100,000 + 6,969 + 701 = 107,670 BON
```

---

## 2. Giveaway result

- Winning number: **36**
- Entrants: **11**
- Winners: **1**
- Tie: **Furyan** and **NeoByte**, both off by 1
- Tie-break rule: earliest submitted entry
- Winner: **Furyan** with guess **37**

The giveaway was configured to contribute **30% of the final pot** directly to the DarkPeers BON Pool.

---

## 3. Expected BON Pool contribution

Final pot:

```text
218,781 BON
```

Configured BON Pool share:

```text
30%
```

Calculation:

```text
218,781 × 0.30 = 65,634.3
floor(...)       = 65,634 BON
```

Therefore:

```text
Expected BON Pool contribution = 65,634 BON
Expected winner payout         = 218,781 - 65,634
                               = 153,147 BON
```

Conservation check:

```text
153,147 + 65,634 = 218,781 BON
```

**Discrepancy: 0 BON**

---

## 4. DarkPeers BON Pool — before and after

### Before settlement

```text
Total contributions: 6,557,641
Your contribution:        1,011
Host BON balance:       254,659
```

### After settlement

```text
Total contributions: 6,623,275
Your contribution:       66,645
Host BON balance:        35,878
```

---

## 5. Independent BON Pool counter checks

### Global BON Pool counter

```text
6,623,275 - 6,557,641 = 65,634 BON
```

Observed global pool increase:

**65,634 BON**

Expected:

**65,634 BON**

**Match: exact**

### Host's personal BON Pool contribution counter

```text
66,645 - 1,011 = 65,634 BON
```

Observed personal contribution increase:

**65,634 BON**

Expected:

**65,634 BON**

**Match: exact**

These are two separate DarkPeers BON Pool counters showing the same delta.

---

## 6. Host balance reconciliation

Host balance before:

```text
254,659 BON
```

Host balance after:

```text
35,878 BON
```

Difference:

```text
254,659 - 35,878 = 218,781 BON
```

That is exactly the full giveaway pot.

And the complete settlement was:

```text
Winner (Furyan):   153,147 BON
BON Pool:           65,634 BON
                   -----------
Total spent:       218,781 BON
```

Again:

```text
153,147 + 65,634 = 218,781 BON
```

**Host balance discrepancy: 0 BON**

---

## 7. Three-way reconciliation

The BON Pool payment is independently supported by all three of these observations:

1. **Global BON Pool total increased by 65,634 BON**
2. **maghuro's personal BON Pool contribution increased by 65,634 BON**
3. **maghuro's total BON balance fell by exactly 218,781 BON**, equal to:
   - 153,147 BON paid to Furyan
   - 65,634 BON paid to the BON Pool

```text
Expected BON Pool payment:                 65,634
Observed global BON Pool delta:            65,634
Observed personal contribution delta:      65,634

Expected total host outlay:               218,781
Observed host balance delta:              218,781

Accounting discrepancy:                        0 BON
```

---

## 8. Userscript announcement

After settlement and verification, the userscript announced:

> 🧾 **TAXES PAID:** **65,634 BON** successfully paid directly into the **BON Pool**. The taxman is satisfied. 😈

The important point is that the accounting above does **not** rely on trusting that message.

The DarkPeers before/after counters independently reconcile to the same **65,634 BON** contribution.

---

## 9. Public source

The userscript is public:

- Repository: https://github.com/maghuro/darkpeers-userscripts
- Exact live-run commit: https://github.com/maghuro/darkpeers-userscripts/commit/d2ce149474b3e4f30420ad342fd7dbb06dab4518
- Exact live-run source file: https://github.com/maghuro/darkpeers-userscripts/blob/d2ce149474b3e4f30420ad342fd7dbb06dab4518/userscripts/giveaway/DarkPeers_BONanza_Giveaway.user.js

The live giveaway was run with **v1.2.12**. Later versions contain follow-up presentation/bridge-marker improvements and are not being substituted retroactively for the code used in this audit.

---

## Conclusion

The first real Maghuro-fork giveaway settlement reconciles completely:

```text
Final pot:                  218,781 BON
Winner payout:              153,147 BON
BON Pool contribution:       65,634 BON
Accounting discrepancy:           0 BON
```

The BON Pool contribution is confirmed by both DarkPeers BON Pool counters and by the host's own balance delta.

**Result: settlement accounts balance exactly.**

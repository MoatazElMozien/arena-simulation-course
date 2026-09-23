# Lesson 8 — Verification & Validation

**Est. time:** 1 h · **Prerequisites:** [Lesson 7](07-running-models.md)

## 🎯 Objectives

By the end of this lesson you will be able to:

- Define **verification** and **validation** and explain why they differ.
- Apply a practical checklist of verification techniques in Arena.
- Choose and perform the right kind of validation (face, historical, sensitivity).
- Structure a simple credibility argument for your model.
- Document a model so someone else can audit it.

---

## 8.1 The two questions

```
   VERIFICATION  ──▶  "Did we build the model right?"   model vs. SPECIFICATION
   VALIDATION    ──▶  "Did we build the right model?"   model vs. REALITY
```

| | Verification | Validation |
|---|---|---|
| Compares | model behavior → your design intent | model behavior → the real system |
| Fails when | logic bugs, wrong wiring, unit errors | wrong assumptions, missing mechanisms, bad data |
| Analogy | code compiles & passes unit tests | software solves the user's actual problem |

**Both are required.** A perfectly verified model of the wrong process is
uselessly wrong; an unverified model of the right process gives random answers.

> 💡 Validation is **relative to purpose**: a model good enough to choose between
> 2 vs 3 tellers may be useless for predicting exact annual revenue. Always
> validate *for the decision at hand*.

---

## 8.2 Verification techniques (practical, in Arena)

### 1. Inspect while running: animation + Step

- Watch entities flow — do any **disappear, stall, or move backwards unexpectedly**?
- Use **Step** to advance one event at a time and check clock/state.
- **Bottleneck check**: is the queue where your intuition says it should be?

### 2. Extreme / boundary tests ("stress the model")

| Test | Expected |
|------|----------|
| Service time → tiny (e.g., `0.01`) | queue ≈ 0, utilization ≈ tiny |
| Arrival rate → near zero | same |
| Service time ≫ interarrival (ρ > 1) | queue grows without bound — confirms queuing logic works |
| Capacity 1 → 100 | waits collapse toward service time |
| Turn off variability (all CONSTANT) | outputs become deterministic & hand-checkable |

If a boundary test doesn't produce the obvious answer, **the model is wrong** —
find it before going further.

### 3. Hand / trace calculations

Pick **one entity** and follow it manually:

```
t=0.0  entity #3 created
t=12.4  reaches TellerService, Teller busy → queue (position 2)
t=18.9  seizes Teller
t=18.9+6.1 = 25.0  service done (delay was 6.1 from TRIA) → release
```

Compare with Arena's entity history / trace (`Run → ... trace` or the animation's
entity view). Mismatch = logic bug.

### 4. Balance checks (conservation of flow)

For every model, verify:

```
entities created  =  entities disposed  +  entities still in system (WIP at end)
```

and

```
resource busy time ≤ scheduled available time
```

If 1000 parts entered and 600 exited with WIP reported as 100 — 300 vanished.
**Find them.** (Common leaks: disconnected outputs, Decide branches with no
connection, batch members counted oddly.)

### 5. Statistical sanity vs. theory

Compare steady-state numbers to simple formulas:

- Utilization ≈ λ/(c·μ) for c servers.
- M/M/1: `Lq = ρ²/(1−ρ)` — your Arena queue length should be in the ballpark
  if inputs are exponential.
- Report CI half-widths — absurdly tight CIs on a noisy system can indicate
  shared random streams or warm-up errors.

### 6. Code review for modelers

Re-open the model a day later (or show a peer) and walk every module:
*What did I mean here? Is it what I wrote?* Also check every **Decide** for a
missing else-branch and every **Resource** for sensible capacity.

---

## 8.3 Validation techniques

### a) Face validity (cheapest)

Show the model/animation to **people who know the real system**:
*"Does this flow look like what happens on the floor?"*
Domain experts catch missing steps no amount of testing reveals.

### b) Historical data validation (strongest)

Feed the model **inputs from a known past period**; compare outputs to what
*actually happened* in that period:

| Metric | Real system (last month) | Model prediction | Match? |
|--------|--------------------------|------------------|--------|
| Avg wait | 14.2 min | 13.5 (11.9–15.1) | ✅ CI covers it |
| Daily throughput | 410 | 405 (398–412) | ✅ |
| Max queue | 22 | 9 | ❌ investigate |

Cover **multiple metrics** (flow, queue, utilization), not just one — matching
one number can be coincidence.

### c) Sensitivity / face-testing assumptions

Perturb doubtful inputs ±20–50%:

- If outputs barely change → those inputs don't matter much (validation of
  those assumptions is less critical — *and* you've learned where to focus data effort).
- If outputs swing wildly → **your recommendation is fragile**; get better data
  or present ranges, not point claims.

### d) Internal structure checks

Compare intermediate quantities (per-station utilizations, reject rates) —
matching end-results while intermediate stages are wrong means compensating errors.

---

## 8.4 A minimal credibility checklist

Before presenting results, be able to say ✅ to all:

- [ ] **Purpose stated**: model built to answer *which specific question*.
- [ ] **Boundary documented**: what's inside/outside the model.
- [ ] **Verification**: animation watched; extreme tests done; one entity traced by hand; flow balance closes.
- [ ] **Data sources noted**: where arrival/service/schedule numbers came from.
- [ ] **Validation**: expert face check done; at least one quantitative comparison (historical or theoretical) reported.
- [ ] **Statistics**: replications ≥ 10, warm-up justified, CIs reported.
- [ ] **Sensitivity**: key assumptions perturbed; conclusions hold across ranges.
- [ ] **Reproducibility**: file saved with Notes (purpose, date, version, author).

---

## 8.5 Worked example: catching three bugs

**Model:** clinic triage — patients arrive, triage (3 min, 1 nurse), then either
to Emergency (20%) or General (80%), each with its own doctor queue.

**Verification session findings:**

1. **Animation:** patients flow to Emergency fine, but General queue stays empty
   while General doctor sits idle. → *Bug:* the False branch of the Decide was
   never connected to the General process (connection missed during editing).
2. **Extreme test:** set Emergency probability to 100% — General still receives
   patients. → *Bug:* a second, stray Decide from an earlier draft was still in
   the flow.
3. **Hand trace:** traced patient #1: arrival t=0 → triage ends t=3 → waits 40
   min in Emergency — but report says avg wait 6 min. → *Bug:* reading the
   wrong queue's report row (queues named `Process1.Queue` vs `Process2.Queue`
   — **name your modules!**).

**Validation:** historical month shows avg time-in-system 51 min; model predicts
48 (CI 44–53) ✅, triage utilization matches badge-reader data (0.71 vs 0.73) ✅.

> Notice: two of three bugs were **wiring**, not statistics — which is why
> animation and balance checks come first.

---

## 8.6 Documentation template (paste into your model's Notes)

```
MODEL:    Clinic Triage v3
PURPOSE:  Decide whether adding a 2nd triage nurse cuts wait < 20 min
AUTHOR:   <you>            DATE: <date>
BOUNDARY: Doors → exit of doctor queue. No scheduling of doctors (always on).
INPUTS:   Arrivals from gate counter data (Mar 2026); triage TRIA(2,3,5) from
          time study; 20/80 split from last quarter's logs.
VERIFIED: Hand-traced 1 entity; extreme test (arrivals→0 ⇒ WIP 0); flow balance OK.
VALIDATED: Replicates March actuals: TIS 48 vs 51 real; triage util 0.71 vs 0.73.
RUN:      30 reps × 4800 min, warm-up 240 min.
```

---

## 📝 Practice questions

1. Classify each: (a) queue never empties though theory says it should;
   (b) model matches last week's real throughput; (c) expert says "we forgot
   the rescheduling step."
2. Your model has arrivals 100/day but only 60 exits/day and WIP=2. What do you check first?
3. Why is "the model matched the target number" *weak* validation?
4. What's the point of sensitivity analysis in validation?
5. Name two verification techniques that require no statistics at all.
6. When is warm-up omission a *verification* issue vs a *validation* issue? Discuss briefly.

<details>
<summary><b>Answers (click to expand)</b></summary>

1. (a) verification (logic/testing failure), (b) validation (comparison with reality — historical), (c) validation (face validity — missing real-world mechanism).
2. Flow balance: entities are getting stuck — look for unconnected Decide outputs, blocked paths, or entities queued in a module you forgot; animation + Step will reveal the leak.
3. Single-number matches can be coincidence or compensating errors; strong validation compares multiple metrics with uncertainty (CIs) and intermediate quantities.
4. It shows whether conclusions depend on shaky assumptions — if results swing widely when inputs vary plausibly, the recommendation is fragile and needs better data or range-based reporting.
5. Extreme/boundary tests; hand/trace calculation; animation inspection; flow-balance checks.
6. Both, really: it's a *specification* choice (did you set the run setup as intended?) and it biases the model's output vs. real steady-state behavior (validation-relevant). The key question: does your run setup represent the real system's operating conditions?

</details>

## ✅ Checkpoint

- [ ] Ran an extreme test on a model and it passed.
- [ ] Hand-traced one entity through a model.
- [ ] Wrote a documentation note block for one of your models.

---

**Previous ←** [Lesson 7](07-running-models.md) · **Next →** [Lesson 9: Case Study Projects](09-projects.md)

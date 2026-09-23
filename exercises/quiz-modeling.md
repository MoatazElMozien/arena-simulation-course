# Quiz — Modeling, Statistics & V&V (Lessons 6–8)

**40 questions** · closed book · answers in collapsible sections after each block.

---

## Block A — Expressions & data (Q1–Q10)

**Q1.** Evaluate mentally: `INT(TRIA(2,5,9))` — what kind of value comes out?

**Q2.** `MAX(1, INT(EXPO(3)))` — what does this achieve?

**Q3.** Attribute vs variable: which persists with an entity as it flows? Which is global?

**Q4.** Why must a global variable be declared in a **Variable** module before an Assign can update it?

**Q5.** What is an **Expression** module good for? Give an example.

**Q6.** What's a **Set** module, and name one use.

**Q7.** Write an expression: current hour of a 480-minute operating day (TNOW in minutes).

**Q8.** Condition: route to rework if the part has failed twice before OR its priority is 1.

**Q9.** What does `Res(Teller).NumBusy` return? When is it evaluated in a Decide?

**Q10.** You set `WIP = WIP + 1` on create and `WIP = WIP - 1` on dispose. Name one way the count drifts.

<details>
<summary><b>Answers A</b></summary>

1. An integer — `INT` truncates the draw.
2. Guarantees at least 1 where an exponential-based draw might produce 0 (e.g., minimum batch of 1).
3. Attribute (per-entity). Variable (global shared).
4. Arena needs to know the variable exists (and its size/array shape) to allocate it — Assigns can't invent globals.
5. Centralized parameters/scenario knobs — e.g., `SERVICE = TRIA(4,6,10)` referenced by several modules so scenarios change in one edit.
6. A named group of resources/stations/etc. — e.g., seize *any* server from `ALL_SERVERS`, or aggregate reporting.
7. `INT(MOD(TNOW, 480) / 60)` (0-based hour 0–7; add `+1` for 1-based).
8. `Entity.FailCount >= 2 OR Entity.Priority == 1`
9. Number of units of Teller currently busy — a *snapshot taken when the Decide evaluates* for that entity.
10. Rework loops skipping decrement, entities scrapped via a path without decrement, batches merging entities, or runs aborted — use built-in `WIP(module)` instead.

</details>

---

## Block B — Running & statistics (Q11–Q22)

**Q11.** What does *Warm-up Period* discard, and what's the bias if omitted in a steady-state model?

**Q12.** Terminating vs steady-state: a 24/7 warehouse — which? A bank open 8 h — which?

**Q13.** Why are 30 replications with a CI better than 1 run of 30× the length?

**Q14.** What does the **half-width** of a 95% CI tell you? What if half-width ≈ mean?

**Q15.** Queue-length-over-time chart rises forever. Diagnosis? Fix?

**Q16.** Arrivals `EXPO(10)` min, service `EXPO(8)` min, 1 server — predict utilization.

**Q17.** The report shows Resource: Busy% 0.55, Scheduled Util% 0.73. Interpret briefly.

**Q18.** Which is safer to headline: average wait or max wait? Why?

**Q19.** What is *common random numbers* and why use it when comparing scenarios?

**Q20.** Little's Law: if λ ≈ 6/hr and avg wait in queue = 12 min, predict Lq.

**Q21.** Name two things you should always include when reporting simulation results.

**Q22.** Your CI for average wait is (0.8, 14.2) minutes. What's the problem and the fix?

<details>
<summary><b>Answers B</b></summary>

1. The initial transient/fill-up period; omitting it biases averages optimistic (waits too short, utilization off) by including empty-start conditions.
2. Warehouse = steady-state (long run + warm-up). Bank = terminating (natural 8-hour end; warm-up only if start-empty isn't realistic).
3. Independent replications give a *sample of outcomes* → an estimate of variability/CI; one long run is a single correlated trajectory whose CI you can't properly estimate.
4. Precision of the estimate (smaller = more precise). Half-width ≈ mean = estimate too noisy → more replications (or reduce variance).
5. Instability: ρ ≥ 1 (arrivals ≥ service capacity). Increase capacity, reduce service time, or cap arrivals.
6. ρ = (1/10)/(1/8) = 0.8 → 80%.
7. Busy 55% of total time but 73% of scheduled-on time — it's off-shift part of the clock; heavier load while operating.
8. Average (with CI) — maxima depend heavily on run length/rare events and aren't stable across different horizons.
9. Using the same random streams across scenarios so randomness partly cancels — differences reflect your design change, not luck.
10. Lq = λ × Wq = 6/hr × 0.2 hr = **1.2** entities on average.
11. Point estimate + 95% CI, run setup (replications, length, warm-up), and key assumptions — at minimum.
12. Too few replications (high variance) → run 30–100 reps.

</details>

---

## Block C — Verification & validation (Q23–Q32)

**Q23.** State verification and validation in one sentence each.

**Q24.** Classify: (a) extreme test fails, (b) model matches last week's real data, (c) supervisor says a step is missing.

**Q25.** What's an *extreme/boundary test*? Give one example.

**Q26.** State the flow-balance equation for a model with scrap.

**Q27.** You predict 1000 entries but 600 exits and WIP=2. Where do you look first?

**Q28.** What is *face validity* and who provides it?

**Q29.** Why is "the model matched the target number" weak validation?

**Q30.** What's the purpose of sensitivity analysis during validation?

**Q31.** List three verification techniques that use no statistics.

**Q32.** Why should a model's Notes include purpose, boundary, and input sources?

<details>
<summary><b>Answers C</b></summary>

1. Verification: does the model behave as its specification intends (built right, no bugs)? Validation: does the model adequately represent the real system for its purpose (right model)?
2. (a) verification, (b) validation (historical), (c) validation (face).
3. Push inputs to absurd extremes where the answer is obvious — e.g., service time → 0.01 ⇒ queues ≈ 0; ρ>1 ⇒ queue grows forever.
4. `created = disposed + scrap-... ` precisely: `parts in = scrapped + 6×pallets + in-batch leftovers + WIP elsewhere` (all ways parts can exist).
5. Unconnected Decide outputs, blocked/missing routes, entities stuck in queues — use animation + Step to find the leak.
6. Showing the model/animation to domain experts who know the real process; they catch missing/wrong steps.
7. Single-number matches can be coincidence or compensating errors — validate multiple metrics with CIs and intermediate quantities.
8. Shows whether conclusions depend on shaky assumptions; fragile conclusions need better data or range-based claims.
9. Animation inspection, extreme tests, hand/trace of one entity, flow-balance checks.
10. Because validation is relative to purpose and auditability — a reader must know what question it answers, what it excludes, and where numbers came from to trust results.

</details>

---

## Block D — Tricky scenarios (Q33–Q40)

**Q33.** Explain why queues exist *at all* when average service < average interarrival time. (ρ = 0.8 — why is there ever a line?)

**Q34.** Two models both show 40% utilization at a machine, but one has 5× the wait. Why possible?

**Q35.** You add a 2nd server and utilization halves but wait time doesn't halve. Why?

**Q36.** A Create makes `EXPO(10)` and a Process delay is `EXPO(10)`, capacity 1. Predict utilization without running.

**Q37.** A modeler sets service times to constants "to remove noise." What's wrong?

**Q38.** Batch of 6 then dispose: report shows 200 exits but 1180 parts entered. Explain.

**Q39.** Decide(Condition) `TNOW > 480` routes to "overtime" path. What must your run length/time base guarantee for this to be meaningful?

**Q40.** In one sentence each: what does a *good* answer to a simulation project question look like?

<details>
<summary><b>Answers D</b></summary>

1. Randomness: arrivals cluster and services sometimes run long — temporary overload (variance) creates lines even when averages say capacity is sufficient. Variance drives waiting.
2. Utilization is an average too; wait depends on variability (distributions), batching, priorities, and schedules — two systems with equal mean load can have very different queueing behavior.
3. Queueing is nonlinear — wait drops sharply as ρ drops below 1, but from a high-ρ point, halving utilization typically cuts wait *more* than half; if it didn't, variability/other bottlenecks dominate. (Key point: no linear relationship.)
4. ρ = (1/10)/(1/10) = 1.0 → **unstable/edge** (borderline; queue random-walks, often grows) — a great "predict then verify" test.
5. Real systems have variability; constants understate queueing, producing unrealistically short waits — you've removed a key driver of waiting.
6. 1180/6 = 196.7 ≈ 197 full pallets possible, minus scraps/leftovers/in-queue parts — exits count *pallets* (permanent batches), not parts. Check the balance fully.
7. TNOW must be in the same time unit as 480 (e.g., minutes since day start) and the run must span past 480 for the branch to ever fire — also ensure the model *starts* at a consistent clock origin.
8. A specific, plain-language decision recommendation, backed by scenario numbers with confidence intervals, tied to stated assumptions — something a stakeholder can act on.

</details>

---

## Scoring

| Block | /10 |
|-------|-----|
| A Expressions | |
| B Statistics | |
| C V&V | |
| D Scenarios | |
| **Total** | **/40** |

**Next:** [practice-problems.md](practice-problems.md) · [← quiz-basics](quiz-basics.md)

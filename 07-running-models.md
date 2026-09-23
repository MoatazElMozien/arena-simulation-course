# Lesson 7 — Running Models & Statistics

**Est. time:** 1.5 h · **Prerequisites:** [Lesson 6](06-expressions-logic.md)

## 🎯 Objectives

By the end of this lesson you will be able to:

- Configure `Run → Properties`: replications, run length, warm-up, random seeds.
- Explain why multiple replications + confidence intervals beat one long run.
- Read Arena's standard reports: Entity, Resource, Queue, Tally.
- Set up scenario comparison (what-if analysis).
- Use PivotTable/standard reports and Arena's charts appropriately.
- Avoid the classic statistical mistakes (bad warm-up, wrong denominators, cherry-picked runs).

---

## 7.1 Run → Properties (the control room)

`Run → Properties → Simulation` tab (names vary slightly by version):

| Setting | What it does | Guidance |
|---------|--------------|----------|
| **Time Units** | the model's clock unit | pick minutes (or hours) and stick to it everywhere |
| **Replications** | how many independent runs | start with **10–30**; more = tighter CIs |
| **Replication Length** | simulated time per run | long enough to reach steady behavior (e.g., 480 min = 1 day, 30 days = a month) |
| **Warm-up Period** | initial data discarded per replication | ≈ time to fill queues from empty (often 10–30% of run length) |
| **Random Number Streams** | seed control | leave default for independent reps; *set a fixed seed* only when reproducing a bug |
| **Batching** | groups of reps pooled | advanced; skip for now |

### Why warm-up matters (a picture)

Queue length over one run starting empty:

```
Queue
  │                    ╭────── steady state (the part you want)
  │              ╭─────╯
  │         ╭────╯
  │     ╭───╯
  │─────╯  ← transient: system "fills up", stats biased low
  └──────────────────────────────── time
   ▲ warm-up region = DISCARD this
```

If you don't discard the fill-up period, your averages look **optimistic**
(shorter waits than reality).

---

## 7.2 Replications & confidence intervals — the core idea

**One long run** reuses one realization of randomness — luck-dependent.
**Many independent replications** each start fresh with different random draws,
giving a *sample* of possible outcomes → a **confidence interval (CI)**:

```
Average waiting time = 11.9 min   95% CI: (10.8, 13.0)
```

You can now say: *"We're 95% confident the true mean wait is between 10.8 and
13.0 minutes under these assumptions."*

### Rules of thumb

| Situation | Replications |
|-----------|--------------|
| Quick sanity run | 5 |
| Course exercises / reports | 10–30 |
| Narrow CIs for a decision | 30–100+ (watch runtime) |

- **Run length** ≫ **warm-up** (e.g., warm-up 60, length 4800).
- For *terminating* models (a bank open 8 h), warm-up may be 0 *if* starting
  empty matches reality — think about it per model, don't cargo-cult.
- Check the **half-width** column in reports: if half-width ≈ mean, you need
  more replications.

### Independent vs terminating

| Type | Example | Setup |
|------|---------|-------|
| **Terminating** | daily shop, batch of 500 parts | run length = natural end; warm-up = start-up effects only |
| **Steady-state** | 24/7 continuous factory | long run + meaningful warm-up (use output analysis tools) |

---

## 7.3 Reading Arena's reports

After a run, Arena opens a report workbook. You mainly need 4 sheets:

### a) Entity Report

| Entity | Number In | Number Out | WIP Avg/Max | Time in WIP Avg/Max | Time/Entity |
|--------|-----------|------------|-------------|---------------------|-------------|

**Use for:** throughput, cycle time (flow time), WIP. *Check `In ≈ Out`* — a big
gap means entities are stuck (or still queued at run end; that's normal-ish).

### b) Resource Report

| Resource | Capacity | Scheduled Util % | Busy % | Failed % | Cost |

**Use for:** utilization, cost. Remember **Busy% is of *scheduled* time** —
compare with Scheduled Util% to detect schedule effects.

### c) Queue Report

| Queue | Waiting Count Avg/Max | Waiting Time Avg/Max | HDQ? |

**Use for:** customer experience (waits), sizing (count), bottleneck spotting.

### d) Tally / Record Report

Your custom Record-module statistics (counts, averages, distributions).

> 🔑 **Cross-check with Little's Law:** `Lq = λ × Wq`.
> If queue length and wait time in the report disagree with the arrival rate
> you intended, something's off. It's a free correctness check.

### Which statistics vs run length

- **Averages** stabilize quickly; **maxima** need long runs (max grows with time).
  Report max with care — a 1-day max ≠ 1-year max.
- Report **CI half-widths**, not just point estimates.

---

## 7.4 Scenario / what-if analysis

Comparing alternatives is the *point* of simulation:

**Method 1 — manual:** change a parameter (Expression module!), run, record
results, repeat. Keep a table:

| Scenario | Agents | Avg wait (95% CI) | Util% | Cost/day |
|----------|--------|-------------------|-------|----------|
| A | 3 | 18.4 (16.1–20.7) | 0.91 | $720 |
| B | 4 | 6.2 (5.4–7.0) | 0.68 | $960 |
| C | 5 | 3.1 (2.6–3.6) | 0.55 | $1,200 |

**Method 2 — Arena Scenarios:** *Tools → Scenario Manager* (or Run Setup
scenario variables) stores parameter sets; you switch/iterate and Arena appends
results — cleaner for many scenarios.

> ⚠️ **Use the same random number streams / seeds across scenarios when possible**
> (*common random numbers*) — it reduces noise so differences are more likely
> due to your change, not luck. (Arena supports stream assignment per replication.)

---

## 7.5 Visualization

Beyond the report workbook:

- **Run animation**: entities moving through the flowchart while running —
  invaluable for spotting logic errors *before* trusting numbers.
- **Charts/graphs**: `Results → ...` (or View → ... depending on version) —
  time-persistent plots (queue length over time) show trends averages hide.
- **PivotTable results**: drag `Time in WIP` vs `Hour` to see rush-hour effects.
- Consider exporting to Excel for presentation-ready charts.

**A chart you should always produce:** *queue length or WIP over time* — it
reveals instability (constant growth = ρ≥1, a bug or an overloaded design).

---

## 7.6 Build it: full experiment (follow along)

Using the bank model from Lesson 3/4:

1. `Run → Properties`:
   - Time Units: minutes
   - Replications: **30**
   - Replication Length: **4800** min (10 days)
   - Warm-up: **240** min
2. Parameterize staffing in an **Expression** module: `NUM_TELLERS`.
3. Run Scenario A (`NUM_TELLERS = 1`), record avg wait + CI + utilization.
4. Change to 2, run (Scenario B). Then 3 (C).
5. Build a comparison table like §7.4.
6. **Answer the business question:** *"How many tellers keep average wait under
   5 minutes at acceptable cost?"* — that sentence is the deliverable; the
   model is just how you earned it.

---

## 7.7 Statistical mistakes hall of fame

| Mistake | Why it hurts | Fix |
|---------|--------------|-----|
| 1 replication | results = luck | ≥10 reps, report CI |
| No warm-up | transient biases averages low | set warm-up; inspect time-series |
| Run too short | misses rare events / seasonal peaks | length ≫ key cycle (weeks if weekly seasonality) |
| Reporting only averages | hides worst-case pain | also report max + percentiles where possible |
| Comparing scenarios with different seeds & tiny sample | attributing noise to design | common random numbers, more reps |
| Half-width ≈ mean | estimate useless | more reps or reduce variance |

---

## 📝 Practice questions

1. What two things does *Warm-up Period* affect, and what bias results from omitting it in a steady-state model?
2. Why is a 95% CI better than a single number?
3. Report shows Resource Busy% = 0.60, Scheduled Util% = 0.90. Interpret.
4. Your queue-length-over-time chart climbs without bound. What's the diagnosis?
5. Bank model: arrivals `EXPO(10)` min, one teller, service `EXPO(8)` min.
   Predict utilization. (ρ = ?)
6. Terminating vs steady-state: a model of a warehouse operating 24/7 — which setup?

<details>
<summary><b>Answers (click to expand)</b></summary>

1. Warm-up discards the initial transient (fill-up) period; omitting it biases steady-state averages (typically optimistic — waits too short, utilization too low) because start-from-empty conditions are included.
2. It quantifies sampling uncertainty — showing the range plausibly containing the true mean and letting you judge whether a difference between scenarios is real or noise.
3. The resource is busy 60% of *all* time but 90% of its *scheduled on* time — it's off-shift ~1/3 of the clock; performance while open is near capacity.
4. Instability: arrival rate ≥ service capacity (ρ ≥ 1). Queue grows forever — increase capacity, reduce service time, or cap arrivals.
5. ρ = λ/μ = (1/10)/(1/8) = 0.8 → **80%**.
6. Steady-state (long run with warm-up) — it never "closes," so there's no natural terminating event.

</details>

## ✅ Checkpoint

- [ ] Ran 30 replications with warm-up and reported a CI.
- [ ] Built a 3-scenario comparison table.
- [ ] Explained Busy% vs Scheduled Util% discrepancy from real output.

---

**Previous ←** [Lesson 6](06-expressions-logic.md) · **Next →** [Lesson 8: Verification & Validation](08-verification-validation.md)

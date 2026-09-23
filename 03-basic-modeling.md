# Lesson 3 — Basic Modeling: Create → Process → Dispose

**Est. time:** 1.5 h · **Prerequisites:** [Lesson 2](02-arena-interface.md)

## 🎯 Objectives

By the end of this lesson you will be able to:

- Build the canonical three-module model from scratch.
- Choose between arrival types: interarrival time vs. schedule vs. expression.
- Configure the three Process action types: *Seize Delay Release*, *Delay Only*, *Sequence*.
- Select a delay (service time) distribution and justify it.
- Read basic statistics: WIP, queue length, resource utilization, flow time.
- Explain why randomness (distributions) matters more than averages.

---

## 3.1 The canonical model

Almost every Arena model is an elaboration of:

```
   ┌──────────┐      ┌──────────────┐      ┌──────────┐
   │  CREATE  │ ───▶ │   PROCESS    │ ───▶ │  DISPOSE │
   │ (arrivals)│     │ (queue+work) │      │  (exit)  │
   └──────────┘      └──────────────┘      └──────────┘
```

- **Create** = where entities are born (customers arrive, parts enter).
- **Process** = where they *do something* and usually need a resource.
- **Dispose** = where they leave the system (and statistics are tallied).

We'll build a **single-server bank teller**: customers arrive and are served by 1 teller.

---

## 3.2 The Create module — modeling arrivals

Double-click Create:

| Field | Typical setting | Meaning |
|-------|-----------------|---------|
| **Name** | `Arrivals` | meaningful name |
| **Entity Type** | `Part` / `Customer` | what's being created |
| **Leave Type** | *Interarrival Time* (default) | how the time between arrivals is defined |

### The three Leave Types

1. **Interarrival Time** — most common: "the time between arrivals is X."
2. **Expression** — arrival pattern depends on logic (e.g., peak hours).
3. **Schedule** — driven by a *Schedule* data module (varied arrival rates by hour — Lesson 4).

For interarrival time you set:

- **Time between arrivals**: a value + units + distribution.
  - `0.15 hours` → constant (bad — real arrivals aren't metronomic)
  - `EXPO(10) minutes` → exponential, mean 10 min ✅ common for random arrivals
  - `NORM(12, 3) minutes` → normal, mean 12, sd 3 (use if data says so)
- **Units**: seconds / minutes / hours / days — **be consistent across the model**.
- **Entities per arrival**: 1 (or a batch, e.g., 5 parts arriving on a pallet).
- **Max arrivals**: leave blank = ∞ (run forever); set `500` to create a fixed batch.

> 🔑 **Distributions, not constants.** Modeling service time as `5 minutes` exactly
> means every customer is identical — queues form far too predictably. Always ask:
> *"What does the data (or reality) say about the variation?"*

### Common arrival distributions

| Situation | Distribution | Example |
|-----------|-------------|---------|
| Random independent arrivals | `EXPO(mean)` | customers, calls |
| Fairly regular with noise | `NORM(mean, sd)` — truncate negatives if needed | scheduled deliveries |
| Known min/most-likely/max | `TRIA(min, mode, max)` | task durations |
| Time of day matters | Schedule data module | rush hours |

---

## 3.3 The Process module — queue + work

Double-click Process. Key field: **Action Type**.

| Action type | Use when | Seizes resource? |
|-------------|----------|------------------|
| **Seize Delay Release** *(default)* | Entity needs a server: grab it, work, free it | ✅ yes |
| **Delay Only** | Waiting/passage of time with *no* resource: walking, curing, aging | ❌ no |
| **Sequence** | Service follows a predefined *Sequence* per entity type | per sequence |

### Seize Delay Release in detail

```
   Resource(s):  [ Server ]   Capacity [ 1 ]   Units per entity [ 1 ]
   Delay Type:    ◉ Expression
   Delay:         [ TRIA(2,4,7) ]     Units [ minutes ]
```

What happens when an entity arrives:

1. **Seize** — request 1 unit of `Server`. If free → take it. If busy →
   the entity joins the **Queue** (ordered by the queue's ranking rule).
2. **Delay** — while holding the resource, wait `TRIA(2,4,7)` minutes (the work).
3. **Release** — give the resource back; next entity in queue seizes it.

### Choosing the delay distribution

- `CONSTANT(4)` — only if the process is truly machine-paced and exact.
- `EXPO(4)` — memoryless random work (rare for service, common for failure times).
- `TRIA(2,4,7)` — **great default when you know min/mode/max from experts**.
- `NORM(6,1)` — when data shows symmetric variation.
- `LOGN(...)` / `WEIB(...)` — long-tailed durations (fit from real data with Arena's **Input Analyzer**).

> 💡 **Input Analyzer** (Tools → Input Analyzer): give it a file of real data
> (or type numbers in) and it *fits* candidate distributions and gives you the
> expression to paste into Arena. Always prefer data-fitted distributions.

### Queues are attached to Process modules

Every Process that can't immediately serve has a queue. You don't place it
separately — but you can edit its behavior by double-clicking the **queue icon**
attached to the process (or via a Queue data module):

- **Ranking**: *First In First Out* (default), *Last In First Out*, *Lowest Attribute
  value first*, *Highest Attribute value first*, *Random*.
  → e.g., rank by `Priority` attribute so VIPs jump the line (Lesson 5).

---

## 3.4 The Dispose module

Minimal: just a name (e.g., `Exit`). It records:

- **Number Exiting** (count)
- Average **time in system** for entities that passed through

You can have multiple Disposes (`Exit-Completed`, `Exit-Rejected`) to compare paths.

---

## 3.5 Build it: the Bank Teller model (follow along)

**Scenario:** Customers arrive every ~10 minutes on average (random), a single
teller takes on average 8 minutes per customer (varying 5–12 min). Model the queue.

1. **New model.** `Run → Properties`: set *Time Units* to **Minutes**,
   *Replications* = **10**, *Replication Length* = **480 minutes** (one 8-hour day),
   set a **Warm-up period** of **60 minutes** (Lesson 7 explains why).
2. Drag **Create** → Name `Customer Arrivals`:
   - Entity Type: `Customer`
   - Leave Type: *Interarrival Time* → `EXPO(10)` , Units `minutes`
3. Drag **Process** → Name `Teller Service`:
   - Action: *Seize Delay Release*
   - Resource: add resource named `Teller`, Capacity `1`
   - Delay Type: *Expression* → `TRIA(5,8,12)` , Units `minutes`
4. Drag **Dispose** → Name `Departure`.
5. **Connect**: `Customer Arrivals → Teller Service → Departure`.
6. **Run** (▶). Let it finish; skim the report. Then re-run with **Step** a few times.

### Sanity check your intuition

Ask yourself before reading the report:

- Utilization should be **high**: ρ ≈ (8/10) = **80%**.
- Queue should exist but not explode (stable: ρ < 1).
- Average time in system ≈ wait + 8 min service.

If the report wildly disagrees, you misconfigured something — *that instinct is
verification* (Lesson 8).

---

## 3.6 Read your first report (survival guide)

After the run, Arena shows a **Report** workbook. The three views you need now:

### a) Queue

| Queue | Waiting Count (Avg / Max) | Waiting Time (Avg / Max) |
|-------|---------------------------|---------------------------|
| Teller Service.Queue | 1.4 / 5 | 11.2 / 43 |

*Average entities waiting, and average wait. Little's Law check: `Lq ≈ λ·Wq`
→ `1.4 ≈ (6/hr)(11.2 min = 0.187 hr) = 1.12` — roughly consistent ✔.*

### b) Resource

| Resource | Capacity | Scheduled Util % | Busy % |
|----------|----------|------------------|--------|
| Teller | 1 | 0.79 | 0.79 |

*~79% matches our predicted 80% — model behaves as theorized.* ✅

### c) Entity

| Entity | Number In | Number Out | WIP (Avg/Max) | Time in WIP |
|--------|-----------|------------|----------------|-------------|
| Customer | 412 | 409 | 3.7 / 14 | 21.8 min |

*Average time in system ≈ 21.8 min = ~14 min wait + ~8 min service.* ✅

> 🔑 **Always cross-check reports against hand calculations** (even rough ones).
> Agreement builds confidence; disagreement finds bugs.

---

## 3.7 Three classic modeling mistakes (and fixes)

| Mistake | Why it's wrong | Fix |
|---------|----------------|-----|
| Constant interarrival & service times (`10` and `8`) | No variability → unrealistically smooth flow, tiny queues | Use `EXPO`, `TRIA`, or fitted distributions |
| Units mismatch (arrivals in hours, service in minutes) | Time base chaos — 60× errors | Set *Run → Properties → Time Units*; type units explicitly in every delay |
| Forgetting to select a Resource | *Delay Only* by accident → model "works" with zero utilization | In Process dialog, verify the Resource row exists and capacity > 0 |

---

## 3.8 Exercises (do them in Arena)

1. **Modify:** change the teller capacity from 1 → 2. What happens to wait time
   and utilization? Record both numbers.
2. **Break it:** set service time to `EXPO(15)` (mean 15 > interarrival 10).
   Run it. What happens to the queue over time? Why? (This is *instability*: ρ>1.)
3. **Extend:** add a second Process `Payment` (delay only, `EXPO(2)` minutes, no
   resource) between service and dispose. How does total time in system change?
4. **Data-driven:** pick a real queue you stood in today. Estimate arrival rate,
   service time min/mode/max from memory. Build it. Does the predicted wait feel
   close to what you experienced?

More practice: [exercises/practice-problems.md](exercises/practice-problems.md)
and [exercises/quiz-modeling.md](exercises/quiz-modeling.md).

---

## 📝 Practice questions

1. Why is `CONSTANT(5)` a poor choice for human service time?
2. In the Process module, what do *Seize*, *Delay*, and *Release* each do?
3. Where is the queue in an Arena model? How do you change its ranking rule?
4. What does the *Dispose* module record?
5. Your report shows Resource Busy = 0.02. Give **two** possible causes.
6. ρ (utilization) = λ/μ for one server. With arrivals every 10 min and service
   mean 8 min, predict utilization before running.

<details>
<summary><b>Answers (click to expand)</b></summary>

1. Real service times vary; a constant eliminates variability, producing unrealistically short and predictable queues (variance is a primary driver of waiting).
2. Seize = acquire the resource (wait in queue if unavailable); Delay = perform the work while holding it; Release = free the resource for the next entity.
3. The queue is attached to each Process module that seizes a resource. Edit it by double-clicking the queue icon on the process (or via the Queue data module) and choosing the Ranking rule.
4. Count of entities exiting and their average time in the system.
5. Examples: resource capacity set too high (e.g., capacity 5 with light traffic); arrival rate very low; resource on a schedule where it's mostly off; entities failing before reaching it; wrong time units inflating interarrival times.
6. ρ = 10/8... careful: ρ = (1/10) ÷ (1/8) = 0.8 → **80%**.

</details>

## ✅ Checkpoint

- [ ] Built the bank teller model unaided in under 10 minutes.
- [ ] Predicted utilization/queue roughly right *before* reading the report.
- [ ] Explained to yourself why variability creates queues.

---

**Previous ←** [Lesson 2](02-arena-interface.md) · **Next →** [Lesson 4: Resources & Queues](04-resources-queues.md)

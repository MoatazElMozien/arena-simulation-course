# Lesson 6 — Expressions & Logic

**Est. time:** 1.5 h · **Prerequisites:** [Lesson 5](05-flow-control.md)

## 🎯 Objectives

By the end of this lesson you will be able to:

- Use Arena's built-in functions and distributions confidently.
- Distinguish entity attributes, entity types, global variables, and *variables per entity*.
- Write condition expressions for Decide modules and conditions.
- Reference resource and queue state dynamically in logic.
- Use **Sets** and **Expression** data modules for clean, configurable models.
- Apply common patterns: counters, timestamps, resource-dependent routing.

---

## 6.1 Anatomy of an Arena expression

An expression is any value Arena evaluates at run time:

```
TRIA(4, 6, 10)                    ← distribution draw
2 + 3 * WIP                       ← arithmetic (yes, * and + precedence applies)
TNOW >= 480                       ← boolean (used in Decide conditions)
Res(Teller).NumBusy               ← live resource state
VATime(Restaurant, Entity.Type)   ← structured reference
```

**Operators:** `+ - * /`, comparisons `== != < <= > >=`, logic `AND OR NOT`,
parentheses. Arena is **case-insensitive** for keywords but keep names consistent.

---

## 6.2 Built-in functions you'll use constantly

| Category | Functions |
|----------|-----------|
| **Distributions** | `EXPO(mean)`, `NORM(mean,sd)`, `TRIA(min,mode,max)`, `UNIFORM(a,b)`, `WEIB(scale,shape)`, `LOGN(mean,sd)`, `INT(x)` (floor), `RAND()` (0–1) |
| **Math** | `ABS(x)`, `MIN(a,b)`, `MAX(a,b)`, `MOD(x,y)`, `SQRT(x)`, `POW(x,y)`, `EXP(x)`, `LN(x)` |
| **Time** | `TNOW` (current sim time), `MCLOCK(...)` (calendar clock) |
| **Stats** | `WIP(module)`, `WIPR(...)`, `WIPC(...)`, `NumInQueue(module)` |
| **Logic** | `IF(cond, a, b)` (ternary-style) |

Examples:

```
TRIA(2, 3, 6)                         ← service time
MAX(1, INT(EXPO(3)))                  ← at least 1 of a Poisson-ish draw
TNOW > (8 * 60)                        ← after 8:00 if the clock starts at 00:00
```

> 💡 **Normalize your time base.** Pick minutes as the model's time unit
> (`Run → Properties → Time Units = Minutes`) and convert everything else to
> minutes. `8 hours → 480`. This kills a whole class of unit bugs.

---

## 6.3 Data kinds — the deep end (learn this once, save forever)

| Kind | Scope | Set by | Example |
|------|-------|--------|---------|
| **Entity Type** | a *class* of entities | Entity data module | `Patient`, `Part-A` |
| **Attribute** | one specific entity's data | Assign module | `Entity.ArrTime = TNOW` |
| **Variable (global)** | whole model, one value (or array) | Variable module + Assign | `TotalRevenue` |
| **Expression (named constant)** | compile-time constant/parameter | Expression module | `SERVICE_MEAN = 4.5` |
| **Set** | a named group of resources/stations/etc. | Set module | `ALL_SERVERS = {S1,S2,S3}` |
| **Schedule** | capacity over time | Schedule module | (Lesson 4) |

### Attributes vs per-entity variables — a subtle trap

- **Attributes** (via Assign): one value *per entity*. When entity 5 sets
  `ArrTime = TNOW`, entity 7's `ArrTime` is untouched. ✅ for personal timestamps.
- **Arena's standard attributes** (`ArrTime`, `NumInQueue`…) exist automatically:
  `Entity.ArrTime` is stamped at creation.

### Arrays (variables with indexes)

Variable module → check **Array**:

```
HourlyArrivals(12)   ← one counter per hour of the day
```

Assign: `HourlyArrivals(HourIndex) = HourlyArrivals(HourIndex) + 1`
where `HourIndex = INT(MOD(TNOW, 480) / 40) + 1` (or similar).

*Use arrays for* per-hour/per-machine/per-product stats.

---

## 6.4 Expression module — parameters in one place

Instead of hardcoding `TRIA(4,6,10)` in three modules, define once:

| Expression Name | Value |
|-----------------|-------|
| `SERVICE_MEAN` | `6` |
| `SERVICE_TRIA` | `TRIA(4,6,10)` |
| `NUM_TELLERS` | `2` |

Then any dialog just references `SERVICE_TRIA`.

**Why:** sensitivity testing ("what if service drops to 5 min?") becomes a
one-cell edit; no hunting through the flowchart. This is *good modeling hygiene*.

---

## 6.5 Referencing live system state in conditions

Decide/conditions can read the current state:

| Goal | Expression |
|------|-----------|
| Resource free? | `Res(Teller).NumBusy < Res(Teller).Capacity` |
| Queue long? | `Queue(TellerQ).NumInQueue >= 5` |
| Entity's own attribute | `Entity.PartsOnPallet >= 20` |
| Global variable | `WIP < MAX_WIP` |
| Time window | `TNOW >= 480 AND TNOW < 960` |
| First-time visitor? | `Entity.Visits == 0` |

**Common state attributes of `Res()`:** `NumBusy`, `NumJobsThisRes`, `Failed`.
**Of `Queue()`:** `NumInQueue`, `WtInQueue`, `ItemInQueue(n)`.

> ⚠️ These references evaluate **at the moment the entity reaches the Decide** —
> they are *snapshots*, not live subscriptions.

---

## 6.6 Sets — talk about groups

**Set module** defines a named collection:

| Set Name | Members |
|----------|---------|
| `Servers` | `S1, S2, S3` |

Uses:
- **Seize any from set** (Grab whichever server frees first — *Select* module,
  AdvancedProcess).
- **Station sets** for route/sequence groups.
- Reporting aggregate stats across members.

*Compare:* hardcoded resource lists are brittle; sets are edited in one table.

---

## 6.7 Patterns worth stealing

### Pattern A — stamp & measure

```
Create → Assign{ArrTime = TNOW} → [work] → Assign{Wait = TNOW - ArrTime} → Record(Wait) → Dispose
```

**Record** module (BasicProcess) tallies custom stats (Tally/Count) you can
report beyond Arena's defaults.

### Pattern B — bounded WIP (stop feeding a saturated line)

Decide before entering: `WIP < WIP_LIMIT` → else route to a holding area /
dispose as *turned away*. Models pull systems (Kanban-style).

### Pattern C — one shared resource, ranked queue by dynamic priority

Assign computes `Priority = Urgency + (TNOW - ArrTime)/10` so waiting time
itself boosts priority (anti-starvation).

### Pattern D — cost accumulation

Assign `TotalCost = TotalCost + ServerCost*ServiceMinutes` or use the Resource
cost fields + Record for cost/time reports.

---

## 6.8 Debugging expressions

| Symptom | Fix |
|---------|-----|
| Expression field turns **red** / won't accept | syntax error — check parens, commas, missing operators |
| "Variable not defined" | define it in a **Variable** module first (Assign can't invent globals) |
| Value always 0/never true | wrong time units, or comparing `=` (assign) vs `==` (compare) |
| Attribute is blank downstream | it was set on a *different* entity (attributes don't propagate through Batch merges) |
| Works once, then weird | you overwrote a global instead of using a per-entity attribute |

**Golden debug trick:** put a **Record** module (Count/Tally) after suspicious
branches so you can *see* how many entities took each path.

---

## 6.9 Exercise: parameterized call center

Build a call center where **every timing value lives in one Expression table**:

| Expression | Value |
|------------|-------|
| `INTERARRIVAL` | `EXPO(2)` |
| `HANDLE_TIME` | `TRIA(2,5,12)` |
| `ABANDON_RATE` | `0.10` |
| `AGENTS` | `4` |

Flow: `Create(INTERARRIVAL)` → `Decide(Chance: ABANDON_RATE*100 → Drop)` /
continue → `Process(Agents, HANDLE_TIME)` → `Dispose`.

Then: change `AGENTS` to 3 and 5 (edit **only** the Expression table) and
compare average waits. Notice how fast scenario testing became?

---

## 📝 Practice questions

1. Evaluate: `INT(TRIA(2, 5, 9))` — what type of value results?
2. What's the difference between `NORM(10,2)` used in two modules and a
   Variable holding `10`? When would each be right?
3. Write a condition: "route to Express lane if the order has ≤ 5 items AND the
   customer is loyal."
4. Why prefer an **Expression** module over typing `TRIA(4,6,10)` everywhere?
5. `WIP` is a Variable updated by Assigns on entities. Why might it drift from
   the true count? What built-in alternative exists?
6. Convert: a machine runs 8 h/day, 5 days/week → what's `MOD`-style helper to
   find "hour of day" if TNOW counts minutes continuously? (Sketch the expression.)

<details>
<summary><b>Answers (click to expand)</b></summary>

1. An integer (whole number) — `INT` truncates/floors the draw. (e.g., draw 5.7 → 5.)
2. `NORM(10,2)` draws an independent random value per call (each entity gets its own sample); a Variable stores one fixed number used identically everywhere. Use the distribution for *per-entity randomness*; use a variable/constant for *shared parameters* (like a mean you want to tweak in one place).
3. `OrderQty <= 5 AND IsLoyal == 1`
4. Centralized, self-documenting parameters; scenario/sensitivity changes are one edit with no risk of missing a copy.
5. If entities set it with `= WIP+1`/`-1` and any path skips an update (dispose, rework loop, crashes/aborts), it drifts. Built-in: `WIP(module)` / Arena's automatic WIP tracking.
6. Hour of day = `INT(MOD(TNOW, 480) / 60) + 1` if modeling only the 8 working hours; with continuous minutes use `MOD(TNOW, 1440)` then `/60`.

</details>

## ✅ Checkpoint

- [ ] Moved all timing constants into an Expression table.
- [ ] Wrote a compound Decide condition with AND/OR correctly.
- [ ] Explained attributes vs variables without notes.

---

**Previous ←** [Lesson 5](05-flow-control.md) · **Next →** [Lesson 7: Running Models & Statistics](07-running-models.md)

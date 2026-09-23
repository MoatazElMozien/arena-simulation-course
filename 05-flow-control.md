# Lesson 5 — Flow Control: Decide, Batch, Assign, Route, Sequence

**Est. time:** 1.5 h · **Prerequisites:** [Lesson 4](04-resources-queues.md)

## 🎯 Objectives

By the end of this lesson you will be able to:

- Branch flow with **Decide** (2-way, N-way, condition, chance).
- Change entity data with **Assign**.
- Group entities with **Batch** (and split them again).
- Send entities between distant locations with **Station + Route**.
- Model ordered multi-step journeys with **Sequence**.

---

## 5.1 Decide — the fork in the road

The Decide module has **two shapes**:

### a) 2-way Decide (one question, two exits)

```
            ┌──▶ True ──▶ [Rework]
   [Decide]─┤
            └──▶ False ─▶ [Exit]
```

**Types:**

| Type | Example expression | Meaning |
|------|--------------------|---------|
| **Condition** | `Entity.Type == "Bad"` | logical test |
| **N-way by Condition** | (multiple rows) | first true wins |
| **Chance** | Percent `15` | random split: 15% True |

*Chance example:* with probability **0.15** a part fails inspection → True branch
to Rework, False branch to shipping. Each entity gets an independent coin flip.

### b) N-way Decide (many branches)

One module, several exits — each exit has a condition; Arena evaluates **top to
bottom**, first true exit wins; optionally a final *else* catch-all.

```
  if   Priority == 1  → exit 1 (Express)
  elif Priority == 2  → exit 2 (Normal)
  else                → exit 3 (Bulk)
```

> ⚠️ **Order matters.** Put specific conditions before general ones. If you test
> `Time > 8` before `Time > 12`, the 12 branch is unreachable.

### Common condition expressions

| Test | Syntax example |
|------|----------------|
| Compare attribute | `OrderQty < 20` |
| Time of day | `TNOW >= 480` (minutes since start) |
| Random with pattern | `UNIFORM(0,1) < 0.1` (same as Chance 10%) |
| Resource state | `Res(Teller).NumBusy == 0` |
| Queue length | `Queue(TellerQ).NumInQueue > 5` |
| Entity type | `Entity.Type == "Rush"` |

---

## 5.2 Assign — change data mid-flow

Assign modifies **variables** and **attributes**. It has 1–N assignment rows:

| Assignment | Type | Example |
|------------|------|---------|
| `TimeEntered` | *Attribute* | `TNOW` — stamp when the entity arrived |
| `Priority` | *Attribute* | `2` |
| `WIP` | *Variable* | `WIP + 1` (global counter) |
| `ReworkCount` | *Attribute* | `ReworkCount + 1` |

**Typical placements:**

- Right after **Create**: stamp arrival time → later compute `TNOW - TimeEntered`.
- Before a Process: set queue priority.
- After a Process: accumulate cost/counters.

**Attribute vs Variable (memorize):**

- **Attribute** = belongs to *one* entity (its color, its priority). Persists as it flows.
- **Variable** = *global* memory shared by everyone (today's revenue, total produced).

---

## 5.3 Batch — grouping entities

**Batch** collects *N* entities into one (e.g., 5 screws into a box, 4 guests → 1 table).

| Setting | Meaning |
|---------|---------|
| **Batch Type** | *Wait for* N entities (classic) / *Batch* by set membership |
| Batch Size | `5` |
| **Permanent Batch?** | ✅ Yes → the group acts as one entity downstream |
|         | ❌ No → group passes through (e.g., for inspection together), then **separates** automatically |
| **Set** | which entity types may batch together (all parts? matched pairs?) |

**Seize-If-All-Modeled rule:** entities wait in the batch queue until N are present.
Model the *underflow* case (what if only 3 ever show up before closing?) —
often via a Decide timer or a "flush after X minutes" pattern using **Hold**
(AdvancedProcess) with *Wait for N or Timeout*.

**Unbatch** — the opposite: split a permanent batch back into individual entities
(also a Batch module with different settings / the Unbatch action).

---

## 5.4 Station, Route & Assign — moving between areas

For models with **distinct physical locations** (departments, floors, buildings),
you use *stations*:

| Module | Role |
|--------|------|
| **Station** | Names a location. Entities "are here." Place one per area (`Warehouse`, `Dock3`). |
| **Route** | Sends an entity to another station, taking **travel time** (`TRIA(1,2,4)` min). |
| **Assign (Station)** | Teleport instantly (travel time = 0) — use when travel is negligible. |
| **Sequence** | Predefined ordered list of stations an entity must visit (next section). |

Flow:

```
[Process/Pick] → [Route to Station "Dock3", time EXPO(2)] → ... → (arrives at) [Station Dock3] → [Process/Unload]
```

> 💡 **Rule of thumb:** if travel time matters to your question → **Route**.
> If only the *order of visits* matters → **Sequence**. If neither → plain connections.

---

## 5.5 Sequence — the journey passport

A **Sequence** data module defines an ordered itinerary:

| Step | Station | Delay type/time (optional) |
|------|---------|---------------------------|
| 1 | `Saw` | 3 min |
| 2 | `Mill` | 5 min |
| 3 | `Inspect` | 2 min |

**How to use:**

1. Create the Sequence data table with ordered stations.
2. On the **Entity** data module, set `Routing Sequence = MySeq`
   (per entity type — different products take different routes).
3. Modules use *Action Type: Sequence* / **Station** + conveyance logic to walk
   the list; each entity tracks `Entity.SequenceStep`.

**Why it's powerful:** the same *Process* module can serve step 1 for all parts;
the sequence data — not the flowchart — defines who goes where next. Adding a
new product route = editing a data table, **not** redrawing the model.

---

## 5.6 Build it: QA Inspection line (follow along)

**Scenario:** Parts arrive `EXPO(3)` min. At inspection (`TRIA(1,2,4)` min, 1
inspector), 20% fail. Failed parts get reworked (max 2 attempts), then are
scrapped if they fail again. Passed parts proceed to packing (`Delay Only`,
`EXPO(4)` min) then exit.

Modules:

```
Create ──▶ Assign(Set TimeIn) ──▶ Process(Inspect, res=Inspector)
                                        │
                                   Decide(Chance 20%) ──True──▶ Assign(Fail+1)
                                        │                            │
                                       False                    Decide(Condition: FailCount >= 2?)
                                        │                         │        │
                                        │                       True     False
                                        │                        │        │
                                        ▼                        ▼        ▼
                                  Process(Pack)               Dispose(Scrap)  [route back to Inspect]
                                        │
                                   Dispose(Ship)
```

**Steps:**

1. **Create** `PartsIn` — `EXPO(3)` minutes.
2. **Assign** `Init` — `FailCount = 0`, `TimeIn = TNOW`.
3. **Process** `Inspect` — Seize Delay Release, Resource `Inspector` (cap 1),
   Delay `TRIA(1,2,4)`.
4. **Decide** `Pass?` — **Chance**, Percent **80** (False = passed, True = failed
   → *be explicit about which exit is which!*).
5. **Assign** `Count Failure` — `FailCount = FailCount + 1`.
6. **Decide** `Scrapped?` — **Condition**: `FailCount >= 2`.
   - True → **Dispose** `Scrap`.
   - False → **connect back** to `Inspect` (the loop!).
7. True (passed) path → **Process** `Pack` — *Delay Only*, `EXPO(4)` minutes.
8. **Dispose** `Ship`.
9. Run 10 replications × 480 min.

**Verify before reading reports:**

- ~20% of parts rework; ~4% (20%²) end up scrapped → check `Scrap` count ≈ 4% of input.
- Inspector utilization should be moderate-high (inspect ~2.25 min of a 3-min arrival rate ≈ 75%).

*Loops (routing back) are legal and extremely common — this is how rework,
retries, and recursive flows are modeled.*

---

## 5.7 Flow-control cheat sheet

| I want to… | Use |
|-----------|-----|
| Random 15% branch | Decide → Chance |
| "If X then A else B" | Decide → Condition (2-way) |
| Multi-level if/elif/else | Decide → N-way Condition |
| Store info on an entity | Assign → Attribute |
| Count/track global totals | Assign → Variable |
| Group 5 units into 1 | Batch (permanent) |
| Pass a group through then split | Batch (non-permanent) |
| Move between named areas w/ travel time | Station + Route |
| Fixed multi-stop itinerary | Sequence + Entity routing sequence |
| Send back for rework | Connect backward (loop) |

---

## 📝 Practice questions

1. An N-way Decide has conditions in this order: `Qty > 10`, `Qty > 5`, `else`.
   Where does `Qty = 7` go? What's wrong with this ordering?
2. What's the difference between an *attribute* and a *variable*? Give an example of each in a hospital model.
3. Batch size 4, Permanent ✅ — what does the next module see: 1 entity or 4?
4. Same question if Permanent is ❌.
5. When should you use **Route** instead of a plain connection?
6. A model needs 3 different product routes. Should you build 3 flowchart branches or use Sequences? Why?

<details>
<summary><b>Answers (click to expand)</b></summary>

1. It exits on `Qty > 5` (first true match). Nothing is *wrong* per se since 7>5 but not >10 — however if the intent was "10+ first," ordering is fine; the classic bug is placing a broad condition (`Qty > 5`) before a narrower one meant to catch a subset (`Qty > 10` with special handling), making the narrow one unreachable.
2. Attribute = per-entity data (Patient.TriageLevel); Variable = global shared data (Hospital.TotalAdmissions, WIP).
3. One entity — the batch acts as a single unit downstream (attribute operations apply to the group).
4. Four separate entities emerge after the batch passes through (it reverts automatically).
5. When there's meaningful travel time between distinct locations/stations — a plain connection implies instantaneous movement.
6. Use **Sequences** (data) — adding/changing a route is a table edit, models stay smaller, and the same modules serve all products.

</details>

## ✅ Checkpoint

- [ ] Built the QA inspection loop with rework and scrap paths.
- [ ] Used Batch to group entities and observed the difference permanent vs non-permanent makes.
- [ ] Can name the right module for each row in the cheat sheet without looking.

---

**Previous ←** [Lesson 4](04-resources-queues.md) · **Next →** [Lesson 6: Expressions & Logic](06-expressions-logic.md)

# Lesson 4 — Resources & Queues

**Est. time:** 1.5 h · **Prerequisites:** [Lesson 3](03-basic-modeling.md)

## 🎯 Objectives

By the end of this lesson you will be able to:

- Configure resources: capacity, cost, failure/repair.
- Build daily **schedules** and **calendars/shifts** (open/close, lunch breaks).
- Set **Multiple Resource** capacities (e.g., 3 tellers, one shared team).
- Control queue **ranking** so important entities wait less.
- Model priorities, and understand **preemption** (interrupting busy servers).
- Choose between per-process capacity and a shared resource across processes.

---

## 4.1 The Resource data module

When you name a resource in a Process dialog, Arena creates a **Resource** data
module (double-click it in the Project Bar → BasicProcess → Resource):

| Column | Meaning |
|--------|---------|
| **Resource** | name (e.g., `Nurse`) |
| **Initial Capacity** | units available at time 0 (default 1) |
| **Schedule Name** | which schedule governs availability (blank = always available) |
| **Failed Resource Repair Name** | breakdown/repair pattern (Failures… button) |
| **Costs** | Waiting Cost / Hard/Server cost per hour — feeds cost reports |

**Capacity = number of identical parallel servers.** Capacity 3 means 3 entities
can be in *Delay* simultaneously; a 4th queues.

> 🔑 **Seize vs capacity:** each Process specifies *Units per Entity*. With
> capacity 3 and units-per-entity 1 → 3 concurrent jobs. Units per entity 2
> (e.g., 2 hands/2 forklifts) → only 1 concurrent job.

### Multiple Resource (a team with sub-capacities)

For "1 doctor + 2 nurses must all be present," use **Multiple Resources**
(AdvancedProcess or the Advanced tab): entities must seize *one unit of each*
named resource in the set. Great for OR teams, trucks + drivers, machines + operators.

---

## 4.2 Schedules & Calendars — the model has a clock

Real systems open, close, and take lunch. Arena models this with two data modules:

### Schedule (repeating pattern)

| Field | Example |
|-------|---------|
| Schedule Name | `CounterHours` |
| Capacity/Rate | *Capacity* (or *Rate* for fractional availability) |
| Units on schedule | `1` |
| **Value 1 / Duration 1** | `1` for `8` hours (open) |
| **Value 2 / Duration 2** | `0` for `16` hours (closed) |
| Repetition | `Yes` (repeats daily) |

→ This example = 8 hours open, 16 closed, repeating — a shop.

### Calendar (absolute dates)

Same table but with **calendar dates** — use when availability isn't a simple
daily repeat (holidays, seasonal staff, one-off events).

### Rate vs Capacity

- **Capacity**: whole units (integer servers appear/disappear).
- **Rate**: fractional (e.g., `0.5` = half-speed worker).

> ⚠️ **When capacity drops to 0 while entities are mid-service:** Arena lets the
> in-progress entity *finish* (default). Entities already waiting remain queued
> until capacity returns. Model closing time: customers already being served
> finish; new arrivals leave (see the `Max Buffer`/balking setup below).

### Assign a schedule to a resource

Resource module → **Schedule Name** = `CounterHours`.
Check availability visually: while running, the resource shows scheduled
utilization vs. busy % (busy% of *scheduled* time is the fair metric).

---

## 4.3 Modeling open/close properly (worked mini-example)

**Problem:** A clinic is open 08:00–16:00. Patients arrive `EXPO(6)` min during
open hours only. Model it.

**Option A — schedule the resource** (queue may carry over to next day; usually fine).

**Option B — schedule the arrivals** (cleaner for daily systems):

1. **Schedule** data module: Name `ClinicHours`, *Capacity* type, Value `1`
   for `480` minutes, Value `0` for `960` minutes, repeat daily.
2. Create module → **Leave Type: Schedule** → Schedule Name `ClinicHours`,
   Interarrival `EXPO(6)` minutes (only counted while schedule = 1).
3. At end of day, decide what happens to leftovers:
   - Let them finish → run length includes cleanup, or
   - Set `Run → Properties` run length = 480 and accept truncation, or
   - Add a Decide "Is it past 16:00?" → Dispose as *LeftOver*.

---

## 4.4 Queue design — the waiting line is a feature, not an accident

Double-click the **queue icon** on a Process (or open the Queue data module):

| Setting | Options | Use |
|---------|---------|-----|
| **Ranking** | FIFO *(default)*, LIFO, *Highest/ Lowest Attribute Value First*, Random, Scheduled | priorities |
| **Max Items** | ∞ or N | capacity limit of the line |
| **Balking / Reject** | leave when line too long | model customers who give up |

### Priority example (VIPs wait less)

1. Add an **Assign** module *before* the process:
   `Attribute PriorityLevel = 1` for VIPs (you'll learn Assign fully in Lesson 5).
2. Process → Queue → Ranking: **Lowest Attribute Value First** (1 = most important).

### Head-of-line logic with subsets

For "express lane if ≤ 3 items," use two processes with different resources or
**Advanced Decide (Condition)** on an attribute — see Lesson 5.

> 🔑 **Ranking changes only *who's next*, not capacity.** Priority never lets an
> entity skip the *service* step, only the *queue* order.

---

## 4.5 Preemption — a server gets pulled away

**Preemption** = an in-service entity is interrupted so the resource can do
something else (a nurse leaves a routine task for a code blue).

Configure in the Process dialog (advanced versions expose *Preempt/Resume*):

- **Preempt Type**: *Interrupt* (pause the current job) and whether it
  **resumes** later (restarting the remaining delay) or restarts.

Use sparingly — preemption models are hard to verify. Most models simply use
priorities instead.

---

## 4.6 Where should the resource capacity live?

| Approach | How | When |
|----------|-----|------|
| **Per-process capacity** | Set Capacity directly in the Process dialog | Single, dedicated resource |
| **Shared Resource data module** | Define once in Resource module; reference by name in several Processes | ⭐ Same server used by multiple steps (e.g., one lab serving 3 departments) |

**Shared example:** `Lab` resource (capacity 2) referenced by Process `BloodTest`
and Process `XRayPrep`. Both processes draw from the *same* pool — utilization
reports aggregate automatically.

---

## 4.7 Build it: Bank with 2 tellers, lunch break, VIP priority

**Scenario:** Customers arrive `EXPO(7)` min. Two tellers, service `TRIA(4,6,10)`
min. Tellers take lunch 12:00–12:30 (both, staggered is a variant). 20% of
customers are VIPs (priority). Model 8 hours.

1. **Create** `Arrivals`: `EXPO(7)` minutes, entity `Customer`.
2. **Assign** `Set Priority` — assign `IsVIP = 1` with probability 0.2,
   else `0` *(preview of Lesson 5; alternatively use a Decide + two Assigns)*.
3. **Process** `Teller Service`:
   - Resource `Teller`, **Initial Capacity = 2**
   - Delay `TRIA(4,6,10)` minutes
   - Queue ranking: **Lowest Attribute Value First** on `IsVIP`
     *(VIP = 0/1 → hmm, 0 would win; instead set VIP=1 normal, 2 VIP, rank LOWEST first —
     adjust values so smaller = more important, or use Highest with 1=VIP)*
4. **Schedule** `Lunch`: Value `2` for `0` min? No — see note below.
5. **Resource** `Teller`: Schedule Name blank normally; to model lunch, create
   **Schedule** `TellerDay`: Value `2` for `240` min, Value `1` for `30` min,
   Value `2` for `210` min, repeat daily. Assign to resource.
6. **Dispose** `Departure`.
7. Run: **Replications 10**, length **480 min**, warm-up **30 min**.

**Check:** utilization ≈ (6 min × λ)/2 tellers ≈ ~43% before lunch; VIPs should
show shorter average waiting time than non-VIPs in the report.

*(If you notice integer scheduling awkwardness — real scheduling tools use the
Schedule/Shift modules together; Shift handles time-of-day windows cleanly.)*

---

## 4.8 Common resource mistakes

| Symptom in report | Likely cause |
|-------------------|--------------|
| Utilization > 100% impossible, queue grows forever | capacity too low for arrival rate (ρ ≥ 1) — add capacity or cut service time |
| Utilization ≈ 0 with long queues elsewhere | entities never reach the resource: check connections & conditions |
| Utilization looks "too low" | denominator includes closed hours → compare **Busy%** vs **Scheduled Util%** |
| Two processes each think they own separate servers | you created two resources with similar names — one shared Resource module needed |

---

## 📝 Practice questions

1. Resource capacity = 3 and Units Per Entity = 2: how many entities can be in
   service simultaneously?
2. Difference between a **Schedule** and a **Calendar**?
3. What happens to an entity mid-service when its resource's schedule drops to 0?
4. How do you make a VIP queue-jumper? Which queue setting, and which attribute?
5. When would you use a *shared* Resource module instead of capacity in the Process dialog?
6. Define *preemption* and one risk of modeling it.

<details>
<summary><b>Answers (click to expand)</b></summary>

1. One — it needs 2 of the 3 units, and a second such entity would need 2 more (only 1 left), so only 1 runs.
2. A Schedule repeats a pattern (e.g., daily 8-on/16-off); a Calendar specifies availability by absolute dates (holidays, one-off staffing).
3. Default: the in-service entity completes its delay; waiting entities stay queued until capacity returns.
4. Store a priority attribute (e.g., IsVIP) on each entity, set the process queue **Ranking** to *Highest/Lowest Attribute Value First* so VIPs sort to the head.
5. When the same physical server serves multiple processes/steps — define it once so all draw from one capacity pool and utilization aggregates.
6. Preemption = interrupting an entity that is currently using a resource so the resource can serve something else; risk = complex, hard-to-verify resume/restart logic.

</details>

## ✅ Checkpoint

- [ ] Modeled a lunch break with a schedule.
- [ ] Made VIPs wait less using queue ranking.
- [ ] Explained Busy% vs Scheduled Util% to yourself.

---

**Previous ←** [Lesson 3](03-basic-modeling.md) · **Next →** [Lesson 5: Flow Control](05-flow-control.md)

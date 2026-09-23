# Lesson 9 — Case Study Projects

**Est. time:** 3–4 h · **Prerequisites:** [Lessons 1–8](README.md)

## 🎯 Objectives

By the end of this lesson you will be able to:

- Build three complete models **from a written problem statement alone**.
- Practice the full lifecycle: sketch → build → verify → run → recommend.
- Handle progressively harder features: multi-server queues, schedules,
  multiple resource types, routing with stations, batching, and rework loops.
- Produce a results table and a **recommendation** — the real deliverable.

Each project has: **Problem → Hints → Build steps (sketch first!) → Verification
tasks → Questions to answer.** Try each one *before* reading the hints.

---

# Project 1 — Coffee Shop (★☆☆ beginner)

## Problem statement

A campus coffee shop has **1 espresso machine** operated by **1 barista**.

- Customers arrive: `EXPO(3)` minutes during the 8-hour day (open 480 min).
- Orders: 20% are simple (service `TRIA(1,2,3)` min), 80% complex
  (`TRIA(3,5,8)` min) — *barista knows after starting.*
- 10% of customers abandon if the queue exceeds 6 people (they leave before
  being served).
- Management question: **would a second barista (sharing the machine, service
  times ×0.95 due to teamwork) cut average wait below 4 minutes?**

## Suggested sketch

```
Create → [Decide: queue > 6? → leave] → Decide(Chance 20% → Simple / Complex)
   → Process(Service, 1 barista) → Dispose
```

## Hints

- Queue length check: use a **Decide (Condition)** with
  `Queue(EspressoQueue).NumInQueue > 6` *before* entering service.
- Simple vs complex: **Decide (Chance 20%)** → two Process modules (or one
  Process with conditional delay — two processes is easier to read).
- Scenario B: change capacity to 2 (Expression module: `BARISTAS`).
- 20%/80% → Chance percent = 20 on one exit; the other exit gets the rest.

## Verification tasks

1. Extreme test: set service to `0.01` → waits ≈ 0.
2. Balance: created = disposed + final WIP.
3. Predict utilization first: avg service ≈ 0.2(2)+0.8(5.3) ≈ 4.64 min;
   λ = 1/3 per min ⇒ ρ ≈ 4.64/3 ≈ **>1** — with 1 barista this system is
   **unstable!** Does your queue grow without bound? (It should — that's the
   finding, not a bug.) With 2 baristas ρ ≈ 0.77 — stable.

## Questions to answer

| Question | Scenario A (1 barista) | Scenario B (2) |
|----------|------------------------|----------------|
| Avg wait in queue | | |
| 95% CI | | |
| Barista utilization | | |
| % waited > 4 min (if computable) | | |
| **Recommendation** | | |

---

# Project 2 — Urgent Care Clinic (★★☆ intermediate)

## Problem statement

An urgent care clinic operates **08:00–20:00** (720 min/day).

- Patients arrive: rate varies by hour — 4/hr in the morning, 10/hr midday
  (10:00–16:00), 6/hr evening. Use a **Schedule-driven Create** (or
  time-dependent `EXPO` via N-way Decide on `MOD(TNOW,720)`).
- **Triage**: 1 nurse, `TRIA(2,3,6)` min. Every patient passes through.
- After triage: 15% need **X-ray** (machine capacity 1, `TRIA(6,9,14)` min),
  85% go straight to a **doctor**.
- **Doctors**: 2 of them, consultation `TRIA(10,15,25)` min. X-ray patients
  also see a doctor *after* X-ray.
- Nurse works straight through; doctors take a 30-min break at t=360
  (schedule with interruption).
- Question: **where is the bottleneck, and would a 3rd doctor help more than
  speeding up X-ray by 20%?**

## Suggested sketch

```
Create(schedule arrivals) → Process(Triage, Nurse)
   → Decide(Chance 15%) → True: Process(XRay) → Process(Doctor)
                          False: ─────────────→ Process(Doctor)
   → Dispose
```

*(Use one shared Doctor resource referenced by two Process modules, or a single
Doctor process that both branches merge into — the merged single process is simpler.)*

## Hints

- **Arrival schedule:** Schedule module `ArrivalRate` isn't directly an
  interarrival expression — easiest robust approach: Create with
  *Leave Type: Expression* = `EXPO(60/RateNow)` where `RateNow` is a variable
  updated by time (N-way Decide + Assign by hour), **or** model 3 time blocks
  with an N-way Decide right after Create routing based on
  `MOD(TNOW, 720)` to 3 different Create-fed paths… Simplest reliable trick for
  learners: *single Create with `EXPO(60/6)` base plus Assign-scaled thinning* is
  too advanced — instead use **Leave Type: Schedule** pointing at a Schedule
  data module listing hourly rates (Arena schedules support rate tables).
- **Doctor break:** create a Schedule where capacity is 2 except 30 min at 1 → 1
  or 0; assign to the Doctor resource. Default: in-service consults finish.
  Model "break" semantics explicitly if the question requires it.
- **Bottleneck evidence:** compare Busy% of Nurse / XRay machine / Doctors.

## Verification tasks

1. Trace one X-ray patient by hand through all three stations.
2. Extreme test: X-ray probability → 0% ⇒ X-ray machine utilization must be 0.
3. Balance: all patients who entered left (clinic empties by end of day + cleanup).
4. Check arrivals/hour actually match the intended profile (count entities per hour with a Record + array variable).

## Questions to answer

1. Which resource has the highest utilization? (bottleneck evidence)
2. Scenario comparison table: Base vs +1 doctor vs X-ray −20% service time:
   avg total time in clinic (95% CI), utilization per resource.
3. **Write a 3-sentence recommendation** to the clinic manager.

---

# Project 3 — Mini Factory with Rework & Batching (★★★ advanced)

## Problem statement

A small plant produces widgets in continuous operation (24/7):

- **Parts** arrive to Assembly every `TRIA(2,3,5)` min (in batches of arrivals —
  single parts).
- **Assembly**: 2 assemblers, `TRIA(5,7,11)` min.
- After assembly, **inspection**: 1 inspector, `TRIA(1,2,4)` min.
  - **12% fail.** Failed parts are reworked at a *Rework* station
    (1 operator, `TRIA(6,10,15)` min) and then **re-inspected**.
  - Parts that fail inspection **3 times** are scrapped.
- Passing parts move via **Route** (travel `EXPO(1)` min) to the **Packing
  station** area, where **6 parts batch** onto a pallet (permanent batch),
  then pallets are disposed (one pallet = one exit).
- Question: **can inspection capacity handle 12% rework, and what's the
  expected scrap rate? Does adding a 2nd inspector pay off?**

## Suggested sketch

```
[Station AssemblyArea]
Create(parts) → Process(Assembly, Assemblers=2)
   → Route(to InspectArea, EXPO(1))
[Station InspectArea] → Process(Inspect, Inspector=1) → Decide(Chance 12% fail?)
        False(pass) ────────────────────────────────────┐
        True(fail) → Assign(Fails++) → Decide(Fails>=3?) → True → Dispose(Scrap)
                          │                                    │
                          False → Process(Rework) → [back to Inspect — via Route]
   pass ──▶ Route(to PackArea, EXPO(1))
[Station PackArea] → Batch(6, permanent) → Dispose(PalletOut)
```

## Hints

- **Cycle through stations:** since you're using Stations, "going back to
  Inspect" = **Route to Station InspectArea** (not a backward flowchart wire —
  though a backward wire works if travel time is irrelevant; *pick one convention
  and be consistent*).
- **Batch:** Batch module size 6, permanent ✅, then Dispose counts pallets.
  Remember exits will count **pallets**, not parts — track parts separately with
  a Record/Variable if needed.
- **Counts:** scrap rate = `Scrap / (parts entered)` — use Variables + Record.
- Assemblers/inspector as Resource modules with capacities 2 and 1.

## Verification tasks

1. **Flow balance with a twist:** parts in = scrapped + (pallets × 6)?
   *(If a run ends mid-batch, leftover parts sit in the batch queue — account
   for them: balance is `in = scrap + 6×pallets + inBatchQueue + WIP` — check
   it!)*
2. Extreme test: failure % → 0 ⇒ rework utilization = 0, scrap = 0.
3. Extreme test: failure % → 100 ⇒ everything eventually scrapped after 3 tries;
   verify scrap ≈ 100% (with rework always failing too).
4. Predict scrap rate analytically: each attempt fails 12%, scrapped on 3rd
   failure... (prob of ≥3 consecutive fails — compute the expected scrap % and
   compare with simulation. *Note: is scrap "3 failures ever" or "3 in a row"?
   The spec says fail count reaches 3 — model exactly that.*)

## Questions to answer

1. Inspector utilization (base) — is inspection the bottleneck?
2. Observed scrap % vs your analytical estimate — do they agree?
3. Scenario table: Base vs 2 inspectors vs rework time −20%:
   throughput (pallets/day), avg part cycle time (CI), resource utils.
4. **Recommendation:** which single change most improves throughput? Write it
   with supporting numbers.

---

## 📋 The universal project workflow (use every time)

```
 1. READ the problem; underline every number and rule.
 2. SKETCH the flow on paper (modules + arrows) BEFORE opening Arena.
 3. LIST data needs (distributions, schedules, capacities).
 4. BUILD the minimum version that runs (even with constants).
 5. VERIFY: extreme test + hand trace + flow balance.   ← Lesson 8
 6. REPLACE constants with distributions/schedules.
 7. VERIFY again; then VALIDATE against any real/known numbers.
 8. RUN experiments (30 reps, warm-up) → build a comparison table.
 9. ANSWER THE QUESTION in plain language with numbers + CI.
10. DOCUMENT in a canvas Note (purpose, assumptions, run setup).
```

> 🔑 **The model is a means; the answer is the product.** Every project ends
> with a sentence a manager can act on, not a screenshot of a flowchart.

---

## 📝 Practice questions

1. Project 1: why did we predict ρ > 1 *before* running?
2. Project 2: merging both branches into one `Doctor` Process — what must be
   true about the two paths for this to be valid?
3. Project 3: why doesn't `parts in = 6 × pallets` hold at the end of a run?
4. In all three: what's the "recommendation" artifact and why does it matter?

<details>
<summary><b>Answers (click to expand)</b></summary>

1. Because avg service demand per customer (≈4.64 min) exceeds the interarrival time (3 min) — one barista can't keep up, so ρ = 4.64/3 > 1; queues must grow without bound.
2. Both paths must require the *same* resource in the *same* way (no per-path differences in service time or priority) — otherwise you need separate processes or a conditional delay.
3. Some parts are scrapped, and some sit unbatched in the batch queue when the run ends — plus WIP elsewhere; the full balance must include scrap, in-batch leftovers, and WIP.
4. A plain-language recommendation backed by CI'd numbers and a scenario comparison — because simulation's purpose is decision support, not decoration.

</details>

## ✅ Course capstone checklist

- [ ] Built all 3 projects unaided (sketch first).
- [ ] Each project passed extreme tests + flow balance.
- [ ] Every results table includes **95% CI**, not just averages.
- [ ] Every project ends with a written recommendation.

---

**Previous ←** [Lesson 8](08-verification-validation.md) · **Practice →** [Exercises](exercises/README.md)

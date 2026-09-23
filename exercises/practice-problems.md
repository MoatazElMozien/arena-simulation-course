# Practice Problems — Build It Yourself

**12 model-building challenges**, increasing difficulty. Each gives you a written
spec (the way a real task would arrive), **hints**, a **verification checklist**,
and a **solution guide** — but *you* build it in Arena first.

> 🔑 **Rule:** don't open the solution guide until your model runs AND passes
> every verification item.

---

## How to use

1. Read the spec → **sketch the flow on paper** (modules + arrows).
2. Build the minimum version that runs.
3. Run the verification checklist (extreme tests + balance).
4. Answer the posed question with a CI-backed number.
5. Only then compare with the solution guide; note gaps in `mistakes-log.md`.

**Difficulty:** ★☆☆ · ★★☆ · ★★★

---

## P1 — Solo Checkout Counter ★☆☆

A small store has **1 cashier**. Customers arrive `EXPO(4)` min, service
`TRIA(2,3,6)` min, store runs 480 min.

**Build:** Create → Process (Seize Delay Release, cashier) → Dispose.
30 reps × 480 min, warm-up 0 (day starts empty & that's realistic).

**Question:** what's the average wait, and cashier utilization?

**Verify:**
- [ ] Predict ρ before running (≈ 3.7/4 ≈ 0.93) and compare to Busy%.
- [ ] Extreme test: service `0.01` → wait ≈ 0.

<details>
<summary><b>Solution guide</b></summary>

Flow: `Create(EXPO(4) min)` → `Process(Cashier, cap 1, TRIA(2,3,6))` → `Dispose`.
Expect utilization ~90%+ and a noticeably long-ish queue because ρ≈0.93 with
variability. If utilization isn't near 0.9, check time units (both minutes!)
and that the resource actually got selected. Two modules' worth of model —
simplicity is the point.

</details>

---

## P2 — Two Cashiers, One Line ★☆☆

Same as P1, but **2 cashizers, single shared line** (the modern store layout).

**Build:** capacity 2 (or two Process modules each cap 1 fed by one preceding
queue — the capacity-2 way is correct and simpler).

**Question:** compare avg wait vs P1. Does doubling cashiers halve the wait?

**Verify:**
- [ ] Utilization ≈ half of P1-ish (not exactly — queuing is nonlinear).
- [ ] One shared queue, entities served by whichever cashier frees first.

<details>
<summary><b>Solution guide</b></summary>

Change `Capacity = 2` in the single Process — that's it. One queue, two servers.
Key learning: wait drops *more* than proportionally when ρ falls (nonlinear),
while utilization scales roughly linearly. Compare your numbers: P1 wait (long)
vs P2 wait (short) with utilization ~46%.

</details>

---

## P3 — Add a Lunch Break ★☆☆

P1's cashier takes a 30-min break at minute 240 (capacity 1 → 0 → 1).

**Build:** Schedule module: Value 1 for 240 min, Value 0 for 30, Value 1 for
210, repeat = No (single day). Assign to the Cashier resource.

**Question:** how much does the break increase average wait? Should the store
stagger breaks if it had 2 cashiers?

**Verify:**
- [ ] During 240–270 no service happens (animation / busy plot).
- [ ] Entities already in service at 240 finish (default semantics).

<details>
<summary><b>Solution guide</b></summary>

Resource → Schedule Name = new Schedule (as above). With 1 cashier at ρ≈0.93,
a 30-min outage creates a big recovery queue — waits rise noticeably. Staggering
(multiple schedules offset in time) is the standard fix with 2+ staff; note that
a second schedule assigned to the *same* resource combines via the schedule's
value — for staggered staff, model *two resources* (Cashier1, Cashier2) with
offset schedules, or use capacity values accordingly.

</details>

---

## P4 — Probability Branch ★☆☆

An order line: orders arrive `EXPO(5)` min. 30% are **express** (service
`EXPO(6)` min, resource `ExpressAgent`), 70% **standard** (service `EXPO(10)`
min, resource `StdAgent`). Separate queues.

**Build:** Create → Decide(Chance 30%) → (True) Process Express / (False)
Process Standard → both Dispose.

**Question:** utilization of each agent type; which is the bottleneck?

**Verify:**
- [ ] Counts: Express exits ≈ 30% of total (± sampling).
- [ ] Extreme: chance 100 → std agent utilization = 0.

<details>
<summary><b>Solution guide</b></summary`

Decide *Chance* percent = 30 on the True branch. Two Process modules with
*different* resource names (don't accidentally share one resource!). Expected:
express λ=0.06/min ÷ μ=1/6 ⇒ ρ≈0.6; standard λ=0.14 ÷ μ=0.1 ⇒ ρ≈1.4 →
**standard is unstable** — a real finding: either more std agents or faster
service is required. Watch the std queue grow to confirm.

</details>

---

## P5 — Rework Loop with Cap ★★☆

Parts arrive `EXPO(3)` min, are processed (2 min ±, `CONSTANT(2)` fine), then
**15% fail** → rework (5 min) → re-inspect. **After 3 total failures → scrap.**

**Build:** Create → Process(Inspect) → Decide(Chance 15%) → fail: Assign
`Fails++` → Decide(`Fails >= 3`?) → True: Dispose(Scrap) /
False: Process(Rework) → **loop back** to Inspect. Pass: Dispose(Good).

**Question:** scrap rate? (Should be ≈ 0.15³ ≈ 0.34% if "3 *in a row*"... but
spec says *total* failures ≥ 3 — think about what that means: a part that fails,
passes, then later fails... **parts pass after rework** — reconcile your logic!)

> Careful reading: after rework a part *re-inspects*; it only reaches final
> pass when inspection passes. So failures accumulate until a pass or 3 fails.

**Verify:**
- [ ] Flow balance: `created = good + scrap`.
- [ ] Extreme: fail % = 0 ⇒ scrap = 0; fail % = 100 ⇒ all scrapped (Fails hits 3).
- [ ] Inspection module handles re-entrant flow (same Process reached twice — legal).

<details>
<summary><b>Solution guide</b></summary>

Key details: the Assign `FailCount = FailCount + 1` sits on the fail branch
**before** the `FailCount >= 3` Decide. Loop connects Rework output → Inspect
input. Initialize `FailCount = 0` in an Assign right after Create (or at
creation). With p=0.15 per inspection and needing 3 failures before any pass...
actually each inspection that *fails* increments; a pass exits as Good.
Probability of ≥3 failures before first success (negative binomial) — with
rework taking time, scrap ≈ p³ geometric-style ≈ **0.3–0.4%** of parts if every
re-inspection is an independent 15% fail. Your simulated scrap % should land
near that — if it's ~3%, you likely double-counted increments (Assign placed
twice in the path).

</details>

---

## P6 — Batch of Six ★★☆

Parts arrive individually `EXPO(1)` min. They're boxed **6 per carton**
(permanent batch); a carton then waits for a **shipping** process (delay only,
`EXPO(8)` min per carton) and exits.

**Question:** cartons/hour throughput? What limits it — parts or shipping?

**Verify:**
- [ ] Balance: `parts in = 6 × cartons out + partial leftovers + WIP`.
- [ ] Shipping delay is applied *per carton* (after batch), not per part.

<details>
<summary><b>Solution guide</b></summary>

`Create(parts)` → `Batch(size 6, permanent)` → `Process(Shipping, Delay Only,
EXPO(8))` → `Dispose`. Ideal rate: parts every 1 min → 1 carton/6 min; shipping
handles 1/8 min ⇒ shipping is the bottleneck (ρ_carton = 8/6 > 1 → cartons back
up before shipping). Throughput therefore ≈ 7.5 cartons/hr at best, and the
pre-ship queue grows — verify your queue plot agrees.

</details>

---

## P7 — Station & Route ★★☆

A two-department system: **Cut** area produces a part every `EXPO(4)` min
(process `TRIA(2,3,6)`, 1 machine). Parts then **travel** to **Pack** area
(travel time `TRIA(1,2,3)` min) where packing takes `EXPO(4)` min (1 packer).

**Build:** Station `CutArea` … Process(Cut) → Route → (Station `PackArea`) →
Process(Pack) → Dispose.

**Question:** packer utilization; average end-to-end cycle time.

**Verify:**
- [ ] Extreme: travel time → 0 ⇒ cycle time drops by avg travel (~2 min).
- [ ] Animation shows travel taking real time (not instant).

<details>
<summary><b>Solution guide</b></summary>

Use **Station** modules to name locations: `Station(CutArea)` at the start,
`Station(PackArea)` before packing. After the Cut process use **Route**
(destination PackArea, delay `TRIA(1,2,3)`). Alternatively use Assign-to-Station
for teleport (not wanted here — travel matters). Both stations at ρ≈0.83
(4/4.8ish) — check totals: cycle ≈ cut wait + cut 3.7 avg + travel 2 + pack
wait + pack 4.

</details>

---

## P8 — Priority Queue (VIP) ★★☆

From P1: add **VIP customers** (20%). VIPs must be served first whenever the
queue is non-empty. Service same for everyone.

**Build:** Assign after Create: `Priority = 2` with prob 0.2 else `1`
(use a Decide(Chance) + two Assigns for clarity). Process queue ranking =
**Lowest Attribute Value First** on `Priority`.

**Question:** VIP vs non-VIP average wait (two Record/tally statements or read
per-entity stats via a Record with conditions).

**Verify:**
- [ ] Animation: a VIP arriving behind non-VIPs is served next when a server frees.
- [ ] Non-VIP waits *increase* relative to P1 (someone must pay for the priority).

<details>
<summary><b>Solution guide</b></summary>

Decide(Chance 20%) → True: Assign `Priority=1` (VIP) / False: Assign
`Priority=2` (regular) — smaller = more important for *Lowest First* ranking.
Then both merge into the service Process. To compare waits: add **Record**
(Tally Average) modules after service measuring `TNOW - ArrTime` where
`ArrTime` was stamped in an Assign at Create — one Record per class (gate it
with a Decide on Priority) or use Arena's conditional statistics. Core lesson:
priority redistributes waiting time; total system performance barely changes.

</details>

---

## P9 — Time-of-Day Arrivals ★★★

A café: **4/hr** 06:00–10:00, **12/hr** 10:00–14:00, **7/hr** 14:00–18:00
(close). 2 servers, service `TRIA(3,5,9)` min. Model 06:00–18:00 (720 min),
clock starts at 06:00 (TNOW=0).

**Build options:** (a) Schedule-based Create with rate table; (b) Create
`EXPO(60/7)` base + N-way Decide on `MOD(TNOW,720)` thinning arrivals… choose
(a) if available in your version; otherwise implement (b) honestly:
`Create(EXPO(15))` then a **thinning** Decide: early hours accept only
`4/7`-ish... *(advanced! simpler alternative: three Create modules gated by
time — see solution.)*

**Question:** peak queue length & when it occurs; utilization overall.

**Verify:**
- [ ] Arrivals per hour counted per block match 4/12/7 (use Record + array).
- [ ] Queue peaks during 10:00–14:00 block.

<details>
<summary><b>Solution guide</b></summary>

Cleanest portable approach: **one Create with `EXPO(15)` min** (7/hr baseline)
→ **N-way Decide** by `TNOW` blocks → each block routes to a **gate Decide
(Chance)** accepting arrivals at the right rate (morning: chance 4/7≈57%,
midday: 12/7 → can't exceed baseline...). Baseline must cover the *peak*:
use `EXPO(5)` (12/hr) and thin: morning accept 4/12=33%, midday 100%,
afternoon 7/12=58% — rejected candidates just Dispose(`Thinned`) *before* real
work. This is *Poisson thinning* — valid DES. Then Process(2 servers) as usual.
Expected: midday is the crunch — utilization spikes, queue peaks near 14:00.

</details>

---

## P10 — Multiple Resource Team ★★★

A crew = **1 driver + 2 loaders** must all be present to unload a truck.
Trucks arrive `EXPO(20)` min; unload takes `TRIA(25,30,40)` min with the full
crew. Pool: 2 drivers, 3 loaders (so at most one full crew now; loaders spare).

**Build:** Use **Multiple Resources** (Advanced Process / advanced Process
options): seize 1 `Driver` AND 2 `Loaders` together, delay, release both.

**Question:** truck wait time; driver & loader utilization (as a pool).

**Verify:**
- [ ] Extreme: make loaders = 2 ⇒ nothing ever unloads (can't form crew)? *(think!)* — actually 2 loaders = exactly enough; try loaders = 1 ⇒ deadlock/no progress.
- [ ] Both resources show busy time during unload.

<details>
<summary><b>Solution guide</b></summary>

Multiple-resource seize requires all-or-nothing acquisition — Arena handles
seizing units from several resources in one Process (advanced configuration:
add multiple resource rows with *Units per Entity* 1 and 2 respectively —
in many versions simply adding two rows to the Resources list in the Process
dialog does exactly this: `Driver` units 1, `Loaders` units 2). Deadlock test:
capacity 1 loader ⇒ the 2-unit requirement can never be met ⇒ trucks wait
forever — your extreme test should show *zero unloads*.

</details>

---

## P11 — Hospital Triage (Mini Capstone) ★★★

Patients arrive `EXPO(2.5)` min. **Triage** (1 nurse, `TRIA(2,3,5)`).
After triage: **20% critical** → `Emergency` doctor (2 doctors shared with
stable? No — critical use `ERDocs` cap 2, `TRIA(10,15,25)`); **80% stable** →
`Ward` (4 beds, `TRIA(8,12,20)`, beds are the resource). 5% of stable patients
escalate to ER after ward (loop). Run 720 min, 30 reps, warm-up 60.

**Question:** where's the bottleneck? Would a 3rd ER doctor or 1 more bed help more?

**Verify:**
- [ ] Flow balance with the escalation loop (patients may visit ward & ER both).
- [ ] Probability checks: critical ≈ 20% of arrivals.
- [ ] Hand-trace one escalated patient.

<details>
<summary><b>Solution guide</b></summary>

`Create → Assign(stamp) → Process(Triage, Nurse) → Decide(Chance 20%) →
True: Process(ER, ERDocs cap2) ; False: Process(Ward, beds cap4) →
Decide(Chance 5%) → True: Process(ER...) or route to a shared ER process /
False: Dispose(Stable)` — critical branch also Dispose(EmergencyExit) after ER.
Merge carefully: both ER-feeding branches can connect into **one** ER Process
(shared resource). The 5% escalation feeds back into ER — bound it (a patient
can't escalate forever: escalate only if `Escalated == 0`, Assign/Decide guard).
Compare scenarios by editing Expression-module parameters: ERDocs 3 vs Beds 5.
Bottleneck = resource with highest utilization *and* longest queue — report both
to justify the recommendation.

</details>

---

## P12 — The Full Gauntlet ★★★

Combine everything into one model of a **small workshop**:

- 3 product types arrive (separate Creates, `EXPO(8)/EXPO(12)/EXPO(15)`).
- Each has its own **Sequence** of stations: `Saw → Mill → Paint → Inspect`.
- Shared resources at each station (1 saw, 2 mills, 1 paint booth, 1 inspector).
- Paint needs **cure time** (delay only, `EXPO(10)`, no resource).
- Inspection: **10% fail** → rework at Mill (skip saw) → re-inspect;
  **2 failures** → scrap.
- 4 parts **batch** into a pallet after inspection → dispose pallets.
- Staff work 08:00–16:00 via schedules (paint booth off 12:00–12:30).

**Question:** per-station utilization & bottleneck; scrap % by product;
throughput in pallets/day; recommendation for capacity investment.

**Verify:**
- [ ] Flow balance per product: `created = scrapped + 4×pallets + WIP + in-batch`.
- [ ] Extreme: fail 0% ⇒ rework idle, scrap 0.
- [ ] Each product visits stations in the right order (animation + trace).
- [ ] Schedules respected (nothing painted during lunch).

<details>
<summary><b>Solution guide</b></summary>

Build order that tames complexity: (1) one product end-to-end first with plain
connections; (2) verify; (3) add product 2/3 via Sequences + entity routing
sequence (or, if sequences feel risky, three parallel branches — accept the
duplication as a learning step, then refactor); (4) add rework loop with a
per-entity `FailCount` guard (spec says 2 failures → scrap — decide
*"total"* vs *"in a row"* and state it); (5) batch of 4 after inspect; (6)
schedules last (they interact with everything — add when logic is verified).
Keep ALL parameters in **Expression** modules — with ~20 numbers this is now
mandatory, not optional. Report per-station Busy% table + queue wait table,
then recommend the single capacity add that most reduces cycle time (usually
the highest-ρ station with a long downstream queue — but *prove* it with a
scenario run, don't guess).

</details>

---

## 🏆 After P12

You've finished every practice problem — you're past "zero to hero" territory.
Remaining ways to level up:

1. **Model something from your own job/studies** (best possible practice).
2. Re-do P11 & P12 *timed* (sketch → verified model in under 60 min).
3. Read Arena's Help on modules you avoided (Hold, Select, Read/Write).
4. Try **Input Analyzer** on real data you collect yourself.

*Back to [exercises](README.md) · [course home](../README.md)*

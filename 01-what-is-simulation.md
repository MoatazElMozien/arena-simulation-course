# Lesson 1 — What is Simulation?

**Est. time:** 45 min · **Prerequisites:** none

## 🎯 Objectives

By the end of this lesson you will be able to:

- Define simulation and discrete-event simulation (DES).
- Distinguish simulation from analytic (mathematical) models.
- Identify the 5 ingredients of every DES model.
- Recognize when a problem is a good candidate for Arena.
- Know the vocabulary you will see for the rest of the course.

---

## 1.1 What is simulation?

**Simulation** is building an artificial, simplified representation of a real-world
system over time, and experimenting with it to learn how the real system behaves.

Instead of asking *"What will happen if we add a second cashier?"* and waiting months
to find out, you build a model, press **Run**, and watch months pass in seconds.

Three important words in that definition:

| Word | Meaning |
|------|---------|
| **artificial** | It's a model, not the real system — something is always left out |
| **simplified** | You deliberately ignore details that don't affect the question you're asking |
| **experimenting** | The point is to test scenarios ("what-if" analysis), not just watch |

> ⚠️ **All models are wrong, some are useful.** (George Box)
> A simulation never tells you *the* answer. It tells you what your *assumptions*
> imply. Stating your assumptions clearly is half the job.

---

## 1.2 Types of simulation models

```
                    ┌──────────────────────┬──────────────────────┐
                    │   Continuous time     │   Discrete time      │
      ┌─────────────┼──────────────────────┼──────────────────────┤
      │  Continuous  │ Physics/flow of      │ Fixed-timestep       │
      │  state      │ liquids, chemistry   │ control systems      │
      ├─────────────┼──────────────────────┼──────────────────────┤
      │  Discrete   │ ★ Discrete-Event     │ Agent-based /         │
      │  state      │   Simulation (DES)   │ cellular automata    │
      └─────────────┴──────────────────────┴──────────────────────┘
```

**Arena is a Discrete-Event Simulation (DES) tool.** That means:

- **Discrete** — the system state (number of customers in queue, machine status)
  changes only at distinct points in time. Between events, *nothing happens*.
- **Event** — a point in time when state changes: an arrival, a departure,
  a machine breaking down.
- **Simulation** — the software jumps from event to event, advancing the clock
  only as far as needed (`calendar analogy: skip from appointment to appointment
  instead of walking every second of the day`).

---

## 1.3 The 5 ingredients of every DES model

Every simulation model — no matter how complex — is built from these five things:

1. **Entities** — the things that flow through the system.
   *Customers, parts, emails, patients, trucks.*
2. **Resources** — the things entities compete for.
   *Servers, machines, nurses, cashiers, bandwidth.*
3. **Queues** — waiting lines where entities sit when a resource is busy.
4. **Events** — things that happen at a point in time (arrivals, completions, failures).
5. **Logic / routing rules** — the "what happens next" rules:
   *go to inspection with 10% probability, batch in groups of 5, rework if defective.*

If you can look at any real system and name these five things, you can simulate it.

---

## 1.4 Simulation vs. other approaches

| Approach | Example | Pros | Cons |
|----------|---------|------|------|
| **Analytical model** | `Lq = λ²/μ(μ−λ)` (M/M/1 queue) | Exact, instant, cheap | Only works for simple, formula-friendly systems (steady state, no schedules) |
| **Physical pilot / experiment** | Open a trial counter in one store | Real data | Slow, expensive, sometimes impossible |
| **Simulation** | Build the store in Arena | Flexible, safe, repeatable, handles schedules & randomness | Takes time to build; only as good as its assumptions |

**Rule of thumb:** try a quick analytical model first. Reach for simulation when the
system has *complex logic, schedules, multiple interacting resources, or randomness*
that no formula can handle.

---

## 1.5 When is Arena a good choice?

✅ **Good candidates**

- Service systems: hospitals, call centers, banks, restaurants, security checkpoints.
- Manufacturing: assembly lines, CNC shops, painting/curing with batch logic.
- Logistics: warehouses, ports, truck fleets, container terminals.
- Any system with **queues + shared resources + randomness + schedules**.

❌ **Poor candidates**

- Pure math / forecasting problems (use statistics or ML instead).
- Systems with a single deterministic step (just do the arithmetic).
- Problems where data doesn't exist at all and can't be estimated.

---

## 1.6 The simulation project lifecycle

This is the roadmap the whole course follows:

```
  1. PROBLEM FORMULATION     "What question are we answering?"
            ↓
  2. CONCEPTUAL MODEL        Draw the flow: entities, resources, rules
            ↓
  3. DATA COLLECTION         Arrival patterns, service times, schedules
            ↓
  4. MODEL BUILDING   ─────── Lessons 2–6 (the Arena part)
            ↓
  5. VERIFICATION            "Did we build the model RIGHT?"
            ↓  ──────────── Lesson 8
  6. VALIDATION              "Did we build the RIGHT model?"
            ↓
  7. EXPERIMENTATION         Run scenarios, replications  ← Lesson 7
            ↓
  8. DOCUMENTATION & RESULTS Present recommendations
```

> 🔑 **Verification vs. Validation** — remember:
> **Verification = model vs. spec** (no bugs).
> **Validation = model vs. reality** (matches the world).
> You'll master both in [Lesson 8](08-verification-validation.md).

---

## 1.7 Key vocabulary (keep this list handy)

| Term | Definition |
|------|-----------|
| **Entity** | An object that flows through the system and acquires attributes |
| **Attribute** | A property of one specific entity (e.g., `PriorityLevel`) |
| **Variable** | A global or per-entity piece of data that can change (e.g., `WIP`) |
| **Resource** | A capacity-limited server that entities must seize |
| **Queue** | Waiting area for entities that can't get a resource yet |
| **Event** | A point in time where state changes |
| **Replication** | One complete run of the model from time 0 to the horizon |
| **Clock / SIMTIME** | The simulated current time |
| **Warm-up period** | Initial time discarded so start-up effects don't bias results |
| **Throughput** | Units completed per unit of time |
| **Utilization** | Fraction of time a resource is busy |
| **WIP** | Work In Process — entities currently in the system |
| **Flow time / cycle time** | Time an entity spends in the system |

---

## 📝 Practice questions

Answer from memory, then check [exercises/quiz-basics.md](exercises/quiz-basics.md)
for the full quiz with answers. Quick self-check:

1. In one sentence, what makes a simulation *discrete-event*?
2. Name the 5 ingredients of every DES model.
3. Your factory has 3 identical machines feeding one packing station, machines
   break down randomly, and orders arrive with seasonal patterns. Analytic or simulation? Why?
4. A colleague says "my model predicted 47 customers/day so we will get 47."
   What's wrong with that statement?
5. What is the difference between verification and validation?

<details>
<summary><b>Answers (click to expand)</b></summary>

1. State changes only at discrete points in time; the clock jumps from event to event instead of advancing continuously.
2. Entities, resources, queues, events, and routing/logic rules.
3. Simulation — random breakdowns + interacting resources + seasonal (non-stationary) arrivals break the assumptions of standard queueing formulas.
4. A simulation produces a *distribution* of outcomes under stated assumptions, not a single guaranteed number. Results vary between replications; report a confidence interval.
5. Verification = building the model right (no logic bugs). Validation = building the right model (matches real-world behavior).

</details>

## ✅ Checkpoint

You may move to Lesson 2 when you can, without looking:

- [ ] Explain DES to a friend in 30 seconds.
- [ ] Name the 5 model ingredients and give an example of each for a bank.
- [ ] State the difference between verification and validation.

---

**Next →** [Lesson 2: The Arena Interface](02-arena-interface.md)

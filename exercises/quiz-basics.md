# Quiz — Basics (Lessons 1–5)

**40 questions** · closed book · answers in collapsible sections after each block.

---

## Block A — Simulation concepts (Q1–Q8)

**Q1.** In your own words, what is discrete-event simulation, and what makes it "discrete"?

**Q2.** Name the 5 ingredients found in every DES model.

**Q3.** Give one system that is a *good* simulation candidate and one that is *poor*, with reasons.

**Q4.** A system has constant arrivals every exactly 10 minutes and service every exactly 8 minutes. What's wrong with this model, and what should you use instead?

**Q5.** Explain the difference between *verification* and *validation* with an analogy.

**Q6.** What does "all models are wrong, some are useful" mean for how you present results?

**Q7.** List the 8 stages of the simulation project lifecycle (rough order).

**Q8.** Your friend says: "The simulation said 47, so we will get exactly 47."
What's your response?

<details>
<summary><b>Answers A</b></summary>

1. A method where system state changes only at discrete points in time (events); the clock jumps from event to event instead of advancing continuously.
2. Entities, resources, queues, events, and routing/logic rules.
3. Good: call center with random arrivals, multiple agents, schedules, priorities — randomness + complexity. Poor: calculating the area of a circle, or a single deterministic step — just do the math.
4. No variability → unrealistically smooth, short, predictable queues. Use data-fitted distributions (`EXPO`, `TRIA`, `NORM`, etc.).
5. Verification = building the model right (model vs. specification — no bugs; like code passing unit tests). Validation = building the right model (model vs. reality — like the product solving the user's real problem).
6. Present results as distributions/ranges under stated assumptions (with CIs), never as guaranteed predictions; document assumptions.
7. Problem formulation → conceptual model → data collection → model building → verification → validation → experimentation → documentation/results.
8. A simulation gives a *distribution* of outcomes for stated assumptions, not a guarantee; report averages with confidence intervals and explain the assumptions.

</details>

---

## Block B — Interface (Q9–Q15)

**Q9.** What are the two kinds of items you drag from the Project Bar, and how do they differ?

**Q10.** Which shortcut key activates the Connect tool? What does the arrow direction mean?

**Q11.** What's the difference between **Step** and **Pause**?

**Q12.** What file extension does an Arena project use?

**Q13.** Where do you set replications and run length?

**Q14.** List two ways to place a module on the canvas.

**Q15.** Why should you rename modules immediately after placing them?

<details>
<summary><b>Answers B</b></summary>

1. Flowchart modules (actions in time: Create, Process, Decide) and data modules (tables of definitions: Resource, Queue, Schedule, Variable).
2. **C**. It points in the direction entities flow (source → destination).
3. Step advances to the *next event* (clock jumps forward); Pause freezes the model at the current instant.
4. `.doe`
5. `Run → Properties` (Simulation tab).
6. Drag-and-drop from the Project Bar; double-click empty canvas and type the name (quick-add); the Create tool to draw a chain.
7. Meaningful names make dialogs, debugging, and report reading far easier as the model grows — `Process1` tells you nothing.

</details>

---

## Block C — Create / Process / Dispose (Q16–Q24)

**Q16.** Name the three *Leave Types* of the Create module.

**Q17.** Arrivals average one every 10 minutes, random. Write the interarrival expression and units.

**Q18.** What are the three *Action Types* of the Process module? Which one seizes a resource?

**Q19.** Describe what happens, in order, in *Seize Delay Release*.

**Q20.** When is *Delay Only* the right choice? Give an example.

**Q21.** You know a task takes 2–5 minutes, most often 3. Which distribution do you use?

**Q22.** What does the Dispose module record?

**Q23.** Where is the queue for a Process module, and how do you change its ranking?

**Q24.** With ρ = λ/μ: arrivals `EXPO(10)` min, service `EXPO(8)` min, 1 server — predict utilization.

<details>
<summary><b>Answers C</b></summary>

1. Interarrival Time, Expression, Schedule.
2. `EXPO(10)` with units minutes (mean matches 10 min).
3. Seize Delay Release, Delay Only, Sequence. Seize Delay Release seizes.
4. Seize the resource (queue if unavailable) → delay (perform work) while holding it → release it for the next entity.
5. When time passes without a server: walking, curing, aging, travel, waiting for a batch — anything needing no resource.
6. `TRIA(2,3,5)`
7. Number of entities exiting and their average time in the system.
8. It's attached to the Process (queue icon); edit it to choose Ranking (FIFO/LIFO/attribute-based/random).
9. ρ = (1/10)/(1/8) = 0.8 → 80%.

</details>

---

## Block D — Resources & Schedules (Q25–Q32)

**Q25.** Resource capacity 3, Units Per Entity 2 — how many entities in service simultaneously?

**Q26.** Difference between a **Schedule** and a **Calendar**?

**Q27.** Difference between *Capacity* and *Rate* schedule types?

**Q28.** Busy% = 60, Scheduled Util% = 90. What's happening?

**Q29.** How do you model a lunch break for a resource?

**Q30.** What happens to an in-service entity when its resource's schedule drops to 0?

**Q31.** How do you share one resource between two different Process modules?

**Q32.** What is *preemption*, and one risk of modeling it?

<details>
<summary><b>Answers D</b></summary>

1. One (it uses 2 of 3 units; a second would need 2 more, only 1 remains).
2. Schedule = repeating pattern (daily 8-on/16-off); Calendar = availability by absolute dates (holidays, events).
3. Capacity = whole integer servers appear/disappear; Rate = fractional availability (0.5 = half speed).
4. The resource is off ~⅓ of total time but at 90% utilization while scheduled on — high load during operating hours.
5. Create a Schedule whose value dips during lunch (capacity 1 → 0/less for 30 min, repeating daily) and assign it to the resource (or use a Shift).
6. Default: it finishes its current delay; waiting entities stay queued until capacity returns.
7. Define it once in the Resource data module and reference the same resource name in both Process dialogs (one shared capacity pool).
8. Preemption = interrupting an entity currently using a resource so it can serve something else; risk = complex resume/restart logic that's hard to verify.

</details>

---

## Block E — Flow Control (Q33–Q40)

**Q33.** 2-way Decide: what's the difference between *Condition* and *Chance*?

**Q34.** In an N-way Decide, which condition wins if several are true? Why does order matter?

**Q35.** Write a condition: "express lane if items ≤ 3 AND customer is premium."

**Q36.** Assign: attribute vs variable — define each and give one example of each.

**Q37.** Batch size 5, Permanent ✅ — what does the next module see? And if Permanent ❌?

**Q38.** When do you use **Station + Route** instead of a plain connection?

**Q39.** What is a **Sequence**, and what's its main advantage over drawing branches?

**Q40.** A rework path loops back to an earlier Process. Is that legal? What must you ensure (one danger)?

<details>
<summary><b>Answers E</b></summary>

1. Condition = logical test (deterministic given entity state); Chance = random split with a probability (e.g., 15% True).
2. The *first* true condition in list order wins — put specific conditions before broad ones, or the broad one shadows the narrow.
3. `Items <= 3 AND IsPremium == 1`
4. Attribute = data belonging to one entity (Patient.Priority). Variable = global shared value (TotalAdmissions). Both set via Assign (variable must be pre-declared in a Variable module).
5. One merged entity acts as a single unit; ❌ = the group passes through together then separates back into 5 automatically.
6. When movement between named locations with meaningful travel time matters — plain connections imply instantaneous flow.
7. A predefined ordered list of stations an entity visits; advantage = routes become data (edit tables, not flowcharts), smaller models, easy new routes.
8. Yes — loops are legal and common (rework/retry). Danger: infinite loops (entity cycles forever) — bound them with a counter + Decide to scrap/exit.

</details>

---

## Scoring

| Block | /8 | weak areas |
|-------|----|-----------|
| A Concepts | | |
| B Interface | | |
| C Basic modeling | | |
| D Resources | | |
| E Flow control | | |
| **Total** | **/40** | |

**Next:** [quiz-modeling.md](quiz-modeling.md) · [practice-problems.md](practice-problems.md)

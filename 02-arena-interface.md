# Lesson 2 — The Arena Interface

**Est. time:** 45 min · **Prerequisites:** [Lesson 1](01-what-is-simulation.md)

## 🎯 Objectives

By the end of this lesson you will be able to:

- Identify every major part of the Arena window.
- Find and place modules from the Project Bar.
- Connect modules with **Create/Connect** tools.
- Open and edit a module's dialog (its "properties").
- Use the Run Controller to start, pause, and step a model.
- Create, save, and run a `.doe` (Arena project) file.

---

## 2.1 The Arena window

When you open Arena (File → New), you see:

```
 ┌────────────────────────────────────────────────────────────────────┐
 │ Menu bar: File Edit View Format Run Reports Tools Window Help      │
 ├────────────────────────────────────────────────────────────────────┤
 │ Standard toolbar: 🆕 📂 💾 ▶ ⏸ ⏹ 🔍 ...  + View/zoom controls     │
 ├────────────────────────────────────────────────────────────────────┤
 │ PROJECT BAR (left)          │                                      │
 │  ▸ BasicProcess             │      MODEL EDITING CANVAS           │
 │  ▸ AdvancedProcess          │      (you build the flow diagram     │
 │  ▸ Blocks                   │       here)                          │
 │  ▸ Elements                 │                                      │
 │  ▸ Parameters               │                                      │
 │  ▸ Reports                  │                                      │
 ├─────────────────────────────┴──────────────────────────────────────┤
 │ STATUS BAR: time | run state | selection info                      │
 └────────────────────────────────────────────────────────────────────┘
```

### The Project Bar (your toolbox)

The Project Bar holds **panels** of draggable modules, grouped into tabs:

| Tab | Contains | You'll use in |
|-----|----------|---------------|
| **BasicProcess** | Create, Process, Dispose, Decide, Batch, Assign, Route, Record, Station, Sequence, ... + Data modules (Entity, Queue, Resource, Schedule, Shift, Variable, Attribute, Set, Expression) | almost everywhere |
| **AdvancedProcess** | Count, Decide (advanced), Hold, Select, PickStat, Assign (advanced) | Lessons 4–6 |
| **Blocks** | Submodel blocks, Station, Route, Access | advanced routing |
| **Elements** | Read/Write, Decide with expressions, external data | data-driven models |
| **Reports** | PickAttribute, Tally, TimePersistent | custom statistics |

> 💡 If a tab is missing: **View → Project Bar** to toggle it, or right-click in
> the bar area to enable panels.

### Two kinds of items

1. **Modules** (rounded/flowchart shapes) — things that *happen*: Create, Process, Decide.
2. **Data modules** (spreadsheet-like tables) — things that *define data*: Resource, Queue, Entity, Schedule, Variable.

You drag **both** onto the canvas; data modules usually get created implicitly
when you configure a flowchart module.

---

## 2.2 Building blocks: placing & connecting

### To place a module

1. In the Project Bar, find **Process** (BasicProcess tab).
2. **Drag** it onto the canvas.
3. Or double-click an empty area of the canvas, type the module name, press Enter
   (quick-add — very handy once you know the names).

### To connect two modules

1. Click the **Connect** tool (looks like a line/arrow, or press **C**).
2. Click the **first** module (the source), then the **second** (the destination).
3. Arena draws a directional connection. The little arrow shows flow direction.

**Tips**

- Re-position modules by dragging; connections follow.
- To delete a connection: click it (it highlights) → **Delete**.
- To delete a module: select → Delete (Arena warns if connections will be removed).
- **View → Zoom** or Ctrl+scroll to see large models.

### The Create tool (build a chain fast)

The **Create** tool lets you draw a whole chain in one gesture: select it,
then drag a line across empty canvas and Arena inserts connected modules as you go.
Great for `Create → Process → Dispose` skeletons.

---

## 2.3 Module dialogs — where the real model lives

**Double-click any module** to open its dialog. This is where 90% of modeling happens.

A typical **Process** dialog:

```
┌─ Process ────────────────────────────────────── [?] [OK] [Cancel] ─┐
│ Name:          [ Assemble          ]                              │
│ Action Type:   ◉ Seize Delay Release   ○ Delay Only               │
│                ○ Sequence                                              │
│ Resources:  ▸  [ Nurse ]  Capacity [ 2 ] Units Per Entity [ 1 ]    │
│ Delay Type:    ◉ Constant  ○ Expression  ○ Uniform  ○ Triangular ...│
│ Delay:         [ 4.5 ]        Units: [ minutes ]                   │
│ [Add] [Edit] [Delete]                                              │
│ Triangular:                                                            │
│  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _│
│ [ OK ]  [ Cancel ]  [ Help ]                                       │
└────────────────────────────────────────────────────────────────────┘
```

Three things happen in every dialog:

1. **Name** it meaningfully — `CheckIn`, not `Process1`. You'll thank yourself.
2. Choose the **behavior** (dropdowns / radio buttons).
3. Fill in **expressions & numbers** (constants like `3.5`, or Arena expressions
   like `Nurse.Schedule...`, covered in Lessons 4–6).

> 🔑 **Every dialog has a `?` (Help) button** that opens Arena's manual page for
> that exact module. It's the fastest way to learn what a field does.

---

## 2.4 The Run Controller — watching your model live

Press **▶ Run** (F5 or the green play button). The **Run Controller** appears:

| Control | What it does |
|---------|--------------|
| ▶ **Run** | Start / resume |
| ⏸ **Pause** | Freeze the clock |
| ⏹ **Stop** | End this run |
| ⏭ **Step** | Advance to the **next event** — the single best debugging tool |
| 🐢/🐇 speed slider | Slow motion ↔ fast-forward |
| **Animation check box** | Show entity animations while running |

**Use Step constantly while learning.** It lets you see entities appear one event
at a time, which builds an intuitive feel for DES that no amount of reading can.

The **status bar** shows simulated time — compare it with what you expect.

---

## 2.5 Views: Model vs. Run vs. Report

Arena has three "modes" you switch between:

| View | Purpose |
|------|---------|
| **Model view** (default) | Build and edit the flowchart |
| **Run / animation view** | Watch entities move while the model executes |
| **Reports** (after a run) | PivotTable-style results: queues, resources, entities |

After a successful run, Arena opens the **Report** window automatically
(Lesson 7 explains how to read it). To get back: **Window menu → your model name**.

---

## 2.6 Files and sessions

| Action | How |
|--------|-----|
| New model | `File → New` (or Ctrl+N) |
| Save | `Ctrl+S` — Arena project files use **`.doe`** |
| Save as template | `File → Save As → ...` keep a `blank-template.doe` |
| Open | `Ctrl+O` |
| Recent files | `File → Recent Files` |
| Model properties | `Run → Properties` (replications, time units — Lesson 7) |
| Add notes | `Edit → Notes` or the Note tool — **annotate your models!** |

> 💡 **Habit:** put a Note on the canvas with model purpose, author, date, and
> version. Report readers love it, and *future you* is a report reader.

### Recommended practice: sketch first

Before touching Arena, draw the flow on paper:

```
Arrivals → [Queue] → [Server] → 10% rework? → back / exit
```

Five minutes of sketching prevents an hour of rearranging modules.

---

## 2.7 Your first (almost) model — try it now

Build this in the next 10 minutes — don't worry if the numbers mean nothing yet:

1. **File → New**.
2. Drag **Create** → double-click → Name `Arrivals`, Leave Type: *Interarrival Time*,
   keep defaults (`0.1` hours) → OK.
3. Drag **Process** → Name `Serve` → keep defaults → OK.
4. Drag **Dispose** → Name `Exit` → OK.
5. Press **C** (Connect) and link `Arrivals → Serve → Exit`.
6. Press **▶ Run**. Watch entities flow. Press ⏭ **Step** a few times first.
7. When finished, note that a report appears automatically.

🎉 **You just built and ran a simulation.** The rest of the course is refinement.

---

## 📝 Practice questions

1. What is the difference between a *flowchart module* and a *data module*?
   Give two examples of each.
2. Which tool do you use to link two modules, and what does the arrow direction mean?
3. You place three Process modules. Why should you rename them immediately?
4. What does the **Step** button do differently from **Pause**?
5. Where do you set how many replications a model runs? (You'll confirm in Lesson 7.)
6. What file extension does an Arena project use?

<details>
<summary><b>Answers (click to expand)</b></summary>

1. Flowchart modules represent actions in time (Create, Process, Decide, Dispose); data modules define tabular data the model references (Resource, Queue, Schedule, Entity, Variable).
2. The **Connect** tool (shortcut **C**). The arrow points in the direction entities flow — from source module to destination module.
3. Generic names like `Process1` become unreadable as models grow; meaningful names (`CheckIn`, `XRay`) make dialogs, reports, and debugging far easier.
4. Step advances the simulation *one event at a time* (clock jumps to the next event), letting you inspect state; Pause simply freezes the model wherever it is.
5. `Run → Properties` (Simulation Properties: replications, run length).
6. `.doe`

</details>

## ✅ Checkpoint

- [ ] I can find any BasicProcess module in under 5 seconds.
- [ ] I built the 3-module test model and ran it.
- [ ] I used Step and understand it advances one event.

---

**Previous ←** [Lesson 1](01-what-is-simulation.md) · **Next →** [Lesson 3: Basic Modeling](03-basic-modeling.md)

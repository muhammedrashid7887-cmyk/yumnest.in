---
name: animation-orchestrator
description: >
  Route animation tasks to the correct animation library (Motion, GSAP, AutoAnimate, CSS, Lottie) based on complexity, framework, bundle budget, and capability requirements.
  Use when the user asks about animation strategy, which animation library to use, how to choose between Motion and GSAP, animation performance optimization, or when planning animation architecture for a project or design system.
  Also trigger for "should I use Motion or GSAP", "animation decision tree", "what's the best way to animate this", "animation performance budget", or when the user describes an animation need but hasn't specified a tool.
  Always use this skill first before any animation implementation — it prevents wrong-tool selection and bundle bloat.
---

# Animation Orchestrator

## context

This skill acts as the **animation router** for the Design OS. It receives any animation-related request, analyzes the constraints (framework, bundle budget, complexity, capability needs), and routes to the correct implementation skill: `motion-animator`, `gsap-animator`, `auto-animate`, or native CSS. It prevents the #1 mistake in animation architecture: choosing the wrong tool for the job.

## instructions

### Step 1: Analyze the Request

Extract these dimensions from the user's need:

| Dimension | Question | Options |
|---|---|---|
| **Framework** | What framework? | React, Vue, Svelte, Vanilla, Next.js, etc. |
| **Complexity** | How complex? | Simple (1-2 props) → Medium (timeline) → Complex (scroll narrative) |
| **Capability** | What primitives? | Gesture, scroll, layout, SVG, text, physics, 3D |
| **Bundle Budget** | Size limit? | <5KB, <10KB, <50KB, unlimited |
| **Exit Animations** | Need mount/unmount? | Yes (AnimatePresence) / No |
| **Cross-Framework** | Need portability? | Yes → GSAP / No → Motion |

### Step 2: Route via Decision Tree

```
Framework = React/Next.js?
├── Yes → Complexity?
│   ├── Simple (hover, fade, basic stagger)
│   │   ├── Bundle < 5KB? → useAnimate MINI (2.3KB)
│   │   └── Bundle < 10KB? → LazyMotion + m (4.6KB)
│   ├── Medium (scroll reveals, layout transitions, exit animations)
│   │   └── → motion-animator (full motion, 34KB)
│   └── Complex (timeline sequences, scroll pinning, SVG morph, text effects)
│       └── → gsap-animator (core + plugins, 30-80KB)
└── No (Vue, Svelte, Vanilla, Angular)
    ├── Simple → CSS transitions or framework-native
    └── Complex → gsap-animator (framework-agnostic)
```

**Special cases:**
- **Simple list add/remove** → `auto-animate` (3.28KB, zero config)
- **Designer-created vector animation** → Lottie (embed JSON)
- **3D scene animation** → `framer-motion-3d` (if React) or raw Three.js + GSAP
- **Marketing/award-level site** → GSAP full stack (ScrollTrigger + SplitText + MorphSVG)
- **UI micro-interactions** → Motion (gestures, springs, AnimatePresence)

### Step 3: Provide the Routing Decision

Format the decision as:

```markdown
## Routing Decision

**Primary Tool:** {tool}
**Bundle Impact:** {size}
**Rationale:** {one-sentence why}

### Why Not Alternatives
- **{alt1}:** {why it's wrong for this case}
- **{alt2}:** {why it's wrong for this case}

### Implementation Path
1. {first step}
2. {second step}
3. {third step}

### Bundle Budget Check
- Budget: {X}KB
- Tool cost: {Y}KB
- Remaining: {Z}KB ✅ / ❌ Over budget — consider {alternative}
```

### Step 4: Escalation Rules

If the user later expands the scope beyond what the chosen tool handles:

| Current Tool | New Need | Escalate To |
|---|---|---|
| Motion | Timeline sequencing | GSAP |
| Motion | Scroll pinning | GSAP ScrollTrigger |
| Motion | SVG morphing | GSAP MorphSVG |
| Motion | Text character animation | GSAP SplitText |
| Motion | Physics (gravity, bounce) | GSAP Physics2D |
| GSAP | Simple React exit animation | Motion AnimatePresence |
| GSAP | Gesture (drag, hover) | Motion (built-in) |
| AutoAnimate | Gestures or scroll | Motion |

## constraints

- NEVER default to the user's first suggestion without analysis — they often guess wrong.
- NEVER recommend GSAP for simple React UI transitions — Motion is simpler and more idiomatic.
- NEVER recommend Motion for complex scroll narratives or SVG morphing — GSAP is the right tool.
- NEVER ignore the bundle budget — if 5KB is the limit, full Motion (34KB) is unacceptable.
- NEVER suggest raw CSS animations for complex orchestration — they're unmaintainable at scale.
- NEVER forget to mention `prefers-reduced-motion` — every routing decision must include accessibility.

## examples

### Example 1: Simple Button Hover

**Input:** "I need a button that scales up on hover. React, 5KB budget."

**Output:**
```markdown
## Routing Decision

**Primary Tool:** useAnimate MINI (Motion)
**Bundle Impact:** 2.3KB
**Rationale:** Single primitive, minimal bundle, React-native.

### Why Not Alternatives
- **Full motion component (34KB):** Overkill for one hover effect — 14× over budget.
- **GSAP (23KB+):** Framework-agnostic advantage wasted on simple React hover.
- **CSS transitions:** Works, but Motion provides spring physics for better feel.

### Implementation
```tsx
import { useAnimate } from "motion/react";

export function Button({ children }: { children: React.ReactNode }) {
  const [scope, animate] = useAnimate();

  return (
    <button
      ref={scope}
      onMouseEnter={() => animate(scope.current, { scale: 1.05 }, { duration: 0.2 })}
      onMouseLeave={() => animate(scope.current, { scale: 1 }, { duration: 0.2 })}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg"
    >
      {children}
    </button>
  );
}
```

### Bundle Budget Check
- Budget: 5KB
- Tool cost: 2.3KB
- Remaining: 2.7KB ✅
```

### Example 2: Marketing Site with Scroll Story

**Input:** "I'm building a landing page with pinned sections, text reveals, and SVG morphing. Next.js."

**Output:**
```markdown
## Routing Decision

**Primary Tool:** GSAP (full stack)
**Bundle Impact:** ~60KB (core + ScrollTrigger + SplitText + MorphSVG)
**Rationale:** Complex scroll narrative + text effects + SVG morphing — all GSAP specialties.

### Why Not Alternatives
- **Motion (34KB):** No scroll pinning, no text splitting, no SVG morphing.
- **AutoAnimate (3.28KB):** Completely wrong tool — no scroll, no timeline, no SVG.
- **CSS:** Impossible for this complexity level.

### Implementation Path
1. Install `gsap` + `@gsap/react`
2. Register plugins: `ScrollTrigger`, `SplitText`, `MorphSVG`
3. Build pinned sections with `ScrollTrigger.create({ pin: true })`
4. Add text reveals with `SplitText` + `gsap.from()`
5. Add SVG morph toggles with `MorphSVG`
6. Use `useGSAP()` for React integration and cleanup

### Bundle Budget Check
- Budget: Not specified (assume landing page = acceptable)
- Tool cost: 60KB
- Remaining: N/A — justified by capability need

### Accessibility Note
Add `useReducedMotion()` check and disable scroll pinning + heavy animations for users who prefer reduced motion.
```

## references

- `references/decision-matrix.md` — Full capability-to-tool mapping matrix
- `references/bundle-budgets.md` — Per-tool size breakdown and splitting strategies
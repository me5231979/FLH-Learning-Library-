# Feedback, Ready · Prep Like a Coach, Show Up Human

A short interactive course (Classroom 40 min / Core 30 / self-paced ~15) for
managers on using AI to prepare for 1:1s, draft behavior-based feedback, and
surface coaching opportunities from aggregate signals, while the conversation
itself stays fully human. Part of the AI-enabled Education Series and the Manager Voyage.

Part of the Vanderbilt Learning Series. Catalog:
[Course Library](https://me5231979.github.io/Course_Library/)

- **Learner edition:** https://me5231979.github.io/Course_Library/ai-coaching-feedback/
- **Facilitator edition:** https://me5231979.github.io/Course_Library/ai-coaching-feedback/facilitator/

## What it teaches (3 sections)

1. Prep, not outsource: the line between AI that sharpens conversations and
   AI that replaces you in them, plus the data rules (de-identify, approved
   VU tools, behavior not character)
2. The feedback draft: SBI structure, drilled in the graded Feedback Prep
   Lab (input, ask, rewrite, conversation)
3. Signals, not surveillance: aggregate survey themes and your own 1:1
   notes as coaching radar, bounded by the two-question test

Ends with a scored recap, the **1:1 Prep Card capstone**, a flip-card
glossary, printable cheat sheet, and prep card worksheet.

## The interactive tools

| Slide | Tool | What learners do |
|---|---|---|
| The principle | **Prep or outsource?** | Call five manager moves: prep, outsourcing, or over the data line |
| The draft | **The Feedback Prep Lab** | Prep a real feedback conversation in four graded choices |
| The signals | **Signal or surveillance?** | Call five data uses against the boundary |
| Recap | **Scored quiz** | 4 questions mapped to the objectives |
| Capstone | **My 1:1 Prep Card** | Build and copy a dated, private prep commitment |

## Citations to keep honest

SHRM Navigating AI in the Workplace (managers ~50% AI-assisted vs ICs ~34%);
Culture Amp AI Coach / Lattice / 15Five as embedded-coaching-AI market
context; SBI (Center for Creative Leadership's feedback structure). The
traffic light matches Start Smarter and AI 201 exactly.

## Editing map

- Copy: `index.html` · Recap: `QUESTIONS` in `assets/js/main.js`
- Trainers: `makeTrainer` configs (prepJudge, signalSort)
- Lab: `SLOTS` in the `#fbLab` block · Capstone maps: `PRACTICE` / `NOT` / `WHEN`
- Runbook: `facilitator/notes.json` (timing must sum: Full 40 / Core 30)
- Publish: `git push origin main && git branch -f gh-pages main && git push -f origin gh-pages`

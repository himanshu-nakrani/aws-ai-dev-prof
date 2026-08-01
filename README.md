# AIP-C01 Field Manual

A complete, beginner-to-exam-ready study site for the **AWS Certified Generative AI
Developer – Professional (AIP-C01)** exam.

Written for someone who has never opened the AWS console and has never heard the
word "token", and taken through to reasoning about chunking strategies, guardrail
policies and cost-per-token the way the exam expects.

## What's in it

| | |
|---|---|
| **15 pages** | Orientation, Module 0 foundations, one deep module per exam domain, service atlas, labs, cram sheet, glossary |
| **252 practice questions** | Original, blueprint-weighted, with an explanation for every option — including why each wrong one is wrong |
| **Exam simulator** | 75 questions / 180 minutes, domain mix matching the published weightings, scaled scoring, per-domain breakdown |
| **104 flashcards** | Eight decks with Leitner-style scheduling |
| **14 interactive widgets** | Tokenizer, sampling visualiser, embedding similarity lab, chunking playground, RAG pipeline stepper, cost calculator, guardrail simulator, retrieval tuner, context-budget planner, decision trees |
| **8 hands-on labs** | Runnable boto3 — RAG pipeline, tool use, agents, guardrails, evaluation harness, batch inference, cost attribution |
| **Charts and diagrams** | Hand-rolled SVG, no chart library, re-themes on toggle |

Progress, quiz history and flashcard scheduling persist in `localStorage`. Nothing
is uploaded anywhere.

## Viewing it

```bash
# any static server
python3 -m http.server -d docs 8000   # then open http://localhost:8000

# or just open the files
open docs/index.html
```

`docs/all-in-one.html` is the whole site as one self-contained file — every page,
all CSS and JS inlined, hash routing, zero external requests. Works offline and
from `file://`.

**GitHub Pages:** Settings → Pages → deploy from branch → `/docs`.

## Building

```bash
python3 build.py
```

No dependencies beyond the standard library. The generator reads content
fragments from `src/content/*.html`, wraps them in the shared shell, and writes:

- `docs/<slug>.html` — one page per fragment
- `docs/all-in-one.html` — single-file SPA bundle
- `docs/artifact.html` — body-only fragment for hosts that supply their own `<head>`
- `docs/assets/data/searchindex.js` — cross-page search index

It also injects the per-section "mark read" controls, builds each page's table of
contents, and wires up prev/next navigation. Page order, titles and reading-time
estimates all live in the `PAGES` list at the top of `build.py`.

## Layout

```
build.py                       generator — page list, shell, search index
src/
  content/*.html               the actual writing, one fragment per page
  assets/css/style.css         design system (dark-first, theme-aware, prints)
  assets/js/app.js             shell: theme, nav, SPA routing, progress, search
  assets/js/charts.js          SVG charts: donut, bar, line, scatter, gauge, heat
  assets/js/interactive.js     the 14 playable widgets
  assets/js/quiz.js            quiz engine, exam simulator, flashcards
  assets/data/q-d0..d5.js      question bank, one file per domain
  assets/data/flashcards.js    flashcard decks
docs/                          generated output (committed, for GitHub Pages)
```

## Adding or editing questions

Questions live in `src/assets/data/q-d{0..5}.js`:

```js
{ id:'d1-063', d:'d1', hard:false,
  q:'Scenario stem (HTML allowed)',
  o:['option A','option B','option C','option D'],
  a:[2],                                  // indexes; length > 1 => multi-select
  e:'Headline explanation',
  oe:['why A is wrong','why B is wrong','why C is right','why D is wrong'],
  ref:'Domain 1 → Chunking strategies' }
```

Multi-select stems must say "(Choose 2.)" — the exam simulator and the question
count in the UI both depend on the convention. Rebuild after editing.

## About the questions

Every question here is **original**, written against the published AIP-C01 exam
guide — its five domains, their task statements and their weightings — in the
scenario style the professional-tier exams use.

Nothing is recalled, scraped or reproduced from a real exam. Using leaked exam
content ("braindumps") violates the AWS Certification Agreement; AWS detects it
and revokes every certification you hold. It is also ineffective — item pools
rotate, and memorising stems teaches none of the reasoning the scenarios test.

## Accuracy

Service behaviour, feature availability and pricing on AWS change frequently, and
this exam is new. Everything here was written against sources current at the time
of writing, and prices are labelled as illustrative throughout — the exam tests
the *ordering* of magnitudes, never a specific figure.

**Always confirm against current AWS documentation before an exam booking or a
production decision.** The official exam guide PDF is the authority on scope:

- [Certification page](https://aws.amazon.com/certification/certified-generative-ai-developer-professional/)
- [Exam guide (PDF)](https://docs.aws.amazon.com/pdfs/aws-certification/latest/ai-professional-01/ai-professional-01.pdf)
- [AWS Skill Builder exam prep](https://skillbuilder.aws/category/exam-prep/generative-ai-developer-professional-AIP-C01)

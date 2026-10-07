# From Backend Engineer to AI Research Engineer

A self-study curriculum in three tracks. Each track is a career step you can be hired at, and each one builds the understanding the next track needs.

```
 Track 1                     Track 2                          Track 3
 AI Application Engineer ──► ML / AI Systems Engineer ──────► Research Engineer
 (use models well)           (train, tune, serve models)      (understand & improve models)
 ~3.5–4 months               ~7–9 months                      ~8–12 months, then ongoing

 ════════════════════ Math track runs alongside all three (math/) ═════════════════════
```

**Who this is for:** an experienced backend engineer (Rails, Python, Kafka, AWS, performance work) with no formal ML background who wants real depth rather than only API-level skill.

**Pace assumption:** 12–15 hours/week. Studying full-time roughly halves the timeline.

---

## Layout

| Folder | What's inside |
|---|---|
| [`00-setup/`](00-setup/README.md) | Python/ML tooling, GPU access, how to take notes. Do this first (1 week). |
| [`math/`](math/README.md) | The math track in three levels, matched to the three tracks. |
| [`track-1-ai-application-engineer/`](track-1-ai-application-engineer/README.md) | LLM APIs, prompting, RAG, agents, MCP, evals, production concerns, agent frameworks (LangGraph) & durable workflows (Temporal). |
| [`track-2-ml-systems-engineer/`](track-2-ml-systems-engineer/README.md) | Neural nets from scratch, deep learning, transformers, fine-tuning, GPUs, inference, distributed training, Kubernetes & GPU infrastructure. |
| [`track-3-research-engineer/`](track-3-research-engineer/README.md) | Deeper theory, RL and post-training, interpretability, reading and reproducing papers, doing research. |
| [`track-3-research-engineer/papers.md`](track-3-research-engineer/papers.md) | A reading list of core papers, ordered. |
| [`projects/`](projects/README.md) | Every capstone project in one place, plus a write-up template. |
| [`notes/`](notes/README.md) | Your learning log. One file per week. |
| The site | [learn.devmtnaing.com/ai-engineer](https://learn.devmtnaing.com/ai-engineer) is built from these files (`src/pages/ai-engineer/`): path, quizzes, flashcards, XP and streaks. |

---

## Timeline at a glance

| Month | Track work | Math alongside | You can apply for |
|---|---|---|---|
| 0 | Setup | – | – |
| 1–4 | **Track 1**: modules 1.1–1.8 + capstone (AI Factory Ops Agent v1) | Level 1 (vectors, similarity, softmax, basic probability) | AI Engineer (Agents & Applications), AI Product Engineer, backend roles on AI teams |
| 5–7 | **Track 2**: modules 2.1–2.5 (from scratch → fine-tuning) | Level 2 (linear algebra, calculus, probability, optimization) | – |
| 8–12 | **Track 2**: modules 2.6–2.10 (GPUs, inference, distributed, platform, Kubernetes) + capstones, Ops Agent v2 | Level 2 finish | **ML Platform / ML Infrastructure / Inference Engineer** |
| 13–18 | **Track 3**: modules 3.1–3.5 | Level 3 (deeper probability, optimization, information theory) | – |
| 19–24+ | **Track 3**: modules 3.6–3.7, paper reproductions, original work | Level 3 ongoing | **Research Engineer** (lab, applied research team, or fellowship such as MATS or Anthropic Fellows) |

You don't have to finish everything before moving on. Get a job at the Track 1 or Track 2 level and keep going while employed. That's the normal route.

---

## How each module works

Every module has the same four parts:

1. **Why it matters**: one or two lines.
2. **Learn**: *core* resources (do these) and *optional* ones (go deeper if you're curious).
3. **Build**: hands-on exercises. Not optional; this is where the learning happens.
4. **Checkpoint**: what you should be able to do or explain before moving on. If you can't do it, go back.

## Rules that make this work

1. **Implement before you import.** Before using a library for something (attention, LoRA, BM25, Adam), write a small version yourself in NumPy or PyTorch. It can be slow and ugly.
2. **Write up everything you build.** A README with what you tried, what failed, numbers and plots. Publish the good ones on devmtnaing.com. Write-ups are how you'll show depth to hiring managers.
3. **Measure, don't guess.** Every project needs a number: eval score, loss, tokens/sec, p95 latency, $ per 1M tokens. You already do this with APIs and databases; keep doing it.
4. **Learn the math when the code needs it.** Don't spend three months on math before touching a model. The `math/` track tells you which math to learn at which stage.
5. **Weekly rhythm:** about 60% building, 30% studying, 10% writing. Log the week in `notes/`.
6. **Explain it out loud.** If you can't explain a concept to a junior engineer on a whiteboard, you don't understand it yet. That was true for Kafka, and it's true for backprop.

---

## Progress

Tick these off as you go. The detailed checklists are in each track's README.

- [ ] 00 Setup complete
- [ ] Track 1 modules complete
- [ ] Track 1 capstone published
- [ ] Math Level 1
- [ ] Track 2 modules 2.1–2.5
- [ ] Track 2 modules 2.6–2.10
- [ ] Track 2 capstones published (at least 2 of 4)
- [ ] Math Level 2
- [ ] Track 3 modules 3.1–3.5
- [ ] Track 3 paper reproduction published
- [ ] Track 3 original study published
- [ ] Math Level 3

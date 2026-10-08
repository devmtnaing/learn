# Track 1 · AI Application Engineer

**Goal:** build reliable, measurable products on top of LLMs: APIs, prompting, retrieval, agents, tools/MCP, evals and production concerns.

**Duration:** ~3.5–4 months at 12–15 hrs/week. You have a head start from your MCP and support-automation work.

**Math alongside:** [Level 1](../math/README.md#level-1-intuition-with-track-1)

**Why this comes first:** you get a working mental model of what LLMs can and can't do, and a hireable skill set quickly. The evals habit from module 1.6 is what separates engineers with real depth in this area from those without it.

| # | Module | Weeks |
|---|---|---|
| 1.1 | How LLMs work (a user's mental model) | 1 |
| 1.2 | Working with model APIs | 1 |
| 1.3 | Prompt & context engineering | 1 |
| 1.4 | Embeddings, search & RAG | 2 |
| 1.5 | Tool use, agents & MCP | 2 |
| 1.6 | Evals ★ | 2 |
| 1.7 | Production: observability, security, cost | 1 |
| 1.8 | Agent frameworks & workflow orchestration | 2 |
| ⚑ | Capstone: AI Factory Ops Agent | 3–4 |

---

## 1.1 How LLMs work (a user's mental model)

**Why:** every later decision (prompt structure, context size, temperature, when to fine-tune) depends on this picture.

**Concepts:** tokens and tokenization; next-token prediction; logits → softmax → sampling (temperature, top-p); context windows; pretraining vs instruction tuning vs RLHF; why models hallucinate; reasoning/"thinking" models; what an embedding is.

**Learn**
- *Core:* Andrej Karpathy, [Intro to Large Language Models](https://www.youtube.com/watch?v=zjkBMFhNj_g) (1 hr)
- *Core:* Andrej Karpathy, [Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI) (3.5 hrs, full pipeline from data to RL)
- *Core:* 3Blue1Brown, [Transformers / attention chapters](https://www.3blue1brown.com/topics/neural-networks) (chapters 5–7)
- *Core:* Jay Alammar, [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)
- *Optional:* [OpenAI Tokenizer playground](https://platform.openai.com/tokenizer), or the tokenizer section of Karpathy's tokenizer video (Track 2)

**Build**
- [ ] Tokenize the same paragraph in English and Burmese with a tokenizer library. Compare token counts and explain what that means for cost and context length.
- [ ] Call a model with the same prompt at temperature 0, 0.7 and 1.2, 10 times each. Record how much the outputs vary.

**Checkpoint:** explain, without notes, what happens from "user sends prompt" to "token appears on screen", and why a model can state something false with confidence.

---

## 1.2 Working with model APIs

**Why:** this is your bread and butter, and it's mostly backend engineering you already know: HTTP, streaming, retries, rate limits, cost.

**Concepts:** messages and roles; system prompts; streaming (SSE); structured outputs/JSON; tool use (function calling); vision/PDF inputs; prompt caching; batch APIs; token counting; rate limits and retries with backoff; model selection by cost, latency and quality.

**Learn**
- *Core:* [Claude API documentation](https://platform.claude.com/docs): getting started, messages, streaming, tool use, prompt caching
- *Core:* [Anthropic courses](https://github.com/anthropics/courses) on GitHub: API fundamentals and tool use
- *Optional:* the OpenAI API docs, to see the shared patterns across providers

**Build**
- [ ] A Python CLI chat with streaming, conversation history and a running token and cost counter
- [ ] Extract structured data (name, amount, date, merchant) from 20 messy receipt texts into validated Pydantic models. Measure the accuracy.
- [ ] Add prompt caching to a long-system-prompt call and measure latency and cost before and after
- [ ] Wrap API calls with retry/backoff and a timeout, and compare two models on latency and price for the same task

**Checkpoint:** you can pick a model for a task and justify it with numbers (quality, p50/p95 latency, cost per 1k requests).

---

## 1.3 Prompt & context engineering

**Why:** what's in the context window decides the output. Most quality gains come from better context, not cleverer wording.

**Concepts:** clear instructions; role and system prompts; few-shot examples; XML/markdown structuring; chain of thought vs extended thinking; prompt chaining; long-context placement (put documents first, instructions after); context engineering (choosing which information goes in at all); prompt versioning.

**Learn**
- *Core:* Anthropic, [Prompt engineering interactive tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial)
- *Core:* [Prompt engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview) (Claude docs)
- *Core:* Anthropic, [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- *Optional:* [Prompt Engineering Guide](https://www.promptingguide.ai/) (broad survey)

**Build**
- [ ] Take one real task from your past work (e.g. classifying support tickets) and write three prompt versions. Score each on 30 labeled examples. Keep the prompts in git.
- [ ] Split a complex single prompt into a 2–3 step chain and compare quality and cost

**Checkpoint:** you have a habit of changing one thing, running it on a test set and comparing numbers. If you're judging prompts by eye, you're not there yet.

---

## 1.4 Embeddings, search & RAG

**Why:** most business AI apps are "LLM + your company's data". Retrieval quality usually limits answer quality.

**Concepts:** embeddings and vector similarity; chunking strategies; vector indexes (HNSW, IVF) at a conceptual level; keyword search (BM25) and **hybrid search**; reranking; metadata filtering; query rewriting; contextual retrieval; retrieval metrics (recall@k, MRR, nDCG); when RAG is the wrong tool.

**Learn**
- *Core:* Anthropic, [Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)
- *Core:* Eugene Yan, [Patterns for Building LLM-based Systems & Products](https://eugeneyan.com/writing/llm-patterns/)
- *Core:* [pgvector](https://github.com/pgvector/pgvector) README. You know Postgres, so start there before reaching for a dedicated vector database.
- *Core:* [Sentence Transformers documentation](https://www.sbert.net/)
- *Optional:* Chip Huyen, [*AI Engineering*](https://www.oreilly.com/library/view/ai-engineering/9781098166298/) (O'Reilly, 2025), the RAG chapter. It's the best single book for this whole track.
- *Optional:* Jo Kristian Bergum's writing on hybrid search and why BM25 is a strong baseline

**Build**
- [ ] **Implement first:** BM25 from scratch in Python (~50 lines), then cosine top-k search over embeddings in NumPy
- [ ] RAG over a real document set (e.g. a product's public docs or help center) using Postgres + pgvector
- [ ] Create 50 question → relevant-chunk pairs, then measure recall@5 for vector-only, BM25-only and hybrid search, with and without a reranker. Put the results in a table.
- [ ] Try two chunk sizes and contextual retrieval; report what changed and why

**Checkpoint:** when a RAG answer is wrong, you can tell whether retrieval failed (wrong chunks) or generation failed (right chunks, bad answer), because you measure them separately.

---

## 1.5 Tool use, agents & MCP

**Why:** agents (LLMs calling tools in a loop) are where a lot of hiring is right now, and your MCP experience is a real advantage.

**Concepts:** tool definitions and schemas; the agent loop (model → tool call → result → model); workflows vs agents (prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer); MCP servers, clients and transports; sub-agents; memory; human-in-the-loop; failure modes (loops, wrong tool, compounding errors); designing tools for agents to use.

**Learn**
- *Core:* Anthropic, [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- *Core:* Anthropic, [Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
- *Core:* [Model Context Protocol docs and spec](https://modelcontextprotocol.io/)
- *Core:* [Claude Agent SDK docs](https://code.claude.com/docs/en/agent-sdk/overview)
- *Optional:* Anthropic, [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
- *Optional:* Lilian Weng, [LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)

**Build**
- [ ] **Implement first:** an agent loop from scratch with the raw API (no framework): tools, max-steps guard, logging of every step
- [ ] An MCP server in Python exposing 3–4 tools over a real data source (e.g. a Postgres DB of orders and customers, much like your loyalty-platform work)
- [ ] The same task built as a fixed workflow and as an autonomous agent. Compare success rate, cost and latency over 30 runs.

**Checkpoint:** you can explain when *not* to use an agent, and you have numbers showing where your agent fails.

---

## 1.6 Evals ★ (most important module)

**Why:** you can't improve what you don't measure. Evals are what tell you whether a change was an improvement, and they're the base of everything in Tracks 2 and 3.

**Concepts:** error analysis (reading traces and labeling failure categories); code-based assertions; LLM-as-judge and how to validate the judge against human labels; reference-based vs reference-free metrics; golden datasets; regression testing in CI; online vs offline evals; statistical significance with small test sets; benchmark contamination.

**Learn**
- *Core:* Hamel Husain, [Your AI Product Needs Evals](https://hamel.dev/blog/posts/evals/)
- *Core:* Hamel Husain, [Using LLM-as-a-Judge](https://hamel.dev/blog/posts/llm-judge/)
- *Core:* Hamel Husain & Shreya Shankar, [LLM Evals FAQ](https://hamel.dev/blog/posts/evals-faq/)
- *Core:* Anthropic, [Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
- *Core:* [Inspect](https://inspect.aisi.org.uk/), an open-source eval framework from the UK AI Security Institute
- *Optional:* Eugene Yan, [Evaluating the Effectiveness of LLM-Evaluators](https://eugeneyan.com/writing/llm-evaluators/)
- *Optional:* Anthropic, [A statistical approach to model evaluations](https://www.anthropic.com/research/statistical-approach-to-model-evals)

**Build**
- [ ] Take your RAG app from 1.4 and do error analysis: read 50 traces, write a short note on each failure and group them into categories. Count them.
- [ ] Write code-based checks for the failure categories you can detect automatically
- [ ] Build an LLM judge for one subjective criterion and measure its agreement with your own labels (target over 85%)
- [ ] Run the eval suite in CI (GitHub Actions) and fail the build if the score drops
- [ ] Re-run your 1.3 prompt comparison with confidence intervals. Was the "winner" really better?

**Checkpoint:** for any AI feature, you can design an eval plan in 30 minutes covering the dataset, metrics, judge validation and pass threshold.

---

## 1.7 Production: observability, security, cost

**Why:** this is where your 12 years of backend work count most. Many AI engineers can't run a reliable service; you can.

**Concepts:** tracing LLM calls (inputs, outputs, tokens, latency); prompt and model versioning; caching (exact and semantic); fallbacks and model routing; rate limiting and queueing; cost attribution per feature or user; **prompt injection** and data exfiltration; PII handling; guardrails; streaming UX; feedback collection.

**Learn**
- *Core:* [OWASP Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/)
- *Core:* Simon Willison's [prompt injection series](https://simonwillison.net/tags/prompt-injection/), especially "the lethal trifecta"
- *Core:* [OpenTelemetry semantic conventions for GenAI](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
- *Optional:* an open-source LLM observability tool such as [Langfuse](https://langfuse.com/docs) (self-hostable)
- *Optional:* Simon Willison's [blog](https://simonwillison.net/), a reliable way to keep up with the field

**Build**
- [ ] Add tracing to your agent or RAG app: every call logged with prompt version, tokens, latency and cost
- [ ] Red-team your own app: try 10 prompt injections (including through retrieved documents). Fix what you can and document what you can't.
- [ ] Add a cost dashboard and a per-user rate limit

**Checkpoint:** you can explain why "LLM + private data + untrusted input + ability to send data out" is dangerous, and how you'd design around it.

---

## 1.8 Agent frameworks & workflow orchestration

**Why:** you built agents from scratch in 1.5 so you understand what's underneath. Most job ads still list frameworks by name (LangGraph, LlamaIndex, AutoGen) and durable workflow engines (Temporal, Dagster, Prefect, Airflow). Now learn them, and judge them against your from-scratch version.

**Concepts:** agents as graphs (nodes, edges, shared state, conditional routing); checkpointing and resuming; human-in-the-loop interrupts; multi-agent patterns (supervisor, hierarchical, handoffs, swarm); framework abstractions and what they hide; **durable execution** (workflows that survive crashes and restarts, retries, timeouts, long-running human approvals); activities vs workflows; event-driven triggers; serving agents behind FastAPI with streaming.

**Learn**
- *Core:* [LangGraph documentation](https://docs.langchain.com/oss/python/langgraph/overview): quickstart, persistence, human-in-the-loop, multi-agent
- *Core:* [Temporal documentation](https://docs.temporal.io/) and the free [Temporal 101 (Python)](https://learn.temporal.io/courses/temporal_101/python/) course. Coming from Kafka, durable execution will make sense quickly.
- *Core:* [FastAPI tutorial](https://fastapi.tiangolo.com/tutorial/), the user guide sections on async, dependencies and background tasks
- *Optional:* [LlamaIndex documentation](https://docs.llamaindex.ai/), strongest for RAG-heavy and document-ingestion pipelines
- *Optional:* [Microsoft AutoGen](https://microsoft.github.io/autogen/), conversation-based multi-agent
- *Optional:* [Pydantic AI](https://ai.pydantic.dev/), a lightweight typed agent framework
- *Optional:* [Dagster](https://docs.dagster.io/), asset-based data orchestration, good for knowledge-ingestion pipelines

**Build**
- [ ] Rebuild your 1.5 from-scratch agent in LangGraph, with a human-approval interrupt before any write action and checkpointing so a run can resume. Compare lines of code, debuggability and behavior with your raw version.
- [ ] A supervisor + 2 specialist agents in LangGraph (e.g. a "retrieval" agent and an "analysis" agent). Run your 1.6 evals on single-agent vs multi-agent and compare quality, cost and latency.
- [ ] Rewrite the 1.4 ingestion pipeline as a Temporal workflow (fetch → chunk → embed → upsert) and kill the worker mid-run to watch it resume
- [ ] A long-running Temporal workflow that waits hours or days for a human approval signal before the agent acts
- [ ] Serve the agent through FastAPI with SSE streaming and request tracing

**Checkpoint:** you can explain when a framework helps and when it gets in the way, and when you need a durable workflow engine rather than a simple job queue. Back both answers with something you built.

---

## ⚑ Track 1 Capstone

See [`projects/README.md`](../projects/README.md#track-1-capstone-ai-factory-ops-agent) for the full spec.

**AI Factory Ops Agent.** A multi-agent system for GPU-infrastructure operations. It ingests benchmark results, runbooks and docs; answers questions like "why is this inference workload slow?"; recommends configurations; and queries Kubernetes and Prometheus through MCP tools, with human approval before any action. It also includes evals in CI, injection defences and a public write-up with numbers. It covers nearly every requirement of AI Engineer (Agents) roles at infrastructure companies, and you upgrade it in Track 2 with your own benchmark data.

## Track 1 complete when

- [ ] All module checkpoints passed
- [ ] Capstone published with a write-up containing at least one results table
- [ ] Resume updated: AI work at the top, outcomes with numbers
- [ ] Math Level 1 complete
- [ ] You can do a 45-minute interview walkthrough: "design a RAG system for X and tell me how you'd know it's working"
- [ ] You can answer: "design a multi-agent system that acts on production infrastructure safely". Cover the architecture, human-in-the-loop, permissions, evals and failure handling.

**Roles you can target now:** AI Engineer, Senior AI Engineer (Agents & Applications), Applied AI Engineer, AI Product Engineer, Backend Engineer (AI platform).

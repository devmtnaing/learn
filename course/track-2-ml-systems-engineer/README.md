# Track 2 · ML / AI Systems Engineer

**Goal:** understand neural networks from first principles, then train, fine-tune, optimize and serve them efficiently. This is where your backend, infrastructure and performance experience pays off most.

**Duration:** ~7–9 months at 12–15 hrs/week.

**Math alongside:** [Level 2](../math/README.md#level-2-working-math-for-deep-learning-with-track-2)

**Why this comes second:** Track 1 showed you what models do. Track 2 shows you how they work and how to make them faster and cheaper. Systems skills (inference, GPU efficiency, distributed training) are scarce, well paid and hard to automate.

| # | Module | Weeks | Part |
|---|---|---|---|
| 2.1 | PyTorch fluency | 2 | A · Foundations |
| 2.2 | Neural networks from scratch | 4 | A · Foundations |
| 2.3 | Deep learning fundamentals | 4 | A · Foundations |
| 2.4 | Transformers & LLMs from scratch ★ | 4 | A · Foundations |
| 2.5 | Fine-tuning & post-training | 3 | B · Working with real models |
| 2.6 | GPUs & performance ★ | 4 | C · Systems |
| 2.7 | Inference & serving ★ | 3 | C · Systems |
| 2.8 | Distributed training | 3 | C · Systems |
| 2.9 | ML platform & MLOps | 2 | C · Systems |
| 2.10 | Kubernetes & GPU infrastructure | 3 | C · Systems |
| ⚑ | Capstones (pick at least 2 of 4) | ongoing | |

---

## Part A: Foundations

### 2.1 PyTorch fluency

**Why:** PyTorch is the language of the field. You need to be fluent with tensors, as you are with ActiveRecord.

**Concepts:** tensors, dtypes, devices; broadcasting; indexing and reshaping (`view`, `reshape`, `permute`, `transpose`, contiguity); autograd; `nn.Module`; `Dataset`/`DataLoader`; the training loop (forward, loss, backward, step, zero_grad); saving and loading; `einsum`.

**Learn**
- *Core:* [PyTorch tutorials: Learn the Basics](https://pytorch.org/tutorials/beginner/basics/intro.html), then [Introduction to PyTorch – YouTube series](https://pytorch.org/tutorials/beginner/introyt/introyt_index.html)
- *Core:* Sasha Rush, [Tensor Puzzles](https://github.com/srush/Tensor-Puzzles). Solving these makes you fluent with broadcasting.
- *Optional:* [Zero to Mastery: Learn PyTorch](https://www.learnpytorch.io/)

**Build**
- [ ] Complete Tensor Puzzles
- [ ] Train an MLP on MNIST with a hand-written training loop (no Lightning or Trainer). Log loss and accuracy to W&B.

**Checkpoint:** you can predict the output shape of any line of tensor code before running it.

---

### 2.2 Neural networks from scratch

**Why:** this is the most important foundation in the whole curriculum. Once you've built backprop yourself, the rest of deep learning stops being mysterious.

**Learn**
- *Core:* Andrej Karpathy, [Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html). Do these lectures in this module:
  1. The spelled-out intro to neural networks and backpropagation: building **micrograd**
  2. **makemore** Part 1: bigram language model
  3. makemore Part 2: MLP
  4. makemore Part 3: activations, gradients, BatchNorm
  5. makemore Part 4: becoming a backprop ninja (manual backprop through everything)
  6. makemore Part 5: building a WaveNet
- *Core:* Michael Nielsen, [Neural Networks and Deep Learning](http://neuralnetworksanddeeplearning.com/), chapters 1–3 (free online book)

**How to do Karpathy's lectures properly:** watch a section, pause, **type the code yourself** (never copy-paste), then close the video and rebuild it from memory the next day. Expect 3–4× the video length.

**Build**
- [ ] micrograd rebuilt from memory, with unit tests comparing gradients to PyTorch
- [ ] makemore through Part 5, with your own notes on every "aha" moment
- [ ] Backprop ninja exercise (Part 4) fully completed. It's hard, and it's worth it.

**Checkpoint:** you can implement a 2-layer MLP with manual backprop in NumPy (no autograd), train it, and get the same loss curve as the PyTorch version.

---

### 2.3 Deep learning fundamentals

**Why:** you need to know *why* training works or fails so you can debug real runs.

**Concepts:** loss landscapes; weight initialization (Xavier/He); activation functions; normalization (BatchNorm, LayerNorm, RMSNorm); residual connections; regularization (dropout, weight decay, data augmentation); overfitting vs underfitting; learning-rate schedules; CNNs at a conceptual level; embeddings; vanishing and exploding gradients; mixed precision at a conceptual level.

**Learn**
- *Core:* Simon Prince, [*Understanding Deep Learning*](https://udlbook.github.io/udlbook/) (free PDF + notebooks), chapters 1–11. The clearest modern deep learning textbook, with excellent figures.
- *Core:* Andrej Karpathy, [A Recipe for Training Neural Networks](https://karpathy.github.io/2019/04/25/recipe/). Re-read it every few months.
- *Core:* [Stanford CS231n](https://cs231n.stanford.edu/) course notes on optimization, backprop, neural networks parts 1–3 and CNNs. Do assignment 1 or 2.
- *Optional:* fast.ai, [Practical Deep Learning for Coders](https://course.fast.ai/), a top-down complement if you want more applied practice
- *Optional:* [Dive into Deep Learning (d2l.ai)](https://d2l.ai/), an interactive textbook with code
- *Optional:* Google, [Deep Learning Tuning Playbook](https://github.com/google-research/tuning_playbook)

**Build**
- [ ] Do the UDL notebooks for chapters 6–9
- [ ] Ablation study on CIFAR-10 with a small CNN: no normalization vs BatchNorm, no residuals vs residuals, three learning rates. Plot everything in W&B and write up the results.
- [ ] Deliberately break training (bad init, LR too high, a missing `zero_grad`) and record what each failure looks like in the loss curve

**Checkpoint:** shown a bad loss curve, you can give the three most likely causes.

---

### 2.4 Transformers & LLMs from scratch ★

**Why:** the transformer is the core architecture of modern AI. Building one end to end takes you from someone who uses LLMs to someone who understands them.

**Concepts:** tokenization (BPE); token and positional embeddings (learned, RoPE); self-attention (Q, K, V); causal masking; multi-head attention; MLP blocks; pre-norm residual stream; the language-modeling loss; sampling; KV cache; scaling (params, data, compute); modern variants (RMSNorm, SwiGLU, GQA, MoE).

**Learn**
- *Core:* Karpathy Zero to Hero, the rest of the series:
  1. **Let's build GPT: from scratch, in code, spelled out**
  2. **Let's build the GPT Tokenizer**
  3. **Let's reproduce GPT-2 (124M)**, plus the [build-nanogpt repo](https://github.com/karpathy/build-nanogpt)
- *Core:* Sebastian Raschka, [*Build a Large Language Model (From Scratch)*](https://github.com/rasbt/LLMs-from-scratch) (book + free code repo)
- *Core:* Vaswani et al., [Attention Is All You Need](https://arxiv.org/abs/1706.03762). Read it *after* building GPT, when it will make sense.
- *Core:* Harvard NLP, [The Annotated Transformer](https://nlp.seas.harvard.edu/annotated-transformer/)
- *Optional:* [Hugging Face LLM Course](https://huggingface.co/learn/llm-course), chapters 1–4 for the HF ecosystem
- *Optional:* [Stanford CS224n](https://web.stanford.edu/class/cs224n/) lectures on transformers and pretraining
- *Optional:* Sebastian Raschka's [blog](https://magazine.sebastianraschka.com/), with architecture comparisons of new open models

**Build**
- [ ] Your own GPT (character-level, then BPE) trained on a dataset you like, e.g. Burmese text
- [ ] BPE tokenizer from scratch; compare its compression on English vs Burmese with GPT-4's tokenizer
- [ ] Add a KV cache to your GPT's generation and measure the speedup at sequence lengths 128, 512, 1024
- [ ] Swap in RoPE, RMSNorm and SwiGLU one at a time and compare validation loss
- [ ] **Capstone A** (see projects): reproduce GPT-2 124M

**Checkpoint:** on a blank page, write a transformer block in PyTorch from memory and explain every tensor shape.

---

## Part B: Working with real models

### 2.5 Fine-tuning & post-training

**Why:** most companies won't pretrain, but many will fine-tune. Knowing *when* to fine-tune (rather than prompt or use RAG) and how to do it is a core skill.

**Concepts:** pretraining → SFT → preference tuning (RLHF, DPO) → RL with verifiable rewards; full fine-tuning vs **LoRA/QLoRA** (and why low-rank works); chat templates; dataset curation and formatting; catastrophic forgetting; overfitting on small data; evaluating fine-tuned models; distillation; synthetic data.

**Learn**
- *Core:* [Hugging Face LLM Course](https://huggingface.co/learn/llm-course), chapters on fine-tuning
- *Core:* [TRL documentation](https://huggingface.co/docs/trl) (SFTTrainer, DPOTrainer) and [PEFT documentation](https://huggingface.co/docs/peft)
- *Core:* Papers: [LoRA](https://arxiv.org/abs/2106.09685), [QLoRA](https://arxiv.org/abs/2305.14314), [DPO](https://arxiv.org/abs/2305.18290)
- *Core:* Nathan Lambert, [*RLHF Book*](https://rlhfbook.com/) (free online), chapters on the overall pipeline, SFT and DPO
- *Optional:* [Unsloth](https://docs.unsloth.ai/), fast single-GPU fine-tuning
- *Optional:* [InstructGPT paper](https://arxiv.org/abs/2203.02155), the original RLHF pipeline

**Build**
- [ ] **Implement first:** a LoRA layer from scratch (wrap `nn.Linear` with A·B low-rank matrices) and fine-tune your own GPT with it
- [ ] Use QLoRA to fine-tune a small open model (1–8B) on a narrow task from your domain (e.g. support-ticket classification and response). Compare with the base model and with a prompted frontier model on your eval set.
- [ ] Run a small DPO pass on preference pairs and measure the change
- [ ] **Capstone B** (see projects)

**Checkpoint:** you can argue in a design review whether a problem needs prompting, RAG, fine-tuning or a combination, and back it up with your own experiment results.

---

## Part C: Systems (your differentiator)

### 2.6 GPUs & performance ★

**Why:** this matches your API and database optimization background. Same mindset (profile, find the bottleneck, fix it), different hardware.

**Concepts:** GPU architecture (SMs, warps, threads, memory hierarchy: HBM, L2, shared memory, registers); **compute-bound vs memory-bound vs overhead-bound**; the roofline model; arithmetic intensity; FLOPs and MFU (model FLOPs utilization); mixed precision (fp16, bf16, fp8); kernel fusion; `torch.compile`; the PyTorch profiler; FlashAttention (why tiling beats materializing the attention matrix); writing kernels in Triton; CUDA basics.

**Learn**
- *Core:* Horace He, [Making Deep Learning Go Brrrr From First Principles](https://horace.io/brrr_intro.html). Read it first.
- *Core:* [GPU MODE lectures](https://github.com/gpu-mode/lectures) (YouTube + code), the community for this skill
- *Core:* [Triton tutorials](https://triton-lang.org/main/getting-started/tutorials/index.html): vector add, fused softmax, matmul
- *Core:* [PyTorch Profiler recipe](https://pytorch.org/tutorials/recipes/recipes/profiler_recipe.html) and [`torch.compile` intro](https://pytorch.org/tutorials/intermediate/torch_compile_tutorial.html)
- *Core:* FlashAttention [paper](https://arxiv.org/abs/2205.14135); read for the IO-aware idea
- *Optional:* Hwu, Kirk & El Hajj, *Programming Massively Parallel Processors* (4th ed.), the CUDA textbook. GPU MODE runs a reading group on it.
- *Optional:* Sasha Rush, [GPU Puzzles](https://github.com/srush/GPU-Puzzles) and [Triton Puzzles](https://github.com/srush/Triton-Puzzles)
- *Optional:* [MIT 6.5940 TinyML and Efficient Deep Learning](https://efficientml.ai/) (Song Han), on pruning, quantization and efficient architectures

**Build**
- [ ] Profile your GPT training loop: find the top 5 time consumers and make three improvements (bf16, `torch.compile`, fused AdamW, better batch size). Report tokens/sec and MFU before and after.
- [ ] Complete GPU Puzzles
- [ ] Write a fused softmax and a matmul in Triton and benchmark them against PyTorch
- [ ] Compute the arithmetic intensity of a matmul vs a layernorm and place both on a roofline plot for your GPU
- [ ] **Capstone D** (see projects)

**Checkpoint:** given a slow training or inference job, you can say whether it's compute-, memory- or overhead-bound, and what you'd try first.

---

### 2.7 Inference & serving ★

**Why:** inference is where most of the money goes in production AI. Making it cheaper and faster is directly valuable to any company running models, and it's close to the systems work you already do.

**Concepts:** prefill vs decode phases; KV cache memory math; batching (static, dynamic, **continuous**); **PagedAttention**; prefix caching; time to first token (TTFT), inter-token latency, throughput; **quantization** (INT8, INT4, FP8; weight-only vs activations; GPTQ, AWQ); **speculative decoding**; tensor parallelism for inference; serving engines; autoscaling GPU workloads; cost per million tokens.

**Learn**
- *Core:* [vLLM documentation](https://docs.vllm.ai/) and the [PagedAttention paper](https://arxiv.org/abs/2309.06180)
- *Core:* [SGLang documentation](https://docs.sglang.ai/) (RadixAttention, structured generation)
- *Core:* Papers: [GPTQ](https://arxiv.org/abs/2210.17323), [AWQ](https://arxiv.org/abs/2306.00978), [Speculative Decoding](https://arxiv.org/abs/2211.17192)
- *Core:* [Hugging Face: Quantization overview](https://huggingface.co/docs/transformers/main/en/quantization/overview)
- *Optional:* Lilian Weng, [Large Transformer Model Inference Optimization](https://lilianweng.github.io/posts/2023-01-10-inference-optimization/)
- *Optional:* [llama.cpp](https://github.com/ggml-org/llama.cpp), CPU/Mac inference and the GGUF quantization formats

**Build**
- [ ] **Implement first:** continuous batching for your own GPT (a simple scheduler that adds and removes sequences each step) and compare throughput with static batching
- [ ] Write the KV cache memory formula and verify it against real GPU memory use
- [ ] INT8 weight quantization of your GPT from scratch; measure size, speed and loss change
- [ ] **Capstone C** (see projects): inference benchmark on AWS

**Checkpoint:** you can size a deployment: given a model, traffic and latency SLO, estimate the GPUs needed and the monthly cost, then check the estimate against a benchmark.

---

### 2.8 Distributed training

**Why:** large models don't fit on one GPU. Even if you never train a frontier model, you'll fine-tune across several GPUs and need to read papers that assume this knowledge.

**Concepts:** data parallelism (DDP); all-reduce and other collectives (NCCL); gradient accumulation; activation checkpointing; **ZeRO stages / FSDP**; tensor parallelism; pipeline parallelism; sequence/context parallelism; expert parallelism (MoE); memory math (params + gradients + optimizer states + activations); interconnects (NVLink, InfiniBand); fault tolerance and checkpointing.

**Learn**
- *Core:* Hugging Face, [The Ultra-Scale Playbook: Training LLMs on GPU Clusters](https://huggingface.co/spaces/nanotron/ultrascale-playbook)
- *Core:* Google DeepMind, [How to Scale Your Model](https://jax-ml.github.io/scaling-book/). It's TPU/JAX-flavored, but the math applies everywhere.
- *Core:* [PyTorch DDP tutorial](https://pytorch.org/tutorials/intermediate/ddp_tutorial.html) and [FSDP tutorial](https://pytorch.org/tutorials/intermediate/FSDP_tutorial.html)
- *Core:* Stas Bekman, [Machine Learning Engineering](https://github.com/stas00/ml-engineering) (open book): debugging, hardware, network, training at scale
- *Optional:* [ZeRO paper](https://arxiv.org/abs/1910.02054), [Megatron-LM paper](https://arxiv.org/abs/1909.08053)

**Build**
- [ ] Memory calculator script: given params, precision, optimizer and parallelism strategy, output GB per GPU. Check it against a real run.
- [ ] Train your GPT with DDP on 2+ GPUs (rented for a few hours), then FSDP. Measure scaling efficiency.
- [ ] Implement data-parallel all-reduce manually with `torch.distributed` primitives

**Checkpoint:** you can explain what ZeRO stages 1, 2 and 3 shard, and pick a parallelism strategy for a given model size and GPU count.

---

### 2.9 ML platform & MLOps

**Why:** this module puts your backend and DevOps background together with ML. Many "ML Platform Engineer" jobs are mostly this.

**Concepts:** experiment tracking; dataset versioning; reproducibility (seeds, configs, environments); training pipelines and orchestration; model registries; eval harnesses as a service; CI/CD for models; GPU cluster scheduling (Kubernetes, Slurm); monitoring (data drift, quality regressions); feature stores at a conceptual level; data quality pipelines.

**Learn**
- *Core:* Chip Huyen, *Designing Machine Learning Systems* (O'Reilly, 2022)
- *Core:* Goku Mohandas, [Made With ML](https://madewithml.com/) (MLOps course)
- *Core:* EleutherAI, [lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness), the standard benchmark runner
- *Optional:* [Full Stack Deep Learning](https://fullstackdeeplearning.com/) course materials
- *Optional:* [Ray](https://docs.ray.io/) docs (Ray Train, Ray Serve), common in ML platforms

**Build**
- [ ] Turn your fine-tuning project into a reproducible pipeline: config file → data prep → train → eval → register model, all one command, with W&B tracking
- [ ] Run lm-evaluation-harness on your fine-tuned model vs the base model on 3 benchmarks

**Checkpoint:** anyone could clone your repo and reproduce your best model and its eval numbers.

---

### 2.10 Kubernetes & GPU infrastructure

**Why:** most production model serving, and most "AI factory" platforms, run on Kubernetes with GPU scheduling. Agents that diagnose or operate infrastructure (as in the Track 1 capstone) need someone who understands what they're touching. Your AWS, auto-scaling and DevOps background carries over directly.

**Concepts:** pods, deployments, services, ingress, ConfigMaps/Secrets; resource requests and limits; **GPU scheduling** (NVIDIA device plugin, GPU Operator, node selectors and taints, MIG and time-slicing); model serving on k8s (vLLM deployments, KServe, LLM-aware routing); autoscaling (HPA, KEDA on queue depth or tokens/sec, cold-start costs of large model weights); batch and training job scheduling (Kueue, Slurm, gang scheduling); observability (Prometheus, Grafana, **DCGM exporter** for GPU metrics such as utilization, memory, temperature and XID errors); RBAC and least-privilege service accounts (critical when agents call the k8s API); common failure modes (OOMKilled, pending pods with no GPU, image pull of 20GB+ weights, NCCL timeouts).

**Learn**
- *Core:* [Kubernetes basics tutorial](https://kubernetes.io/docs/tutorials/kubernetes-basics/), then [kind](https://kind.sigs.k8s.io/) for a local cluster
- *Core:* [NVIDIA GPU Operator docs](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/index.html) and [DCGM exporter](https://github.com/NVIDIA/dcgm-exporter)
- *Core:* [vLLM on Kubernetes](https://docs.vllm.ai/en/latest/deployment/k8s.html) and the [vLLM production stack](https://docs.vllm.ai/projects/production-stack/en/latest/)
- *Core:* [Prometheus overview](https://prometheus.io/docs/introduction/overview/) and [Grafana getting started](https://grafana.com/docs/grafana/latest/getting-started/)
- *Core:* [Kubernetes RBAC good practices](https://kubernetes.io/docs/concepts/security/rbac-good-practices/)
- *Optional:* [KServe](https://kserve.github.io/website/), [KEDA](https://keda.sh/), [Kueue](https://kueue.sigs.k8s.io/), [llm-d](https://llm-d.ai/) (distributed LLM inference on k8s)
- *Optional:* [Slurm overview](https://slurm.schedmd.com/overview.html), still the default scheduler on many GPU training clusters
- *Optional:* Kelsey Hightower, [Kubernetes The Hard Way](https://github.com/kelseyhightower/kubernetes-the-hard-way), to understand the control plane

**Build**
- [ ] Local kind cluster: deploy your FastAPI agent service from 1.8 with Prometheus + Grafana, and break it on purpose (OOM, bad config, crash loop). Write a runbook for each failure; these runbooks feed your ops agent.
- [ ] Rent a small GPU k8s cluster (EKS with one or two GPU nodes, or a managed GPU cloud) and install the GPU Operator and DCGM exporter. Deploy vLLM and build a Grafana dashboard of GPU utilization, KV-cache usage, TTFT and throughput.
- [ ] Autoscale vLLM replicas with KEDA on a custom metric (queue length or running requests) and measure scale-up time, including model-weight loading
- [ ] Create a read-only, namespace-scoped service account for your ops agent and prove it can't delete or modify anything
- [ ] Upgrade the Track 1 capstone: point its MCP tools at this real cluster and your own Capstone C benchmark data

**Checkpoint:** given "the inference service p95 latency doubled since yesterday", you can work through k8s events, pod status, DCGM GPU metrics and vLLM metrics to the cause. You can also explain which of those steps an agent could safely do for you.

---

## Track 2 complete when

- [ ] All module checkpoints passed
- [ ] At least 2 of 4 Track 2 capstones published with write-ups
- [ ] Math Level 2 complete
- [ ] You can do these interview whiteboards: "implement attention", "estimate the memory to fine-tune a 7B model", "why is decode memory-bound?", "design an inference platform for X req/s on Kubernetes, including GPU scheduling and autoscaling"

**Roles you can target now:** ML Platform Engineer, ML Infrastructure Engineer, Inference / Model Serving Engineer, ML Engineer (LLMs), AI Infrastructure Engineer.

// Concept-check questions per module, keyed by module id from content.json.
// `a` is the index of the correct option.
export type Question = { q: string; o: string[]; a: number; why: string }

export const quizzes: Record<string, Question[]> = {
  // ───────────── Track 1 ─────────────
  't1-1.1': [
    {
      q: 'What does an LLM actually compute at each generation step?',
      o: ['The full answer in one pass', 'A probability distribution over the next token', 'A database lookup of similar text', 'A fixed rule chosen by the system prompt'],
      a: 1,
      why: 'The model outputs logits over its vocabulary; softmax turns them into probabilities and one token is sampled. Repeat until done.',
    },
    {
      q: 'Lowering temperature towards 0 makes outputs…',
      o: ['More random', 'More deterministic, favouring the top token', 'Longer', 'Cheaper per token'],
      a: 1,
      why: 'Temperature divides the logits before softmax. Small T sharpens the distribution so the most likely token dominates.',
    },
    {
      q: 'Why does the same sentence often cost more tokens in Burmese than in English?',
      o: ['Burmese models are bigger', 'Tokenizers are trained mostly on English, so other scripts split into more, smaller pieces', 'APIs charge extra for Unicode', 'Burmese needs a separate system prompt'],
      a: 1,
      why: 'BPE vocabularies reflect their training data. Under-represented scripts get fragmented, which raises cost and uses up context.',
    },
    {
      q: 'Which stage turns a raw base model into a helpful assistant?',
      o: ['Pretraining on more web text', 'Tokenization', 'Post-training (instruction tuning, RLHF/RL)', 'Increasing the context window'],
      a: 2,
      why: 'Pretraining gives knowledge and fluency; post-training teaches the assistant format, helpfulness and refusals.',
    },
  ],
  't1-1.2': [
    {
      q: 'You send the same 20k-token system prompt on every request. What cuts cost and latency the most?',
      o: ['Raise max_tokens', 'Prompt caching', 'Use temperature 0', 'Stream the response'],
      a: 1,
      why: 'Caching lets the provider reuse the processed prefix, so repeated input tokens are much cheaper and faster.',
    },
    {
      q: 'Streaming mainly improves…',
      o: ['Total cost', 'Perceived latency (time to first token shown)', 'Answer accuracy', 'Rate limits'],
      a: 1,
      why: 'Total generation time is similar, but users see output immediately instead of waiting for the full response.',
    },
    {
      q: 'In tool use (function calling), who executes the tool?',
      o: ['The model provider', 'Your application code', 'The tokenizer', 'Nobody, it is simulated'],
      a: 1,
      why: 'The model emits a structured tool-call request; your code runs it and sends the result back as the next message.',
    },
    {
      q: 'Best way to handle a 429 rate-limit response?',
      o: ['Retry immediately in a tight loop', 'Retry with exponential backoff and jitter', 'Switch to a bigger model', 'Drop the request silently'],
      a: 1,
      why: 'Same as any backend API: back off, add jitter to avoid thundering herds, and cap retries.',
    },
  ],
  't1-1.3': [
    {
      q: 'With a long document plus a question, where should the question usually go?',
      o: ['Before the document', 'After the document', 'In the temperature setting', 'It does not matter at all'],
      a: 1,
      why: 'Putting long material first and the instructions/question at the end tends to give better results with long contexts.',
    },
    {
      q: 'Prompt A scores 82% and prompt B 85% on 30 examples. What should you conclude?',
      o: ['B is clearly better; ship it', 'The difference may be noise; check confidence intervals or use more examples', 'A is better because it is shorter', 'Neither works'],
      a: 1,
      why: 'One example is about 3.3 points here. With n=30 the standard error is large, so a 3-point gap is easily noise.',
    },
    {
      q: '"Context engineering" mainly means…',
      o: ['Finding magic wording', 'Deciding what information goes into the context window, and in what form', 'Maximising context length', 'Fine-tuning the model'],
      a: 1,
      why: 'The model can only use what is in context. Choosing, trimming and structuring that information matters most.',
    },
    {
      q: 'Why split one complex prompt into a chain of smaller steps?',
      o: ['It always costs less', 'Each step is simpler, easier to test and easier to debug', 'Models cannot handle long prompts', 'To avoid tool use'],
      a: 1,
      why: 'Chains trade some latency and cost for reliability and observability, much like splitting a big function.',
    },
  ],
  't1-1.4': [
    {
      q: 'Your RAG bot gives a wrong answer. What should you check first?',
      o: ['Switch to a bigger model', 'Whether the right chunks were retrieved', 'Increase temperature', 'Add more documents'],
      a: 1,
      why: 'Separate retrieval failures from generation failures. If the right chunk was never retrieved, the model could not have answered.',
    },
    {
      q: 'Why combine BM25 with vector search (hybrid search)?',
      o: ['BM25 is newer', 'Keyword search catches exact terms (IDs, error codes, names) that embeddings can miss', 'It removes the need for chunking', 'Vector search cannot rank'],
      a: 1,
      why: 'Embeddings capture meaning; BM25 nails exact lexical matches. Together they usually beat either alone.',
    },
    {
      q: 'What does recall@5 measure?',
      o: ['Answer fluency', 'Share of queries where a relevant chunk appears in the top 5 results', 'Latency of the top 5 calls', 'Number of chunks per document'],
      a: 1,
      why: 'It is a retrieval metric: did the right evidence make it into what the model sees?',
    },
    {
      q: 'What does a reranker do?',
      o: ['Re-embeds the whole corpus', 'Rescores a shortlist of candidates with a more accurate (slower) model', 'Rewrites the user query', 'Deletes duplicate chunks'],
      a: 1,
      why: 'Fast retrieval fetches about 50–100 candidates; a cross-encoder reranker orders them more precisely before the top-k go to the LLM.',
    },
  ],
  't1-1.5': [
    {
      q: 'The steps are known and fixed (fetch → classify → reply). What should you build?',
      o: ['An autonomous multi-agent system', 'A workflow (prompt chain or router)', 'A fine-tuned model', 'A swarm'],
      a: 1,
      why: 'Use agents only when the path cannot be known in advance. Workflows are cheaper, faster and more predictable.',
    },
    {
      q: 'What problem does MCP solve?',
      o: ['Model training speed', 'A standard way to connect tools and data sources to any compatible AI client', 'GPU scheduling', 'Prompt caching'],
      a: 1,
      why: 'Model Context Protocol standardises tool and resource servers, so one integration works across clients.',
    },
    {
      q: 'Which guard is essential in a from-scratch agent loop?',
      o: ['A maximum step count', 'A higher temperature', 'Removing the system prompt', 'Disabling logging'],
      a: 0,
      why: 'Agents can loop forever. Cap the steps, log every tool call, and fail cleanly.',
    },
    {
      q: 'A common reason agents fail on multi-step tasks is…',
      o: ['Errors compound across steps', 'Tools run too fast', 'Too few tokens in the vocabulary', 'JSON is unsupported'],
      a: 0,
      why: '95% per-step reliability over 10 steps is only about 60% end to end. Well-designed tools and checks matter.',
    },
  ],
  't1-1.6': [
    {
      q: 'The best first step in building evals for an existing AI feature is…',
      o: ['Pick a public benchmark', 'Read real traces and write down failure categories (error analysis)', 'Build an LLM judge', 'Buy an eval platform'],
      a: 1,
      why: 'Error analysis tells you what actually breaks. Metrics designed before looking at data often measure the wrong thing.',
    },
    {
      q: 'Before trusting an LLM-as-judge you should…',
      o: ['Use the biggest model', 'Measure its agreement with human labels on a sample', 'Set temperature to 1', 'Hide the rubric from it'],
      a: 1,
      why: 'A judge is itself a model that can be wrong. Validate it like any classifier.',
    },
    {
      q: 'Which failure is best caught with a code-based assertion rather than a judge?',
      o: ['Tone is too formal', 'Output is not valid JSON or is missing a required field', 'Answer is unhelpful', 'Explanation is unclear'],
      a: 1,
      why: 'Deterministic checks are cheap, fast and exact. Save judges for subjective criteria.',
    },
    {
      q: 'Why run evals in CI?',
      o: ['To make builds slower', 'To catch quality regressions from prompt or model changes before they ship', 'Because judges need GPUs', 'To train the model'],
      a: 1,
      why: 'Prompts and model versions are code. Regression tests stop silent quality drops.',
    },
  ],
  't1-1.7': [
    {
      q: 'Which combination makes prompt injection most dangerous ("the lethal trifecta")?',
      o: ['Long prompts, high temperature, streaming', 'Access to private data + exposure to untrusted content + ability to send data out', 'Many users, many tools, many models', 'Caching, batching, retries'],
      a: 1,
      why: 'If all three are present, injected instructions can steal data. Remove at least one of the three.',
    },
    {
      q: 'Where can an injection arrive from in a RAG agent?',
      o: ['Only the user message', 'Retrieved documents, tool outputs, web pages and logs too', 'Only the system prompt', 'Nowhere if you use JSON mode'],
      a: 1,
      why: 'Any text the model reads is a possible attack channel, especially retrieved or third-party content.',
    },
    {
      q: 'What is the most useful thing to log per LLM call?',
      o: ['Only errors', 'Prompt version, model, inputs/outputs, tokens, latency and cost', 'Only token count', 'Nothing, for privacy'],
      a: 1,
      why: 'Traces make debugging and cost attribution possible. Redact PII where needed rather than logging nothing.',
    },
  ],
  't1-1.8': [
    {
      q: 'What does durable execution (e.g. Temporal) give you over a simple job queue?',
      o: ['Faster model inference', 'Workflow state survives crashes, so long-running multi-step work resumes where it stopped', 'Free GPUs', 'Automatic prompt tuning'],
      a: 1,
      why: 'Workflow history is persisted; workers can die and the workflow continues. This suits approvals that wait for days.',
    },
    {
      q: 'In LangGraph, an agent is modelled as…',
      o: ['A single prompt', 'A graph of nodes sharing state, with conditional edges', 'A Kafka topic', 'A vector index'],
      a: 1,
      why: 'Nodes do work (LLM calls, tools), edges route on state, and checkpointing lets runs pause and resume.',
    },
    {
      q: 'What is the main benefit of human-in-the-loop interrupts for infra agents?',
      o: ['Lower token cost', 'Risky actions (deletes, scaling, config changes) need explicit approval before they run', 'Better embeddings', 'Faster responses'],
      a: 1,
      why: 'Agents propose; humans approve. It limits the damage from mistakes and injections.',
    },
    {
      q: 'When is a framework a bad fit?',
      o: ['When you need persistence', 'When its abstractions hide behaviour you need to control or debug', 'When you have multiple agents', 'When using Python'],
      a: 1,
      why: 'You built from scratch first so you can tell when a framework helps and when it gets in the way.',
    },
  ],

  // ───────────── Track 2 ─────────────
  't2-2.1': [
    {
      q: 'A @ B where A is [32, 64] and B is [64, 10] gives shape…',
      o: ['[32, 10]', '[64, 64]', '[10, 32]', 'Error'],
      a: 0,
      why: '[m,k] @ [k,n] → [m,n]. The inner dimensions must match.',
    },
    {
      q: 'Forgetting optimizer.zero_grad() in a training loop causes…',
      o: ['A crash', 'Gradients to accumulate across steps', 'Weights to reset', 'Nothing'],
      a: 1,
      why: 'PyTorch adds into .grad by default, so stale gradients pile up and updates get too large.',
    },
    {
      q: 'Adding x of shape [8, 1] to y of shape [1, 5] gives…',
      o: ['Error', '[8, 5] via broadcasting', '[8, 1]', '[1, 5]'],
      a: 1,
      why: 'Size-1 dimensions stretch to match. Very handy, and a common source of silent bugs.',
    },
    {
      q: 'What does loss.backward() do?',
      o: ['Updates the weights', 'Computes gradients of the loss with respect to all parameters that require grad', 'Resets the model', 'Evaluates on the test set'],
      a: 1,
      why: 'Autograd walks the computation graph backwards (chain rule). optimizer.step() then applies the update.',
    },
  ],
  't2-2.2': [
    {
      q: 'Backpropagation is essentially…',
      o: ['Random search', 'The chain rule applied backwards through a computation graph', 'Matrix inversion', 'A sorting algorithm'],
      a: 1,
      why: 'Each node multiplies the upstream gradient by its local derivative. micrograd shows this in about 100 lines.',
    },
    {
      q: 'For L = a·b, what is ∂L/∂a?',
      o: ['a', 'b', '1', 'a + b'],
      a: 1,
      why: 'The local derivative of a product with respect to one input is the other input.',
    },
    {
      q: 'If a value feeds into two downstream nodes, its gradient is…',
      o: ['The max of the two', 'The sum of the gradients from both paths', 'The first one only', 'Zero'],
      a: 1,
      why: 'Gradients from multiple uses accumulate (+=). This is why micrograd uses += in backward.',
    },
    {
      q: 'The initial loss of a 27-class model is much higher than −ln(1/27) ≈ 3.3. This suggests…',
      o: ['A great initialisation', 'Overconfident initial logits; scale down the output layer weights', 'Not enough data', 'The learning rate is too low'],
      a: 1,
      why: 'At init the model should be uniformly unsure. A high initial loss wastes early training steps squashing logits.',
    },
  ],
  't2-2.3': [
    {
      q: 'Training loss falls but validation loss rises. What is happening?',
      o: ['Underfitting', 'Overfitting', 'Learning rate too low', 'A data loader bug, always'],
      a: 1,
      why: 'The model is memorising the training set. Add regularisation or data, stop earlier, or use a smaller model.',
    },
    {
      q: 'The loss suddenly goes to NaN early in training. Most likely cause?',
      o: ['Learning rate too high or numerical instability', 'Too much data', 'Too many layers of dropout', 'The model is too small'],
      a: 0,
      why: 'Exploding updates overflow. Lower the LR, add warmup, clip gradients, and check fp16/bf16 settings.',
    },
    {
      q: 'Why do residual connections help deep networks train?',
      o: ['They reduce parameters', 'They give gradients a direct path backwards, easing vanishing gradients', 'They replace normalisation', 'They speed up inference only'],
      a: 1,
      why: 'x + f(x) lets the identity carry signal and gradients through many layers.',
    },
    {
      q: 'Which normalisation do most modern LLMs use?',
      o: ['BatchNorm', 'LayerNorm / RMSNorm', 'No normalisation', 'GroupNorm'],
      a: 1,
      why: 'Normalising per token (not per batch) suits variable-length sequences. RMSNorm is the cheaper variant.',
    },
  ],
  't2-2.4': [
    {
      q: 'In self-attention, scores are computed from…',
      o: ['V · Vᵀ', 'Q · Kᵀ, scaled by √d and softmaxed, then used to weight V', 'K + V', 'Embeddings only'],
      a: 1,
      why: 'Queries ask, keys advertise, values carry content: softmax(QKᵀ/√d)·V.',
    },
    {
      q: 'What does the causal mask do in a GPT?',
      o: ['Hides padding only', 'Prevents a token attending to future tokens', 'Drops random heads', 'Masks the loss'],
      a: 1,
      why: 'Next-token prediction must not peek ahead, so future positions get −∞ before the softmax.',
    },
    {
      q: 'Why does a KV cache speed up generation?',
      o: ['It compresses weights', 'Past tokens’ keys and values are stored, so each new step only processes the new token', 'It skips attention', 'It batches users'],
      a: 1,
      why: 'Without a cache every step recomputes attention inputs for the whole prefix. With one, each step adds one row.',
    },
    {
      q: 'Why divide attention scores by √d_k?',
      o: ['To save memory', 'To keep dot products from growing with dimension and saturating the softmax', 'To normalise V', 'It is optional decoration'],
      a: 1,
      why: 'Dot products of random d-dimensional vectors have variance about d. Scaling keeps the softmax in a useful range.',
    },
  ],
  't2-2.5': [
    {
      q: 'LoRA fine-tunes a layer by…',
      o: ['Updating all weights', 'Freezing W and learning a low-rank update B·A added to it', 'Pruning neurons', 'Quantising to INT4'],
      a: 1,
      why: 'Only the small A and B matrices train, which cuts optimizer memory massively. They can be merged back after training.',
    },
    {
      q: 'QLoRA adds what on top of LoRA?',
      o: ['A reward model', 'A 4-bit quantised frozen base model, so big models fit on one GPU', 'More layers', 'Distillation'],
      a: 1,
      why: 'The base model is stored in 4-bit NF4, while LoRA adapters train in higher precision.',
    },
    {
      q: 'DPO trains on…',
      o: ['Unlabelled text', 'Preference pairs (chosen vs rejected) without a separate reward model or RL loop', 'Images', 'Only the system prompt'],
      a: 1,
      why: 'DPO rewrites the RLHF objective as a classification-style loss directly on preference pairs.',
    },
    {
      q: 'When is fine-tuning usually not the first choice?',
      o: ['When the model lacks up-to-date or private facts (use RAG)', 'When you need a consistent output format', 'When you need lower latency with a smaller model', 'When a narrow task needs a specialised style'],
      a: 0,
      why: 'Fine-tuning teaches behaviour and format well. Knowledge that changes belongs in retrieval.',
    },
  ],
  't2-2.6': [
    {
      q: 'An elementwise op (e.g. GELU) on a large tensor is typically…',
      o: ['Compute-bound', 'Memory-bandwidth-bound', 'Network-bound', 'Disk-bound'],
      a: 1,
      why: 'It does very few FLOPs per byte moved (low arithmetic intensity), so HBM bandwidth is the limit.',
    },
    {
      q: 'Why does FlashAttention speed attention up?',
      o: ['It approximates attention', 'It tiles the computation in fast on-chip SRAM and never writes the full N×N matrix to HBM', 'It uses INT4', 'It skips the softmax'],
      a: 1,
      why: 'It is exact attention that is IO-aware. Avoiding HBM reads and writes is the win.',
    },
    {
      q: 'Kernel fusion helps mainly because…',
      o: ['It adds more FLOPs', 'Intermediate results stay on-chip instead of round-tripping through memory', 'It increases batch size', 'It reduces parameters'],
      a: 1,
      why: 'Every separate kernel reads from and writes to HBM. Fusing removes those trips. torch.compile does much of this for you.',
    },
    {
      q: 'MFU (model FLOPs utilisation) is…',
      o: ['GPU memory used', 'Achieved model FLOPs/sec divided by the hardware’s peak FLOPs/sec', 'Fraction of time the GPU is on', 'Tokens per dollar'],
      a: 1,
      why: 'It is the honest measure of how well training uses the hardware. 40–60% is good for LLM training.',
    },
  ],
  't2-2.7': [
    {
      q: 'LLM decode (one token at a time) is usually limited by…',
      o: ['Compute', 'Memory bandwidth (reading weights and the KV cache each step)', 'Disk', 'CPU'],
      a: 1,
      why: 'Each step does little math per weight loaded. Batching many requests raises arithmetic intensity.',
    },
    {
      q: 'Continuous batching improves throughput by…',
      o: ['Waiting for a full batch before starting', 'Adding and removing sequences from the running batch at every step', 'Using bigger GPUs', 'Shortening prompts'],
      a: 1,
      why: 'Finished sequences free slots immediately and new requests join, so the GPU stays busy.',
    },
    {
      q: 'What problem does PagedAttention solve?',
      o: ['Slow tokenization', 'KV-cache memory fragmentation and over-reservation', 'Training instability', 'Prompt injection'],
      a: 1,
      why: 'It allocates the KV cache in fixed-size blocks like OS virtual-memory pages, which allows far bigger batches.',
    },
    {
      q: 'Speculative decoding works by…',
      o: ['Skipping tokens', 'A small draft model proposes several tokens; the big model verifies them in one pass', 'Lowering precision', 'Caching answers'],
      a: 1,
      why: 'Verification is parallel. Accepted drafts give multiple tokens per big-model step, with the same output distribution.',
    },
    {
      q: 'Prefix caching is most useful when…',
      o: ['Every prompt is unique', 'Many requests share a long common prefix (a system prompt or document)', 'Outputs are very long', 'Batch size is 1'],
      a: 1,
      why: 'The KV cache for the shared prefix is computed once and reused, cutting prefill time and TTFT.',
    },
  ],
  't2-2.8': [
    {
      q: 'Plain data parallelism (DDP) replicates…',
      o: ['Only the data', 'The full model on every GPU, then all-reduces gradients', 'Half the layers per GPU', 'Nothing'],
      a: 1,
      why: 'Each GPU runs a different mini-batch on a full copy of the model; gradients are averaged with all-reduce.',
    },
    {
      q: 'ZeRO stage 3 / FSDP shards…',
      o: ['Only optimizer states', 'Optimizer states, gradients and parameters across GPUs', 'Only the data', 'Only activations'],
      a: 1,
      why: 'Stage 1 shards optimizer states, stage 2 adds gradients, stage 3 adds parameters too.',
    },
    {
      q: 'Roughly how much memory does mixed-precision Adam training need per parameter, before activations?',
      o: ['2 bytes', '~16 bytes', '~4 bytes', '~64 bytes'],
      a: 1,
      why: 'bf16 weights (2) + bf16 grads (2) + fp32 master weights (4) + Adam m and v (4+4) ≈ 16 bytes. A 7B model needs ~112 GB.',
    },
    {
      q: 'Activation checkpointing trades…',
      o: ['Accuracy for speed', 'Extra compute (recomputing the forward pass) for less activation memory', 'Bandwidth for disk', 'Parameters for data'],
      a: 1,
      why: 'Activations are dropped in the forward pass and recomputed during backward.',
    },
  ],
  't2-2.9': [
    {
      q: 'The most important property of an ML training pipeline is…',
      o: ['It uses the newest framework', 'Reproducibility: same config + data + code gives the same model and eval numbers', 'It runs on Kubernetes', 'It has a UI'],
      a: 1,
      why: 'Without reproducibility you cannot trust comparisons or debug regressions.',
    },
    {
      q: 'What is a model registry for?',
      o: ['Storing raw data', 'Versioning trained models with their metadata, metrics and lineage for promotion and rollback', 'Training faster', 'Serving embeddings'],
      a: 1,
      why: 'It is like an artifact repository: what model is in prod, how it was trained, and how to roll back.',
    },
    {
      q: 'Data drift means…',
      o: ['The training job moved servers', 'The production input distribution has shifted away from the training data', 'The model weights changed', 'Disk is full'],
      a: 1,
      why: 'Model quality degrades silently when inputs change. Monitor input statistics and eval quality over time.',
    },
  ],
  't2-2.10': [
    {
      q: 'A vLLM pod is stuck in Pending on a GPU cluster. A likely cause?',
      o: ['The prompt is too long', 'No node has a free GPU matching its resource request, taints or selector', 'Temperature too high', 'The KV cache is full'],
      a: 1,
      why: 'Check `kubectl describe pod` events: insufficient nvidia.com/gpu, untolerated taints, or node selectors.',
    },
    {
      q: 'Which tool exposes GPU utilisation, memory and XID errors to Prometheus?',
      o: ['KEDA', 'DCGM exporter', 'Kueue', 'Helm'],
      a: 1,
      why: 'NVIDIA DCGM exporter publishes GPU telemetry as Prometheus metrics.',
    },
    {
      q: 'Why autoscale LLM servers on queue depth or running requests rather than CPU?',
      o: ['CPU metrics are unavailable', 'GPU inference load is not reflected in CPU usage; request backlog tracks real demand', 'It is cheaper to store', 'HPA cannot read CPU'],
      a: 1,
      why: 'KEDA or custom metrics on queue length, or vLLM’s running/waiting requests, reflect actual saturation.',
    },
    {
      q: 'How should your ops agent access the Kubernetes API?',
      o: ['Cluster-admin for convenience', 'A least-privilege, namespace-scoped read-only service account; writes go through human approval', 'The developer’s kubeconfig', 'No auth inside the cluster'],
      a: 1,
      why: 'Assume the agent can be manipulated. Limit what it can do, and audit it.',
    },
  ],

  // ───────────── Track 3 ─────────────
  't3-3.1': [
    {
      q: 'The bias–variance tradeoff says that, roughly, more model complexity…',
      o: ['Always lowers test error', 'Lowers bias but can raise variance', 'Raises bias', 'Has no effect'],
      a: 1,
      why: 'Classic U-shaped test error. Deep learning complicates it (double descent), but the vocabulary still matters.',
    },
    {
      q: 'L2 regularisation corresponds to which prior on the weights (MAP view)?',
      o: ['Uniform', 'Gaussian', 'Laplace', 'Bernoulli'],
      a: 1,
      why: 'A Gaussian prior gives an L2 penalty; a Laplace prior gives L1 (sparsity).',
    },
    {
      q: 'PCA finds…',
      o: ['Clusters', 'Orthogonal directions of maximum variance (via SVD of centred data)', 'Decision boundaries', 'Nearest neighbours'],
      a: 1,
      why: 'The top singular vectors of centred data are the principal components.',
    },
  ],
  't3-3.2': [
    {
      q: 'Chinchilla’s main finding was that for a fixed compute budget…',
      o: ['Bigger models are always better', 'Parameters and training tokens should scale roughly equally (~20 tokens per parameter)', 'Data does not matter', 'Small models win'],
      a: 1,
      why: 'Earlier models like GPT-3 were undertrained. Compute-optimal training uses far more tokens per parameter.',
    },
    {
      q: 'Scaling laws typically appear as straight lines on…',
      o: ['Linear axes', 'Log–log axes (power laws)', 'Polar plots', 'Histograms'],
      a: 1,
      why: 'Loss ≈ A·N^(−α) + E, a power law, which is linear in log-log space.',
    },
    {
      q: 'μP (maximal update parametrisation) mainly lets you…',
      o: ['Skip training', 'Tune hyperparameters on a small model and transfer them to a large one', 'Quantise models', 'Remove normalisation'],
      a: 1,
      why: 'With μP the optimal learning rate stays stable as width grows, which saves expensive sweeps at scale.',
    },
  ],
  't3-3.3': [
    {
      q: 'What is the first pass of Keshav’s three-pass method?',
      o: ['Re-derive every equation', 'A 5–10 minute skim: title, abstract, intro, headings, conclusion', 'Run the code', 'Email the authors'],
      a: 1,
      why: 'Decide whether the paper is worth more time before investing hours.',
    },
    {
      q: 'When reproducing a paper you should first reproduce…',
      o: ['Every table at full scale', 'The smallest experiment that tests the central claim', 'Only the figures', 'The related work'],
      a: 1,
      why: 'A small, faithful test of the main claim gives most of the signal for a fraction of the cost.',
    },
    {
      q: 'A result that does not reproduce is…',
      o: ['Worthless; hide it', 'Useful information to report honestly with your setup', 'Proof the paper is fraudulent', 'A sign to change seeds until it works'],
      a: 1,
      why: 'Negative results with clear methodology are valuable. Seed-hacking until it works is not science.',
    },
  ],
  't3-3.4': [
    {
      q: 'The policy gradient (REINFORCE) increases the probability of actions in proportion to…',
      o: ['Their frequency', 'The return (or advantage) that followed them', 'Their entropy', 'Random noise'],
      a: 1,
      why: '∇J = E[∇log π(a|s) · R]. Subtracting a baseline gives the advantage and reduces variance.',
    },
    {
      q: 'Why does PPO clip the probability ratio?',
      o: ['To speed up sampling', 'To prevent overly large policy updates from a single batch', 'To remove the value function', 'To discretise actions'],
      a: 1,
      why: 'Clipping keeps the new policy close to the old one, a cheap stand-in for a trust region.',
    },
    {
      q: 'Q-learning is…',
      o: ['On-policy', 'Off-policy: it learns the greedy policy’s value while behaving differently', 'Supervised learning', 'Only for continuous actions'],
      a: 1,
      why: 'The target uses max over next actions regardless of the exploratory action actually taken.',
    },
  ],
  't3-3.5': [
    {
      q: 'GRPO differs from PPO mainly by…',
      o: ['Using images', 'Dropping the learned value model and using group-relative rewards over several samples as the baseline', 'Removing the KL penalty forever', 'Training only the embeddings'],
      a: 1,
      why: 'Sample several answers per prompt, normalise rewards within the group, and use that as the advantage. This saves memory.',
    },
    {
      q: 'Reward hacking means…',
      o: ['Stealing reward models', 'The policy exploits flaws in the reward signal and scores well without doing the intended task', 'Faster convergence', 'Using too small a learning rate'],
      a: 1,
      why: 'Optimising a proxy too hard diverges from the true goal (Goodhart). The overoptimisation scaling-law paper measures this.',
    },
    {
      q: 'RLVR (RL with verifiable rewards) is well suited to…',
      o: ['Poetry style', 'Math and code, where answers can be checked automatically', 'Image generation', 'Open-ended chat'],
      a: 1,
      why: 'Automatic verifiers give clean reward signals, which is behind recent reasoning-model gains.',
    },
  ],
  't3-3.6': [
    {
      q: 'An induction head implements roughly…',
      o: ['Sorting', 'If token A was followed by B earlier, then after seeing A again, predict B', 'Counting tokens', 'Translation'],
      a: 1,
      why: 'A two-head circuit (previous-token head + induction head) underlies much in-context copying.',
    },
    {
      q: 'Superposition is the idea that…',
      o: ['Models use quantum hardware', 'Networks represent more features than they have dimensions, using nearly orthogonal directions', 'Layers are redundant', 'Attention is linear'],
      a: 1,
      why: 'Sparse features can share dimensions, which makes individual neurons polysemantic.',
    },
    {
      q: 'Sparse autoencoders are used in interpretability to…',
      o: ['Compress models for deployment', 'Decompose activations into a larger set of sparse, more interpretable features', 'Speed up training', 'Generate data'],
      a: 1,
      why: 'Dictionary learning undoes superposition so that features map more cleanly to concepts.',
    },
    {
      q: 'Activation patching tests…',
      o: ['Memory usage', 'Whether a component causally matters, by swapping its activation from another input and measuring the change', 'Training speed', 'Tokenizer quality'],
      a: 1,
      why: 'It is an intervention, not just a correlation. That is the core move of causal interpretability.',
    },
  ],
  't3-3.7': [
    {
      q: 'Before running a new idea you should first have…',
      o: ['A press release', 'A strong, well-tuned baseline', 'Ten GPUs', 'The final figure designed'],
      a: 1,
      why: 'Many "improvements" disappear against a properly tuned baseline.',
    },
    {
      q: 'Your method beats the baseline on one seed by 0.3%. You should…',
      o: ['Publish', 'Run several seeds and report the variance before claiming anything', 'Try new seeds until the gap grows', 'Drop the baseline'],
      a: 1,
      why: 'Seed-to-seed noise is often larger than small claimed gains. Report error bars.',
    },
    {
      q: 'What is an ablation?',
      o: ['Deleting the dataset', 'Removing or changing one component to measure its contribution', 'A type of optimizer', 'Hyperparameter search'],
      a: 1,
      why: 'Ablations show which parts of a method actually matter.',
    },
  ],

  // ───────────── Math ─────────────
  'math-1': [
    {
      q: 'Cosine similarity between two vectors depends on…',
      o: ['Their lengths only', 'The angle between them, not their lengths', 'Their sum', 'Their dimension count'],
      a: 1,
      why: 'cos θ = a·b / (‖a‖‖b‖). Normalising removes the effect of magnitude.',
    },
    {
      q: 'softmax([2, 2, 2]) equals…',
      o: ['[2, 2, 2]', '[1/3, 1/3, 1/3]', '[1, 0, 0]', '[0.5, 0.5, 0.5]'],
      a: 1,
      why: 'Equal logits give a uniform distribution.',
    },
    {
      q: 'Why subtract max(x) before computing softmax?',
      o: ['It changes the result', 'Numerical stability: prevents exp() overflow without changing the output', 'It makes it faster', 'To get negative probabilities'],
      a: 1,
      why: 'softmax(x) = softmax(x − c) for any constant c, and exp of large numbers overflows.',
    },
    {
      q: 'The standard error of a mean from n samples shrinks like…',
      o: ['1/n', '1/√n', 'n', 'log n'],
      a: 1,
      why: 'SE = σ/√n. Four times the data halves the uncertainty.',
    },
  ],
  'math-2': [
    {
      q: 'The gradient of softmax + cross-entropy with respect to the logits is…',
      o: ['y − p', 'p − y', 'p · y', 'log p'],
      a: 1,
      why: 'Predicted probabilities minus the one-hot target. Simple, and it explains why this pairing is used everywhere.',
    },
    {
      q: 'Minimising cross-entropy loss is equivalent to…',
      o: ['Minimising variance', 'Maximising the likelihood of the data', 'Maximising entropy', 'Minimising weights'],
      a: 1,
      why: 'The negative log-likelihood of a categorical model is exactly the cross-entropy against the labels.',
    },
    {
      q: 'KL(P‖Q) is…',
      o: ['Symmetric', 'Always ≥ 0, and 0 only when P = Q', 'Always ≤ 0', 'A distance metric'],
      a: 1,
      why: 'KL is non-negative but asymmetric, so it is not a true metric. Forward and reverse KL behave differently.',
    },
    {
      q: 'Adam differs from SGD mainly by…',
      o: ['Using no learning rate', 'Per-parameter adaptive step sizes from running averages of gradients and squared gradients', 'Computing second derivatives exactly', 'Ignoring gradients'],
      a: 1,
      why: 'm (momentum) and v (squared-gradient scale) give each parameter its own effective step size.',
    },
    {
      q: 'A matrix of rank r can be written exactly as…',
      o: ['A sum of r rank-1 outer products', 'A diagonal matrix', 'Its transpose', 'r scalars'],
      a: 0,
      why: 'SVD: M = Σᵢ σᵢ uᵢ vᵢᵀ. Truncating gives the best low-rank approximation, which is the idea behind LoRA.',
    },
  ],
  'math-3': [
    {
      q: 'The bootstrap estimates uncertainty by…',
      o: ['Collecting new data', 'Resampling the observed data with replacement and recomputing the statistic', 'Assuming normality only', 'Using the median'],
      a: 1,
      why: 'The spread of the resampled statistics approximates its sampling distribution.',
    },
    {
      q: 'Fitting a single Gaussian Q to a bimodal P with reverse KL(Q‖P) tends to…',
      o: ['Cover both modes', 'Lock onto one mode (mode-seeking)', 'Produce a uniform distribution', 'Diverge'],
      a: 1,
      why: 'Reverse KL heavily penalises Q putting mass where P has none. Forward KL is mode-covering.',
    },
    {
      q: 'Monte Carlo estimation error decreases as…',
      o: ['1/n', '1/√n', 'e^(−n)', 'It does not decrease'],
      a: 1,
      why: 'It is the same √n law as the standard error.',
    },
  ],
}

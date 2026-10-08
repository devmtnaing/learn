# Core Paper Reading List

Read in order within each section. You can start the first sections during Track 2; you'll get more from them after building the thing yourself.

For each paper, write a one-page summary in `notes/papers/<short-name>.md` (template at the bottom). Mark ⭐ papers for a full three-pass read; skim the rest.

Tick `[x]` when the summary is written.

---

## 1. Foundations of deep learning (read during Track 2, Part A)

- [ ] ⭐ He et al., 2015: **Deep Residual Learning (ResNet)**: <https://arxiv.org/abs/1512.03385>
- [ ] Ioffe & Szegedy, 2015: **Batch Normalization**: <https://arxiv.org/abs/1502.03167>
- [ ] Ba et al., 2016: **Layer Normalization**: <https://arxiv.org/abs/1607.06450>
- [ ] ⭐ Kingma & Ba, 2014: **Adam**: <https://arxiv.org/abs/1412.6980>
- [ ] Loshchilov & Hutter, 2017: **Decoupled Weight Decay (AdamW)**: <https://arxiv.org/abs/1711.05101>
- [ ] Mikolov et al., 2013: **word2vec**: <https://arxiv.org/abs/1301.3781>
- [ ] Bahdanau et al., 2014: **Neural Machine Translation by Jointly Learning to Align and Translate** (the origin of attention): <https://arxiv.org/abs/1409.0473>

## 2. Transformers & language models (Track 2, module 2.4)

- [ ] ⭐ Vaswani et al., 2017: **Attention Is All You Need**: <https://arxiv.org/abs/1706.03762>
- [ ] Devlin et al., 2018: **BERT**: <https://arxiv.org/abs/1810.04805>
- [ ] ⭐ Radford et al., 2019: **GPT-2: Language Models are Unsupervised Multitask Learners**: <https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf>
- [ ] ⭐ Brown et al., 2020: **GPT-3: Language Models are Few-Shot Learners**: <https://arxiv.org/abs/2005.14165>
- [ ] Su et al., 2021: **RoFormer (RoPE)**: <https://arxiv.org/abs/2104.09864>
- [ ] Shazeer, 2020: **GLU Variants Improve Transformer (SwiGLU)**: <https://arxiv.org/abs/2002.05202>
- [ ] Ainslie et al., 2023: **GQA: Grouped-Query Attention**: <https://arxiv.org/abs/2305.13245>
- [ ] Touvron et al., 2023: **LLaMA**: <https://arxiv.org/abs/2302.13971>
- [ ] Dosovitskiy et al., 2020: **An Image is Worth 16x16 Words (ViT)**: <https://arxiv.org/abs/2010.11929>
- [ ] Radford et al., 2021: **CLIP**: <https://arxiv.org/abs/2103.00020>

## 3. Applications: RAG, reasoning, agents (Track 1 background)

- [ ] Lewis et al., 2020: **Retrieval-Augmented Generation**: <https://arxiv.org/abs/2005.11401>
- [ ] Wei et al., 2022: **Chain-of-Thought Prompting**: <https://arxiv.org/abs/2201.11903>
- [ ] Yao et al., 2022: **ReAct**: <https://arxiv.org/abs/2210.03629>
- [ ] Schick et al., 2023: **Toolformer**: <https://arxiv.org/abs/2302.04761>

## 4. Systems & efficiency (Track 2, Part C)

- [ ] ⭐ Dao et al., 2022: **FlashAttention**: <https://arxiv.org/abs/2205.14135>
- [ ] ⭐ Kwon et al., 2023: **PagedAttention / vLLM**: <https://arxiv.org/abs/2309.06180>
- [ ] Leviathan et al., 2022: **Speculative Decoding**: <https://arxiv.org/abs/2211.17192>
- [ ] Frantar et al., 2022: **GPTQ**: <https://arxiv.org/abs/2210.17323>
- [ ] Lin et al., 2023: **AWQ**: <https://arxiv.org/abs/2306.00978>
- [ ] Rajbhandari et al., 2019: **ZeRO**: <https://arxiv.org/abs/1910.02054>
- [ ] Shoeybi et al., 2019: **Megatron-LM**: <https://arxiv.org/abs/1909.08053>
- [ ] Fedus et al., 2021: **Switch Transformers (MoE)**: <https://arxiv.org/abs/2101.03961>
- [ ] Jiang et al., 2024: **Mixtral of Experts**: <https://arxiv.org/abs/2401.04088>

## 5. Fine-tuning & post-training (Track 2 module 2.5 → Track 3 module 3.5)

- [ ] ⭐ Hu et al., 2021: **LoRA**: <https://arxiv.org/abs/2106.09685>
- [ ] Dettmers et al., 2023: **QLoRA**: <https://arxiv.org/abs/2305.14314>
- [ ] ⭐ Ouyang et al., 2022: **InstructGPT (RLHF)**: <https://arxiv.org/abs/2203.02155>
- [ ] ⭐ Schulman et al., 2017: **PPO**: <https://arxiv.org/abs/1707.06347>
- [ ] ⭐ Rafailov et al., 2023: **DPO**: <https://arxiv.org/abs/2305.18290>
- [ ] Bai et al., 2022: **Constitutional AI**: <https://arxiv.org/abs/2212.08073>
- [ ] Gao et al., 2022: **Scaling Laws for Reward Model Overoptimization**: <https://arxiv.org/abs/2210.10760>
- [ ] Lightman et al., 2023: **Let's Verify Step by Step**: <https://arxiv.org/abs/2305.20050>
- [ ] ⭐ Shao et al., 2024: **DeepSeekMath (GRPO)**: <https://arxiv.org/abs/2402.03300>
- [ ] ⭐ DeepSeek-AI, 2025: **DeepSeek-R1**: <https://arxiv.org/abs/2501.12948>
- [ ] Snell et al., 2024: **Scaling LLM Test-Time Compute Optimally**: <https://arxiv.org/abs/2408.03314>

## 6. Scaling & training dynamics (Track 3 module 3.2)

- [ ] ⭐ Kaplan et al., 2020: **Scaling Laws for Neural Language Models**: <https://arxiv.org/abs/2001.08361>
- [ ] ⭐ Hoffmann et al., 2022: **Training Compute-Optimal LLMs (Chinchilla)**: <https://arxiv.org/abs/2203.15556>
- [ ] Yang et al., 2022: **Tensor Programs V (μP)**: <https://arxiv.org/abs/2203.03466>
- [ ] Nakkiran et al., 2019: **Deep Double Descent**: <https://arxiv.org/abs/1912.02292>
- [ ] Frankle & Carbin, 2018: **The Lottery Ticket Hypothesis**: <https://arxiv.org/abs/1803.03635>
- [ ] Power et al., 2022: **Grokking**: <https://arxiv.org/abs/2201.02177>
- [ ] Keller Jordan, 2024: **Muon optimizer** (blog): <https://kellerjordan.github.io/posts/muon/>

## 7. Frontier open-model technical reports (read the architecture & training sections)

- [ ] Llama Team, 2024: **The Llama 3 Herd of Models**: <https://arxiv.org/abs/2407.21783>
- [ ] DeepSeek-AI, 2024: **DeepSeek-V3 Technical Report**: <https://arxiv.org/abs/2412.19437>
- [ ] *Add the newest open-model reports here as they come out (Qwen, DeepSeek, OLMo, Gemma, etc.)*

## 8. Interpretability (Track 3 module 3.6)

- [ ] ⭐ Elhage et al., 2021: **A Mathematical Framework for Transformer Circuits**: <https://transformer-circuits.pub/2021/framework/index.html>
- [ ] Olsson et al., 2022: **In-context Learning and Induction Heads**: <https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html>
- [ ] ⭐ Elhage et al., 2022: **Toy Models of Superposition**: <https://transformer-circuits.pub/2022/toy_model/index.html>
- [ ] Bricken et al., 2023: **Towards Monosemanticity**: <https://transformer-circuits.pub/2023/monosemantic-features>
- [ ] Nanda et al., 2023: **Progress Measures for Grokking via Mechanistic Interpretability**: <https://arxiv.org/abs/2301.05217>

## 9. Beyond transformers (optional, for breadth)

- [ ] Ho et al., 2020: **DDPM (diffusion models)**: <https://arxiv.org/abs/2006.11239>
- [ ] Gu & Dao, 2023: **Mamba (state-space models)**: <https://arxiv.org/abs/2312.00752>

---

## Paper summary template

Copy into `notes/papers/<short-name>.md`:

```markdown
# <Title> (<Authors>, <Year>)

Link:
Read on:            Passes done: 1 / 2 / 3

## Problem
What were they trying to solve, and why did it matter then?

## Key idea (one sentence)

## Method (in my own notation)
Key equations with every symbol defined.

## Results
Main numbers. What is the baseline? How big is the gain?

## What I doubt
Weakest evidence, missing ablations, possible confounders.

## What I'd try next / small reproduction idea

## Connections
Which other papers or modules does this relate to?
```

# Track 3 · Research Engineer

**Goal:** understand *why* models work, run rigorous experiments, read and reproduce papers, and add new findings. A research engineer is the strong engineer on a research team. They turn ideas into experiments that run at scale and produce trustworthy results.

**Duration:** ~8–12 months to be credible, then ongoing for the rest of your career.

**Math alongside:** [Level 3](../math/README.md#level-3-research-math-with-track-3)

**Why this comes last:** research needs everything before it. Track 1 gives you evals and product sense, Track 2 gives you training and systems skill. Track 3 adds theory, rigor and taste.

**A realistic note:** research engineer roles at frontier labs are very competitive. Your systems background is valued there, because many research teams are short on people who can make experiments run fast and reliably. Common routes in are fellowships (MATS, Anthropic Fellows), open-source contributions (EleutherAI, Hugging Face), and publishing strong reproductions and small studies.

| # | Module | Weeks |
|---|---|---|
| 3.1 | Classical ML & learning theory | 4 |
| 3.2 | Training dynamics & scaling | 4 |
| 3.3 | Reading & reproducing papers ★ | ongoing, 3 to start |
| 3.4 | Reinforcement learning | 5 |
| 3.5 | Post-training & alignment | 4 |
| 3.6 | Interpretability | 5 |
| 3.7 | Doing research ★ | ongoing |
| ⚑ | Capstones | ongoing |

---

### 3.1 Classical ML & learning theory

**Why:** papers assume this vocabulary: bias–variance, generalization, regularization as a prior, kernels, probabilistic models.

**Concepts:** supervised learning framing; bias–variance tradeoff; generalization and overfitting; cross-validation; linear/logistic regression as probabilistic models; regularization as a prior (MAP); SVMs and kernels (conceptually); decision trees and ensembles; PCA; k-means and EM; Gaussian mixtures; VAEs (as a bridge to deep generative models).

**Learn**
- *Core:* [Stanford CS229](https://cs229.stanford.edu/) lecture notes (Andrew Ng's main notes); lectures on YouTube
- *Core:* Christopher Bishop & Hugh Bishop, [*Deep Learning: Foundations and Concepts*](https://www.bishopbook.com/) (2024), a rigorous modern textbook (free to read online)
- *Optional:* Kevin Murphy, [*Probabilistic Machine Learning: An Introduction*](https://probml.github.io/pml-book/book1.html)
- *Optional:* Goodfellow, Bengio & Courville, [*Deep Learning*](https://www.deeplearningbook.org/), dated but still the classic for part II theory

**Build**
- [ ] Implement PCA (via SVD) and k-means from scratch; apply them to your GPT's token embeddings and visualize them
- [ ] Implement EM for a Gaussian mixture model
- [ ] Reproduce the classic double-descent curve on a small problem

**Checkpoint:** you can explain why deep networks generalize despite having more parameters than data points, and why that's still partly an open question.

---

### 3.2 Training dynamics & scaling

**Why:** most research results are about how training behaves: what scales, what is stable, what transfers from small to large models.

**Concepts:** scaling laws (Kaplan; Chinchilla compute-optimal); emergent abilities and the debate about them; hyperparameter transfer (μP); loss spikes and training instabilities; grokking; optimizer research (AdamW, Lion, Shampoo, Muon); data quality and data mixing; learning-rate schedules (cosine, WSD); in-context learning.

**Learn**
- *Core:* Papers: [Kaplan scaling laws](https://arxiv.org/abs/2001.08361), [Chinchilla](https://arxiv.org/abs/2203.15556), [μP / Tensor Programs V](https://arxiv.org/abs/2203.03466)
- *Core:* [Stanford CS336: Language Modeling from Scratch](https://cs336.stanford.edu/). **Do all the assignments.** It's the best course for this track: tokenizers, transformers, systems, scaling laws, data, alignment.
- *Core:* Simon Prince, *Understanding Deep Learning*, chapters 20 ("Why does deep learning work?") and the remaining chapters you skipped
- *Optional:* [Grokking paper](https://arxiv.org/abs/2201.02177) and Neel Nanda's [mechanistic analysis of grokking](https://arxiv.org/abs/2301.05217)
- *Optional:* Keller Jordan's [modded-nanogpt speedrun](https://github.com/KellerJordan/modded-nanogpt), a public record of training improvements; read the changelog

**Build**
- [ ] Train 5–7 sizes of your GPT at fixed compute budgets and fit your own scaling law. Plot it on log–log axes.
- [ ] Implement μP for your GPT and show the optimal learning rate transfers across widths
- [ ] Take one modded-nanogpt record change, reproduce its effect at small scale and write up why it helps

**Checkpoint:** given a compute budget, you can estimate a compute-optimal model size and token count, and explain the assumptions behind the estimate.

---

### 3.3 Reading & reproducing papers ★

**Why:** reproducing a paper is the standard way to show research-engineering ability. It's also how you'll learn most of what remains.

**Method**
1. **Three-pass reading** (Keshav, [How to Read a Paper](https://web.stanford.edu/class/ee384m/Handouts/HowtoReadPaper.pdf)): skim (5 min) → understand the main idea (1 hr) → reconstruct it in detail (several hours).
2. For each paper, write a one-page summary in `notes/papers/`: problem, key idea, method in your own notation, results, what you doubt, what you'd try next.
3. Reproduce the **smallest experiment that tests the main claim**. Don't reproduce the whole paper.
4. Report both what reproduced and what didn't. Failed reproductions are informative too.

**Learn**
- *Core:* the ordered reading list in [`papers.md`](papers.md)
- *Core:* John Schulman, [An Opinionated Guide to ML Research](http://joschu.net/blog/opinionated-guide-ml-research.html)
- *Core:* [arXiv](https://arxiv.org/) cs.LG / cs.CL; follow through [alphaXiv](https://www.alphaxiv.org/) or [Hugging Face Daily Papers](https://huggingface.co/papers)
- *Optional:* [Distill.pub](https://distill.pub/) archive, a model of clear explanation
- *Optional:* Lilian Weng's [blog](https://lilianweng.github.io/), long, well-cited surveys

**Build**
- [ ] Summaries for the first 15 papers in `papers.md`
- [ ] **Capstone E** (see projects): a full paper reproduction with write-up

**Checkpoint:** you can read a new paper in a day, write down its central claim and the weakest part of its evidence, and design a small experiment to test it.

---

### 3.4 Reinforcement learning

**Why:** RL is the foundation of RLHF, reasoning models and agent training. Recent progress in reasoning models comes largely from RL with verifiable rewards.

**Concepts:** MDPs; returns, value functions, Bellman equations; dynamic programming; Monte Carlo and TD learning; Q-learning and DQN; policy gradients (REINFORCE); baselines and advantage estimation (GAE); actor-critic; **PPO**; exploration; reward hacking; offline RL (conceptually).

**Learn**
- *Core:* Sutton & Barto, [*Reinforcement Learning: An Introduction*](http://incompleteideas.net/book/the-book-2nd.html), chapters 1–6 and 13
- *Core:* OpenAI, [Spinning Up in Deep RL](https://spinningup.openai.com/)
- *Core:* [Berkeley CS285 Deep RL](https://rail.eecs.berkeley.edu/deeprlcourse/) (Sergey Levine), lectures and homework
- *Core:* [PPO paper](https://arxiv.org/abs/1707.06347)
- *Optional:* [Hugging Face Deep RL Course](https://huggingface.co/learn/deep-rl-course)
- *Optional:* Costa Huang et al., [The 37 Implementation Details of PPO](https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/)

**Build**
- [ ] Tabular Q-learning on a gridworld
- [ ] REINFORCE with a baseline on CartPole, from scratch
- [ ] PPO from scratch (single file, following the 37-details post); match published CartPole and one Atari or MuJoCo curve

**Checkpoint:** you can derive the policy gradient theorem and explain why PPO clips the ratio.

---

### 3.5 Post-training & alignment

**Why:** post-training is what turns a base model into a useful assistant, and it's where much of current lab research happens.

**Concepts:** instruction tuning; reward modeling; RLHF with PPO; DPO and variants; **RL with verifiable rewards (RLVR)** and GRPO; reasoning models and test-time compute; Constitutional AI / RLAIF; reward hacking and overoptimization; sycophancy; evaluating alignment; scalable oversight; safety evaluations.

**Learn**
- *Core:* Nathan Lambert, [*RLHF Book*](https://rlhfbook.com/), all of it
- *Core:* Papers: [InstructGPT](https://arxiv.org/abs/2203.02155), [Constitutional AI](https://arxiv.org/abs/2212.08073), [DPO](https://arxiv.org/abs/2305.18290), [DeepSeekMath (GRPO)](https://arxiv.org/abs/2402.03300), [DeepSeek-R1](https://arxiv.org/abs/2501.12948), [Scaling Laws for Reward Model Overoptimization](https://arxiv.org/abs/2210.10760)
- *Core:* CS336 alignment and RL assignment
- *Optional:* Anthropic's [research page](https://www.anthropic.com/research) on alignment and safety
- *Optional:* [TRL GRPOTrainer docs](https://huggingface.co/docs/trl/main/en/grpo_trainer)

**Build**
- [ ] Train a small reward model on a preference dataset and measure its accuracy
- [ ] GRPO from scratch on a small model (≤1.5B) for a verifiable task (e.g. arithmetic or GSM8K-style math). Plot reward, response length and accuracy over training.
- [ ] Deliberately cause reward hacking with a flawed reward function and document what the model learns to exploit

**Checkpoint:** you can explain the RLHF → DPO → GRPO progression: what problem each one solves and what new problem it introduces.

---

### 3.6 Interpretability

**Why:** this is the science of what's going on inside the network. It suits people who like debugging systems, and it has a well-developed path for newcomers.

**Concepts:** the residual stream view; attention heads and circuits (induction heads); superposition and polysemanticity; probing; activation patching and causal interventions; logit lens; sparse autoencoders (SAEs) and dictionary learning; transcoders and attribution graphs; steering vectors.

**Learn**
- *Core:* [ARENA curriculum](https://www.arena.education/), chapter 1 (Transformer interpretability). Free and hands-on; the standard on-ramp.
- *Core:* Anthropic, [A Mathematical Framework for Transformer Circuits](https://transformer-circuits.pub/2021/framework/index.html) and [In-context Learning and Induction Heads](https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html)
- *Core:* Anthropic, [Toy Models of Superposition](https://transformer-circuits.pub/2022/toy_model/index.html) and [Towards Monosemanticity](https://transformer-circuits.pub/2023/monosemantic-features)
- *Core:* [TransformerLens](https://github.com/TransformerLensOrg/TransformerLens) library
- *Optional:* the rest of [transformer-circuits.pub](https://transformer-circuits.pub/), including Scaling Monosemanticity and the circuit-tracing work
- *Optional:* Neel Nanda's guides on getting started in mechanistic interpretability (linked from his [website](https://www.neelnanda.io/))

**Build**
- [ ] ARENA chapter 1 exercises
- [ ] Find induction heads in your own small GPT
- [ ] Train a sparse autoencoder on one layer of a small model and label 20 features by hand
- [ ] Build a steering vector that reliably changes one behavior, and measure the side effects

**Checkpoint:** you can take a small model behavior and form and test a causal hypothesis about which components produce it.

---

### 3.7 Doing research ★

**Why:** the final skill is producing knowledge that is trustworthy, not just running code.

**Concepts:** choosing problems (important × tractable × suited to you); hypotheses before experiments; baselines first; ablations; seeds and variance across runs; avoiding test-set leakage; negative results; fast iteration loops; good experiment infrastructure (you're well placed here); clear writing and figures.

**Learn**
- *Core:* John Schulman, [An Opinionated Guide to ML Research](http://joschu.net/blog/opinionated-guide-ml-research.html), read again now
- *Core:* Richard Hamming, [You and Your Research](https://www.cs.virginia.edu/~robins/YouAndYourResearch.html) (talk transcript)
- *Core:* Andrej Karpathy, [A Recipe for Training Neural Networks](https://karpathy.github.io/2019/04/25/recipe/), read again with research eyes
- *Optional:* Richard Sutton, [The Bitter Lesson](http://www.incompleteideas.net/IncIdeas/BitterLesson.html)

**Communities & programs**
- [EleutherAI](https://www.eleuther.ai/), an open research community with active Discord projects you can join
- [MATS](https://www.matsprogram.org/), a mentored AI alignment/safety research program
- [Anthropic Fellows Program](https://alignment.anthropic.com/), funded research with Anthropic mentors (check the Anthropic site for current calls)
- [GPU MODE](https://github.com/gpu-mode) for systems-flavored research
- Open-source: contribute to vLLM, TRL, TransformerLens, lm-evaluation-harness or nanoGPT-style projects

**Build**
- [ ] **Capstone F** (see projects): a small original study, written as a short paper or blog post
- [ ] At least one merged contribution to a major open-source ML repo
- [ ] Share your work publicly (blog, LessWrong/Alignment Forum, arXiv or a workshop)

**Checkpoint:** a researcher reads your write-up and trusts the conclusions, because the baselines, ablations, seeds and error bars are there.

---

## Track 3 complete when

- [ ] Modules 3.1–3.6 checkpoints passed
- [ ] 30+ paper summaries in `notes/papers/`
- [ ] Capstone E (reproduction) and Capstone F (original study) published
- [ ] One merged open-source contribution
- [ ] Math Level 3 core done

**Roles you can target now:** Research Engineer, Member of Technical Staff (research-adjacent), Applied Research Scientist, AI research fellowships.

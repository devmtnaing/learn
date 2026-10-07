# Math Track

The math runs **alongside** the three tracks, not before them. Each level covers what its matching track needs.

**Method:** learn the intuition (videos), work through the formal material (book), then **implement it in NumPy**. If you can code it and check it against a library, you understand it.

| Level | Pairs with | Rough effort |
|---|---|---|
| Level 1: Intuition | Track 1 | 2–3 hrs/week for 6–8 weeks |
| Level 2: Working math for deep learning | Track 2 | 3–4 hrs/week for 4–6 months |
| Level 3: Research math | Track 3 | Ongoing |

---

## Level 1: Intuition (with Track 1)

Enough to understand embeddings, similarity search and why sampling settings change model outputs.

**Topics**
- Vectors, dot product, vector length (norm), cosine similarity
- Matrices as functions that transform vectors; matrix-vector multiply
- Exponentials and logs; why we work in log-space
- Softmax and temperature
- Basic probability: distributions, sampling, expected value
- Basic statistics for evals: mean, variance, standard error, confidence intervals

**Learn**
- *Core:* 3Blue1Brown, [Essence of Linear Algebra](https://www.3blue1brown.com/topics/linear-algebra), chapters 1–4 and 9
- *Core:* 3Blue1Brown, [Neural Networks](https://www.3blue1brown.com/topics/neural-networks) series. Watch all of it, including the transformer and attention chapters; it previews Track 2.
- *Core:* Khan Academy, [Statistics and Probability](https://www.khanacademy.org/math/statistics-probability): the sections on probability, random variables and confidence intervals
- *Optional:* [Seeing Theory](https://seeing-theory.brown.edu/), visual probability

**Build (NumPy)**
- [ ] Cosine similarity between one query vector and 10,000 document vectors, without loops
- [ ] Softmax with a temperature parameter. Plot the output distribution at T = 0.1, 1, 2.
- [ ] Sample 10,000 tokens from a softmax distribution and check the empirical frequencies match
- [ ] Given eval scores from 50 test cases for two prompts, compute the mean and a 95% confidence interval. Is prompt B really better?

**Checkpoint:** explain to a colleague why temperature 0 is (nearly) deterministic, and why cosine similarity is used for embeddings rather than Euclidean distance.

---

## Level 2: Working math for deep learning (with Track 2)

The math behind backpropagation, loss functions and optimizers.

### 2a. Linear algebra
- Matrix multiplication as many dot products; the rule shapes must follow: `[m,k] @ [k,n] → [m,n]`
- Transpose, identity, inverse (conceptually)
- Linear transformations, basis, rank
- Eigenvalues/eigenvectors and SVD (intuition, and why low-rank matters, which is the idea behind LoRA)
- Tensors as multi-dimensional arrays; batch dimensions; `einsum`

### 2b. Calculus
- Derivatives as rates of change; partial derivatives
- **The chain rule.** This is backpropagation.
- Gradients (the vector of partial derivatives) and what "direction of steepest ascent" means
- Jacobians (enough to follow shapes through a network)
- Computational graphs

### 2c. Probability & information theory
- Random variables, PMF/PDF, expectation, variance
- Bernoulli, categorical and Gaussian distributions
- Conditional probability, Bayes' rule
- Maximum likelihood estimation. Why minimizing cross-entropy equals maximizing likelihood.
- Entropy, cross-entropy, KL divergence
- Perplexity (the exponentiated cross-entropy you'll see in LLM papers)

### 2d. Optimization
- Gradient descent, learning rate, why too-large rates diverge
- Stochastic and mini-batch gradient descent
- Momentum, RMSProp, **Adam / AdamW**
- Learning-rate warmup and cosine decay
- Convex vs non-convex (intuition)

**Learn**
- *Core:* Deisenroth, Faisal & Ong, [*Mathematics for Machine Learning*](https://mml-book.github.io/) (free PDF), chapters 2 (linear algebra), 5 (vector calculus), 6 (probability), 7 (optimization). Use it as a reference; don't read it cover to cover.
- *Core:* 3Blue1Brown, [Essence of Calculus](https://www.3blue1brown.com/topics/calculus), chapters 1–4
- *Core:* Karpathy's [micrograd video](https://www.youtube.com/watch?v=VMj-3S1tku0), the best explanation of the chain rule as code
- *Core:* Parr & Howard, [The Matrix Calculus You Need for Deep Learning](https://explained.ai/matrix-calculus/)
- *Optional:* Gilbert Strang, [MIT 18.06 Linear Algebra](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/) (classic lectures)
- *Optional:* Sebastian Ruder, [An overview of gradient descent optimization algorithms](https://www.ruder.io/optimizing-gradient-descent/)
- *Optional:* Christopher Olah, [Visual Information Theory](https://colah.github.io/posts/2015-09-Visual-Information/)

**Build (NumPy, then check against PyTorch)**
- [ ] Linear regression trained with gradient descent: derive the gradient by hand, implement it, plot loss over steps
- [ ] Logistic regression on a 2D toy dataset with a hand-derived cross-entropy gradient
- [ ] Numerical gradient checking: compare your analytic gradient with `(f(x+h) - f(x-h)) / 2h`
- [ ] Implement SGD, momentum and Adam from their update equations, then race them on the same problem
- [ ] SVD on a small matrix; reconstruct it at rank 1, 2, 5 and plot the error (this is the LoRA idea)
- [ ] Compute entropy, cross-entropy and KL divergence between two categorical distributions; check KL ≥ 0
- [ ] Rewrite three matrix operations using `np.einsum`

**Checkpoint:** on a whiteboard, derive the gradient of softmax + cross-entropy with respect to the logits (it comes out as `p - y`), and explain why Adam usually beats plain SGD on transformers.

---

## Level 3: Research math (with Track 3)

Enough to read most ML papers without getting stuck on the notation, and to reason about why methods work.

**Topics**
- **Probability, more rigorously:** joint, marginal and conditional distributions; multivariate Gaussians; law of large numbers; central limit theorem; Monte Carlo estimation
- **Statistics:** hypothesis testing, bootstrap, multiple comparisons, effect sizes. You need these to make honest claims in experiments.
- **Bayesian thinking:** priors, posteriors, variational inference and the ELBO (used in VAEs and diffusion)
- **Optimization theory:** convexity, Lagrange multipliers, constrained optimization (used in RL and alignment derivations, e.g. the DPO derivation)
- **Information theory:** mutual information, KL properties (forward vs reverse KL)
- **Linear algebra depth:** eigendecomposition, matrix norms, conditioning, low-rank structure
- **RL math:** Markov decision processes, Bellman equations, policy gradient theorem
- *Optional:* random matrix theory and high-dimensional geometry (why initialization scales matter); stochastic differential equations (diffusion models)

**Learn**
- *Core:* Joe Blitzstein, [Stat 110: Probability](https://stat110.net/) (Harvard; lectures and book free)
- *Core:* Boyd & Vandenberghe, [*Convex Optimization*](https://web.stanford.edu/~boyd/cvxbook/) (free PDF), chapters 1–5
- *Core:* Kevin Murphy, [*Probabilistic Machine Learning: An Introduction*](https://probml.github.io/pml-book/book1.html) (free PDF), as your reference text
- *Core:* Sutton & Barto, [*Reinforcement Learning: An Introduction*](http://incompleteideas.net/book/the-book-2nd.html) (free PDF), chapters 1–6 and 13
- *Optional:* Kevin Murphy, [*Probabilistic Machine Learning: Advanced Topics*](https://probml.github.io/pml-book/book2.html)
- *Optional:* David MacKay, [*Information Theory, Inference, and Learning Algorithms*](https://www.inference.org.uk/mackay/itila/) (free)

**Build**
- [ ] Bootstrap confidence intervals for an eval metric; compare with the analytic standard error
- [ ] Monte Carlo estimate of an expectation; plot the error against sample count (shrinks as 1/√n)
- [ ] Derive and implement REINFORCE (policy gradient) on a simple bandit problem
- [ ] Follow the DPO paper's derivation line by line from the RLHF objective to the DPO loss, writing each step in your notes
- [ ] Measure forward vs reverse KL between a bimodal distribution and a single Gaussian fit; explain the "mode-covering vs mode-seeking" behavior

**Checkpoint:** pick a recent ML paper, read the method section, and rewrite its key equation in your own notation with every symbol defined.

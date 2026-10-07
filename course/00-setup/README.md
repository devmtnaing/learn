# 00 · Setup (week 0)

Get the tooling out of the way so it doesn't slow you down later.

## 1. Python for ML (coming from Ruby)

You already know Python from backend work. ML Python is a different style: array-oriented, notebook-heavy and full of shapes.

**Learn**
- *Core:* [NumPy: the absolute basics for beginners](https://numpy.org/doc/stable/user/absolute_beginners.html)
- *Core:* [NumPy broadcasting](https://numpy.org/doc/stable/user/basics.broadcasting.html). Broadcasting bugs are the most common silent ML bug.
- *Core:* [PyTorch: Learn the Basics](https://pytorch.org/tutorials/beginner/basics/intro.html)
- *Optional:* [Python Data Science Handbook](https://jakevdp.github.io/PythonDataScienceHandbook/) by Jake VanderPlas (free online), chapters on NumPy and Pandas.

**Build**
- Write matrix multiplication with three nested Python loops, then with NumPy. Time both at 512×512.
- Implement `softmax` in NumPy for a batch of vectors (shape `[batch, classes]`). Make it numerically stable by subtracting the max.

## 2. Environment

- **Package manager:** [`uv`](https://docs.astral.sh/uv/) (fast, handles Python versions and venvs). One project per folder under `projects/`.
- **Notebooks:** Jupyter or VS Code notebooks for exploration. Move code into `.py` files once it works.
- **Experiment tracking:** a free [Weights & Biases](https://wandb.ai/) account. You'll use it from Track 2.
- **Hugging Face account:** for models, datasets and hosting demos.
- **Model API keys:** Anthropic (and optionally one other provider) for Track 1. Set a monthly spend limit.

## 3. GPU access

Your Mac is fine for Track 1 and the early Track 2 work (small models, `mps` backend). Later you'll need NVIDIA GPUs.

| Option | Good for | Notes |
|---|---|---|
| [Google Colab](https://colab.research.google.com/) | Early exercises | Free tier has a T4; Pro is cheap. |
| [Kaggle Notebooks](https://www.kaggle.com/code) | Free GPU hours | Weekly quota. |
| [Modal](https://modal.com/) | Python-native serverless GPUs | A good fit for a backend engineer; pay per second. |
| RunPod / Lambda / Vast.ai | Hourly A100/H100 rentals | For GPT-2 reproduction and inference benchmarks. |
| AWS (g5/g6/p4/p5 instances) | Production-style benchmarks | You know AWS already. Watch the costs. |

**Budget guide:** expect roughly USD 0–20/month in Track 1 and 20–150/month in Track 2. A GPT-2 (124M) reproduction costs about USD 10–30 on rented GPUs.

## 4. Notes system

- Use `notes/` in this repo: one markdown file per week (template in `notes/README.md`).
- Keep a running `notes/glossary.md`. When you meet a new term, write a one-line definition in your own words.
- Consider Anki for spaced repetition of formulas and definitions (softmax, cross-entropy, attention, Adam update rule).

## Checkpoint

- [ ] `uv` project created, NumPy and PyTorch import, a tensor runs on `mps` (Mac) or `cuda` (Colab)
- [ ] Hugging Face, W&B and API accounts ready
- [ ] Stable softmax implemented and tested against `torch.softmax`
- [ ] First weekly note written

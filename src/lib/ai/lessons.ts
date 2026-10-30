/* Interactive lessons: a module's ideas taught one small screen at a time,
 * each followed by a check question with a hint. Keyed by module id, like
 * quizzes.ts. Bodies are markdown and are rendered at build time by course.ts.
 *
 * A check is one of:
 *   choice  pick an option; `a` is the index of the right one
 *   number  type a number; right within `tol` (default 0.001)
 *   text    type a short answer; compared ignoring spaces, case and brackets,
 *           so "(2, 3)", "2,3" and "[2, 3]" all match "(2, 3)"
 * `hint` shows after the first miss, `why` once it is answered. */

export type Check =
  | { kind: 'choice'; q: string; o: string[]; a: number; hint: string; why: string }
  | { kind: 'number'; q: string; a: number; tol?: number; hint: string; why: string }
  | { kind: 'text'; q: string; a: string[]; hint: string; why: string }
export type Screen = { title: string; md: string; check?: Check }
/** `notebook` is a path under /course: the notebook the lesson ends with. */
export type LessonDef = { notebook?: string; screens: Screen[] }

export const lessons: Record<string, LessonDef> = {
  'setup-1': {
    notebook: '00-setup/notebooks/step-1.ipynb',
    screens: [
      // ───────── NumPy ─────────
      {
        title: 'AI data is just numbers',
        md: `Every kind of data a model sees is turned into numbers first:

| data | as numbers |
|---|---|
| an image | a grid of pixel brightness values |
| text | a list of token ids, one number per word piece |
| a table | rows and columns of numbers |

So most of ML code is **math on big piles of numbers**. NumPy is the Python tool for that.`,
        check: {
          kind: 'choice',
          q: 'A 28 × 28 grayscale image becomes…',
          o: ['A grid of 28 × 28 numbers', 'A single number', 'A sentence describing it', 'A file name'],
          a: 0,
          hint: 'Each pixel has a brightness. How many pixels are there?',
          why: 'One number per pixel, laid out in the same 28 × 28 grid.',
        },
      },
      {
        title: 'NumPy arrays: math without loops',
        md: `A NumPy \`array\` lets you do math on every number at once:

\`\`\`python
import numpy as np

prices = np.array([100, 200, 300])
prices * 2        # array([200, 400, 600])
\`\`\`

No \`for\` loop. It's also **much faster** than a Python loop:

\`\`\`
Python loop:  overhead paid once PER NUMBER   (1,000,000 times)
NumPy:        overhead paid once PER OPERATION, then a tight C loop
\`\`\`

Writing the loop in C yourself would be about as fast, but NumPy gives you that speed while you write one line of Python.`,
        check: {
          kind: 'choice',
          q: 'What is `np.array([1, 2, 3]) + 10`?',
          o: ['`array([11, 12, 13])`', '`array([1, 2, 3, 10])`', 'An error', '`16`'],
          a: 0,
          hint: 'The `+ 10` is applied to every number in the array.',
          why: 'Math on an array works element by element: 1+10, 2+10, 3+10.',
        },
      },
      {
        title: 'Shapes',
        md: `Every array has a **shape**: how many numbers along each dimension.

\`\`\`
5                    shape ()       a scalar: one number
[1, 2, 3]            shape (3,)     1D: 3 numbers
[[1, 2, 3],          shape (2, 3)   2D: 2 rows, 3 columns
 [4, 5, 6]]
\`\`\`

Read a 2D shape as **(rows, columns)**. Shape bugs are the most common bugs in ML code, so get used to asking "what shape is this?"`,
        check: {
          kind: 'text',
          q: 'What is the shape of `np.array([[1, 2], [3, 4], [5, 6]])`?',
          a: ['(3, 2)'],
          hint: 'Count the inner lists (rows), then the numbers in each (columns).',
          why: '3 rows of 2 numbers each: shape (3, 2).',
        },
      },
      {
        title: 'Indexing and slicing',
        md: `Pick out parts of an array with \`[rows, columns]\`. A \`:\` means "all of them".

\`\`\`python
x = np.arange(6).reshape(2, 3)
# [[0, 1, 2],
#  [3, 4, 5]]

x[0]       # [0, 1, 2]   first row
x[1, 2]    # 5           row 1, column 2
x[:, 0]    # [0, 3]      every row, column 0
x[0, 1:3]  # [1, 2]      row 0, columns 1 up to (not including) 3
\`\`\`

Counting starts at **0**, and a slice \`a:b\` stops *before* \`b\`.`,
        check: {
          kind: 'choice',
          q: 'With the same `x`, what is `x[:, 1]`?',
          o: ['`[1, 4]`', '`[3, 4, 5]`', '`[0, 1]`', '`4`'],
          a: 0,
          hint: '`:` means every row; `1` means column 1 (the second column).',
          why: 'Column 1 holds 1 (row 0) and 4 (row 1).',
        },
      },
      {
        title: 'sum and mean along an axis',
        md: `\`axis\` says which direction to collapse:

\`\`\`
data (4, 3)          data.mean(axis=0) → shape (3,)    collapse the rows:
┌────┬────┬────┐                                       one value per COLUMN
│    │    │    │ ─┐
│    │    │    │  │  data.mean(axis=1) → shape (4,)    collapse the columns:
│    │    │    │  │                                    one value per ROW
│    │    │    │ ─┘
└────┴────┴────┘
\`\`\`

Add \`keepdims=True\` to keep the collapsed dimension as size 1: \`data.mean(axis=1, keepdims=True)\` has shape **(4, 1)**. That shape is exactly what you need for broadcasting, coming next.`,
        check: {
          kind: 'text',
          q: '`data` has shape (4, 3). What is the shape of `data.sum(axis=0)`?',
          a: ['(3,)', '3'],
          hint: 'axis=0 collapses the rows, so one value is left per column.',
          why: 'Summing down the 4 rows leaves one number for each of the 3 columns: (3,).',
        },
      },
      // ───────── Broadcasting ─────────
      {
        title: 'Broadcasting: the rule',
        md: `Broadcasting lets arrays of **different shapes** work together by "stretching" the smaller one.

**The rule:** line the shapes up **from the right**. Each pair must be **equal**, or one of them must be **1** (or missing).

\`\`\`
images  (4, 3)      4 images × 3 colour channels
means      (3,)     one mean per channel
           ───
compare:  3 vs 3 ✓    4 vs (missing) ✓    →  result (4, 3)
\`\`\`

The \`(3,)\` row is copied **down all 4 rows**, so each column gets its own value subtracted.`,
        check: {
          kind: 'choice',
          q: 'What does `(4, 3)` + `(3,)` give?',
          o: ['Shape (4, 3)', 'Shape (3,)', 'An error', 'Shape (4,)'],
          a: 0,
          hint: 'Compare from the right: 3 vs 3, then 4 vs nothing.',
          why: 'Both pairs are fine, so the (3,) stretches down the rows and the result is (4, 3).',
        },
      },
      {
        title: 'Broadcasting: one value per row',
        md: `What if you want **one value per row** instead, like each image's own mean?

\`\`\`
images  (4, 3)
per_img (4,)       compare from the right: 3 vs 4  ✗  → ERROR
\`\`\`

Make it a column, shape **(4, 1)**, and it stretches **across** the columns:

\`\`\`python
per_img = images.mean(axis=1, keepdims=True)   # (4, 1)
# or: x.reshape(4, 1)   or: x[:, None]
images - per_img                               # (4, 3) ✓
\`\`\`

The danger: when shapes *happen* to line up wrongly, NumPy doesn't error. It quietly computes the wrong thing. That's why broadcasting bugs are called **silent**.`,
        check: {
          kind: 'choice',
          q: 'What does `(4, 3)` + `(4,)` give?',
          o: ['An error', 'Shape (4, 3)', 'Shape (4, 4)', 'Shape (4,)'],
          a: 0,
          hint: 'Line them up from the right. What is the first pair you compare?',
          why: 'From the right it is 3 vs 4: not equal and neither is 1, so it errors. Reshape to (4, 1) to get one value per row.',
        },
      },
      {
        title: 'Broadcasting both ways',
        md: `Both arrays can stretch at once:

\`\`\`
x  (8, 1)    a column of 8
y  (1, 5)    a row of 5
   ──────
   1 vs 5 → stretch x across;  8 vs 1 → stretch y down
\`\`\`

Every row of \`x\` gets combined with every column of \`y\`.`,
        check: {
          kind: 'text',
          q: 'What is the shape of `x + y` when x is (8, 1) and y is (1, 5)?',
          a: ['(8, 5)'],
          hint: 'For each pair, the 1 stretches to match the other number.',
          why: 'The 1s stretch to 5 and to 8, giving (8, 5).',
        },
      },
      // ───────── Matmul and softmax ─────────
      {
        title: 'Matrix multiplication: @',
        md: `Matrix multiplication is **the** operation of deep learning. Every layer of a neural network is mostly one.

\`\`\`python
A @ B
\`\`\`

**Shape rule:** \`[m, k] @ [k, n] → [m, n]\`. The two **inner** numbers must match, and they disappear.

\`\`\`
[32, 64] @ [64, 10]
     └──┬──┘
     must match → result [32, 10]
\`\`\`

Each output number is a row of \`A\` "dotted" with a column of \`B\`: multiply pairs, then add them up.`,
        check: {
          kind: 'text',
          q: 'What is the shape of `[32, 64] @ [64, 10]`?',
          a: ['(32, 10)'],
          hint: 'Keep the outer numbers; the inner 64s must match and disappear.',
          why: '[m, k] @ [k, n] gives [m, n]: (32, 10).',
        },
      },
      {
        title: 'Why matmul needs NumPy',
        md: `By hand, multiplying two n × n matrices takes **three nested loops**:

\`\`\`python
for i in range(n):          # each row of A
    for j in range(n):      # each column of B
        for k in range(n):  # add up the pairs
            C[i, j] += A[i, k] * B[k, j]
\`\`\`

For n = 512 that's 512 × 512 × 512 ≈ **134 million** multiply-adds. Measured on an Apple Silicon Mac: **about 14 seconds** with the loops, **under 1 millisecond** with \`A @ B\`. That's over 10,000× faster.

You'll time both yourself in the notebook. It's the course's first Build exercise.`,
        check: {
          kind: 'choice',
          q: 'Roughly why is `A @ B` so much faster than the 3-loop version?',
          o: [
            'It runs optimised compiled code instead of paying Python overhead on every multiply',
            'It skips some of the multiplications',
            'It uses less accurate numbers',
            'Python loops are broken',
          ],
          a: 0,
          hint: 'Remember where the Python overhead is paid: per number, or per operation?',
          why: 'The loops pay Python overhead 134 million times; @ hands the whole job to optimised C/BLAS code once.',
        },
      },
      {
        title: 'Softmax: scores into probabilities',
        md: `A model's raw outputs ("scores", called **logits**) can be any numbers. **Softmax** turns them into probabilities that are all positive and add up to 1:

\`\`\`
softmax(x) = exp(x) / sum(exp(x))

scores  [2.0, 1.0, 0.1]
exp     [7.39, 2.72, 1.11]   sum = 11.22
probs   [0.66, 0.24, 0.10]   sum = 1 ✓
\`\`\`

**Stable version:** \`exp(1000)\` overflows to \`inf\`. Subtract the max first. It gives the **same answer**, because shifting every score by the same amount cancels out in the division.

\`\`\`python
def softmax(x):                                  # x: (batch, classes)
    x = x - x.max(axis=1, keepdims=True)         # (batch, 1) broadcasts
    e = np.exp(x)
    return e / e.sum(axis=1, keepdims=True)
\`\`\`

Look at the code: \`axis\`, \`keepdims\` and broadcasting, all from earlier screens.`,
        check: {
          kind: 'choice',
          q: 'What is `softmax([3.0, 3.0])`?',
          o: ['`[0.5, 0.5]`', '`[3.0, 3.0]`', '`[1.0, 1.0]`', '`[0.0, 0.0]`'],
          a: 0,
          hint: 'Equal scores get equal probabilities, and they must add up to 1.',
          why: 'Both exps are equal, so each gets half: [0.5, 0.5].',
        },
      },
      // ───────── PyTorch: tensors ─────────
      {
        title: 'PyTorch tensors',
        md: `A **tensor** is the maths word for an array with any number of dimensions. A scalar is a 0D tensor, a list is 1D, a grid is 2D…

\`torch.tensor\` is like a NumPy array, plus two superpowers:

1. **It runs on a GPU**: fast for big models.
2. **Autograd**: it can compute gradients for you (coming up).

\`\`\`python
import torch
x = torch.arange(6)       # tensor([0, 1, 2, 3, 4, 5])
x.shape                   # torch.Size([6])
\`\`\`

Shapes and broadcasting work **exactly** like NumPy. (TensorFlow is a different library from Google. PyTorch is from Meta and is the standard for research and most LLMs.)`,
        check: {
          kind: 'choice',
          q: 'What do PyTorch tensors add on top of NumPy arrays?',
          o: ['GPU support and automatic gradients', 'Different broadcasting rules', 'Only a different name', 'Support for strings'],
          a: 0,
          hint: 'There were two "superpowers".',
          why: 'Same array ideas, plus GPUs and autograd. Broadcasting is identical.',
        },
      },
      {
        title: 'reshape',
        md: `\`reshape\` puts the **same numbers** into a new shape, filling row by row:

\`\`\`
torch.arange(6).reshape(2, 3)      torch.arange(6).reshape(3, 2)
┌───┬───┬───┐                      ┌───┬───┐
│ 0 │ 1 │ 2 │                      │ 0 │ 1 │
├───┼───┼───┤                      ├───┼───┤
│ 3 │ 4 │ 5 │                      │ 2 │ 3 │
└───┴───┴───┘                      ├───┼───┤
                                   │ 4 │ 5 │
                                   └───┴───┘
\`\`\`

**Rule:** reshape never adds or drops numbers, so rows × columns must equal the count. \`-1\` means "you work this one out": \`x.reshape(2, -1)\` → (2, 3).`,
        check: {
          kind: 'choice',
          q: 'What does `torch.arange(6).reshape(4, 2)` do?',
          o: ['Raises an error', 'Pads the last row with zeros', 'Leaves the last row empty', 'Drops the extra slots'],
          a: 0,
          hint: 'How many slots does (4, 2) have, and how many numbers are there?',
          why: '4 × 2 = 8 slots but only 6 numbers: RuntimeError. Tensors can\'t have ragged or padded rows.',
        },
      },
      {
        title: 'NumPy ↔ PyTorch',
        md: `Data usually starts in NumPy (loaded from files, images, pandas) and becomes a tensor for training:

\`\`\`python
a = np.array([1, 2, 3])
t = torch.from_numpy(a)    # NumPy → tensor: SHARES memory
b = t.numpy()              # tensor → NumPy: shares memory too
c = torch.tensor(a)        # makes an independent COPY
\`\`\`

\`\`\`
from_numpy:             torch.tensor(a):
 a ──┐                   a ──► [1, 2, 3]
     ├──► [1, 2, 3]      c ──► [1, 2, 3]   (separate copy)
 t ──┘
\`\`\``,
        check: {
          kind: 'choice',
          q: '`t = torch.from_numpy(a)`, then `a[0] = 100`. What is `t`?',
          o: ['`tensor([100, 2, 3])`', '`tensor([1, 2, 3])`', 'An error', '`tensor([100])`'],
          a: 0,
          hint: 'Do `a` and `t` point at the same box of numbers, or two boxes?',
          why: 'from_numpy shares memory, so changing a changes t. With torch.tensor(a), t would stay [1, 2, 3].',
        },
      },
      {
        title: 'Devices: CPU and GPU',
        md: `Every tensor lives on a **device**:

| device | what |
|---|---|
| \`"cpu"\` | the default |
| \`"mps"\` | Apple Silicon Mac GPU |
| \`"cuda"\` | NVIDIA GPU (cloud, Colab) |

\`\`\`python
device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
x = torch.tensor([1., 2.], device=device)
\`\`\`

**Rule:** maths only works between tensors on the **same device**. Pick the device once at the top and use it everywhere.`,
        check: {
          kind: 'choice',
          q: '`x` is on `"mps"`, `y` is on the CPU. What does `x + y` do?',
          o: ['Raises a "same device" error', 'Moves y automatically', 'Returns a CPU tensor', 'Returns zeros'],
          a: 0,
          hint: 'What is the rule about devices?',
          why: 'RuntimeError: expected all tensors to be on the same device. Fix: create y on the same device too.',
        },
      },
      // ───────── Training ─────────
      {
        title: 'Loss: how wrong is the guess?',
        md: `Training is a guessing game. The simplest version has **one number** \`w\` (the model's guess) and a **target** (the right answer). Here the target is 5.

\`\`\`
 w = 3                          target = 5
   3 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ► 5
\`\`\`

The **loss** measures how wrong the guess is:

\`\`\`python
loss = (w - 5) ** 2     # 0 when w = 5; bigger the further away
\`\`\`

In real models the target comes from data: the real house price, the photo's label, the actual next word.`,
        check: {
          kind: 'number',
          q: 'What is the loss when `w = 3`?',
          a: 4,
          hint: 'Work out (3 − 5) first, then square it.',
          why: '(3 − 5)² = (−2)² = 4.',
        },
      },
      {
        title: 'The gradient',
        md: `The **gradient** says how the loss changes when \`w\` changes: which way is "uphill". For our loss it is:

\`\`\`
grad = 2 * (w - 5)
\`\`\`

- **negative** gradient → loss goes *down* if \`w\` goes **up**
- **positive** gradient → loss goes *down* if \`w\` goes **down**

You don't usually work this out by hand. PyTorch does it for you, as you'll see in a moment.`,
        check: {
          kind: 'number',
          q: 'What is the gradient when `w = 3`?',
          a: -4,
          hint: '2 × (3 − 5). Watch the sign.',
          why: '2 × (−2) = −4. Negative, so increasing w lowers the loss.',
        },
      },
      {
        title: 'Gradient descent',
        md: `Step **opposite** the gradient:

\`\`\`python
w = w - learning_rate * grad      # learning_rate = 0.1
\`\`\`

The **learning rate** is the step size. Subtracting a negative gradient makes \`w\` go **up**, toward 5.`,
        check: {
          kind: 'number',
          q: 'With `w = 3`, `grad = -4`, `learning_rate = 0.1`: what is the new `w`?',
          a: 3.4,
          hint: '3 − 0.1 × (−4). Subtracting a negative is adding.',
          why: '3 − (−0.4) = 3.4. Closer to 5.',
        },
      },
      {
        title: 'Step two: smaller steps',
        md: `Repeat from \`w = 3.4\`. Break it into three lines so the signs stay straight:

\`\`\`
1. grad  = 2 * (3.4 - 5)
2. step  = 0.1 * grad
3. w_new = 3.4 - step
\`\`\``,
        check: {
          kind: 'number',
          q: 'What is the new `w` after step two?',
          a: 3.72,
          hint: 'grad = −3.2 and step = −0.32. Start from 3.4, not 3.',
          why: '3.4 − (−0.32) = 3.72. The step (0.32) is smaller than the first (0.4) because the gradient shrinks as w nears 5, so training slows down as it arrives.',
        },
      },
      {
        title: 'The learning rate',
        md: `\`\`\`
lr = 1.0:   3 ──────────► 7      grad flips sign every step:
            ◄──────────── 3      it bounces forever (or explodes if bigger)

lr = 0.1:   3 → 3.4 → 3.72 → …  → 5    steady ✓

lr = 0.001: 3 → 3.004 → …            thousands of steps 🐢
\`\`\`

| learning rate | result |
|---|---|
| too big | overshoots, bounces or blows up |
| about right | steady progress |
| too small | works, but painfully slow |`,
        check: {
          kind: 'number',
          q: 'With `lr = 1.0` and `w = 3`, what is `w` after one step?',
          a: 7,
          hint: 'grad is still −4. Now the step is 1.0 × (−4).',
          why: '3 − (−4) = 7. It jumped right over 5, and the next step jumps back to 3.',
        },
      },
      {
        title: 'Autograd: PyTorch computes the gradient',
        md: `The same training loop in PyTorch. You never write \`2 * (w - 5)\`:

\`\`\`python
w = torch.tensor(3.0, requires_grad=True)   # track gradients for w
lr = 0.1

for step in range(10):
    loss = (w - 5) ** 2
    loss.backward()            # computes w.grad for you

    with torch.no_grad():      # the update itself isn't part of the maths to track
        w -= lr * w.grad

    w.grad.zero_()             # reset for the next step (next screen)
    print(step + 1, round(w.item(), 4))
\`\`\`

Prints \`1 3.4\`, \`2 3.72\`, … the same numbers you just computed by hand. For a model with millions of numbers, autograd is what makes training possible.`,
        check: {
          kind: 'choice',
          q: 'What does `loss.backward()` do?',
          o: ['Computes the gradient of the loss for every tensor with requires_grad', 'Updates w', 'Resets the gradient', 'Undoes the last step'],
          a: 0,
          hint: 'Which line actually changes w? It isn\'t this one.',
          why: 'backward() only fills in .grad. The update is the separate w -= lr * w.grad line (optimizer.step() in real code).',
        },
      },
      {
        title: 'Why zero the gradient?',
        md: `\`backward()\` doesn't replace \`w.grad\`. It **adds** to it, like pouring into a bucket that is never emptied:

\`\`\`
with zero_():     step 1: grad = −4     → w = 3.4
                  step 2: grad = −3.2   → w = 3.72  ✓

without zero_():  step 1: grad = −4     → w = 3.4
                  step 2: grad = −4 + (−3.2) = ?
\`\`\`

Without it, \`w\` goes 3.4, 4.12, 5.02, 5.91, 6.62, 7.01, 6.99, 6.58 … swinging like a pendulum. In real code this is \`optimizer.zero_grad()\`, once every step.`,
        check: {
          kind: 'number',
          q: 'Without `zero_()`, what is `w.grad` at step 2?',
          a: -7.2,
          hint: 'The old −4 is still in the bucket. Add the new −3.2 to it.',
          why: '−4 + (−3.2) = −7.2, so the step is 0.72 instead of 0.32 and w overshoots.',
        },
      },
      {
        title: 'Your turn: the notebook',
        md: `You've seen every idea in Step 1. Now **run it**. The notebook has a section for each screen, with small exercises and \`assert\` checks that tell you when you're right:

1. NumPy arrays, indexing and \`axis\`
2. Broadcasting
3. **Build:** matmul with three loops vs \`@\`, timed at 512 × 512
4. **Build:** a numerically stable softmax, checked against \`torch.softmax\`
5. Tensors, reshape, NumPy ↔ PyTorch, devices
6. A training loop that runs until \`w\` reaches 5

Open it in Colab (runs in your browser, free GPU) or download it for Jupyter on your machine. Stuck? Every exercise has a hidden hint and solution. Try first.

The official docs are in the **Learn** step. Read them alongside the notebook.`,
      },
    ],
  },
}

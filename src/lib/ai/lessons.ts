/* Interactive lessons: a module's ideas taught one small screen at a time,
 * each followed by a check question with a hint. Keyed by module id, like
 * quizzes.ts. Bodies are markdown and are rendered at build time by course.ts.
 *
 * A check is one of:
 *   choice  pick an option; `a` is the index of the right one
 *   number  type a number; right within `tol` (default 0.001)
 *   text    type a short answer; compared ignoring spaces, case and brackets,
 *           so "(2, 3)", "2,3" and "[2, 3]" all match "(2, 3)"
 * `hint` shows after the first miss, `why` once it is answered.
 *
 * Ask about a new case, not the one the screen just worked through, so the
 * check tests the idea rather than memory. Pictures come from viz.ts. */

import { bars, grid, steps, viz } from './viz'

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

${viz(grid(
  [
    [0, 9, 9, 9, 0],
    [0, 0, 0, 9, 0],
    [0, 0, 9, 0, 0],
    [0, 0, 9, 0, 0],
    [0, 0, 9, 0, 0],
  ],
  { shade: true, cap: 'a 5 × 5 picture of a 7: 25 numbers<br>0 = blank, 9 = full ink' },
))}

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

${viz(grid([100, 200, 300]), '× 2', '=', grid([200, 400, 600], { hl: ['0,*'] }))}

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

${viz(grid([[5]], { cap: '()' }), grid([1, 2, 3], { cap: '(3,)' }), grid([[1, 2, 3], [4, 5, 6]], { cap: '(2, 3)' }))}

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

${viz(
  ...[
    ['0,*', 'x[0]'],
    ['1,2', 'x[1, 2]'],
    ['*,0', 'x[:, 0]'],
    ['0,1', 'x[0, 1:3]', '0,2'],
  ].map(([a, cap, b]) => grid([[0, 1, 2], [3, 4, 5]], { hl: [a, b ?? a], cap: `<code>${cap}</code>` })),
)}

Counting starts at **0**, and a slice \`a:b\` stops *before* \`b\`.`,
        check: {
          kind: 'choice',
          q: 'A bigger one: `y = np.arange(12).reshape(3, 4)`. What is `y[2, 1:3]`?',
          o: ['`[9, 10]`', '`[9, 10, 11]`', '`[6, 10]`', '`[5, 6]`'],
          a: 0,
          hint: 'Rows are [0..3], [4..7], [8..11]. Take row 2, then columns 1 and 2 (3 is not included).',
          why: 'Row 2 is [8, 9, 10, 11]; columns 1 up to 3 are 9 and 10.',
        },
      },
      {
        title: 'sum and mean along an axis',
        md: `\`axis\` says which direction to collapse:

${viz(
  grid([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]], { cap: 'data (4, 3)' }),
  grid([22, 26, 30], { hl: ['0,*'], cap: '<code>sum(axis=0)</code> → (3,)<br>down each column' }),
  grid([[6], [15], [24], [33]], { hl: ['*,0'], cap: '<code>sum(axis=1)</code> → (4,)<br>across each row' }),
)}

- **axis=0** collapses the rows: one value per **column**.
- **axis=1** collapses the columns: one value per **row**.

Add \`keepdims=True\` to keep the collapsed dimension as size 1: \`data.mean(axis=1, keepdims=True)\` has shape **(4, 1)**. That shape is exactly what you need for broadcasting, coming next.`,
        check: {
          kind: 'text',
          q: '`scores` has shape (10, 7). What is the shape of `scores.sum(axis=0, keepdims=True)`?',
          a: ['(1, 7)'],
          hint: 'axis=0 collapses the 10 rows. keepdims keeps that dimension, as size 1.',
          why: 'One value per column is left (7 of them), and keepdims keeps the collapsed rows as a 1: (1, 7).',
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

The \`(3,)\` row is copied **down all 4 rows** (dashed boxes), so each column gets its own value subtracted:

${viz(
  grid([[5, 6, 7], [3, 4, 5], [9, 8, 7], [1, 2, 3]], { cap: 'images (4, 3)' }),
  '−',
  grid([1, 2, 3], { ghostRows: 3, hl: ['0,*'], cap: 'means (3,)<br>stretched down' }),
  '=',
  grid([[4, 4, 4], [2, 2, 2], [8, 6, 4], [0, 0, 0]], { cap: '(4, 3)' }),
)}`,
        check: {
          kind: 'choice',
          q: 'Which shape can be added to an array of shape `(5, 4)`?',
          o: ['`(4,)`', '`(5,)`', '`(4, 5)`', '`(3, 4)`'],
          a: 0,
          hint: 'Line each one up under (5, 4) from the right. Every pair must be equal, or 1, or missing.',
          why: '(4,): 4 vs 4, then 5 vs nothing. The others each have a pair that clashes: 5 vs 4, 5 vs 4 and 3 vs 5.',
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

${viz(
  grid([[5, 6, 7], [3, 4, 5], [9, 8, 7], [1, 2, 3]], { cap: 'images (4, 3)' }),
  '−',
  grid([[6], [4], [8], [2]], { ghostCols: 2, hl: ['*,0'], cap: 'per_img (4, 1)<br>stretched across' }),
  '=',
  grid([[-1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, 1]], { cap: '(4, 3)' }),
)}

The danger: when shapes *happen* to line up wrongly, NumPy doesn't error. It quietly computes the wrong thing. That's why broadcasting bugs are called **silent**.`,
        check: {
          kind: 'choice',
          q: '`scores` has shape (10, 3). To subtract each row\'s own max, what shape should the max be?',
          o: ['`(10, 1)`', '`(10,)`', '`(3,)`', '`(1, 3)`'],
          a: 0,
          hint: 'One value per row means 10 values. Which shape stretches across the columns?',
          why: '(10, 1) is a column of 10 that stretches across the 3 columns. (10,) errors (3 vs 10), and (3,) or (1, 3) give one value per column instead.',
        },
      },
      {
        title: 'Broadcasting both ways',
        md: `Both arrays can stretch at once:

\`\`\`
x  (3, 1)    a column of 3
y  (1, 4)    a row of 4
   ──────
   1 vs 4 → stretch x across;  3 vs 1 → stretch y down   →  (3, 4)
\`\`\`

${viz(
  grid([[1], [2], [3]], { ghostCols: 3, hl: ['*,0'], cap: 'x (3, 1)' }),
  '+',
  grid([10, 20, 30, 40], { ghostRows: 2, hl: ['0,*'], cap: 'y (1, 4)' }),
  '=',
  grid([[11, 21, 31, 41], [12, 22, 32, 42], [13, 23, 33, 43]], { cap: '(3, 4)' }),
)}

Every row of \`x\` gets combined with every column of \`y\`. A missing dimension counts as 1, so a plain \`(4,)\` would stretch the same way as \`(1, 4)\`.`,
        check: {
          kind: 'text',
          q: 'A common trap: `x` is (6, 1) and `y` is (6,). What is the shape of `x + y`?',
          a: ['(6, 6)'],
          hint: 'Treat (6,) as (1, 6), then compare from the right: 1 vs 6, then 6 vs 1.',
          why: 'Both stretch, giving (6, 6): 36 numbers when you probably wanted 6. NumPy raises no error, which is why this is a silent bug.',
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

Each output number is a row of \`A\` "dotted" with a column of \`B\`: multiply pairs, then add them up.

${viz(
  grid([[1, 2, 3], [4, 5, 6]], { hl: ['0,*'], cap: 'A (2, 3)' }),
  '@',
  grid([[1, 0], [0, 1], [1, 1]], { hl: ['*,0'], cap: 'B (3, 2)' }),
  '=',
  grid([[4, 5], [10, 11]], { hl: ['0,0'], cap: 'C (2, 2)' }),
)}

Highlighted: row 0 of A with column 0 of B gives \`1·1 + 2·0 + 3·1 = 4\`, which is \`C[0, 0]\`.`,
        check: {
          kind: 'choice',
          q: '`x` has shape (8, 3). Which shape of `W` makes `x @ W` valid, with a (8, 16) result?',
          o: ['`(3, 16)`', '`(8, 16)`', '`(16, 3)`', '`(16, 8)`'],
          a: 0,
          hint: "W's first number must match x's last. Its last number becomes the result's last.",
          why: '[8, 3] @ [3, 16]: the inner 3s match and disappear, leaving [8, 16].',
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

For n = 512 that's 512 × 512 × 512 ≈ **134 million** multiply-adds. Measured on an Apple Silicon Mac: **about 14 seconds** with the loops, **under 1 millisecond** with \`A @ B\`. That's over 10,000× faster:

${bars(
  [
    { label: '3 loops', value: 14, text: '≈ 14 s' },
    { label: 'A @ B', value: 0.00086, text: '< 1 ms' },
  ],
  'multiplying two 512 × 512 matrices (the @ bar is there, just too thin to see)',
)}

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

${bars(
  [
    { label: 'cat  2.0', value: 0.66, text: '66%' },
    { label: 'dog  1.0', value: 0.24, text: '24%' },
    { label: 'fox  0.1', value: 0.1, text: '10%' },
  ],
  'scores → probabilities: the biggest score gets the biggest share',
)}

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
          q: 'With the stable version, what is `softmax([1000, 1000, 1000])`?',
          o: ['About `[0.33, 0.33, 0.33]`', '`[inf, inf, inf]`', '`[nan, nan, nan]`', '`[1000, 1000, 1000]`'],
          a: 0,
          hint: 'Subtract the max first. What do the scores become? And equal scores get equal shares.',
          why: 'After subtracting the max they are [0, 0, 0], exp gives [1, 1, 1], so each gets 1/3. The unstable version computes exp(1000) = inf and returns nan.',
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

${viz(
  grid([0, 1, 2, 3, 4, 5], { cap: '<code>torch.arange(6)</code>' }),
  '→',
  grid([[0, 1, 2], [3, 4, 5]], { cap: '<code>.reshape(2, 3)</code>' }),
  grid([[0, 1], [2, 3], [4, 5]], { cap: '<code>.reshape(3, 2)</code>' }),
)}

**Rule:** reshape never adds or drops numbers, so rows × columns must equal the count. \`reshape(4, 2)\` on these 6 numbers is a RuntimeError: 8 slots, 6 numbers, and no padding.

\`-1\` means "you work this one out": \`x.reshape(2, -1)\` → (2, 3).`,
        check: {
          kind: 'text',
          q: 'What is the shape of `torch.arange(12).reshape(-1, 4)`?',
          a: ['(3, 4)'],
          hint: '12 numbers, 4 per row. How many rows does that make?',
          why: '12 ÷ 4 = 3, so -1 becomes 3: shape (3, 4).',
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
          q: '`a = np.array([1, 2, 3])`, `c = torch.tensor(a)`, then `c[1] = 50`. What is `a` now?',
          o: ['`[1, 2, 3]`', '`[1, 50, 3]`', 'An error', '`[50, 2, 3]`'],
          a: 0,
          hint: 'Does torch.tensor share the box of numbers, or make its own?',
          why: 'torch.tensor makes a copy, so changing c leaves a alone. With from_numpy, a would become [1, 50, 3].',
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
          q: '`x = torch.ones(3, device="mps")` and `y = torch.ones(3)`. `x + y` errors. What fixes it?',
          o: ['Create y with `device="mps"` too', 'Call `y.numpy()` first', 'Use `x.reshape(3, 1)`', 'Nothing: PyTorch moves y for you'],
          a: 0,
          hint: 'Where does y live when you don\'t pass a device?',
          why: 'y defaults to the CPU, and maths needs both tensors on one device. Creating y with device="mps" (or the shared device variable) fixes it.',
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

For \`w = 3\`: the distance is 3 − 5 = −2, so the loss is (−2)² = **4**.

${steps([3], { cap: 'w = 3 is 2 away from the target' })}

In real models the target comes from data: the real house price, the photo's label, the actual next word.`,
        check: {
          kind: 'number',
          q: 'Now the guess is too big. What is the loss when `w = 8`?',
          a: 9,
          hint: 'Work out (8 − 5) first, then square it.',
          why: '(8 − 5)² = 3² = 9. Squaring makes the loss positive on both sides of the target.',
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

For \`w = 3\`: grad = 2 × (3 − 5) = **−4**. Negative, so w should go **up**.

You don't usually work this out by hand. PyTorch does it for you, as you'll see in a moment.`,
        check: {
          kind: 'number',
          q: 'What is the gradient when `w = 8`?',
          a: 6,
          hint: '2 × (8 − 5). Is it positive or negative?',
          why: '2 × 3 = 6. Positive, so w should go down: it is past the target.',
        },
      },
      {
        title: 'Gradient descent',
        md: `Step **opposite** the gradient:

\`\`\`python
w = w - learning_rate * grad      # learning_rate = 0.1
\`\`\`

The **learning rate** is the step size. From \`w = 3\` with grad −4:

\`\`\`
w = 3 - 0.1 * (-4) = 3 + 0.4 = 3.4      subtracting a negative goes UP, toward 5
\`\`\`

${steps([3, 3.4])}`,
        check: {
          kind: 'number',
          q: 'From the other side: `w = 8`, `grad = 6`, `learning_rate = 0.1`. What is the new `w`?',
          a: 7.4,
          hint: '8 − 0.1 × 6. This time the gradient is positive.',
          why: '8 − 0.6 = 7.4. A positive gradient moves w down, again toward 5.',
        },
      },
      {
        title: 'Step two: smaller steps',
        md: `Repeat from \`w = 3.4\`. Break it into three lines so the signs stay straight:

\`\`\`
1. grad  = 2 * (3.4 - 5)   = -3.2
2. step  = 0.1 * grad      = -0.32
3. w_new = 3.4 - step      = 3.72
\`\`\`

${steps([3, 3.4, 3.72], { cap: 'the second step (0.32) is smaller than the first (0.4)' })}

The gradient shrinks as \`w\` nears 5, so the steps shrink too and training slows down as it arrives.`,
        check: {
          kind: 'number',
          q: 'Do step two from the other side: you are at `w = 7.4`, lr = 0.1. What is the new `w`?',
          a: 6.92,
          hint: 'Same three lines: grad = 2 × (7.4 − 5), then step = 0.1 × grad, then 7.4 − step.',
          why: 'grad = 4.8, step = 0.48, so w = 7.4 − 0.48 = 6.92. Smaller than the first step (0.6), just like from below.',
        },
      },
      {
        title: 'The learning rate',
        md: `Same start (\`w = 3\`), three step sizes:

${steps([3, 7, 3, 7], { cap: 'lr = 1.0: jumps over 5 and back, forever' })}

${steps([3, 3.4, 3.72, 3.976], { cap: 'lr = 0.1: steady' })}

${steps([3, 3.004, 3.008], { cap: 'lr = 0.001: barely moves, thousands of steps' })}

| learning rate | result |
|---|---|
| too big | overshoots, bounces or blows up |
| about right | steady progress |
| too small | works, but painfully slow |`,
        check: {
          kind: 'number',
          q: 'With `lr = 0.75` and `w = 3`, what is `w` after one step?',
          a: 6,
          hint: 'grad is still −4. Now the step is 0.75 × (−4).',
          why: '3 − (−3) = 6. It overshoots 5 by 1, but the next step goes back only to 4.5: the swings shrink, so this one still settles.',
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
with zero_():     step 1: grad = −4                  → w = 3.4
                  step 2: grad = −3.2                → w = 3.72  ✓

without zero_():  step 1: grad = −4                  → w = 3.4
                  step 2: grad = −4 + (−3.2) = −7.2  → w = ?
\`\`\`

The bucket keeps growing, so every step is bigger than it should be. In real code this is \`optimizer.zero_grad()\`, once every step.`,
        check: {
          kind: 'number',
          q: 'Without `zero_()`, what is `w` after step 2? (w = 3.4, lr = 0.1, w.grad = −7.2)',
          a: 4.12,
          hint: '3.4 − 0.1 × (−7.2). Subtracting a negative is adding.',
          why: '3.4 + 0.72 = 4.12, a step of 0.72 instead of 0.32. Keep going and w swings past 5: 5.02, 5.91, 6.62, 7.01, 6.99 … like a pendulum.',
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

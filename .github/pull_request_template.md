## What this changes

<!-- The problem, or what you changed and why. -->

## Checklist

- [ ] `npm run check` passes
- [ ] `npm run verify -- <slug>` passes, with Go and Rust run (not skipped)
- [ ] every badge says what was actually run; every trap output was produced by running it
- [ ] `npm run build` succeeds, then `npm run audit -- <slug>` passes
- [ ] opens on step 1, and reads well beside another page at the same width
- [ ] **If this changes the AI Engineer course** (`course/`, `src/lib/ai/`, `src/pages/ai-engineer/`): `npm run build` and `npm run audit` pass, and new links open
- [ ] **If this changes how every page is built** (`src/lib/`, `src/layouts/`, `lesson.css`, `kit.css`, `scripts/check-lessons.mjs`): I updated `.claude/skills/leetcode-solution-page/` (usually `references/lesson-kit.md`) and `CONTRIBUTING.md` to match, or this change doesn't affect how a page is made.

See [CONTRIBUTING.md](../CONTRIBUTING.md) for what each item means.

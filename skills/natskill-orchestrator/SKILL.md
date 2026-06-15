# NatSkill Orchestrator

Use this skill when the user gives a broad, ambiguous, or multi-step command and
the agent needs to decide which installed NatSkill skill should handle the work.

## Purpose

Route each user request to the most relevant installed skill before acting. This
skill does not replace the domain skills; it selects them, sequences them, and
keeps the agent from using the wrong workflow.

## Routing Rules

- Use `get-shit-done` or `gsd` for milestone planning, phased execution,
  roadmap work, todo capture, progress checks, and structured autonomous work.
- Use `spec-kit` for spec-driven development, requirements, acceptance criteria,
  and implementation planning from formal specs.
- Use `understand-anything` when the user wants explanation, comprehension,
  summarization, or sense-making across unfamiliar material.
- Use `karpathy-skills` for learning-oriented AI, neural network, LLM, or
  deep-learning explanations and implementation reasoning.
- Use `mem0` when the task needs persistent memory, user preference storage,
  recall, or agent memory architecture.
- Use `awesome-claude-code` when looking for Claude Code workflows, commands,
  references, or examples.
- Use `codex` for Codex CLI, coding-agent workflow, repository automation, or
  OpenAI Codex-specific development tasks.
- Use `gstack` when the request maps to startup/company-building, product,
  growth, hiring, operations, or strategy workflows.
- Use `ECC` when the request explicitly mentions ECC or the installed ECC skill
  materials.
- Use `caveman` when the request explicitly asks for caveman-style simplicity,
  first-principles reduction, or the installed caveman workflow.
- Use `obsidian` only as a registry reference unless a concrete Obsidian repo or
  local vault workflow is also available.

## Selection Process

1. Restate the user goal in one sentence.
2. Identify the best primary skill by matching the goal to the routing rules.
3. Add secondary skills only when they materially change the workflow.
4. If no skill fits, proceed with normal agent behavior and say no installed
   NatSkill skill was needed.
5. If the request would update or delete files, explicitly highlight that before
   making changes.

## Output Style

When routing is useful, start with a short line:

```text
Using: <skill-id> because <reason>.
```

Then perform the work using that skill's workflow.

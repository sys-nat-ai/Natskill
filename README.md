# NatSkill Skills

Private Bun package that exposes a typed registry of agent skill sources.

The package exports the skill list, source URLs, pinned refs, aliases, and helper
filters for Codex/Claude-oriented skill tooling.

When this package is installed into another project, it also installs the
cloneable skill repositories into that project's `.natskill/skills` folder.
It also installs a packaged local `natskill-orchestrator` skill that helps an
agent choose which NatSkill skill should handle a user command.

## Install This Package

### From This Folder

Use this when the package folder is already on the same machine.

```sh
cd /path/to/Natskill
bun install
bun run build
bun run smoke
```

Then install it into another project from the local path:

```sh
cd /path/to/your-project
bun add /path/to/Natskill
```

The install step runs the package `postinstall` script and clones the skills
into:

```text
.natskill/skills/
```

> **Bun blocks postinstall scripts by default.** If you see
> `Blocked 1 postinstall`, the skills were not cloned yet. The recommended
> path is to run the installer yourself — it shows a confirmation prompt and
> live progress:
>
> ```sh
> bunx natskill-skills install
> ```
>
> Alternatively, allow the blocked script with `bun pm trust @natskill/skills`
> (this runs silently with no progress output).

On Windows, that may look like:

```powershell
cd "C:\path\to\your-project"
bun add "C:\Users\Nat Pisco\Desktop\Projects\Natskill"
```

### From A Private Git Repo

Use this when installing from another device.

```sh
git clone https://github.com/YOUR_USERNAME/Natskill.git
cd Natskill
bun install
bun run build
bun run smoke
```

Then install it into another project:

```sh
cd /path/to/your-project
bun add "git+https://github.com/YOUR_USERNAME/Natskill.git"
```

After install, the consuming project will contain:

```text
.natskill/
  skills/
    natskill-orchestrator/
    ecc/
    karpathy-skills/
    gstack/
    caveman/
    get-shit-done/
    understand-anything/
    spec-kit/
    mem0/
    awesome-claude-code/
    codex/
```

`obsidian` is included in the registry, but it is not auto-cloned because the
source is the `https://github.com/obsidianmd` organization instead of a single
repository.

If the repo is private, authenticate with GitHub first:

```sh
gh auth login
```

## Use The Registry

```ts
import {
  getSkill,
  resolvedSkills,
  skills,
  unresolvedSkills,
} from "@natskill/skills";

const specKit = getSkill("spec-kit");

console.log(skills.length);
console.log(resolvedSkills.map((skill) => skill.id));
console.log(unresolvedSkills.map((skill) => skill.name));
```

Look up aliases too:

```ts
const router = getSkill("orchestrator");
const gsd = getSkill("gsd");
const typoAlias = getSkill("Undestand-anyhting");

console.log(router?.sourceInfo.type);
console.log(gsd?.source);
console.log(typoAlias?.id);
```

## Orchestrator Skill

The local `natskill-orchestrator` skill is included inside this package and is
copied during install. It is meant to be read by Codex or Claude before choosing
which installed skill to use.

Typical routing examples:

- Planning, roadmap, phased execution: `get-shit-done`
- Formal specs and acceptance criteria: `spec-kit`
- Explanations and comprehension: `understand-anything`
- Agent memory: `mem0`
- Codex-specific work: `codex`
- Claude Code references: `awesome-claude-code`

After install, the skill instructions are available at:

```text
.natskill/skills/natskill-orchestrator/SKILL.md
```

## Scripts

```sh
bun install
bun run typecheck
bun run smoke
bun run build
```

## Install Skills Manually

If the automatic `postinstall` step was skipped (e.g. Bun blocked it), run:

```sh
bunx natskill-skills install
```

In an interactive terminal this asks for confirmation and then shows a live
spinner and a per-skill counter while each pinned repository is cloned:

```text
[natskill] About to install 11 skills by cloning their pinned repositories.
Proceed? (y/N) y
✓ [1/11] natskill-orchestrator (local)
/ [2/11] cloning ecc… 3s
✓ [2/11] ecc (4s)
· skipped obsidian (not installable)
```

Skip the prompt (CI or scripted use) with `--yes`:

```sh
bunx natskill-skills install --yes
```

Or from inside this package:

```sh
bun run install-skills
```

Install into a custom folder:

```sh
natskill-skills install --target-dir ./vendor/natskill-skills
```

Replace existing skill folders:

```sh
natskill-skills install --force
```

Preview without cloning:

```sh
natskill-skills install --dry-run
```

Skip the confirmation prompt:

```sh
natskill-skills install --yes
```

## Paste This Prompt Into Codex Or Claude

Use this prompt from inside the project where you want to install the package:

```text
Install the private NatSkill package into this project.

Package source:
- If this machine has the package locally, use: C:\Users\Nat Pisco\Desktop\Projects\Natskill
- Otherwise use the private Git repository URL I provide.

Requirements:
1. Detect whether this project uses Bun or npm. Prefer Bun if both are available.
2. Install @natskill/skills from the local path or Git URL.
3. Do not add @natskill/skills as a dependency of the Natskill package itself.
4. Do not commit or track node_modules.
5. If a .gitignore exists, ensure node_modules/ and .natskill/ are ignored. If it does not exist, create one with both entries.
6. Confirm the install created .natskill/skills in this project, including .natskill/skills/natskill-orchestrator/SKILL.md.
7. If .natskill/skills was not created, run:
   bunx natskill-skills install
8. Add a small import smoke test that imports:
   import { skills, getSkill, resolvedSkills, unresolvedSkills } from "@natskill/skills";
9. Run the install command and the smoke test.
10. Report the final install command used, the package manager used, the skill install folder, and the smoke test result.

Before any delete or update, explicitly highlight what will be deleted or updated.
```

## Notes

This package is intentionally private. The installer clones each installable
skill repository at its pinned commit ref. Existing skill folders are skipped
unless `--force` is used.

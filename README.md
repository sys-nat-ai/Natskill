# NatSkill Skills

Private Bun package that exposes a typed registry of agent skill sources.

The package exports the skill list, source URLs, pinned refs, aliases, and helper
filters for Codex/Claude-oriented skill tooling.

When this package is installed into another project, it also installs the
cloneable skill repositories into that project's `.natskill/skills` folder.

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
const gsd = getSkill("gsd");
const typoAlias = getSkill("Undestand-anyhting");

console.log(gsd?.source);
console.log(typoAlias?.id);
```

## Scripts

```sh
bun install
bun run typecheck
bun run smoke
bun run build
```

## Install Skills Manually

If the automatic `postinstall` step was skipped, run:

```sh
bunx natskill-skills install
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
6. Confirm the install created .natskill/skills in this project.
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

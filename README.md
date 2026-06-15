# NatSkill Skills

Private Bun package that exposes a typed registry of agent skill sources.

## Usage

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

## Scripts

```sh
bun install
bun run typecheck
bun run smoke
```

## Notes

This package is intentionally private. Ambiguous skill names are kept in the
registry as `unresolved` until a trusted source is selected.

import {
  getSkill,
  resolvedSkills,
  skills,
  unresolvedSkills,
} from "../src/index";

if (skills.length !== 12) {
  throw new Error(`expected 12 skills, received ${skills.length}`);
}

if (!getSkill("Undestand-anyhting")) {
  throw new Error("alias lookup failed");
}

if (resolvedSkills.length !== 12) {
  throw new Error(`expected 12 resolved skills, received ${resolvedSkills.length}`);
}

if (unresolvedSkills.length !== 0) {
  throw new Error(
    `expected 0 unresolved skills, received ${unresolvedSkills.length}`,
  );
}

console.log({
  total: skills.length,
  resolved: resolvedSkills.length,
  unresolved: unresolvedSkills.length,
});

import {
  getSkill,
  resolvedSkills,
  skills,
  unresolvedSkills,
} from "../src/index";

if (skills.length !== 11) {
  throw new Error(`expected 11 skills, received ${skills.length}`);
}

if (!getSkill("Undestand-anyhting")) {
  throw new Error("alias lookup failed");
}

if (resolvedSkills.length !== 11) {
  throw new Error(`expected 11 resolved skills, received ${resolvedSkills.length}`);
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

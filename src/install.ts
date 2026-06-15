import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { installableSkills, skills, type SkillEntry } from "./skills.js";

export type InstallEvent =
  | { type: "clone-start"; id: string; index: number; total: number }
  | { type: "clone-done"; id: string; index: number; total: number }
  | { type: "copy"; id: string; index: number; total: number }
  | { type: "skip"; id: string; reason: "exists" | "not-installable" }
  | { type: "register-start" }
  | { type: "registered"; name: string; from: string }
  | { type: "register-done"; count: number; dir: string };

export type InstallOptions = {
  targetDir?: string;
  force?: boolean;
  dryRun?: boolean;
  fromPostinstall?: boolean;
  /** Register discovered SKILL.md skills into the project's .claude/skills. Default true. */
  register?: boolean;
  onEvent?: (event: InstallEvent) => void;
};

export type InstallResult = {
  installed: string[];
  skipped: string[];
  targetDir: string;
  /** Skill names registered into .claude/skills for Claude Code. */
  registered: string[];
  /** Absolute path to the .claude/skills directory used, when registration ran. */
  claudeSkillsDir?: string;
};

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

export function installSkills(options: InstallOptions = {}): InstallResult {
  const targetDir = getTargetDir(options);

  if (options.fromPostinstall && isSelfInstallContext()) {
    console.log("[natskill] Skipping skill install inside the natskill package.");
    return {
      installed: [],
      skipped: skills.map((skill) => skill.id),
      targetDir,
      registered: [],
    };
  }

  assertGitAvailable();

  if (!options.dryRun) {
    mkdirSync(targetDir, { recursive: true });
  }

  const installed: string[] = [];
  const skipped: string[] = [];
  const emit = options.onEvent ?? (() => {});
  const total = installableSkills.length;

  let index = 0;
  for (const skill of installableSkills) {
    index += 1;
    const destination = join(targetDir, skill.id);

    if (existsSync(destination)) {
      if (!options.force) {
        emit({ type: "skip", id: skill.id, reason: "exists" });
        skipped.push(skill.id);
        continue;
      }

      if (!options.dryRun) {
        rmSync(destination, { recursive: true, force: true });
      }
    }

    if (!isCloneableGitSkill(skill)) {
      if (isInstallableLocalSkill(skill)) {
        emit({ type: "copy", id: skill.id, index, total });
        installLocalSkill(skill, destination, options.dryRun);
        installed.push(skill.id);
      } else {
        emit({ type: "skip", id: skill.id, reason: "not-installable" });
        skipped.push(skill.id);
      }
      continue;
    }

    if (options.dryRun) {
      installed.push(skill.id);
      continue;
    }

    emit({ type: "clone-start", id: skill.id, index, total });
    runGit(["clone", "--no-checkout", skill.sourceInfo.url, destination]);
    runGit(["-C", destination, "checkout", skill.sourceInfo.ref]);
    writeInstallMetadata(destination, skill);
    emit({ type: "clone-done", id: skill.id, index, total });
    installed.push(skill.id);
  }

  const nonInstallable = skills.filter((skill) => !skill.installable);
  for (const skill of nonInstallable) {
    skipped.push(skill.id);
  }

  let registered: string[] = [];
  let claudeSkillsDir: string | undefined;

  if (!options.dryRun && options.register !== false) {
    claudeSkillsDir = join(getProjectRoot(options), ".claude", "skills");
    registered = registerClaudeSkills(targetDir, claudeSkillsDir, emit);
  }

  return { installed, skipped, targetDir, registered, claudeSkillsDir };
}

function getProjectRoot(options: InstallOptions): string {
  if (options.fromPostinstall && process.env.INIT_CWD) {
    return resolve(process.env.INIT_CWD);
  }

  return process.cwd();
}

// Skill-root directories to try, in priority order, within a cloned repo.
const SKILL_ROOT_CANDIDATES = [
  ".claude/skills",
  "skills",
  ".codex/skills",
  ".agents/skills",
];

const SKILL_SCAN_MAX_DEPTH = 3;
const SKILL_SCAN_IGNORE = new Set([".git", "node_modules", ".github"]);

/**
 * Links every distinct SKILL.md-bearing folder from the installed repos into
 * `.claude/skills` so Claude Code discovers them. One canonical skill-root is
 * chosen per repo to avoid the mirror/translation copies many repos ship.
 */
function registerClaudeSkills(
  targetDir: string,
  claudeSkillsDir: string,
  emit: (event: InstallEvent) => void,
): string[] {
  emit({ type: "register-start" });
  mkdirSync(claudeSkillsDir, { recursive: true });

  const registered: string[] = [];
  const usedNames = new Set<string>();

  for (const skill of installableSkills) {
    const repoDir = join(targetDir, skill.id);
    if (!existsSync(repoDir)) {
      continue;
    }

    const root = findRepoSkillRoot(repoDir);
    if (!root) {
      continue;
    }

    for (const skillDir of findSkillDirs(root, SKILL_SCAN_MAX_DEPTH)) {
      let name = sanitizeName(readSkillName(skillDir) ?? basename(skillDir));
      if (!name) {
        continue;
      }
      if (usedNames.has(name)) {
        name = `${skill.id}-${name}`;
      }
      if (usedNames.has(name)) {
        continue;
      }

      const destination = join(claudeSkillsDir, name);
      if (existsSync(destination)) {
        // Never clobber a skill the user already has.
        usedNames.add(name);
        continue;
      }

      linkOrCopy(skillDir, destination);
      usedNames.add(name);
      registered.push(name);
      emit({ type: "registered", name, from: skill.id });
    }
  }

  emit({ type: "register-done", count: registered.length, dir: claudeSkillsDir });
  return registered;
}

function findRepoSkillRoot(repoDir: string): string | undefined {
  for (const candidate of SKILL_ROOT_CANDIDATES) {
    const candidatePath = join(repoDir, candidate);
    if (existsSync(candidatePath) && statSync(candidatePath).isDirectory()) {
      return candidatePath;
    }
  }

  // Skills may sit as top-level folders in the repo root (e.g. gstack).
  const hasTopLevelSkill = readdirSync(repoDir, { withFileTypes: true }).some(
    (entry) =>
      entry.isDirectory() &&
      !SKILL_SCAN_IGNORE.has(entry.name) &&
      existsSync(join(repoDir, entry.name, "SKILL.md")),
  );
  if (hasTopLevelSkill) {
    return repoDir;
  }

  // The repo itself may be a single skill.
  if (existsSync(join(repoDir, "SKILL.md"))) {
    return repoDir;
  }

  return undefined;
}

/** Collects directories that directly contain a SKILL.md, treating each as a leaf. */
function findSkillDirs(root: string, maxDepth: number): string[] {
  const found: string[] = [];

  const walk = (dir: string, depth: number): void => {
    const isSkill = existsSync(join(dir, "SKILL.md"));
    if (isSkill) {
      found.push(dir);
      // A nested skill folder is a leaf. The scan root may itself be a skill
      // while also containing sub-skills (e.g. gstack), so keep descending
      // only from depth 0.
      if (depth > 0) {
        return;
      }
    }
    if (depth >= maxDepth) {
      return;
    }
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || SKILL_SCAN_IGNORE.has(entry.name)) {
        continue;
      }
      walk(join(dir, entry.name), depth + 1);
    }
  };

  walk(root, 0);
  return found;
}

function readSkillName(skillDir: string): string | undefined {
  try {
    const content = readFileSync(join(skillDir, "SKILL.md"), "utf8");
    const match = content.match(/^\s*name:\s*(.+?)\s*$/m);
    return match?.[1]?.replace(/^["']|["']$/g, "");
  } catch {
    return undefined;
  }
}

function sanitizeName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function linkOrCopy(target: string, destination: string): void {
  const absoluteTarget = resolve(target);
  try {
    symlinkSync(
      absoluteTarget,
      destination,
      process.platform === "win32" ? "junction" : "dir",
    );
  } catch {
    cpSync(absoluteTarget, destination, { recursive: true });
  }
}

function getTargetDir(options: InstallOptions): string {
  if (options.targetDir) {
    return resolve(options.targetDir);
  }

  if (process.env.NATSKILL_SKILLS_DIR) {
    return resolve(process.env.NATSKILL_SKILLS_DIR);
  }

  if (options.fromPostinstall && process.env.INIT_CWD) {
    return resolve(process.env.INIT_CWD, ".natskill", "skills");
  }

  return resolve(".natskill", "skills");
}

function isSelfInstallContext(): boolean {
  if (process.env.INIT_CWD) {
    return resolve(process.env.INIT_CWD) === packageRoot;
  }

  return process.cwd() === packageRoot;
}

function assertGitAvailable(): void {
  const result = spawnSync("git", ["--version"], { stdio: "ignore" });
  if (result.status !== 0) {
    throw new Error("git is required to install NatSkill skills");
  }
}

function isCloneableGitSkill(skill: SkillEntry): skill is SkillEntry & {
  sourceInfo: { type: "git"; url: string; ref: string; verifiedOn: string };
} {
  return (
    skill.installable &&
    skill.sourceInfo.type === "git" &&
    typeof skill.sourceInfo.url === "string" &&
    typeof skill.sourceInfo.ref === "string"
  );
}

function isInstallableLocalSkill(skill: SkillEntry): skill is SkillEntry & {
  sourceInfo: { type: "local"; path: string; verifiedOn: string };
} {
  return (
    skill.installable &&
    skill.sourceInfo.type === "local" &&
    typeof skill.sourceInfo.path === "string"
  );
}

function installLocalSkill(
  skill: SkillEntry & {
    sourceInfo: { type: "local"; path: string; verifiedOn: string };
  },
  destination: string,
  dryRun = false,
): void {
  if (dryRun) {
    return;
  }

  const sourcePath = resolve(packageRoot, skill.sourceInfo.path);
  if (!existsSync(sourcePath)) {
    throw new Error(`local skill source does not exist: ${sourcePath}`);
  }

  cpSync(sourcePath, destination, { recursive: true });
  writeInstallMetadata(destination, skill);
}

function runGit(args: string[]): void {
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").trim();
    throw new Error(
      `git ${args.join(" ")} failed${detail ? `\n${detail}` : ""}`,
    );
  }
}

function writeInstallMetadata(destination: string, skill: SkillEntry): void {
  const metadataPath = join(destination, ".natskill.json");
  const metadata = {
    id: skill.id,
    name: skill.name,
    source: skill.sourceInfo.url ?? skill.sourceInfo.path,
    ref: skill.sourceInfo.ref,
    installedAt: new Date().toISOString(),
  };

  writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
}

export function readInstalledMetadata(skillDir: string): unknown {
  return JSON.parse(readFileSync(join(skillDir, ".natskill.json"), "utf8"));
}

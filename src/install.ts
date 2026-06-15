import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { installableSkills, skills, type SkillEntry } from "./skills.js";

export type InstallEvent =
  | { type: "clone-start"; id: string; index: number; total: number }
  | { type: "clone-done"; id: string; index: number; total: number }
  | { type: "copy"; id: string; index: number; total: number }
  | { type: "skip"; id: string; reason: "exists" | "not-installable" };

export type InstallOptions = {
  targetDir?: string;
  force?: boolean;
  dryRun?: boolean;
  fromPostinstall?: boolean;
  onEvent?: (event: InstallEvent) => void;
};

export type InstallResult = {
  installed: string[];
  skipped: string[];
  targetDir: string;
};

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

export function installSkills(options: InstallOptions = {}): InstallResult {
  const targetDir = getTargetDir(options);

  if (options.fromPostinstall && isSelfInstallContext()) {
    console.log("[natskill] Skipping skill install inside @natskill/skills.");
    return { installed: [], skipped: skills.map((skill) => skill.id), targetDir };
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

  return { installed, skipped, targetDir };
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

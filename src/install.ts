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

export type InstallOptions = {
  targetDir?: string;
  force?: boolean;
  dryRun?: boolean;
  fromPostinstall?: boolean;
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

  for (const skill of installableSkills) {
    const destination = join(targetDir, skill.id);

    if (existsSync(destination)) {
      if (!options.force) {
        skipped.push(skill.id);
        continue;
      }

      if (!options.dryRun) {
        rmSync(destination, { recursive: true, force: true });
      }
    }

    if (!isCloneableGitSkill(skill)) {
      if (isInstallableLocalSkill(skill)) {
        installLocalSkill(skill, destination, options.dryRun);
        installed.push(skill.id);
      } else {
        skipped.push(skill.id);
      }
      continue;
    }

    if (options.dryRun) {
      installed.push(skill.id);
      continue;
    }

    runGit(["clone", "--no-checkout", skill.sourceInfo.url, destination]);
    runGit(["-C", destination, "checkout", skill.sourceInfo.ref]);
    writeInstallMetadata(destination, skill);
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
  const result = spawnSync("git", args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed`);
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

#!/usr/bin/env node
import { installSkills } from "./install.js";

type ParsedArgs = {
  command: string;
  targetDir?: string;
  force: boolean;
  dryRun: boolean;
  fromPostinstall: boolean;
};

main();

function main(): void {
  const args = parseArgs(process.argv.slice(2));

  if (args.command === "help" || args.command === "--help" || args.command === "-h") {
    printHelp();
    return;
  }

  if (args.command !== "install") {
    console.error(`Unknown command: ${args.command}`);
    printHelp();
    process.exitCode = 1;
    return;
  }

  try {
    const result = installSkills({
      targetDir: args.targetDir,
      force: args.force,
      dryRun: args.dryRun,
      fromPostinstall: args.fromPostinstall,
    });

    const action = args.dryRun ? "Would install" : "Installed";
    console.log(
      `[natskill] ${action} ${result.installed.length} skills into ${result.targetDir}.`,
    );

    if (result.skipped.length > 0) {
      console.log(`[natskill] Skipped: ${result.skipped.join(", ")}`);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    command: argv[0] ?? "help",
    force: false,
    dryRun: false,
    fromPostinstall: false,
  };

  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--target-dir") {
      parsed.targetDir = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--force") {
      parsed.force = true;
      continue;
    }

    if (arg === "--dry-run") {
      parsed.dryRun = true;
      continue;
    }

    if (arg === "--from-postinstall") {
      parsed.fromPostinstall = true;
      continue;
    }
  }

  return parsed;
}

function printHelp(): void {
  console.log(`Usage:
  natskill-skills install [--target-dir .natskill/skills] [--force] [--dry-run]

Commands:
  install    Clone all installable NatSkill skill repositories.

Options:
  --target-dir <path>  Install skills into this directory.
  --force              Replace existing skill folders.
  --dry-run            Show what would be installed without cloning.
`);
}

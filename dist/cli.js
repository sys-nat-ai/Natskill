#!/usr/bin/env node
import { createInterface } from "node:readline";
import { installableSkills } from "./skills.js";
import { installSkills } from "./install.js";
main();
async function main() {
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
        const interactive = isInteractive(args);
        if (interactive) {
            console.log(`[natskill] About to install ${installableSkills.length} skills by cloning their pinned repositories.`);
            const confirmed = await confirm("Proceed? (y/N) ");
            if (!confirmed) {
                console.log("[natskill] Aborted.");
                return;
            }
        }
        const onEvent = interactive || isTty() ? makeProgressReporter() : undefined;
        const result = installSkills({
            targetDir: args.targetDir,
            force: args.force,
            dryRun: args.dryRun,
            fromPostinstall: args.fromPostinstall,
            onEvent,
        });
        const action = args.dryRun ? "Would install" : "Installed";
        console.log(`[natskill] ${action} ${result.installed.length} skills into ${result.targetDir}.`);
        if (result.skipped.length > 0) {
            console.log(`[natskill] Skipped: ${result.skipped.join(", ")}`);
        }
    }
    catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}
function isTty() {
    return Boolean(process.stdout.isTTY);
}
function isInteractive(args) {
    return (!args.yes &&
        !args.dryRun &&
        !args.fromPostinstall &&
        Boolean(process.stdin.isTTY) &&
        isTty());
}
function confirm(question) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(/^y(es)?$/i.test(answer.trim()));
        });
    });
}
function makeProgressReporter() {
    const frames = ["-", "\\", "|", "/"];
    let timer;
    let frame = 0;
    let startedAt = 0;
    let current = "";
    const clearLine = () => {
        if (isTty()) {
            process.stdout.write("\r[2K");
        }
    };
    const stopSpinner = () => {
        if (timer) {
            clearInterval(timer);
            timer = undefined;
        }
    };
    return (event) => {
        if (event.type === "clone-start") {
            current = event.id;
            startedAt = Date.now();
            frame = 0;
            const render = () => {
                const secs = Math.round((Date.now() - startedAt) / 1000);
                clearLine();
                process.stdout.write(`${frames[frame++ % frames.length]} [${event.index}/${event.total}] cloning ${current}… ${secs}s`);
            };
            if (isTty()) {
                render();
                timer = setInterval(render, 120);
            }
            else {
                process.stdout.write(`[${event.index}/${event.total}] cloning ${current}…\n`);
            }
            return;
        }
        if (event.type === "clone-done") {
            stopSpinner();
            clearLine();
            const secs = Math.round((Date.now() - startedAt) / 1000);
            console.log(`✓ [${event.index}/${event.total}] ${event.id} (${secs}s)`);
            return;
        }
        if (event.type === "copy") {
            clearLine();
            console.log(`✓ [${event.index}/${event.total}] ${event.id} (local)`);
            return;
        }
        if (event.type === "skip") {
            clearLine();
            const why = event.reason === "exists" ? "already installed" : "not installable";
            console.log(`· skipped ${event.id} (${why})`);
        }
    };
}
function parseArgs(argv) {
    const first = argv[0];
    const firstIsCommand = first !== undefined && !first.startsWith("-");
    // No subcommand (e.g. `bunx github:owner/repo`) bootstraps an install.
    // A leading flag (e.g. `--dry-run`) also implies the install command.
    const command = firstIsCommand ? first : "install";
    const flagStart = firstIsCommand ? 1 : 0;
    const parsed = {
        command,
        force: false,
        dryRun: false,
        fromPostinstall: false,
        yes: false,
    };
    for (let index = flagStart; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === "--help" || arg === "-h") {
            parsed.command = "help";
            continue;
        }
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
        if (arg === "--yes" || arg === "-y") {
            parsed.yes = true;
            continue;
        }
    }
    return parsed;
}
function printHelp() {
    console.log(`Usage:
  natskill [install] [--target-dir .natskill/skills] [--force] [--dry-run] [--yes]

Running with no command (e.g. \`bunx natskill\`) bootstraps an install.

Commands:
  install    Clone all installable NatSkill skill repositories (default).

Options:
  --target-dir <path>  Install skills into this directory.
  --force              Replace existing skill folders.
  --dry-run            Show what would be installed without cloning.
  --yes, -y            Skip the confirmation prompt (assume yes).

In an interactive terminal, install asks for confirmation and shows live
progress while each repository is cloned. Use --yes to skip the prompt
(e.g. in CI). The postinstall hook always runs non-interactively.
`);
}
//# sourceMappingURL=cli.js.map
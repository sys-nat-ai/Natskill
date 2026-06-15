export type InstallEvent = {
    type: "clone-start";
    id: string;
    index: number;
    total: number;
} | {
    type: "clone-done";
    id: string;
    index: number;
    total: number;
} | {
    type: "copy";
    id: string;
    index: number;
    total: number;
} | {
    type: "skip";
    id: string;
    reason: "exists" | "not-installable";
} | {
    type: "register-start";
} | {
    type: "registered";
    name: string;
    from: string;
} | {
    type: "register-done";
    count: number;
    dir: string;
};
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
export declare function installSkills(options?: InstallOptions): InstallResult;
export declare function readInstalledMetadata(skillDir: string): unknown;
//# sourceMappingURL=install.d.ts.map
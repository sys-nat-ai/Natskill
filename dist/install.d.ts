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
};
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
export declare function installSkills(options?: InstallOptions): InstallResult;
export declare function readInstalledMetadata(skillDir: string): unknown;
//# sourceMappingURL=install.d.ts.map
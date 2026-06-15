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
export declare function installSkills(options?: InstallOptions): InstallResult;
export declare function readInstalledMetadata(skillDir: string): unknown;
//# sourceMappingURL=install.d.ts.map
export type SkillStatus = "resolved" | "unresolved" | "disabled";
export type SkillSource = {
    type: "git" | "local" | "unresolved";
    url?: string;
    path?: string;
    ref?: string;
    verifiedOn: string;
};
export type SkillEntry = {
    id: string;
    name: string;
    aliases: string[];
    source?: string;
    sourceInfo: SkillSource;
    status: SkillStatus;
    installable: boolean;
    notes?: string;
};
export declare const skills: readonly SkillEntry[];
export declare const skillIds: string[];
export declare const resolvedSkills: SkillEntry[];
export declare const unresolvedSkills: SkillEntry[];
export declare const installableSkills: SkillEntry[];
export declare function getSkill(idOrAlias: string): SkillEntry | undefined;
//# sourceMappingURL=skills.d.ts.map
const verifiedOn = "2026-06-15";
export const skills = [
    {
        id: "natskill-orchestrator",
        name: "NatSkill Orchestrator",
        aliases: [
            "natskill-orchestrator",
            "orchestrator",
            "skill-router",
            "skill selector",
        ],
        source: "skills/natskill-orchestrator",
        sourceInfo: {
            type: "local",
            path: "skills/natskill-orchestrator",
            verifiedOn,
        },
        status: "resolved",
        installable: true,
        notes: "Local packaged skill that helps agents choose which installed NatSkill skill to use for each command.",
    },
    {
        id: "ecc",
        name: "ECC",
        aliases: ["ECC", "ecc"],
        source: "https://github.com/affaan-m/ECC.git",
        sourceInfo: {
            type: "git",
            url: "https://github.com/affaan-m/ECC.git",
            ref: "5b173d2e6c11b976a0f13b2f59125e08956c1d47",
            verifiedOn,
        },
        status: "resolved",
        installable: true,
        notes: "User-provided ECC repository pinned to HEAD on verification date.",
    },
    {
        id: "karpathy-skills",
        name: "karpathy-skills",
        aliases: ["karpathy-skills", "karpathy", "Karpathy skills"],
        source: "https://github.com/multica-ai/andrej-karpathy-skills.git",
        sourceInfo: {
            type: "git",
            url: "https://github.com/multica-ai/andrej-karpathy-skills.git",
            ref: "2c606141936f1eeef17fa3043a72095b4765b9c2",
            verifiedOn,
        },
        status: "resolved",
        installable: true,
        notes: "User-provided Andrej Karpathy skills repository pinned to HEAD on verification date.",
    },
    {
        id: "gstack",
        name: "gstack",
        aliases: ["gstack", "GStack"],
        source: "https://github.com/garrytan/gstack.git",
        sourceInfo: {
            type: "git",
            url: "https://github.com/garrytan/gstack.git",
            ref: "c7ae63201ab193a7dc7fb7e0d81238645111ffac",
            verifiedOn,
        },
        status: "resolved",
        installable: true,
        notes: "User-provided gstack repository pinned to HEAD on verification date.",
    },
    {
        id: "caveman",
        name: "caveman",
        aliases: ["caveman", "Caveman"],
        source: "https://github.com/JuliusBrussee/caveman.git",
        sourceInfo: {
            type: "git",
            url: "https://github.com/JuliusBrussee/caveman.git",
            ref: "25d22f864ad68cc447a4cb93aefde918aa4aec9f",
            verifiedOn,
        },
        status: "resolved",
        installable: true,
        notes: "User-provided caveman repository pinned to HEAD on verification date.",
    },
    {
        id: "get-shit-done",
        name: "get-shit-done",
        aliases: ["get-shit-done", "gsd", "GSD"],
        source: "https://github.com/gsd-build/get-shit-done.git",
        sourceInfo: {
            type: "git",
            url: "https://github.com/gsd-build/get-shit-done.git",
            ref: "bdcaab2c752d9a33a1a1ca9acf3a3c81fb991815",
            verifiedOn,
        },
        status: "resolved",
        installable: true,
        notes: "User-provided get-shit-done repository pinned to HEAD on verification date.",
    },
    {
        id: "understand-anything",
        name: "Understand-anything",
        aliases: [
            "Undestand-anyhting",
            "Understand-anything",
            "understand-anything",
        ],
        source: "https://github.com/Egonex-AI/Understand-Anything.git",
        sourceInfo: {
            type: "git",
            url: "https://github.com/Egonex-AI/Understand-Anything.git",
            ref: "09ede1917ffd043e6d5bbc8a80b45760814c2d7f",
            verifiedOn,
        },
        status: "resolved",
        installable: true,
        notes: "User-provided repository pinned to HEAD; original requested spelling is preserved as an alias.",
    },
    {
        id: "spec-kit",
        name: "spec-kit",
        aliases: ["spec-kit", "speckit", "Spec Kit"],
        source: "https://github.com/github/spec-kit",
        sourceInfo: {
            type: "git",
            url: "https://github.com/github/spec-kit",
            ref: "1b0556c711b633a6d50b2e2f5f8db0e6717489d3",
            verifiedOn,
        },
        status: "resolved",
        installable: true,
        notes: "Official GitHub Spec Kit repository for spec-driven development workflows.",
    },
    {
        id: "mem0",
        name: "mem0",
        aliases: ["mem0", "Mem0"],
        source: "https://github.com/mem0ai/mem0",
        sourceInfo: {
            type: "git",
            url: "https://github.com/mem0ai/mem0",
            ref: "9315e3036f24e633944daf63ca59f430d0092e71",
            verifiedOn,
        },
        status: "resolved",
        installable: true,
        notes: "Official mem0 repository for AI agent memory.",
    },
    {
        id: "awesome-claude-code",
        name: "awesome-claude-code",
        aliases: [
            "awaesome-claude-code",
            "awesome-claude-code",
            "Awesome Claude Code",
        ],
        source: "https://github.com/hesreallyhim/awesome-claude-code",
        sourceInfo: {
            type: "git",
            url: "https://github.com/hesreallyhim/awesome-claude-code",
            ref: "614f102accbcd48206d63a21df64adc984026b40",
            verifiedOn,
        },
        status: "resolved",
        installable: true,
        notes: "Curated Claude Code list; the original requested misspelling is preserved as an alias.",
    },
    {
        id: "codex",
        name: "codex",
        aliases: ["codex", "OpenAI Codex"],
        source: "https://github.com/openai/codex",
        sourceInfo: {
            type: "git",
            url: "https://github.com/openai/codex",
            ref: "dfd03ea01bbec2613013b477fb82abc67534a7d7",
            verifiedOn,
        },
        status: "resolved",
        installable: true,
        notes: "Official OpenAI Codex CLI repository.",
    },
    {
        id: "obsidian",
        name: "obsidian",
        aliases: ["obsidian", "Obsidian"],
        source: "https://github.com/obsidianmd",
        sourceInfo: {
            type: "git",
            url: "https://github.com/obsidianmd",
            verifiedOn,
        },
        status: "resolved",
        installable: false,
        notes: "User provided the official Obsidian GitHub organization rather than a single repository, so no commit ref is pinned.",
    },
];
export const skillIds = skills.map((skill) => skill.id);
export const resolvedSkills = skills.filter((skill) => skill.status === "resolved");
export const unresolvedSkills = skills.filter((skill) => skill.status === "unresolved");
export const installableSkills = skills.filter((skill) => skill.installable);
export function getSkill(idOrAlias) {
    const normalized = normalizeSkillKey(idOrAlias);
    return skills.find((skill) => {
        if (normalizeSkillKey(skill.id) === normalized) {
            return true;
        }
        return skill.aliases.some((alias) => normalizeSkillKey(alias) === normalized);
    });
}
function normalizeSkillKey(value) {
    return value.trim().toLowerCase();
}
//# sourceMappingURL=skills.js.map
import type { AnthropicTool } from './types.js';
import type { OpenAITool } from './openai-types.js';

const ALIAS_GROUPS: string[][] = [
    ['edit', 'hashline', 'hashline_edit', 'hashline-edit', 'hashlineedit'],
    ['await', 'job'],
    ['cancel_job', 'canceljob', 'cancel-job'],
];

function canonicalize(name: string): string {
    return (name || '').trim().toLowerCase();
}

function inSameAliasGroup(a: string, b: string): boolean {
    const ca = canonicalize(a);
    const cb = canonicalize(b);
    if (ca === cb) return true;
    return ALIAS_GROUPS.some((group) => group.includes(ca) && group.includes(cb));
}

export function alignToolNameToAvailable(name: string, availableNames: string[]): string {
    if (!availableNames || availableNames.length === 0) return name;

    const exact = availableNames.find((item) => item === name);
    if (exact) return exact;

    const lowered = canonicalize(name);
    const caseInsensitive = availableNames.find((item) => canonicalize(item) === lowered);
    if (caseInsensitive) return caseInsensitive;

    const aliasMatch = availableNames.find((item) => inSameAliasGroup(name, item));
    if (aliasMatch) return aliasMatch;

    return name;
}

export function anthropicToolNames(tools?: AnthropicTool[]): string[] {
    if (!Array.isArray(tools)) return [];
    return tools.map((t) => t.name).filter((name): name is string => typeof name === 'string' && name.length > 0);
}

export function openAIToolNames(tools?: Array<OpenAITool | Record<string, unknown>>): string[] {
    if (!Array.isArray(tools)) return [];

    return tools
        .map((tool) => {
            if (tool && typeof tool === 'object' && 'function' in tool && tool.function && typeof (tool.function as { name?: unknown }).name === 'string') {
                return ((tool.function as { name: string }).name || '').trim();
            }
            if (tool && typeof tool === 'object' && typeof (tool as { name?: unknown }).name === 'string') {
                return ((tool as { name: string }).name || '').trim();
            }
            return '';
        })
        .filter((name): name is string => name.length > 0);
}

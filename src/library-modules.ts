/** Canonical source modules shared by checking, release assembly and the wiki. */
export const coreLibraryModules = ['io', 'collections', 'math', 'errors', 'values'] as const;
export const standardLibraryModules = [...coreLibraryModules, 'json', 'memory', 'time', 'web', 'crypto'] as const;

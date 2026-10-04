export type NativeRequirements = { web: boolean; crypto: boolean; tasks: boolean; json: boolean; html: boolean; time: boolean };
export function nativeRequirements(generated: string): NativeRequirements;
export function dependencyArtifacts(name: string): string[];
export function dependencyReady(directory: string, dependency: { name: string; sha256: string }): boolean;
export function prepareNativeDependencies(generated: string, options?: { offline?: boolean; progress?: (message: string) => void }): Promise<void>;

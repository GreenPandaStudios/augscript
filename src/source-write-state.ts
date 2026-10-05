/** Only the mechanical writer may read its journaled postimage during verification. */
export const pendingSourceReads=new Set<string>();

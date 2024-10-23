import { TFile } from 'obsidian';

declare module 'obsidian' {
    interface MetadataCache {
        getBacklinksForFile: (file: TFile) => {
            data: Map<string, LinkCache[]>;
        };
    }
    interface Vault {
        getConfig(key: string): unknown;
    }
}

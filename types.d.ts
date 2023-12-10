import { TFile } from 'obsidian';

declare module 'obsidian' {
    interface MetadataCache {
        getBacklinksForFile: (file: TFile) => {
            data: Record<string, LinkCache[]>;
        };
    }
}

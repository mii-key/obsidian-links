import { App } from "obsidian";
import { LinkData } from "utils";

export interface ILinkTextSuggestContext {
    app: App;
    linkData?: LinkData;
    titles: string[],
    titleSeparator: string
    provideSuggestions: boolean;

    setLinkData(linkData: LinkData, titles: string[]): void;
    clearLinkData(): void;
}
import { WikilinkDestinationReplacement } from "utils";

export interface IObsidianLinksSettings {
	linkReplacements: { source: string, target: string }[];
	titleSeparator: string;
	showPerformanceNotification: boolean;
	removeLinksFromHeadingsInternalWikilinkWithoutTextReplacement: WikilinkDestinationReplacement;

	// feature flags
	ffReplaceLink: boolean;
	ffMultipleLinkConversion: boolean;
	ffRemoveLinksFromHeadingsInternalWikilinkWithoutTextReplacementOptions: boolean;

	//context menu
	contexMenu: {
		editLinkText: boolean;
		setLinkText: boolean;
		editLinkDestination: boolean;
		copyLinkDestination: boolean;
		unlink: boolean;
		convertToWikilink: boolean;
		convertToAutolink: boolean;
		convertToMakrdownLink: boolean;
		replaceLink: boolean;
		embedUnembedLink: boolean;
		deleteLink: boolean;
		createLink: boolean;
		createLinkFromClipboard: boolean;
	}
}

export const DEFAULT_SETTINGS: IObsidianLinksSettings = {
	linkReplacements: [],
	titleSeparator: " • ",
	showPerformanceNotification: false,
	removeLinksFromHeadingsInternalWikilinkWithoutTextReplacement: WikilinkDestinationReplacement.Destination,

	//feature flags
	ffReplaceLink: false,
	ffMultipleLinkConversion: false,
	ffRemoveLinksFromHeadingsInternalWikilinkWithoutTextReplacementOptions: false,

	//context menu
	contexMenu: {
		editLinkText: true,
		setLinkText: true,
		editLinkDestination: true,
		copyLinkDestination: true,
		unlink: true,
		convertToWikilink: true,
		convertToAutolink: true,
		convertToMakrdownLink: true,
		replaceLink: true,
		embedUnembedLink: true,
		deleteLink: true,
		createLink: true,
		createLinkFromClipboard: true
	}
}
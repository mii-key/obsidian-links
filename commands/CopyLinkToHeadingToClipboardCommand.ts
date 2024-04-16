import { Editor } from "obsidian";
import { CommandBase, Func } from "./ICommand"
import { IObsidianProxy } from "./IObsidianProxy";
import { RegExPatterns } from "../RegExPatterns";
import { destinationRequireAngleBrackets } from "../utils";

export class CopyLinkToHeadingToClipboardCommand extends CommandBase {


	obsidianProxy: IObsidianProxy;

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled)
		this.id = 'editor-copy-link-to-heading-to-clipboard';
		this.displayNameCommand = 'Copy link to heading';
		this.displayNameContextMenu = 'Copy link to heading';
		this.icon = 'copy';
		this.obsidianProxy = obsidianProxy;

		this.isEnabled = () => this.obsidianProxy.settings.ffCopyLinkToHeading;
		this.isPresentInContextMenu = () => this.obsidianProxy.settings.ffCopyLinkToHeading && this.obsidianProxy.settings.contexMenu.copyLinkToHeadingToClipboard;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}
		const text = editor.getLine(editor.getCursor('from').line);
		const result = text.match(new RegExp(RegExPatterns.NoteHeading.source));

		if (checking) {
			return !!result;
		}
		const currentView = this.obsidianProxy.Vault.getActiveNoteView();
		const currentNotePath = currentView?.file?.path;

		if (result && result[1] && currentNotePath) {
			console.log(currentNotePath);
			this.copyLinkToHeadingUnderCursorToClipboard(result[1], currentNotePath);
		}
	}

	copyLinkToHeadingUnderCursorToClipboard(heading: string, notePath: string) {
		let destination = `${notePath}#${heading}`;
		if (destinationRequireAngleBrackets(destination)) {
			destination = `<${destination}>`;
		}
		const rawLink = `[${heading}](${destination})`;
		// navigator.clipboard.writeText(linkData.link?.content);
		this.obsidianProxy.clipboardWriteText(rawLink);
		this.obsidianProxy.createNotice("Link copied to your clipboard");
	}
}
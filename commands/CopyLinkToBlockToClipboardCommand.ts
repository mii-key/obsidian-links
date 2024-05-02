import { Editor } from "obsidian";
import { CommandBase, Func } from "./ICommand"
import { IObsidianProxy } from "./IObsidianProxy";

export class CopyLinkToBlockToClipboardCommand extends CommandBase {


	obsidianProxy: IObsidianProxy;

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled)
		this.id = 'editor-copy-link-to-block-to-clipboard';
		this.displayNameCommand = 'Copy link to block';
		this.displayNameContextMenu = 'Copy link to block';
		this.icon = 'copy';
		this.obsidianProxy = obsidianProxy;

		this.isEnabled = () => this.obsidianProxy.settings.ffCopyLinkToBlock;
		this.isPresentInContextMenu = () => this.obsidianProxy.settings.ffCopyLinkToBlock && this.obsidianProxy.settings.contexMenu.copyLinkToBlockToClipboard;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}

		if (checking) {
			return true;
		}


	}

}
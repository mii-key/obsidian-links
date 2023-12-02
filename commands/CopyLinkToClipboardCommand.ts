import { Editor } from "obsidian";
import { CommandBase, Func, ICommand  } from "./ICommand"
import { LinkData, LinkTypes, findLink } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";

export class CopyLinkToClipboardCommand extends CommandBase {


	obsidianProxy: IObsidianProxy;

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true){
		super(isPresentInContextMenu, isEnabled)
		this.id = 'editor-copy-link-to-clipboard';
		this.displayNameCommand = 'Copy link';
		this.displayNameContextMenu = 'Copy link';
		this.icon = 'copy';
		this.obsidianProxy = obsidianProxy;

		this.isEnabled = () => this.obsidianProxy.settings.ffCopyLinkToClipboard;
		this.isPresentInContextMenu = () => this.obsidianProxy.settings.contexMenu.copyLinkToClipboard;

	}

    handler(editor: Editor, checking: boolean) : boolean | void {
		if(checking && !this.isEnabled()){
			return false;
		}
        const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Wiki | LinkTypes.Markdown | LinkTypes.Html | LinkTypes.Autolink);
		if (checking) {
			return !!linkData;
		}
		if (linkData) {
			this.copyLinkUnderCursorToClipboard(linkData);
		}
    }

    copyLinkUnderCursorToClipboard(linkData: LinkData) {
		if (linkData?.link) {
			// navigator.clipboard.writeText(linkData.link?.content);
			this.obsidianProxy.clipboardWriteText(linkData.content);
			this.obsidianProxy.createNotice("Link copied to your clipboard");
		}
	}
}
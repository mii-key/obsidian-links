import { Editor } from "obsidian";
import { CommandBase, Func, ICommand  } from "./ICommand"
import { LinkData, LinkTypes, findLink } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";

export class CopyLinkDestinationToClipboardCommand extends CommandBase {


	obdisianProxy: IObsidianProxy;

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true){
		super(isPresentInContextMenu, isEnabled)
		this.id = 'editor-copy-link-destination-to-clipboard';
		this.displayNameCommand = 'Copy link destination';
		this.displayNameContextMenu = 'Copy link destination';
		this.icon = 'copy';
		this.obdisianProxy = obsidianProxy;
	}

    handler(editor: Editor, checking: boolean) : boolean | void {
		if(checking && !this.isEnabled()){
			return false;
		}
        const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Wiki | LinkTypes.Markdown | LinkTypes.Html | LinkTypes.Autolink);
		if (checking) {
			return !!linkData && !!linkData.link;
		}
		if (linkData) {
			this.copyLinkUnderCursorToClipboard(linkData);
		}
    }

    copyLinkUnderCursorToClipboard(linkData: LinkData) {
		if (linkData?.link) {
			// navigator.clipboard.writeText(linkData.link?.content);
			this.obdisianProxy.clipboardWriteText(linkData.link?.content);
			this.obdisianProxy.createNotice("Link destination copied to your clipboard");
		}
	}
}
import { Editor } from "obsidian";
import { ICommand  } from "./ICommand"
import { LinkData, LinkTypes, findLink } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";

export class CopyLinkDestinationToClipboardCommand implements ICommand {
    id: string = 'editor-copy-link-destination-to-clipboard';
    displayNameCommand: string = 'Copy link destination';
    displayNameContextMenu: string = 'Copy link destination';
    icon: string = 'copy';

	obdisianProxy: IObsidianProxy;

	constructor(obsidianProxy: IObsidianProxy){
		this.obdisianProxy = obsidianProxy;
	}

    handler(editor: Editor, checking: boolean) : boolean | void {
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
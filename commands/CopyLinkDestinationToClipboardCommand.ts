import { Editor } from "obsidian";
import { CommandBase, Func, ICommand } from "./ICommand"
import { LinkData, LinkTypes, findLink, findLinks } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";

export class CopyLinkDestinationToClipboardCommand extends CommandBase {


	obdisianProxy: IObsidianProxy;

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled)
		this.id = 'editor-copy-link-destination-to-clipboard';
		this.displayNameCommand = 'Copy link destination';
		this.displayNameContextMenu = 'Copy link destination';
		this.icon = 'copy';
		this.obdisianProxy = obsidianProxy;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const links = findLinks(text, LinkTypes.Wiki | LinkTypes.Markdown | LinkTypes.Html | LinkTypes.Autolink, cursorOffset, cursorOffset);
		if (checking) {
			return !!links?.length && !!links[0]?.destination;
		}
		if (links?.length) {
			this.copyLinkUnderCursorToClipboard(links[0]);
		}
	}

	copyLinkUnderCursorToClipboard(linkData: LinkData) {
		if (linkData?.destination) {
			// navigator.clipboard.writeText(linkData.link?.content);
			this.obdisianProxy.clipboardWriteText(linkData.destination?.content);
			this.obdisianProxy.createNotice("Link destination copied to your clipboard");
		}
	}
}
import { Editor } from "obsidian";
import { CommandBase, Func, ICommand } from "./ICommand"
import { LinkData, LinkTypes, findLink, findLinks } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";

export class CutLinkToClipboardCommand extends CommandBase {


	obsidianProxy: IObsidianProxy;

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled)
		this.id = 'editor-cut-link-to-clipboard';
		this.displayNameCommand = 'Cut link';
		this.displayNameContextMenu = 'Cut link';
		this.icon = 'scissors';
		this.obsidianProxy = obsidianProxy;

		this.isPresentInContextMenu = () => this.obsidianProxy.settings.contexMenu.copyLinkToClipboard;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLinks(text, LinkTypes.All, cursorOffset, cursorOffset)
		if (checking) {
			return linkData.length != 0
		}
		if (linkData) {
			this.cutLinkUnderCursorToClipboard(linkData[0], editor);
		}
	}

	cutLinkUnderCursorToClipboard(linkData: LinkData, editor: Editor) {
		if (linkData?.destination) {
			// navigator.clipboard.writeText(linkData.link?.content);
			this.obsidianProxy.clipboardWriteText(linkData.content);
			editor.replaceRange('',
				editor.offsetToPos(linkData.position.start), editor.offsetToPos(linkData.position.end))
			this.obsidianProxy.createNotice("Link cut to your clipboard");
		}
	}
}
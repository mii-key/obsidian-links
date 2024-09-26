import { Editor } from "obsidian";
import { CommandBase, Func } from "./ICommand"
import { LinkData, LinkTypes, findLinks } from "../utils";

export class UnembedLinkCommand extends CommandBase {

	constructor(isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled);
		this.id = 'editor-unembed-link';
		this.displayNameCommand = 'Unembed link';
		this.displayNameContextMenu = 'Unembed';
		this.icon = 'file-output';
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}

		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const links = findLinks(text, LinkTypes.Wiki | LinkTypes.Markdown, cursorOffset, cursorOffset);
		if (checking) {
			return links?.length === 1 && links[0].embedded && !!links[0].destination;
		}

		if (links) {
			this.unembedLinkUnderCursor(links[0], editor);
		}
	}

	unembedLinkUnderCursor(linkData: LinkData, editor: Editor) {
		if (linkData.content && (linkData.type & (LinkTypes.Wiki | LinkTypes.Markdown)) && linkData.embedded) {
			editor.replaceRange(
				linkData.content.substring(1),
				editor.offsetToPos(linkData.position.start),
				editor.offsetToPos(linkData.position.end));
		}
	}
}
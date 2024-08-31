import { Editor } from "obsidian";
import { CommandBase, Func, ICommand } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLinks, removeLinks } from "../utils";

export class UnlinkLinkCommand extends CommandBase {

	constructor(isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled);
		this.id = 'editor-unlink-link';
		this.displayNameCommand = 'Unlink';
		this.displayNameContextMenu = 'Unlink';
		this.icon = 'unlink';
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}

		const selection = editor.getSelection();
		if (selection) {
			if (checking) {
				return HasLinks(selection);
			}
			this.removeLinksFromSelection(editor, selection);

		} else {
			const text = editor.getValue();
			const cursorOffset = editor.posToOffset(editor.getCursor('from'));
			const links = findLinks(text, LinkTypes.Wiki | LinkTypes.Html | LinkTypes.Markdown, cursorOffset, cursorOffset)
			if (checking) {
				return links.length > 0;
			}
			if (links) {
				this.unlinkLink(links[0], editor);
			}
		}
	}

	removeLinksFromSelection(editor: Editor, selection: string) {
		const unlinkedText = removeLinks(selection);
		editor.replaceSelection(unlinkedText);
	}

	unlinkLink(linkData: LinkData, editor: Editor) {
		let text = linkData.text ? linkData.text.content : "";
		if (linkData.type === LinkTypes.Wiki && !text) {
			text = linkData.destination ? linkData.destination.content : "";
		}
		editor.replaceRange(
			text,
			editor.offsetToPos(linkData.position.start),
			editor.offsetToPos(linkData.position.end));
	}
}
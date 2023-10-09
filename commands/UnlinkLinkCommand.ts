import { Editor } from "obsidian";
import { ICommand  } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, removeLinks } from "../utils";

export class UnlinkLinkCommand implements ICommand {
    id: string = 'editor-unlink-link';
    displayName: string = 'Unlink';
    icon: string = 'unlink';

    handler(editor: Editor, checking: boolean) : boolean | void {
        const selection = editor.getSelection();
		if (selection) {
			if (checking) {
				return HasLinks(selection);
			}
			this.removeLinksFromSelection(editor, selection);

		} else {
			const text = editor.getValue();
			const cursorOffset = editor.posToOffset(editor.getCursor('from'));
			const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Wiki | LinkTypes.Html | LinkTypes.Markdown)
			if (checking) {
				return !!linkData;
			}
			if (linkData) {
				this.unlinkLink(linkData, editor);
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
			text = linkData.link ? linkData.link.content : "";
		}
		editor.replaceRange(
			text,
			editor.offsetToPos(linkData.position.start),
			editor.offsetToPos(linkData.position.end));
	}
}
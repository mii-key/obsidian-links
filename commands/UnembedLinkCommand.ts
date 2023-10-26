import { Editor } from "obsidian";
import { ICommand  } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, removeLinks } from "../utils";

export class UnembedLinkCommand implements ICommand {
    id: string = 'editor-unembed-link';
    displayNameCommand: string = 'Unembed link';
    displayNameContextMenu: string = 'Unembed';
    icon: string = 'file-output';

    handler(editor: Editor, checking: boolean) : boolean | void {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Wiki | LinkTypes.Markdown);
		if (checking) {
			return !!linkData && linkData.embedded && !!linkData.link;
		}

		if (linkData) {
			this.unembedLinkUnderCursor(linkData, editor);
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
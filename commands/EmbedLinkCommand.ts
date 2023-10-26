import { Editor } from "obsidian";
import { ICommand  } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, removeLinks } from "../utils";

export class EmbedLinkCommand implements ICommand {
    id: string = 'editor-embed-link';
    displayNameCommand: string = 'Embed link';
    displayNameContextMenu: string = 'Embed';
    icon: string = 'file-input';

    handler(editor: Editor, checking: boolean) : boolean | void {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Wiki | LinkTypes.Markdown);
		if (checking) {
			return !!linkData && !linkData.embedded && !!linkData.link;
		}

		if (linkData) {
			this.embedLinkUnderCursor(linkData, editor);
		}
    }

    embedLinkUnderCursor(linkData: LinkData, editor: Editor) {
		if (linkData.content && (linkData.type & (LinkTypes.Wiki | LinkTypes.Markdown)) && !linkData.embedded) {
			editor.replaceRange(
				'!' + linkData.content,
				editor.offsetToPos(linkData.position.start),
				editor.offsetToPos(linkData.position.end));
		}
	}
}
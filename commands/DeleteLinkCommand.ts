import { Editor } from "obsidian";
import { ICommand  } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, removeLinks } from "../utils";

export class DeleteLinkCommand implements ICommand {
    id: string = 'editor-delete-link';
    displayNameCommand: string = 'Delete link';
    displayNameContextMenu: string = 'Delete';
    icon: string = 'trash-2';

    handler(editor: Editor, checking: boolean) : boolean | void {
        const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset);
		if (checking) {
			return !!linkData;
		}
		if (linkData) {
			this.deleteLink(linkData, editor);
		}
    }

    deleteLink(linkData: LinkData, editor: Editor) {
		editor.replaceRange(
			'',
			editor.offsetToPos(linkData.position.start),
			editor.offsetToPos(linkData.position.end));
	}
}
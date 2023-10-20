import { Editor } from "obsidian";
import { ICommand  } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, removeLinks } from "../utils";

export class CreateLinkFromSelectionCommand implements ICommand {
    id: string = 'editor-create-link-from-selection';
    displayNameCommand: string = 'Create link';
    displayNameContextMenu: string = 'Create link';
    icon: string = 'link';

    handler(editor: Editor, checking: boolean) : boolean | void {
		const selection = editor.getSelection();

		if (checking) {
			return !!selection;
		}

		const linkStart = editor.posToOffset(editor.getCursor('from'));
		editor.replaceSelection(`[[|${selection}]]`);
		editor.setCursor(editor.offsetToPos(linkStart + 2));
    }
}
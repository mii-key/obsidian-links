import { Editor } from "obsidian";
import { ICommand  } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, removeLinks } from "../utils";

export class EditLinkDestinationCommand implements ICommand {
    id: string = 'editor-edit-link-destination';
    displayNameCommand: string = 'Edit link destination';
    displayNameContextMenu: string = 'Edit link destination';
    icon: string = 'text-cursor-input';

	generateLinkTextOnEdit = true;

    handler(editor: Editor, checking: boolean) : boolean | void {
        const linkData = this.getLink(editor);
		if (checking) {
			return !!linkData
				&& ((linkData.type & (LinkTypes.Wiki | LinkTypes.Markdown | LinkTypes.Html | LinkTypes.Autolink)) != 0)
				&& !!linkData.link;
		}

		if (linkData) {
			// workaround: if executed from command palette, whole link is selected.
			// with timeout, only specified region is selected.
			setTimeout(() => {
				this.editLinkDestination(linkData, editor);
			}, 500);
		}
    }

	editLinkDestination(linkData: LinkData, editor: Editor) {
		if (linkData.link) {
			const start = linkData.position.start + linkData.link.position.start;
			const end = linkData.position.start + linkData.link.position.end;
			editor.setSelection(editor.offsetToPos(start), editor.offsetToPos(end));
		} 
		// else if (this.generateLinkTextOnEdit) {
		// 	//TODO: 
		// }
	}
	
	//TODO: refactor - used in multiple commands
	getLink(editor: Editor): LinkData | undefined {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		return findLink(text, cursorOffset, cursorOffset)
	}
}
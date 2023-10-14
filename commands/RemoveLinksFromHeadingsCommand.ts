import { Editor } from "obsidian";
import { ICommand  } from "./ICommand"
import { HasLinks, HasLinksInHeadings, LinkData, LinkTypes, RemoveLinksFromHeadingsOptions, findLink, removeLinks, removeLinksFromHeadings } from "../utils";

export class RemoveLinksFromHeadingsCommand implements ICommand {
    id: string = 'editor-remove-links-from-headings';
    displayNameCommand: string = 'Remove links from headings';
    displayNameContextMenu: string = 'Remove links from headings';
    icon: string = 'unlink';
	options: RemoveLinksFromHeadingsOptions;

	constructor(options: RemoveLinksFromHeadingsOptions){
		this.options = options;
	}

    handler(editor: Editor, checking: boolean) : boolean | void {
		const selection = editor.getSelection();

		if (selection) {
			if (checking) {
				return HasLinksInHeadings(selection);
			}
			const result = removeLinksFromHeadings(selection, this.options);
			editor.replaceSelection(result);
		} else {
			const text = editor.getValue();
			if (checking) {
				return !!text && HasLinksInHeadings(text);
			}
			if (text) {
				const result = removeLinksFromHeadings(text, this.options);
				editor.setValue(result);
			}
		}
    }
}
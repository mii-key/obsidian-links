import { Editor } from "obsidian";
import { CommandBase, Func } from "./ICommand"
import { hasLinksInHeadings, RemoveLinksFromHeadingsOptions, removeLinksFromHeadings } from "../utils";

export class RemoveLinksFromHeadingsCommand extends CommandBase {
	options: RemoveLinksFromHeadingsOptions;

	constructor(options: RemoveLinksFromHeadingsOptions, isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled);
		this.options = options;
		this.id = 'editor-remove-links-from-headings';
		this.displayNameCommand = 'Remove links from headings';
		this.displayNameContextMenu = 'Remove links from headings';
		this.icon = 'unlink';
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}

		const selection = editor.getSelection();

		if (selection) {
			if (checking) {
				return hasLinksInHeadings(selection);
			}
			const result = removeLinksFromHeadings(selection, this.options);
			editor.replaceSelection(result);
		} else {
			const text = editor.getValue();
			if (checking) {
				return !!text && hasLinksInHeadings(text);
			}
			if (text) {
				const result = removeLinksFromHeadings(text, this.options);
				editor.setValue(result);
			}
		}
	}
}
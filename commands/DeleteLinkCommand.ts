import { Editor } from "obsidian";
import { CommandBase, Func, ICommand } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, removeLinks } from "../utils";

export class DeleteLinkCommand extends CommandBase {

	constructor(isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled);
		this.id = 'editor-delete-link';
		this.displayNameCommand = 'Delete link';
		this.displayNameContextMenu = 'Delete';
		this.icon = 'trash-2';
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if(checking && !this.isEnabled()){
			return false;
		}

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
import { Editor } from "obsidian";
import { CommandBase, Func, ICommand  } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, removeLinks } from "../utils";

export class CreateLinkFromSelectionCommand extends CommandBase {
    

	constructor(isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true){
		super(isPresentInContextMenu, isEnabled);
		this.id = 'editor-create-link-from-selection';
		this.displayNameCommand = 'Create link';
		this.displayNameContextMenu = 'Create link';
		this.icon = 'link';
	}

    handler(editor: Editor, checking: boolean) : boolean | void {
		if(checking && !this.isEnabled()){
			return false;
		}

		const selection = editor.getSelection();

		if (checking) {
			return !!selection;
		}

		const linkStart = editor.posToOffset(editor.getCursor('from'));
		editor.replaceSelection(`[[|${selection}]]`);
		editor.setCursor(editor.offsetToPos(linkStart + 2));
    }
}
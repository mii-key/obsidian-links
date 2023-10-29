import { Editor } from "obsidian";
import { CommandBase, Func, ICommand  } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, removeLinks } from "../utils";

export class EditLinkTextCommand extends CommandBase {
	generateLinkTextOnEdit = true;

	constructor(isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled);
		this.id = 'editor-edit-link-text';
		this.displayNameCommand = 'Edit link text';
		this.displayNameContextMenu = 'Edit link text';
		this.icon = 'text-cursor-input';
	}

    handler(editor: Editor, checking: boolean) : boolean | void {
		if(checking && !this.isEnabled()){
			return false;
		}

        const linkData = this.getLink(editor);
		if (checking) {
			return !!linkData && !!linkData.text;
		}

		if (linkData) {
			// workaround: if executed from command palette, whole link is selected.
			// with timeout, only specified region is selected.
			setTimeout(() => {
				this.editLinkText(linkData, editor);
			}, 500);
		}
    }

	editLinkText(linkData: LinkData, editor: Editor) {
		if (linkData.text) {
			const start = linkData.position.start + linkData.text.position.start;
			const end = linkData.position.start + linkData.text.position.end;
			editor.setSelection(editor.offsetToPos(start), editor.offsetToPos(end));
		} else if (this.generateLinkTextOnEdit) {
			//TODO: 
		}
	}
	
	getLink(editor: Editor): LinkData | undefined {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		return findLink(text, cursorOffset, cursorOffset)
	}
}
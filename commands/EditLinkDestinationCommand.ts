import { Editor } from "obsidian";
import { CommandBase, Func, ICommand  } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, removeLinks } from "../utils";

export class EditLinkDestinationCommand extends CommandBase {
	generateLinkTextOnEdit = true;

	constructor(isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled);
		this.id = 'editor-edit-link-destination';
		this.displayNameCommand = 'Edit link destination';
		this.displayNameContextMenu = 'Edit link destination';
		this.icon = 'text-cursor-input';
	}

    handler(editor: Editor, checking: boolean) : boolean | void {
		if(checking && !this.isEnabled()){
			return false;
		}

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
import { Editor } from "obsidian";
import { CommandBase, Func } from "./ICommand"
import { LinkData, LinkTypes, findLinks } from "../utils";

export class EditLinkDestinationCommand extends CommandBase {
	generateLinkTextOnEdit = true;

	constructor(isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled);
		this.id = 'editor-edit-link-destination';
		this.displayNameCommand = 'Edit link destination';
		this.displayNameContextMenu = 'Edit link destination';
		this.icon = 'text-cursor-input';
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}

		const linkData = this.getLink(editor);
		if (checking) {
			return !!linkData
				&& ((linkData.type & (LinkTypes.Wiki | LinkTypes.Markdown | LinkTypes.Html | LinkTypes.Autolink)) != 0)
				&& !!linkData.destination;
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
		if (linkData.destination) {
			const start = linkData.position.start + linkData.destination.position.start;
			const end = linkData.position.start + linkData.destination.position.end;
			editor.setSelection(editor.offsetToPos(start), editor.offsetToPos(end));
		}
		// else if (this.generateLinkTextOnEdit) {
		// 	//TODO: 
		// }
	}

	getLink(editor: Editor): LinkData | undefined {
		const text = editor.getValue();
		const cursorOffsetStart = editor.posToOffset(editor.getCursor('from'));
		const cursorOffsetEnd = editor.posToOffset(editor.getCursor('to'));
		const links = findLinks(text, LinkTypes.All, cursorOffsetStart, cursorOffsetEnd);
		return links?.length == 1 ? links[0] : undefined;
	}
}
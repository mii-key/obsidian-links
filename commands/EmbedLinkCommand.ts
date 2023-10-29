import { Editor } from "obsidian";
import { CommandBase, Func, ICommand  } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, removeLinks } from "../utils";

export class EmbedLinkCommand extends CommandBase {
	constructor(isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled);
		this.id = 'editor-embed-link';
		this.displayNameCommand = 'Embed link';
		this.displayNameContextMenu = 'Embed';
		this.icon = 'file-input';
	}
	
    handler(editor: Editor, checking: boolean) : boolean | void {
		if(checking && !this.isEnabled()){
			return false;
		}

		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Wiki | LinkTypes.Markdown);
		if (checking) {
			return !!linkData && !linkData.embedded && !!linkData.link;
		}

		if (linkData) {
			this.embedLinkUnderCursor(linkData, editor);
		}
    }

    embedLinkUnderCursor(linkData: LinkData, editor: Editor) {
		if (linkData.content && (linkData.type & (LinkTypes.Wiki | LinkTypes.Markdown)) && !linkData.embedded) {
			editor.replaceRange(
				'!' + linkData.content,
				editor.offsetToPos(linkData.position.start),
				editor.offsetToPos(linkData.position.end));
		}
	}
}
import { Editor } from "obsidian";
import { CommandBase, Func } from "./ICommand"
import { LinkData, LinkTypes, findLinks } from "../utils";

export class EmbedLinkCommand extends CommandBase {
	constructor(isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled);
		this.id = 'editor-embed-link';
		this.displayNameCommand = 'Embed link';
		this.displayNameContextMenu = 'Embed';
		this.icon = 'file-input';
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}

		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const links = findLinks(text, LinkTypes.Wiki | LinkTypes.Markdown, cursorOffset, cursorOffset);
		if (checking) {
			return links?.length > 0 && !links[0].embedded && !!links[0].destination;
		}

		if (links?.length) {
			this.embedLinkUnderCursor(links[0], editor);
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
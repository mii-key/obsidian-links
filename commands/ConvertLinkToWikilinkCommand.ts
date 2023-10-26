import { Editor } from "obsidian";
import { ICommand } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, removeLinks } from "../utils";

export class ConvertLinkToWikilinkCommand implements ICommand {
	// TODO: refactor
	readonly EmailScheme: string = "mailto:";


	id: string = 'editor-convert-link-to-wikilink';
	displayNameCommand: string = 'Convert to Wikilink';
	displayNameContextMenu: string = 'Convert to wikilink';
	icon: string = 'rotate-cw';

	handler(editor: Editor, checking: boolean): boolean | void {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Markdown);
		if (checking) {
			return !!linkData && linkData.link && !linkData.link.content.trim().includes(":");
		}

		if (linkData) {
			this.convertLinkToWikiLink(linkData, editor);
		}
	}

	convertLinkToWikiLink(linkData: LinkData, editor: Editor) {
		const link = linkData.type === LinkTypes.Markdown ? (linkData.link ? decodeURI(linkData.link.content) : "") : linkData.link;
		const text = linkData.text ? (linkData.text.content !== link ? "|" + linkData.text.content : "") : "";
		//TODO: use const for !
		const embededSymbol = linkData.embedded ? '!' : '';
		const rawLinkText = `${embededSymbol}[[${link}${text}]]`;
		editor.replaceRange(
			rawLinkText,
			editor.offsetToPos(linkData.position.start),
			editor.offsetToPos(linkData.position.end));
		editor.setCursor(editor.offsetToPos(linkData.position.start + rawLinkText.length));
	}
}
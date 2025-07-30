import { Editor } from "obsidian";
import { CommandBase, Func } from "./ICommand"
import { DestinationType, LinkData, LinkTypes, findLinks } from "../utils";

export class ConvertLinkToWikilinkCommand extends CommandBase {
	// TODO: refactor
	readonly EmailScheme: string = "mailto:";

	constructor(isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled)
		this.id = 'editor-convert-link-to-wikilink';
		this.displayNameCommand = 'Convert to Wikilink';
		this.displayNameContextMenu = 'Convert to wikilink';
		this.icon = 'rotate-cw';
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const links = findLinks(text, LinkTypes.Markdown, cursorOffset, cursorOffset);
		if (checking) {
			return links.length > 0 && !!links[0].destination && !links[0].destination.content.trim().includes(":");
		}

		if (links.length) {
			this.convertLinkToWikiLink(links[0], editor);
		}
	}

	convertLinkToWikiLink(linkData: LinkData, editor: Editor) {
		const link = linkData.type === LinkTypes.Markdown ? (linkData.destination ? decodeURI(linkData.destination.content) : "") : linkData.destination;
		let text = linkData.text ? (linkData.text.content !== link ? "|" + linkData.text.content : "") : "";
		if(linkData.destinationType === DestinationType.Image && linkData.imageDimensions){
			text = text + "|" + linkData.imageDimensions.width
		}
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
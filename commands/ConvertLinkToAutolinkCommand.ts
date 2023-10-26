import { Editor } from "obsidian";
import { ICommand } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, removeLinks } from "../utils";
import { RegExPatterns } from "../RegExPatterns";

export class ConvertLinkToAutolinkCommand implements ICommand {
	// TODO: refactor
	readonly EmailScheme: string = "mailto:";


	id: string = 'editor-convert-link-to-autolink';
	displayNameCommand: string = 'Convert to Autolink';
	displayNameContextMenu: string = 'Convert to autolink';
	icon: string = 'rotate-cw';

	handler(editor: Editor, checking: boolean): boolean | void {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Markdown);
		if (checking) {
			return !!linkData
				&& linkData.link?.content != undefined
				&& (RegExPatterns.AbsoluteUri.test(linkData.link.content)
					|| linkData.link.content.startsWith(this.EmailScheme))
		}
		if (linkData) {
			this.convertLinkToAutolink(linkData, editor);
		}
	}
	
	convertLinkToAutolink(linkData: LinkData, editor: Editor) {
		if (linkData.type === LinkTypes.Markdown
			&& linkData.link?.content) {
			let rawLinkText;
			if (linkData.link.content.startsWith(this.EmailScheme)) {
				rawLinkText = `<${linkData.link.content.substring(this.EmailScheme.length)}>`;
			} else if (RegExPatterns.AbsoluteUri.test(linkData.link.content)) {
				rawLinkText = `<${linkData.link.content}>`;
			}

			if (rawLinkText) {
				editor.replaceRange(
					rawLinkText,
					editor.offsetToPos(linkData.position.start),
					editor.offsetToPos(linkData.position.end));

				editor.setCursor(editor.offsetToPos(linkData.position.start + rawLinkText.length));
			}
		}
	}
}
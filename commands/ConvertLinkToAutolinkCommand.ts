import { Editor } from "obsidian";
import { CommandBase, Func } from "./ICommand"
import { LinkData, LinkTypes, findLinks } from "../utils";
import { RegExPatterns } from "../RegExPatterns";

export class ConvertLinkToAutolinkCommand extends CommandBase {
	// TODO: refactor
	readonly EmailScheme: string = "mailto:";

	constructor(isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled);

		this.id = 'editor-convert-link-to-autolink';
		this.displayNameCommand = 'Convert to Autolink';
		this.displayNameContextMenu = 'Convert to autolink';
		this.icon = 'rotate-cw';
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}

		if (checking && editor.getSelection()) {
			return false;
		}

		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const links = findLinks(text, LinkTypes.Markdown | LinkTypes.PlainUrl, cursorOffset, cursorOffset);
		if (checking) {
			if (links.length === 0 || links[0].destination === undefined) {
				return false;
			}

			switch (links[0].type) {
				case LinkTypes.Markdown:
					if (!(RegExPatterns.AbsoluteUri.test(links[0].destination.content)
						|| links[0].destination.content.startsWith(this.EmailScheme))) {
						return false;
					}
					break;
				case LinkTypes.PlainUrl:
					if (!RegExPatterns.AbsoluteUri.test(links[0].destination.content)) {
						return false;
					}
					break;
			}
			return true;
		}

		if (links.length === 1) {
			this.convertLinkToAutolink(links[0], editor);
		}
	}

	convertLinkToAutolink(linkData: LinkData, editor: Editor) {
		if (linkData.destination?.content
			&& (linkData.type === LinkTypes.Markdown || linkData.type === LinkTypes.PlainUrl)) {
			let linkContent;
			if (linkData.destination.content.startsWith(this.EmailScheme)) {
				linkContent = `<${linkData.destination.content.substring(this.EmailScheme.length)}>`;
			} else if (RegExPatterns.AbsoluteUri.test(linkData.destination.content)) {
				linkContent = `<${linkData.destination.content}>`;
			}

			if (linkContent) {
				editor.replaceRange(
					linkContent,
					editor.offsetToPos(linkData.position.start),
					editor.offsetToPos(linkData.position.end));

				editor.setCursor(editor.offsetToPos(linkData.position.start + linkContent.length));
			}
		}
	}
}
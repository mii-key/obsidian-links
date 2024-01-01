import { Editor } from "obsidian";
import { CommandBase, Func, ICommand } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, findLinks, getFileName, getLinkTitles, removeLinks } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";

export class ConvertLinkToHtmllinkCommand extends CommandBase {
	obsidianProxy: IObsidianProxy;

	// TODO: refactor
	readonly EmailScheme: string = "mailto:";

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => false, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled)
		this.id = 'editor-convert-link-to-htmllink';
		this.displayNameCommand = 'Convert to HTML link';
		this.displayNameContextMenu = 'Convert to HTML link';
		this.icon = 'rotate-cw';
		this.obsidianProxy = obsidianProxy;

		this.isEnabled = () => this.obsidianProxy.settings.ffConvertLinkToHtmllink;
		this.isPresentInContextMenu = () => this.obsidianProxy.settings.contexMenu.convertToHtmlLink;
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
		const links = findLinks(text, LinkTypes.Wiki, cursorOffset, cursorOffset);
		if (checking) {
			if (links.length === 0 || links[0].link === undefined) {
				return false;
			}

			return true
		}

		if (links.length === 1) {
			this.convertLinkToHtmllink(links[0], editor);
		}
	}

	convertLinkToHtmllink(linkData: LinkData, editor: Editor) {
		if (linkData.link?.content
			&& (linkData.type === LinkTypes.Wiki)) {
			const linkText = linkData.text ? linkData.text.content : this.generateLinkText(linkData)
			const linkContent = `<a href="${linkData.link.content}" class="internal-link">${linkText}</a>`;
			editor.replaceRange(
				linkContent,
				editor.offsetToPos(linkData.position.start),
				editor.offsetToPos(linkData.position.end));

			editor.setCursor(editor.offsetToPos(linkData.position.start + linkContent.length));
		}
	}

	generateLinkText(linkData: LinkData): string {
		if(!linkData.link?.content){
			throw new Error('Link destination required')
		}
		const titles = getLinkTitles(linkData);
		if(titles.length > 0){
			return titles[titles.length - 1]
		}

		return getFileName(linkData.link?.content);
	}

}
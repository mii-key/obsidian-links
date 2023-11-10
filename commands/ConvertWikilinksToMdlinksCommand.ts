import { Editor } from "obsidian";
import { Func, ICommand } from "./ICommand"
import { LinkTypes, findLink, findLinks } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";
import { ConvertToMdlinkCommandBase } from './ConvertToMdlinkCommandBase'


export class ConvertWikilinksToMdlinksCommand extends ConvertToMdlinkCommandBase {

	callback: ((error: Error | null, data: any) => void) | undefined

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true,
		callback: ((error: Error | null, data: any) => void) | undefined = undefined,
	) {
		super(obsidianProxy, isPresentInContextMenu, isEnabled)

		this.isEnabled = () => this.obsidianProxy.settings.ffMultipleLinkConversion;
		this.isPresentInContextMenu = () => this.obsidianProxy.settings.contexMenu.convertWikilinkToMdLinks;

		this.id = 'editor-convert-wikilinks-to-mdlinks';
		this.displayNameCommand = 'Convert Wikilinks to Markdown links';
		this.displayNameContextMenu = 'Convert Wikilinks to Markdown links';
		this.icon = 'rotate-cw';
		this.callback = callback;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if(checking && !this.isEnabled()){
			return false;
		}

		const selection = editor.getSelection()
		const text = selection || editor.getValue();
		const links = findLinks(text);
		const wikilinks = links ? links.filter(x => x.type == LinkTypes.Wiki) : []

		if (checking) {
			return wikilinks.length > 0
		}

		const selectionOffset = selection ? editor.posToOffset(editor.getCursor('from')) : 0;

		(async () => {
			for (let i = wikilinks.length - 1; i >= 0; i--) {
				const link = wikilinks[i]
				await this.convertLinkToMarkdownLink(link, editor, false, selectionOffset)
			}
		})()
			.then(() => {
				if (this.callback) {
					this.callback(null, undefined);
				}
			})
			.catch((err) => {
				if (this.callback) {
					this.callback(err, undefined);
				}
			});
	}
}
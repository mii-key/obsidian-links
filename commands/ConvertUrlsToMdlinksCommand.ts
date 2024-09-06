import { Editor } from "obsidian";
import { Func } from "./ICommand"
import { LinkTypes, findLinks } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";
import { ConvertToMdlinkCommandBase } from './ConvertToMdlinkCommandBase'


export class ConvertUrlsToMdlinksCommand extends ConvertToMdlinkCommandBase {

	callback: ((error: Error | null, data: any) => void) | undefined

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true,
		callback: ((error: Error | null, data: any) => void) | undefined = undefined,
	) {
		super(obsidianProxy, isPresentInContextMenu, isEnabled)

		this.isPresentInContextMenu = () => this.obsidianProxy.settings.contexMenu.convertUrlsToMdlinks;

		this.id = 'editor-convert-urls-to-mdlinks';
		this.displayNameCommand = 'Convert URLs to Markdown links';
		this.displayNameContextMenu = 'Convert URLs to Markdown links';
		this.icon = 'rotate-cw';
		this.callback = callback;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}

		const selection = editor.getSelection()
		const text = selection || editor.getValue();
		const links = findLinks(text);
		const urls = links ? links.filter(x => x.type == LinkTypes.PlainUrl) : []

		if (checking) {
			return urls.length > 0
		}

		const selectionOffset = selection ? editor.posToOffset(editor.getCursor('from')) : 0;

		(async () => {
			for (let i = urls.length - 1; i >= 0; i--) {
				const link = urls[i]
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
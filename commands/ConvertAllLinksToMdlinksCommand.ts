import { Editor } from "obsidian";
import { ICommand } from "./ICommand"
import { LinkTypes, findLink, findLinks } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";
import { ConvertToMdlinkCommandBase } from './ConvertToMdlinkCommandBase'


export class ConvertAllLinksToMdlinksCommand extends ConvertToMdlinkCommandBase implements ICommand {
	id: string = 'editor-convert-all-links-to-mdlinks';
	displayNameCommand: string = 'Convert all links to Markdown links';
	displayNameContextMenu: string = 'Convert all links to Markdown links';
	icon: string = 'rotate-cw';
	callback: ((error: Error | null, data: any) => void) | undefined

	constructor(obsidianProxy: IObsidianProxy, callback: ((error: Error | null, data: any) => void) | undefined = undefined) {
		super(obsidianProxy)
		this.callback = callback;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		const selection = editor.getSelection()
		const text = selection || editor.getValue();
		const links = findLinks(text);
		const notMdlinks = links ? links.filter(x => x.type != LinkTypes.Markdown) : []

		if (checking) {
			return notMdlinks.length > 0
		}

		const selectionOffset = selection ? editor.posToOffset(editor.getCursor('from')) : 0;

		(async () => {
			for (let i = notMdlinks.length - 1; i >= 0; i--) {
				const link = notMdlinks[i]
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
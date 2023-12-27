import { Editor } from "obsidian";
import { Func, ICommand } from "./ICommand"
import { LinkTypes, Position, findCodeBlocks, findLink, findLinks } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";
import { ConvertToMdlinkCommandBase } from './ConvertToMdlinkCommandBase'


export class ConvertAllLinksToMdlinksCommand extends ConvertToMdlinkCommandBase {

	callback: ((error: Error | null, data: any) => void) | undefined

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true,
		callback: ((error: Error | null, data: any) => void) | undefined = undefined,
	) {
		super(obsidianProxy, isPresentInContextMenu, isEnabled)

		this.isPresentInContextMenu = () => this.obsidianProxy.settings.contexMenu.convertAllLinksToMdLinks;

		this.id = 'editor-convert-all-links-to-mdlinks';
		this.displayNameCommand = 'Convert all links to Markdown links';
		this.displayNameContextMenu = 'Convert all links to Markdown links';
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

		//TODO: fix regex and move inside of findLinks
		const codeBlocks = findCodeBlocks(text);

		const insideCodeBlock = (pos: Position) => {
			for (const block of codeBlocks) {
				if (pos.start >= block.position.start && pos.end <= block.position.end) {
					return true;
				}
			}

			return false;
		}

		const notMdlinks = links ? links.filter(x => x.type != LinkTypes.Markdown && !insideCodeBlock(x.position)) : []

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
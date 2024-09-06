import { Editor } from "obsidian";
import { Func } from "./ICommand"
import { LinkTypes, findLinks } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";
import { ConvertToMdlinkCommandBase } from './ConvertToMdlinkCommandBase'
import { EditorTextBuffer } from "../EditorTextBuffer";


export class ConvertAutolinksToMdlinksCommand extends ConvertToMdlinkCommandBase {

	callback: ((error: Error | null, data: any) => void) | undefined

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true,
		callback: ((error: Error | null, data: any) => void) | undefined = undefined,
	) {
		super(obsidianProxy, isPresentInContextMenu, isEnabled)

		this.isPresentInContextMenu = () => this.obsidianProxy.settings.contexMenu.convertAutolinksToMdlinks;

		this.id = 'editor-convert-autolinks-to-mdlinks';
		this.displayNameCommand = 'Convert Autolinks to Markdown links';
		this.displayNameContextMenu = 'Convert Autolinks to Markdown links';
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
		const autolinks = links ? links.filter(x => x.type == LinkTypes.Autolink) : []

		if (checking) {
			return autolinks.length > 0
		}

		const selectionOffset = selection ? editor.posToOffset(editor.getCursor('from')) : 0;

		(async () => {
			const textBuffer = new EditorTextBuffer(editor);
			for (let i = autolinks.length - 1; i >= 0; i--) {
				const link = autolinks[i]
				await this.convertLinkToMarkdownLink1(link, textBuffer, false, selectionOffset)
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
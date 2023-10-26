import { Editor, requestUrl } from "obsidian";
import { ICommand } from "./ICommand"
import { LinkTypes, findLink } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";
import { ConvertToMdlinkCommandBase } from './ConvertToMdlinkCommandBase'
import { error } from "console";


export class ConvertLinkToMdlinkCommand extends ConvertToMdlinkCommandBase implements ICommand {
	id: string = 'editor-convert-link-to-mdlink';
	displayNameCommand: string = 'Convert to Markdown link';
	displayNameContextMenu: string = 'Convert to Markdown link';
	icon: string = 'rotate-cw';
	callback: ((error: Error | null, data: any) => void) | undefined

	constructor(obsidianProxy: IObsidianProxy, callback: ((error: Error | null, data: any) => void) | undefined = undefined) {
		super(obsidianProxy)
		this.callback = callback;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Wiki | LinkTypes.Html | LinkTypes.Autolink)
		if (checking) {
			return !!linkData;
		}
		if (linkData) {
			this.convertLinkToMarkdownLink(linkData, editor)
				.then(() => {
					this.callback?.(null, undefined);
				})
				.catch((err) => {
					this.callback?.(err, undefined);
				});
		} else {
			this.callback?.(new Error('link not found'), null);
		}
	}
}
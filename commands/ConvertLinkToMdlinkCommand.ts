import { Editor, requestUrl } from "obsidian";
import { Func, ICommand } from "./ICommand"
import { LinkTypes, findLink } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";
import { ConvertToMdlinkCommandBase } from './ConvertToMdlinkCommandBase'
import { error } from "console";


export class ConvertLinkToMdlinkCommand extends ConvertToMdlinkCommandBase {
	callback: ((error: Error | null, data: any) => void) | undefined

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu:Func<boolean>=() => true, isEnabled:Func<boolean>=() => true, callback: ((error: Error | null, data: any) => void) | undefined = undefined) {
		super(obsidianProxy, isPresentInContextMenu, isEnabled)

		this.id = 'editor-convert-link-to-mdlink';
		this.displayNameCommand = 'Convert to Markdown link';
		this.displayNameContextMenu = 'Convert to Markdown link';
		this.icon = 'rotate-cw';
	
		this.callback = callback;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if(checking && !this.isEnabled()){
			return false;
		}
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
import { Editor } from "obsidian";
import { Func } from "./ICommand"
import { LinkTypes, findLinks } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";
import { ConvertToMdlinkCommandBase } from './ConvertToMdlinkCommandBase'


export class ConvertLinkToMdlinkCommand extends ConvertToMdlinkCommandBase {
	callback: ((error: Error | null, data: any) => void) | undefined

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true, callback: ((error: Error | null, data: any) => void) | undefined = undefined) {
		super(obsidianProxy, isPresentInContextMenu, isEnabled)

		this.id = 'editor-convert-link-to-mdlink';
		this.displayNameCommand = 'Convert to Markdown link';
		this.displayNameContextMenu = 'Convert to Markdown link';
		this.icon = 'rotate-cw';

		this.callback = callback;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && (!this.isEnabled() || editor.getSelection())) {
			return false;
		}
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLinks(text, ~LinkTypes.Markdown, cursorOffset, cursorOffset)
		if (checking) {
			return linkData.length != 0;
		}
		if (linkData.length) {
			this.convertLinkToMarkdownLink(linkData[0], editor)
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
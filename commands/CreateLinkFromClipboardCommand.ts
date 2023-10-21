import { Editor } from "obsidian";
import { ICommand } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, getPageTitle, removeLinks } from "../utils";
import { ObsidianProxy } from "./ObsidianProxy";

export class CreateLinkFromClipboardCommand implements ICommand {
	id: string = 'editor-create-link-from-clipboard';
	displayNameCommand: string = 'Create link from clipboard';
	displayNameContextMenu: string = 'Create link from clipboard';
	icon: string = 'link';

	obsidianProxy: ObsidianProxy;
	callback: ((error: Error | null, data: any) => void) | undefined


	constructor(obsidianProxy: ObsidianProxy, callback: ((error: Error | null, data: any) => void) | undefined = undefined){
		this.obsidianProxy = obsidianProxy;
		this.callback = callback;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		// TODO: no check for now
		if (checking) {
			return true;
		}

		(async () => {
			const urlRegEx = /^(http|https):\/\/[^ "]+$/i;
			// const linkDestination = await navigator.clipboard.readText();
			const linkDestination = await this.obsidianProxy.clipboardReadText();
			let linkText = linkDestination;
			const selection = editor.getSelection();

			if (selection.length == 0 && urlRegEx.test(linkDestination)) {
				const notice = this.obsidianProxy.createNotice("Getting title ...", 0);
				try {
					linkText = await getPageTitle(new URL(linkDestination), this.getPageText.bind(this));
				}
				catch (err) {
					this.obsidianProxy.createNotice(err);
					this.callback?.(err, undefined);
					return;
				}
				finally {
					notice.hide();
				}
			}

			let posRangeStart = editor.getCursor();
			let posRangeEnd = posRangeStart;
			if (selection.length > 0) {
				posRangeStart = editor.getCursor('from');
				posRangeEnd = editor.getCursor('to');
				linkText = selection;
			}
			const linkRawText = `[${linkText}](${linkDestination})`;
			const endOffset = editor.posToOffset(posRangeStart) + linkRawText.length;
			editor.replaceRange(linkRawText, posRangeStart, posRangeEnd);
			editor.setCursor(editor.offsetToPos(endOffset));
			this.callback?.(null, undefined)
		})();
	}

	async getPageText(url: URL): Promise<string> {
        const response = await this.obsidianProxy.requestUrl({ url: url.toString() });
        if (response.status !== 200) {
            throw new Error(`Failed to request '${url}': ${response.status}`);
        }
        return response.text;
    }
}
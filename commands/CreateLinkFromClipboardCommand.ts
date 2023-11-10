import { Editor } from "obsidian";
import { CommandBase, Func, ICommand } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, getPageTitle, removeLinks } from "../utils";
import { ObsidianProxy } from "./ObsidianProxy";
import { IObsidianProxy } from "./IObsidianProxy";

export class CreateLinkFromClipboardCommand extends CommandBase {
	obsidianProxy: IObsidianProxy;
	callback: ((error: Error | null, data: any) => void) | undefined


	constructor(obsidianProxy: IObsidianProxy,
		isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true,
		callback: ((error: Error | null, data: any) => void) | undefined = undefined) {
		super(isPresentInContextMenu, isEnabled);
		this.id = 'editor-create-link-from-clipboard';
		this.displayNameCommand = 'Create link from clipboard';
		this.displayNameContextMenu = 'Create link from clipboard';
		this.icon = 'link';
		this.obsidianProxy = obsidianProxy;
		this.callback = callback;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if(checking && !this.isEnabled()){
			return false;
		}
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
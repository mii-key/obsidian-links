import { Editor, EditorPosition } from "obsidian";
import { CommandBase, Func, ICommand } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, getPageTitle, removeLinks } from "../utils";
import { ObsidianProxy } from "./ObsidianProxy";
import { IObsidianProxy } from "./IObsidianProxy";

export class SetTextFromClipboardCommand extends CommandBase {
	obsidianProxy: IObsidianProxy;
	callback: ((error: Error | null, data: any) => void) | undefined


	constructor(obsidianProxy: IObsidianProxy,
		isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true,
		callback: ((error: Error | null, data: any) => void) | undefined = undefined) {
		super(isPresentInContextMenu, isEnabled);

		this.isEnabled = () => this.obsidianProxy.settings.ffSetLinkTextFromClipboard;
		this.isPresentInContextMenu = () => this.obsidianProxy.settings.contexMenu.setLinkTextFromClipboard;

		this.id = 'editor-set-link-text-from-clipboard';
		this.displayNameCommand = 'Set text from clipboard';
		this.displayNameContextMenu = 'Set text from clipboard';
		this.icon = 'link';
		this.obsidianProxy = obsidianProxy;
		this.callback = callback;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}
		// TODO: no check clipboard
		if (checking) {
			const noteText = editor.getValue();
			const cursorOffset = editor.posToOffset(editor.getCursor('from'))
			const link = findLink(noteText, cursorOffset, cursorOffset, LinkTypes.Markdown | LinkTypes.Wiki)
			if (!link || cursorOffset < link.position.start || cursorOffset >= link.position.end) {
				return false;

			}
			return true;
		}

		(async () => {
			const noteText = editor.getValue();
			const cursorOffset = editor.posToOffset(editor.getCursor('from'))
			const link = findLink(noteText, cursorOffset, cursorOffset, LinkTypes.Markdown | LinkTypes.Wiki)
			if (!link || cursorOffset < link.position.start || cursorOffset >= link.position.end) {
				this.callback?.(null, undefined)
				return;
			}

			const clipboardText = await this.obsidianProxy.clipboardReadText();
			let linkText = clipboardText;
			let textStartOffset:number;
			let textEndOffset: number;
			if (link?.text) {
				textStartOffset = link.position.start + link.text.position.start;
				textEndOffset = link.position.start + link.text.position.end;
			} else {
				switch (link?.type) {
					case LinkTypes.Wiki:
						textStartOffset = link.position.start + (link.link ? link.link.position.end : 2);
						textEndOffset = link.position.start + (link.link ? link.link.position.end : 2);
						linkText = '|' + linkText;
						break;
					case LinkTypes.Markdown:
						textStartOffset = textEndOffset = link.position.start + 1;
						break;
					default:
						this.callback?.(null, undefined)
						return;
				}
			}

			editor.replaceRange(linkText, editor.offsetToPos(textStartOffset), editor.offsetToPos(textEndOffset));
			editor.setCursor(editor.offsetToPos(textStartOffset + linkText.length));
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
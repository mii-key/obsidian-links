import { Editor, EditorPosition } from "obsidian";
import { CommandBase, Func, ICommand } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, findLinks, getPageTitle, removeLinks } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";
import { ConvertToMdlinkCommandBase } from "./ConvertToMdlinkCommandBase";

export class SetLinkTextFromClipboardCommand extends ConvertToMdlinkCommandBase {
	obsidianProxy: IObsidianProxy;
	callback: ((error: Error | null, data: any) => void) | undefined

	constructor(obsidianProxy: IObsidianProxy,
		isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true,
		callback: ((error: Error | null, data: any) => void) | undefined = undefined) {
		super(obsidianProxy, isPresentInContextMenu, isEnabled)

		this.isPresentInContextMenu = () => this.obsidianProxy.settings.contexMenu.setLinkTextFromClipboard;

		this.id = 'editor-set-link-text-from-clipboard';
		this.displayNameCommand = 'Set link text from clipboard';
		this.displayNameContextMenu = 'Set link text from clipboard';
		this.icon = 'link';
		this.obsidianProxy = obsidianProxy;
		this.callback = callback;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}
		// TODO: check clipboard
		if (checking) {
			const noteText = editor.getValue();
			const cursorOffset = editor.posToOffset(editor.getCursor('from'))
			const links = findLinks(noteText, LinkTypes.Markdown | LinkTypes.Wiki | LinkTypes.PlainUrl, cursorOffset, cursorOffset)
			if (!links.length || cursorOffset < links[0].position.start || cursorOffset >= links[0].position.end) {
				return false;

			}
			return true;
		}

		(async () => {
			const noteText = editor.getValue();
			const cursorOffset = editor.posToOffset(editor.getCursor('from'))
			const links = findLinks(noteText, LinkTypes.Markdown | LinkTypes.Wiki | LinkTypes.PlainUrl, cursorOffset, cursorOffset)
			if (!links.length || cursorOffset < links[0].position.start || cursorOffset >= links[0].position.end) {
				this.callback?.(null, undefined)
				return;
			}
			const link = links[0];
			const clipboardText = await this.obsidianProxy.clipboardReadText();
			let linkText = clipboardText;
			let textStartOffset: number;
			let textEndOffset: number;
			let cursorOffsetCorrection = 0;
			if (link?.text) {
				textStartOffset = link.position.start + link.text.position.start
				textEndOffset = link.position.start + link.text.position.end
			} else {
				switch (link?.type) {
					case LinkTypes.Wiki:
						textStartOffset = link.position.start + (link.destination ? link.destination.position.end : 2);
						textEndOffset = link.position.start + (link.destination ? link.destination.position.end : 2);
						linkText = '|' + linkText;
						break;
					case LinkTypes.Markdown:
						textStartOffset = textEndOffset = link.position.start + (link.embedded ? 2 : 1);
						if (link.imageDimensions) {
							linkText = linkText + '|';
							cursorOffsetCorrection = -1;
						}
						break;
					case LinkTypes.PlainUrl: {
						const rawLink = `[${linkText}](${link.destination?.content})`;
						editor.replaceRange(rawLink, editor.offsetToPos(link.position.start), editor.offsetToPos(link.position.end));
						editor.setCursor(editor.offsetToPos(link.position.start + linkText.length + 1));
						this.callback?.(null, undefined)
					}
						return;
					default:
						this.callback?.(null, undefined)
						return;
				}
			}

			if ((link?.type & (LinkTypes.Markdown | LinkTypes.Wiki)) != 0) {
				editor.replaceRange(linkText, editor.offsetToPos(textStartOffset), editor.offsetToPos(textEndOffset));
				editor.setCursor(editor.offsetToPos(textStartOffset + linkText.length + cursorOffsetCorrection));
				this.callback?.(null, undefined)
			}
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
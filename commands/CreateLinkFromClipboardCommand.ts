import { Editor } from "obsidian";
import { CommandBase, Func, ICommand } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, findLinks, getPageTitle, removeLinks } from "../utils";
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
		if (checking && !this.isEnabled()) {
			return false;
		}
		// TODO: no check clipboard
		if (checking) {
			const noteText = editor.getValue();
			const cursorOffset = editor.posToOffset(editor.getCursor('from'))
			const link = findLink(noteText, cursorOffset, cursorOffset, LinkTypes.All)
			if (link && link.position.start < cursorOffset && link.position.end > cursorOffset) {
				return false;
			}
			return true;
		}

		(async () => {
			const httpUrlRegEx = /^(http|https):\/\/[^ "]+$/i;
			// const linkDestination = await navigator.clipboard.readText();


			const clipboardText = await this.obsidianProxy.clipboardReadText();
			const links = findLinks(clipboardText, LinkTypes.All)

			let linkDestination: string = ""
			if (links.length) {
				const link = links[0];
				if (this.obsidianProxy.settings.ffObsidianUrlSupport && (link.type & LinkTypes.ObsidianUrl) === LinkTypes.ObsidianUrl) {
					if (link.destination) {
						const url = new URL(link.destination?.content)
						if (this.obsidianProxy.Vault.getName() === url.searchParams.get('vault')) {
							const filePath = url.searchParams.get('file')
							if (filePath) {
								linkDestination = decodeURI(filePath)
							}
						}
					}
				} else {
					linkDestination = links[0].destination ? links[0].destination.content : ""
				}
			} else {
				linkDestination = clipboardText;
			}

			let linkText = linkDestination;

			const selection = editor.getSelection();
			let isUrl = false;

			if (selection.length == 0 && httpUrlRegEx.test(linkDestination)) {
				isUrl = true;
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

			const requireAngleBrackets = !isUrl && linkDestination && linkDestination.indexOf(' ') > 0;

			const linkRawText = requireAngleBrackets ? `[${linkText}](<${linkDestination}>)` : `[${linkText}](${linkDestination})`;
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
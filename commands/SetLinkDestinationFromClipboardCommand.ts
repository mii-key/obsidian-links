import { Editor } from "obsidian";
import { Func } from "./ICommand"
import { LinkTypes, findLinks, getFileExtension } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";
import { ConvertToMdlinkCommandBase } from "./ConvertToMdlinkCommandBase";

export class SetLinkDestinationFromClipboardCommand extends ConvertToMdlinkCommandBase {
	obsidianProxy: IObsidianProxy;
	callback: ((error: Error | null, data: any) => void) | undefined

	constructor(obsidianProxy: IObsidianProxy,
		isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true,
		callback: ((error: Error | null, data: any) => void) | undefined = undefined) {
		super(obsidianProxy, isPresentInContextMenu, isEnabled)

		this.isEnabled = () => this.obsidianProxy.settings.ffSetLinkDestinationFromClipbard;
		this.isPresentInContextMenu = () => this.obsidianProxy.settings.contexMenu.setLinkDestinationFromClipboard;

		this.id = 'editor-set-link-destination-from-clipboard';
		this.displayNameCommand = 'Set link destination from clipboard';
		this.displayNameContextMenu = 'Set link destination from clipboard';
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
			const links = findLinks(noteText, LinkTypes.Markdown | LinkTypes.Wiki, cursorOffset, cursorOffset)
			if (!links.length || cursorOffset < links[0].position.start || cursorOffset >= links[0].position.end) {
				return false;

			}
			return true;
		}

		(async () => {
			const noteText = editor.getValue();
			const cursorOffset = editor.posToOffset(editor.getCursor('from'))
			const links = findLinks(noteText, LinkTypes.Markdown | LinkTypes.Wiki, cursorOffset, cursorOffset)
			if (!links.length || cursorOffset < links[0].position.start || cursorOffset >= links[0].position.end) {
				this.callback?.(null, undefined)
				return;
			}
			const link = links[0];
			const clipboardText = await this.obsidianProxy.clipboardReadText();
			let linkDestination = clipboardText;
			if (this.obsidianProxy.settings.ffObsidianUrlSupport) {
				//TODO:
				if (linkDestination.startsWith('obsidian://open?vault=')) {
					const links = findLinks(linkDestination, LinkTypes.PlainUrl);
					if (links.length == 1 && links[0].destination) {
						const url = new URL(links[0].destination?.content)
						if (this.obsidianProxy.Vault.getName() === url.searchParams.get('vault')) {
							const filePath = url.searchParams.get('file')
							if (filePath) {
								linkDestination = filePath + (getFileExtension(filePath) ? '' : '.md');
							}
						}
					}
				}
			}
			let destinationStartOffset: number;
			let destinationEndOffset: number;
			if (link?.destination) {
				destinationStartOffset = link.position.start + link.destination.position.start
				destinationEndOffset = link.position.start + link.destination.position.end
			} else {
				switch (link?.type) {
					case LinkTypes.Wiki:
						destinationStartOffset = link.position.start + 2;
						destinationEndOffset = destinationStartOffset
						linkDestination += '|';
						break;
					case LinkTypes.Markdown:
						destinationStartOffset = destinationEndOffset = link.position.start + (link.text ? link.text.content.length : 0) + (link.embedded ? 2 : 1) + 2;
						break;
					default:
						this.callback?.(null, undefined)
						return;
				}
			}

			if ((link?.type & (LinkTypes.Markdown | LinkTypes.Wiki)) != 0) {
				if ((link?.type === LinkTypes.Markdown)
					&& (!link.destination?.content
						|| !link._destinationInAngleBrackets)
					&& linkDestination.indexOf(' ') >= 0) {
					linkDestination = `<${linkDestination}>`;
				}

				editor.replaceRange(linkDestination, editor.offsetToPos(destinationStartOffset), editor.offsetToPos(destinationEndOffset));
				editor.setCursor(editor.offsetToPos(destinationStartOffset + linkDestination.length));
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
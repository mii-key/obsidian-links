import { Editor } from "obsidian";
import { CommandBase, Func } from "./ICommand"
import { LinkData, LinkTypes, findLinks, getFileName, getLinkTitles, getPageTitle, isAbsoluteUri } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";

export class SetLinkTextCommand extends CommandBase {

	obsidianProxy: IObsidianProxy;
	callback: ((error: Error | null, data: any) => void) | undefined;

	constructor(obsidianProxy: IObsidianProxy,
		isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true,
		callback: ((error: Error | null, data: any) => void) | undefined = undefined) {
		super(isPresentInContextMenu, isEnabled);
		this.id = 'editor-set-link-text';
		this.displayNameCommand = 'Set link text';
		this.displayNameContextMenu = 'Set link text';
		this.icon = 'text-cursor-input';

		this.obsidianProxy = obsidianProxy;
		this.callback = callback;
	}

	//TODO: refactor
	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}

		const linkData = this.getLinks(editor);
		const selection = editor.getSelection();
		if (checking) {
			return selection
				? !!linkData?.length && !!linkData.find(x => !x.text && x.destination?.content && !isAbsoluteUri(x.destination.content))
				: !!linkData?.length
				&& ((linkData[0].type & (LinkTypes.Markdown | LinkTypes.Wiki)) != 0)
				&& !!linkData[0].destination?.content
				&& (!linkData[0].text || !linkData[0]?.text.content || (!linkData[0].destination.content.startsWith('#') && linkData[0].destination.content.includes('#')));
		}
		if (linkData?.length) {
			// workaround: if executed from command palette, whole link is selected.
			// with timeout, only specified region is selected.
			setTimeout(() => {
				//TODO: refactor
				if (selection) {
					this.setLinksText(linkData, editor)
						.then(() => {
							this.callback?.(null, undefined);
						})
						.catch(err => this.callback?.(err, undefined))
				} else {
					this.setLinkText(linkData[0], editor)
						.then(() => {
							this.callback?.(null, undefined);
						})
						.catch(err => this.callback?.(err, undefined))
				}
			}, 500);
		}
	}

	async setLinkText(linkData: LinkData, editor: Editor) {
		if (!linkData.destination) {
			return;
		}

		if (linkData.type == LinkTypes.Wiki) {
			if (this.showLinkTextSuggestions(linkData, editor)) {
				return;
			}
			const text = linkData.destination.content[0] === '#' ?
				linkData.destination.content.substring(1) : getFileName(linkData.destination?.content);
			let textStart = linkData.position.start + linkData.destination.position.end;
			if (linkData.text) {
				editor.replaceRange("|" + text, editor.offsetToPos(textStart), editor.offsetToPos(linkData.text.content.length + 1));
			} else {
				editor.replaceRange("|" + text, editor.offsetToPos(textStart));
			}
			textStart++;
			editor.setSelection(editor.offsetToPos(textStart), editor.offsetToPos(textStart + text.length));
		} else if (linkData.type == LinkTypes.Markdown) {
			const urlRegEx = /^(http|https):\/\/[^ "]+$/i;
			let text = "";
			if (urlRegEx.test(linkData.destination.content)) {
				if (!(linkData.text && linkData.text.content !== "")) {
					const notice = this.obsidianProxy.createNotice("Getting title ...", 0);
					try {
						text = await getPageTitle(new URL(linkData.destination.content), this.getPageText.bind(this));
					}
					catch (err) {
						this.obsidianProxy.createNotice(err);
					}
					finally {
						notice.hide();
					}
				}
			} else {
				if (this.showLinkTextSuggestions(linkData, editor)) {
					return;
				}
				text = getFileName(decodeURI(linkData.destination?.content));
			}
			const textStart = linkData.position.start + 1;
			editor.setSelection(editor.offsetToPos(textStart));
			editor.replaceSelection(text);
			editor.setSelection(editor.offsetToPos(textStart), editor.offsetToPos(textStart + text.length));
		}
	}


	//TODO: wip
	async setLinksText(linkData: LinkData[], editor: Editor) {
		const offset = editor.getSelection() ? editor.posToOffset(editor.getCursor('from')) : 0;
		for (let i = linkData.length - 1; i >= 0; i--) {
			//TODO: 
			//right now only local wiki links without headings supported
			const destinationContent = linkData[i].destination?.content;
			if (linkData[i].text
				|| !destinationContent
				|| isAbsoluteUri(destinationContent)
				|| destinationContent.lastIndexOf('#') >= 0
			) {
				continue;
			}

			//TODO
			const text = getFileName(destinationContent);
			let textStart = offset + linkData[i].position.start + linkData[i].destination!.position.end;

			editor.replaceRange("|" + text, editor.offsetToPos(textStart));
			textStart++;
		}
	}

	//TODO: refactor
	getLinks(editor: Editor): LinkData[] | undefined {
		const selection = editor.getSelection();
		if (selection) {
			//TODO: process mdlink
			return findLinks(selection, LinkTypes.Wiki)
		} else {
			const text = editor.getValue();
			const cursorOffset = editor.posToOffset(editor.getCursor('from'));
			const links = findLinks(text, LinkTypes.Wiki | LinkTypes.Markdown, cursorOffset, cursorOffset);
			return links?.length > 0 ? [links[0]] : [];
		}
	}

	showLinkTextSuggestions(linkData: LinkData, editor: Editor): boolean {
		const titles = getLinkTitles(linkData);

		if (titles.length == 0) {
			return false;
		}
		this.obsidianProxy.linkTextSuggestContextSetLinkData(linkData, titles);

		//trigger suggest
		const posLinkEnd = editor.offsetToPos(linkData.position.end);
		editor.setCursor(posLinkEnd);
		editor.replaceRange(" ", posLinkEnd);
		editor.replaceRange("", posLinkEnd, editor.offsetToPos(linkData.position.end + 1));

		return true;
	}

	async getPageText(url: URL): Promise<string> {
		const response = await this.obsidianProxy.requestUrl({ url: url.toString() });
		if (response.status !== 200) {
			throw new Error(`Failed to request '${url}': ${response.status}`);
		}
		return response.text;
	}
}
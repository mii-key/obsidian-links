import { Editor } from "obsidian";
import { CommandBase, Func, ICommand } from "./ICommand"
import { HasLinks, LinkData, LinkTypes, findLink, getFileName, getLinkTitles, getPageTitle, removeLinks } from "../utils";
import { ObsidianProxy } from "./ObsidianProxy";
import { ILinkTextSuggestContext } from "suggesters/ILinkTextSuggestContext";
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

	handler(editor: Editor, checking: boolean): boolean | void {
		if(checking && !this.isEnabled()){
			return false;
		}

		const linkData = this.getLink(editor);
		if (checking) {
			return !!linkData
				&& ((linkData.type & (LinkTypes.Markdown | LinkTypes.Wiki)) != 0)
				&& !!linkData.link?.content
				&& (!linkData.text || !linkData?.text.content || linkData.link.content.includes('#'));
		}
		if (linkData) {
			// workaround: if executed from command palette, whole link is selected.
			// with timeout, only specified region is selected.
			setTimeout(() => {
				this.setLinkText(linkData, editor)
					.then(() => {
						this.callback?.(null, undefined);
					})
					.catch(err => this.callback?.(err, undefined))
			}, 500);
		}
	}

	async setLinkText(linkData: LinkData, editor: Editor) {
		if (!linkData.link) {
			return;
		}

		if (linkData.type == LinkTypes.Wiki) {
			if (this.showLinkTextSuggestions(linkData, editor)) {
				return;
			}
			const text = getFileName(linkData.link?.content);
			let textStart = linkData.position.start + linkData.link.position.end;
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
			if (urlRegEx.test(linkData.link.content)) {
				if (!(linkData.text && linkData.text.content !== "")) {
					const notice = this.obsidianProxy.createNotice("Getting title ...", 0);
					try {
						text = await getPageTitle(new URL(linkData.link.content), this.getPageText.bind(this));
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
				text = getFileName(decodeURI(linkData.link?.content));
			}
			const textStart = linkData.position.start + 1;
			editor.setSelection(editor.offsetToPos(textStart));
			editor.replaceSelection(text);
			editor.setSelection(editor.offsetToPos(textStart), editor.offsetToPos(textStart + text.length));
		}
	}

	//TODO: refactor
	getLink(editor: Editor): LinkData | undefined {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		return findLink(text, cursorOffset, cursorOffset)
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
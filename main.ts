import { Editor, MarkdownView, Plugin } from 'obsidian';
import { findLink, replaceAllHtmlLinks, LinkTypes, ILinkData, removeHtmlLinksFromHeadings } from './utils';

export default class ObsidianLinksPlugin extends Plugin {

	async onload() {

		this.addCommand({
			id: 'links-editor-remove-link',
			name: 'Remove link',
			editorCallback: (editor: Editor, view: MarkdownView) => this.removeLinkUnderCursor(editor, view)
		});

		this.addCommand({
			id: 'links-editor-convert-link-to-mdlink',
			name: 'Convert link to Markdown link',
			editorCallback: (editor: Editor, view: MarkdownView) => this.convertSelectedLinkToMarkdownLink(editor, view)
		});

		this.addCommand({
			id: 'links-editor-copy-link-to-clipboard',
			name: 'Copy link to clipboard',
			editorCallback: (editor: Editor, view: MarkdownView) => this.copyLinkToClipboard(editor, view)
		});

		this.addCommand({
			id: 'links-editor-convert-link-to-wikilink',
			name: 'Convert link to Wikilink',
			editorCallback: (editor: Editor, view: MarkdownView) => this.convertSelectedLinkToWikilink(editor, view)
		});

		this.addCommand({
			id: 'links-editor-remove-links-from-headings',
			name: 'Remove links from headings',
			editorCallback: (editor: Editor, view: MarkdownView) => this.removeLinksFromHeadings(editor, view)
		});

		// this.registerEvent(
		// 	this.app.workspace.on("file-open", this.convertHtmlLinksToMdLinks)
		// )

		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				const linkData = this.getLink(editor);
				if (!linkData) {
					return;
				}
				console.log(linkData.type);
				if (linkData.type == LinkTypes.Markdown) {
					menu.addItem((item) => {
						item
							.setTitle("Convert to wikilink")
							.setIcon("rotate-cw")
							.onClick(async () => {
								this.convertLinkToWikiLink(linkData, editor);
							});
					});
				} else {
					menu.addItem((item) => {
						item
							.setTitle("Convert to markdown link")
							.setIcon("rotate-cw")
							.onClick(async () => {
								this.convertLinkToMarkdownLink(linkData, editor);
							});
					});
				}
				menu.addItem((item) => {
					item
						.setTitle("Remove link")
						.setIcon("trash-2")
						.onClick(async () => {
							this.removeLink(linkData, editor);
						});
				});

			})
		);
	}

	onunload() {

	}

	getLink(editor: Editor): ILinkData | undefined {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		return findLink(text, cursorOffset, cursorOffset);
	}


	removeLinkUnderCursor(editor: Editor, view: MarkdownView) {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset);
		if (linkData) {
			this.removeLink(linkData, editor);
		}
	}

	removeLink(linkData: ILinkData, editor: Editor) {
		editor.replaceRange(
			linkData.text,
			editor.offsetToPos(linkData.startIdx),
			editor.offsetToPos(linkData.endIdx));
	}

	convertSelectedLinkToMarkdownLink(editor: Editor, view: MarkdownView) {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Wiki | LinkTypes.Html);
		if (linkData) {
			this.convertLinkToMarkdownLink(linkData, editor);
		}
	}

	convertLinkToMarkdownLink(linkData: ILinkData, editor: Editor) {
		editor.replaceRange(
			`[${linkData.text}](${encodeURI(linkData.link)})`,
			editor.offsetToPos(linkData.startIdx),
			editor.offsetToPos(linkData.endIdx));
	}

	convertSelectedLinkToWikilink(editor: Editor, view: MarkdownView) {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Markdown | LinkTypes.Html);
		if (linkData) {
			this.convertLinkToWikiLink(linkData, editor);
		}
	}

	convertLinkToWikiLink(linkData: ILinkData, editor: Editor) {
		const link = linkData.type === LinkTypes.Markdown ? decodeURI(linkData.link) : linkData.link;
		const linkText = linkData.text !== link ? "|" + linkData.text : "";
		editor.replaceRange(
			`[[${link}${linkText}]]`,
			editor.offsetToPos(linkData.startIdx),
			editor.offsetToPos(linkData.endIdx));
	}

	copyLinkToClipboard(editor: Editor, view: MarkdownView) {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset);
		if (linkData) {
			navigator.clipboard.writeText(linkData.rawText);
		}
	}

	convertHtmlLinksToMdLinks = () => {
		const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (mdView && mdView.getViewData()) {
			const text = mdView.getViewData();
			const result = replaceAllHtmlLinks(text)
			mdView.setViewData(result, false);
		}
	}

	removeLinksFromHeadings(editor: Editor, view: MarkdownView){
		const selection = editor.getSelection();

		if(selection){
			const result = removeHtmlLinksFromHeadings(selection);
			editor.replaceSelection(result);
		} else{
			const text = editor.getValue();
			if(text){
				const result = removeHtmlLinksFromHeadings(text);
				editor.setValue(result);
			}
		}
	}
}



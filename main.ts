import { App, Editor, MarkdownFileInfo, MarkdownView, Notice, Plugin, PluginManifest, PluginSettingTab, Setting, TAbstractFile, htmlToMarkdown, requestUrl, moment } from 'obsidian';
import { findLink, replaceAllHtmlLinks, LinkTypes, LinkData, removeLinksFromHeadings, getPageTitle, getLinkTitles, getFileName, replaceMarkdownTarget, HasLinksInHeadings, removeExtention, HasLinks, removeLinks } from './utils';
import { LinkTextSuggest } from 'suggesters/LinkTextSuggest';
import { ILinkTextSuggestContext } from 'suggesters/ILinkTextSuggestContext';
import { ReplaceLinkModal } from 'ui/ReplaceLinkModal';
import { RegExPatterns } from 'RegExPatterns';


interface IObsidianLinksSettings {
	linkReplacements: { source: string, target: string }[];
	titleSeparator: string;
	showPerformanceNotification: boolean;
	// feature flags
	ffReplaceLink: boolean;
	contexMenu: {
		editLinkText: boolean;
		addLinkText: boolean;
		editLinkDestination: boolean;
		copyLinkDestination: boolean;
		unlink: boolean;
		convertToWikilink: boolean;
		convertToAutolink: boolean;
		convertToMakrdownLink: boolean;
		replaceLink: boolean;
		embedUnembedLink: boolean;
		deleteLink: boolean;
		createLink: boolean;
		createLinkFromClipboard: boolean;
	}
}

const DEFAULT_SETTINGS: IObsidianLinksSettings = {
	linkReplacements: [],
	titleSeparator: " • ",
	showPerformanceNotification: false,
	//feature flags
	ffReplaceLink: false,
	contexMenu: {
		editLinkText: true,
		addLinkText: true,
		editLinkDestination: true,
		copyLinkDestination: true,
		unlink: true,
		convertToWikilink: true,
		convertToAutolink: true,
		convertToMakrdownLink: true,
		replaceLink: true,
		embedUnembedLink: true,
		deleteLink: true,
		createLink: true,
		createLinkFromClipboard: true
	}
}

export default class ObsidianLinksPlugin extends Plugin {
	settings: IObsidianLinksSettings;

	readonly EmailScheme: string = "mailto:";
	generateLinkTextOnEdit = true;
	linkTextSuggestContext: ILinkTextSuggestContext;


	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest)

		this.linkTextSuggestContext = {
			app: app,
			titleSeparator: " • ",
			titles: [],
			provideSuggestions: false,

			setLinkData(linkData: LinkData, titles: string[]) {
				this.linkData = linkData;
				this.titles = titles;
				this.provideSuggestions = true;
			},

			clearLinkData() {
				this.provideSuggestions = false;
				this.linkData = undefined;
				this.titles = [];
			}

		};
	}

	measurePerformance(func: Function): number {
		const start = moment();
		try {
			func();
		}
		finally {
			return moment().diff(start);
		}
	}

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new ObsidianLinksSettingTab(this.app, this));

		this.registerEditorSuggest(new LinkTextSuggest(this.linkTextSuggestContext));

		this.addCommand({
			id: 'editor-unlink-link',
			name: 'Unlink',
			icon: "unlink",
			editorCheckCallback: (checking, editor, ctx) => this.unlinkLinkOrSelectionHandler(editor, checking)
		});

		this.addCommand({
			id: 'editor-delete-link',
			name: 'Delete link',
			icon: "trash-2",
			editorCheckCallback: (checking, editor, ctx) => this.deleteLinkUnderCursorHandler(editor, checking)
		});

		this.addCommand({
			id: 'editor-convert-link-to-mdlink',
			name: 'Convert to Markdown link',
			icon: "rotate-cw",
			editorCheckCallback: (checking, editor, ctx) => this.convertLinkUnderCursorToMarkdownLinkHandler(editor, checking)
		});

		this.addCommand({
			id: 'editor-convert-link-to-wikilink',
			name: 'Convert to Wikilink',
			icon: "rotate-cw",
			editorCheckCallback: (checking, editor, ctx) => this.convertLinkUnderCursorToWikilinkHandler(editor, checking)
		});

		this.addCommand({
			id: 'editor-convert-link-to-autolink',
			name: 'Convert to Autolink',
			icon: "rotate-cw",
			editorCheckCallback: (checking, editor, ctx) => this.convertLinkUnderCursorToAutolinkHandler(editor, checking)
		});

		this.addCommand({
			id: 'editor-copy-link-to-clipboard',
			name: 'Copy link destination',
			icon: "copy",
			editorCheckCallback: (checking, editor, ctx) => this.copyLinkUnderCursorToClipboardHandler(editor, checking)
		});

		this.addCommand({
			id: 'editor-remove-links-from-headings',
			name: 'Remove links from headings',
			icon: "unlink",
			editorCheckCallback: (checking, editor, ctx) => this.removeLinksFromHeadingsHandler(editor, checking)
		});

		this.addCommand({
			id: 'editor-edit-link-text',
			name: 'Edit link text',
			icon: "text-cursor-input",
			editorCheckCallback: (checking, editor, ctx) => this.editLinkTextUnderCursorHandler(editor, checking)
		});

		this.addCommand({
			id: 'editor-add-link-text',
			name: 'Add link text',
			icon: "text-cursor-input",
			editorCheckCallback: (checking, editor, ctx) => this.addLinkTextUnderCursorHandler(editor, checking)
		});

		this.addCommand({
			id: 'editor-edit-link-destination',
			name: 'Edit link destination',
			icon: "text-cursor-input",
			editorCheckCallback: (checking, editor, ctx) => this.editLinkDestinationUnderCursorHandler(editor, checking)
		});

		if (this.settings.ffReplaceLink) {
			this.addCommand({
				id: 'editor-replace-external-link-with-internal',
				name: 'Replace link',
				icon: "pencil",
				editorCheckCallback: (checking, editor, ctx) => this.replaceExternalLinkUnderCursorHandler(editor, checking)
			});
		}

		this.addCommand({
			id: 'editor-create-link-from-selection',
			name: 'Create link',
			icon: "link",
			editorCheckCallback: (checking, editor, ctx) => this.createLinkFromSelectionHandler(editor, checking)
		});

		this.addCommand({
			id: 'editor-create-link-from-clipboard',
			name: 'Create link from clipboard',
			icon: "link",
			editorCheckCallback: (checking, editor, ctx) => this.createLinkFromClipboardHandler(editor, checking)
		});

		this.addCommand({
			id: 'editor-unembed-mdlink',
			name: 'Unembed link',
			icon: "file-output",
			editorCheckCallback: (checking, editor, ctx) => this.unembedLinkUnderCursorHandler(editor, checking)
		});

		this.addCommand({
			id: 'editor-embed-mdlink',
			name: 'Embed link',
			icon: "file-input",
			editorCheckCallback: (checking, editor, ctx) => this.embedLinkUnderCursorHandler(editor, checking)
		});


		// this.registerEvent(
		// 	this.app.workspace.on("file-open", this.convertHtmlLinksToMdLinks)
		// )

		if (this.settings.ffReplaceLink) {
			this.registerEvent(
				this.app.workspace.on("file-open", (file) => this.replaceMarkdownTargetsInNote())
			)
			this.registerEvent(
				this.app.vault.on("delete", (file) => this.deleteFileHandler(file))
			);

			this.registerEvent(
				this.app.vault.on("rename", (file, oldPath) => this.renameFileHandler(file, oldPath))
			);

			this.registerEvent(
				this.app.workspace.on('editor-paste', (evt, editor, view) => this.onEditorPaste(evt, editor, view))
			);

			//TODO: temp command.
			this.addCommand({
				id: 'editor-replace-markdown-targets-in-note',
				name: '#Replace markdown link in notes',
				editorCallback: (editor: Editor, view: MarkdownView) => this.replaceMarkdownTargetsInNote()
			});
		}

		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				const linkData = this.getLink(editor);
				const selection = editor.getSelection();
				let addTopSeparator = function () {
					menu.addSeparator();
					addTopSeparator = function () { };
				}

				if (linkData) {
					addTopSeparator();
					if (this.settings.contexMenu.editLinkText && linkData.text && linkData.text.content.length > 0) {
						menu.addItem((item) => {
							item
								.setTitle("Edit link text")
								.setIcon("text-cursor-input")
								.onClick(async () => {
									this.editLinkText(linkData, editor);
								});
						});
					} else if (this.settings.contexMenu.addLinkText && linkData.link && ((linkData.type & (LinkTypes.Wiki | LinkTypes.Markdown)) != 0)) {
						menu.addItem((item) => {
							item
								.setTitle("Add link text")
								.setIcon("text-cursor-input")
								.onClick(async () => {
									this.addLinkText(linkData, editor);
								});
						});
					}

					if (this.settings.contexMenu.editLinkDestination && ((linkData.type & (LinkTypes.Wiki | LinkTypes.Markdown)) != 0) && linkData.link) {
						menu.addItem((item) => {
							item
								.setTitle("Edit link destination")
								.setIcon("text-cursor-input")
								.onClick(async () => {
									this.editLinkDestination(linkData, editor);
								});
						});
					}

					if (this.settings.contexMenu.copyLinkDestination && linkData.link) {
						menu.addItem((item) => {
							item
								.setTitle("Copy link destination")
								.setIcon("copy")
								.onClick(async () => {
									this.copyLinkUnderCursorToClipboard(linkData);
								});
						});
					}
				}

				if (this.settings.contexMenu.unlink && ((linkData && ((linkData.type & LinkTypes.Autolink) == 0)) || (selection && HasLinks(selection)))) {
					addTopSeparator();
					menu.addItem((item) => {
						item
							.setTitle("Unlink")
							.setIcon("unlink")
							.onClick(() => {
								if (selection && HasLinks(selection)) {
									this.removeLinksFromSelection(editor, selection);
								} else if (linkData) {
									this.unlinkLink(linkData, editor);
								}
							});
					});
				}

				if (linkData) {
					addTopSeparator();
					if (linkData.type == LinkTypes.Markdown) {
						if (this.settings.contexMenu.convertToWikilink && this.convertLinkUnderCursorToWikilinkHandler(editor, true)) {
							menu.addItem((item) => {
								item
									.setTitle("Convert to wikilink")
									.setIcon("rotate-cw")
									.onClick(async () => {
										this.convertLinkToWikiLink(linkData, editor);
									});
							});
						}

						if (this.settings.contexMenu.convertToAutolink && this.convertLinkUnderCursorToAutolinkHandler(editor, true)) {
							menu.addItem((item) => {
								item
									.setTitle("Convert to autolink")
									.setIcon("rotate-cw")
									.onClick(async () => {
										this.convertLinkToAutolink(linkData, editor);
									});
							});
						}

						if (this.settings.ffReplaceLink && this.settings.contexMenu.replaceLink) {
							menu.addItem((item) => {
								item
									.setTitle("Replace link")
									.setIcon("pencil")
									.onClick(async () => {
										this.replaceExternalLink(linkData, editor);
									});
							});
						}
					} else {
						if (this.settings.contexMenu.convertToMakrdownLink) {
							menu.addItem((item) => {
								item
									.setTitle("Convert to markdown link")
									.setIcon("rotate-cw")
									.onClick(async () => {
										this.convertLinkToMarkdownLink(linkData, editor);
									});
							});
						}
					}

					if (this.settings.contexMenu.embedUnembedLink && this.unembedLinkUnderCursorHandler(editor, true)) {
						menu.addItem((item) => {
							item
								.setTitle("Unembed")
								.setIcon("file-output")
								.onClick(async () => {
									this.unembedLinkUnderCursorHandler(editor);
								});
						});
					}

					if (this.settings.contexMenu.embedUnembedLink && this.embedLinkUnderCursorHandler(editor, true)) {
						menu.addItem((item) => {
							item
								.setTitle("Embed")
								.setIcon("file-input")
								.onClick(async () => {
									this.embedLinkUnderCursorHandler(editor);
								});
						});
					}

					if (this.settings.contexMenu.deleteLink) {
						menu.addItem((item) => {
							item
								.setTitle("Delete")
								.setIcon("trash-2")
								.onClick(async () => {
									this.deleteLink(linkData, editor);
								});
						});
					}

				} else {
					addTopSeparator();
					if (this.settings.contexMenu.createLink && this.createLinkFromSelectionHandler(editor, true)) {
						menu.addItem((item) => {
							item
								.setTitle("Create link")
								.setIcon("link")
								.onClick(async () => {
									this.createLinkFromSelectionHandler(editor);
								});
						});
					}
					if (this.settings.contexMenu.createLinkFromClipboard && this.createLinkFromClipboardHandler(editor, true)) {
						menu.addItem((item) => {
							item
								.setTitle("Create link from clipboard")
								.setIcon("link")
								.onClick(async () => {
									this.createLinkFromClipboardHandler(editor);
								});
						});
					}
				}

			})
		);


	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

		this.linkTextSuggestContext.titleSeparator = this.settings.titleSeparator;
	}

	async saveSettings() {
		await this.saveData(this.settings);

		this.linkTextSuggestContext.titleSeparator = this.settings.titleSeparator;
	}

	getLink(editor: Editor): LinkData | undefined {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		return findLink(text, cursorOffset, cursorOffset)
	}

	unlinkLinkOrSelectionHandler(editor: Editor, checking: boolean): boolean | void {
		const selection = editor.getSelection();
		if (selection) {
			if (checking) {
				return HasLinks(selection);
			}
			this.removeLinksFromSelection(editor, selection);

		} else {
			const text = editor.getValue();
			const cursorOffset = editor.posToOffset(editor.getCursor('from'));
			const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Wiki | LinkTypes.Html | LinkTypes.Markdown)
			if (checking) {
				return !!linkData;
			}
			if (linkData) {
				this.unlinkLink(linkData, editor);
			}
		}
	}

	removeLinksFromSelection(editor: Editor, selection: string) {
		const unlinkedText = removeLinks(selection);
		editor.replaceSelection(unlinkedText);
	}

	unlinkLink(linkData: LinkData, editor: Editor) {
		let text = linkData.text ? linkData.text.content : "";
		if (linkData.type === LinkTypes.Wiki && !text) {
			text = linkData.link ? linkData.link.content : "";
		}
		editor.replaceRange(
			text,
			editor.offsetToPos(linkData.position.start),
			editor.offsetToPos(linkData.position.end));
	}

	deleteLinkUnderCursorHandler(editor: Editor, checking: boolean): boolean | void {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Wiki | LinkTypes.Markdown | LinkTypes.Html);
		if (checking) {
			return !!linkData;
		}
		if (linkData) {
			this.deleteLink(linkData, editor);
		}
	}

	deleteLink(linkData: LinkData, editor: Editor) {
		editor.replaceRange(
			'',
			editor.offsetToPos(linkData.position.start),
			editor.offsetToPos(linkData.position.end));
	}

	convertLinkUnderCursorToMarkdownLinkHandler(editor: Editor, checking: boolean): boolean | void {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Wiki | LinkTypes.Html | LinkTypes.Autolink)
		if (checking) {
			return !!linkData;
		}
		if (linkData) {
			this.convertLinkToMarkdownLink(linkData, editor);
		}
	}

	async convertLinkToMarkdownLink(linkData: LinkData, editor: Editor) {
		let text = linkData.text ? linkData.text.content : "";
		const link = linkData.link ? linkData.link.content : "";

		if (linkData.type === LinkTypes.Wiki && !text) {
			text = link;
		}

		let destination = "";

		const urlRegEx = /^(http|https):\/\/[^ "]+$/i;
		if (linkData.type === LinkTypes.Autolink && linkData.link && urlRegEx.test(linkData.link.content)) {
			const notice = new Notice("Getting title ...", 0);
			try {
				text = await getPageTitle(new URL(linkData.link.content), this.getPageText);
			}
			catch (error) {
				new Notice(error);
			}
			finally {
				notice.hide();
			}
		}

		let rawLinkText = "";
		if (linkData.type === LinkTypes.Autolink && linkData.link && RegExPatterns.Email.test(linkData.link.content)) {
			rawLinkText = `[${text}](${this.EmailScheme}${linkData.link.content})`;
		} else {
			destination = encodeURI(link);
			if (destination && linkData.type === LinkTypes.Wiki && (destination.indexOf("%20") > 0)) {
				destination = `<${destination.replace(/%20/g, " ")}>`;
			}

			//TODO: use const for !
			const embededSymbol = linkData.embeded ? '!' : ''
			rawLinkText = `${embededSymbol}[${text}](${destination})`
		}

		editor.replaceRange(
			rawLinkText,
			editor.offsetToPos(linkData.position.start),
			editor.offsetToPos(linkData.position.end));
		if (text) {
			editor.setCursor(editor.offsetToPos(linkData.position.start + rawLinkText.length));
		} else {
			editor.setCursor(editor.offsetToPos(linkData.position.start + 1));
		}
	}

	convertLinkUnderCursorToWikilinkHandler(editor: Editor, checking: boolean): boolean | void {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Markdown | LinkTypes.Html);
		if (checking) {
			return !!linkData && linkData.link && !linkData.link.content.trim().startsWith(this.EmailScheme);
		}

		if (linkData) {
			this.convertLinkToWikiLink(linkData, editor);
		}
	}

	convertLinkToWikiLink(linkData: LinkData, editor: Editor) {
		const link = linkData.type === LinkTypes.Markdown ? (linkData.link ? decodeURI(linkData.link.content) : "") : linkData.link;
		const text = linkData.text ? (linkData.text.content !== link ? "|" + linkData.text.content : "") : "";
		//TODO: use const for !
		const embededSymbol = linkData.embeded ? '!' : '';
		const rawText = `${embededSymbol}[[${link}${text}]]`;
		editor.replaceRange(
			rawText,
			editor.offsetToPos(linkData.position.start),
			editor.offsetToPos(linkData.position.end));
	}

	convertLinkUnderCursorToAutolinkHandler(editor: Editor, checking: boolean): boolean | void {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Markdown);
		if (checking) {
			return !!linkData
				&& linkData.link?.content != undefined
				&& (RegExPatterns.AbsoluteUri.test(linkData.link.content)
					|| linkData.link.content.startsWith(this.EmailScheme))
		}
		if (linkData) {
			this.convertLinkToAutolink(linkData, editor);
		}
	}

	async convertLinkToAutolink(linkData: LinkData, editor: Editor) {
		if (linkData.type === LinkTypes.Markdown
			&& linkData.link?.content) {
			let rawLinkText;
			if (linkData.link.content.startsWith(this.EmailScheme)) {
				rawLinkText = `<${linkData.link.content.substring(this.EmailScheme.length)}>`;
			} else if (RegExPatterns.AbsoluteUri.test(linkData.link.content)) {
				rawLinkText = `<${linkData.link.content}>`;
			}

			if (rawLinkText) {
				editor.replaceRange(
					rawLinkText,
					editor.offsetToPos(linkData.position.start),
					editor.offsetToPos(linkData.position.end));

				editor.setCursor(editor.offsetToPos(linkData.position.start + rawLinkText.length));
			}
		}
	}

	copyLinkUnderCursorToClipboardHandler(editor: Editor, checking: boolean): boolean | void {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Wiki | LinkTypes.Markdown | LinkTypes.Html);
		if (checking) {
			return !!linkData && !!linkData.link;
		}
		if (linkData) {
			this.copyLinkUnderCursorToClipboard(linkData);
		}
	}

	copyLinkUnderCursorToClipboard(linkData: LinkData) {
		if (linkData?.link) {
			navigator.clipboard.writeText(linkData.link?.content);
			new Notice("Link destination copied to your clipboard");
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

	removeLinksFromHeadingsHandler(editor: Editor, checking: boolean): boolean | void {
		const selection = editor.getSelection();

		if (selection) {
			if (checking) {
				return HasLinksInHeadings(selection);
			}
			const result = removeLinksFromHeadings(selection);
			editor.replaceSelection(result);
		} else {
			const text = editor.getValue();
			if (checking) {
				return !!text && HasLinksInHeadings(text);
			}
			if (text) {
				const result = removeLinksFromHeadings(text);
				editor.setValue(result);
			}
		}
	}

	editLinkTextUnderCursorHandler(editor: Editor, checking: boolean): boolean | void {
		const linkData = this.getLink(editor);
		if (checking) {
			return !!linkData && !!linkData.text;
		}

		if (linkData) {
			// workaround: if executed from command palette, whole link is selected.
			// with timeout, only specified region is selected.
			setTimeout(() => {
				this.editLinkText(linkData, editor);
			}, 500);
		}
	}

	editLinkText(linkData: LinkData, editor: Editor) {
		if (linkData.text) {
			const start = linkData.position.start + linkData.text.position.start;
			const end = linkData.position.start + linkData.text.position.end;
			editor.setSelection(editor.offsetToPos(start), editor.offsetToPos(end));
		} else if (this.generateLinkTextOnEdit) {
			//TODO: 
		}
	}

	editLinkDestinationUnderCursorHandler(editor: Editor, checking: boolean): boolean | void {
		const linkData = this.getLink(editor);
		if (checking) {
			return !!linkData
				&& ((linkData.type & (LinkTypes.Wiki | LinkTypes.Markdown)) != 0)
				&& !!linkData.link;
		}


		if (linkData) {
			// workaround: if executed from command palette, whole link is selected.
			// with timeout, only specified region is selected.
			setTimeout(() => {
				this.editLinkDestination(linkData, editor);
			}, 500);
		}
	}

	editLinkDestination(linkData: LinkData, editor: Editor) {
		if (linkData.link) {
			const start = linkData.position.start + linkData.link.position.start;
			const end = linkData.position.start + linkData.link.position.end;
			editor.setSelection(editor.offsetToPos(start), editor.offsetToPos(end));
		} else if (this.generateLinkTextOnEdit) {
			//TODO: 
		}
	}

	showLinkTextSuggestions(linkData: LinkData, editor: Editor): boolean {
		const titles = getLinkTitles(linkData);

		if (titles.length == 0) {
			return false;
		}
		this.linkTextSuggestContext.setLinkData(linkData, titles);

		//trigger suggest
		const posLinkEnd = editor.offsetToPos(linkData.position.end);
		editor.setCursor(posLinkEnd);
		editor.replaceRange(" ", posLinkEnd);
		editor.replaceRange("", posLinkEnd, editor.offsetToPos(linkData.position.end + 1));

		return true;
	}

	async addLinkText(linkData: LinkData, editor: Editor) {
		if (!linkData.link || (linkData.text && linkData.text.content !== "")) {
			return;
		}

		if (linkData.type == LinkTypes.Wiki) {
			if (this.showLinkTextSuggestions(linkData, editor)) {
				return;
			}
			const text = getFileName(linkData.link?.content);
			let textStart = linkData.position.start + linkData.link.position.end;
			if (linkData.text) {
				editor.replaceRange("|" + text, editor.offsetToPos(textStart), editor.offsetToPos(textStart + 1));
			} else {
				editor.replaceRange("|" + text, editor.offsetToPos(textStart));
			}
			textStart++;
			editor.setSelection(editor.offsetToPos(textStart), editor.offsetToPos(textStart + text.length));
		} else if (linkData.type == LinkTypes.Markdown) {
			const urlRegEx = /^(http|https):\/\/[^ "]+$/i;
			let text = "";
			if (urlRegEx.test(linkData.link.content)) {
				const notice = new Notice("Getting title ...", 0);
				try {
					text = await getPageTitle(new URL(linkData.link.content), this.getPageText);
				}
				catch (error) {
					new Notice(error);
				}
				finally {
					notice.hide();
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

	addLinkTextUnderCursorHandler(editor: Editor, checking: boolean): boolean | void {
		const linkData = this.getLink(editor);
		if (checking) {
			return !!linkData
				&& ((linkData.type & (LinkTypes.Markdown | LinkTypes.Wiki)) != 0)
				&& (!linkData.text || !linkData?.text.content);
		}
		if (linkData) {
			// workaround: if executed from command palette, whole link is selected.
			// with timeout, only specified region is selected.
			setTimeout(() => {
				this.addLinkText(linkData, editor);
			}, 500);
		}
	}

	async getPageText(url: URL): Promise<string> {
		const response = await requestUrl({ url: url.toString() });
		if (response.status !== 200) {
			throw new Error(`Failed to request '${url}': ${response.status}`);
		}
		return response.text;
	}

	replaceExternalLinkUnderCursorHandler(editor: Editor, checking: boolean): boolean | void {
		const linkData = this.getLink(editor);
		if (checking) {
			return !!linkData;
		}
		if (linkData) {
			this.replaceExternalLink(linkData, editor);
		}
	}

	replaceExternalLink(linkData: LinkData, editor: Editor) {
		new ReplaceLinkModal(this.app, async (path) => {
			if (path) {
				this.settings.linkReplacements.push({
					source: linkData.link!.content,
					target: path
				})
				await this.saveSettings();
				this.replaceMarkdownTargetsInNote();
			}
		}).open();
	}

	escapeRegex(str: string): string {
		return str.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
	}

	replaceMarkdownTargetsInNote() {
		const e = this.measurePerformance(() => {
			const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (mdView && mdView.getViewData()) {
				const text = mdView.getViewData();
				const [result, count] = this.replaceLinksInText(text)
				if (count) {
					mdView.setViewData(result, false);
					new Notice(`Links: ${count} items replaced.`);
				}
			}
		});
		if (this.settings.showPerformanceNotification) {
			new Notice(`${e} ms`);
		}
	}


	replaceLinksInText(text: string): [string, number] {
		let targetText = text;
		let totalCount = 0;
		this.settings.linkReplacements.forEach(e => {
			const [newText, count] = replaceMarkdownTarget(targetText, e.source, e.target);
			targetText = newText;
			totalCount += count;
		});
		return [targetText, totalCount];
	}

	createLinkFromSelectionHandler(editor: Editor, checking = false): boolean | void {
		const selection = editor.getSelection();

		if (checking) {
			return !!selection;
		}

		const linkStart = editor.posToOffset(editor.getCursor('from'));
		editor.replaceSelection(`[[|${selection}]]`);
		editor.setCursor(editor.offsetToPos(linkStart + 2));
	}

	onEditorPaste(evt: ClipboardEvent, editor: Editor, view: MarkdownView | MarkdownFileInfo) {
		const html = evt.clipboardData?.getData('text/html');
		if (html && html.indexOf('<a') > 0) {
			const markdown = htmlToMarkdown(html);
			const [text, count] = this.replaceLinksInText(markdown);
			if (count) {
				evt.preventDefault();
				const fromOffset = editor.posToOffset(editor.getCursor('from'));
				if (editor.getSelection()) {
					editor.replaceSelection(text);
				} else {
					editor.replaceRange(text, editor.getCursor('from'));
				}
				editor.setCursor(editor.offsetToPos(fromOffset + text.length));
			}
		}
	}


	deleteFileHandler(file: TAbstractFile) {
		const [pathWithoutExtention, success] = removeExtention(file.path);
		if (!success) {
			return;
		}

		const replacements = this.settings.linkReplacements.filter(r => {
			const hashIdx = r.target.indexOf('#');
			return hashIdx > 0 ?
				r.target.substring(0, hashIdx) !== pathWithoutExtention
				: r.target !== pathWithoutExtention;
		});
		this.settings.linkReplacements = replacements;
		this.saveSettings();
	}

	renameFileHandler(file: TAbstractFile, oldPath: string) {
		const [oldPathWithoutExtention, success] = removeExtention(oldPath);
		if (!success) {
			return;
		}

		let settingsChanged = false;
		this.settings.linkReplacements.forEach(r => {
			const hashIdx = r.target.indexOf('#');
			const targetPath = hashIdx > 0 ? r.target.substring(0, hashIdx) : r.target;
			if (targetPath === oldPathWithoutExtention) {
				const [newPathWithoutExtension] = removeExtention(file.path);
				r.target = hashIdx > 0 ?
					newPathWithoutExtension + r.target.substring(hashIdx) : newPathWithoutExtension;
				settingsChanged = true;
			}
		});
		if (settingsChanged) {
			this.saveSettings();
		}
	}

	createLinkFromClipboardHandler(editor: Editor, checking = false): boolean | void {
		// TODO: no check for now
		if (checking) {
			return true;
		}

		(async () => {
			const urlRegEx = /^(http|https):\/\/[^ "]+$/i;
			const linkDestination = await navigator.clipboard.readText();
			let linkText = linkDestination;
			const selection = editor.getSelection();

			if (selection.length == 0 && urlRegEx.test(linkDestination)) {
				const notice = new Notice("Getting title ...", 0);
				try {
					linkText = await getPageTitle(new URL(linkDestination), this.getPageText);
				}
				catch (error) {
					new Notice(error);
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

		})();
	}

	unembedLinkUnderCursorHandler(editor: Editor, checking: boolean = false): boolean | void {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Wiki | LinkTypes.Markdown);
		if (checking) {
			return !!linkData && linkData.embeded && !!linkData.link;
		}

		if (linkData) {
			this.unembedLinkUnderCursor(linkData, editor);
		}
	}

	unembedLinkUnderCursor(linkData: LinkData, editor: Editor) {
		if (linkData.content && (linkData.type & (LinkTypes.Wiki | LinkTypes.Markdown)) && linkData.embeded) {
			editor.replaceRange(
				linkData.content.substring(1),
				editor.offsetToPos(linkData.position.start),
				editor.offsetToPos(linkData.position.end));
		}
	}

	embedLinkUnderCursorHandler(editor: Editor, checking: boolean = false): boolean | void {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Wiki | LinkTypes.Markdown);
		if (checking) {
			return !!linkData && !linkData.embeded && !!linkData.link;
		}

		if (linkData) {
			this.embedLinkUnderCursor(linkData, editor);
		}
	}

	embedLinkUnderCursor(linkData: LinkData, editor: Editor) {
		if (linkData.content && (linkData.type & (LinkTypes.Wiki | LinkTypes.Markdown)) && !linkData.embeded) {
			editor.replaceRange(
				'!' + linkData.content,
				editor.offsetToPos(linkData.position.start),
				editor.offsetToPos(linkData.position.end));
		}
	}
}

export class ObsidianLinksSettingTab extends PluginSettingTab {
	plugin: ObsidianLinksPlugin;
	constructor(app: App, plugin: ObsidianLinksPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h3', { text: 'General settings' });
		new Setting(containerEl)
			.setName('Title separator')
			.setDesc('String used as headings separator in \'Add link text\' command.')
			.addText(text => text
				.setValue(this.plugin.settings.titleSeparator)
				.onChange(async (value) => {
					this.plugin.settings.titleSeparator = value;
					await this.plugin.saveSettings();
				}));

		// -- Configure context menu
		containerEl.createEl('h3', { text: 'Context menu' });
		new Setting(containerEl)
			.setName('Edit link text')
			.setDesc('')
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.contexMenu.editLinkText)
					.onChange(async (value) => {
						this.plugin.settings.contexMenu.editLinkText = value;
						await this.plugin.saveSettings();
					})

			});
		new Setting(containerEl)
			.setName('Add link text')
			.setDesc('')
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.contexMenu.addLinkText)
					.onChange(async (value) => {
						this.plugin.settings.contexMenu.addLinkText = value;
						await this.plugin.saveSettings();
					})

			});
		new Setting(containerEl)
			.setName('Edit link destination')
			.setDesc('')
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.contexMenu.editLinkDestination)
					.onChange(async (value) => {
						this.plugin.settings.contexMenu.editLinkDestination = value;
						await this.plugin.saveSettings();
					})

			});
		new Setting(containerEl)
			.setName('Copy link destination')
			.setDesc('')
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.contexMenu.copyLinkDestination)
					.onChange(async (value) => {
						this.plugin.settings.contexMenu.copyLinkDestination = value;
						await this.plugin.saveSettings();
					})

			});

		new Setting(containerEl)
			.setName('Unlink')
			.setDesc('')
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.contexMenu.unlink)
					.onChange(async (value) => {
						this.plugin.settings.contexMenu.unlink = value;
						await this.plugin.saveSettings();
					})

			});
		new Setting(containerEl)
			.setName('Convert to wikilink')
			.setDesc('')
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.contexMenu.convertToWikilink)
					.onChange(async (value) => {
						this.plugin.settings.contexMenu.convertToWikilink = value;
						await this.plugin.saveSettings();
					})

			});
		new Setting(containerEl)
			.setName('Convert to autolink')
			.setDesc('')
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.contexMenu.convertToAutolink)
					.onChange(async (value) => {
						this.plugin.settings.contexMenu.convertToAutolink = value;
						await this.plugin.saveSettings();
					})

			});
		new Setting(containerEl)
			.setName('Convert to markdown link')
			.setDesc('')
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.contexMenu.convertToMakrdownLink)
					.onChange(async (value) => {
						this.plugin.settings.contexMenu.convertToMakrdownLink = value;
						await this.plugin.saveSettings();
					})

			});
		if (this.plugin.settings.ffReplaceLink) {
			new Setting(containerEl)
				.setName('Replace link')
				.setDesc('')
				.addToggle((toggle) => {
					toggle
						.setValue(this.plugin.settings.contexMenu.replaceLink)
						.onChange(async (value) => {
							this.plugin.settings.contexMenu.replaceLink = value;
							await this.plugin.saveSettings();
						})

				});
		}
		new Setting(containerEl)
			.setName('Embed/Unembed')
			.setDesc('')
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.contexMenu.embedUnembedLink)
					.onChange(async (value) => {
						this.plugin.settings.contexMenu.embedUnembedLink = value;
						await this.plugin.saveSettings();
					})

			});

		new Setting(containerEl)
			.setName('Delete')
			.setDesc('')
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.contexMenu.deleteLink)
					.onChange(async (value) => {
						this.plugin.settings.contexMenu.deleteLink = value;
						await this.plugin.saveSettings();
					})

			});
		new Setting(containerEl)
			.setName('Create link')
			.setDesc('')
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.contexMenu.createLink)
					.onChange(async (value) => {
						this.plugin.settings.contexMenu.createLink = value;
						await this.plugin.saveSettings();
					})

			});
		new Setting(containerEl)
			.setName('Create link from clipboard')
			.setDesc('')
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.contexMenu.createLinkFromClipboard)
					.onChange(async (value) => {
						this.plugin.settings.contexMenu.createLinkFromClipboard = value;
						await this.plugin.saveSettings();
					})

			});

		// ------ Early access features -----------------

		containerEl.createEl('h3', { text: 'Early access features' });
		const earlyAccessDescription = containerEl.createEl('p');
		earlyAccessDescription.createEl('span', {
			text: "Almost finished features with some "
		});

		earlyAccessDescription.createEl('a', {
			href: 'https://github.com/mii-key/obsidian-links/issues',
			text: 'bugs'
		});

		earlyAccessDescription.createEl('span', {
			text: " to be fixed."
		});

		// ----- Early access feature1

		// new Setting(containerEl)
		// 	.setName("Early access feature1")
		// 	.setDesc("Feature description")
		// 	.setClass("setting-item--eaccess-feature1")
		// 	.addToggle((toggle) => {
		// 		toggle
		// 			.setValue(this.plugin.settings.ffEarlyAccessFeature1)
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.ffEarlyAccessFeature1 = value;
		// 				await this.plugin.saveSettings();
		// 			})
		// 	});

		// const earlyAccessFeature1SettingDesc = containerEl.querySelector(".setting-item--eaccess-feature1 .setting-item-description");
		// if (earlyAccessFeature1SettingDesc) {
		// 	earlyAccessFeature1SettingDesc.appendText(' see ');
		// 	earlyAccessFeature1SettingDesc.appendChild(
		// 		createEl('a', {
		// 			href: 'https://github.com/mii-key/obsidian-links#readme',
		// 			text: 'docs'
		// 		}));
		// 	earlyAccessFeature1SettingDesc.appendText('.');
		// }
		// ----------

		// ------ Insider features -----------------

		containerEl.createEl('h3', { text: 'Insider features' });

		const insiderDescription = containerEl.createEl('p');


		insiderDescription.createEl('span', {
			text: "Incomplete features currently under development. Enable these features to "
		});

		insiderDescription.createEl('a', {
			href: 'https://github.com/mii-key/obsidian-links/issues',
			text: 'provide your input'
		});

		insiderDescription.createEl('span', {
			text: " and influence the direction of development."
		});


		// // feature embed/unembed

		// new Setting(containerEl)
		// 	.setName("Embed/unembed files")
		// 	.setDesc("Adds ability to embed/unembed files.")
		// 	.setClass("setting-item--insider-feature2")
		// 	.addToggle((toggle) => {
		// 		toggle
		// 			.setValue(this.plugin.settings.ffEmbedFiles)
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.ffEmbedFiles = value;
		// 				await this.plugin.saveSettings();
		// 			})

		// 	});

		// const feature2SettingDesc = containerEl.querySelector(".setting-item--insider-feature2 .setting-item-description");

		// if (feature2SettingDesc) {
		// 	feature2SettingDesc.appendText(' see ');
		// 	feature2SettingDesc.appendChild(
		// 		createEl('a', {
		// 			href: 'https://github.com/mii-key/obsidian-links/blob/master/docs/insider/embed-unembed-files.md',
		// 			text: 'docs'
		// 		}));
		// 	feature2SettingDesc.appendText('.');
		// }
	}
}




import { App, Editor, MarkdownFileInfo, MarkdownView, Notice, Plugin, PluginManifest, PluginSettingTab, Setting, TAbstractFile, htmlToMarkdown, requestUrl, moment, RequestUrlParam, RequestUrlResponsePromise } from 'obsidian';
import { findLink, replaceAllHtmlLinks, LinkTypes, LinkData, removeLinksFromHeadings, getPageTitle, getLinkTitles, getFileName, replaceMarkdownTarget, HasLinksInHeadings, removeExtention, HasLinks, removeLinks, findLinks } from './utils';
import { LinkTextSuggest } from 'suggesters/LinkTextSuggest';
import { ILinkTextSuggestContext } from 'suggesters/ILinkTextSuggestContext';
import { ReplaceLinkModal } from 'ui/ReplaceLinkModal';
import { RegExPatterns } from 'RegExPatterns';
import { UnlinkLinkCommand } from 'commands/UnlinkLinkCommand';
import { DeleteLinkCommand } from 'commands/DeleteLinkCommand';
import { ConvertLinkToMdlinkCommand } from 'commands/ConvertLinkToMdlinkCommand';
import { ObsidianProxy } from 'commands/ObsidianProxy';
import { ConvertAllLinksToMdlinksCommand } from 'commands/ConvertAllLinksToMdlinksCommand';
import { ICommand } from 'commands/ICommand';
import { RemoveLinksFromHeadingsCommand } from 'commands/RemoveLinksFromHeadingsCommand';
import { DEFAULT_SETTINGS, IObsidianLinksSettings } from 'settings';
import { ObsidianLinksSettingTab } from 'ObsidianLinksSettingTab';
import { ConvertLinkToWikilinkCommand } from 'commands/ConvertLinkToWikilinkCommand';


export default class ObsidianLinksPlugin extends Plugin {
	settings: IObsidianLinksSettings;
	obsidianProxy: ObsidianProxy;

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

		this.obsidianProxy = new ObsidianProxy();
	}

	createNotice(message: string | DocumentFragment, timeout?: number): Notice {
		return new Notice(message, timeout);
	}

	requestUrl(request: RequestUrlParam | string): RequestUrlResponsePromise {
		return requestUrl(request);
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

		const unlinkCommand = new UnlinkLinkCommand();

		this.addCommand({
			id: unlinkCommand.id,
			name: unlinkCommand.displayNameCommand,
			icon: unlinkCommand.icon,
			editorCheckCallback: (checking, editor, ctx) => unlinkCommand.handler(editor, checking)
		});

		const deleteLinkCommand = new DeleteLinkCommand();
		this.addCommand({
			id: deleteLinkCommand.id,
			name: deleteLinkCommand.displayNameCommand,
			icon: deleteLinkCommand.icon,
			editorCheckCallback: (checking, editor, ctx) => deleteLinkCommand.handler(editor, checking)
		});

		const convertLinkToMdlinkCommand: ICommand = new ConvertLinkToMdlinkCommand(this.obsidianProxy);

		this.addCommand({
			id: convertLinkToMdlinkCommand.id,
			name: convertLinkToMdlinkCommand.displayNameCommand,
			icon: convertLinkToMdlinkCommand.icon,
			editorCheckCallback: (checking, editor, ctx) => convertLinkToMdlinkCommand.handler(editor, checking)
		});

		const convertLinkToWikilinkCommand = new ConvertLinkToWikilinkCommand();

		this.addCommand({
			id: convertLinkToWikilinkCommand.id,
			name: convertLinkToWikilinkCommand.displayNameCommand,
			icon: convertLinkToWikilinkCommand.icon,
			editorCheckCallback: (checking, editor, ctx) => convertLinkToWikilinkCommand.handler(editor, checking)
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

		const settings = this.settings;
		const options = {
			get internalWikilinkWithoutTextReplacement() {
				return settings.removeLinksFromHeadingsInternalWikilinkWithoutTextReplacement;
			} 
		};

		const removeLinksFromHeadingsCommand = new RemoveLinksFromHeadingsCommand(options);

		this.addCommand({
			id: removeLinksFromHeadingsCommand.id,
			name: removeLinksFromHeadingsCommand.displayNameCommand,
			icon: removeLinksFromHeadingsCommand.icon,
			editorCheckCallback: (checking, editor, ctx) => removeLinksFromHeadingsCommand.handler(editor, checking)
		});

		this.addCommand({
			id: 'editor-edit-link-text',
			name: 'Edit link text',
			icon: "text-cursor-input",
			editorCheckCallback: (checking, editor, ctx) => this.editLinkTextUnderCursorHandler(editor, checking)
		});

		this.addCommand({
			id: 'editor-set-link-text',
			name: 'Set link text',
			icon: "text-cursor-input",
			editorCheckCallback: (checking, editor, ctx) => this.setLinkTextUnderCursorHandler(editor, checking)
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

		if (this.settings.ffMultipleLinkConversion) {
			const convertAllLinksToMdlinksCommand = new ConvertAllLinksToMdlinksCommand(this.obsidianProxy)
			this.addCommand({
				id: convertAllLinksToMdlinksCommand.id,
				name: convertAllLinksToMdlinksCommand.displayNameCommand,
				icon: convertAllLinksToMdlinksCommand.icon,
				editorCheckCallback: (checking, editor, ctx) => convertAllLinksToMdlinksCommand.handler(editor, checking)
			});
		}

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

			if (this.settings.ffReplaceLink) {
				//TODO: temp command.
				this.addCommand({
					id: 'editor-replace-markdown-targets-in-note',
					name: '#Replace markdown link in notes',
					editorCallback: (editor: Editor, view: MarkdownView) => this.replaceMarkdownTargetsInNote()
				});
			}
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
					}
					if (this.settings.contexMenu.setLinkText && this.setLinkTextUnderCursorHandler(editor, true)) {
						menu.addItem((item) => {
							item
								.setTitle("Set link text")
								.setIcon("text-cursor-input")
								.onClick(async () => {
									this.setLinkText(linkData, editor);
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

				// TODO: use found link
				if (this.settings.contexMenu.unlink && unlinkCommand.handler(editor, true)) {
					addTopSeparator();
					menu.addItem((item) => {
						item
							.setTitle(unlinkCommand.displayNameContextMenu)
							.setIcon(unlinkCommand.icon)
							.onClick(() => {
								unlinkCommand.handler(editor, false)
							});
					});
				}

				if (linkData) {
					addTopSeparator();
					if (linkData.type == LinkTypes.Markdown) {
						if (this.settings.contexMenu.convertToWikilink && convertLinkToWikilinkCommand.handler(editor, true)) {
							menu.addItem((item) => {
								item
									.setTitle(convertLinkToWikilinkCommand.displayNameContextMenu)
									.setIcon(convertLinkToWikilinkCommand.icon)
									.onClick(async () => {
										convertLinkToWikilinkCommand.handler(editor, false);
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
						if (this.settings.contexMenu.convertToMakrdownLink && convertLinkToMdlinkCommand.handler(editor, true)) {
							menu.addItem((item) => {
								item
									.setTitle(convertLinkToMdlinkCommand.displayNameContextMenu)
									.setIcon(convertLinkToMdlinkCommand.icon)
									.onClick(async () => {
										//TODO: use found link
										convertLinkToMdlinkCommand.handler(editor, false);
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

					//TODO: use found link
					if (this.settings.contexMenu.deleteLink && deleteLinkCommand.handler(editor, true)) {
						menu.addItem((item) => {
							item
								.setTitle(deleteLinkCommand.displayNameContextMenu)
								.setIcon(deleteLinkCommand.icon)
								.onClick(async () => {
									deleteLinkCommand.handler(editor, false);
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

	setLinkTextUnderCursorHandler(editor: Editor, checking: boolean): boolean | void {
		const linkData = this.getLink(editor);
		if (checking) {
			return !!linkData
				&& ((linkData.type & (LinkTypes.Markdown | LinkTypes.Wiki)) != 0)
				&& !!linkData.link?.content
				&& (!linkData.text || !linkData?.text.content || linkData.link.content.contains('#'));
		}
		if (linkData) {
			// workaround: if executed from command palette, whole link is selected.
			// with timeout, only specified region is selected.
			setTimeout(() => {
				this.setLinkText(linkData, editor);
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
			return !!linkData && linkData.embedded && !!linkData.link;
		}

		if (linkData) {
			this.unembedLinkUnderCursor(linkData, editor);
		}
	}

	unembedLinkUnderCursor(linkData: LinkData, editor: Editor) {
		if (linkData.content && (linkData.type & (LinkTypes.Wiki | LinkTypes.Markdown)) && linkData.embedded) {
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
			return !!linkData && !linkData.embedded && !!linkData.link;
		}

		if (linkData) {
			this.embedLinkUnderCursor(linkData, editor);
		}
	}

	embedLinkUnderCursor(linkData: LinkData, editor: Editor) {
		if (linkData.content && (linkData.type & (LinkTypes.Wiki | LinkTypes.Markdown)) && !linkData.embedded) {
			editor.replaceRange(
				'!' + linkData.content,
				editor.offsetToPos(linkData.position.start),
				editor.offsetToPos(linkData.position.end));
		}
	}

}





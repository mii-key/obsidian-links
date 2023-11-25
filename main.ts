import { App, Editor, MarkdownFileInfo, MarkdownView, Notice, Plugin, PluginManifest, TAbstractFile, htmlToMarkdown, requestUrl, moment, RequestUrlParam, RequestUrlResponsePromise } from 'obsidian';
import { findLink, replaceAllHtmlLinks, LinkData, replaceMarkdownTarget, removeExtention, InternalWikilinkWithoutTextAction } from './utils';
import { LinkTextSuggest } from 'suggesters/LinkTextSuggest';
import { ILinkTextSuggestContext } from 'suggesters/ILinkTextSuggestContext';
import { ReplaceLinkModal } from 'ui/ReplaceLinkModal';
import { ObsidianProxy } from 'commands/ObsidianProxy';
import { DEFAULT_SETTINGS, IObsidianLinksSettings } from 'settings';
import { ObsidianLinksSettingTab } from 'ObsidianLinksSettingTab';
import { getContextMenuCommands, getPaletteCommands } from 'commands/Commands';

export default class ObsidianLinksPlugin extends Plugin {
	settings: IObsidianLinksSettings;
	obsidianProxy: ObsidianProxy;

	readonly EmailScheme: string = "mailto:";

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

		// this.obsidianProxy = new ObsidianProxy(this.linkTextSuggestContext, this.settings);
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
		//TODO:
		this.obsidianProxy = new ObsidianProxy(this.app, this.linkTextSuggestContext, this.settings);

		//TODO: remove
		if(this.settings.removeLinksFromHeadingsInternalWikilinkWithoutTextAction === InternalWikilinkWithoutTextAction.None){
			switch(this.settings.removeLinksFromHeadingsInternalWikilinkWithoutTextReplacement){
				case "Destination":
					this.settings.removeLinksFromHeadingsInternalWikilinkWithoutTextAction = InternalWikilinkWithoutTextAction.ReplaceWithDestination;
					break;
				case "LowestNoteHeading":
					this.settings.removeLinksFromHeadingsInternalWikilinkWithoutTextAction = InternalWikilinkWithoutTextAction.ReplaceWithLowestNoteHeading;
					break;
				default:
					this.settings.removeLinksFromHeadingsInternalWikilinkWithoutTextAction = InternalWikilinkWithoutTextAction.ReplaceWithDestination;
			}
			await this.saveSettings();
		}

		this.addSettingTab(new ObsidianLinksSettingTab(this.app, this));

		this.registerEditorSuggest(new LinkTextSuggest(this.linkTextSuggestContext));

		const commands = getPaletteCommands(this.obsidianProxy, this.settings);
		for (let cmd of commands) {
			this.addCommand({
				id: cmd.id,
				name: cmd.displayNameCommand,
				icon: cmd.icon,
				editorCheckCallback: (checking, editor, ctx) => cmd.handler(editor, checking)
			});
		}

		if (this.settings.ffReplaceLink) {
			this.addCommand({
				id: 'editor-replace-external-link-with-internal',
				name: 'Replace link',
				icon: "pencil",
				editorCheckCallback: (checking, editor, ctx) => this.replaceExternalLinkUnderCursorHandler(editor, checking)
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

				const commands = getContextMenuCommands(this.obsidianProxy, this.settings);
				for (const cmd of commands) {
					if (cmd == null) {
						addTopSeparator();
					} else {
						if (cmd.handler(editor, true)) {
							menu.addItem((item) => {
								item
									.setTitle(cmd.displayNameContextMenu)
									.setIcon(cmd.icon)
									.onClick(async () => {
										cmd.handler(editor, false);
									});
							});
						}
					}
				}

				if (linkData) {
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

	convertHtmlLinksToMdLinks = () => {
		const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (mdView && mdView.getViewData()) {
			const text = mdView.getViewData();
			const result = replaceAllHtmlLinks(text)
			mdView.setViewData(result, false);
		}
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
}





import { Editor, EditorPosition, HeadingCache, ListItemCache, SectionCache, TFile } from "obsidian";
import { CommandBase, Func } from "./ICommand"
import { IObsidianProxy } from "./IObsidianProxy";
import { RegExPatterns } from "../RegExPatterns";
import { destinationRequireAngleBrackets } from "../utils";

export class CopyLinkToHeadingToObjectCommand extends CommandBase {


	obsidianProxy: IObsidianProxy;

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled)
		this.id = 'editor-copy-link-to-object-to-clipboard';
		this.displayNameCommand = 'Copy link to element';
		this.displayNameContextMenu = 'Copy link to element';
		this.icon = 'copy';
		this.obsidianProxy = obsidianProxy;

		this.isEnabled = () => this.obsidianProxy.settings.ffCopyLinkToObject;
		this.isPresentInContextMenu = () => this.obsidianProxy.settings.ffCopyLinkToObject && this.obsidianProxy.settings.contexMenu.copyLinkToHeadingToClipboard;
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}
		const text = editor.getLine(editor.getCursor('from').line);
		const headingMatch = text.match(new RegExp(RegExPatterns.NoteHeading.source));
		const currentView = this.obsidianProxy.Vault.getActiveNoteView();
		const block = headingMatch ? undefined : currentView?.file ? this.getBlock(editor, currentView?.file) : undefined;

		if (checking) {
			return !!headingMatch || !!block;
		}
		const currentNotePath = currentView?.file?.path;

		if (headingMatch && headingMatch[1] && currentNotePath) {
			console.log(currentNotePath);
			this.copyLinkToHeadingUnderCursorToClipboard(headingMatch[1], currentNotePath);
		} else if (block && currentView?.file) {
			this.copyLinkToBlockUnderCursorToClipboard(currentView?.file, editor, block as SectionCache | ListItemCache);
		}
	}

	copyLinkToHeadingUnderCursorToClipboard(heading: string, notePath: string) {
		let destination = `${notePath}#${heading}`;
		if (destinationRequireAngleBrackets(destination)) {
			destination = `<${destination}>`;
		}
		const rawLink = `[${heading}](${destination})`;
		// navigator.clipboard.writeText(linkData.link?.content);
		this.obsidianProxy.clipboardWriteText(rawLink);
		this.obsidianProxy.createNotice("Link copied to your clipboard");
	}

	copyLinkToBlockUnderCursorToClipboard(
		file: TFile,
		editor: Editor,
		block: ListItemCache | SectionCache
	) {
		if (block.id) {
			return this.obsidianProxy.clipboardWriteText(
				`${this.obsidianProxy.app.fileManager.generateMarkdownLink(
					file,
					"",
					"#^" + block.id
				)}`
			);
		}

		const sectionEnd = block.position.end;
		const end: EditorPosition = {
			ch: sectionEnd.col,
			line: sectionEnd.line,
		};

		const id = this.generateId();

		editor.replaceRange(`${this.isEolRequired(block) ? "\n\n" : " "}^${id}`, end);
		navigator.clipboard.writeText(
			`${this.obsidianProxy.app.fileManager.generateMarkdownLink(
				file,
				"",
				"#^" + id
			)}`
		);
	}

	getBlock(editor: Editor, file: TFile): ListItemCache | HeadingCache | SectionCache | undefined {
		const cursor = editor.getCursor("from");
		const fileCache = this.obsidianProxy.app.metadataCache.getFileCache(file);

		let block: ListItemCache | HeadingCache | SectionCache | undefined = (
			fileCache?.sections || []
		).find((section) => {
			return (
				section.position.start.line <= cursor.line &&
				section.position.end.line >= cursor.line
			);
		});

		if (block?.type === "list") {
			block = (fileCache?.listItems || []).find((item) => {
				return (
					item.position.start.line <= cursor.line &&
					item.position.end.line >= cursor.line
				);
			});
		} else if (block?.type === "heading") {
			block = (fileCache?.headings || []).find((heading) => {
				return heading.position.start.line === cursor.line;
			});
		}

		return block;
	}

	generateId(): string {
		return Math.random().toString(36).substring(2, 6);
	}

	isEolRequired(block: ListItemCache | SectionCache): boolean {
		const blockType = (block as SectionCache).type || "";

		switch (blockType) {
			case "blockquote":
			case "code":
			case "table":
			case "comment":
			case "footnoteDefinition":
				return true;
			default:
				return false;
		}
	}

}

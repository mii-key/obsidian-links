import { LinkTypes } from './../utils';
import { App, Modal, Setting } from 'obsidian';
import { FolderSuggest } from 'suggesters/FolderSuggester';
import parseFilepath  from 'parse-filepath';


type LinkInfo = {
	type: LinkTypes,
	path: string,
	text?: string
};

export class ReplaceLinkModal extends Modal {
	result: string;
	buttonContainerEl: HTMLDivElement;
	notePath: string;

	onSubmit: (linkData: LinkInfo) => void;

	constructor(app: App, onSubmit: (linkData: LinkInfo) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "Replace link with" });
		// search with FolderSuggest
		// new Setting(contentEl)
		// 	.setClass("wide-setting")
		// 	.addSearch((search) => {
				
		// 		new FolderSuggest(search.inputEl)
		// 		search.setPlaceholder('search for note')
		// 			.setValue("")
		// 			.onChange(async (value) => {
		// 				this.notePath = value;
		// 			})
		// 	});

		new Setting(contentEl).then((setting) => {
			setting.addSearch((search) => {
				
				new FolderSuggest(search.inputEl)
				search.setPlaceholder('search for note')
					.setValue("")
					.onChange(async (value) => {
						this.notePath = value;
					})
			});
			if(setting.controlEl.lastChild){
				setting.nameEl.appendChild(setting.controlEl.lastChild);
			}
		});


		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Replace")
					.setCta()
					.onClick(() => {
						this.close();
						if (this.notePath) {
							const pathInfo = parseFilepath(this.notePath);
							this.onSubmit({ 
								type: LinkTypes.Wiki, 
								path: pathInfo.dir? pathInfo.dir.concat("/", pathInfo.name) :  pathInfo.name,
								text: pathInfo.dir? pathInfo.name : undefined});
						}
					}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();

	}
}

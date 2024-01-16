import { App, Modal, Setting } from 'obsidian';

//TODO: refactor

export class PromptModal extends Modal {
	buttonContainerEl: HTMLDivElement;
	prompt: string;

	onSubmit: (result: string) => void;

	constructor(app: App, prompt: string, onSubmit: (result: string) => void) {
		super(app);
		this.prompt = prompt;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("div", { text: this.prompt });

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Yes")
					.setCta()
					.onClick(() => {
						this.close();
						this.onSubmit('Yes');
					}))
			.addButton((btn) =>
				btn
					.setButtonText("No")
					.setCta()
					.onClick(() => {
						this.close();
						this.onSubmit('No');
					}));

	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

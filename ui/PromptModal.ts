
import { App, Modal, Setting } from 'obsidian';
import { ButtonInfo } from './PromotModal.common';

export class PromptModal extends Modal {
	buttonContainerEl: HTMLDivElement;
	text: string[];
	title: string;
	buttons: ButtonInfo[];


	onSubmit: (result: string) => void;

	constructor(app: App, title: string, text: string[], buttons: ButtonInfo[], onSubmit: (result: string) => void) {
		super(app);
		this.text = text;
		this.title = title;
		this.buttons = buttons;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createDiv({ cls: 'modal-title', text: this.title });
		const contentDiv = contentEl.createDiv({ cls: 'modal-content' });
		this.text.forEach((t) => {
			contentDiv.createEl('p', { text: t })
		});
		const buttonsContainer = contentEl.createDiv({ cls: 'modal-button-container' });

		const buttonsSetting = new Setting(buttonsContainer);
		this.buttons.forEach((b) => {
			buttonsSetting.addButton(c => {
				c.setButtonText(b.text);
				if (b.isCta) {
					c.setCta();
				}
				if (b.isWarning) {
					c.setWarning();
				}
				c.onClick(() => {
					this.close();
					this.onSubmit(b.result);
				})
			});
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

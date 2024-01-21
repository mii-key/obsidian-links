
import { IModal } from './IModal';
import { ButtonInfo } from './PromotModal.common';

export class PromptModalMock implements IModal {
	__mocks: {
		open: jest.Mock,
		close: jest.Mock,
	} = {
			open: jest.fn(),
			close: jest.fn(),
		}

	onSubmit: (result: string) => void;
	buttons: ButtonInfo[];

	constructor(buttons: ButtonInfo[], onSubmit: (result: string) => void) {
		this.open = this.__mocks.open;
		this.close = this.__mocks.close;
		this.buttons = buttons;
		this.onSubmit = onSubmit;
	}

	open(): void {
		throw new Error('Method not implemented.');
	}

	close(): void {
		throw new Error('Method not implemented.');
	}

	buttonClick(index: number) {
		this.onSubmit(this.buttons[index].result);
	}
}

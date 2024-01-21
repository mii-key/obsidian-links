import { IModal } from "./IModal";
import { IUiFactory } from "./IUiFactory";
import { ButtonInfo } from "./PromotModal.common";

export class UiFactoryMock implements IUiFactory {

  __mocks: {
    createPromptModel: jest.Mock,
  } = {
      createPromptModel: jest.fn(),
    }

  constructor() {
    this.createPromptModal = this.__mocks.createPromptModel;
  }

  createPromptModal(title: string, text: string[], buttons: ButtonInfo[], onSubmit: (result: string) => void): IModal {
    throw new Error('Method not implemented.');
  }

}
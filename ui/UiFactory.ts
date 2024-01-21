import { App } from "obsidian";
import { IModal } from "./IModal";
import { IUiFactory } from "./IUiFactory";
import { ButtonInfo } from "./PromotModal.common";
import { PromptModal } from "./PromptModal";

export class UiFactory implements IUiFactory {

  app: App;
  constructor(app: App) {
    this.app = app;
  }

  createPromptModal(title: string, text: string[], buttons: ButtonInfo[], onSubmit: (result: string) => void): IModal {
    return new PromptModal(this.app, title, text, buttons, onSubmit);
  }
}
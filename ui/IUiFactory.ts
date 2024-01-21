import { IModal } from "./IModal";
import { ButtonInfo } from "./PromotModal.common";

export interface IUiFactory {
  createPromptModal(title: string, text: string[], buttons: ButtonInfo[], onSubmit: (result: string) => void): IModal;
}
import { DialogContext, PromptValidatorContext } from "botbuilder-dialogs";

export class Validator {
  public static async NumberValidation(
    promptValidatorContext: PromptValidatorContext<number>
  ) {
    if (!promptValidatorContext.recognized) {
      await promptValidatorContext.context.sendActivity(
        "Please enter the required information"
      );
      return false;
    }
    let value = +promptValidatorContext.recognized.value;
    if (Number.isNaN(value)) {
      await promptValidatorContext.context.sendActivity(
        "Please enter only numberic charaters"
      );
      return false;
    }
    return true;
  }
}

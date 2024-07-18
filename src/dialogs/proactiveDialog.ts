import { InputHints, MessageFactory, StatePropertyAccessor } from "botbuilder";
import {
  ChoicePrompt,
  DialogTurnResult,
  TextPrompt,
  WaterfallDialog,
  WaterfallStepContext,
} from "botbuilder-dialogs";
import { CancelAndHelpDialog } from "./cancelAndHelpingDialog";
import { UserInfos } from "./userInfos";

const PROACTIVE_WATERFALL_DIALOG = "proactiveWaterfallDialog";

export class ProactiveDialog extends CancelAndHelpDialog {
  private userInfoAccessor: StatePropertyAccessor<UserInfos>;

  constructor(id: string) {
    super(id || "proactiveDialog");

    this.addDialog(new TextPrompt("TextPrompt"))
      .addDialog(new ChoicePrompt("ChoicePrompt"))
      .addDialog(
        new WaterfallDialog(PROACTIVE_WATERFALL_DIALOG, [
          this.initStep.bind(this),
          this.actStep.bind(this),
          this.finalStep.bind(this),
        ])
      );
    this.initialDialogId = PROACTIVE_WATERFALL_DIALOG;
  }

  private async initStep(
    stepCtx: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    const welcomeMessage = "Welcome! Enter something please?";
    await stepCtx.context.sendActivity(welcomeMessage);
    return await stepCtx.next();
  }

  private async actStep(
    stepCtx: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    if (stepCtx.result) {
      return await stepCtx.next();
    }
    const messageText = "What's your name?";
    const msg = MessageFactory.text(
      messageText,
      messageText,
      InputHints.ExpectingInput
    );
    return await stepCtx.prompt("TextPrompt", { prompt: msg });
  }

  private async finalStep(
    stepCtx: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    const userInput = stepCtx.result;
    const welcomeMessage = `Welcome ${userInput}! There are manythings that on sales. Let's check them out!!`;
    await stepCtx.context.sendActivity(welcomeMessage);
    return await stepCtx.endDialog();
  }
}

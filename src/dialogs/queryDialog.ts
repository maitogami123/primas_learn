import {
  TextPrompt,
  ConfirmPrompt,
  WaterfallDialog,
  WaterfallStepContext,
  DialogTurnResult,
  NumberPrompt,
} from "botbuilder-dialogs";
import { CancelAndHelpDialog } from "./cancelAndHelpingDialog";
import { InputHints, MessageFactory } from "botbuilder";
import { UserInfos } from "./userInfos";

const TEXT_PROMPT = "textPrompt";
const CONFIRM_PROMPT = "confirmPrompt";
const WATERFALL_DIALOG = "waterfallDialog";

export class QueryDialog extends CancelAndHelpDialog {
  constructor(id: string) {
    super(id || "queryDialog");

    this.addDialog(new TextPrompt(TEXT_PROMPT))
      .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
      .addDialog(
        new WaterfallDialog(WATERFALL_DIALOG, [
          this.enterQueryStep.bind(this),
          this.beginQueryStep.bind(this),
          this.confirmStep.bind(this),
          this.finalStep.bind(this),
        ])
      );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  private async enterQueryStep(
    stepCtx: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    const messageText = "Enter the person's name to check their info. ";
    const msg = MessageFactory.text(
      messageText,
      messageText,
      InputHints.ExpectingInput
    );
    return await stepCtx.prompt(TEXT_PROMPT, {
      prompt: msg,
    });
  }

  private async beginQueryStep(
    stepCtx: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    const enteredQuery = stepCtx.result as string;
    console.log(enteredQuery, stepCtx.result, stepCtx.options);
    const response = await fetch(
      `http://localhost:3000/user/query?fullName=${enteredQuery}`
    );
    const data = await response.json();
    if (data.statusCode) {
      const notFoundMessage =
        "Cannot find user with provided name. Please try again!";
      await stepCtx.context.sendActivity(notFoundMessage, notFoundMessage);
    } else {
      const userInfo = data as UserInfos;

      const foundMessage = "User with provided name found!";
      await stepCtx.context.sendActivity(foundMessage, foundMessage);
      const userInfoMessage = `
      Fullname: ${userInfo.fullName}
      SocialId: ${userInfo.socialId}
      Address: ${userInfo.address}
      `;
      await stepCtx.context.sendActivity(userInfoMessage, userInfoMessage);
    }
    return stepCtx.next();
  }

  private async confirmStep(
    stepCtx: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    const messageText = `Do you want to continue?`;
    const msg = MessageFactory.text(
      messageText,
      messageText,
      InputHints.ExpectingInput
    );

    return await stepCtx.prompt(CONFIRM_PROMPT, { prompt: msg });
  }

  private async finalStep(
    stepCtx: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    if (stepCtx.result === true) {
      return await stepCtx.replaceDialog(WATERFALL_DIALOG);
    } else {
      return await stepCtx.endDialog();
    }
  }
}

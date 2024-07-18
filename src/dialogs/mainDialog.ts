import {
  BotState,
  CardFactory,
  ConversationState,
  InputHints,
  StatePropertyAccessor,
  TurnContext,
  UserState,
} from "botbuilder";
import {
  ChoiceFactory,
  ChoicePrompt,
  ComponentDialog,
  DialogSet,
  DialogState,
  DialogTurnResult,
  DialogTurnStatus,
  TextPrompt,
  WaterfallDialog,
  WaterfallStepContext,
} from "botbuilder-dialogs";
import { UserInfoDialog } from "./userInfoDialog";
import { UserInfos } from "./userInfos";
import { QueryDialog } from "./queryDialog";
import { ProactiveDialog } from "./proactiveDialog";

const MAIN_WATERFALL_DIALOG = "mainWaterfallDialog";

export class MainDialog extends ComponentDialog {
  private userInfoAccessor: StatePropertyAccessor<UserInfos>;

  constructor(
    userInfoDialog: UserInfoDialog,
    queryDialog: QueryDialog,
    proactiveDialog: ProactiveDialog
  ) {
    super("MainDialog");
    if (!userInfoDialog)
      throw new Error(
        "[MainDialog]: Missing parameter 'userInfoDialog' is required"
      );

    if (!queryDialog)
      throw new Error(
        "[MainDialog]: Missing parameter 'queryDialog' is required"
      );

    this.addDialog(new TextPrompt("TextPrompt"))
      .addDialog(new ChoicePrompt("ChoicePrompt"))
      .addDialog(proactiveDialog)
      .addDialog(userInfoDialog)
      .addDialog(queryDialog)
      .addDialog(
        new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
          this.initStep.bind(this),
          this.actStep.bind(this),
          this.finalStep.bind(this),
        ])
      );
    this.initialDialogId = MAIN_WATERFALL_DIALOG;
  }

  async run(
    context: TurnContext,
    accessor: StatePropertyAccessor<DialogState>,
    userInfoAccessor: StatePropertyAccessor<UserInfos>
  ) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);
    this.userInfoAccessor = userInfoAccessor;
    const dialogContext = await dialogSet.createContext(context);
    const result = await dialogContext.continueDialog();
    if (result.status === DialogTurnStatus.empty)
      await dialogContext.beginDialog(this.id);
  }

  private async initStep(
    stepCtx: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    if (stepCtx.result) {
      return await stepCtx.next();
    }

    if (stepCtx.context.activity.text === "launch campaign") {
      return await stepCtx.beginDialog("proactiveDialog");
    } else {
      return await stepCtx.prompt("ChoicePrompt", "Please choose an action", [
        "Query",
        "Insert",
      ]);
    }
  }

  private async actStep(
    stepCtx: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    if (!stepCtx.result)
      return await stepCtx.replaceDialog(this.initialDialogId, {
        restartMsg: "What else can I do for you?",
      });

    if (stepCtx.result.value === "Query") {
      const welcomeMessage = "Welcome! Let's search some information!!";
      await stepCtx.context.sendActivity(welcomeMessage);
      return await stepCtx.beginDialog("queryDialog");
    }
    const welcomeMessage =
      "Welcome! We are now begin to gather your information!!";
    await stepCtx.context.sendActivity(welcomeMessage);
    return await stepCtx.beginDialog("userInfoDialog", this.userInfoAccessor);
  }

  private async finalStep(
    stepCtx: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    const userInfo = await this.userInfoAccessor.get(stepCtx.context);

    if (userInfo) {
      const promptMessage = `You are ${userInfo.fullName}. 
      Your social Id is: ${userInfo.socialId} 
      And currently living at: ${userInfo.address}`;

      await stepCtx.context.sendActivity(promptMessage, promptMessage);
    }

    return await stepCtx.replaceDialog(this.initialDialogId, {
      restartMsg: "What else can I do for you?",
    });
  }
}

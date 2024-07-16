import {
  BotState,
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

const MAIN_WATERFALL_DIALOG = "mainWaterfallDialog";

export class MainDialog extends ComponentDialog {
  private userInfoAccessor: StatePropertyAccessor<UserInfos>;
  private conversationState: BotState;

  constructor(
    userInfoDialog: UserInfoDialog,
    queryDialog: QueryDialog,
    conversationState: BotState
  ) {
    super("MainDialog");
    this.conversationState = conversationState;
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
      .addDialog(userInfoDialog)
      .addDialog(queryDialog)
      .addDialog(
        new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
          this.initStep.bind(this),
          this.actStep.bind(this),
          this.finalStep.bind(this),
        ])
      );

    // constructor m lạ quá :)) Hàng mẫu của MS á a

    this.initialDialogId = MAIN_WATERFALL_DIALOG;
  }

  async run(
    context: TurnContext,
    accessor: StatePropertyAccessor<DialogState>,
    userInfoAccessor: StatePropertyAccessor<UserInfos>,
    conversationState: BotState
  ) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);
    this.userInfoAccessor = userInfoAccessor;

    const dialogContext = await dialogSet.createContext(context);

    // mình sẽ check state ở đây. Convo state này pass thêm vào lúc mình Init bên con bot cũng được a
    const cached = conversationState.get(context); //k lay duoc a // wtf :D //a ko bit typécript no la type gi
    console.log(cached.hash);
    // đây là chỗ nó chạy flow
    const result = await dialogContext.continueDialog();
    if (result.status === DialogTurnStatus.empty)
      await dialogContext.beginDialog(this.id);
  }

  private async initStep(
    stepCtx: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    if (stepCtx.result) {
      return await stepCtx.next(this.actStep);
    }

    return await stepCtx.prompt("ChoicePrompt", "Please choose an action", [
      "Query",
      "Insert",
    ]);
  }

  private async actStep(
    stepCtx: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    if (stepCtx.result.value === "Query") {
      const welcomeMessage = "Welcome! Let's search some information!!";
      await stepCtx.context.sendActivity(welcomeMessage, welcomeMessage);
      return await stepCtx.beginDialog("queryDialog");
    }
    const welcomeMessage =
      "Welcome! We are now begin to gather your information!!";
    await stepCtx.context.sendActivity(welcomeMessage, welcomeMessage);
    return await stepCtx.beginDialog("userInfoDialog", this.userInfoAccessor);
  }

  private async finalStep(
    stepCtx: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    if (stepCtx.result) {
      const userInfo = stepCtx.result as UserInfos;

      const promptMessage = `You are ${userInfo.fullName}. Your social Id is: ${userInfo.socialId} and currently living at: ${userInfo.address}`;
      const test = JSON.stringify({
        fullName: userInfo.fullName,
        socialId: userInfo.socialId,
        fixedAddress: userInfo.address,
        address: userInfo.address,
      });
      const response = await fetch("http://localhost:3000/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: test,
      });

      const successMessage = "User created successfully!";
      await stepCtx.context.sendActivity(
        successMessage,
        successMessage,
        InputHints.IgnoringInput
      );

      await stepCtx.context.sendActivity(
        promptMessage,
        promptMessage,
        InputHints.IgnoringInput
      );
    }

    // Tới bên đây thì dialog sẽ truy cập vô cái userInfo để lấy thông tin được nhập bên thằng UserInfoDialog
    // rồi in ra ngoài
    const userInfo = await this.userInfoAccessor.get(stepCtx.context);

    // Cái prompt nó sẽ nằm bên đây.
    // mà có cái vấn đề e thấy nó cấn cấn là
    const promptMessage = `You are ${userInfo.fullName}. Your social Id is: ${userInfo.socialId} and currently living at: ${userInfo.address}`;

    await stepCtx.context.sendActivity(
      promptMessage,
      promptMessage,
      InputHints.IgnoringInput
    );

    return await stepCtx.replaceDialog(this.initialDialogId, {
      restartMsg: "What else can I do for you?",
    });
  }
}

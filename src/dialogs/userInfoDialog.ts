import {
  ConfirmPrompt,
  DialogTurnResult,
  TextPrompt,
  WaterfallDialog,
  WaterfallStepContext,
} from "botbuilder-dialogs";
import { CancelAndHelpDialog } from "./cancelAndHelpingDialog";
import {
  InputHints,
  MessageFactory,
  StatePropertyAccessor,
  TurnContext,
} from "botbuilder";
import { UserInfos } from "./userInfos";
import { Validator } from "../helpers";

const TEXT_PROMPT = "textPrompt";
const NUMBER_PROMPT = "numberPrompt";
const CONFIRM_PROMPT = "confirmPrompt";
const WATERFALL_DIALOG = "waterfallDialog";

export class UserInfoDialog extends CancelAndHelpDialog {
  private userInfoAccessor: StatePropertyAccessor<UserInfos>;

  constructor(id: string) {
    super(id || "userInfoDialog");

    this.addDialog(new TextPrompt(TEXT_PROMPT))
      .addDialog(
        new TextPrompt(NUMBER_PROMPT, Validator.NumberValidation.bind(this))
      )
      .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
      .addDialog(
        new WaterfallDialog(WATERFALL_DIALOG, [
          this.fullnameStep.bind(this),
          this.socialIdStep.bind(this),
          this.addressStep.bind(this),
          this.confirmStep.bind(this),
          this.finalStep.bind(this),
        ])
      );
    this.initialDialogId = WATERFALL_DIALOG;
  }

  private async fullnameStep(
    stepCtx: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    // Lúc call dialog userInfo e pass cái accessor qua
    this.userInfoAccessor = stepCtx.options as StatePropertyAccessor<UserInfos>;
    const userInfos = await this.userInfoAccessor.get(
      stepCtx.context,
      new UserInfos()
    );

    if (!userInfos.fullName) {
      const messageText = "What's your name?";
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ExpectingInput
      );
      return await stepCtx.prompt(TEXT_PROMPT, { prompt: msg });
    } else {
      return await stepCtx.next(userInfos.fullName);
    }
  }

  private async socialIdStep(
    stepCtx: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    const userInfos = await this.userInfoAccessor.get(
      stepCtx.context,
      new UserInfos()
    );
    // Cứ mỗi step e phải đều get từ accessor ra như này thì nó có "nông dân" quá k a :)))

    // nó nông dân mà.

    // Nãy h e tìm hiểu cái kiểu mình start convo mới nhưng cùng user ID á. Thì nó hiện ra cái welcome back thôi.
    // Mình check là check cái reciepent ID rồi so nó vào trong đâu để biết là nó đã chat với mình rồi a ?
    // Hiện tại là nó vẫn tạo conversation mới

    // Rồi cứ mỗi cái input nhập vào thì e lưu vào trong cái userInfos lấy từ cái accessor trên context hiện tại.
    userInfos.fullName = stepCtx.result;
    if (!userInfos.address) {
      const messageText = "Can you tell us your social Id number?";
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ExpectingInput
      );
      const value = await stepCtx.prompt(NUMBER_PROMPT, {
        prompt: msg,
      });
      return value;
    } else {
      return await stepCtx.next(userInfos.address);
    }
  }

  private async addressStep(
    stepCtx: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    const userInfos = await this.userInfoAccessor.get(
      stepCtx.context,
      new UserInfos()
    );
    userInfos.socialId = stepCtx.result;
    if (!userInfos.address) {
      const messageText = "where do you live?";
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ExpectingInput
      );
      return await stepCtx.prompt(TEXT_PROMPT, {
        prompt: msg,
      });
    } else {
      return await stepCtx.next(userInfos.address);
    }
  }

  private async confirmStep(
    stepCtx: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    const userInfos = await this.userInfoAccessor.get(
      stepCtx.context,
      new UserInfos()
    );
    userInfos.address = stepCtx.result;
    const messageText = `Please confirm, Your fullname is: ${userInfos.fullName} and your social Id: ${userInfos.socialId} and currently living at: ${userInfos.address}. Is this correct?`;
    const msg = MessageFactory.text(
      messageText,
      messageText,
      InputHints.ExpectingInput
    );

    // Offer a YES/NO prompt.
    return await stepCtx.prompt(CONFIRM_PROMPT, { prompt: msg });
  }

  private async finalStep(
    stepCtx: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    // Như ở đây e k return result bên dialog nữa
    return await stepCtx.endDialog();
  }
}

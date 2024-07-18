import {
  ActivityHandler,
  BotState,
  CardFactory,
  ConversationState,
  StatePropertyAccessor,
  UserState,
} from "botbuilder";
import { Dialog, DialogState } from "botbuilder-dialogs";
import { MainDialog } from "../dialogs/mainDialog";
import { UserInfos } from "../dialogs/userInfos";
const WelcomeCard = require("../../../resources/welcomeCard.json");

const CONVERSATION_DATA_PROPERTY = "conversationData";
const USER_INFO_PROPERTY = "userInfo";

export class EmptyBot extends ActivityHandler {
  private conversationState: BotState;
  private userState: BotState;
  private dialog: Dialog;
  private dialogState: StatePropertyAccessor<DialogState>;
  private userInfo: StatePropertyAccessor<UserInfos>;

  constructor(
    conversationState: BotState,
    userState: BotState,
    dialog: Dialog
  ) {
    super();

    if (!conversationState) {
      throw new Error(
        "[DialogBot]: Missing parameter. conversationState is required"
      );
    }
    if (!userState) {
      throw new Error("[DialogBot]: Missing parameter. userState is required");
    }
    if (!dialog) {
      throw new Error("[DialogBot]: Missing parameter. dialog is required");
    }

    this.conversationState = conversationState as ConversationState;
    this.userState = userState as UserState;
    this.dialog = dialog;
    this.dialogState = this.conversationState.createProperty<DialogState>(
      CONVERSATION_DATA_PROPERTY
    );
    this.userInfo =
      this.conversationState.createProperty<UserInfos>(USER_INFO_PROPERTY);

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (const member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          await context.sendActivity("Hello!");
          const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
          await context.sendActivity({ attachments: [welcomeCard] });

          await (dialog as MainDialog).run(
            context,
            this.dialogState,
            this.userInfo
          );
        } else {
          await context.sendActivity(`Hello, Welcome back!`);
        }
      }
      await next();
    });

    this.onMessage(async (context, next) => {
      await (this.dialog as MainDialog).run(
        context,
        this.dialogState,
        this.userInfo
      );
      await next();
    });

    this.onDialog(async (context, next) => {
      // Save any state changes. The load happened during the execution of the Dialog.
      await this.conversationState.saveChanges(context, false);
      await this.userState.saveChanges(context, false);
      await next();
    });
  }
}

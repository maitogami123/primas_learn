import {
  ActivityHandler,
  BotState,
  CardFactory,
  ConversationState,
  MessageFactory,
  StatePropertyAccessor,
  TurnContext,
  UserState,
} from "botbuilder";
import { ChoiceFactory, Dialog, DialogState } from "botbuilder-dialogs";
import { MainDialog } from "../dialogs/mainDialog";
import { UserInfos } from "../dialogs/userInfos";
import {
  FacebookMessage,
  FacebookOptin,
  FacebookPayload,
  FacebookPostBack,
  FacebookQuickReply,
} from "../models";
const WelcomeCard = require("../../../resources/welcomeCard.json");

const CONVERSATION_DATA_PROPERTY = "conversationData";
const USER_INFO_PROPERTY = "userInfo";

const FACEBOOK_PAGE_ID = "Facebook Page Id";
const QUICK_REPLIES = "Quick Replies";
const POST_BACK = "PostBack";

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
      // Cái membersAdded này là Bot với User rồi mình check cái recipient ID ở đây à a ?

      // có hỏi gì k
      // Thì có cái check người dùng đã nói chuyện với mình hay chưa thôi a
      // mà nếu mình quản lý thì mình check userID rồi trong đó có thông tin là nó nói chuyện với bot chưa
      // rồi mình dựa vào đó để start convo mới à a kiểu check bên DB hay sao đó ?

      for (const member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          await context.sendActivity("Hello!");
          const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
          await context.sendActivity({ attachments: [welcomeCard] });

          await (dialog as MainDialog).run(
            context,
            this.dialogState,
            this.userInfo,
            conversationState
          );
        } else {
          await context.sendActivity(`Hello, Welcome back!`);
        }
      }
      await next();
    });
    // this.onEvent(async (turnContext) => {
    //   console.log("Processing an Event Activity.");

    //   // Analyze Facebook payload from EventActivity.Value
    //   await this.processFacebookPayload(
    //     turnContext,
    //     turnContext.activity.value
    //   );
    // });
    this.onMessage(async (context, next) => {
      // if (
      //   await this.processFacebookPayload(context, context.activity.channelData)
      // ) {
      //   if (context.activity.channelId !== "facebook") {
      //     await context.sendActivity(
      //       "This sample is intended to be used with a Facebook bot."
      //     );
      //   }
      //   await this.showChoices(context);
      // }

      // ở đây nó sẽ execute flow
      await (this.dialog as MainDialog).run(
        context,
        this.dialogState,
        this.userInfo,
        conversationState
      );
      // execute xong thì mình sẽ lưu state của nó lại vô database
      // mỗi message user nhập vô nó sẽ chui zô đây

      //code lưu hiện tại a implement ở đây

      await next();
    });

    this.onDialog(async (context, next) => {
      // Save any state changes. The load happened during the execution of the Dialog.

      await this.conversationState.saveChanges(context, false);
      await this.userState.saveChanges(context, false);
      await next();
    });
  }

  async showChoices(turnContext: TurnContext) {
    // Create choices for the prompt
    const choices = [
      {
        value: QUICK_REPLIES,
      },
      {
        value: FACEBOOK_PAGE_ID,
      },
      {
        value: POST_BACK,
      },
    ];

    // Create the prompt message
    var message = ChoiceFactory.forChannel(
      turnContext.activity.channelId,
      choices,
      "What Facebook feature would you like to try? Here are some quick replies to choose from!"
    );
    await turnContext.sendActivity(message);
  }

  async processFacebookPayload(
    turnContext: TurnContext,
    data: FacebookPayload
  ) {
    // At this point we know we are on Facebook channel, and can consume the Facebook custom payload present in channelData.
    const facebookPayload = data;
    if (facebookPayload) {
      if (facebookPayload.postback) {
        // Postback
        await this.onFacebookPostback(turnContext, facebookPayload.postback);
        return true;
      } else if (facebookPayload.optin) {
        // Optin
        await this.onFacebookOptin(turnContext, facebookPayload.optin);
        return true;
      } else if (
        facebookPayload.message &&
        facebookPayload.message.quickReply
      ) {
        // Quick Reply
        await this.onFacebookQuickReply(
          turnContext,
          facebookPayload.message.quickReply
        );
        return true;
      } else if (facebookPayload.message && facebookPayload.message.isEcho) {
        // Echo
        await this.onFacebookEcho(turnContext, facebookPayload.message);
        return true;
      }
    }
    return false;
  }

  async onFacebookPostback(
    turnContext: TurnContext,
    postBack: FacebookPostBack
  ) {
    console.log("Postback message recieved");

    let message = MessageFactory.text("Are you sure?");
    await turnContext.sendActivity(message);
    await this.showChoices(turnContext);
  }

  async onFacebookQuickReply(
    turnContext: TurnContext,
    quickReply: FacebookQuickReply
  ) {
    console.log("Quick message recieved");

    switch (turnContext.activity.text) {
      case FACEBOOK_PAGE_ID:
        let reply = MessageFactory.text(
          `This message come from the following facebook page ${turnContext.activity.recipient.id}`
        );

        await turnContext.sendActivity(reply);
        await this.showChoices(turnContext);
        break;
      case POST_BACK:
        const card = CardFactory.adaptiveCard({
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.0",
          body: [
            {
              type: "TextBlock",
              text: "Is 42 the answer to the ultimate question of Life, the Universe, and Everything?",
            },
          ],
          actions: [
            {
              type: "Action.PostBack",
              title: "Yes",
            },
            {
              type: "Action.PostBack",
              title: "No",
            },
          ],
        });
        await turnContext.sendActivity({ attachments: [card] });
        break;
      case QUICK_REPLIES:
        await this.showChoices(turnContext);
        break;
      default:
        await this.showChoices(turnContext);
        break;
    }
  }

  async onFacebookOptin(turnContext: TurnContext, optin: FacebookOptin) {
    console.log("Optin message recived");
  }

  async onFacebookEcho(turnContext: TurnContext, message: FacebookMessage) {
    console.log("Echo message recived");
  }
}

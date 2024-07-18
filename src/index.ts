import * as restify from "restify";

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
import {
  CloudAdapter,
  ConfigurationServiceClientCredentialFactory,
  ConversationState,
  createBotFrameworkAuthenticationFromConfiguration,
  MemoryStorage,
  UserState,
} from "botbuilder";

// This bot's main dialog.
import { EmptyBot } from "./bots/bot";
import { UserInfoDialog } from "./dialogs/userInfoDialog";
import { MainDialog } from "./dialogs/mainDialog";
import { QueryDialog } from "./dialogs/queryDialog";
import { ProactiveDialog } from "./dialogs/proactiveDialog";

const USERINFO_DIALOG = "userInfoDialog";
const QUERY_DIALOG = "queryDialog";
const PROACTIVE_DIALOG = "proactiveDialog";

// Create HTTP server.
const server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: process.env.MicrosoftAppId,
  MicrosoftAppPassword: process.env.MicrosoftAppPassword,
  MicrosoftAppType: process.env.MicrosoftAppType,
  MicrosoftAppTenantId: process.env.MicrosoftAppTenantId,
});

const botFrameworkAuthentication =
  createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new CloudAdapter(botFrameworkAuthentication);

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights.
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Send a trace activity, which will be displayed in Bot Framework Emulator
  await context.sendTraceActivity(
    "OnTurnError Trace",
    `${error}`,
    "https://www.botframework.com/schemas/error",
    "TurnError"
  );

  // Send a message to the user
  await context.sendActivity("The bot encountered an error or bug.");
  await context.sendActivity(
    "To continue to run this bot, please fix the bot source code."
  );
};

let conversationState: ConversationState;
let userState: UserState;
const memoryStorage = new MemoryStorage();
conversationState = new ConversationState(memoryStorage);
userState = new UserState(memoryStorage);

const userInfoDialog = new UserInfoDialog(USERINFO_DIALOG);
const queryDialog = new QueryDialog(QUERY_DIALOG);
const proactiveDialog = new ProactiveDialog(PROACTIVE_DIALOG);

const dialog = new MainDialog(userInfoDialog, queryDialog, proactiveDialog);

// Create the main dialog.
const myBot = new EmptyBot(conversationState, userState, dialog);

// Listen for incoming requests.
server.post("/api/messages", async (req, res) => {
  // Route received a request to adapter for processing
  await adapter.process(req, res, (context) => myBot.run(context));
});

server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`\n${server.name} listening to ${server.url}`);
});

import { FacebookMessage } from "./message";
import { FacebookOptin } from "./optin";
import { FacebookPostBack } from "./postBack";
import { FacebookRecipient } from "./recipient";
import { FacebookSender } from "./sender";

export interface FacebookPayload {
  sender: FacebookSender;
  recipent: FacebookRecipient;
  message: FacebookMessage;
  postback: FacebookPostBack;
  optin: FacebookOptin;
}

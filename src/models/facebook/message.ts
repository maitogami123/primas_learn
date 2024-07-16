import { FacebookQuickReply } from "./quickReply";

export interface FacebookMessage {
  mid: string;
  text: string;
  isEcho: string;
  quickReply: FacebookQuickReply;
}

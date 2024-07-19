import {
  Activity,
  BotFrameworkAdapter,
  BotFrameworkAdapterSettings,
  StatusCodes,
  WebRequest,
} from "botbuilder";
export class CustomAdapter extends BotFrameworkAdapter {
  constructor(settings?: Partial<BotFrameworkAdapterSettings>) {
    super(settings);
  }

  override async authenticateRequest(
    request: Partial<Activity>,
    authHeader: string
  ): Promise<void> {
    if (authHeader === "accessToken") {
    }
    // const identity = await this.authenticateRequestInternal(
    //   request,
    //   authHeader
    // );
    // if (!identity.isAuthenticated) {
    //   throw new Error("Unauthorized Access. Request is not authorized");
    // }

    // // Set the correct callerId value and discard values received over the wire
    // request.callerId = await this.generateCallerId(identity);
  }
}

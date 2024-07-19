const restify = require("restify");
require("dotenv").config();

const server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const PAGE_ID = process.env.PAGE_ID;

server.post("/webhook", async (req, res) => {
  let body = req.body;
  res.send(200, { message: "EVENT_RECEIVED" });
  const data = body.entry[0];
  if (body.object === "page") {
    // Returns a '200 OK' response to all requests
    const postResponse = await fetch("http://localhost:3978/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer accessToken",
      },
      body: JSON.stringify({
        text: data.messaging[0].message.text,
        textFormat: "plain",
        type: "message",
        channelId: "messenger",
        from: {
          id: data.messaging[0].sender.id,
          name: "User",
          role: "user",
        },
        conversation: {
          id: `messenger-${data.messaging[0].sender.id}-${data.messaging[0].recipient.id}`,
        },
        id: `messenger-${data.messaging[0].sender.id}-${data.messaging[0].recipient.id}`,
        recipient: {
          id: data.messaging[0].recipient.id,
          name: "Bot",
          role: "bot",
        },
        serviceUrl: "http://localhost:3000",
      }),
    });
    if (postResponse.status === 401) {
      await postMessage(data.messaging[0].sender.id, await postResponse.json());
    }
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.send(404);
  }
});

server.get("/webhook", async (req, res) => {
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      console.log(challenge);
      res.send(200, +challenge);
    } else {
      res.send(403);
    }
  }
});

// Cái này là cái API
server.post("/proactive/:conversationId", async (req, res) => {
  res.send(200);
  const conversationId = req.params.conversationId;
  const senderId = conversationId.split("-")[1];
  await fetch("http://localhost:3978/api/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: "launch campaign",
      textFormat: "plain",
      type: "message",
      channelId: "messenger",
      from: {
        id: senderId,
        name: "User",
        role: "user",
      },
      conversation: {
        id: conversationId,
      },
      id: conversationId,
      recipient: {
        id: conversationId.split("-")[2],
        name: "Bot",
        role: "bot",
      },
      serviceUrl: "http://localhost:3000",
    }),
  });
});

server.post(
  "/v3/conversations/:conversationId/activities/:conversationId",
  async (req, res) => {
    res.send(200);
    const conversationId = req.params.conversationId;
    const senderId = conversationId.split("-")[1];
    await postMessage(senderId, req.body.text);
  }
);

async function postMessage(senderId, message) {
  await fetch(
    `https://graph.facebook.com/v20.0/${PAGE_ID}/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: {
          id: senderId,
        },
        messaging_type: "RESPONSE",
        message: {
          text: message,
        },
      }),
    }
  );
}

server.listen(3000, function () {
  console.log("%s listening at %s", server.name, server.url);
});

// import { Sequelize } from "sequelize";
import WebSocket from "ws";
import uuid from "./utils/uuid";
import { User } from "./models/user";

type authorizedSocketsOptions = {
  [key: number]: any;
}

export const authorizedSockets: authorizedSocketsOptions = {};

function removeAuthrizedSocket(userId: number, id: string) {
  delete authorizedSockets[userId][id];
}

function wsSend(ws: WebSocket, value: {[key: string]: any}) {
  try {
    ws.send(JSON.stringify(value));
  } catch (err) { console.log("not a websocket", err); }
}

// When and if you need the database here, just import createDatabase which will yield
// database, and a promise that guarantees it is properly synced.
export default async function startWebsocketsServer() {
  const wss = new WebSocket.Server({
    port: parseInt(process.env.WS_PORT) || 8080,
    // verifyClient: (info: any, cb: any) => {
    //   const token = info.req.headers.token;
    //
    //   if (!token) {
    //     cb(false, 401, "Unauthorized");
    //   } else {
    //     jwt.verify(token, process.env.JWT_SECRET, (err: Error, decoded: any) => {
    //       if (err) {
    //         cb(false, 401, "Unauthorized");
    //       } else {
    //         info.req.user = decoded;
    //         cb(true);
    //       }
    //     });
    //   }
    // }
  });


  console.log("Start websocket server");

  wss.on("connection", (ws: any, req: any) => {
    console.log("New websocket connection");
    let userId = null;
    let id = null;

    ws.on("message", (data: any) => {
      const response = JSON.parse(data);
      userId = response["userId"];
      id = uuid();

      switch(response.event) {
        case "subscribe": {
          if (!authorizedSockets[userId]) {
            authorizedSockets[userId] = {};
          }

          authorizedSockets[userId][id] = ws;

          wsSend(ws, { subscription: "success" });
          break;
        }
        case "unsubscribe": {
          removeAuthrizedSocket(userId, id);
          break;
        }
        default: {
          wsSend(ws, { message: "event does not exist" });
        }
      }
    });
    ws.on("close", () => {
      removeAuthrizedSocket(userId, id);
      console.log("Websocket connection closed");
    });
  });

  return wss;
}

export function sendToAllOnlineAccountUsers(users: Array<User>, data: {[key: string]: any}) {
  if (!users.length) { return; }
  for (const user of users) {
    if (authorizedSockets[user.id]) {
      const authorizedSocketsKeys = Object.keys(authorizedSockets[user.id]);
      if (authorizedSocketsKeys.length) {
        for (const socketId of authorizedSocketsKeys) {
          const ws: any = authorizedSockets[user.id][socketId];
          ws.send(JSON.stringify(data));
        }
      }
    }
  }
}

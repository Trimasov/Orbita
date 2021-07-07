import logger from "./config/logger";
import * as controller from "./tcp/controller";

export default function udpConnectionHandler(socket) {
  socket.sendMessage = (data, rinfo) => {
    return socket.send(data, 0, data.length, rinfo.port, rinfo.address, (err) => {
      console.log(`UDP error: ${err}`);
    });
  };

  socket.on("connection", async (chunk) => {
    logger.info("A new connection has been established.");
  });

  socket.on("error", (err) => {
    logger.info(`Error: ${err}`);
  });

  socket.on("message", (msg, rinfo) => {
    logger.info(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    controller.manage(msg, socket, rinfo);
  });

  // socket.on('listening', () => {});

  return socket;
}

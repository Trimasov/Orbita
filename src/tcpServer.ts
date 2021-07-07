import logger from "./config/logger";
import * as controller from "./tcp/controller";

export default function tcpConnectionHandler(socket) {
  socket.sendMessage = (data) => {
    return socket.write(data);
  };

  socket.on("connection", async (chunk) => {
    logger.info("A new connection has been established.");
  });
  
  socket.on("data", async (chunk) => {
    logger.info(`Data received from client: ${chunk.toString()}`);
    controller.manage(chunk, socket);
  });

  socket.on("end", function() {
    logger.info("Closing connection with the client");
  });

  socket.on("error", function(err) {
    logger.info(`Error: ${err}`);
  });
}

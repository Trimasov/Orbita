import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import xss from "xss-clean";
import compression from "compression";
import net from "net";
import dgram from "dgram";
import { Sequelize } from "sequelize";

import logger from "./config/logger";
import tcpConnectionHandler from "./tcpServer";
import udpConnectionHandler from "./udpServer";
import startWebsocketsServer from "./websockets";
import { idempotentModels } from "./models/models";
import runPassportConfig from "./api/v1/config/passport";
import v1Route from "./api/v1/routes";
import AdminBro from "admin-bro";
import AdminBroSequelize from "@admin-bro/sequelize";
import { adminRouter, deviceDataResourceConfig, deviceResourceConfig } from "./config/adminBro";
import { User } from "./models/user";
import { Account } from "./models/account";
import { Device } from "./models/device";
import { DeviceData } from "./models/deviceData";
import { Geozone } from "./models/geozone";
import { EventType } from "./models/eventType";
import { Event } from "./models/event";
import {DeviceGeozone} from "./models/deviceGeozone";

const run = async() => {
  // run database
  const database = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      dialect: "postgres"
    }
  );
  await idempotentModels(database);
  logger.info("Connected to DataBase");

  // passport auth config
  runPassportConfig();

  const apiServer = express();

  if (process.env.NODE_ENV !== "test") {
    // Admin
    AdminBro.registerAdapter(AdminBroSequelize);
    const adminBro = new AdminBro({
      resources: [
        { resource: User },
        { resource: Account },
        {
          resource: Geozone,
          options: deviceDataResourceConfig("coordinates")
        },
        {
          resource: Device,
          options: deviceResourceConfig()
        },
        {
          resource: DeviceData,
          options: deviceDataResourceConfig("data")
        },
        { resource: EventType },
        { resource: Event },
        { resource: DeviceGeozone }
      ],
      rootPath: "/admin"
    });

    apiServer.use(adminBro.options.rootPath, adminRouter(adminBro));
  }

  apiServer.use(express.urlencoded({ extended: false }));
  apiServer.use(helmet());
  apiServer.set("port", process.env.API_PORT || 3000);
  apiServer.use(express.json());
  apiServer.use(xss());
  apiServer.use(compression());
  apiServer.use(cors());
  apiServer.options("*", cors());

  // Routes
  apiServer.use("/api/v1/", v1Route);
  // apiServer.use("/api/oxley/", oxleyRoute);

  for (const port of process.env.TCP_PORTS.split(" ")) {
    net.createServer(tcpConnectionHandler).listen(port, () => {
      console.log(
        "TCP server is running at tcp://localhost:%d in %s mode",
        port,
        process.env.NODE_ENV
      );
    });
  }

  for (const port of process.env.UDP_PORTS.split(" ")) {
    let socket: any = dgram.createSocket("udp4");
    socket.localPort = port;
    socket = udpConnectionHandler(socket);
    socket.bind(port);
    console.log(
      "UDP server is running at udp://localhost:%d in %s mode",
      port,
      process.env.NODE_ENV
    );
  }

  const apiPort = process.env.API_PORT || 800;
  apiServer.listen(apiPort, () => {
    console.log(
      "API server is running at http://localhost:%d in %s mode",
      apiPort,
      process.env.NODE_ENV
    );
  });
};

export const wss = startWebsocketsServer();
run();

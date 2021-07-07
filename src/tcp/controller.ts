import { get } from "lodash";
import * as Driver from "./drivers/driver";
import * as userService from "./services/user";
import * as deviceDataService from "./services/deviceData";
import * as deviceService from "./services/device";
import { authorizedSockets } from "../websockets";
import { GeozoneEscape } from "../events/geozoneEscape";
import { sendToAllOnlineAccountUsers } from "../websockets";

async function saveDeviceData(data, socket, rinfo = null) {
  console.log(`port: ${JSON.stringify(socket)}`);
  const driverClass = Driver.getDriverClass(socket.localPort);
  const driver = new driverClass;
  const jsonData = driver.binToJson(data);

  console.log(`port: ${socket.localPort}`);
  console.log(`driver: ${driverClass.name}`);
  console.log(`data: ${JSON.stringify(jsonData)}`);

  if (isJsonHasData(jsonData)) {
    for (const parsedDeviceData of jsonData.data) {

      const device = await deviceService.findWhere({ foreignDeviceId: parsedDeviceData.foreignDeviceId });

      if (device) {
        parsedDeviceData.deviceId = device.id;
      }

      const deviceData = await deviceDataService.create(parsedDeviceData);

      if (!device) {
        return false;
      }

      socket.sendMessage(driver.jsonToBin(parsedDeviceData), rinfo);

      // TODO: need to optimize this part
      const users = await userService.getWhere({ accountId: device["accountId"] });
      sendToAllOnlineAccountUsers(users, {type: "new_device_data", data: deviceData});

      const geozoneEscapeIsEnable = get(device, "eventConfig.types.geozone_escape") || false;
      if (geozoneEscapeIsEnable) {
        const geozoneEscape = new GeozoneEscape(deviceData);
        await geozoneEscape.check();
      }
    }
  }
}

export async function manage(data, socket, rinfo = null) {
  await saveDeviceData(data, socket, rinfo);

  // run event here in future
}

function isJsonHasData(json) {
  return json && json.data && json.data.length;
}
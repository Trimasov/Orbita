import Event from "./index";
import { get } from "lodash";
import { Op } from "sequelize";
import * as deviceService from "../tcp/services/device";
import * as userService from "../tcp/services/user";
import {authorizedSockets, sendToAllOnlineAccountUsers} from "../websockets";
import * as deviceDataService from "../tcp/services/deviceData";
import { models } from "../models/models";
import {sendGeozoneEscapeEventEmail} from "../services/email";

export class GeozoneEscape extends Event {
  deviceData: any = null;
  key: string = "geozone_escape";

  constructor(deviceData: any) {
    super();
    this.deviceData = deviceData;
  }

  async check() {
    const deviceId = this.deviceData.deviceId;
    const device = await deviceService.find(deviceId);
    const geozones = await models.Geozone.findAll({
      include: {
        model: models.Device,
        as: 'devices',
        attributes: ['id'],
        where: {
          [Op.or]: [{ id: null }, { id: deviceId }],
          active: true
        },
        through: { attributes: [] }
      }
    });

    // TODO: Optimyse this part
    for (const geozone of geozones) {
      if (GeofenceIsOutside(this.deviceData, geozone)) {
        const eventType = await models.EventType.findOne({ key: this.key });

        if (!eventType) {
          console.log(`eventType with key = "${this.key}" does not exist`);
          continue;
        }

        await models.Event.create({
          deviceId,
          eventTypeId: eventType.id,
          data: {
            geozoneId: geozone.id
          }
        });

        const systemNotificationIsEnabled = get(device, "eventConfig.notifications.system.active") || false;
        const emailNotificationIsEnabled = get(device, "eventConfig.notifications.email.active") || false;
        const emailForNotification = get(device, "eventConfig.notifications.email.address") || false;

        if (systemNotificationIsEnabled || emailNotificationIsEnabled) {
          const users = await userService.getWhere({ accountId: device["accountId"] });

          if (systemNotificationIsEnabled) {
            sendToAllOnlineAccountUsers(users, {type: `${this.key}_event`, device, geozone});
          }

          if (emailNotificationIsEnabled && emailForNotification) {
            sendGeozoneEscapeEventEmail(emailForNotification, device, geozone);
          }
        }
      }
    }
  }
}

function GeofenceDebugOutput(point, geofenceDesc, distance) {
  console.log("");
  console.log("Point:");
  console.log("  Latitude:  " + point.data.position.lat);
  console.log("  Longitude: " + point.data.position.lon);
  console.log("Geofence:");
  console.log("  Latitude:  " + geofenceDesc.center.lat);
  console.log("  Longitude: " + geofenceDesc.center.lon);
  console.log("  Radius:    " + geofenceDesc.radious);
  console.log("Distance: " + distance);
  console.log("");
}

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function GetDistance(point1, point2) {

  // the simple one but not accurate variant from GSM/GPS tracker firmware
  //
  // const xDeg = 40075000.0 / 360.0;
  // const yDeg = 40007860.0 / 360.0;
  //
  // const dy = Math.abs(point1.lat - point2.lat) * yDeg;
  // const dx = Math.abs(point1.lon - point2.lon) * xDeg;
  //
  // return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));


  // more accurate variant (haversine formula)
  // see describption here http://www.movable-type.co.uk/scripts/latlong.html

  const earthRadiusKm = 6371;

  const dLat = degreesToRadians(point2.lat - point1.lat);
  const dLon = degreesToRadians(point2.lon - point1.lon);

  const lat1 = degreesToRadians(point1.lat);
  const lat2 = degreesToRadians(point2.lat);

  const a = Math.pow(Math.sin(dLat / 2), 2) + Math.pow(Math.sin(dLon / 2),2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c * 1000.0;
}

function GeofenceIsInside(deviceData, geozone) {

  if (!deviceData || !deviceData.data.position.lat || !deviceData.data.position.lon) {
    console.log("GeofenceIsInside. Incorect description of geoposition");
    return null;
  }

  if (geozone == null ||
    geozone.data == null ||
    geozone.data.center == null ||
    geozone.data.center.lat == null ||
    geozone.data.center.lon == null ||
    geozone.data.radius == null ||
    geozone.type !== "circle") {
    console.log("GeofenceIsInside. Incorect description of the geofence");
    return null;
  }

  const distance = GetDistance(
    { lat : deviceData.data.position.lat, lon : deviceData.data.position.lon } ,
    { lat : geozone.data.center.lat, lon : geozone.data.center.lon }
  );

  // GeofenceDebugOutput(point, geofenceDesc, distance);

  if (distance <= geozone.data.radius) {
    return true;
  }

  return false;
}

function GeofenceIsOutside(deviceData, geozone) {

  if (!deviceData || !deviceData.data.position.lat || !deviceData.data.position.lon) {
    console.log("GeofenceIsOutside. Incorect description of geoposition");
    return null;
  }

  if (geozone == null ||
    geozone.data == null ||
    geozone.data.center == null ||
    geozone.data.center.lat == null ||
    geozone.data.center.lon == null ||
    geozone.data.radius == null ||
    geozone.type !== "circle") {
    console.log("GeofenceIsOutside. Incorect description of the geofence");
    return null;
  }

  const distance = GetDistance(
    { lat : deviceData.data.position.lat, lon : deviceData.data.position.lon } ,
    { lat : geozone.data.center.lat, lon : geozone.data.center.lon }
  );

  // GeofenceDebugOutput(deviceData, geozone, distance);

  if (distance > geozone.data.radius) {
    return true;
  }

  return false;
}

// function GeofenceTest() {
//
//   // Point : Karl XIV Johans statue (position has been taken from Google Map)
//
//   const point = {
//     data : {
//       position : {
//         lat : 59.32614,
//         lon : 18.07262
//       }
//     }
//   };
//
//   // Center of the geofence : Nobel Prize Museum (position has been taken from Google Map)
//
//   const geofenceDesc = {
//     center : {
//       lat: 59.32540,
//       lon : 18.07083
//     },
//     radious : 1000
//   };
//
//   // Google Maps shows distance 133.66 m
//   // in our case we are getting 130.70 m (it's ok)
//
//   console.log( GeofenceIsInside  (point, geofenceDesc) );
//   console.log( GeofenceIsOutside (point, geofenceDesc) );
// }

// GeofenceTest();
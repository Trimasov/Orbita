import { Sequelize } from "sequelize";
import { idempotentInitAccount, connectAccount } from "./account";
import { idempotentInitUser, connectUser } from "./user";
import { idempotentInitGeozone, connectGeozone } from "./geozone";
import { idempotentInitDeviceData, connectDeviceData } from "./deviceData";
import { idempotentInitDevice, connectDevice } from "./device";
import { idempotentInitEventType, connectEventType } from "./eventType";
import { idempotentInitEvent, connectEvent } from "./event";
import { idempotentInitDeviceGeozone, connectDeviceGeozone } from "./deviceGeozone";

const models: any = Object();

function idempotentModels( sequelize: Sequelize ) {
  if (Object.keys(models).length === 0) {
    models.Account = idempotentInitAccount(sequelize);
    models.User = idempotentInitUser(sequelize);
    models.Geozone = idempotentInitGeozone(sequelize);
    models.Device = idempotentInitDevice(sequelize);
    models.DeviceData = idempotentInitDeviceData(sequelize);
    models.EventType = idempotentInitEventType(sequelize);
    models.Event = idempotentInitEvent(sequelize);
    models.DeviceGeozone = idempotentInitDeviceGeozone(sequelize);
    models.sequelize = sequelize;
    
    connectUser();
    connectAccount();
    connectGeozone();
    connectDevice();
    connectDeviceData();
    connectEventType();
    connectEvent();
    connectDeviceGeozone();
  }
  return models;
}

export {
  idempotentModels,
  models
};

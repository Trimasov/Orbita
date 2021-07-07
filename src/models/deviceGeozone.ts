import { Model, DataTypes } from "sequelize";
import { Device } from "./device";
import { Geozone } from "./geozone";

export class DeviceGeozone extends Model {
  public id!: number;
  public deviceId!: number;
  public geozoneId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  //public readonly deletedAt!: Date;
}

export const idempotentInitDeviceGeozone = (sequelize: any) => {
  const tableName = "devices_geozones";
  if (!sequelize.isDefined(tableName)) {
    DeviceGeozone.init({
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        }
        // deletedAt: {
        //   type: DataTypes.DATE
        // }
      },
      {
        sequelize,
        tableName,
        //paranoid: true
      });
  }

  return DeviceGeozone;
};

export function connectDeviceGeozone() {
  DeviceGeozone.belongsTo(Geozone, { as: "geozone", foreignKey: "geozoneId", onDelete: 'CASCADE' });
  DeviceGeozone.belongsTo(Device, { as: "device", foreignKey: "deviceId", onDelete: 'CASCADE' });
}
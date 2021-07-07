import { Model, DataTypes } from "sequelize";
import { Device } from "./device";

export class DeviceData extends Model {
  public id!: number;
  public deviceId!: number;
  public deviceType!: string;
  public hardwareVersion!: string;
  public firmwareVersion!: string;
  public protocolVersion!: string;
  public data!: Record<string, unknown>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  //public readonly deletedAt!: Date;
}

export const idempotentInitDeviceData = (sequelize: any) => {
  const tableName = "device_data";
  if ( ! sequelize.isDefined( tableName ) ) {
    DeviceData.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      deviceType: {
        type : DataTypes.STRING(20)
      },
      hardwareVersion: {
        type : DataTypes.STRING(100)
      },
      firmwareVersion: {
        type : DataTypes.STRING(100)
      },
      protocolVersion: {
        type : DataTypes.STRING(100)
      },
      data: {
        type: DataTypes.JSON
      },
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

  return DeviceData;
};

export function connectDeviceData() {
  DeviceData.belongsTo(Device, { as: "device", foreignKey: "deviceId", onDelete: 'CASCADE' });
}
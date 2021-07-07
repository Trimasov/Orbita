import { Model, DataTypes } from "sequelize";
import { Account } from "./account";
import { DeviceData } from "./deviceData";
import { Geozone } from "./geozone";
import { Event } from "./event";
import {DeviceGeozone} from "./deviceGeozone";

export class Device extends Model {
  public id!: number;
  public foreignDeviceId!: number;
  public accountId!: number;
  public name!: string;
  public port!: number;
  public version!: string;
  public active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  //public readonly deletedAt!: Date;
}

export const idempotentInitDevice = (sequelize: any) => {
  const tableName = "devices";
  if ( ! sequelize.isDefined( tableName ) ) {
    Device.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      foreignDeviceId: {
        type : DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Поле обязательное"
          },
        }
      },
      name: {
        type : DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Поле обязательное"
          },
        }
      },
      port: {
        type : DataTypes.INTEGER,
        allowNull: false
      },
      version: {
        type : DataTypes.STRING(20),
        allowNull: false
      },
      eventConfig: {
        type : DataTypes.JSON
      },
      active: {
        type : DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

  return Device;
};

export function connectDevice() {
  Device.belongsTo(Account, { as: "account", foreignKey: "accountId" });
  Device.belongsToMany(Geozone, { as: "geozones", through: DeviceGeozone, foreignKey: "deviceId" });
  Device.hasMany(DeviceData, { as: "deviceData", foreignKey: "deviceId" });
  Device.hasMany(DeviceGeozone, { as: "deviceGeozones", foreignKey: "deviceId" });
  Device.hasMany(Event, { as: "events", foreignKey: "deviceId" });
}

import { Model, DataTypes } from "sequelize";
import { Account } from "./account";
import {Device} from "./device";
import { DeviceGeozone } from "./deviceGeozone";

export class Geozone extends Model {
  public id!: number;
  public accountId!: number;
  public name!: string;
  public type!: string;
  public coordinates!: any;
  public radius!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  //public readonly deletedAt!: Date;
}

export const idempotentInitGeozone = (sequelize: any) => {
  const tableName = "geozones";
  if ( ! sequelize.isDefined( tableName ) ) {
    Geozone.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type : DataTypes.STRING(100),
        allowNull: false
      },
      type: {
        type : DataTypes.STRING(20),
        allowNull: false
      },
      color: {
        type : DataTypes.STRING(10),
        allowNull: false
      },
      lineThickness: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      data: {
        type : DataTypes.JSON,
        allowNull: false
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

  return Geozone;
};

export function connectGeozone() {
  Geozone.belongsTo(Account, { as: "account", foreignKey: "accountId" });
  Geozone.belongsToMany(Device, { as: "devices", through: DeviceGeozone, foreignKey: "geozoneId" });
  Geozone.hasMany(DeviceGeozone, { as: "deviceGeozones", foreignKey: "geozoneId" });
}

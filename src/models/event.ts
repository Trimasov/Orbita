import { Model, DataTypes } from "sequelize";
import { Device } from "./device";
import {EventType} from "./eventType";

export class Event extends Model {
  public id!: number;
  public deviceId!: number;
  public eventTypeId!: number;
  public read!: boolean;
  public data!: Record<string, unknown>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  //public readonly deletedAt!: Date;
}

export const idempotentInitEvent = (sequelize: any) => {
  const tableName = "events";
  if (!sequelize.isDefined(tableName)) {
    Event.init({
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        read: {
          type : DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        data: {
          type: DataTypes.JSON
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

  return Event;
};

export function connectEvent() {
  Event.belongsTo(Device, { as: "device", foreignKey: "deviceId" });
  Event.belongsTo(EventType, { as: "eventType", foreignKey: "eventTypeId" });
}
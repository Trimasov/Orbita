import { Model, DataTypes } from "sequelize";
import { Event } from "./event";

export class EventType extends Model {
  public id!: number;
  public key!: string;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  //public readonly deletedAt!: Date;
}

export const idempotentInitEventType = (sequelize: any) => {
  const tableName = "event_types";
  if (!sequelize.isDefined(tableName)) {
    EventType.init({
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        key: {
          type : DataTypes.STRING(50),
          allowNull: false
        },
        name: {
          type : DataTypes.STRING(100),
          allowNull: false
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

  return EventType;
};

export function connectEventType() {
  EventType.hasMany(Event, { as: "events", foreignKey: "eventTypeId" });
}
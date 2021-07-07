import { Model, DataTypes } from "sequelize";
import { Device } from "./device";
import { User } from "./user";
import { Geozone } from "./geozone";

export class Account extends Model {
  public id!: number;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  //public readonly deletedAt!: Date;
}

export const idempotentInitAccount = (sequelize: any) => {
  const tableName = "accounts";
  if ( ! sequelize.isDefined( tableName ) ) {
    Account.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
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

  return Account;
};

export function connectAccount() {
  Account.hasMany(Device, { as: "devices", foreignKey: "accountId" });
  Account.hasMany(User, { as: "users", foreignKey: "accountId" });
  Account.hasMany(Geozone, { as: "geozones", foreignKey: "accountId" });
}
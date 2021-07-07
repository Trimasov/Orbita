import { Model, DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import {Account} from "./account";
import {Geozone} from "./geozone";

export class User extends Model {
  public id!: number;
  public accountId!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: string;
  public refreshToken!: string;
  public resetPasswordToken!: string;
  public resetPasswordExpiredAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  //public readonly deletedAt!: Date;
}

export const idempotentInitUser = (sequelize: any) => {
  const tableName = "users";
  if ( ! sequelize.isDefined( tableName ) ) {
    User.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type : DataTypes.STRING(100),
        allowNull: false
      },
      email: {
        type : DataTypes.STRING(100),
        validate:{
          isEmail:{
            msg: "Email неверный"
          }
        },
        unique: true,
        allowNull: false
      },
      password: {
        type : DataTypes.STRING(100),
        allowNull: false,
        validate: {
          isValid(value) {
            if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
              throw new Error("Пароль должен содержать буквы и цифры");
            }
          },
        }
      },
      role: {
        type : DataTypes.STRING(20),
        allowNull: false
      },
      refreshToken: {
        type : DataTypes.STRING(200)
      },
      resetPasswordToken: {
        type : DataTypes.STRING(200)
      },
      resetPasswordExpiredAt: {
        type : DataTypes.DATE
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

  User.beforeCreate(async (user: User) => {
    await setEncryptedPassword(user);
  });

  User.beforeUpdate(async (user: User) => {
    await setEncryptedPassword(user);
  });

  return User;
};

export function connectUser() {
  User.belongsTo(Account, { as: "account", foreignKey: "accountId" });
}

async function setEncryptedPassword(user: User) {
  const salt = await bcrypt.genSalt(10);
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, salt);
  }
}

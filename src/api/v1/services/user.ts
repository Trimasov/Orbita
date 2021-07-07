import moment from "moment";
import { nanoid } from "nanoid";
import { models } from "../../../models/models";
import ApiError from "../helpers/apiError";
import { Account } from "../../../models/account";
import * as accountService from "../services/account";
import {generateJwtTokens} from "../helpers/auth";

export const create = async (data) => {
  return await models.User.create(data);
};

export const getWhere = async (where) => {
  return await models.User.findAll({ where });
};

export const find = async (id) => {
  return await models.User.findOne({ where: { id } });
};

export const findWhere = async (where) => {
  return await models.User.findOne({
    where,
    include: [{
      as: "account",
      model: Account
    }]
  });
};

export const updatePassword = async (user, password) => {
  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpiredAt = null;
  await user.save();
  return user;
};

export const update = async (id, data) => {
  return await models.User.update(data, { where: { id } });
};

export const destroy = async (id) => {
  return await models.User.destroy({ where: { id } });
};

export const generateResetPasswordToken = async (user) => {
  user.resetPasswordToken = nanoid(32);
  user.resetPasswordExpiredAt = moment().add("1", "week").toDate();
  await user.save();
};

export const generateAndSaveJWTTokens = async (user) => {
  const tokens: { [key: string]: any } = generateJwtTokens(user);
  user.refreshToken = tokens.refreshToken;
  await user.save();
  return tokens;
};




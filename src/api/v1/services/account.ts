import { models } from "../../../models/models";

export const create = async (data) => {
  return await models.Account.create(data);
};

export const findWhere = async (where) => {
  return await models.Account.findOne({ where });
};
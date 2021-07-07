import { models } from "../../models/models";

export const find = async (id) => {
  return await models.Device.findOne({ where: { id }});
};

export const findWhere = async (where) => {
  return await models.Device.findOne({ where });
};

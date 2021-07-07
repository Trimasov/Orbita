import { models } from "../../models/models";

export const create = async (data) => {
  try {
    return await models.DeviceData.create(data);
  } catch(e) {
    throw e;
  }
};

export const getWhere = async (where) => {
  return await models.DeviceData.findAll({ where });
};

export const find = async (id) => {
  return await models.DeviceData.findOne({ where: { id }});
};

import { models } from "../../../models/models";
import ApiError from "../helpers/apiError";

export const getWhere = async (where) => {
  return await models.Geozone.findAll({ where });
};

export const create = async (data) => {
  try {
    return await models.Geozone.create(data);
  } catch(e) {
    throw e;
  }
};

export const destroy = async (id: number) => {
  try {
    return await models.Geozone.destroy({ where: { id } });
  } catch(e) {
    throw new ApiError(404, e);
  }
};

export const find = async (id) => {
  return await models.Geozone.findOne({ where: { id }});
};

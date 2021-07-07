import { models } from "../../models/models";

export const getWhere = async (where) => {
  return await models.Geozone.findAll({ where });
};

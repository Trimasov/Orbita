import { models } from "../../../models/models";

export const findAll = async () => {
  return await models.EventType.findAll();
};
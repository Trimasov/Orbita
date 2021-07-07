import * as eventTypeService from "../services/eventType";
import {
  successResponse,
} from "../helpers/apiResponse";

/**
 * GET /eventTypes
 * Get Event Type list
 */
const getAll = async (req: Request, res: Response) => {
  const eventTypes = await eventTypeService.findAll();
  return successResponse(res, { eventTypes });
};

export default {
  getAll
};
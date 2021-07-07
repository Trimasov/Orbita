import moment from "moment";
import { Op } from "sequelize";
import * as deviceDataService from "../services/deviceData";
import { successResponse } from "../helpers/apiResponse";

/**
 * GET /devices/:id/deviceData
 * Get device data of device
 */
const getAllByDevice = async (req: Request, res: Response) => {
  const deviceData = await deviceDataService.getWhere({
    deviceId: parseInt(req["params"].id),
    createdAt: {
      [Op.gte]: moment.unix(req["query"]["from_time"]).toDate(),
      [Op.lte]: moment.unix(req["query"]["to_time"]).toDate()
    }
  });
  return successResponse(res, { deviceData });
};

export default {
  getAllByDevice
};

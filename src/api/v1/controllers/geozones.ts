import * as geozoneService from "../services/geozone";
import {
  successResponse,
} from "../helpers/apiResponse";

/**
 * GET /geozones
 * Get geozones list
 */
const getAll = async (req: Request, res: Response) => {
  const geozones = await geozoneService.getWhere({ accountId: req["user"].account.id });
  return successResponse(res, { geozones });
};

/**
 * POST /geozones
 * Create a new geozone
 */
const create = async (req: Request, res: Response) => {
  const params = req.body["geozone"];
  params["accountId"] = req["user"].account.id;
  const geozone = await geozoneService.create(params);
  return successResponse(res, { geozone });
};

/**
 * DELETE /geozones/:id
 * Destroy a geozone
 */
const destroy = async (req: Request, res: Response) => {
  const id = parseInt(req["params"].id);
  await geozoneService.destroy(id);
  return successResponse(res, { geozone: { id } });
};

export default {
  getAll,
  create,
  destroy
};

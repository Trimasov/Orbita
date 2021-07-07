import * as deviceService from "../services/device";
import {
  successResponse,
  validationResponse,
  notFoundResponse
} from "../helpers/apiResponse";
import { sequelizeValidationErrorFormat } from "../helpers/validation";

/**
 * GET /
 * Get devices list
 */
const getAll = async (req: Request, res: Response) => {
  const devices = await deviceService.getWhere({ accountId: req["user"].account.id });
  return successResponse(res, { devices });
};

/**
 * GET /monitoring
 * Get devices list with last data
 */
const monitoring = async (req: Request, res: Response) => {
  const devices = await deviceService.monitoring(req["user"].account.id);
  return successResponse(res, { devices });
};

/**
 * POST /devices
 * Create device
 */
const create = async (req: Request, res: Response) => {
  const params = req.body["device"];
  params["accountId"] = req["user"].account.id;
  try {
    const device = await deviceService.create(params);
    return successResponse(res, { device });
  } catch(e) {
    console.log(e.errors);
    return validationResponse(res, sequelizeValidationErrorFormat(e.errors));
  }
};

/**
 * PATCH /devices/:id
 * Update device
 */
const update = async (req: Request, res: Response) => {
  const params = req.body["device"];
  return updateDevice(req, res, params);
};

/**
 * PATCH /devices/:id/activate
 * Activate device
 */
const activate = async (req: Request, res: Response) => {
  return updateDevice(req, res, { active: true });
};

/**
 * DELETE /devices/:id
 * Destroy a device
 */
const destroy = async (req: Request, res: Response) => {
  const id = parseInt(req["params"].id);
  await deviceService.destroy(id);
  return successResponse(res, { device: { id } });
};

async function updateDevice(req: Request, res: Response, params) {
  const id = req["params"].id;
  params["accountId"] = req["user"].account.id;
  let device = await deviceService.find(id);

  if (!device) {
    return notFoundResponse(res);
  }

  try {
    device = await deviceService.update(device, params);
    return successResponse(res, { device });
  } catch(e) {
    console.log(e);
    return validationResponse(res, sequelizeValidationErrorFormat(e.errors));
  }
}

export default {
  getAll,
  monitoring,
  create,
  update,
  activate,
  destroy
};
